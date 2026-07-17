// UI-facing types for the admin Calendar module.
export type EventType = "Session" | "Meeting" | "Deadline" | "Holiday"

export type UIEvent = {
  id: string
  title: string
  date: string // YYYY-MM-DD
  time: string
  type: EventType
  participants: string[]
  description: string
}

export type EventInput = {
  title: string
  date: string
  time: string
  type: EventType
  participants: string[]
  description: string
}
