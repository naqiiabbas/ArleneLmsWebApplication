"use server"

// What the panel headers show about the person signed in. Replaces the
// hardcoded "Esther Howard" / "Robert Fox" / "Alex Johnson" cards and the
// notification dot that was always lit.
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
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
