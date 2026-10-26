// Student companion-row upkeep.
//
// The DB trigger ensure_role_row (init.sql) already creates the bare
// students / mentors row — with a kiosk PIN for students — whenever a profile
// is created as, or changed to, that role. It does NOT assign a Student ID
// (student_code) or an enrollment date, and the row it creates is usually
// already there by the time an action runs. So this module fills in what the
// trigger leaves blank and applies the form's fields to the existing row.
//
// Deliberately NOT a "use server" module: every export of such a module becomes
// a server action callable from the browser. These helpers take a service-role
// client and skip permission checks, so they may only be called from actions
// that have already authorized the caller.
import "server-only"
import type { createAdminClient } from "@/lib/supabase/admin"

type AdminClient = ReturnType<typeof createAdminClient>

const UNIQUE_VIOLATION = "23505"
const STUDENT_CODE_PREFIX = "STU"

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

/** A random 4-digit kiosk PIN not currently held by any student. */
async function freeAttendanceCode(admin: AdminClient): Promise<string> {
  for (let i = 0; i < 30; i++) {
    const code = String(Math.floor(1000 + Math.random() * 9000))
    const { data } = await admin
      .from("students")
      .select("id")
      .eq("attendance_code", code)
      .maybeSingle()
    if (!data) return code
  }
  throw new Error("Could not allocate a unique attendance code.")
}

/** Next sequential Student ID: STU001, STU002, … (widens past STU999). */
async function nextStudentCode(admin: AdminClient): Promise<string> {
  const { data } = await admin
    .from("students")
    .select("student_code")
    .like("student_code", `${STUDENT_CODE_PREFIX}%`)
  let max = 0
  for (const r of data ?? []) {
    const m = /^STU(\d+)$/.exec(r.student_code ?? "")
    if (m) max = Math.max(max, parseInt(m[1], 10))
  }
  return STUDENT_CODE_PREFIX + String(max + 1).padStart(3, "0")
}

type StudentFields = {
  course?: string | null
  address?: string | null
  status?: "active" | "inactive"
}

/**
 * Make sure account `id` has a students row with a Student ID, a kiosk PIN and
 * an enrollment date, and apply `fields` to it. Works whether or not the
 * trigger has already created the row. Fields left undefined are untouched.
 * Both codes are UNIQUE, so a concurrent add can collide — retried.
 */
export async function ensureStudentRecord(
  admin: AdminClient,
  id: string,
  fields: StudentFields = {},
): Promise<{ error?: string }> {
  const given = {
    ...(fields.course !== undefined && { course: fields.course }),
    ...(fields.address !== undefined && { address: fields.address }),
    ...(fields.status !== undefined && { status: fields.status }),
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: existing, error: readErr } = await admin
      .from("students")
      .select("student_code, attendance_code, enrollment_date")
      .eq("id", id)
      .maybeSingle()
    if (readErr) return { error: readErr.message }

    try {
      const { error } = existing
        ? await admin
            .from("students")
            .update({
              ...given,
              ...(!existing.student_code && { student_code: await nextStudentCode(admin) }),
              ...(!existing.attendance_code && { attendance_code: await freeAttendanceCode(admin) }),
              ...(!existing.enrollment_date && { enrollment_date: today() }),
            })
            .eq("id", id)
        : await admin.from("students").insert({
            id,
            ...given,
            student_code: await nextStudentCode(admin),
            attendance_code: await freeAttendanceCode(admin),
            enrollment_date: today(),
          })
      if (!error) return {}
      if (error.code !== UNIQUE_VIOLATION) return { error: error.message }
    } catch (e) {
      return { error: (e as Error).message }
    }
  }
  return { error: "Could not allocate a unique Student ID / attendance code. Please try again." }
}

/**
 * Fill in what the trigger leaves blank for a role (mentors need nothing
 * extra; the trigger's bare row is enough).
 */
export function ensureRoleRecord(
  admin: AdminClient,
  id: string,
  role: string,
): Promise<{ error?: string }> {
  if (role === "student") return ensureStudentRecord(admin, id)
  return Promise.resolve({})
}
