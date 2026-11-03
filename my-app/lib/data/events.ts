"use server"

import { randomUUID } from "node:crypto"
import { createAdminClient } from "@/lib/supabase/admin"
import { assertActiveUser, assertAdmin } from "@/lib/data/guards"
import { logActivity } from "@/lib/data/audit"
import { isValidYmd } from "@/lib/time"
import type { Database } from "@/lib/database.types"
import type { EventAudience, EventInput, EventType, UIEvent, VisibleEvent } from "@/lib/data/events.types"

type DbEventType = Database["public"]["Enums"]["event_type"]
type DbRole = Database["public"]["Enums"]["user_role"]

const MATERIALS_BUCKET = "attachments"
const MATERIAL_MAX_BYTES = 10 * 1024 * 1024
// A closed list: the bucket is served from the LMS's own origin, so nothing a
// browser would run as a page (html, svg) may be stored here.
const MATERIAL_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  csv: "text/csv",
  txt: "text/plain",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
}

/** Who gets each audience (stored as role_based + event_participants.invited_role). */
const AUDIENCE_ROLES: Record<EventAudience, DbRole[]> = {
  Everyone: [],
  Mentors: ["mentor"],
  Students: ["student"],
  Admins: [],
}

const EVENT_COLUMNS =
  "id, title, description, type, start_at, time_label, participant_labels, visibility, location, event_participants ( invited_role ), event_materials ( id, name )"

type EventRow = {
  id: string
  title: string
  description: string | null
  type: string
  start_at: string
  time_label: string | null
  participant_labels: string[] | null
  visibility: "public" | "private" | "role_based"
  location: string | null
  event_participants: { invited_role: string | null }[] | null
  event_materials: { id: string; name: string | null }[] | null
}

function audienceOf(e: EventRow): EventAudience {
  if (e.visibility === "public") return "Everyone"
  if (e.visibility === "private") return "Admins"
  const roles = new Set((e.event_participants ?? []).map((p) => p.invited_role))
  if (roles.has("mentor") && !roles.has("student")) return "Mentors"
  if (roles.has("student") && !roles.has("mentor")) return "Students"
  return "Everyone"
}

const materialsOf = (e: EventRow) =>
  (e.event_materials ?? []).map((m) => ({ id: m.id, name: m.name || "Attachment" }))

const UI_TO_DB_TYPE: Record<EventType, DbEventType> = {
  Session: "session",
  Meeting: "meeting",
  Deadline: "deadline",
  Holiday: "holiday",
  Workshop: "workshop",
  Fundraiser: "fundraiser",
}
const DB_TO_UI_TYPE: Record<string, EventType> = {
  session: "Session",
  meeting: "Meeting",
  deadline: "Deadline",
  holiday: "Holiday",
  workshop: "Workshop",
  fundraiser: "Fundraiser",
  other: "Meeting",
}

// Parse the date input into a YYYY-MM-DD string, or null. A plain date is kept
// as-is so the server's timezone can't shift the day.
function toDateStr(input: string): string | null {
  const raw = input.trim()
  if (isValidYmd(raw)) return raw
  const d = new Date(raw)
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
    .select(EVENT_COLUMNS)
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
    location: e.location ?? "",
    materials: materialsOf(e),
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
    .select(EVENT_COLUMNS)
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
      location: e.location ?? "",
      materials: materialsOf(e),
    }))
}

/** Validate the event form and build the columns shared by create and update. */
function eventColumns(input: EventInput) {
  const title = (input.title ?? "").trim()
  if (!title) return { error: "Please enter an event title." }
  if (title.length > 200) return { error: "Event title is too long (200 characters max)." }

  const dateStr = toDateStr(input.date ?? "")
  if (!dateStr) return { error: "Please enter a valid date (e.g. 2025-12-05)." }

  const audience: EventAudience = input.audience ?? "Everyone"
  if (!(audience in AUDIENCE_ROLES)) return { error: "Invalid audience." }
  const type = UI_TO_DB_TYPE[input.type]
  if (!type) return { error: "Invalid event type." }

  return {
    audience,
    row: {
      visibility: (audience === "Everyone" ? "public" : audience === "Admins" ? "private" : "role_based") as
        | "public"
        | "private"
        | "role_based",
      title,
      description: (input.description ?? "").trim() || null,
      type,
      start_at: `${dateStr}T00:00:00Z`,
      time_label: (input.time ?? "").trim() || null,
      participant_labels: input.participants ?? [],
      location: (input.location ?? "").trim() || null,
    },
  }
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

  const built = eventColumns(input)
  if ("error" in built) return { error: built.error }

  const { data, error } = await admin
    .from("events")
    .insert({ ...built.row, created_by: me.userId })
    .select("id")
    .single()
  if (error) return { error: error.message }

  const roles = AUDIENCE_ROLES[built.audience]
  if (roles.length) {
    const { error: pErr } = await admin
      .from("event_participants")
      .insert(roles.map((invited_role) => ({ event_id: data.id, invited_role })))
    if (pErr) {
      await admin.from("events").delete().eq("id", data.id) // don't leave an event nobody can see
      return { error: pErr.message }
    }
  }
  await logActivity(
    { actorId: me.userId, action: "Created event", targetType: "event", targetId: data.id, description: built.row.title },
    admin,
  )
  return { id: data.id }
}

