import type { Database } from "@/lib/database.types"

export type NotificationType = Database["public"]["Enums"]["notification_type"]

export type UINotification = {
  id: string
  type: string
  title: string
  description: string
  time: string
  sender: string | null
  unread: boolean
  href?: string // where the notification's "View" action goes, when it is about a record
}

export type NotificationInput = {
  recipientId: string
  type: NotificationType
  title: string
  body?: string
  senderId?: string
  entityType?: string
  entityId?: string
}
