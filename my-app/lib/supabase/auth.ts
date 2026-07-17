// Server-side auth helpers. Import from Server Components / Route Handlers /
// Server Actions. `getUser()` is trustworthy (it revalidates the JWT with
// Supabase); never rely on getSession() for authorization on the server.
import "server-only"
import { createClient } from "@/lib/supabase/server"
import type { Database } from "@/lib/database.types"

export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type UserRole = Database["public"]["Enums"]["user_role"]

/** The authenticated auth.users record, or null if signed out. */
export async function getUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

/** The signed-in user's public.profiles row (role, status, org, …), or null. */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  return data
}

/** Convenience role check mirroring the DB `is_staff()` helper. */
export function isStaffRole(role: UserRole | null | undefined) {
  return role === "super_admin" || role === "admin" || role === "manager" || role === "mentor"
}
