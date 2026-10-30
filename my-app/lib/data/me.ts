"use server"

// What the panel headers show about the person signed in. Replaces the
// hardcoded "Esther Howard" / "Robert Fox" / "Alex Johnson" cards and the
// notification dot that was always lit.
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { assertActiveUser } from "@/lib/data/guards"
import { avatarFileError, removeAvatarObject, storeAvatar } from "@/lib/data/avatar"
import type { HeaderInfo, MyNotificationPrefs } from "@/lib/data/me.types"

/** The signed-in user's header card + unread count; null when signed out. */
export async function getHeaderInfo(): Promise<HeaderInfo | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser() // revalidates the session server-side
  if (!user) return null

  const admin = createAdminClient()
  const [{ data: profile }, { count }, unreadMessages] = await Promise.all([
    admin.from("profiles").select("full_name, email, avatar_url, role").eq("id", user.id).single(),
    admin
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("recipient_id", user.id)
      .eq("is_read", false),
    countUnreadMessages(admin, user.id),
  ])

  const email = profile?.email ?? user.email ?? ""
  return {
    // Fall back to the email's local part rather than a placeholder person.
    name: profile?.full_name?.trim() || email.split("@")[0] || "Account",
    email,
    role: profile?.role ?? "",
    avatarUrl: profile?.avatar_url ?? "",
    unreadNotifications: count ?? 0,
    unreadMessages,
  }
}

/**
 * Same rule as the inbox (listConversations): a message is unread when someone
 * else sent it after this user's last_read_at for that conversation — so the
 * sidebar badge and the conversation list always agree.
 */
async function countUnreadMessages(admin: ReturnType<typeof createAdminClient>, userId: string): Promise<number> {
  const { data: parts } = await admin
    .from("conversation_participants")
    .select("conversation_id, last_read_at")
    .eq("profile_id", userId)
  if (!parts?.length) return 0
  const lastRead = new Map(parts.map((p) => [p.conversation_id, p.last_read_at ? new Date(p.last_read_at).getTime() : 0]))
  // Only fetch what could be unread: newer than the oldest read marker.
  const since = Math.min(...[...lastRead.values()])
  let q = admin
    .from("messages")
    .select("conversation_id, created_at")
    .in("conversation_id", [...lastRead.keys()])
    .neq("sender_id", userId)
    .limit(1000)
  if (since > 0) q = q.gt("created_at", new Date(since).toISOString())
  const { data: msgs } = await q
  return (msgs ?? []).filter((m) => new Date(m.created_at).getTime() > (lastRead.get(m.conversation_id) ?? 0)).length
}

/**
 * Replace (FormData "avatar" file) or clear ("remove" = "true") the signed-in
 * user's own profile photo. Works from every portal; returns the new URL.
 */
export async function updateMyAvatar(formData: FormData): Promise<{ avatarUrl?: string; error?: string }> {
  let userId: string
  try {
    ;({ userId } = await assertActiveUser())
  } catch (e) {
    return { error: (e as Error).message }
  }
  const admin = createAdminClient()

  const file = formData.get("avatar")
  const remove = formData.get("remove") === "true"
  if (!(file instanceof File && file.size > 0) && !remove) return { error: "Choose a photo to upload." }

  const { data: cur } = await admin.from("profiles").select("avatar_url").eq("id", userId).single()

  let avatarUrl: string | null = null
  if (file instanceof File && file.size > 0) {
    const bad = avatarFileError(file)
    if (bad) return { error: bad }
    try {
      avatarUrl = await storeAvatar(admin, userId, file)
    } catch (e) {
      return { error: (e as Error).message }
    }
  }

  const { error } = await admin.from("profiles").update({ avatar_url: avatarUrl }).eq("id", userId)
  if (error) {
    await removeAvatarObject(admin, userId, avatarUrl) // don't leave the new upload orphaned
    return { error: error.message }
  }
  await removeAvatarObject(admin, userId, cur?.avatar_url)
  return { avatarUrl: avatarUrl ?? "" }
}

const PREF_KEYS = { newMessages: "new_messages", sessionReminders: "session_reminders", studentAlerts: "student_alerts" } as const

/** The signed-in user's in-app notification switches (default: all on). */
export async function getMyNotificationPrefs(): Promise<MyNotificationPrefs> {
  const { userId } = await assertActiveUser()
  const admin = createAdminClient()
  const { data } = await admin
    .from("notification_preferences")
    .select("type_overrides")
    .eq("profile_id", userId)
    .maybeSingle()
  const o = (data?.type_overrides ?? {}) as Record<string, unknown>
  return {
    newMessages: o[PREF_KEYS.newMessages] !== false,
    sessionReminders: o[PREF_KEYS.sessionReminders] !== false,
    studentAlerts: o[PREF_KEYS.studentAlerts] !== false,
  }
}

/**
 * Save the switches. Merges into type_overrides so keys other screens store
 * there (e.g. the admin's report preferences) are kept. "New messages" is
 * honoured by sendMessage's notifications.
 */
export async function saveMyNotificationPrefs(prefs: MyNotificationPrefs): Promise<{ error?: string }> {
  let userId: string
  try {
    ;({ userId } = await assertActiveUser())
  } catch (e) {
    return { error: (e as Error).message }
  }
  const admin = createAdminClient()
  const { data: cur } = await admin
    .from("notification_preferences")
    .select("type_overrides")
    .eq("profile_id", userId)
    .maybeSingle()
  const merged = {
    ...((cur?.type_overrides ?? {}) as Record<string, unknown>),
    [PREF_KEYS.newMessages]: !!prefs.newMessages,
    [PREF_KEYS.sessionReminders]: !!prefs.sessionReminders,
    [PREF_KEYS.studentAlerts]: !!prefs.studentAlerts,
  }
  const { error } = await admin
    .from("notification_preferences")
    .upsert({ profile_id: userId, type_overrides: merged }, { onConflict: "profile_id" })
  return error ? { error: error.message } : {}
}

/**
 * Change the signed-in user's password after confirming the current one.
 * (The Security tab used to "save" nothing and pop up a browser alert.)
 */
export async function changeMyPassword(currentPassword: string, newPassword: string): Promise<{ error?: string }> {
  let userId: string
  try {
    ;({ userId } = await assertActiveUser())
  } catch (e) {
    return { error: (e as Error).message }
  }
  if (!currentPassword) return { error: "Enter your current password." }
  if (!newPassword || newPassword.length < 8) return { error: "The new password must be at least 8 characters." }
  if (newPassword === currentPassword) return { error: "The new password must be different from the current one." }

  const admin = createAdminClient()
  const { data: prof } = await admin.from("profiles").select("email").eq("id", userId).single()
  if (!prof?.email) return { error: "Your account has no email address." }

  // Verify the current password on a throw-away client, then end that check
  // session only (scope "local" — never sign the user out elsewhere).
  const probe = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { error: badPw } = await probe.auth.signInWithPassword({ email: prof.email, password: currentPassword })
  if (badPw) return { error: "Your current password is incorrect." }
  await probe.auth.signOut({ scope: "local" })

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  return error ? { error: error.message } : {}
}
