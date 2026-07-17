"use server"

import { randomBytes } from "node:crypto"
import { createAdminClient } from "@/lib/supabase/admin"
import { assertAdmin } from "@/lib/data/guards"
import type { MentorInput, MentorStatus, UIMentor } from "@/lib/data/mentors.types"

const QUICK_ACTIONS = ["Send Message", "View Schedule", "Assign Students", "Download Report"]
const DEFAULT_AVATAR = "/images/avatar1.png"

function uiToDbStatus(s: MentorStatus) {
  return s === "Inactive" ? ("inactive" as const) : ("active" as const)
}

function parseYears(experience: string): number | null {
  const n = parseInt(experience, 10)
  return Number.isFinite(n) ? n : null
}

function formatYears(years: number | null): string {
  return years == null ? "" : `${years} year${years === 1 ? "" : "s"}`
}

function monthsSince(dateStr: string | null): number {
  if (!dateStr) return 1
  const d = new Date(dateStr)
  const now = new Date()
  const m = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth()) + 1
  return Math.max(1, m)
}

function generatePassword() {
  return "Aa1" + randomBytes(9).toString("base64url")
}

type MentorRow = {
  id: string
  expertise: string | null
  experience_years: number | null
  rating: number | null
  status: string
  address: string | null
  join_date: string | null
  profiles: {
    full_name: string | null
    email: string | null
    phone: string | null
    avatar_url: string | null
  } | null
}

export async function listMentors(): Promise<UIMentor[]> {
  await assertAdmin()
  const admin = createAdminClient()

  const [{ data: rows, error }, { data: assigns }, { data: sess }] = await Promise.all([
    admin
      .from("mentors")
      .select(
        "id, expertise, experience_years, rating, status, address, join_date, profiles ( full_name, email, phone, avatar_url )",
      )
      .order("created_at", { ascending: false }),
    admin.from("mentor_student_assignments").select("mentor_id").eq("status", "active"),
    admin.from("class_sessions").select("mentor_id"),
  ])
  if (error) throw new Error(error.message)

  const studentCount = new Map<string, number>()
  for (const a of assigns ?? []) {
    if (a.mentor_id) studentCount.set(a.mentor_id, (studentCount.get(a.mentor_id) ?? 0) + 1)
  }
  const sessionCount = new Map<string, number>()
  for (const s of sess ?? []) {
    if (s.mentor_id) sessionCount.set(s.mentor_id, (sessionCount.get(s.mentor_id) ?? 0) + 1)
  }

  return ((rows ?? []) as unknown as MentorRow[]).map((m) => {
    const sessions = sessionCount.get(m.id) ?? 0
    const students = studentCount.get(m.id) ?? 0
    return {
      id: m.id,
      name: m.profiles?.full_name ?? "",
      email: m.profiles?.email ?? "",
      phone: m.profiles?.phone ?? "",
      avatar: m.profiles?.avatar_url || DEFAULT_AVATAR,
      expertise: m.expertise ?? "",
      experience: formatYears(m.experience_years),
      address: m.address ?? "",
      rating: m.rating ?? 0,
      status: m.status === "inactive" ? "Inactive" : "Active",
      joinDate: m.join_date ? new Date(m.join_date).toLocaleDateString("en-US") : "",
      sessions,
      students,
      stats: {
        totalSessions: sessions,
        studentsAssigned: students,
        avgPerMonth: Math.round(sessions / monthsSince(m.join_date)),
      },
      quickActions: QUICK_ACTIONS,
    }
  })
}

export async function createMentor(
  input: MentorInput,
): Promise<{ id?: string; tempPassword?: string; error?: string }> {
  try {
    await assertAdmin()
  } catch (e) {
    return { error: (e as Error).message }
  }
  const admin = createAdminClient()

  const password = generatePassword()
  const dbStatus = uiToDbStatus(input.status)

  const { data, error } = await admin.auth.admin.createUser({
    email: input.email.trim(),
    password,
    email_confirm: true,
    user_metadata: { full_name: input.name.trim(), role: "mentor" },
  })
  if (error || !data.user) {
    return { error: error?.message ?? "Failed to create mentor." }
  }
  const id = data.user.id

  const { error: pErr } = await admin
    .from("profiles")
    .update({ full_name: input.name.trim(), phone: input.phone.trim(), status: dbStatus })
    .eq("id", id)
  if (pErr) return { error: pErr.message }

  const { error: mErr } = await admin.from("mentors").upsert({
    id,
    expertise: input.expertise.trim() || null,
    experience_years: parseYears(input.experience),
    address: input.address.trim() || null,
    status: dbStatus,
    join_date: new Date().toISOString().slice(0, 10),
    rating: 0,
  })
  if (mErr) return { error: mErr.message }

  return { id, tempPassword: password }
}

export async function updateMentor(
  id: string,
  input: MentorInput,
): Promise<{ error?: string }> {
  try {
    await assertAdmin()
  } catch (e) {
    return { error: (e as Error).message }
  }
  const admin = createAdminClient()
  const dbStatus = uiToDbStatus(input.status)

  const { data: current } = await admin
    .from("profiles")
    .select("email")
    .eq("id", id)
    .single()

  const newEmail = input.email.trim()
  if (current && newEmail && newEmail !== current.email) {
    const { error } = await admin.auth.admin.updateUserById(id, {
      email: newEmail,
      email_confirm: true,
    })
    if (error) return { error: error.message }
  }

  const { error: pErr } = await admin
    .from("profiles")
    .update({
      full_name: input.name.trim(),
      email: newEmail,
      phone: input.phone.trim(),
      status: dbStatus,
    })
    .eq("id", id)
  if (pErr) return { error: pErr.message }

  const { error: mErr } = await admin
    .from("mentors")
    .update({
      expertise: input.expertise.trim() || null,
      experience_years: parseYears(input.experience),
      address: input.address.trim() || null,
      status: dbStatus,
    })
    .eq("id", id)
  if (mErr) return { error: mErr.message }

  return {}
}

export async function deleteMentor(id: string): Promise<{ error?: string }> {
  try {
    await assertAdmin()
  } catch (e) {
    return { error: (e as Error).message }
  }
  const admin = createAdminClient()
  // Cascades: auth.users → profiles → mentors.
  const { error } = await admin.auth.admin.deleteUser(id)
  if (error) return { error: error.message }
  return {}
}
