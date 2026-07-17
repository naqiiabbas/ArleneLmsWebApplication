"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { assertAdmin } from "@/lib/data/guards"
import type { Database } from "@/lib/database.types"
import type { EventInput, EventType, UIEvent } from "@/lib/data/events.types"

type DbEventType = Database["public"]["Enums"]["event_type"]

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
    .select("id, title, description, type, start_at, time_label, participant_labels")
    .order("start_at", { ascending: true })
  if (error) throw new Error(error.message)

  return (data ?? []).map((e) => ({
    id: e.id,
    title: e.title,
    // start_at is stored at midnight UTC of the event date → take the UTC date.
    date: e.start_at ? e.start_at.slice(0, 10) : "",
    time: e.time_label ?? "",
    type: DB_TO_UI_TYPE[e.type] ?? "Meeting",
    participants: e.participant_labels ?? [],
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

  const { data, error } = await admin
    .from("events")
    .insert({
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
