"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

// Map the profile role enum to the seeded custom_role name (for permission lookup).
function roleNameForEnum(role: string): string | null {
  switch (role) {
    case "manager":
      return "Manager"
    case "mentor":
      return "Mentor"
    case "student":
      return "Student"
    case "sponsor":
      return "Sponsor"
    default:
      return null
  }
}

// Resolve the effective permission keys for a user.
// super_admin / admin are top-tier and implicitly hold every permission.
async function keysForUser(userId: string): Promise<string[]> {
  const admin = createAdminClient()

  const { data: prof } = await admin
    .from("profiles")
    .select("role, custom_role_id")
    .eq("id", userId)
    .single()
  if (!prof) return []

  if (prof.role === "super_admin" || prof.role === "admin") {
    const { data } = await admin.from("permissions").select("key")
    return (data ?? []).map((p) => p.key)
  }

  let roleId = prof.custom_role_id
  if (!roleId) {
    const name = roleNameForEnum(prof.role)
    if (!name) return []
    const { data: cr } = await admin
      .from("custom_roles")
      .select("id")
      .eq("name", name)
      .maybeSingle()
    roleId = cr?.id ?? null
  }
  if (!roleId) return []

  const { data } = await admin
    .from("role_permissions")
    .select("permissions ( key )")
    .eq("role_id", roleId)
  return ((data ?? []) as unknown as { permissions: { key: string } | null }[])
    .map((r) => r.permissions?.key)
    .filter((k): k is string => !!k)
}

/** The current user's permission keys + role (for client-side UI gating). */
export async function getMyPermissions(): Promise<{ keys: string[]; role: string | null }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { keys: [], role: null }

  const admin = createAdminClient()
  const { data: prof } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  return { keys: await keysForUser(user.id), role: prof?.role ?? null }
}

/** Throw unless the current user holds `key`. Returns their user id on success. */
export async function assertPermission(key: string): Promise<{ userId: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated.")

  const keys = await keysForUser(user.id)
  if (!keys.includes(key)) {
    throw new Error("You do not have permission to perform this action.")
  }
  return { userId: user.id }
}
