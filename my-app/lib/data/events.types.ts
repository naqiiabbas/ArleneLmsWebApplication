// UI-facing types for the admin Calendar module.
export type EventType = "Session" | "Meeting" | "Deadline" | "Holiday"

/**
 * Who sees an event in their own calendar. Stored on events.visibility
 * (public / role_based / private) + event_participants.invited_role.
 */
export type EventAudience = "Everyone" | "Mentors" | "Students" | "Admins"

export type UIEvent = {
  id: string
  title: string
  date: string // YYYY-MM-DD
  time: string
  type: EventType
  participants: string[]
  description: string
  audience: EventAudience
}

export type EventInput = {
  title: string
  date: string
  time: string
  type: EventType
  participants: string[]
  description: string
  audience: EventAudience
}

/** An admin-created event as shown read-only in a mentor's / student's calendar. */
export type VisibleEvent = {
  id: string
  title: string
  date: string // YYYY-MM-DD
  time: string // free-text label, e.g. "6:00 PM"
  type: EventType
  description: string
}
