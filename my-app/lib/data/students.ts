"use server"

import { randomBytes } from "node:crypto"
import { createAdminClient } from "@/lib/supabase/admin"
import { assertAdmin } from "@/lib/data/guards"
import type { StudentInput, StudentStatus, UIStudent } from "@/lib/data/students.types"

type Admin = ReturnType<typeof createAdminClient>

const QUICK_ACTIONS = ["Send Message", "View Sessions", "Download Report"]
const DEFAULT_AVATAR = "/images/avatar1.png"

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

async function genUniqueAttendanceCode(admin: Admin): Promise<string> {
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

/** Replace the student's mentor assignment. Returns whether the name matched. */
async function setMentorAssignment(
  admin: Admin,
  studentId: string,
  mentorName: string,
  assignedBy: string,
): Promise<{ provided: boolean; matched: boolean }> {
  const provided = !!mentorName.trim()
  await admin.from("mentor_student_assignments").delete().eq("student_id", studentId)
  if (!provided) return { provided: false, matched: false }

  const { data: mentor } = await admin
    .from("profiles")
    .select("id")
    .eq("role", "mentor")
    .ilike("full_name", mentorName.trim())
    .limit(1)
    .maybeSingle()
  if (!mentor) return { provided: true, matched: false }

  await admin.from("mentor_student_assignments").insert({
    mentor_id: mentor.id,
    student_id: studentId,
    is_primary: true,
    status: "active",
    assigned_by: assignedBy,
  })
  return { provided: true, matched: true }
}

type StudentRow = {
  id: string
  course: string | null
  address: string | null
  enrollment_date: string | null
  gpa: number | null
  status: string
  profiles: {
    full_name: string | null
    email: string | null
    phone: string | null
    avatar_url: string | null
  } | null
}

export async function listStudents(): Promise<UIStudent[]> {
  await assertAdmin()
  const admin = createAdminClient()

  const [{ data: rows, error }, { data: assigns }, { data: att }] = await Promise.all([
    admin
      .from("students")
      .select(
        "id, course, address, enrollment_date, gpa, status, profiles ( full_name, email, phone, avatar_url )",
      )
      .order("created_at", { ascending: false }),
    admin
      .from("mentor_student_assignments")
      // Disambiguate: this table has two FKs to profiles (mentor_id, assigned_by).
      .select("student_id, mentor:profiles!mentor_student_assignments_mentor_id_fkey ( full_name )")
      .eq("status", "active")
      .eq("is_primary", true),
    admin.from("student_attendance_summary").select("student_id, attendance_pct"),
  ])
  if (error) throw new Error(error.message)

  const mentorByStudent = new Map<string, string>()
  for (const a of (assigns ?? []) as unknown as {
    student_id: string
    mentor: { full_name: string | null } | null
  }[]) {
    if (a.student_id && a.mentor?.full_name)
      mentorByStudent.set(a.student_id, a.mentor.full_name)
  }
  const attByStudent = new Map<string, number>()
  for (const a of (att ?? []) as { student_id: string | null; attendance_pct: number | null }[]) {
    if (a.student_id != null) attByStudent.set(a.student_id, Math.round(a.attendance_pct ?? 0))
  }

  return ((rows ?? []) as unknown as StudentRow[]).map((s) => ({
    id: s.id,
    name: s.profiles?.full_name ?? "",
    email: s.profiles?.email ?? "",
    phone: s.profiles?.phone ?? "",
    avatar: s.profiles?.avatar_url || DEFAULT_AVATAR,
    mentor: mentorByStudent.get(s.id) ?? "",
    course: s.course ?? "",
    status: s.status === "inactive" ? "Inactive" : "Active",
    enrollmentDate: s.enrollment_date
      ? new Date(s.enrollment_date).toLocaleDateString("en-US")
      : "",
    performance: {
      attendance: attByStudent.get(s.id) ?? 0,
      grade: gradeFromGpa(s.gpa),
    },
    quickActions: QUICK_ACTIONS,
    address: s.address ?? "",
  }))
}

export async function createStudent(
  input: StudentInput,
): Promise<{ id?: string; tempPassword?: string; mentorUnmatched?: boolean; error?: string }> {
  let me
  try {
    me = await assertAdmin()
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
    user_metadata: { full_name: input.name.trim(), role: "student" },
  })
  if (error || !data.user) {
    return { error: error?.message ?? "Failed to create student." }
  }
  const id = data.user.id

  const { error: pErr } = await admin
    .from("profiles")
    .update({ full_name: input.name.trim(), phone: input.phone.trim(), status: dbStatus })
    .eq("id", id)
  if (pErr) return { error: pErr.message }

  const attendanceCode = await genUniqueAttendanceCode(admin)
  const { error: sErr } = await admin.from("students").upsert({
    id,
    course: input.course.trim() || null,
    address: input.address.trim() || null,
    status: dbStatus,
    enrollment_date: new Date().toISOString().slice(0, 10),
    attendance_code: attendanceCode,
  })
  if (sErr) return { error: sErr.message }

  const mentor = await setMentorAssignment(admin, id, input.mentor, me.userId)

  return { id, tempPassword: password, mentorUnmatched: mentor.provided && !mentor.matched }
}

export async function updateStudent(
  id: string,
  input: StudentInput,
): Promise<{ mentorUnmatched?: boolean; error?: string }> {
  let me
  try {
    me = await assertAdmin()
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

  const { error: sErr } = await admin
    .from("students")
    .update({
      course: input.course.trim() || null,
      address: input.address.trim() || null,
      status: dbStatus,
    })
    .eq("id", id)
  if (sErr) return { error: sErr.message }

  const mentor = await setMentorAssignment(admin, id, input.mentor, me.userId)

  return { mentorUnmatched: mentor.provided && !mentor.matched }
}

export async function deleteStudent(id: string): Promise<{ error?: string }> {
  try {
    await assertAdmin()
  } catch (e) {
    return { error: (e as Error).message }
  }
  const admin = createAdminClient()
  // Cascades: auth.users → profiles → students → assignments/attendance.
  const { error } = await admin.auth.admin.deleteUser(id)
  if (error) return { error: error.message }
  return {}
}
