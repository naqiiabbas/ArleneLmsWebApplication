"use server"

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
  StudentNote,
  StudentTodaySession,
} from "@/lib/data/student.types"

const DEFAULT_AVATAR = "/images/avatar1.png"

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