/** Change an existing event: details, date/time, location and who can see it. */
export async function updateEvent(id: string, input: EventInput): Promise<{ error?: string }> {
  let me
  try {
    me = await assertAdmin()
  } catch (e) {
    return { error: (e as Error).message }
  }
  const admin = createAdminClient()

  const built = eventColumns(input)
  if ("error" in built) return { error: built.error }

  const { data: updated, error } = await admin.from("events").update(built.row).eq("id", id).select("id")
  if (error) return { error: error.message }
  if (!updated?.length) return { error: "That event no longer exists." }

  // Audience rows only; invitations of specific people stay untouched.
  const { error: delErr } = await admin
    .from("event_participants")
    .delete()
    .eq("event_id", id)
    .is("profile_id", null)
  if (delErr) return { error: delErr.message }
  const roles = AUDIENCE_ROLES[built.audience]
  if (roles.length) {
    const { error: pErr } = await admin
      .from("event_participants")
      .insert(roles.map((invited_role) => ({ event_id: id, invited_role })))
    if (pErr) return { error: pErr.message }
  }

  await logActivity(
    { actorId: me.userId, action: "Updated event", targetType: "event", targetId: id, description: built.row.title },
    admin,
  )
  return {}
}

export async function deleteEvent(id: string): Promise<{ error?: string }> {
  let me
  try {
    me = await assertAdmin()
  } catch (e) {
    return { error: (e as Error).message }
  }
  const admin = createAdminClient()

  const [{ data: event }, { data: materials }] = await Promise.all([
    admin.from("events").select("title").eq("id", id).maybeSingle(),
    admin.from("event_materials").select("file_url").eq("event_id", id),
  ])
  if (!event) return { error: "That event no longer exists." }

  const { error } = await admin.from("events").delete().eq("id", id)
  if (error) return { error: error.message }

  const paths = (materials ?? []).map((m) => m.file_url)
  if (paths.length) await admin.storage.from(MATERIALS_BUCKET).remove(paths) // best-effort; the event is gone

  await logActivity(
    { actorId: me.userId, action: "Deleted event", targetType: "event", targetId: id, description: event.title },
    admin,
  )
  return {}
}

/** Attach one file (FormData "file") to an event. */
export async function uploadEventMaterial(eventId: string, formData: FormData): Promise<{ error?: string }> {
  let me
  try {
    me = await assertAdmin()
  } catch (e) {
    return { error: (e as Error).message }
  }
  const file = formData.get("file")
  if (!(file instanceof File) || file.size === 0) return { error: "Please choose a file." }
  if (file.size > MATERIAL_MAX_BYTES) return { error: `"${file.name}" is larger than 10 MB.` }
  const ext = file.name.includes(".") ? file.name.split(".").pop()!.toLowerCase() : ""
  const contentType = MATERIAL_TYPES[ext]
  if (!contentType) return { error: `"${file.name}" isn't a supported type. Use PDF, Word, PowerPoint, Excel, text or an image.` }

  const admin = createAdminClient()
  const { data: event } = await admin.from("events").select("id").eq("id", eventId).maybeSingle()
  if (!event) return { error: "That event no longer exists." }

  const path = `events/${eventId}/${randomUUID()}.${ext}`
  const { error: upErr } = await admin.storage
    .from(MATERIALS_BUCKET)
    .upload(path, new Uint8Array(await file.arrayBuffer()), { contentType, upsert: false })
  if (upErr) return { error: upErr.message }

  const { error } = await admin
    .from("event_materials")
    .insert({ event_id: eventId, file_url: path, name: file.name.slice(0, 200), file_type: ext })
  if (error) {
    await admin.storage.from(MATERIALS_BUCKET).remove([path])
    return { error: error.message }
  }
  await logActivity(
    { actorId: me.userId, action: "Attached event material", targetType: "event", targetId: eventId, description: file.name },
    admin,
  )
  return {}
}

export async function deleteEventMaterial(id: string): Promise<{ error?: string }> {
  let me
  try {
    me = await assertAdmin()
  } catch (e) {
    return { error: (e as Error).message }
  }
  const admin = createAdminClient()
  const { data: mat } = await admin.from("event_materials").select("event_id, file_url, name").eq("id", id).maybeSingle()
  if (!mat) return {} // already gone
  const { error } = await admin.from("event_materials").delete().eq("id", id)
  if (error) return { error: error.message }
  await admin.storage.from(MATERIALS_BUCKET).remove([mat.file_url])
  await logActivity(
    { actorId: me.userId, action: "Removed event material", targetType: "event", targetId: mat.event_id, description: mat.name ?? undefined },
    admin,
  )
  return {}
}

/**
 * Short-lived link to an attachment, for anyone allowed to see its event: admins
 * see everything; others get the same public + their-role events as getMyEvents.
 */
export async function getEventMaterialUrl(id: string): Promise<{ url?: string; error?: string }> {
  let userId: string
  try {
    ;({ userId } = await assertActiveUser())
  } catch (e) {
    return { error: (e as Error).message }
  }
  const admin = createAdminClient()
  const [{ data: me }, { data: mat }] = await Promise.all([
    admin.from("profiles").select("role").eq("id", userId).single(),
    admin
      .from("event_materials")
      .select("file_url, event:events ( visibility, event_participants ( invited_role ) )")
      .eq("id", id)
      .maybeSingle(),
  ])
  if (!mat) return { error: "That file is no longer available." }

  const event = (mat as unknown as {
    event: { visibility: string; event_participants: { invited_role: string | null }[] | null } | null
  }).event
  const role = me?.role ?? null
  const isAdmin = role === "super_admin" || role === "admin"
  const allowed =
    isAdmin ||
    event?.visibility === "public" ||
    (event?.visibility === "role_based" && (event.event_participants ?? []).some((p) => p.invited_role === role))
  if (!allowed) return { error: "You don't have access to this file." }

  const { data, error } = await admin.storage.from(MATERIALS_BUCKET).createSignedUrl(mat.file_url, 120)
  if (error) return { error: error.message }
  return { url: data.signedUrl }
}
