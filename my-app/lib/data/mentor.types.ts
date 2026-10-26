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

export interface MentorStudentOption {
  id: string
  name: string
}

export interface MentorNote {
  id: string
  title: string
  category: string
  studentId: string
  student: string
  date: string
  author: string
  content: string
  status: string
}

export interface MentorNoteInput {
  studentId: string
  category: string
  title: string
  content: string
}

export interface MentorClassOption {
  id: string
  name: string
}

export type SessionStatus = "scheduled" | "in_progress" | "completed" | "cancelled"

export interface MentorSession {
  id: string
  title: string
  classId: string
  className: string
  date: string // yyyy-mm-dd, in the class's timezone
  time: string // start, e.g. "10:00 AM" (class timezone)
  endTime: string // e.g. "11:00 AM"
  startHm: string // "HH:MM" 24h — prefills the edit form
  endHm: string
  startIso: string // true UTC instant, for ordering
  location: string
  status: SessionStatus
  hasAttendance: boolean // attendance recorded → can be cancelled, not deleted
}

export interface MentorSessionInput {
  classId: string
  title: string
  date: string // yyyy-mm-dd (from <input type=date>)
  startTime: string // "HH:MM" 24h, class's local time
  endTime: string // "HH:MM" 24h, class's local time
  location: string
}

export interface MentorDocument {
  id: string
  name: string
  category: string
  student: string
  uploadDate: string
  size: string
  numericSize: number // MB (for the storage bar)
  type: string
  status: string // "approved" | "pending" | "rejected"
}

export type MentorResourceStatus = "Approved" | "Pending" | "Rejected"

export interface MentorResource {
  id: string
  title: string
  description: string
  category: string
  type: string
  status: MentorResourceStatus
  isFeatured: boolean
  rating: number
  submittedDate: string
  link?: string
  fileName?: string
}

export interface MentorResourceInput {
  title: string
  description: string
  category: string
  type: string
  link: string
  featured: boolean
}
