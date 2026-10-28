"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { assertActiveUser, assertAdmin } from "@/lib/data/guards"
import type { Database } from "@/lib/database.types"
import type { EventAudience, EventInput, EventType, UIEvent, VisibleEvent } from "@/lib/data/events.types"

type DbEventType = Database["public"]["Enums"]["event_type"]
type DbRole = Database["public"]["Enums"]["user_role"]

/** Who gets each audience (stored as role_based + event_participants.invited_role). */
const AUDIENCE_ROLES: Record<EventAudience, DbRole[]> = {
  Everyone: [],
  Mentors: ["mentor"],
  Students: ["student"],
  Admins: [],
}

type EventRow = {
  id: string
  title: string
  description: string | null
  type: string
  start_at: string
  time_label: string | null
  participant_labels: string[] | null
  visibility: "public" | "private" | "role_based"
  event_participants: { invited_role: string | null }[] | null
}

function audienceOf(e: EventRow): EventAudience {
  if (e.visibility === "public") return "Everyone"
  if (e.visibility === "private") return "Admins"
  const roles = new Set((e.event_participants ?? []).map((p) => p.invited_role))
  if (roles.has("mentor") && !roles.has("student")) return "Mentors"
  if (roles.has("student") && !roles.has("mentor")) return "Students"
  return "Everyone"
}

const UI_TO_DB_TYPE: Record<EventType, DbEventType> = {
  Session: "session",
  Meeting: "meeting",
  Deadline: "deadline",
  Holiday: "holiday",
}
const DB_TO_UI_TYPE: Record<string, EventType> = {
  session: "Session",
  meeting: "Meeting",
  deadline: "Deadline",
  holiday: "Holiday",
  workshop: "Meeting",
  fundraiser: "Meeting",
  other: "Meeting",
}

// Parse free-text date input into a YYYY-MM-DD string (server-local), or null.
function toDateStr(input: string): string | null {
  const d = new Date(input.trim())
  if (isNaN(d.getTime())) return null
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export async function listEvents(): Promise<UIEvent[]> {
  await assertAdmin()
  const admin = createAdminClient()

  const { data, error } = await admin
    .from("events")
    .select("id, title, description, type, start_at, time_label, participant_labels, visibility, event_participants ( invited_role )")
    .order("start_at", { ascending: true })
  if (error) throw new Error(error.message)

  return ((data ?? []) as unknown as EventRow[]).map((e) => ({
    id: e.id,
    title: e.title,
    // start_at is stored at midnight UTC of the event date → take the UTC date.
    date: e.start_at ? e.start_at.slice(0, 10) : "",
    time: e.time_label ?? "",
    type: DB_TO_UI_TYPE[e.type] ?? "Meeting",
    participants: e.participant_labels ?? [],
    description: e.description ?? "",
    audience: audienceOf(e),
  }))
}

/**
 * Admin-created events for the signed-in mentor / student calendar: everything
 * public plus role-targeted events for their role. These used to live only in
 * the admin calendar, so nobody else ever saw them.
 */
export async function getMyEvents(): Promise<VisibleEvent[]> {
  const { userId } = await assertActiveUser()
  const admin = createAdminClient()
  const { data: me } = await admin.from("profiles").select("role").eq("id", userId).single()
  const role = me?.role ?? null

  // Recent past + all future (the calendar pages month by month).
  const since = new Date(Date.now() - 120 * 86_400_000).toISOString().slice(0, 10)
  const { data, error } = await admin
    .from("events")
    .select("id, title, description, type, start_at, time_label, participant_labels, visibility, event_participants ( invited_role )")
    .in("visibility", ["public", "role_based"])
    .gte("start_at", `${since}T00:00:00Z`)
    .order("start_at", { ascending: true })
  if (error) throw new Error(error.message)

  return ((data ?? []) as unknown as EventRow[])
    .filter((e) => e.visibility === "public" || (e.event_participants ?? []).some((p) => p.invited_role === role))
    .map((e) => ({
      id: e.id,
      title: e.title,
      date: e.start_at.slice(0, 10),
      time: e.time_label ?? "",
      type: DB_TO_UI_TYPE[e.type] ?? "Meeting",
      description: e.description ?? "",
    }))
}

export async function createEvent(
  input: EventInput,
): Promise<{ id?: string; error?: string }> {
  let me
  try {
    me = await assertAdmin()
  } catch (e) {
    return { error: (e as Error).message }
  }
  const admin = createAdminClient()

  const dateStr = toDateStr(input.date)
  if (!dateStr) return { error: "Please enter a valid date (e.g. 2025-12-05)." }

  const audience: EventAudience = input.audience ?? "Everyone"
  if (!(audience in AUDIENCE_ROLES)) return { error: "Invalid audience." }

  const { data, error } = await admin
    .from("events")
    .insert({
      visibility: audience === "Everyone" ? "public" : audience === "Admins" ? "private" : "role_based",
      title: input.title.trim(),
      description: input.description.trim() || null,
      type: UI_TO_DB_TYPE[input.type],
      start_at: `${dateStr}T00:00:00Z`,
      time_label: input.time.trim() || null,
      participant_labels: input.participants,
      created_by: me.userId,
    })
    .select("id")
    .single()
  if (error) return { error: error.message }

  const roles = AUDIENCE_ROLES[audience]
  if (roles.length) {
    const { error: pErr } = await admin
      .from("event_participants")
      .insert(roles.map((invited_role) => ({ event_id: data.id, invited_role })))
    if (pErr) {
      await admin.from("events").delete().eq("id", data.id) // don't leave an event nobody can see
      return { error: pErr.message }
    }
  }
  return { id: data.id }
}

export async function deleteEvent(id: string): Promise<{ error?: string }> {
  try {
    await assertAdmin()
  } catch (e) {
    return { error: (e as Error).message }
  }
  const admin = createAdminClient()
  const { error } = await admin.from("events").delete().eq("id", id)
  if (error) return { error: error.message }
  return {}
}
