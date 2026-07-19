"use server"

import { randomUUID } from "node:crypto"
import { createAdminClient } from "@/lib/supabase/admin"
import { assertMentor } from "@/lib/data/guards"
import type {
  MentorAttendanceRow,
  MentorAttendanceStatus,
  MentorClassOption,
  MentorDashboard,
  MentorDocument,
  MentorNote,
  MentorNoteInput,
  MentorResource,
  MentorResourceInput,
  MentorResourceStatus,
  MentorSession,
  MentorSessionInput,
  MentorStudent,
  MentorStudentDetail,
  MentorStudentOption,
  RiskLevel,
} from "@/lib/data/mentor.types"
import type { BlogStatus, UIBlogPost } from "@/lib/data/blog.types"

const DOCUMENTS_BUCKET = "documents"
const BLOG_BUCKET = "blog"

function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "post"
  )
}

function resolveBlogImageUrl(
  admin: ReturnType<typeof createAdminClient>,
  value: string | null,
): string | null {
  if (!value) return null
  if (value.startsWith("http") || value.startsWith("/")) return value
  return admin.storage.from(BLOG_BUCKET).getPublicUrl(value).data.publicUrl
}

function isBlogStoragePath(value: string | null): value is string {
  return !!value && !value.startsWith("http") && !value.startsWith("/")
}

