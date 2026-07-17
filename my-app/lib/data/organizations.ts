"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { assertAdmin } from "@/lib/data/guards"
import type { Database } from "@/lib/database.types"
import type { OrgInput, OrgStatus, OrgType, UIOrganization } from "@/lib/data/organizations.types"

type DbOrgType = Database["public"]["Enums"]["organization_type"]

const UI_TO_DB_TYPE: Record<OrgType, DbOrgType> = {
  University: "university",
  Company: "company",
  Nonprofit: "nonprofit",
  Government: "government",
}
const DB_TO_UI_TYPE: Record<string, OrgType> = {
  university: "University",
  company: "Company",
  nonprofit: "Nonprofit",
  government: "Government",
  school: "University",
  other: "Company",
}

function uiToDbStatus(s: OrgStatus) {
  return s === "Inactive" ? ("inactive" as const) : ("active" as const)
}

export async function listOrganizations(): Promise<UIOrganization[]> {
  await assertAdmin()
  const admin = createAdminClient()

  const [{ data: orgs, error }, { data: stats }] = await Promise.all([
    admin
      .from("organizations")
      .select("id, name, type, contact_person, email, phone, status, created_at")
      .order("created_at", { ascending: false }),
    admin.from("organization_stats").select("id, students, mentors, programs"),
  ])
  if (error) throw new Error(error.message)

  const statsById = new Map<string, { students: number; mentors: number; programs: number }>()
  for (const s of stats ?? []) {
    if (s.id)
      statsById.set(s.id, {
        students: Number(s.students ?? 0),
        mentors: Number(s.mentors ?? 0),
        programs: Number(s.programs ?? 0),
      })
  }

  return (orgs ?? []).map((o) => {
    const c = statsById.get(o.id) ?? { students: 0, mentors: 0, programs: 0 }
    return {
      id: o.id,
      name: o.name,
      type: DB_TO_UI_TYPE[o.type] ?? "University",
      contactPerson: o.contact_person ?? "",
      email: o.email ?? "",
      phone: o.phone ?? "",
      students: c.students,
      mentors: c.mentors,
      programs: c.programs,
      status: o.status === "inactive" ? "Inactive" : "Active",
      createdAt: o.created_at ? new Date(o.created_at).toLocaleDateString("en-US") : "",
    }
  })
}

export async function createOrganization(
  input: OrgInput,
): Promise<{ id?: string; error?: string }> {
  try {
    await assertAdmin()
  } catch (e) {
    return { error: (e as Error).message }
  }
  const admin = createAdminClient()

  const { data, error } = await admin
    .from("organizations")
    .insert({
      name: input.name.trim(),
      type: UI_TO_DB_TYPE[input.type],
      contact_person: input.contactPerson.trim() || null,
      email: input.email.trim() || null,
      phone: input.phone.trim() || null,
      status: uiToDbStatus(input.status),
    })
    .select("id")
    .single()
  if (error) return { error: error.message }
  return { id: data.id }
}

export async function updateOrganization(
  id: string,
  input: OrgInput,
): Promise<{ error?: string }> {
  try {
    await assertAdmin()
  } catch (e) {
    return { error: (e as Error).message }
  }
  const admin = createAdminClient()

  const { error } = await admin
    .from("organizations")
    .update({
      name: input.name.trim(),
      type: UI_TO_DB_TYPE[input.type],
      contact_person: input.contactPerson.trim() || null,
      email: input.email.trim() || null,
      phone: input.phone.trim() || null,
      status: uiToDbStatus(input.status),
    })
    .eq("id", id)
  if (error) return { error: error.message }
  return {}
}

export async function deleteOrganization(id: string): Promise<{ error?: string }> {
  try {
    await assertAdmin()
  } catch (e) {
    return { error: (e as Error).message }
  }
  const admin = createAdminClient()
  // FKs from profiles/students/programs are ON DELETE SET NULL — safe to remove.
  const { error } = await admin.from("organizations").delete().eq("id", id)
  if (error) return { error: error.message }
  return {}
}
