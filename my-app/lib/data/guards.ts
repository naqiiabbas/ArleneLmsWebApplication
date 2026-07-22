// Shared server-side authorization guards for admin data modules.
import { createClient } from "@/lib/supabase/server"

/** Ensure the caller is a super_admin or admin. Returns their user id. */
export async function assertAdmin(): Promise<{ userId: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated.")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || !["super_admin", "admin"].includes(profile.role)) {
    throw new Error("You are not authorized to perform this action.")
  }
  return { userId: user.id }
}

/** Ensure the caller is a mentor. Returns their user id. */
export async function assertMentor(): Promise<{ userId: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated.")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "mentor") {
    throw new Error("You are not authorized to perform this action.")
  }
  return { userId: user.id }
}

/** Ensure the caller is a student. Returns their user id (= students.id). */
export async function assertStudent(): Promise<{ userId: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated.")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "student") {
    throw new Error("You are not authorized to perform this action.")
  }
  return { userId: user.id }
}

/** Ensure the caller is a sponsor. Returns their user id (= sponsors.profile_id). */
export async function assertSponsor(): Promise<{ userId: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated.")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "sponsor") {
    throw new Error("You are not authorized to perform this action.")
  }
  return { userId: user.id }
}
