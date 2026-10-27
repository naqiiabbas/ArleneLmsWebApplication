// Profile-photo storage shared by every portal's profile/settings screen.
//
// Deliberately NOT a "use server" module (see role-records.ts): these helpers
// take a service-role client and do no permission checks, so only actions that
// have already authorized the caller may use them.
import "server-only"
import { randomUUID } from "node:crypto"
import type { createAdminClient } from "@/lib/supabase/admin"

type AdminClient = ReturnType<typeof createAdminClient>

export const AVATARS_BUCKET = "avatars"
export const AVATAR_MAX_BYTES = 5 * 1024 * 1024

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
}

/** Error message for an unacceptable avatar file, or null if it is fine. */
export function avatarFileError(file: File): string | null {
  if (!EXT_BY_TYPE[file.type]) return "Profile photo must be a JPG, PNG, WebP or GIF image."
  if (file.size > AVATAR_MAX_BYTES) return "Profile photo must be 5 MB or smaller."
  return null
}

/** Upload `file` as `userId`'s photo; returns its public URL. Validate first. */
export async function storeAvatar(admin: AdminClient, userId: string, file: File): Promise<string> {
  const path = `${userId}/${randomUUID()}.${EXT_BY_TYPE[file.type] ?? "png"}`
  const bytes = new Uint8Array(await file.arrayBuffer())
  const { error } = await admin.storage
    .from(AVATARS_BUCKET)
    .upload(path, bytes, { contentType: file.type, upsert: false })
  if (error) throw new Error(error.message)
  return admin.storage.from(AVATARS_BUCKET).getPublicUrl(path).data.publicUrl
}

/**
 * Best-effort delete of a replaced photo. Only touches objects inside the
 * user's own folder of our bucket, so external or stock URLs are left alone.
 */
export async function removeAvatarObject(admin: AdminClient, userId: string, url: string | null | undefined) {
  if (!url) return
  const marker = `/storage/v1/object/public/${AVATARS_BUCKET}/`
  const at = url.indexOf(marker)
  if (at === -1) return
  const path = decodeURIComponent(url.slice(at + marker.length).split("?")[0])
  if (!path.startsWith(`${userId}/`)) return
  try {
    await admin.storage.from(AVATARS_BUCKET).remove([path])
  } catch {
    /* an orphaned file must not fail the profile update */
  }
}
