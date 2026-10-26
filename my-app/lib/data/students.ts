"use server"

import { randomBytes } from "node:crypto"
import { createAdminClient } from "@/lib/supabase/admin"
import { assertPermission } from "@/lib/auth/permissions"
import { checkTargetRole } from "@/lib/data/guards"
import { logActivity } from "@/lib/data/audit"
import { ensureStudentRecord } from "@/lib/data/role-records"
import type {
  MentorOption,
  StudentInput,
  StudentStatus,
  UIStudent,
} from "@/lib/data/students.types"

type Admin = ReturnType<typeof createAdminClient>

const QUICK_ACTIONS = ["Send Message", "View Sessions", "Download Report"]
const DEFAULT_AVATAR = "/images/avatar1.png"
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function uiToDbStatus(s: StudentStatus) {
  return s === "Inactive" ? ("inactive" as const) : ("active" as const)
}

function gradeFromGpa(gpa: number | null): string {
  if (gpa == null) return "-"
  if (gpa >= 3.5) return "A"
  if (gpa >= 3.0) return "B"
  if (gpa >= 2.0) return "C"
  if (gpa >= 1.0) return "D"
  return "F"
}

function generatePassword() {
  return "Aa1" + randomBytes(9).toString("base64url")
}

/** Server-side twin of the form's checks — the form can be bypassed. */
function validateInput(input: StudentInput): string | null {
  if (!input.name?.trim()) return "Full name is required."
  if (!input.email?.trim()) return "Email is required."
  if (!EMAIL_RE.test(input.email.trim())) return "Enter a valid email address."
  if (!input.phone?.trim()) return "Phone is required."
  return null
}

/** Error message unless `mentorId` is blank or an existing mentor. */
async function checkMentor(admin: Admin, mentorId: string): Promise<string | null> {
  if (!mentorId) return null
  return (await checkTargetRole(admin, mentorId, "mentor"))
    ? "The selected mentor no longer exists. Pick another mentor."
    : null
}

/**
 * Make `mentorId` the student's single primary mentor ("" = unassigned).
 * Leaves existing rows untouched when nothing changed, so an edit that only
 * touches the address doesn't reset assigned_at / assigned_by history.
 */
async function setPrimaryMentor(
  admin: Admin,
  studentId: string,
  mentorId: string,
  assignedBy: string,
): Promise<{ error?: string }> {
  const { data: current, error: readErr } = await admin
    .from("mentor_student_assignments")
    .select("mentor_id")
    .eq("student_id", studentId)
    .eq("is_primary", true)
    .eq("status", "active")
  if (readErr) return { error: readErr.message }

  const ids = (current ?? []).map((r) => r.mentor_id)
  const unchanged = mentorId ? ids.length === 1 && ids[0] === mentorId : ids.length === 0
  if (unchanged) return {}

  const { error: delErr } = await admin
    .from("mentor_student_assignments")
    .delete()
    .eq("student_id", studentId)
  if (delErr) return { error: delErr.message }
  if (!mentorId) return {}

  const { error } = await admin.from("mentor_student_assignments").insert({
    mentor_id: mentorId,
    student_id: studentId,
    is_primary: true,
    status: "active",
    assigned_by: assignedBy,
  })
  return error ? { error: error.message } : {}
}

type StudentFields = {
  student_code: string | null
  attendance_code: string | null
  course: string | null
  address: string | null
  enrollment_date: string | null
  gpa: number | null
}

type ProfileRow = {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  avatar_url: string | null
  status: string
  // One-to-one embed (students.id is the PK referencing profiles.id); typed
  // loosely because PostgREST may return it as an object or a 1-element array.
  students: StudentFields | StudentFields[] | null
}

export async function listStudents(): Promise<UIStudent[]> {
  await assertPermission("students.view")
  const admin = createAdminClient()

  // Driven by profiles, not the students table. The ensure_role_row trigger
  // normally creates the students row, but listing from profiles means a
  // student account can never vanish from this screen if that row is missing
  // (e.g. accounts predating the trigger); saving it then backfills the row.
  const [{ data: rows, error }, { data: assigns }, { data: att }] = await Promise.all([
    admin
      .from("profiles")
      .select(
        "id, full_name, email, phone, avatar_url, status, students ( student_code, attendance_code, course, address, enrollment_date, gpa )",
      )
      .eq("role", "student")
      .order("created_at", { ascending: false }),
    admin
      .from("mentor_student_assignments")
      // Disambiguate: this table has two FKs to profiles (mentor_id, assigned_by).
      .select("student_id, mentor_id, mentor:profiles!mentor_student_assignments_mentor_id_fkey ( full_name )")
      .eq("status", "active")
      .eq("is_primary", true),
    admin.from("student_attendance_summary").select("student_id, attendance_pct"),
  ])
  if (error) throw new Error(error.message)

  const mentorByStudent = new Map<string, { id: string; name: string }>()
  for (const a of (assigns ?? []) as unknown as {
    student_id: string
    mentor_id: string
    mentor: { full_name: string | null } | null
  }[]) {
    if (a.student_id && a.mentor_id)
      mentorByStudent.set(a.student_id, { id: a.mentor_id, name: a.mentor?.full_name ?? "" })
  }
  const attByStudent = new Map<string, number>()
  for (const a of (att ?? []) as { student_id: string | null; attendance_pct: number | null }[]) {
    if (a.student_id != null) attByStudent.set(a.student_id, Math.round(a.attendance_pct ?? 0))
  }

  return ((rows ?? []) as unknown as ProfileRow[]).map((p) => {
    const s = (Array.isArray(p.students) ? p.students[0] : p.students) ?? null
    const mentor = mentorByStudent.get(p.id)
    return {
      id: p.id,
      name: p.full_name ?? "",
      email: p.email ?? "",
      phone: p.phone ?? "",
      avatar: p.avatar_url || DEFAULT_AVATAR,
      mentor: mentor?.name ?? "",
      mentorId: mentor?.id ?? "",
      course: s?.course ?? "",
      // profiles.status is what sign-in and the middleware enforce.
      status: p.status === "active" ? "Active" : "Inactive",
      enrollmentDate: s?.enrollment_date
        ? new Date(s.enrollment_date).toLocaleDateString("en-US", { timeZone: "UTC" })
        : "",
      performance: {
        attendance: attByStudent.get(p.id) ?? 0,
        grade: gradeFromGpa(s?.gpa ?? null),
      },
      quickActions: QUICK_ACTIONS,
      address: s?.address ?? "",
      studentCode: s?.student_code ?? "",
      attendanceCode: s?.attendance_code ?? "",
    }
  })
}

