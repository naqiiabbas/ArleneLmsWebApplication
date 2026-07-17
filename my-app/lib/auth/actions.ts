"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
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

  redirect(PORTAL_HOME[portal])
}

/** Sign out and return to the given portal's login (or the public home). */
export async function signOut(portal?: Portal): Promise<void> {
  const supabase = await createClient()
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
 * from the /auth/reset-password page the reset email links to.
 */
export async function updatePassword(newPassword: string): Promise<AuthResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Your reset link has expired. Request a new one." }
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) return { error: error.message }
  return { sent: true }
}
