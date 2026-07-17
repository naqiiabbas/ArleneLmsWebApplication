// UI-facing types for the admin Student Management module.
export type StudentStatus = "Active" | "Inactive"

export type UIStudent = {
  id: string
  name: string
  email: string
  phone: string
  mentor: string
  course: string
  status: StudentStatus
  avatar: string
  enrollmentDate: string
  performance: { attendance: number; grade: string }
  quickActions: string[]
  address: string
}

export type StudentInput = {
  name: string
  email: string
  phone: string
  status: StudentStatus
  mentor: string
  course: string
  address: string
}
