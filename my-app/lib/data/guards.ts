// Shared server-side authorization guards for admin data modules.
import { createClient } from "@/lib/supabase/server"
import type { createAdminClient } from "@/lib/supabase/admin"

type AdminClient = ReturnType<typeof createAdminClient>

/**
 * Ensure the caller is signed in, ACTIVE, and holds one of `roles`.
 * Status is checked on every call, not just at sign-in: a user deactivated
 * mid-session must lose access immediately rather than when their session ends.
 */
async function requireRole(roles: string[]): Promise<{ userId: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated.")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .single()

  if (!profile || profile.status !== "active") {
    throw new Error("This account is not active. Contact an administrator.")
  }
  if (!roles.includes(profile.role)) {
    throw new Error("You are not authorized to perform this action.")
  }
  return { userId: user.id }
}

/** Ensure the caller is a super_admin or admin. Returns their user id. */
export function assertAdmin(): Promise<{ userId: string }> {
  return requireRole(["super_admin", "admin"])
}

/** Ensure the caller is a mentor. Returns their user id. */
export function assertMentor(): Promise<{ userId: string }> {
  return requireRole(["mentor"])
}

/** Ensure the caller is a student. Returns their user id (= students.id). */
export function assertStudent(): Promise<{ userId: string }> {
  return requireRole(["student"])
}

/** Ensure the caller is a sponsor. Returns their user id (= sponsors.profile_id). */
export function assertSponsor(): Promise<{ userId: string }> {
  return requireRole(["sponsor"])
}

/**
 * Privilege tier of a profile role. Used to stop a caller acting on, creating,
 * or granting an account ranked above their own — e.g. a manager (who holds
 * users.manage) editing the super admin's email and then resetting its password.
 */
export function roleRank(role: string | null | undefined): number {
  if (role === "super_admin") return 3
  if (role === "admin") return 2
  return 1
}

/** The calling user's privilege tier (see roleRank). */
export async function callerRank(admin: AdminClient, userId: string): Promise<number> {
  const { data } = await admin.from("profiles").select("role").eq("id", userId).single()
  return roleRank(data?.role)
}

/**
 * Error message unless account `id` exists and has exactly `role`; null if OK.
 * Module-specific actions (updateMentor, deleteStudent, …) take a raw id from
 * the client, so without this they would act on ANY account — including admins.
 */
export async function checkTargetRole(
  admin: AdminClient,
  id: string,
  role: "mentor" | "student",
): Promise<string | null> {
  const { data } = await admin.from("profiles").select("role").eq("id", id).maybeSingle()
  if (!data) return "Account not found."
  if (data.role !== role) return `That account is not a ${role}.`
  return null
}
