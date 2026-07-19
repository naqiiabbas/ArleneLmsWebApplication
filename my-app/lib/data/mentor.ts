"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { assertMentor } from "@/lib/data/guards"
import type {
  MentorAttendanceRow,
  MentorAttendanceStatus,
  MentorDashboard,
  MentorStudent,
  MentorStudentDetail,
  RiskLevel,
} from "@/lib/data/mentor.types"

const DEFAULT_AVATAR = "/images/avatar1.png"

const UI_TO_DB_STATUS: Record<
  MentorAttendanceStatus,
  "present" | "absent" | "late" | "pending"
> = {
  Present: "present",
  Absent: "absent",
  Late: "late",
  Pending: "pending",
}

function dbToUiStatus(db: string): MentorAttendanceStatus {
  if (db === "present") return "Present"
  if (db === "late") return "Late"
  if (db === "pending") return "Pending"
  return "Absent" // absent / excused_absent
}

function riskFromAttendance(pct: number): RiskLevel {
  if (pct < 70) return "High"
  if (pct < 85) return "Medium"
  return "Low"
}

function clock(iso: string | null): string {
  if (!iso) return ""
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function relative(iso: string | null): string {
  if (!iso) return ""
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return "just now"
  const m = Math.floor(s / 60)
  if (m < 60) return `${m} minute${m > 1 ? "s" : ""} ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} hour${h > 1 ? "s" : ""} ago`
  const d = Math.floor(h / 24)
  return `${d} day${d > 1 ? "s" : ""} ago`
}

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

type StudentRow = {
  id: string
  academic_year: string | null
  school: string | null
  profiles: {
    full_name: string | null
    email: string | null
    phone: string | null
    avatar_url: string | null
  } | null
}

/** The current mentor's actively-assigned students (list view). */
export async function getAssignedStudents(): Promise<MentorStudent[]> {
  const { userId } = await assertMentor()
  const admin = createAdminClient()

  const { data: assigns } = await admin
    .from("mentor_student_assignments")
    .select("student_id")
    .eq("mentor_id", userId)
    .eq("status", "active")
  const ids = (assigns ?? []).map((a) => a.student_id)
  if (ids.length === 0) return []

  const [{ data: students, error }, { data: att }] = await Promise.all([
    admin
      .from("students")
      .select("id, academic_year, school, profiles ( full_name, email, phone, avatar_url )")
      .in("id", ids),
    admin.from("student_attendance_summary").select("student_id, attendance_pct, total").in("student_id", ids),
  ])
  if (error) throw new Error(error.message)

  const attById = new Map<string, { pct: number; total: number }>()
  for (const a of att ?? []) {
    if (a.student_id)
      attById.set(a.student_id, { pct: Math.round(Number(a.attendance_pct ?? 0)), total: Number(a.total ?? 0) })
  }

  return ((students ?? []) as unknown as StudentRow[]).map((s) => {
    const a = attById.get(s.id) ?? { pct: 0, total: 0 }
    return {
      id: s.id,
      name: s.profiles?.full_name ?? "—",
      avatar: s.profiles?.avatar_url || DEFAULT_AVATAR,
      school: s.school ?? "",
      grade: s.academic_year ?? "",
      riskLevel: riskFromAttendance(a.pct),
      attendance: a.pct,
      totalSessions: a.total,
      email: s.profiles?.email ?? "",
      phone: s.profiles?.phone ?? "",
      attendanceHistory: [],
      notes: [],
      academicProgress: [],
    }
  })
}

/** Attendance history + notes for one assigned student (profile view). */
export async function getStudentDetail(studentId: string): Promise<MentorStudentDetail> {
  const { userId } = await assertMentor()
  const admin = createAdminClient()

  // Ensure this student is assigned to the current mentor.
  const { data: link } = await admin
    .from("mentor_student_assignments")
    .select("student_id")
    .eq("mentor_id", userId)
    .eq("student_id", studentId)
    .maybeSingle()
  if (!link) throw new Error("This student is not assigned to you.")

  const [{ data: att }, { data: notes }] = await Promise.all([
    admin
      .from("attendance_records")
      .select("attendance_date, status, notes, class:classes ( name ), session:class_sessions ( title )")
      .eq("student_id", studentId)
      .order("attendance_date", { ascending: false })
      .limit(50),
    admin
      .from("notes")
      .select("id, category, content, created_at, author:profiles ( full_name )")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false })
      .limit(50),
  ])

  const attendanceHistory = ((att ?? []) as unknown as {
    attendance_date: string | null
    status: string
    notes: string | null
    class: { name: string | null } | null
    session: { title: string | null } | null
  }[]).map((r) => ({
    date: r.attendance_date ?? "",
    session: r.class?.name ?? r.session?.title ?? "Session",
    status: (r.status === "present" || r.status === "late" ? "Present" : "Absent") as "Present" | "Absent",
    notes: r.notes ?? "",
  }))

  const noteList = ((notes ?? []) as unknown as {
    id: string
    category: string | null
    content: string | null
    created_at: string | null
    author: { full_name: string | null } | null
  }[]).map((n) => ({
    id: n.id,
    type: n.category ?? "Academic",
    date: n.created_at ? n.created_at.slice(0, 10) : "",
    author: n.author?.full_name ?? "",
    content: n.content ?? "",
  }))

  return { attendanceHistory, notes: noteList, academicProgress: [] }
}

