"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { assertPermission } from "@/lib/auth/permissions"
import type { UIActivityLog } from "@/lib/data/activity.types"

function iconFor(action: string, status: string): string {
  const a = action.toLowerCase()
  if (status === "failed" || a.includes("failed")) return "/images/activity-icon-failed-login.svg"
  if (a.includes("log in") || a.includes("logged in") || a.includes("login") || a.includes("log out") || a.includes("logged out") || a.includes("logout"))
    return "/images/activity-icon-login.svg"
  if (a.includes("creat")) return "/images/activity-icon-create.svg"
  if (a.includes("updat") || a.includes("edit") || a.includes("approv")) return "/images/activity-icon-update.svg"
  if (a.includes("download")) return "/images/activity-icon-download.svg"
  if (a.includes("delet") || a.includes("reject") || a.includes("remove")) return "/images/activity-icon-delete.svg"
  if (a.includes("view")) return "/images/activity-icon-view-user.svg"
  return "/images/activity-icon-view-user.svg"
}

function formatRole(r: string | null): string {
  if (!r) return ""
  return r
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

function formatTime(iso: string | null): string {
  if (!iso) return ""
  // "YYYY-MM-DD HH:MM:SS"
  return new Date(iso).toLocaleString("sv-SE")
}

type LogRow = {
  id: string
  action: string
  actor_role: string | null
  description: string | null
  target_type: string | null
  ip_address: string | null
  status: string
  created_at: string | null
  actor: { full_name: string | null } | null
}

export async function listActivityLogs(): Promise<UIActivityLog[]> {
  await assertPermission("activity.view")
  const admin = createAdminClient()

  const { data, error } = await admin
    .from("activity_logs")
    // activity_logs → profiles only via actor_id.
    .select(
      "id, action, actor_role, description, target_type, ip_address, status, created_at, actor:profiles ( full_name )",
    )
    .order("created_at", { ascending: false })
    .limit(200)
  if (error) throw new Error(error.message)

  return ((data ?? []) as unknown as LogRow[]).map((l) => ({
    id: l.id,
    time: formatTime(l.created_at),
    user: l.actor?.full_name ?? "System",
    role: formatRole(l.actor_role),
    action: l.action,
    actionIcon: iconFor(l.action, l.status),
    target: l.description ?? l.target_type ?? "—",
    ip: l.ip_address ?? "—",
    status: l.status === "failed" ? "Failed" : "Success",
  }))
}
