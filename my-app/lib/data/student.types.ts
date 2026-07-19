// UI-facing types for the student panel.

export interface StudentDashboardStat {
  attendancePct: number
  attendedSessions: number
  totalSessions: number
  upcomingCount: number
  pendingTasks: number
  urgentTasks: number
}

export interface StudentTodaySession {
  title: string
  mentorName: string
  time: string
  location: string
  type: string
}

export interface StudentDashboardMessage {
  id: string
  sender: string
  text: string
  time: string
  avatar: string
  hasUpdate: boolean
}

export interface StudentCalendarEvent {
  date: string // yyyy-mm-dd
  title: string
  time: string
}

export interface StudentDashboard {
  studentName: string
  stats: StudentDashboardStat
  todaySession: StudentTodaySession | null
  messages: StudentDashboardMessage[]
  calendarEvents: StudentCalendarEvent[]
}

export interface AbsenceReportInput {
  date: string // MM/DD/YYYY or any parseable date
  reason: string
  notes: string
}

export interface StudentContact {
  id: string
  name: string
  role: string
}

export interface StudentNote {
  id: string
  title: string
  mentor: string
  role: string
  date: string
  description: string
  content: string
  attachments: number
  category: string
  avatar: string
  isNew: boolean
}

export interface StudentAttendanceRow {
  id: string
  date: string // "Nov 22, 2025"
  month: string // "November"
  session: string
  mentor: string
  time: string // "2:00 PM - 3:30 PM"
  status: "Present" | "Absent"
}

export interface StudentAttendance {
  stats: {
    total: number
    attended: number
    missed: number
    ratePct: number
    late: number
  }
  history: StudentAttendanceRow[]
}
