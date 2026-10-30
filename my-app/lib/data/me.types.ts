// What a panel header shows about the signed-in user (see lib/data/me.ts).
export type HeaderInfo = {
  name: string
  email: string
  role: string
  avatarUrl: string
  unreadNotifications: number
  /** Messages from others newer than the user last read each conversation (sidebar badge). */
  unreadMessages: number
}

/** In-app (bell) notification switches — stored in notification_preferences.type_overrides. */
export type MyNotificationPrefs = {
  newMessages: boolean
  sessionReminders: boolean
  studentAlerts: boolean
}
