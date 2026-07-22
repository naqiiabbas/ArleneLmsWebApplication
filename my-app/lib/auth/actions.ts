"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { logActivity } from "@/lib/data/audit"
import {
  PORTAL_ROLES,
  PORTAL_HOME,
  LOGIN_ROUTE,
  type Portal,
} from "@/lib/auth/config"

export type AuthResult = { error?: string; sent?: boolean }

/**
 * Sign in with email + password through a specific portal. On success the DB
 * role is verified against the portal and the user is redirected to its home.
 * Returns an error message on failure (redirect throws, so it never returns
 * on success).
 */
export async function signIn(
  portal: Portal,
  email: string,
  password: string,
): Promise<AuthResult> {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  })
  if (error || !data.user) {
    await logActivity({ action: "Failed login", status: "failed", description: email.trim(), targetType: "auth" })
    return { error: error?.message ?? "Invalid email or password." }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", data.user.id)
    .single()

  if (!profile) {
    await supabase.auth.signOut()
    return { error: "No profile is linked to this account. Contact an administrator." }
  }
  if (profile.status !== "active") {
    await supabase.auth.signOut()
    return { error: "This account is not active. Contact an administrator." }
  }
  if (!PORTAL_ROLES[portal].includes(profile.role)) {
    await supabase.auth.signOut()
    return { error: `This account is not authorized for the ${portal} portal.` }
  }

  // Best-effort last-login stamp; never block sign-in on it.
  await supabase
    .from("profiles")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", data.user.id)

  await logActivity({ actorId: data.user.id, actorRole: profile.role, action: "Logged in", targetType: "auth" })

  redirect(PORTAL_HOME[portal])
}

/** Sign out and return to the given portal's login (or the public home). */
export async function signOut(portal?: Portal): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) await logActivity({ actorId: user.id, action: "Logged out", targetType: "auth" })
  await supabase.auth.signOut()
  redirect(portal ? LOGIN_ROUTE[portal] : "/")
}

/** Send a password-reset email that links back to /auth/reset-password. */
export async function sendPasswordReset(email: string): Promise<AuthResult> {
  const supabase = await createClient()
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${site}/auth/callback?next=/auth/reset-password`,
  })
  if (error) return { error: error.message }
  return { sent: true }
}

/**
 * Set a new password for the user in the current (recovery) session. Called
 * from the /auth/reset-password page the reset email links to, and from the
 * student create-password step after the OTP is verified.
 */
export async function updatePassword(newPassword: string): Promise<AuthResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Your reset session has expired. Please request a new code." }
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) return { error: error.message }
  return { sent: true }
}

/**
 * Verify the 6-digit recovery code from the reset email. On success a recovery
 * session is established (cookies), so the next step can set a new password.
 */
export async function verifyRecoveryCode(
  email: string,
  code: string,
): Promise<AuthResult> {
  const c = code.trim()
  if (!/^\d{6}$/.test(c)) return { error: "Please enter the 6-digit code." }
  const supabase = await createClient()

  const { error } = await supabase.auth.verifyOtp({
    email: email.trim(),
    token: c,
    type: "recovery",
  })
  if (error) return { error: "Invalid or expired code. Please try again." }
  return { sent: true }
}

/**
 * Start the reset/first-time-setup flow from a Student ID: resolve the student's
 * email, then send them a recovery code. Returns the email so the client can
 * carry it into the verify step. No user enumeration beyond the ID itself.
 */
export async function startResetByStudentId(
  studentId: string,
): Promise<{ email?: string; error?: string }> {
  const id = studentId.trim()
  if (!id) return { error: "Please enter your Student ID." }
  const admin = createAdminClient()

  const { data: student } = await admin
    .from("students")
    .select("profile:profiles ( email ) ")
    .eq("student_code", id)
    .maybeSingle()
  const email = (student as unknown as { profile: { email: string | null } | null } | null)?.profile?.email
  if (!email) return { error: "No account was found for that Student ID." }

  const res = await sendPasswordReset(email)
  if (res.error) return { error: res.error }
  return { email }
}
