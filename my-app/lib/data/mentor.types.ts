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
