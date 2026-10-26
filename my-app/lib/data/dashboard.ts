"use server"

// Admin home dashboard. Every number here comes from the database — this
// replaces hardcoded demo data (248 students, Dr. Sarah Johnson, …).
import { createAdminClient } from "@/lib/supabase/admin"
import { assertPermission, getMyPermissions } from "@/lib/auth/permissions"
import { checkTargetRole } from "@/lib/data/guards"
import { logActivity } from "@/lib/data/audit"
import {
  APP_TIMEZONE,
  addDaysYmd,
  formatTimeInZone,
  hmInZone,
  isValidHm,
  isValidYmd,
  mondayOfWeek,
  ymdInZone,
  zonedTimeToUtc,
} from "@/lib/time"
import type {
  AdminDashboard,
  DashboardAlert,
  DashboardSession,
  DashboardSessionInput,
  MentorPick,
} from "@/lib/data/dashboard.types"
import type { SessionStatus } from "@/lib/data/mentor.types"

const LOW_ATTENDANCE_PCT = 70
const LOW_ATTENDANCE_MIN_RECORDS = 3
const SESSION_STATUSES: SessionStatus[] = ["scheduled", "in_progress", "completed", "cancelled"]

type PersonRow = {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  status: string
}

const toPerson = (p: PersonRow) => ({
  id: p.id,
  name: p.full_name || "(no name)",
  email: p.email ?? "",
  phone: p.phone ?? "",
  status: (p.status === "active" ? "active" : "inactive") as "active" | "inactive",
})

