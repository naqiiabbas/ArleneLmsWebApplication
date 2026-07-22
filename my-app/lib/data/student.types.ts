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

export interface StudentProfileMentor {
  id: string
  name: string
  role: string
  department: string
  email: string
  phone: string
  avatar: string
  tags: string[]
}

export interface StudentProfileMetric {
  title: string
  value: string
  percent: number
  color: string
}

export interface StudentProfileActivity {
  id: string
  type: "session" | "report" | "badge" | "goal"
  title: string
  date: string
}

export interface StudentProfile {
  name: string
  avatar: string
  email: string
  phone: string
  address: string
  dob: string
  about: string
  major: string
  year: string
  studentId: string
  gpa: string
  enrollmentDate: string
  expectedGraduation: string
  mentor: StudentProfileMentor | null
  mentors: StudentProfileMentor[]
  metrics: StudentProfileMetric[]
  activity: StudentProfileActivity[]
}

export interface StudentProfileInput {
  email: string
  phone: string
  address: string
  dob: string
  about: string
}

export type StudentGoalStatus = "Not Started" | "In Progress" | "Completed"

export interface StudentGoal {
  id: string
  title: string
  status: StudentGoalStatus
  dueDate: string
  progress: number
}

export interface StudentGoalInput {
  title: string
  status: StudentGoalStatus
  dueDate: string
}

export interface StudentContact {
  id: string
  name: string
  role: string
}

export interface StudentDocument {
  id: string
  title: string
  date: string
  size: string
  status: "Approved" | "Under Review"
}

export type StudentSessionType = "In-Person" | "Virtual" | "Deadline" | "Workshop"

export interface StudentSession {
  id: string
  title: string
  mentor: string
  time: string
  endTime: string
  location: string
  type: StudentSessionType
  date: string // yyyy-mm-dd
  description: string
  agenda: string[]
}

export interface StudentResource {
  id: string
  category: string
  type: string
  tag: string
  title: string
  description: string
  rating: number
  isFeatured: boolean
  link: string
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
  attachmentList: { id: string; name: string }[]
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
