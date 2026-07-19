// UI-facing types for the admin Notes Moderation module.
export type NoteStatus = "pending" | "approved" | "rejected" | "flagged"

export type UINote = {
  id: string
  title: string
  snippet: string
  author: string
  role: string
  session: string
  createdAt: string
  status: NoteStatus
  category: string
  content: string
}
