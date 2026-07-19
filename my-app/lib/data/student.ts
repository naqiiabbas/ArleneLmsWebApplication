"use server"

import { randomUUID } from "node:crypto"
import { createAdminClient } from "@/lib/supabase/admin"
import { assertStudent } from "@/lib/data/guards"
import { listConversations } from "@/lib/data/messaging"
import { createNotification } from "@/lib/data/notifications"
import type {
  AbsenceReportInput,
  StudentAttendance,
  StudentAttendanceRow,
  StudentCalendarEvent,
  StudentContact,
  StudentDashboard,
  StudentDocument,
  StudentGoal,
  StudentGoalInput,
  StudentGoalStatus,
  StudentNote,
  StudentProfile,
  StudentProfileInput,
  StudentProfileMentor,
  StudentResource,
  StudentSession,
  StudentSessionType,
  StudentTodaySession,
} from "@/lib/data/student.types"

const DEFAULT_AVATAR = "/images/avatar1.png"
const DOCUMENTS_BUCKET = "documents"

function formatSize(bytes: number | null): string {
  if (bytes == null) return "—"
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(kb < 10 ? 1 : 0)} KB`
  const mb = kb / 1024
  if (mb < 1024) return `${mb.toFixed(1)} MB`
  return `${(mb / 1024).toFixed(1)} GB`
}

function clock(iso: string | null): string {
  if (!iso) return ""
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function sessionType(location: string | null): string {
  const l = (location ?? "").toLowerCase()
  if (/virtual|online|zoom|meet|teams|remote/.test(l)) return "Virtual"
  return "In-Person"
}

type SessionRow = {
  id: string
  title: string | null
  session_date: string | null
  start_at: string | null
  end_at: string | null
  location: string | null
  status: string
  class: { name: string | null } | null
  mentor: { full_name: string | null } | null
}

/** Aggregated student dashboard (stats, today's session, messages, calendar). */
export async function getStudentDashboard(): Promise<StudentDashboard> {
  const { userId } = await assertStudent()
  const admin = createAdminClient()

  const [{ data: prof }, { data: enrolls }, { data: summary }] = await Promise.all([
    admin.from("profiles").select("full_name").eq("id", userId).single(),
    admin.from("enrollments").select("class_id").eq("student_id", userId).eq("status", "active"),
    admin
      .from("student_attendance_summary")
      .select("present, late, total, attendance_pct")
      .eq("student_id", userId)
      .maybeSingle(),
  ])
  const classIds = (enrolls ?? []).map((e) => e.class_id).filter(Boolean) as string[]
  const studentName = (prof?.full_name ?? "").split(" ")[0] || "Student"

  const attended = Number(summary?.present ?? 0) + Number(summary?.late ?? 0)
  const total = Number(summary?.total ?? 0)
  const attendancePct = summary?.attendance_pct != null ? Math.round(Number(summary.attendance_pct)) : 0

  const today = ymd(new Date())
  const now = new Date()
  const weekEnd = new Date(now)
  weekEnd.setDate(now.getDate() + 7)

  const [sessionsRes, pendingAbsRes, pendingDocRes] = await Promise.all([
    classIds.length
      ? admin
          .from("class_sessions")
          .select(
            "id, title, session_date, start_at, end_at, location, status, class:classes ( name ), mentor:profiles ( full_name )",
          )
          .in("class_id", classIds)
          .order("start_at", { ascending: true })
      : Promise.resolve({ data: [] as unknown[] }),
    admin
      .from("absence_reports")
      .select("id", { count: "exact", head: true })
      .eq("student_id", userId)
      .eq("status", "pending"),
    admin
      .from("documents")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", userId)
      .eq("status", "pending"),
  ])

  const sessions = (sessionsRes.data ?? []) as unknown as SessionRow[]

  // Today's session (first one dated today).
  const todayRow = sessions.find((s) => s.session_date === today) ?? null
  const todaySession: StudentTodaySession | null = todayRow
    ? {
        title: todayRow.title || todayRow.class?.name || "Session",
        mentorName: todayRow.mentor?.full_name ?? "Your mentor",
        time:
          todayRow.start_at && todayRow.end_at
            ? `${clock(todayRow.start_at)} - ${clock(todayRow.end_at)}`
            : clock(todayRow.start_at),
        location: todayRow.location ?? "TBD",
        type: sessionType(todayRow.location),
      }
    : null

  // Upcoming this week (from now).
  const upcomingCount = sessions.filter(
    (s) => s.start_at && new Date(s.start_at) >= now && new Date(s.start_at) <= weekEnd,
  ).length

  // Calendar events (all enrolled sessions).
  const calendarEvents: StudentCalendarEvent[] = sessions
    .filter((s) => s.session_date)
    .map((s) => ({
      date: s.session_date!,
      title: s.title || s.class?.name || "Session",
      time: clock(s.start_at),
    }))

  const pendingTasks = (pendingAbsRes.count ?? 0) + (pendingDocRes.count ?? 0)

  // Recent messages (reuse the shared, user-scoped conversation list).
  let messages: StudentDashboard["messages"] = []
  try {
    const convos = await listConversations()
    messages = convos.slice(0, 3).map((c) => ({
      id: c.id,
      sender: c.name,
      text: c.lastMessage,
      time: c.time,
      avatar: c.avatar,
      hasUpdate: c.unreadCount > 0,
    }))
  } catch {
    messages = []
  }

  return {
    studentName,
    stats: {
      attendancePct,
      attendedSessions: attended,
      totalSessions: total,
      upcomingCount,
      pendingTasks,
      urgentTasks: pendingAbsRes.count ?? 0,
    },
    todaySession,
    messages,
    calendarEvents,
  }
}

function timeRange(start: string | null, end: string | null): string {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
  if (start && end) return `${fmt(start)} - ${fmt(end)}`
  if (start) return fmt(start)
  return "—"
}

/** The student's attendance stats + full history (My Attendance). */
export async function getStudentAttendance(): Promise<StudentAttendance> {
  const { userId } = await assertStudent()
  const admin = createAdminClient()

  const [{ data: summary }, { data: rows, error }] = await Promise.all([
    admin
      .from("student_attendance_summary")
      .select("present, late, absent, total, attendance_pct")
      .eq("student_id", userId)
      .maybeSingle(),
    admin
      .from("attendance_records")
      .select(
        "id, attendance_date, status, session:class_sessions ( title, start_at, end_at, mentor:profiles ( full_name ) ), class:classes ( name )",
      )
      .eq("student_id", userId)
      .order("attendance_date", { ascending: false })
      .limit(300),
  ])
  if (error) throw new Error(error.message)

  const present = Number(summary?.present ?? 0)
  const late = Number(summary?.late ?? 0)
  const absent = Number(summary?.absent ?? 0)
  const total = Number(summary?.total ?? 0)
  const ratePct = summary?.attendance_pct != null ? Math.round(Number(summary.attendance_pct)) : 0

  const history: StudentAttendanceRow[] = ((rows ?? []) as unknown as {
    id: string
    attendance_date: string | null
    status: string
    session: { title: string | null; start_at: string | null; end_at: string | null; mentor: { full_name: string | null } | null } | null
    class: { name: string | null } | null
  }[]).map((r) => {
    const d = r.attendance_date ? new Date(r.attendance_date) : null
    return {
      id: r.id,
      date: d ? d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—",
      month: d ? d.toLocaleDateString("en-US", { month: "long" }) : "",
      session: r.session?.title ?? r.class?.name ?? "Session",
      mentor: r.session?.mentor?.full_name ?? "—",
      time: timeRange(r.session?.start_at ?? null, r.session?.end_at ?? null),
      status: r.status === "present" || r.status === "late" ? "Present" : "Absent",
    }
  })

  return {
    stats: { total, attended: present + late, missed: absent, ratePct, late },
    history,
  }
}

function snippet(content: string | null, len = 160): string {
  const t = (content ?? "").replace(/\s+/g, " ").trim()
  return t.length > len ? `${t.slice(0, len)}...` : t
}

function formatRole(r: string | null): string {
  if (!r) return ""
  return r
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

function sessionKind(title: string | null, location: string | null): StudentSessionType {
  const s = `${title ?? ""} ${location ?? ""}`.toLowerCase()
  if (/deadline|due|submission/.test(s)) return "Deadline"
  if (/workshop/.test(s)) return "Workshop"
  if (/virtual|online|zoom|meet|teams|remote/.test(s)) return "Virtual"
  return "In-Person"
}

const GOAL_UI_TO_DB: Record<StudentGoalStatus, "not_started" | "in_progress" | "completed"> = {
  "Not Started": "not_started",
  "In Progress": "in_progress",
  Completed: "completed",
}
function goalDbToUi(s: string): StudentGoalStatus {
  if (s === "completed") return "Completed"
  if (s === "in_progress") return "In Progress"
  return "Not Started"
}
function fmtLongDate(d: string | null): string {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
}
function fmtMonthYear(d: string | null): string {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("en-US", { month: "long", year: "numeric" })
}

function toMentor(p: { id: string; full_name: string | null; email: string | null; phone: string | null; avatar_url: string | null } | null): StudentProfileMentor | null {
  if (!p) return null
  return {
    id: p.id,
    name: p.full_name ?? "Mentor",
    role: "Mentor",
    department: "Mentorship Program",
    email: p.email ?? "",
    phone: p.phone ?? "",
    avatar: p.avatar_url || DEFAULT_AVATAR,
    tags: [],
  }
}

/** Aggregated student profile (Overview/Progress/Activity/Mentors) + edit source. */
export async function getStudentProfile(): Promise<StudentProfile> {
  const { userId } = await assertStudent()
  const admin = createAdminClient()

  const [{ data: prof }, { data: stu }, { data: assigns }, { data: summary }, { data: docs }, { data: goals }, { data: recentAtt }] =
    await Promise.all([
      admin.from("profiles").select("full_name, email, phone, avatar_url").eq("id", userId).single(),
      admin
        .from("students")
        .select("student_code, course, academic_year, gpa, date_of_birth, address, about, enrollment_date, expected_graduation")
        .eq("id", userId)
        .maybeSingle(),
      admin
        .from("mentor_student_assignments")
        .select("mentor:profiles!mentor_student_assignments_mentor_id_fkey ( id, full_name, email, phone, avatar_url )")
        .eq("student_id", userId)
        .eq("status", "active"),
      admin.from("student_attendance_summary").select("present, late, total, attendance_pct").eq("student_id", userId).maybeSingle(),
      admin.from("documents").select("id, name, status, created_at").eq("owner_id", userId),
      admin.from("student_goals").select("status").eq("student_id", userId),
      admin
        .from("attendance_records")
        .select("attendance_date, marked_at, status, class:classes ( name )")
        .eq("student_id", userId)
        .order("marked_at", { ascending: false })
        .limit(3),
    ])

  const mentorRows = (assigns ?? []) as unknown as {
    mentor: { id: string; full_name: string | null; email: string | null; phone: string | null; avatar_url: string | null } | null
  }[]
  const mentors: StudentProfileMentor[] = []
  const seen = new Set<string>()
  for (const r of mentorRows) {
    const m = toMentor(r.mentor)
    if (m && !seen.has(m.id)) {
      seen.add(m.id)
      mentors.push(m)
    }
  }

  // Metrics
  const attended = Number(summary?.present ?? 0) + Number(summary?.late ?? 0)
  const totalSessions = Number(summary?.total ?? 0)
  const ratePct = summary?.attendance_pct != null ? Math.round(Number(summary.attendance_pct)) : 0
  const allDocs = docs ?? []
  const approvedDocs = allDocs.filter((d) => d.status === "approved").length
  const docPct = allDocs.length ? Math.round((approvedDocs / allDocs.length) * 100) : 0
  const allGoals = goals ?? []
  const doneGoals = allGoals.filter((g) => g.status === "completed").length
  const goalPct = allGoals.length ? Math.round((doneGoals / allGoals.length) * 100) : 0

  const metrics = [
    { title: "Sessions Completed", value: `${attended}/${totalSessions}`, percent: ratePct, color: "#00D094" },
    { title: "Documents Submitted", value: `${approvedDocs}/${allDocs.length}`, percent: docPct, color: "#F4A11D" },
    { title: "Goals Achieved", value: `${doneGoals}/${allGoals.length}`, percent: goalPct, color: "#F4A11D" },
  ]

  // Activity feed (recent attendance + document uploads)
  const activity: StudentProfile["activity"] = []
  for (const r of (recentAtt ?? []) as unknown as { attendance_date: string | null; marked_at: string | null; status: string; class: { name: string | null } | null }[]) {
    const present = r.status === "present" || r.status === "late"
    activity.push({
      id: `att-${r.marked_at ?? r.attendance_date}`,
      type: "session",
      title: `Marked ${present ? "present" : "absent"}${r.class?.name ? ` for ${r.class.name}` : ""}`,
      date: fmtLongDate(r.attendance_date),
    })
  }
  for (const d of [...allDocs].sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()).slice(0, 2)) {
    activity.push({ id: `doc-${d.id}`, type: "report", title: `Uploaded ${d.name}`, date: fmtLongDate(d.created_at) })
  }

  return {
    name: prof?.full_name ?? "Student",
    avatar: prof?.avatar_url || DEFAULT_AVATAR,
    email: prof?.email ?? "",
    phone: prof?.phone ?? "",
    address: stu?.address ?? "",
    dob: fmtLongDate(stu?.date_of_birth ?? null),
    about: stu?.about ?? "",
    major: stu?.course ?? "—",
    year: stu?.academic_year ?? "—",
    studentId: stu?.student_code ?? "—",
    gpa: stu?.gpa != null ? String(stu.gpa) : "—",
    enrollmentDate: fmtMonthYear(stu?.enrollment_date ?? null),
    expectedGraduation: fmtMonthYear(stu?.expected_graduation ?? null),
    mentor: mentors[0] ?? null,
    mentors,
    metrics,
    activity,
  }
}

/** Update the student's own editable profile fields. */
export async function updateStudentProfile(
  input: StudentProfileInput,
): Promise<{ error?: string }> {
  let userId: string
  try {
    ;({ userId } = await assertStudent())
  } catch (e) {
    return { error: (e as Error).message }
  }
  const admin = createAdminClient()

  const { error: pErr } = await admin
    .from("profiles")
    .update({ email: input.email.trim() || null, phone: input.phone.trim() || null })
    .eq("id", userId)
  if (pErr) return { error: pErr.message }

  const dob = new Date(input.dob.trim())
  const dobStr = input.dob.trim() && !isNaN(dob.getTime()) ? ymd(dob) : null

  const { error: sErr } = await admin
    .from("students")
    .update({ address: input.address.trim() || null, about: input.about.trim() || null, date_of_birth: dobStr })
    .eq("id", userId)
  if (sErr) return { error: sErr.message }
  return {}
}

/** The student's own goals (Goals tab). */
export async function getStudentGoals(): Promise<StudentGoal[]> {
  const { userId } = await assertStudent()
  const admin = createAdminClient()

  const { data, error } = await admin
    .from("student_goals")
    .select("id, title, status, due_date, progress")
    .eq("student_id", userId)
    .order("created_at", { ascending: false })
  if (error) throw new Error(error.message)

  return ((data ?? []) as unknown as {
    id: string
    title: string
    status: string
    due_date: string | null
    progress: number
  }[]).map((g) => ({
    id: g.id,
    title: g.title,
    status: goalDbToUi(g.status),
    dueDate: g.due_date ? new Date(g.due_date).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "—",
    progress: Number(g.progress ?? 0),
  }))
}

/** Add a new goal for the student. */
export async function addStudentGoal(
  input: StudentGoalInput,
): Promise<{ error?: string; id?: string }> {
  let userId: string
  try {
    ;({ userId } = await assertStudent())
  } catch (e) {
    return { error: (e as Error).message }
  }
  if (!input.title.trim()) return { error: "Please enter a goal title." }
  const admin = createAdminClient()

  const due = new Date(input.dueDate.trim())
  const dueStr = input.dueDate.trim() && !isNaN(due.getTime()) ? ymd(due) : null
  const status = GOAL_UI_TO_DB[input.status] ?? "not_started"

  const { data, error } = await admin
    .from("student_goals")
    .insert({
      student_id: userId,
      title: input.title.trim(),
      status,
      due_date: dueStr,
      progress: status === "completed" ? 100 : 0,
    })
    .select("id")
    .single()
  if (error) return { error: error.message }
  return { id: data.id }
}

/** The student's own uploaded documents (Documents panel). */
export async function getStudentDocuments(): Promise<StudentDocument[]> {
  const { userId } = await assertStudent()
  const admin = createAdminClient()

  const { data, error } = await admin
    .from("documents")
    .select("id, name, size_bytes, status, created_at")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false })
  if (error) throw new Error(error.message)

  return ((data ?? []) as unknown as {
    id: string
    name: string
    size_bytes: number | null
    status: string
    created_at: string | null
  }[]).map((d) => ({
    id: d.id,
    title: d.name,
    date: d.created_at ? new Date(d.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—",
    size: formatSize(d.size_bytes),
    status: d.status === "approved" ? "Approved" : "Under Review",
  }))
}

/** Upload a real file as the student (status pending → mentor/admin review). */
export async function uploadStudentDocument(
  formData: FormData,
): Promise<{ id?: string; error?: string }> {
  let userId: string
  try {
    ;({ userId } = await assertStudent())
  } catch (e) {
    return { error: (e as Error).message }
  }
  const admin = createAdminClient()

  const file = formData.get("file")
  const name = (formData.get("name") as string | null)?.trim() || ""
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
      name: name ? (ext ? `${name}.${ext}` : name) : file.name,
      file_type: ext ? ext.toUpperCase() : "File",
      size_bytes: file.size,
      status: "pending",
      owner_id: userId,
      source_role: "student",
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

/** Short-lived signed URL for one of the student's own documents. */
export async function getStudentDocumentUrl(
  id: string,
): Promise<{ url?: string; name?: string; error?: string }> {
  let userId: string
  try {
    ;({ userId } = await assertStudent())
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

/** The student's enrolled-class sessions (Calendar). */
export async function getStudentCalendar(): Promise<StudentSession[]> {
  const { userId } = await assertStudent()
  const admin = createAdminClient()

  const { data: enrolls } = await admin
    .from("enrollments")
    .select("class_id")
    .eq("student_id", userId)
    .eq("status", "active")
  const classIds = (enrolls ?? []).map((e) => e.class_id).filter(Boolean) as string[]
  if (classIds.length === 0) return []

  const { data, error } = await admin
    .from("class_sessions")
    .select("id, title, session_date, start_at, end_at, location, class:classes ( name ), mentor:profiles ( full_name )")
    .in("class_id", classIds)
    .order("start_at", { ascending: true })
  if (error) throw new Error(error.message)

  return ((data ?? []) as unknown as {
    id: string
    title: string | null
    session_date: string | null
    start_at: string | null
    end_at: string | null
    location: string | null
    class: { name: string | null } | null
    mentor: { full_name: string | null } | null
  }[]).map((s) => ({
    id: s.id,
    title: s.title || s.class?.name || "Session",
    mentor: s.mentor?.full_name ?? "Your mentor",
    time: s.start_at ? new Date(s.start_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "",
    endTime: s.end_at ? new Date(s.end_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "",
    location: s.location ?? "TBD",
    type: sessionKind(s.title, s.location),
    date: s.session_date ?? (s.start_at ? s.start_at.slice(0, 10) : ""),
    description: "",
    agenda: [],
  }))
}

/** Approved learning resources — the student's read-only resource library. */
export async function getStudentResources(): Promise<StudentResource[]> {
  await assertStudent()
  const admin = createAdminClient()

  const { data, error } = await admin
    .from("resources")
    .select("id, title, description, category, tags, kind, link_url, file_url, rating, featured")
    .eq("status", "approved")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })
  if (error) throw new Error(error.message)

  return ((data ?? []) as unknown as {
    id: string
    title: string
    description: string | null
    category: string | null
    tags: string[] | null
    kind: string
    link_url: string | null
    file_url: string | null
    rating: number | string | null
    featured: boolean
  }[]).map((r) => ({
    id: r.id,
    category: r.category ?? "General",
    type: (r.tags && r.tags[0]) || (r.kind === "link" ? "Link" : "Resource"),
    tag: r.category ?? "General",
    title: r.title,
    description: r.description ?? "",
    rating: r.rating != null ? Number(r.rating) : 0,
    isFeatured: r.featured,
    link: r.link_url ?? (r.file_url && /^https?:\/\//.test(r.file_url) ? r.file_url : ""),
  }))
}

/** Approved, shared notes written about this student (Mentor Notes). */
export async function getStudentNotes(): Promise<StudentNote[]> {
  const { userId } = await assertStudent()
  const admin = createAdminClient()

  const { data, error } = await admin
    .from("notes")
    .select(
      "id, title, content, category, created_at, author_role, author:profiles ( full_name, avatar_url ), note_attachments ( id )",
    )
    .eq("student_id", userId)
    .eq("status", "approved")
    .eq("visibility", "shared")
    .neq("author_id", userId) // exclude the student's own notes — this screen is notes *from* mentors
    .order("created_at", { ascending: false })
  if (error) throw new Error(error.message)

  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)

  return ((data ?? []) as unknown as {
    id: string
    title: string
    content: string | null
    category: string | null
    created_at: string | null
    author_role: string | null
    author: { full_name: string | null; avatar_url: string | null } | null
    note_attachments: { id: string }[] | null
  }[]).map((n) => ({
    id: n.id,
    title: n.title,
    mentor: n.author?.full_name ?? "Your mentor",
    role: formatRole(n.author_role) || "Mentor",
    date: n.created_at ? new Date(n.created_at).toLocaleDateString("en-US") : "",
    description: snippet(n.content),
    content: n.content ?? "",
    attachments: (n.note_attachments ?? []).length,
    category: n.category ?? "Note",
    avatar: n.author?.avatar_url || DEFAULT_AVATAR,
    isNew: !!n.created_at && new Date(n.created_at) >= weekAgo,
  }))
}

/** The student's assigned mentor(s) — recipients for the "New Conversation" dropdown. */
export async function getStudentContacts(): Promise<StudentContact[]> {
  const { userId } = await assertStudent()
  const admin = createAdminClient()

  const { data } = await admin
    .from("mentor_student_assignments")
    .select("mentor:profiles!mentor_student_assignments_mentor_id_fkey ( id, full_name, role )")
    .eq("student_id", userId)
    .eq("status", "active")

  const rows = (data ?? []) as unknown as {
    mentor: { id: string; full_name: string | null; role: string | null } | null
  }[]
  const seen = new Set<string>()
  const contacts: StudentContact[] = []
  for (const r of rows) {
    if (r.mentor?.id && !seen.has(r.mentor.id)) {
      seen.add(r.mentor.id)
      contacts.push({ id: r.mentor.id, name: r.mentor.full_name ?? "Mentor", role: "Mentor" })
    }
  }
  return contacts
}

/** Submit an absence report; notifies the student's active mentor(s). */
export async function submitAbsenceReport(
  input: AbsenceReportInput,
): Promise<{ error?: string; id?: string }> {
  let userId: string
  try {
    ;({ userId } = await assertStudent())
  } catch (e) {
    return { error: (e as Error).message }
  }
  const reason = input.reason.trim()
  if (!reason) return { error: "Please select a reason for your absence." }

  const parsed = new Date(input.date.trim())
  if (isNaN(parsed.getTime())) return { error: "Please enter a valid date (MM/DD/YYYY)." }
  const absenceDate = ymd(parsed)

  const admin = createAdminClient()
  const fullReason = input.notes.trim() ? `${reason} — ${input.notes.trim()}` : reason

  const { data, error } = await admin
    .from("absence_reports")
    .insert({ student_id: userId, absence_date: absenceDate, reason: fullReason, status: "pending" })
    .select("id")
    .single()
  if (error) return { error: error.message }

  // Notify the student's active mentor(s).
  const [{ data: student }, { data: assigns }] = await Promise.all([
    admin.from("profiles").select("full_name").eq("id", userId).single(),
    admin
      .from("mentor_student_assignments")
      .select("mentor_id")
      .eq("student_id", userId)
      .eq("status", "active"),
  ])
  const name = student?.full_name ?? "A student"
  for (const a of assigns ?? []) {
    if (a.mentor_id) {
      await createNotification({
        recipientId: a.mentor_id,
        type: "alert",
        title: "Absence reported",
        body: `${name} reported an absence on ${absenceDate}: ${reason}`,
        entityType: "absence_report",
        entityId: data.id,
      })
    }
  }

  return { id: data.id }
}