export async function getAdminDashboard(): Promise<AdminDashboard> {
  await assertPermission("dashboard.view")
  const admin = createAdminClient()

  const today = ymdInZone()
  const monday = mondayOfWeek(today)
  const friday = addDaysYmd(monday, 4)
  const monthStart = `${today.slice(0, 7)}-01`
  const [ty, tm] = today.split("-").map(Number)
  const nextMonthStart = tm === 12 ? `${ty + 1}-01-01` : `${ty}-${String(tm + 1).padStart(2, "0")}-01`

  const [students, mentors, todaySess, pendingDocs, pendingAbs, pendingNotes, weekAtt, lowAtt, perms] =
    await Promise.all([
      admin
        .from("profiles")
        .select("id, full_name, email, phone, status")
        .eq("role", "student")
        .order("created_at", { ascending: false }),
      admin
        .from("profiles")
        .select("id, full_name, email, phone, status")
        .eq("role", "mentor")
        .order("created_at", { ascending: false }),
      admin.from("class_sessions").select("status").eq("session_date", today).neq("status", "cancelled"),
      admin.from("documents").select("id", { count: "exact", head: true }).eq("status", "pending"),
      admin.from("absence_reports").select("id", { count: "exact", head: true }).eq("status", "pending"),
      admin.from("notes").select("id", { count: "exact", head: true }).eq("status", "pending"),
      admin
        .from("attendance_records")
        .select("attendance_date, status")
        .gte("attendance_date", monday)
        .lte("attendance_date", friday),
      admin
        .from("student_attendance_summary")
        .select("student_id, attendance_pct, total")
        .lt("attendance_pct", LOW_ATTENDANCE_PCT)
        .gte("total", LOW_ATTENDANCE_MIN_RECORDS)
        .order("attendance_pct", { ascending: true })
        .limit(3),
      getMyPermissions(),
    ])
  if (students.error) throw new Error(students.error.message)
  if (mentors.error) throw new Error(mentors.error.message)

  const studentRows = (students.data ?? []) as PersonRow[]
  const mentorRows = (mentors.data ?? []) as PersonRow[]
  const recentMentorRows = mentorRows.slice(0, 5)

  // Sessions this month per listed mentor (cancelled ones don't count).
  const sessionsThisMonth = new Map<string, number>()
  if (recentMentorRows.length) {
    const { data } = await admin
      .from("class_sessions")
      .select("mentor_id")
      .in("mentor_id", recentMentorRows.map((m) => m.id))
      .gte("session_date", monthStart)
      .lt("session_date", nextMonthStart)
      .neq("status", "cancelled")
    for (const r of data ?? []) {
      if (r.mentor_id) sessionsThisMonth.set(r.mentor_id, (sessionsThisMonth.get(r.mentor_id) ?? 0) + 1)
    }
  }

  const weekRows = weekAtt.data ?? []
  const weekly = ["Mon", "Tue", "Wed", "Thu", "Fri"].map((day, i) => {
    const date = addDaysYmd(monday, i)
    const rows = weekRows.filter((r) => r.attendance_date === date)
    return {
      day,
      date,
      present: rows.filter((r) => r.status === "present").length,
      late: rows.filter((r) => r.status === "late").length,
      absent: rows.filter((r) => r.status === "absent" || r.status === "excused_absent").length,
    }
  })

  const pendingDocuments = pendingDocs.count ?? 0
  const pendingAbsences = pendingAbs.count ?? 0
  const pendingNoteCount = pendingNotes.count ?? 0

  const alerts: DashboardAlert[] = []
  if (pendingDocuments)
    alerts.push({
      id: "docs",
      kind: "documents",
      title: "Document Approval",
      desc: `${pendingDocuments} document${pendingDocuments === 1 ? "" : "s"} pending review`,
      href: "/adminpanel/documents",
    })
  if (pendingAbsences)
    alerts.push({
      id: "absences",
      kind: "absences",
      title: "Absence Reports",
      desc: `${pendingAbsences} absence report${pendingAbsences === 1 ? "" : "s"} awaiting review`,
      href: "/adminpanel/attencont",
    })
  if (pendingNoteCount)
    alerts.push({
      id: "notes",
      kind: "notes",
      title: "Notes Moderation",
      desc: `${pendingNoteCount} mentor note${pendingNoteCount === 1 ? "" : "s"} pending approval`,
      href: "/adminpanel/notesmod",
    })
  const low = lowAtt.data ?? []
  if (low.length) {
    const names = new Map(studentRows.map((s) => [s.id, s.full_name || "A student"]))
    for (const r of low) {
      if (!r.student_id) continue
      alerts.push({
        id: `low-${r.student_id}`,
        kind: "attendance",
        title: "Low Attendance",
        desc: `${names.get(r.student_id) ?? "A student"} — ${Math.round(Number(r.attendance_pct ?? 0))}% attendance`,
        href: "/adminpanel/studentmanagment",
      })
    }
  }

  const todayRows = todaySess.data ?? []
  return {
    today,
    stats: {
      totalStudents: studentRows.length,
      activeStudents: studentRows.filter((s) => s.status === "active").length,
      totalMentors: mentorRows.length,
      activeMentors: mentorRows.filter((m) => m.status === "active").length,
      todaySessions: todayRows.length,
      inProgressToday: todayRows.filter((s) => s.status === "in_progress").length,
      pendingApprovals: pendingDocuments + pendingAbsences,
      pendingDocuments,
      pendingAbsences,
    },
    recentStudents: studentRows.slice(0, 5).map(toPerson),
    recentMentors: recentMentorRows.map((m) => ({
      ...toPerson(m),
      sessionsThisMonth: sessionsThisMonth.get(m.id) ?? 0,
    })),
    weekly,
    alerts,
    canEditSessions: perms.keys.includes("attendance.manage"),
  }
}

type SessionRow = {
  id: string
  title: string | null
  status: SessionStatus
  class_id: string
  session_date: string
  start_at: string
  end_at: string
  location: string | null
  mentor_id: string | null
  mentor: { full_name: string | null; email: string | null } | null
  class: { name: string | null; timezone: string | null } | null
}

/** All sessions on one program date (the dashboard's date filter). */
export async function listSessionsOn(date: string): Promise<DashboardSession[]> {
  await assertPermission("dashboard.view")
  if (!isValidYmd(date)) throw new Error("Invalid date.")
  const admin = createAdminClient()

  const { data, error } = await admin
    .from("class_sessions")
    .select(
      "id, title, status, class_id, session_date, start_at, end_at, location, mentor_id, mentor:profiles ( full_name, email ), class:classes ( name, timezone )",
    )
    .eq("session_date", date)
    .order("start_at", { ascending: true })
  if (error) throw new Error(error.message)
  const rows = (data ?? []) as unknown as SessionRow[]

  // Students attending = active enrollments in each session's class.
  const classIds = [...new Set(rows.map((r) => r.class_id))]
  const enrolled = new Map<string, string[]>()
  if (classIds.length) {
    const { data: enr } = await admin
      .from("enrollments")
      .select("class_id, student:students ( profile:profiles ( full_name ) )")
      .in("class_id", classIds)
      .eq("status", "active")
    for (const e of (enr ?? []) as unknown as {
      class_id: string | null
      student: { profile: { full_name: string | null } | null } | null
    }[]) {
      if (!e.class_id) continue
      const list = enrolled.get(e.class_id) ?? []
      list.push(e.student?.profile?.full_name || "Student")
      enrolled.set(e.class_id, list)
    }
  }

  return rows.map((s) => {
    const tz = s.class?.timezone || APP_TIMEZONE
    const names = enrolled.get(s.class_id) ?? []
    return {
      id: s.id,
      title: s.title || s.class?.name || "Session",
      status: s.status,
      date: s.session_date,
      time: formatTimeInZone(s.start_at, tz),
      endTime: formatTimeInZone(s.end_at, tz),
      startHm: hmInZone(s.start_at, tz),
      endHm: hmInZone(s.end_at, tz),
      location: s.location ?? "",
      mentorId: s.mentor_id ?? "",
      mentorName: s.mentor?.full_name || "Unassigned",
      mentorEmail: s.mentor?.email ?? "",
      className: s.class?.name ?? "",
      studentCount: names.length,
      studentNames: names.sort((a, b) => a.localeCompare(b)),
    }
  })
}

