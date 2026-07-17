"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { NotificationInput, UINotification } from "@/lib/data/notifications.types"

async function currentUserId(): Promise<string | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.id ?? null
}

function formatRelative(iso: string | null): string {
  if (!iso) return ""
  const then = new Date(iso).getTime()
  const s = Math.floor((Date.now() - then) / 1000)
  if (s < 60) return "just now"
  const m = Math.floor(s / 60)
  if (m < 60) return `${m} minute${m > 1 ? "s" : ""} ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} hour${h > 1 ? "s" : ""} ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d} day${d > 1 ? "s" : ""} ago`
  return new Date(iso).toLocaleDateString()
}

type NotifRow = {
  id: string
  type: string
  title: string
  body: string | null
  is_read: boolean
  created_at: string | null
  sender: { full_name: string | null } | null
}

/** The current user's notifications (newest first). */
export async function listMyNotifications(): Promise<UINotification[]> {
  const userId = await currentUserId()
  if (!userId) return []
  const admin = createAdminClient()

  const { data, error } = await admin
    .from("notifications")
    // notifications has two FKs to profiles (recipient_id, sender_id) → hint sender.
    .select(
      "id, type, title, body, is_read, created_at, sender:profiles!notifications_sender_id_fkey ( full_name )",
    )
    .eq("recipient_id", userId)
    .order("created_at", { ascending: false })
  if (error) throw new Error(error.message)

  return ((data ?? []) as unknown as NotifRow[]).map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    description: n.body ?? "",
    time: formatRelative(n.created_at),
    sender: n.sender?.full_name ?? null,
    unread: !n.is_read,
  }))
}

export async function markNotificationRead(id: string): Promise<{ error?: string }> {
  const userId = await currentUserId()
  if (!userId) return { error: "Not authenticated." }
  const admin = createAdminClient()
  const { error } = await admin
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id)
    .eq("recipient_id", userId)
  if (error) return { error: error.message }
  return {}
}

export async function markAllNotificationsRead(): Promise<{ error?: string }> {
  const userId = await currentUserId()
  if (!userId) return { error: "Not authenticated." }
  const admin = createAdminClient()
  const { error } = await admin
    .from("notifications")
    .update({ is_read: true })
    .eq("recipient_id", userId)
    .eq("is_read", false)
  if (error) return { error: error.message }
  return {}
}

export async function deleteNotification(id: string): Promise<{ error?: string }> {
  const userId = await currentUserId()
  if (!userId) return { error: "Not authenticated." }
  const admin = createAdminClient()
  const { error } = await admin
    .from("notifications")
    .delete()
    .eq("id", id)
    .eq("recipient_id", userId)
  if (error) return { error: error.message }
  return {}
}

/**
 * Create an in-app notification. Server-side utility for other modules to call
 * (e.g. notify admins when a document is uploaded). Defaults sender to caller.
 */
export async function createNotification(
  input: NotificationInput,
): Promise<{ id?: string; error?: string }> {
  const userId = await currentUserId()
  if (!userId) return { error: "Not authenticated." }
  const admin = createAdminClient()

  const { data, error } = await admin
    .from("notifications")
    .insert({
      recipient_id: input.recipientId,
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      sender_id: input.senderId ?? userId,
      entity_type: input.entityType ?? null,
      entity_id: input.entityId ?? null,
    })
    .select("id")
    .single()
  if (error) return { error: error.message }
  return { id: data.id }
}