/** Aggregated mentor dashboard (stats, today's sessions, activity, weekly attendance). */
export async function getMentorDashboard(): Promise<MentorDashboard> {
  const { userId } = await assertMentor()
  const admin = createAdminClient()

  const [{ data: prof }, { data: assigns }] = await Promise.all([
    admin.from("profiles").select("full_name").eq("id", userId).single(),
    admin
      .from("mentor_student_assignments")
      .select("student_id")
      .eq("mentor_id", userId)
      .eq("status", "active"),
  ])
  const ids = (assigns ?? []).map((a) => a.student_id)
  const welcomeName = (prof?.full_name ?? "").split(" ")[0] || "Mentor"
  const today = ymd(new Date())

  const [summaryRes, sessionsRes, pendingRes, attRes, notesRes] = await Promise.all([
    ids.length
      ? admin.from("student_attendance_summary").select("attendance_pct").in("student_id", ids)
      : Promise.resolve({ data: [] as { attendance_pct: number | null }[] }),
    admin
      .from("class_sessions")
      .select("id, title, start_at, status")
      .eq("mentor_id", userId)
      .eq("session_date", today)
      .order("start_at", { ascending: true }),
    admin
      .from("notes")
      .select("id", { count: "exact", head: true })
      .eq("author_id", userId)
      .eq("status", "pending"),
    ids.length
      ? admin
          .from("attendance_records")
          .select("attendance_date, marked_at, status, student:students ( profile:profiles ( full_name ) ), class:classes ( name )")
          .in("student_id", ids)
          .order("marked_at", { ascending: false })
          .limit(60)
      : Promise.resolve({ data: [] as unknown[] }),
    ids.length
      ? admin
          .from("notes")
          .select("id, created_at, student:students ( profile:profiles ( full_name ) )")
          .in("student_id", ids)
          .order("created_at", { ascending: false })
          .limit(5)
      : Promise.resolve({ data: [] as unknown[] }),
  ])

  const alerts = (summaryRes.data ?? []).filter((s) => Number(s.attendance_pct ?? 0) < 70).length

  const sessions = (sessionsRes.data ?? []).map((s) => ({
    id: s.id,
    name: s.title ?? "Session",
    time: clock(s.start_at),
    status: s.status ? s.status.charAt(0).toUpperCase() + s.status.slice(1) : "Scheduled",
  }))

  const attRows = (attRes.data ?? []) as unknown as {
    attendance_date: string | null
    marked_at: string | null
    status: string
    student: { profile: { full_name: string | null } | null } | null
    class: { name: string | null } | null
  }[]

  // Weekly attendance (Mon–Fri, present = present+late)
  const now = new Date()
  const monday = new Date(now)
  const dow = now.getDay() === 0 ? 7 : now.getDay()
  monday.setDate(now.getDate() - (dow - 1))
  const attendance = ["Mon", "Tue", "Wed", "Thu", "Fri"].map((day, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const key = ymd(d)
    const rows = attRows.filter((r) => r.attendance_date === key)
    return {
      day,
      present: rows.filter((r) => r.status === "present" || r.status === "late").length,
      absent: rows.filter((r) => r.status === "absent" || r.status === "excused_absent").length,
    }
  })

  // Recent activity: recent attendance + notes, combined
  const acts: { ts: string | null; text: string; color: string }[] = []
  for (const r of attRows.slice(0, 5)) {
    const name = r.student?.profile?.full_name ?? "A student"
    const isPresent = r.status === "present" || r.status === "late"
    acts.push({
      ts: r.marked_at,
      text: `${name} marked ${isPresent ? "present" : "absent"}${r.class?.name ? ` for ${r.class.name}` : ""}`,
      color: isPresent ? "#18bd5b" : "#ff3947",
    })
  }
  for (const n of (notesRes.data ?? []) as unknown as {
    created_at: string | null
    student: { profile: { full_name: string | null } | null } | null
  }[]) {
    acts.push({
      ts: n.created_at,
      text: `New note added for ${n.student?.profile?.full_name ?? "a student"}`,
      color: "#2f80ed",
    })
  }
  acts.sort((a, b) => new Date(b.ts ?? 0).getTime() - new Date(a.ts ?? 0).getTime())
  const activities = acts.slice(0, 5).map((a, i) => ({
    id: `act${i}`,
    text: a.text,
    time: relative(a.ts),
    color: a.color,
  }))

  return {
    welcomeName,
    stats: {
      activeStudents: ids.length,
      sessionsToday: sessions.length,
      pendingNotes: pendingRes.count ?? 0,
      alerts,
    },
    sessions,
    activities,
    attendance,
  }
}

