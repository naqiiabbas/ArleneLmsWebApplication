"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { assertPermission } from "@/lib/auth/permissions"
import { logActivity } from "@/lib/data/audit"
import { addDaysYmd, addMonthsYmd, formatTimeInZone, mondayOfWeek, ymdInZone } from "@/lib/time"
import type {
  AttendanceData,
  AttendanceStatus,
  ExcuseState,
  UIAttendanceRecord,
} from "@/lib/data/attendance.types"

const ATTENDANCE_BUCKET = "attendance"

function uiStatus(db: string): AttendanceStatus {
  if (db === "present") return "Present"
  if (db === "late") return "Late"
  return "Absent" // absent / excused_absent / pending
}

// Check-in time in the program's zone; the server's own (UTC in Docker) would
// show a 9:05 AM check-in as 4:05 PM.
function formatClock(iso: string | null): string {
  return iso ? formatTimeInZone(iso) : "-"
}

type Row = {
  id: string
  attendance_date: string | null
  marked_at: string | null
  status: string
  device: string | null
  location: string | null
  latitude: number | null
  longitude: number | null
  photo_url: string | null
  excuse: string
  student: { student_code: string | null; profile: { full_name: string | null } | null } | null
  class: { name: string | null; batch: string | null } | null
}

export async function getAttendanceData(): Promise<AttendanceData> {
  await assertPermission("attendance.view")
  const admin = createAdminClient()

  // student_id → students → profiles (nested); class_id → classes.
  const cols =
    "id, attendance_date, marked_at, status, device, location, latitude, longitude, photo_url, excuse, student:students ( student_code, profile:profiles ( full_name ) ), class:classes ( name, batch )"
  const today = ymdInZone()

  // Everything in the longest filter range (1 month), page by page, so the
  // date-range filter and the stats can't lose rows to a row cap...
  const monthAgo = addMonthsYmd(today, -1)
  const inMonth: Row[] = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await admin
      .from("attendance_records")
      .select(cols)
      .gte("attendance_date", monthAgo)
      .order("attendance_date", { ascending: false })
      .order("marked_at", { ascending: false })
      .order("id")
      .range(from, from + 999)
    if (error) throw new Error(error.message)
    inMonth.push(...((data ?? []) as unknown as Row[]))
    if ((data ?? []).length < 1000) break
  }
  // ...plus the newest records of any age for the "All Dates" view.
  const { data: recent, error } = await admin
    .from("attendance_records")
    .select(cols)
    .order("attendance_date", { ascending: false })
    .order("marked_at", { ascending: false })
    .limit(300)
  if (error) throw new Error(error.message)

  const byId = new Map<string, Row>()
  for (const r of [...inMonth, ...((recent ?? []) as unknown as Row[])]) byId.set(r.id, r)
  const rows = [...byId.values()].sort(
    (a, b) =>
      (b.attendance_date ?? "").localeCompare(a.attendance_date ?? "") ||
      (b.marked_at ?? "").localeCompare(a.marked_at ?? ""),
  )

  const records: UIAttendanceRecord[] = rows.map((r) => ({
    id: r.id,
    studentId: r.student?.student_code ?? "—",
    studentName: r.student?.profile?.full_name ?? "—",
    className: r.class?.name ?? "—",
    batch: r.class?.batch ?? "—",
    time: r.status === "present" || r.status === "late" ? formatClock(r.marked_at) : "-",
    status: uiStatus(r.status),
    date: r.attendance_date ?? "",
    device: r.device ?? "—",
    location: r.location ?? (r.latitude != null ? `${r.latitude}, ${r.longitude}` : "—"),
    excuse: (["excused", "unexcused"].includes(r.excuse) ? r.excuse : "none") as ExcuseState,
    hasPhoto: !!r.photo_url,
  }))

  // All windows below compare program-local "yyyy-mm-dd" strings (which sort
  // chronologically) rather than server-clock Dates.
  // ---- Stats (last 7 days) ----
  const weekAgo = addDaysYmd(today, -6)
  const inWeek = rows.filter((r) => r.attendance_date && r.attendance_date >= weekAgo && r.attendance_date <= today)
  const present = inWeek.filter((r) => r.status === "present").length
  const late = inWeek.filter((r) => r.status === "late").length
  const absent = inWeek.filter((r) => r.status === "absent" || r.status === "excused_absent").length
  const counted = present + late + absent
  const rate = counted ? Math.round(((present + late) / counted) * 1000) / 10 : 0

  // ---- Weekly breakdown (Mon–Fri of current week) ----
  const monday = mondayOfWeek(today)
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri"]
  const weekly = dayNames.map((day, i) => {
    const key = addDaysYmd(monday, i)
    const dayRows = rows.filter((r) => r.attendance_date === key)
    return {
      day,
      present: dayRows.filter((r) => r.status === "present").length,
      absent: dayRows.filter((r) => r.status === "absent" || r.status === "excused_absent").length,
      late: dayRows.filter((r) => r.status === "late").length,
    }
  })

  // ---- Monthly trend (last 4 weeks, attendance rate) ----
  const monthly = [] as { week: string; rate: number }[]
  for (let i = 3; i >= 0; i--) {
    const end = addDaysYmd(today, -i * 7)
    const start = addDaysYmd(end, -6)
    const wr = rows.filter(
      (r) => r.attendance_date && r.attendance_date >= start && r.attendance_date <= end,
    )
    const p = wr.filter((r) => r.status === "present").length
    const l = wr.filter((r) => r.status === "late").length
    const a = wr.filter((r) => r.status === "absent" || r.status === "excused_absent").length
    const c = p + l + a
    monthly.push({ week: `Week ${4 - i}`, rate: c ? Math.round(((p + l) / c) * 100) : 0 })
  }

  return { today, records, stats: { present, absent, late, rate }, weekly, monthly }
}

/** Super-Admin/Manager: set excuse status on an absence. */
export async function setAttendanceExcuse(
  id: string,
  excuse: "excused" | "unexcused",
): Promise<{ error?: string }> {
  let me
  try {
    me = await assertPermission("attendance.manage")
  } catch (e) {
    return { error: (e as Error).message }
  }
  const admin = createAdminClient()
  const { error } = await admin
    .from("attendance_records")
    .update({ excuse, excused_by: me.userId, excused_at: new Date().toISOString() })
    .eq("id", id)
  if (error) return { error: error.message }
  await logActivity(
    { actorId: me.userId, action: excuse === "excused" ? "Excused absence" : "Marked absence unexcused", targetType: "attendance", targetId: id },
    admin,
  )
  return {}
}

/** Signed URL for an attendance record's photo proof (private bucket). */
export async function getAttendancePhotoUrl(
  id: string,
): Promise<{ url?: string | null; error?: string }> {
  try {
    await assertPermission("attendance.view")
  } catch (e) {
    return { error: (e as Error).message }
  }
  const admin = createAdminClient()
  const { data: rec } = await admin
    .from("attendance_records")
    .select("photo_url")
    .eq("id", id)
    .single()
  const v = rec?.photo_url
  if (!v) return { url: null }
  if (v.startsWith("http") || v.startsWith("/")) return { url: v }
  const { data, error } = await admin.storage.from(ATTENDANCE_BUCKET).createSignedUrl(v, 120)
  if (error) return { error: error.message }
  return { url: data.signedUrl }
}
