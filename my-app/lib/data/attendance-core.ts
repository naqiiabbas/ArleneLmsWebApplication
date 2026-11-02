// Attendance building blocks shared by the kiosk, Student Management and the
// session-status actions (mentor + admin).
//
// Deliberately NOT a "use server" module: every export of such a module is a
// browser-callable server action, and these take a service-role client with no
// permission checks. Callers must authorize first.
import "server-only"
import type { createAdminClient } from "@/lib/supabase/admin"
import { logActivity } from "@/lib/data/audit"

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
  // enrolled_at restarts so sessions missed while withdrawn don't count as absences.
  const { error } = past
    ? await admin.from("enrollments").update({ status: "active", enrolled_at: new Date().toISOString() }).eq("id", past.id)
    : await admin.from("enrollments").insert({ student_id: studentId, class_id: classId, status: "active" })
  return error ? { error: error.message } : {}
}

/**
 * When a session is completed, record every enrolled student who never checked
 * in as ABSENT. Without this, no-shows have no attendance row at all, so
 * attendance percentages only ever counted the days a student DID attend.
 * Idempotent: students who already have a record for the session are skipped.
 * markedBy is null when the sweep below did it rather than a person.
 */
export async function recordAbsencesForSession(
  admin: AdminClient,
  sessionId: string,
  markedBy: string | null,
): Promise<{ absent: number; error?: string }> {
  const { data: session } = await admin
    .from("class_sessions")
    .select("id, class_id, session_date, title, end_at, class:classes ( name )")
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
      .eq("status", "active")
      // Someone who joined after the session ended can't have missed it.
      .lte("enrolled_at", session.end_at),
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
  const { data: inserted, error } = await admin.from("attendance_records").upsert(
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
  ).select("student_id") // only the rows really inserted, so a racing sweep can't log them twice
  if (error) return { absent: 0, error: error.message }

  const absent = inserted?.length ?? 0
  if (absent) {
    const name = session.title || (session as unknown as { class: { name: string | null } | null }).class?.name || "Session"
    await logActivity(
      {
        actorId: markedBy,
        action: markedBy ? "Recorded absences" : "Marked absent automatically",
        targetType: "session",
        targetId: sessionId,
        description: `${name}, ${session.session_date}: ${absent} student${absent === 1 ? "" : "s"} marked absent`,
        metadata: { studentIds: inserted?.map((r) => r.student_id) },
      },
      admin,
    )
  }
  return { absent }
}

/**
 * Close every session whose end time has passed: no-shows become ABSENT and the
 * session becomes completed, so absent is the default without anyone having to
 * press Complete. There's no scheduler, so the pages that show attendance call
 * this before reading. Completing the session means it only ever runs once, and
 * a record an admin later deletes isn't recreated. Best-effort: a failure must
 * not break the page, and the next read retries.
 */
export async function sweepEndedSessions(admin: AdminClient): Promise<void> {
  try {
    const { data: ended } = await admin
      .from("class_sessions")
      .select("id")
      .in("status", ["scheduled", "in_progress"])
      .lt("end_at", new Date().toISOString())
      .order("end_at")
      .limit(200)
    for (const s of ended ?? []) {
      const { error } = await recordAbsencesForSession(admin, s.id, null)
      if (error) continue // stays open so the next read tries again
      await admin
        .from("class_sessions")
        .update({ status: "completed" })
        .eq("id", s.id)
        .in("status", ["scheduled", "in_progress"])
    }
  } catch {
    /* best-effort */
  }
}
