// Shared types for the admin User Management module (UI-facing shapes).
export type UIRole = "Admin" | "Mentor" | "Student" | "Manager"
export type UIStatus = "Active" | "Suspended"

export type AdminUser = {
  id: string
  name: string
  email: string
  phone: string
  role: UIRole
  status: UIStatus
  lastLogin: string
  createdAt: string
}

export type UserInput = {
  name: string
  email: string
  phone: string
  role: UIRole
  status: UIStatus
  password?: string
}
