// UI-facing types for the admin Documents module.
export type DocStatus = "Pending" | "Approved" | "Rejected"

export type UIDocument = {
  id: string
  name: string
  uploader: string
  uploaderEmail: string
  category: string
  type: string
  size: string
  date: string
  status: DocStatus
  description: string
  role: string
  source?: "mentor" | "admin"
}

export type DocumentInput = {
  name: string
  category: string
  type: string
  size: string
  description: string
}