function formatSize(bytes: number | null): string {
  if (bytes == null) return "—"
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(kb < 10 ? 1 : 0)} KB`
  const mb = kb / 1024
  if (mb < 1024) return `${mb.toFixed(1)} MB`
  return `${(mb / 1024).toFixed(1)} GB`
}

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

/** Options for the "Student" dropdown: the mentor's active-assignment students. */
async function assignedStudentOptions(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
): Promise<{ ids: string[]; options: MentorStudentOption[] }> {
  const { data: assigns } = await admin
    .from("mentor_student_assignments")
    .select("student:students ( id, profile:profiles ( full_name ) )")
    .eq("mentor_id", userId)
    .eq("status", "active")

  const rows = (assigns ?? []) as unknown as {
    student: { id: string; profile: { full_name: string | null } | null } | null
  }[]
  const options: MentorStudentOption[] = []
  for (const r of rows) {
    if (r.student?.id) options.push({ id: r.student.id, name: r.student.profile?.full_name ?? "—" })
  }
  options.sort((a, b) => a.name.localeCompare(b.name))
  return { ids: options.map((o) => o.id), options }
}

/** Just the assigned-student options (id + name) — for dropdowns (e.g. new-chat). */
export async function getAssignedStudentOptions(): Promise<MentorStudentOption[]> {
  const { userId } = await assertMentor()
  const admin = createAdminClient()
  const { options } = await assignedStudentOptions(admin, userId)
  return options
}

/** The mentor's authored notes + assigned-student options (Notes & Reports panel). */
export async function getMentorNotes(): Promise<{
  notes: MentorNote[]
  students: MentorStudentOption[]
}> {
  const { userId } = await assertMentor()
  const admin = createAdminClient()

  const [{ options }, { data: prof }, { data, error }] = await Promise.all([
    assignedStudentOptions(admin, userId),
    admin.from("profiles").select("full_name").eq("id", userId).single(),
    admin
      .from("notes")
      .select(
        "id, title, content, category, status, created_at, student_id, student:students ( profile:profiles ( full_name ) )",
      )
      .eq("author_id", userId)
      .order("created_at", { ascending: false }),
  ])
  if (error) throw new Error(error.message)

  const authorName = prof?.full_name ?? "You"
  const notes = ((data ?? []) as unknown as {
    id: string
    title: string
    content: string | null
    category: string | null
    status: string
    created_at: string | null
    student_id: string | null
    student: { profile: { full_name: string | null } | null } | null
  }[]).map((n) => ({
    id: n.id,
    title: n.title,
    category: n.category ?? "Academic",
    studentId: n.student_id ?? "",
    student: n.student?.profile?.full_name ?? "—",
    date: n.created_at ? n.created_at.slice(0, 10) : "",
    author: authorName,
    content: n.content ?? "",
    status: n.status,
  }))

  return { notes, students: options }
}

/** Create a progress note for an assigned student (enters admin moderation as 'pending'). */
export async function createMentorNote(
  input: MentorNoteInput,
): Promise<{ error?: string; id?: string }> {
  let userId: string
  try {
    ;({ userId } = await assertMentor())
  } catch (e) {
    return { error: (e as Error).message }
  }
  if (!input.studentId) return { error: "Please select a student." }
  if (!input.title.trim()) return { error: "Please enter a title." }
  const admin = createAdminClient()

  // Ensure the student is actively assigned to this mentor.
  const { data: link } = await admin
    .from("mentor_student_assignments")
    .select("student_id")
    .eq("mentor_id", userId)
    .eq("student_id", input.studentId)
    .eq("status", "active")
    .maybeSingle()
  if (!link) return { error: "This student is not assigned to you." }

  const { data, error } = await admin
    .from("notes")
    .insert({
      student_id: input.studentId,
      author_id: userId,
      author_role: "mentor",
      title: input.title.trim(),
      content: input.content.trim() || null,
      category: input.category,
      status: "pending",
    })
    .select("id")
    .single()
  if (error) return { error: error.message }
  return { id: data.id }
}

/** Edit one of the mentor's own notes (re-enters moderation as 'pending'). */
export async function updateMentorNote(
  id: string,
  input: MentorNoteInput,
): Promise<{ error?: string }> {
  let userId: string
  try {
    ;({ userId } = await assertMentor())
  } catch (e) {
    return { error: (e as Error).message }
  }
  if (!input.studentId) return { error: "Please select a student." }
  if (!input.title.trim()) return { error: "Please enter a title." }
  const admin = createAdminClient()

  // Ownership: the note must be authored by this mentor.
  const { data: note } = await admin
    .from("notes")
    .select("author_id")
    .eq("id", id)
    .maybeSingle()
  if (!note || note.author_id !== userId) return { error: "You can only edit your own notes." }

  // If reassigning the student, ensure the new student is assigned to this mentor.
  const { data: link } = await admin
    .from("mentor_student_assignments")
    .select("student_id")
    .eq("mentor_id", userId)
    .eq("student_id", input.studentId)
    .eq("status", "active")
    .maybeSingle()
  if (!link) return { error: "This student is not assigned to you." }

  const { error } = await admin
    .from("notes")
    .update({
      student_id: input.studentId,
      title: input.title.trim(),
      content: input.content.trim() || null,
      category: input.category,
      status: "pending",
    })
    .eq("id", id)
  if (error) return { error: error.message }
  return {}
}

/** The mentor's scheduled sessions + class options for scheduling (Calendar). */
export async function getMentorCalendar(): Promise<{
  sessions: MentorSession[]
  classes: MentorClassOption[]
}> {
  const { userId } = await assertMentor()
  const admin = createAdminClient()

  const [{ data: sess, error }, { data: allClasses }] = await Promise.all([
    admin
      .from("class_sessions")
      .select("id, title, session_date, start_at, location, status, class:classes ( name )")
      .eq("mentor_id", userId)
      .order("start_at", { ascending: true }),
    admin.from("classes").select("id, name").order("name", { ascending: true }),
  ])
  if (error) throw new Error(error.message)

  const sessions = ((sess ?? []) as unknown as {
    id: string
    title: string | null
    session_date: string | null
    start_at: string | null
    location: string | null
    status: string
    class: { name: string | null } | null
  }[]).map((s) => ({
    id: s.id,
    title: s.title || s.class?.name || "Session",
    className: s.class?.name ?? "",
    date: s.session_date ?? (s.start_at ? s.start_at.slice(0, 10) : ""),
    time: clock(s.start_at),
    location: s.location ?? "",
    status: s.status ? s.status.charAt(0).toUpperCase() + s.status.slice(1) : "Scheduled",
  }))

  const classes = ((allClasses ?? []) as { id: string; name: string }[]).map((c) => ({
    id: c.id,
    name: c.name,
  }))
  return { sessions, classes }
}

/** Schedule a new class session run by the current mentor. */
export async function createMentorSession(
  input: MentorSessionInput,
): Promise<{ error?: string; id?: string }> {
  let userId: string
  try {
    ;({ userId } = await assertMentor())
  } catch (e) {
    return { error: (e as Error).message }
  }
  if (!input.classId) return { error: "Please select a class." }
  if (!input.title.trim()) return { error: "Please enter a session title." }

  // Build start/end timestamps from the date + time fields.
  const day = input.date.trim()
  const parsedDay = new Date(day)
  if (isNaN(parsedDay.getTime())) return { error: "Please enter a valid date." }
  const ymdStr = ymd(parsedDay)
  const time = /^\d{2}:\d{2}$/.test(input.time.trim()) ? input.time.trim() : "09:00"
  const start = new Date(`${ymdStr}T${time}:00`)
  const end = new Date(start.getTime() + 60 * 60 * 1000)

  const admin = createAdminClient()
  const { data, error } = await admin
    .from("class_sessions")
    .insert({
      class_id: input.classId,
      mentor_id: userId,
      title: input.title.trim(),
      session_date: ymdStr,
      start_at: start.toISOString(),
      end_at: end.toISOString(),
      location: input.location.trim() || null,
      status: "scheduled",
    })
    .select("id")
    .single()
  if (error) return { error: error.message }
  return { id: data.id }
}

/** The mentor's own uploaded documents (Documents panel). */
export async function getMentorDocuments(): Promise<MentorDocument[]> {
  const { userId } = await assertMentor()
  const admin = createAdminClient()

  const { data, error } = await admin
    .from("documents")
    .select("id, name, category, file_type, size_bytes, status, created_at")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false })
  if (error) throw new Error(error.message)

  return ((data ?? []) as unknown as {
    id: string
    name: string
    category: string | null
    file_type: string | null
    size_bytes: number | null
    status: string
    created_at: string | null
  }[]).map((d) => ({
    id: d.id,
    name: d.name,
    category: d.category ?? "General",
    student: "—",
    uploadDate: d.created_at ? d.created_at.slice(0, 10) : "",
    size: formatSize(d.size_bytes),
    numericSize: d.size_bytes ? d.size_bytes / (1024 * 1024) : 0,
    type: (d.name.includes(".") ? d.name.split(".").pop()! : d.file_type ?? "file").toLowerCase(),
    status: d.status === "approved" ? "approved" : d.status === "rejected" ? "rejected" : "pending",
  }))
}

/** Upload a real file as the mentor (status pending → admin approval). */
export async function uploadMentorDocument(
  formData: FormData,
): Promise<{ id?: string; error?: string }> {
  let userId: string
  try {
    ;({ userId } = await assertMentor())
  } catch (e) {
    return { error: (e as Error).message }
  }
  const admin = createAdminClient()

  const file = formData.get("file")
  const name = (formData.get("name") as string | null)?.trim() || ""
  const category = (formData.get("category") as string | null)?.trim() || ""
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please choose a file to upload." }
  }

  const ext = file.name.includes(".") ? file.name.split(".").pop()! : ""
  const path = `${userId}/${randomUUID()}${ext ? "." + ext : ""}`
  const bytes = new Uint8Array(await file.arrayBuffer())

  const { error: upErr } = await admin.storage
    .from(DOCUMENTS_BUCKET)
    .upload(path, bytes, { contentType: file.type || "application/octet-stream", upsert: false })
  if (upErr) return { error: upErr.message }

  const { data, error } = await admin
    .from("documents")
    .insert({
      name: name || file.name,
      category: category || null,
      file_type: ext ? ext.toUpperCase() : "File",
      size_bytes: file.size,
      status: "pending",
      owner_id: userId,
      source_role: "mentor",
      file_url: path,
    })
    .select("id")
    .single()
  if (error) {
    await admin.storage.from(DOCUMENTS_BUCKET).remove([path])
    return { error: error.message }
  }
  return { id: data.id }
}

/** Short-lived signed URL for one of the mentor's own documents. */
export async function getMentorDocumentUrl(
  id: string,
): Promise<{ url?: string; name?: string; error?: string }> {
  let userId: string
  try {
    ;({ userId } = await assertMentor())
  } catch (e) {
    return { error: (e as Error).message }
  }
  const admin = createAdminClient()

  const { data: doc } = await admin
    .from("documents")
    .select("file_url, name")
    .eq("id", id)
    .eq("owner_id", userId)
    .maybeSingle()
  if (!doc) return { error: "Document not found." }
  if (!doc.file_url) return { error: "No file is attached to this document." }

  const { data, error } = await admin.storage.from(DOCUMENTS_BUCKET).createSignedUrl(doc.file_url, 120)
  if (error) return { error: error.message }
  return { url: data.signedUrl, name: doc.name }
}

/** Delete one of the mentor's own documents (and its stored file). */
export async function deleteMentorDocument(id: string): Promise<{ error?: string }> {
  let userId: string
  try {
    ;({ userId } = await assertMentor())
  } catch (e) {
    return { error: (e as Error).message }
  }
  const admin = createAdminClient()

  const { data: doc } = await admin
    .from("documents")
    .select("file_url")
    .eq("id", id)
    .eq("owner_id", userId)
    .maybeSingle()
  if (!doc) return { error: "Document not found." }
  if (doc.file_url) await admin.storage.from(DOCUMENTS_BUCKET).remove([doc.file_url])

  const { error } = await admin.from("documents").delete().eq("id", id).eq("owner_id", userId)
  if (error) return { error: error.message }
  return {}
}

function dbToUiResourceStatus(s: string): MentorResourceStatus {
  if (s === "approved") return "Approved"
  if (s === "rejected") return "Rejected"
  return "Pending" // pending / flagged
}

/** The mentor's own submitted learning resources (Resources panel). */
export async function getMentorResources(): Promise<MentorResource[]> {
  const { userId } = await assertMentor()
  const admin = createAdminClient()

  const { data, error } = await admin
    .from("resources")
    .select("id, title, description, category, tags, link_url, featured, rating, status, created_at")
    .eq("uploaded_by", userId)
    .order("created_at", { ascending: false })
  if (error) throw new Error(error.message)

  return ((data ?? []) as unknown as {
    id: string
    title: string
    description: string | null
    category: string | null
    tags: string[] | null
    link_url: string | null
    featured: boolean
    rating: number | string | null
    status: string
    created_at: string | null
  }[]).map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description ?? "",
    category: r.category ?? "",
    type: (r.tags && r.tags[0]) || "",
    status: dbToUiResourceStatus(r.status),
    isFeatured: r.featured,
    rating: r.rating != null ? Number(r.rating) : 0,
    submittedDate: r.created_at ? r.created_at.slice(0, 10) : "",
    link: r.link_url ?? undefined,
  }))
}

/** Submit a new (link-based) learning resource for admin approval. */
export async function createMentorResource(
  input: MentorResourceInput,
): Promise<{ error?: string; id?: string }> {
  let userId: string
  try {
    ;({ userId } = await assertMentor())
  } catch (e) {
    return { error: (e as Error).message }
  }
  if (!input.title.trim()) return { error: "Please enter a resource title." }
  if (!input.link.trim()) return { error: "Please provide a resource link." }
  const admin = createAdminClient()

  const { data, error } = await admin
    .from("resources")
    .insert({
      title: input.title.trim(),
      description: input.description.trim() || null,
      category: input.category.trim() || null,
      tags: input.type.trim() ? [input.type.trim()] : [],
      kind: "link",
      link_url: input.link.trim(),
      featured: input.featured,
      uploaded_by: userId,
      uploader_role: "mentor",
      status: "pending",
    })
    .select("id")
    .single()
  if (error) return { error: error.message }
  return { id: data.id }
}

/** Edit one of the mentor's own resources (re-enters review as 'pending'). */
export async function updateMentorResource(
  id: string,
  input: MentorResourceInput,
): Promise<{ error?: string }> {
  let userId: string
  try {
    ;({ userId } = await assertMentor())
  } catch (e) {
    return { error: (e as Error).message }
  }
  if (!input.title.trim()) return { error: "Please enter a resource title." }
  const admin = createAdminClient()

  const { data: existing } = await admin
    .from("resources")
    .select("uploaded_by")
    .eq("id", id)
    .maybeSingle()
  if (!existing || existing.uploaded_by !== userId) {
    return { error: "You can only edit your own resources." }
  }

  const { error } = await admin
    .from("resources")
    .update({
      title: input.title.trim(),
      description: input.description.trim() || null,
      category: input.category.trim() || null,
      tags: input.type.trim() ? [input.type.trim()] : [],
      link_url: input.link.trim() || null,
      status: "pending",
    })
    .eq("id", id)
    .eq("uploaded_by", userId)
  if (error) return { error: error.message }
  return {}
}

/** Delete one of the mentor's own resources. */
export async function deleteMentorResource(id: string): Promise<{ error?: string }> {
  let userId: string
  try {
    ;({ userId } = await assertMentor())
  } catch (e) {
    return { error: (e as Error).message }
  }
  const admin = createAdminClient()
  const { error } = await admin.from("resources").delete().eq("id", id).eq("uploaded_by", userId)
  if (error) return { error: error.message }
  return {}
}

/** The mentor's own blog posts (Blog panel), newest first. */
export async function getMentorBlogPosts(): Promise<UIBlogPost[]> {
  const { userId } = await assertMentor()
  const admin = createAdminClient()

  const { data, error } = await admin
    .from("blog_posts")
    .select("id, title, content, excerpt, category, tags, image_url, status, published_at, created_at, author:profiles ( full_name )")
    .eq("author_id", userId)
    .order("created_at", { ascending: false })
  if (error) throw new Error(error.message)

  return ((data ?? []) as unknown as {
    id: string
    title: string
    content: string | null
    excerpt: string | null
    category: string | null
    tags: string[] | null
    image_url: string | null
    status: string
    published_at: string | null
    created_at: string | null
    author: { full_name: string | null } | null
  }[]).map((p) => ({
    id: p.id,
    title: p.title,
    content: p.content ?? "",
    excerpt: p.excerpt ?? "",
    category: p.category ?? "",
    tags: p.tags ?? [],
    image: resolveBlogImageUrl(admin, p.image_url),
    status: p.status === "published" ? "published" : "draft",
    date: new Date(p.published_at ?? p.created_at ?? Date.now()).toLocaleDateString("en-US"),
    author: p.author?.full_name ?? "",
  }))
}

/** Create/update one of the mentor's own blog posts. FormData carries fields + optional image. */
export async function saveMentorBlogPost(
  formData: FormData,
): Promise<{ id?: string; error?: string }> {
  let userId: string
  try {
    ;({ userId } = await assertMentor())
  } catch (e) {
    return { error: (e as Error).message }
  }
  const admin = createAdminClient()

  const id = (formData.get("id") as string | null) || null
  const title = ((formData.get("title") as string) || "").trim()
  if (!title) return { error: "Please enter a title." }

  const content = (formData.get("content") as string) || ""
  const excerpt = ((formData.get("excerpt") as string) || "").trim()
  const category = ((formData.get("category") as string) || "").trim()
  const status = ((formData.get("status") as BlogStatus) || "draft") as BlogStatus
  let tags: string[] = []
  try {
    tags = JSON.parse((formData.get("tags") as string) || "[]")
  } catch {
    tags = []
  }

  // Featured image: new upload, explicit removal, or unchanged.
  const file = formData.get("image")
  const removeImage = formData.get("removeImage") === "true"
  let imageUrl: string | null | undefined = undefined
  if (file instanceof File && file.size > 0) {
    const ext = file.name.includes(".") ? file.name.split(".").pop() : "png"
    const path = `${randomUUID()}.${ext}`
    const bytes = new Uint8Array(await file.arrayBuffer())
    const { error: upErr } = await admin.storage
      .from(BLOG_BUCKET)
      .upload(path, bytes, { contentType: file.type || "image/png", upsert: false })
    if (upErr) return { error: upErr.message }
    imageUrl = path
  } else if (removeImage) {
    imageUrl = null
  }

  if (id) {
    // Update existing (must be the mentor's own post).
    const { data: existing } = await admin
      .from("blog_posts")
      .select("published_at, image_url, author_id")
      .eq("id", id)
      .maybeSingle()
    if (!existing || existing.author_id !== userId) {
      return { error: "You can only edit your own posts." }
    }

    const publishedAt =
      status === "published" ? existing.published_at ?? new Date().toISOString() : existing.published_at ?? null

    const base = {
      title,
      content,
      excerpt: excerpt || null,
      category: category || null,
      tags,
      status,
      published_at: publishedAt,
    }
    const patch = imageUrl !== undefined ? { ...base, image_url: imageUrl } : base

    if (imageUrl !== undefined && isBlogStoragePath(existing.image_url ?? null) && existing.image_url !== imageUrl) {
      await admin.storage.from(BLOG_BUCKET).remove([existing.image_url!])
    }

    const { error } = await admin.from("blog_posts").update(patch).eq("id", id).eq("author_id", userId)
    if (error) return { error: error.message }
    return { id }
  }

  const { data, error } = await admin
    .from("blog_posts")
    .insert({
      title,
      slug: `${slugify(title)}-${randomUUID().slice(0, 6)}`,
      content,
      excerpt: excerpt || null,
      category: category || null,
      tags,
      image_url: imageUrl ?? null,
      status,
      author_id: userId,
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .select("id")
    .single()
  if (error) return { error: error.message }
  return { id: data.id }
}

/** Delete one of the mentor's own blog posts. */
export async function deleteMentorBlogPost(id: string): Promise<{ error?: string }> {
  let userId: string
  try {
    ;({ userId } = await assertMentor())
  } catch (e) {
    return { error: (e as Error).message }
  }
  const admin = createAdminClient()

  const { data: post } = await admin
    .from("blog_posts")
    .select("image_url, author_id")
    .eq("id", id)
    .maybeSingle()
  if (!post || post.author_id !== userId) return { error: "You can only delete your own posts." }
  if (isBlogStoragePath(post.image_url ?? null)) {
    await admin.storage.from(BLOG_BUCKET).remove([post.image_url!])
  }

  const { error } = await admin.from("blog_posts").delete().eq("id", id).eq("author_id", userId)
  if (error) return { error: error.message }
  return {}
}
