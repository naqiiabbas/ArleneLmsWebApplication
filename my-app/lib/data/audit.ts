import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import type { NotificationType } from "@/lib/data/notifications.types"

type Admin = ReturnType<typeof createAdminClient>

/**
 * Shared, best-effort audit/notification helpers used by write actions across
 * the panels. All use the service-role admin client and never throw — a failed
 * log or notification must not break the main operation.
 */

export type ActivityInput = {
  actorId?: string | null
  actorRole?: string | null
  action: string
  targetType?: string
  targetId?: string
  description?: string
  status?: "success" | "failed"
  metadata?: Record<string, unknown>
}

/** Write one audit-trail row (Admin → Activity Logs). Best-effort. */
export async function logActivity(input: ActivityInput, admin?: Admin): Promise<void> {
  try {
    const db = admin ?? createAdminClient()
    await db.from("activity_logs").insert({
      actor_id: input.actorId ?? null,
      actor_role: (input.actorRole ?? null) as never,
      action: input.action,
      target_type: input.targetType ?? null,
      target_id: input.targetId ?? null,
      description: input.description ?? null,
      status: input.status ?? "success",
      metadata: (input.metadata ?? null) as never,
    })
  } catch {
    /* best-effort */
  }
}

export type NotifyInput = {
  type: NotificationType
  title: string
  body?: string
  senderId?: string | null
  entityType?: string
  entityId?: string
}

/** Send a notification to one or more recipients. Best-effort. */
export async function notifyUsers(recipientIds: string[], input: NotifyInput, admin?: Admin): Promise<void> {
  const ids = [...new Set(recipientIds.filter(Boolean))]
  if (ids.length === 0) return
  try {
    const db = admin ?? createAdminClient()
    await db.from("notifications").insert(
      ids.map((recipient_id) => ({
        recipient_id,
        type: input.type,
        title: input.title,
        body: input.body ?? null,
        sender_id: input.senderId ?? null,
        entity_type: input.entityType ?? null,
        entity_id: input.entityId ?? null,
      })),
    )
  } catch {
    /* best-effort */
  }
}

/** Notify every active admin / super_admin (e.g. a new submission needs review). */
export async function notifyAdmins(input: NotifyInput, admin?: Admin): Promise<void> {
  try {
    const db = admin ?? createAdminClient()
    const { data } = await db
      .from("profiles")
      .select("id")
      .in("role", ["super_admin", "admin"])
      .eq("status", "active")
    await notifyUsers((data ?? []).map((p) => p.id), input, db)
  } catch {
    /* best-effort */
  }
}
