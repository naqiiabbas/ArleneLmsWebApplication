// UI-facing types for the admin Mentor Management module.
export type MentorStatus = "Active" | "Inactive"

export type UIMentor = {
  id: string
  name: string
  email: string
  expertise: string
  sessions: number
  students: number
  rating: number
  status: MentorStatus
  phone: string
  experience: string
  address: string
  joinDate: string
  avatar: string
  stats: {
    totalSessions: number
    studentsAssigned: number
    avgPerMonth: number
  }
  quickActions: string[]
}

export type MentorInput = {
  name: string
  email: string
  phone: string
  status: MentorStatus
  expertise: string
  experience: string
  address: string
}
