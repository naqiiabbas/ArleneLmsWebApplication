// UI-facing types for the admin home dashboard.
import type { SessionStatus } from "@/lib/data/mentor.types"

export type DashboardPerson = {
  id: string
  name: string
  email: string
  phone: string
  status: "active" | "inactive"
}

export type DashboardMentor = DashboardPerson & { sessionsThisMonth: number }

export type DashboardAlert = {
  id: string
  kind: "documents" | "absences" | "attendance" | "notes"
  title: string
  desc: string
  href: string
}

export type AdminDashboard = {
  /** The program's date ("yyyy-mm-dd", Pacific). */
  today: string
  stats: {
    totalStudents: number
    activeStudents: number
    totalMentors: number
    activeMentors: number
    todaySessions: number
    inProgressToday: number
    pendingApprovals: number
    pendingDocuments: number
    pendingAbsences: number
  }
  recentStudents: DashboardPerson[]
  recentMentors: DashboardMentor[]
  /** Mon–Fri of the current program week. */
  weekly: { day: string; date: string; present: number; absent: number; late: number }[]
  alerts: DashboardAlert[]
  /** Whether the viewer may edit sessions (attendance.manage). */
  canEditSessions: boolean
}

export type DashboardSession = {
  id: string
  title: string
  status: SessionStatus
  date: string // yyyy-mm-dd
  time: string // "9:00 AM"
  endTime: string
  startHm: string // "HH:MM" — edit form
  endHm: string
  location: string
  mentorId: string
  mentorName: string
  mentorEmail: string
  className: string
  /** Students actively enrolled in the session's class. */
  studentCount: number
  studentNames: string[]
}

export type DashboardSessionInput = {
  title: string
  mentorId: string
  date: string // yyyy-mm-dd
  startTime: string // "HH:MM", class-local
  endTime: string
  location: string
  status: SessionStatus
}

export type MentorPick = { id: string; name: string }