/** Mentors for the session editor's dropdown. */
export async function listMentorPicks(): Promise<MentorPick[]> {
  await assertPermission("attendance.manage")
  const admin = createAdminClient()
  const { data, error } = await admin
    .from("profiles")
    .select("id, full_name")
    .eq("role", "mentor")
    .eq("status", "active")
    .order("full_name", { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []).map((m) => ({ id: m.id, name: m.full_name || "(unnamed mentor)" }))
}

/**
 * Admin edit of a session. Sessions are the schedule attendance is taken
 * against, so this needs attendance.manage (held by admins and managers).
 */
export async function updateDashboardSession(
  id: string,
  input: DashboardSessionInput,
): Promise<{ error?: string }> {
  let me
  try {
    me = await assertPermission("attendance.manage")
  } catch (e) {
    return { error: (e as Error).message }
  }
  const title = (input.title ?? "").trim()
  if (!title) return { error: "Please enter a session title." }
  if (title.length > 120) return { error: "Session title is too long (120 characters max)." }
  if (!isValidYmd(input.date)) return { error: "Please pick a valid date." }
  if (!isValidHm(input.startTime) || !isValidHm(input.endTime)) return { error: "Please pick a start and end time." }
  if (input.endTime <= input.startTime) return { error: "End time must be after the start time." }
  if (!SESSION_STATUSES.includes(input.status)) return { error: "Invalid status." }

  const admin = createAdminClient()
  if (input.mentorId) {
    const notMentor = await checkTargetRole(admin, input.mentorId, "mentor")
    if (notMentor) return { error: "The selected mentor no longer exists." }
  }
  const { data: cur } = await admin
    .from("class_sessions")
    .select("class:classes ( timezone )")
    .eq("id", id)
    .maybeSingle()
  if (!cur) return { error: "Session not found." }
  const tz = (cur as unknown as { class: { timezone: string | null } | null }).class?.timezone || APP_TIMEZONE

  const { error } = await admin
    .from("class_sessions")
    .update({
      title,
      mentor_id: input.mentorId || null,
      session_date: input.date,
      start_at: zonedTimeToUtc(input.date, input.startTime, tz).toISOString(),
      end_at: zonedTimeToUtc(input.date, input.endTime, tz).toISOString(),
      location: (input.location ?? "").trim() || null,
      status: input.status,
    })
    .eq("id", id)
  if (error) return { error: error.message }
  await logActivity(
    { actorId: me.userId, action: "Updated session", targetType: "session", targetId: id, description: title },
    admin,
  )
  return {}
}

/** Admin: mark a session complete (or any other status) from the dashboard. */
export async function setDashboardSessionStatus(
  id: string,
  status: SessionStatus,
): Promise<{ error?: string }> {
  let me
  try {
    me = await assertPermission("attendance.manage")
  } catch (e) {
    return { error: (e as Error).message }
  }
  if (!SESSION_STATUSES.includes(status)) return { error: "Invalid status." }
  const admin = createAdminClient()
  const { error, count } = await admin
    .from("class_sessions")
    .update({ status }, { count: "exact" })
    .eq("id", id)
  if (error) return { error: error.message }
  if (!count) return { error: "Session not found." }
  await logActivity(
    { actorId: me.userId, action: `Session ${status.replace("_", " ")}`, targetType: "session", targetId: id },
    admin,
  )
  return {}
}
