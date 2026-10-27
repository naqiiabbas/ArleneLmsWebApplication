// Attendance building blocks shared by the kiosk, Student Management and the
// session-status actions (mentor + admin).
//
// Deliberately NOT a "use server" module: every export of such a module is a
// browser-callable server action, and these take a service-role client with no
// permission checks. Callers must authorize first.
import "server-only"
import type { createAdminClient } from "@/lib/supabase/admin"

type AdminClient = ReturnType<typeof createAdminClient>

/**
 * Make `classId` the student's single active class ("" = not enrolled anywhere).
 * Enrollment is what links a student to a class's sessions — the kiosk, the
 * student calendar and the admin session list all go through it. Nothing used
 * to create these rows, so every kiosk check-in failed with "no session today".
 */
export async function setStudentEnrollment(
  admin: AdminClient,
  studentId: string,
  classId: string,
): Promise<{ error?: string }> {
  const { data: current, error: readErr } = await admin
    .from("enrollments")
    .select("id, class_id")
    .eq("student_id", studentId)
    .eq("status", "active")
  if (readErr) return { error: readErr.message }

  const rows = current ?? []
  if (classId && rows.length === 1 && rows[0].class_id === classId) return {} // unchanged

  // End other active enrollments rather than deleting them (keeps history).
  const others = rows.filter((r) => r.class_id !== classId).map((r) => r.id)
  if (others.length) {
    const { error } = await admin.from("enrollments").update({ status: "withdrawn" }).in("id", others)
    if (error) return { error: error.message }
  }
  if (!classId || rows.some((r) => r.class_id === classId)) return {}

  const { data: cls } = await admin.from("classes").select("id").eq("id", classId).maybeSingle()
  if (!cls) return { error: "The selected class no longer exists." }

  // Re-activate a previous enrollment in the same class if there is one.
  const { data: past } = await admin
    .from("enrollments")
    .select("id")
    .eq("student_id", studentId)
    .eq("class_id", classId)
    .limit(1)
    .maybeSingle()
  const { error } = past
    ? await admin.from("enrollments").update({ status: "active" }).eq("id", past.id)
    : await admin.from("enrollments").insert({ student_id: studentId, class_id: classId, status: "active" })
  return error ? { error: error.message } : {}
}

/**
 * When a session is completed, record every enrolled student who never checked
 * in as ABSENT. Without this, no-shows have no attendance row at all, so
 * attendance percentages only ever counted the days a student DID attend.
 * Idempotent: students who already have a record for the session are skipped.
 */
export async function recordAbsencesForSession(
  admin: AdminClient,
  sessionId: string,
  markedBy: string | null,
): Promise<{ absent: number; error?: string }> {
  const { data: session } = await admin
    .from("class_sessions")
    .select("id, class_id, session_date")
    .eq("id", sessionId)
    .maybeSingle()
  if (!session) return { absent: 0, error: "Session not found." }

  const [{ data: enrolled }, { data: existing }] = await Promise.all([
    // Only ACTIVE students are expected at sessions; a deactivated student
    // still enrolled shouldn't pile up absences.
    admin
      .from("enrollments")
      .select("student_id, student:students ( profile:profiles ( status ) )")
      .eq("class_id", session.class_id)
      .eq("status", "active"),
    admin.from("attendance_records").select("student_id").eq("session_id", sessionId),
  ])
  const have = new Set((existing ?? []).map((r) => r.student_id))
  const expected = ((enrolled ?? []) as unknown as {
    student_id: string
    student: { profile: { status: string } | null } | null
  }[])
    .filter((e) => e.student?.profile?.status === "active")
    .map((e) => e.student_id)
  const missing = [...new Set(expected)].filter((id) => !have.has(id))
  if (!missing.length) return { absent: 0 }

  const now = new Date().toISOString()
  const { error } = await admin.from("attendance_records").upsert(
    missing.map((student_id) => ({
      student_id,
      session_id: sessionId,
      class_id: session.class_id,
      attendance_date: session.session_date,
      marked_at: now,
      marked_by: markedBy,
      status: "absent" as const,
      method: "manual" as const,
    })),
    // A kiosk check-in racing this must win, never be overwritten by "absent".
    { onConflict: "student_id,session_id", ignoreDuplicates: true },
  )
  return error ? { absent: 0, error: error.message } : { absent: missing.length }
}
