"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { assertMentor } from "@/lib/data/guards"
import type {
  MentorStudent,
  MentorStudentDetail,
  RiskLevel,
} from "@/lib/data/mentor.types"

const DEFAULT_AVATAR = "/images/avatar1.png"

function riskFromAttendance(pct: number): RiskLevel {
  if (pct < 70) return "High"
  if (pct < 85) return "Medium"
  return "Low"
}

type StudentRow = {
  id: string
  academic_year: string | null
  school: string | null
  profiles: {
    full_name: string | null
    email: string | null
    phone: string | null
    avatar_url: string | null
  } | null
}

/** The current mentor's actively-assigned students (list view). */
export async function getAssignedStudents(): Promise<MentorStudent[]> {
  const { userId } = await assertMentor()
  const admin = createAdminClient()

  const { data: assigns } = await admin
    .from("mentor_student_assignments")
    .select("student_id")
    .eq("mentor_id", userId)
    .eq("status", "active")
  const ids = (assigns ?? []).map((a) => a.student_id)
  if (ids.length === 0) return []

  const [{ data: students, error }, { data: att }] = await Promise.all([
    admin
      .from("students")
      .select("id, academic_year, school, profiles ( full_name, email, phone, avatar_url )")
      .in("id", ids),
    admin.from("student_attendance_summary").select("student_id, attendance_pct, total").in("student_id", ids),
  ])
  if (error) throw new Error(error.message)

  const attById = new Map<string, { pct: number; total: number }>()
  for (const a of att ?? []) {
    if (a.student_id)
      attById.set(a.student_id, { pct: Math.round(Number(a.attendance_pct ?? 0)), total: Number(a.total ?? 0) })
  }

  return ((students ?? []) as unknown as StudentRow[]).map((s) => {
    const a = attById.get(s.id) ?? { pct: 0, total: 0 }
    return {
      id: s.id,
      name: s.profiles?.full_name ?? "—",
      avatar: s.profiles?.avatar_url || DEFAULT_AVATAR,
      school: s.school ?? "",
      grade: s.academic_year ?? "",
      riskLevel: riskFromAttendance(a.pct),
      attendance: a.pct,
      totalSessions: a.total,
      email: s.profiles?.email ?? "",
      phone: s.profiles?.phone ?? "",
      attendanceHistory: [],
      notes: [],
      academicProgress: [],
    }
  })
}

/** Attendance history + notes for one assigned student (profile view). */
export async function getStudentDetail(studentId: string): Promise<MentorStudentDetail> {
  const { userId } = await assertMentor()
  const admin = createAdminClient()

  // Ensure this student is assigned to the current mentor.
  const { data: link } = await admin
    .from("mentor_student_assignments")
    .select("student_id")
    .eq("mentor_id", userId)
    .eq("student_id", studentId)
    .maybeSingle()
  if (!link) throw new Error("This student is not assigned to you.")

  const [{ data: att }, { data: notes }] = await Promise.all([
    admin
      .from("attendance_records")
      .select("attendance_date, status, notes, class:classes ( name ), session:class_sessions ( title )")
      .eq("student_id", studentId)
      .order("attendance_date", { ascending: false })
      .limit(50),
    admin
      .from("notes")
      .select("id, category, content, created_at, author:profiles ( full_name )")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false })
      .limit(50),
  ])

  const attendanceHistory = ((att ?? []) as unknown as {
    attendance_date: string | null
    status: string
    notes: string | null
    class: { name: string | null } | null
    session: { title: string | null } | null
  }[]).map((r) => ({
    date: r.attendance_date ?? "",
    session: r.class?.name ?? r.session?.title ?? "Session",
    status: (r.status === "present" || r.status === "late" ? "Present" : "Absent") as "Present" | "Absent",
    notes: r.notes ?? "",
  }))

  const noteList = ((notes ?? []) as unknown as {
    id: string
    category: string | null
    content: string | null
    created_at: string | null
    author: { full_name: string | null } | null
  }[]).map((n) => ({
    id: n.id,
    type: n.category ?? "Academic",
    date: n.created_at ? n.created_at.slice(0, 10) : "",
    author: n.author?.full_name ?? "",
    content: n.content ?? "",
  }))

  return { attendanceHistory, notes: noteList, academicProgress: [] }
}