/** Mentors available in the Add/Edit Student dropdown. */
export async function listMentorOptions(): Promise<MentorOption[]> {
  await assertPermission("students.manage")
  const admin = createAdminClient()
  const { data, error } = await admin
    .from("profiles")
    .select("id, full_name, status")
    .eq("role", "mentor")
    .order("full_name", { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []).map((m) => ({
    id: m.id,
    name: m.full_name || "(unnamed mentor)",
    active: m.status === "active",
  }))
}

export async function createStudent(
  input: StudentInput,
): Promise<{ id?: string; tempPassword?: string; error?: string }> {
  let me
  try {
    me = await assertPermission("students.manage")
  } catch (e) {
    return { error: (e as Error).message }
  }
  const invalid = validateInput(input)
  if (invalid) return { error: invalid }

  const admin = createAdminClient()
  // Check everything that can be checked BEFORE the login account exists.
  const badMentor = await checkMentor(admin, input.mentorId)
  if (badMentor) return { error: badMentor }

  const password = generatePassword()
  const dbStatus = uiToDbStatus(input.status)

  const { data, error } = await admin.auth.admin.createUser({
    email: input.email.trim(),
    password,
    email_confirm: true,
    user_metadata: { full_name: input.name.trim(), role: "student" },
  })
  if (error || !data.user) {
    return { error: error?.message ?? "Failed to create student." }
  }
  const id = data.user.id

  // Any failure from here would otherwise leave a login with no student
  // record: invisible on this page, yet its email can't be reused. Undo it.
  const rollback = async (msg: string) => {
    await admin.auth.admin.deleteUser(id)
    return { error: `${msg} The student was not created.` }
  }

  try {
    const { error: pErr } = await admin
      .from("profiles")
      .update({ full_name: input.name.trim(), phone: input.phone.trim(), status: dbStatus })
      .eq("id", id)
    if (pErr) return rollback(pErr.message)

    const rec = await ensureStudentRecord(admin, id, {
      course: input.course.trim() || null,
      address: input.address.trim() || null,
      status: dbStatus,
    })
    if (rec.error) return rollback(rec.error)

    const asg = await setPrimaryMentor(admin, id, input.mentorId, me.userId)
    if (asg.error) return rollback(asg.error)
  } catch (e) {
    return rollback((e as Error).message)
  }

  await logActivity(
    { actorId: me.userId, action: "Created student", targetType: "student", targetId: id, description: input.name.trim() },
    admin,
  )
  return { id, tempPassword: password }
}

export async function updateStudent(
  id: string,
  input: StudentInput,
): Promise<{ error?: string }> {
  let me
  try {
    me = await assertPermission("students.manage")
  } catch (e) {
    return { error: (e as Error).message }
  }
  const invalid = validateInput(input)
  if (invalid) return { error: invalid }

  const admin = createAdminClient()
  const notStudent = await checkTargetRole(admin, id, "student")
  if (notStudent) return { error: notStudent }
  const badMentor = await checkMentor(admin, input.mentorId)
  if (badMentor) return { error: badMentor }
  const dbStatus = uiToDbStatus(input.status)

  const { data: current } = await admin
    .from("profiles")
    .select("email")
    .eq("id", id)
    .single()

  const newEmail = input.email.trim()
  if (current && newEmail !== current.email) {
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

  // Saves the fields and backfills a missing Student ID / PIN / enrollment date.
  const rec = await ensureStudentRecord(admin, id, {
    course: input.course.trim() || null,
    address: input.address.trim() || null,
    status: dbStatus,
  })
  if (rec.error) return { error: rec.error }

  const asg = await setPrimaryMentor(admin, id, input.mentorId, me.userId)
  if (asg.error) return { error: asg.error }

  await logActivity(
    { actorId: me.userId, action: "Updated student", targetType: "student", targetId: id, description: input.name.trim() },
    admin,
  )
  return {}
}

export async function deleteStudent(id: string): Promise<{ error?: string }> {
  let me
  try {
    me = await assertPermission("students.manage")
  } catch (e) {
    return { error: (e as Error).message }
  }
  const admin = createAdminClient()
  const notStudent = await checkTargetRole(admin, id, "student")
  if (notStudent) return { error: notStudent }
  const { data: victim } = await admin.from("profiles").select("full_name").eq("id", id).single()
  // Cascades: auth.users → profiles → students → assignments/attendance.
  const { error } = await admin.auth.admin.deleteUser(id)
  if (error) return { error: error.message }
  await logActivity(
    { actorId: me.userId, action: "Deleted student", targetType: "student", targetId: id, description: victim?.full_name ?? undefined },
    admin,
  )
  return {}
}
