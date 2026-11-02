"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { assertPermission } from "@/lib/auth/permissions"
import { assertAdmin } from "@/lib/data/guards"
import { logActivity } from "@/lib/data/audit"
import { sweepEndedSessions } from "@/lib/data/attendance-core"
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
  student_id: string
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
  await sweepEndedSessions(admin)

  // student_id → students → profiles (nested); class_id → classes.
  const cols =
    "id, student_id, attendance_date, marked_at, status, device, location, latitude, longitude, photo_url, excuse, student:students ( student_code, profile:profiles ( full_name ) ), class:classes ( name, batch )"
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

  // Student-submitted reasons, for the admin reviewing the absence. Reports carry
  // a date rather than a session, so they match on student + date; newest wins.
  const isAbsence = (r: Row) => r.status !== "present" && r.status !== "late"
  const absenceDates = rows.filter(isAbsence).map((r) => r.attendance_date ?? "").filter(Boolean).sort()
  const reasons = new Map<string, string>()
  if (absenceDates.length) {
    const { data: reports } = await admin
      .from("absence_reports")
      .select("student_id, absence_date, reason")
      .gte("absence_date", absenceDates[0])
      .order("created_at", { ascending: false })
    for (const rep of reports ?? []) {
      const key = `${rep.student_id}|${rep.absence_date}`
      if (rep.reason && !reasons.has(key)) reasons.set(key, rep.reason)
    }
  }

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
    absenceReason: isAbsence(r) ? reasons.get(`${r.student_id}|${r.attendance_date}`) ?? null : null,
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

const EXCUSE_LABEL: Record<string, string> = { none: "Needs review", excused: "Excused", unexcused: "Unexcused" }

/** Admin only: review an absence as excused or unexcused. Every change is audited. */
export async function setAttendanceExcuse(
  id: string,
  excuse: "excused" | "unexcused",
): Promise<{ error?: string }> {
  let me
  try {
    me = await assertAdmin()
  } catch (e) {
    return { error: (e as Error).message }
  }
  if (excuse !== "excused" && excuse !== "unexcused") return { error: "Invalid absence status." }
  const admin = createAdminClient()

  const [{ data: rec }, { data: actor }] = await Promise.all([
    admin
      .from("attendance_records")
      .select("student_id, attendance_date, status, excuse, student:students ( profile:profiles ( full_name ) )")
      .eq("id", id)
      .maybeSingle(),
    admin.from("profiles").select("role").eq("id", me.userId).maybeSingle(),
  ])
  if (!rec) return { error: "Attendance record not found." }
  if (rec.status === "present" || rec.status === "late") {
    return { error: "This student attended, so there is no absence to review." }
  }
  if (rec.excuse === excuse) return {} // unchanged: nothing to log

  const now = new Date().toISOString()
  const { error } = await admin
    .from("attendance_records")
    .update({ excuse, excused_by: me.userId, excused_at: now })
    .eq("id", id)
  if (error) return { error: error.message }

  // Settle the student's own report for that day, which clears it from the
  // admin dashboard's "awaiting review" alert.
  if (rec.attendance_date) {
    await admin
      .from("absence_reports")
      .update({ status: excuse, reviewed_by: me.userId, reviewed_at: now })
      .eq("student_id", rec.student_id)
      .eq("absence_date", rec.attendance_date)
      .neq("status", "rejected")
  }

  const name = (rec as unknown as { student: { profile: { full_name: string | null } | null } | null }).student?.profile?.full_name ?? "Student"
  await logActivity(
    {
      actorId: me.userId,
      actorRole: actor?.role ?? null,
      action: excuse === "excused" ? "Excused absence" : "Marked absence unexcused",
      targetType: "attendance",
      targetId: id,
      description: `${name}, ${rec.attendance_date ?? "no date"}: ${EXCUSE_LABEL[rec.excuse] ?? rec.excuse} → ${EXCUSE_LABEL[excuse]}`,
      metadata: { studentId: rec.student_id, date: rec.attendance_date, from: rec.excuse, to: excuse },
    },
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
