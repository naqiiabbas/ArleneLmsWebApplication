"use server"

import { randomUUID } from "node:crypto"
import { createAdminClient } from "@/lib/supabase/admin"
import { assertAdmin } from "@/lib/data/guards"
import type {
  GeneralData,
  NotificationData,
  ProfileData,
  SecurityData,
  SettingsData,
} from "@/lib/data/settings.types"

const AVATARS_BUCKET = "avatars"

export async function getSettings(): Promise<SettingsData> {
  const { userId } = await assertAdmin()
  const admin = createAdminClient()

  const [sys, prof, notif] = await Promise.all([
    admin.from("system_settings").select("key, value"),
    admin.from("profiles").select("full_name, email, phone, avatar_url, bio").eq("id", userId).single(),
    admin
      .from("notification_preferences")
      .select("email_enabled, in_app_enabled, type_overrides")
      .eq("profile_id", userId)
      .maybeSingle(),
  ])

  const s = new Map<string, unknown>((sys.data ?? []).map((r) => [r.key, r.value]))
  const get = <T,>(key: string, def: T): T => (s.has(key) ? (s.get(key) as T) : def)

  const p = prof.data
  const nameParts = (p?.full_name ?? "").split(" ").filter(Boolean)
  const firstName = nameParts[0] ?? ""
  const lastName = nameParts.slice(1).join(" ")
  const overrides = (notif.data?.type_overrides ?? {}) as Record<string, boolean>

  return {
    general: {
      siteName: get("site.name", "Mentorship Admin Portal"),
      siteEmail: get("site.email", ""),
      timezone: get("site.timezone", "UTC-5 (Eastern)"),
      language: get("site.language", "English"),
      allowRegistrations: !!get("registration.allow_new", false),
      requireApproval: !!get("registration.require_approval", false),
    },
    notifications: {
      emailNotifications: notif.data?.email_enabled ?? true,
      pushNotifications: notif.data?.in_app_enabled ?? true,
      weeklyReports: !!overrides.weekly_reports,
      monthlyReports: !!overrides.monthly_reports,
    },
    security: {
      twoFactorEnabled: !!get("security.two_factor_enabled", false),
      sessionTimeout: String(get("security.session_timeout_minutes", "30")),
    },
    profile: {
      firstName,
      lastName,
      email: p?.email ?? "",
      phone: p?.phone ?? "",
      bio: p?.bio ?? "",
      avatarUrl: p?.avatar_url ?? "",
    },
  }
}

async function upsertSettings(
  entries: [string, string | boolean][],
): Promise<{ error?: string }> {
  const { userId } = await assertAdmin()
  const admin = createAdminClient()
  const rows = entries.map(([key, value]) => ({ key, value, updated_by: userId }))
  const { error } = await admin.from("system_settings").upsert(rows, { onConflict: "key" })
  return error ? { error: error.message } : {}
}

export async function saveGeneral(data: GeneralData): Promise<{ error?: string }> {
  try {
    return await upsertSettings([
      ["site.name", data.siteName.trim()],
      ["site.email", data.siteEmail.trim()],
      ["site.timezone", data.timezone.trim()],
      ["site.language", data.language.trim()],
      ["registration.allow_new", data.allowRegistrations],
      ["registration.require_approval", data.requireApproval],
    ])
  } catch (e) {
    return { error: (e as Error).message }
  }
}

export async function saveSecurity(data: SecurityData): Promise<{ error?: string }> {
  try {
    return await upsertSettings([
      ["security.two_factor_enabled", data.twoFactorEnabled],
      ["security.session_timeout_minutes", data.sessionTimeout.trim()],
    ])
  } catch (e) {
    return { error: (e as Error).message }
  }
}

export async function saveNotifications(data: NotificationData): Promise<{ error?: string }> {
  let me
  try {
    me = await assertAdmin()
  } catch (e) {
    return { error: (e as Error).message }
  }
  const admin = createAdminClient()
  const { error } = await admin.from("notification_preferences").upsert(
    {
      profile_id: me.userId,
      email_enabled: data.emailNotifications,
      in_app_enabled: data.pushNotifications,
      type_overrides: { weekly_reports: data.weeklyReports, monthly_reports: data.monthlyReports },
    },
    { onConflict: "profile_id" },
  )
  return error ? { error: error.message } : {}
}

/** Save the current admin's own profile (FormData carries fields + optional avatar). */
export async function saveProfile(formData: FormData): Promise<{ error?: string }> {
  let me
  try {
    me = await assertAdmin()
  } catch (e) {
    return { error: (e as Error).message }
  }
  const admin = createAdminClient()

  const firstName = ((formData.get("firstName") as string) || "").trim()
  const lastName = ((formData.get("lastName") as string) || "").trim()
  const email = ((formData.get("email") as string) || "").trim()
  const phone = ((formData.get("phone") as string) || "").trim()
  const bio = ((formData.get("bio") as string) || "").trim()
  const fullName = [firstName, lastName].filter(Boolean).join(" ")

  // Avatar: new upload, removal, or unchanged.
  const file = formData.get("avatar")
  const removeAvatar = formData.get("removeAvatar") === "true"
  let avatarUrl: string | null | undefined = undefined
  if (file instanceof File && file.size > 0) {
    const ext = file.name.includes(".") ? file.name.split(".").pop() : "png"
    const path = `${me.userId}/${randomUUID()}.${ext}`
    const bytes = new Uint8Array(await file.arrayBuffer())
    const { error: upErr } = await admin.storage
      .from(AVATARS_BUCKET)
      .upload(path, bytes, { contentType: file.type || "image/png", upsert: false })
    if (upErr) return { error: upErr.message }
    avatarUrl = admin.storage.from(AVATARS_BUCKET).getPublicUrl(path).data.publicUrl
  } else if (removeAvatar) {
    avatarUrl = null
  }

  // Sync auth email if it changed.
  const { data: cur } = await admin.from("profiles").select("email").eq("id", me.userId).single()
  if (email && email !== cur?.email) {
    const { error } = await admin.auth.admin.updateUserById(me.userId, {
      email,
      email_confirm: true,
    })
    if (error) return { error: error.message }
  }

  const patch: {
    full_name: string
    email: string
    phone: string
    bio: string
    avatar_url?: string | null
  } = { full_name: fullName, email, phone, bio }
  if (avatarUrl !== undefined) patch.avatar_url = avatarUrl

  const { error } = await admin.from("profiles").update(patch).eq("id", me.userId)
  return error ? { error: error.message } : {}
}
