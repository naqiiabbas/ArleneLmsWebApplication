"use server"

// Public, kiosk-facing attendance check-in. There is NO login here — the 4-digit
// attendance code IS the credential (matching the iPad kiosk design). All calls
// use the service-role admin client and are gated only by the code.

import { randomUUID } from "node:crypto"
import { createAdminClient } from "@/lib/supabase/admin"

const ATTENDANCE_BUCKET = "attendance"
const GRACE_MINUTES = 15

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

type StudentRow = { id: string; profile: { full_name: string | null } | null }
type SessionLite = { id: string; class_id: string | null; start_at: string | null }

async function resolveStudent(
  admin: ReturnType<typeof createAdminClient>,
  code: string,
): Promise<StudentRow | null> {
  const { data } = await admin
    .from("students")
    .select("id, profile:profiles ( full_name )")
    .eq("attendance_code", code)
    .maybeSingle()
  return (data as unknown as StudentRow) ?? null
}

/** Validate a 4-digit code and return the matching student's name. */
export async function verifyAttendanceCode(
  code: string,
): Promise<{ studentId?: string; name?: string; error?: string }> {
  const c = code.trim()
  if (!/^\d{4}$/.test(c)) return { error: "Please enter a valid 4-digit code." }
  const admin = createAdminClient()
  const student = await resolveStudent(admin, c)
  if (!student) return { error: "Invalid code. Please try again." }
  return { studentId: student.id, name: student.profile?.full_name ?? "Student" }
}

/**
 * Mark attendance for the student identified by `code`, storing the selfie proof.
 * Resolves today's enrolled session (if any) and records present/late by start time.
 */
export async function markKioskAttendance(
  code: string,
  photoDataUrl: string,
): Promise<{ error?: string; name?: string; status?: "present" | "late" }> {
  const c = code.trim()
  if (!/^\d{4}$/.test(c)) return { error: "Please enter a valid 4-digit code." }
  const admin = createAdminClient()

  const student = await resolveStudent(admin, c)
  if (!student) return { error: "Invalid code. Please try again." }

  const name = student.profile?.full_name ?? "Student"
  const today = ymd(new Date())

  // Find today's session for one of the student's enrolled classes.
  const { data: enr } = await admin
    .from("enrollments")
    .select("class_id")
    .eq("student_id", student.id)
    .eq("status", "active")
  const classIds = (enr ?? []).map((e) => e.class_id).filter(Boolean) as string[]

  let session: SessionLite | null = null
  if (classIds.length) {
    const { data: sess } = await admin
      .from("class_sessions")
      .select("id, class_id, start_at")
      .in("class_id", classIds)
      .eq("session_date", today)
      .order("start_at", { ascending: true })
      .limit(1)
      .maybeSingle()
    session = (sess as unknown as SessionLite | null) ?? null
  }
  if (!session) {
    return { error: "No class session is scheduled for you today." }
  }

  // Upload the selfie proof to the private attendance bucket (best-effort).
  let photoPath: string | null = null
  if (photoDataUrl.startsWith("data:")) {
    const base64 = photoDataUrl.split(",")[1] ?? ""
    if (base64) {
      const bytes = Uint8Array.from(Buffer.from(base64, "base64"))
      const path = `${student.id}/${today}-${randomUUID()}.png`
      const { error: upErr } = await admin.storage
        .from(ATTENDANCE_BUCKET)
        .upload(path, bytes, { contentType: "image/png", upsert: false })
      if (!upErr) photoPath = path
    }
  }

  // present vs late by session start + grace.
  let status: "present" | "late" = "present"
  if (session.start_at) {
    const cutoff = new Date(new Date(session.start_at).getTime() + GRACE_MINUTES * 60_000)
    if (new Date() > cutoff) status = "late"
  }

  const row = {
    student_id: student.id,
    session_id: session.id,
    class_id: session.class_id,
    attendance_date: today,
    marked_at: new Date().toISOString(),
    status,
    method: "selfie" as const,
    code_used: c,
    photo_url: photoPath,
  }

  // Upsert on the (student_id, session_id) unique constraint so re-check-ins update.
  const { error } = await admin
    .from("attendance_records")
    .upsert(row, { onConflict: "student_id,session_id" })
  if (error) return { error: error.message }

  return { name, status }
}
