"use server"

// What the panel headers show about the person signed in. Replaces the
// hardcoded "Esther Howard" / "Robert Fox" / "Alex Johnson" cards and the
// notification dot that was always lit.
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { assertActiveUser } from "@/lib/data/guards"
import { avatarFileError, removeAvatarObject, storeAvatar } from "@/lib/data/avatar"
import type { HeaderInfo } from "@/lib/data/me.types"

/** The signed-in user's header card + unread count; null when signed out. */
export async function getHeaderInfo(): Promise<HeaderInfo | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser() // revalidates the session server-side
  if (!user) return null

  const admin = createAdminClient()
  const [{ data: profile }, { count }] = await Promise.all([
    admin.from("profiles").select("full_name, email, avatar_url, role").eq("id", user.id).single(),
    admin
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("recipient_id", user.id)
      .eq("is_read", false),
  ])

  const email = profile?.email ?? user.email ?? ""
  return {
    // Fall back to the email's local part rather than a placeholder person.
    name: profile?.full_name?.trim() || email.split("@")[0] || "Account",
    email,
    role: profile?.role ?? "",
    avatarUrl: profile?.avatar_url ?? "",
    unreadNotifications: count ?? 0,
  }
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
