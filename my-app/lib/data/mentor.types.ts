// UI-facing types for the mentor panel (Assigned Students).
export type RiskLevel = "Low" | "Medium" | "High"

export interface MentorAttendanceRecord {
  date: string
  session: string
  status: "Present" | "Absent"
  notes: string
}

export interface MentorStudentNote {
  id: string
  type: string
  date: string
  author: string
  content: string
}

export interface MentorStudent {
  id: string
  name: string
  avatar: string
  school: string
  grade: string
  riskLevel: RiskLevel
  attendance: number
  totalSessions: number
  email: string
  phone: string
  attendanceHistory: MentorAttendanceRecord[]
  notes: MentorStudentNote[]
  academicProgress: { month: string; score: number }[]
}

export interface MentorStudentDetail {
  attendanceHistory: MentorAttendanceRecord[]
  notes: MentorStudentNote[]
  academicProgress: { month: string; score: number }[]
}

export interface MentorDashboard {
  welcomeName: string
  stats: { activeStudents: number; sessionsToday: number; pendingNotes: number; alerts: number }
  sessions: { id: string; name: string; time: string; status: string }[]
  activities: { id: string; text: string; time: string; color: string }[]
  attendance: { day: string; present: number; absent: number }[]
}

export type MentorAttendanceStatus = "Present" | "Absent" | "Late" | "Pending"

export interface MentorAttendanceRow {
  id: string
  date: string
  studentId: string
  name: string
  avatar: string
  session: string
  status: MentorAttendanceStatus
  notes: string
}
