"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { assertAdmin } from "@/lib/data/guards"
import type { Database } from "@/lib/database.types"
import type {
  RoleInput,
  UIPermissionGroup,
  UIRole,
} from "@/lib/data/roles.types"

type DbUserRole = Database["public"]["Enums"]["user_role"]

// Canonical group order for the permission editor.
const GROUP_ORDER = [
  "Dashboard",
  "Users",
  "Students",
  "Mentors",
  "Attendance",
  "Documents",
  "Reports",
  "Billing",
  "System",
]

// Map built-in role names to the profile role enum for user counts.
const NAME_TO_ENUM: Record<string, DbUserRole> = {
  "Super Admin": "super_admin",
  Admin: "admin",
  Manager: "manager",
  Mentor: "mentor",
  Student: "student",
  Sponsor: "sponsor",
  Parent: "parent",
}

function groupRank(g: string) {
  const i = GROUP_ORDER.indexOf(g)
  return i === -1 ? GROUP_ORDER.length : i
}

export async function listPermissionGroups(): Promise<UIPermissionGroup[]> {
  await assertAdmin()
  const admin = createAdminClient()

  const { data, error } = await admin
    .from("permissions")
    .select("id, key, group_name, title, description")
  if (error) throw new Error(error.message)

  const byGroup = new Map<string, UIPermissionGroup>()
  for (const p of data ?? []) {
    if (!byGroup.has(p.group_name))
      byGroup.set(p.group_name, { title: p.group_name, items: [] })
    byGroup.get(p.group_name)!.items.push({
      id: p.id,
      key: p.key,
      title: p.title,
      description: p.description ?? "",
    })
  }
  return [...byGroup.values()].sort((a, b) => groupRank(a.title) - groupRank(b.title))
}

export async function listRoles(): Promise<UIRole[]> {
  await assertAdmin()
  const admin = createAdminClient()

  const [{ data: roles, error }, { data: rp }, { data: perms }, { data: profiles }] =
    await Promise.all([
      admin
        .from("custom_roles")
        .select("id, name, description, icon, is_system")
        .order("is_system", { ascending: false })
        .order("name"),
      admin.from("role_permissions").select("role_id, permission_id"),
      admin.from("permissions").select("id, key, group_name"),
      admin.from("profiles").select("role, custom_role_id"),
    ])
  if (error) throw new Error(error.message)

  const permById = new Map<string, { key: string; group: string }>()
  for (const p of perms ?? []) permById.set(p.id, { key: p.key, group: p.group_name })

  const keysByRole = new Map<string, string[]>()
  const groupsByRole = new Map<string, Set<string>>()
  for (const r of rp ?? []) {
    const p = permById.get(r.permission_id)
    if (!p) continue
    if (!keysByRole.has(r.role_id)) keysByRole.set(r.role_id, [])
    keysByRole.get(r.role_id)!.push(p.key)
    if (!groupsByRole.has(r.role_id)) groupsByRole.set(r.role_id, new Set())
    groupsByRole.get(r.role_id)!.add(p.group)
  }

  const enumCount = new Map<string, number>()
  const customCount = new Map<string, number>()
  for (const pr of profiles ?? []) {
    enumCount.set(pr.role, (enumCount.get(pr.role) ?? 0) + 1)
    if (pr.custom_role_id)
      customCount.set(pr.custom_role_id, (customCount.get(pr.custom_role_id) ?? 0) + 1)
  }

  return (roles ?? []).map((r) => {
    const groups = [...(groupsByRole.get(r.id) ?? new Set<string>())].sort(
      (a, b) => groupRank(a) - groupRank(b),
    )
    const mappedEnum = NAME_TO_ENUM[r.name]
    const users =
      (mappedEnum ? enumCount.get(mappedEnum) ?? 0 : 0) + (customCount.get(r.id) ?? 0)
    return {
      id: r.id,
      name: r.name,
      description: r.description ?? "",
      icon: r.icon ?? "/images/roles-container-purple.svg",
      isSystem: r.is_system,
      users,
      permissionKeys: keysByRole.get(r.id) ?? [],
      permissions: groups.slice(0, 3),
      remaining: Math.max(0, groups.length - 3),
    }
  })
}

async function replacePermissions(
  admin: ReturnType<typeof createAdminClient>,
  roleId: string,
  keys: string[],
): Promise<{ error?: string }> {
  await admin.from("role_permissions").delete().eq("role_id", roleId)
  if (keys.length === 0) return {}

  const { data: perms, error } = await admin
    .from("permissions")
    .select("id, key")
    .in("key", keys)
  if (error) return { error: error.message }

  const rows = (perms ?? []).map((p) => ({ role_id: roleId, permission_id: p.id }))
  if (rows.length) {
    const { error: insErr } = await admin.from("role_permissions").insert(rows)
    if (insErr) return { error: insErr.message }
  }
  return {}
}

export async function createRole(
  input: RoleInput,
): Promise<{ id?: string; error?: string }> {
  try {
    await assertAdmin()
  } catch (e) {
    return { error: (e as Error).message }
  }
  const admin = createAdminClient()

  const { data, error } = await admin
    .from("custom_roles")
    .insert({
      name: input.name.trim(),
      description: input.description.trim() || null,
      icon: input.icon || null,
      is_system: false,
    })
    .select("id")
    .single()
  if (error) return { error: error.message }

  const permRes = await replacePermissions(admin, data.id, input.permissionKeys)
  if (permRes.error) return { error: permRes.error }
  return { id: data.id }
}

export async function updateRole(
  id: string,
  input: RoleInput,
): Promise<{ error?: string }> {
  try {
    await assertAdmin()
  } catch (e) {
    return { error: (e as Error).message }
  }
  const admin = createAdminClient()

  const { error } = await admin
    .from("custom_roles")
    .update({
      name: input.name.trim(),
      description: input.description.trim() || null,
      icon: input.icon || null,
    })
    .eq("id", id)
  if (error) return { error: error.message }

  return replacePermissions(admin, id, input.permissionKeys)
}

export async function deleteRole(id: string): Promise<{ error?: string }> {
  try {
    await assertAdmin()
  } catch (e) {
    return { error: (e as Error).message }
  }
  const admin = createAdminClient()

  const { data: role } = await admin
    .from("custom_roles")
    .select("is_system")
    .eq("id", id)
    .single()
  if (role?.is_system) {
    return { error: "System roles cannot be deleted." }
  }

  const { error } = await admin.from("custom_roles").delete().eq("id", id)
  if (error) return { error: error.message }
  return {}
}
