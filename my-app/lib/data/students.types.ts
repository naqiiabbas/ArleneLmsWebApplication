// UI-facing types for the admin Student Management module.
export type StudentStatus = "Active" | "Inactive"

/** A student's primary guardian (guardians row with is_primary). All "" when none is on file. */
export type GuardianInfo = {
  name: string
  relationship: string
  email: string
  phone: string
}

export const EMPTY_GUARDIAN: GuardianInfo = { name: "", relationship: "", email: "", phone: "" }

/** Suggestions for the grade field; other values (e.g. "Academy") can be typed. */
export const GRADE_OPTIONS = ["8th Grade", "9th Grade", "10th Grade", "11th Grade", "12th Grade"]

export type UIStudent = {
  id: string
  name: string
  email: string
  phone: string
  /** Primary mentor's display name ("" if unassigned). */
  mentor: string
  /** Primary mentor's profile id ("" if unassigned). */
  mentorId: string
  /** Class the student is actively enrolled in ("" if none) — drives kiosk check-in. */
  classId: string
  className: string
  course: string
  /** Grade level (students.academic_year), not the letter grade in performance. */
  gradeLevel: string
  school: string
  guardian: GuardianInfo
  status: StudentStatus
  avatar: string
  enrollmentDate: string
  /** attendance: % attended, or null when nothing has been recorded yet. */
  performance: { attendance: number | null; grade: string }
  quickActions: string[]
  address: string
  /** Human-facing Student ID (students.student_code), used by the Student ID login. */
  studentCode: string
  /** Permanent 4-digit iPad kiosk PIN (students.attendance_code). */
  attendanceCode: string
}

export type StudentInput = {
  name: string
  email: string
  phone: string
  status: StudentStatus
  /** Profile id of the mentor to assign; "" for none. */
  mentorId: string
  /** Class to enroll the student in; "" for none (then the kiosk can't check them in). */
  classId: string
  course: string
  address: string
  gradeLevel: string
  school: string
  guardian: GuardianInfo
}

/** A class a student can be enrolled in. */
export type ClassOption = {
  id: string
  name: string
}

/** An assignable mentor for the Add/Edit Student dropdown. */
export type MentorOption = {
  id: string
  name: string
  active: boolean
}
