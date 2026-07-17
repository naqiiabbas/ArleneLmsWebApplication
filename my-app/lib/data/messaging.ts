"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { UIConversation, UIMessage } from "@/lib/data/messaging.types"

async function currentUserId(): Promise<string | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.id ?? null
}

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 3)
}

function formatRole(r: string | null): string {
  if (!r) return ""
  return r
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

function formatClock(iso: string | null): string {
  if (!iso) return ""
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function formatRelative(iso: string | null): string {
  if (!iso) return ""
  const then = new Date(iso).getTime()
  const s = Math.floor((Date.now() - then) / 1000)
  if (s < 60) return "Just now"
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return formatClock(iso)
  const d = Math.floor(h / 24)
  if (d === 1) return "Yesterday"
  if (d < 7) return `${d} days ago`
  return new Date(iso).toLocaleDateString()
}

async function isParticipant(admin: ReturnType<typeof createAdminClient>, conversationId: string, userId: string) {
  const { data } = await admin
    .from("conversation_participants")
    .select("conversation_id")
    .eq("conversation_id", conversationId)
    .eq("profile_id", userId)
    .maybeSingle()
  return !!data
}

/** Conversations the current user participates in (newest activity first). */
export async function listConversations(): Promise<UIConversation[]> {
  const me = await currentUserId()
  if (!me) return []
  const admin = createAdminClient()

  const { data: myParts } = await admin
    .from("conversation_participants")
    .select("conversation_id, last_read_at")
    .eq("profile_id", me)
  const convIds = (myParts ?? []).map((p) => p.conversation_id)
  if (convIds.length === 0) return []

  const lastReadByConv = new Map<string, string | null>()
  for (const p of myParts ?? []) lastReadByConv.set(p.conversation_id, p.last_read_at)

  const [{ data: convs }, { data: parts }, { data: msgs }] = await Promise.all([
    admin
      .from("conversations")
      .select("id, type, title, last_message_at, created_at")
      .in("id", convIds),
    admin
      .from("conversation_participants")
      .select("conversation_id, profile_id, profiles ( full_name, role )")
      .in("conversation_id", convIds),
    admin
      .from("messages")
      .select("conversation_id, sender_id, body, created_at")
      .in("conversation_id", convIds)
      .order("created_at", { ascending: true }),
  ])

  // Other participant (for direct chats).
  const otherByConv = new Map<string, { name: string; role: string }>()
  for (const p of (parts ?? []) as unknown as {
    conversation_id: string
    profile_id: string
    profiles: { full_name: string | null; role: string | null } | null
  }[]) {
    if (p.profile_id !== me)
      otherByConv.set(p.conversation_id, {
        name: p.profiles?.full_name ?? "Unknown",
        role: formatRole(p.profiles?.role ?? null),
      })
  }

  // Last message + unread count per conversation.
  const lastByConv = new Map<string, string>()
  const unreadByConv = new Map<string, number>()
  for (const m of msgs ?? []) {
    lastByConv.set(m.conversation_id, m.body ?? "")
    const lastRead = lastReadByConv.get(m.conversation_id)
    const isUnread =
      m.sender_id !== me && (!lastRead || new Date(m.created_at!) > new Date(lastRead))
    if (isUnread) unreadByConv.set(m.conversation_id, (unreadByConv.get(m.conversation_id) ?? 0) + 1)
  }

  const result: UIConversation[] = (convs ?? []).map((c) => {
    const isGroup = c.type === "group"
    const other = otherByConv.get(c.id)
    const name = isGroup ? c.title ?? "Group Chat" : other?.name ?? "Unknown"
    const role = isGroup ? "Group Chat" : other?.role ?? ""
    return {
      id: c.id,
      name,
      role,
      avatar: initials(name),
      status: "offline",
      lastMessage: lastByConv.get(c.id) ?? "No messages yet",
      time: formatRelative(c.last_message_at ?? c.created_at),
      unreadCount: unreadByConv.get(c.id) ?? 0,
      messages: [],
    }
  })

  // Sort by most recent activity.
  result.sort((a, b) => {
    const ca = convs?.find((c) => c.id === a.id)
    const cb = convs?.find((c) => c.id === b.id)
    const ta = new Date(ca?.last_message_at ?? ca?.created_at ?? 0).getTime()
    const tb = new Date(cb?.last_message_at ?? cb?.created_at ?? 0).getTime()
    return tb - ta
  })
  return result
}

/** Messages of a conversation (oldest first) + the current user's id. */
export async function getMessages(
  conversationId: string,
): Promise<{ myId: string; messages: UIMessage[]; error?: string }> {
  const me = await currentUserId()
  if (!me) return { myId: "", messages: [], error: "Not authenticated." }
  const admin = createAdminClient()
  if (!(await isParticipant(admin, conversationId, me))) {
    return { myId: me, messages: [], error: "You are not part of this conversation." }
  }

  const { data, error } = await admin
    .from("messages")
    .select("id, sender_id, body, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
  if (error) return { myId: me, messages: [], error: error.message }

  return {
    myId: me,
    messages: (data ?? []).map((m) => ({
      id: m.id,
      senderId: m.sender_id ?? "",
      text: m.body ?? "",
      time: formatClock(m.created_at),
    })),
  }
}

export async function sendMessage(
  conversationId: string,
  text: string,
): Promise<{ error?: string }> {
  const me = await currentUserId()
  if (!me) return { error: "Not authenticated." }
  const body = text.trim()
  if (!body) return { error: "Message is empty." }
  const admin = createAdminClient()
  if (!(await isParticipant(admin, conversationId, me))) {
    return { error: "You are not part of this conversation." }
  }

  const { error } = await admin
    .from("messages")
    .insert({ conversation_id: conversationId, sender_id: me, body })
  if (error) return { error: error.message }

  await admin
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", conversationId)
  return {}
}

export async function markConversationRead(conversationId: string): Promise<{ error?: string }> {
  const me = await currentUserId()
  if (!me) return { error: "Not authenticated." }
  const admin = createAdminClient()

  // Mark read up to the latest message's DB timestamp (not the server-action
  // clock) so clock skew between the app and DB can't leave it "unread".
  const { data: last } = await admin
    .from("messages")
    .select("created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()
  const readAt = last?.created_at ?? new Date().toISOString()

  const { error } = await admin
    .from("conversation_participants")
    .update({ last_read_at: readAt })
    .eq("conversation_id", conversationId)
    .eq("profile_id", me)
  if (error) return { error: error.message }
  return {}
}

/** Find-or-create a direct conversation with the named user. */
export async function createDirectConversation(
  contactName: string,
): Promise<{ id?: string; error?: string }> {
  const me = await currentUserId()
  if (!me) return { error: "Not authenticated." }
  const admin = createAdminClient()

  const { data: other } = await admin
    .from("profiles")
    .select("id, full_name")
    .ilike("full_name", contactName.trim())
    .neq("id", me)
    .limit(1)
    .maybeSingle()
  if (!other) {
    return { error: `No user found named "${contactName.trim()}".` }
  }

  // Existing direct conversation between the two?
  const [{ data: mine }, { data: theirs }] = await Promise.all([
    admin.from("conversation_participants").select("conversation_id").eq("profile_id", me),
    admin.from("conversation_participants").select("conversation_id").eq("profile_id", other.id),
  ])
  const shared = (mine ?? [])
    .map((r) => r.conversation_id)
    .filter((id) => (theirs ?? []).some((t) => t.conversation_id === id))
  if (shared.length) {
    const { data: direct } = await admin
      .from("conversations")
      .select("id")
      .in("id", shared)
      .eq("type", "direct")
      .limit(1)
      .maybeSingle()
    if (direct) return { id: direct.id }
  }

  const { data: conv, error } = await admin
    .from("conversations")
    .insert({ type: "direct", created_by: me })
    .select("id")
    .single()
  if (error) return { error: error.message }

  const { error: pErr } = await admin.from("conversation_participants").insert([
    { conversation_id: conv.id, profile_id: me },
    { conversation_id: conv.id, profile_id: other.id },
  ])
  if (pErr) return { error: pErr.message }

  return { id: conv.id }
}
