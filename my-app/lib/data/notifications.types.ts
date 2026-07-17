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