/** The current mentor's assigned-students' attendance records (marking table). */
export async function getMentorAttendance(): Promise<MentorAttendanceRow[]> {
  const { userId } = await assertMentor()
  const admin = createAdminClient()

  const { data: assigns } = await admin
    .from("mentor_student_assignments")
    .select("student_id")
    .eq("mentor_id", userId)
    .eq("status", "active")
  const ids = (assigns ?? []).map((a) => a.student_id)
  if (ids.length === 0) return []

  const { data, error } = await admin
    .from("attendance_records")
    .select(
      "id, attendance_date, status, notes, student_id, student:students ( profile:profiles ( full_name, avatar_url ) ), session:class_sessions ( title ), class:classes ( name )",
    )
    .in("student_id", ids)
    .order("attendance_date", { ascending: false })
    .order("marked_at", { ascending: false })
    .limit(200)
  if (error) throw new Error(error.message)

  return ((data ?? []) as unknown as {
    id: string
    attendance_date: string | null
    status: string
    notes: string | null
    student_id: string
    student: { profile: { full_name: string | null; avatar_url: string | null } | null } | null
    session: { title: string | null } | null
    class: { name: string | null } | null
  }[]).map((r) => ({
    id: r.id,
    date: r.attendance_date ?? "",
    studentId: r.student_id,
    name: r.student?.profile?.full_name ?? "—",
    avatar: r.student?.profile?.avatar_url || DEFAULT_AVATAR,
    session: r.session?.title ?? r.class?.name ?? "Session",
    status: dbToUiStatus(r.status),
    notes: r.notes ?? "",
  }))
}

/** Mark/update a single attendance record (status + notes), scoped to the mentor's students. */
export async function updateMentorAttendance(
  id: string,
  status: MentorAttendanceStatus,
  notes: string,
): Promise<{ error?: string }> {
  let userId: string
  try {
    ;({ userId } = await assertMentor())
  } catch (e) {
    return { error: (e as Error).message }
  }
  const admin = createAdminClient()

  // Ensure the record belongs to a student assigned to this mentor.
  const { data: rec } = await admin
    .from("attendance_records")
    .select("student_id")
    .eq("id", id)
    .maybeSingle()
  if (!rec) return { error: "Attendance record not found." }

  const { data: link } = await admin
    .from("mentor_student_assignments")
    .select("student_id")
    .eq("mentor_id", userId)
    .eq("student_id", rec.student_id)
    .eq("status", "active")
    .maybeSingle()
  if (!link) return { error: "This student is not assigned to you." }

  const dbStatus = UI_TO_DB_STATUS[status]
  const { error } = await admin
    .from("attendance_records")
    .update({
      status: dbStatus,
      notes: notes.trim() || null,
      method: "manual",
      marked_by: userId,
      marked_at: new Date().toISOString(),
    })
    .eq("id", id)
  if (error) return { error: error.message }
  return {}
}
