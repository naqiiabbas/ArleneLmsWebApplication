// UI-facing types for the admin Attendance Control module.
export type AttendanceStatus = "Present" | "Absent" | "Late"
export type ExcuseState = "none" | "excused" | "unexcused"

export type UIAttendanceRecord = {
  id: string
  studentId: string
  studentName: string
  className: string
  time: string
  status: AttendanceStatus
  batch: string
  date: string
  device: string
  location: string
  excuse: ExcuseState
  hasPhoto: boolean
}

export type AttendanceData = {
  records: UIAttendanceRecord[]
  stats: { present: number; absent: number; late: number; rate: number }
  weekly: { day: string; present: number; absent: number; late: number }[]
  monthly: { week: string; rate: number }[]
}
