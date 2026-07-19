"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { assertPermission } from "@/lib/auth/permissions"
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

function formatClock(iso: string | null): string {
  if (!iso) return "-"
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function dateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
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

  const { data, error } = await admin
    .from("attendance_records")
    // student_id → students → profiles (nested); class_id → classes.
    .select(
      "id, attendance_date, marked_at, status, device, location, latitude, longitude, photo_url, excuse, student:students ( student_code, profile:profiles ( full_name ) ), class:classes ( name, batch )",
    )
    .order("attendance_date", { ascending: false })
    .order("marked_at", { ascending: false })
    .limit(300)
  if (error) throw new Error(error.message)

  const rows = (data ?? []) as unknown as Row[]

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

  // ---- Stats (last 7 days) ----
  const today = new Date()
  const weekAgo = new Date(today)
  weekAgo.setDate(today.getDate() - 6)
  const inWeek = rows.filter((r) => r.attendance_date && new Date(r.attendance_date) >= weekAgo)
  const present = inWeek.filter((r) => r.status === "present").length
  const late = inWeek.filter((r) => r.status === "late").length
  const absent = inWeek.filter((r) => r.status === "absent" || r.status === "excused_absent").length
  const counted = present + late + absent
  const rate = counted ? Math.round(((present + late) / counted) * 1000) / 10 : 0

  // ---- Weekly breakdown (Mon–Fri of current week) ----
  const monday = new Date(today)
  const dow = today.getDay() === 0 ? 7 : today.getDay()
  monday.setDate(today.getDate() - (dow - 1))
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri"]
  const weekly = dayNames.map((day, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const key = dateStr(d)
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
    const end = new Date(today)
    end.setDate(today.getDate() - i * 7)
    const start = new Date(end)
    start.setDate(end.getDate() - 6)
    const wr = rows.filter(
      (r) => r.attendance_date && new Date(r.attendance_date) >= start && new Date(r.attendance_date) <= end,
    )
    const p = wr.filter((r) => r.status === "present").length
    const l = wr.filter((r) => r.status === "late").length
    const a = wr.filter((r) => r.status === "absent" || r.status === "excused_absent").length
    const c = p + l + a
    monthly.push({ week: `Week ${4 - i}`, rate: c ? Math.round(((p + l) / c) * 100) : 0 })
  }

  return { records, stats: { present, absent, late, rate }, weekly, monthly }
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
