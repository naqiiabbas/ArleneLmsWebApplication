"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { assertPermission } from "@/lib/auth/permissions"
import type { ReportData } from "@/lib/data/reports.types"

const PIE_COLORS = ["#F9A618", "#b99b16", "#e3c77e", "#f2dfb6", "#f8edd2"]
const ICON_TREND = "/images/admin-reports-trend.svg"
const ICON_CAL = "/images/admin-reports-calendar.svg"
const ICON_USERS = "/images/admin-reports-users.svg"

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

function lastMonths(n: number) {
  const now = new Date()
  const out: { key: string; label: string; end: Date }[] = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    out.push({
      key: monthKey(d),
      label: d.toLocaleString("en-US", { month: "short" }),
      end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59),
    })
  }
  return out
}

function gradeBucket(gpa: number): string {
  if (gpa >= 3.9) return "A+"
  if (gpa >= 3.5) return "A"
  if (gpa >= 3.3) return "B+"
  if (gpa >= 3.0) return "B"
  if (gpa >= 2.5) return "C+"
  if (gpa >= 2.0) return "C"
  return "Below C"
}

export async function getReportData(): Promise<ReportData> {
  await assertPermission("reports.view")
  const admin = createAdminClient()

  const [att, sessions, students, profiles, mentors] = await Promise.all([
    admin.from("attendance_records").select("status, attendance_date"),
    admin.from("class_sessions").select("session_date"),
    admin.from("students").select("course, gpa, status"),
    admin.from("profiles").select("role, created_at"),
    admin.from("mentors").select("rating"),
  ])

  const attRows = att.data ?? []
  const sessionRows = sessions.data ?? []
  const studentRows = students.data ?? []
  const profileRows = profiles.data ?? []
  const mentorRows = mentors.data ?? []

  const months = lastMonths(6)

  // ---- Stats ----
  const counted = attRows.filter((r) => r.status !== "pending")
  const attended = counted.filter((r) => r.status === "present" || r.status === "late").length
  const avgAtt = counted.length ? Math.round((attended / counted.length) * 1000) / 10 : 0

  const activeStudents = studentRows.filter((s) => s.status === "active").length
  const ratings = mentorRows.map((m) => m.rating).filter((r): r is number => r != null)
  const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0

  const stats = [
    {
      id: 1,
      label: "Avg. Attendance",
      value: `${avgAtt}%`,
      trend: `across ${counted.length} record${counted.length === 1 ? "" : "s"}`,
      icon: ICON_TREND,
    },
    {
      id: 2,
      label: "Total Sessions",
      value: sessionRows.length.toLocaleString(),
      trend: "all time",
      icon: ICON_CAL,
    },
    {
      id: 3,
      label: "Active Students",
      value: activeStudents.toLocaleString(),
      trend: "currently active",
      icon: ICON_USERS,
    },
    {
      id: 4,
      label: "Satisfaction",
      value: ratings.length ? `${(Math.round(avgRating * 10) / 10).toFixed(1)}/5.0` : "N/A",
      trend: "avg mentor rating",
      icon: ICON_TREND,
    },
  ]

  // ---- Attendance trends (monthly %) ----
  const attByMonth = new Map<string, { attended: number; total: number }>()
  for (const r of counted) {
    if (!r.attendance_date) continue
    const k = monthKey(new Date(r.attendance_date))
    const b = attByMonth.get(k) ?? { attended: 0, total: 0 }
    b.total += 1
    if (r.status === "present" || r.status === "late") b.attended += 1
    attByMonth.set(k, b)
  }
  const attendanceTrends = months.map((m) => {
    const b = attByMonth.get(m.key)
    return { month: m.label, value: b && b.total ? Math.round((b.attended / b.total) * 100) : 0 }
  })

  // ---- Growth (cumulative students/mentors by month end) ----
  const studentDates = profileRows.filter((p) => p.role === "student").map((p) => p.created_at)
  const mentorDates = profileRows.filter((p) => p.role === "mentor").map((p) => p.created_at)
  const growthData = months.map((m) => ({
    month: m.label,
    students: studentDates.filter((d) => d && new Date(d) <= m.end).length,
    mentors: mentorDates.filter((d) => d && new Date(d) <= m.end).length,
  }))

  // ---- Session activity (per month) ----
  const sessByMonth = new Map<string, number>()
  for (const s of sessionRows) {
    if (!s.session_date) continue
    const k = monthKey(new Date(s.session_date))
    sessByMonth.set(k, (sessByMonth.get(k) ?? 0) + 1)
  }
  const sessionActivity = months.map((m) => ({ month: m.label, sessions: sessByMonth.get(m.key) ?? 0 }))

  // ---- Course distribution (top 4 + Other, as %) ----
  const courseCount = new Map<string, number>()
  for (const s of studentRows) {
    const c = (s.course ?? "").trim()
    if (!c) continue
    courseCount.set(c, (courseCount.get(c) ?? 0) + 1)
  }
  const courseTotal = [...courseCount.values()].reduce((a, b) => a + b, 0)
  const sortedCourses = [...courseCount.entries()].sort((a, b) => b[1] - a[1])
  const courseDistribution: ReportData["courseDistribution"] = []
  if (courseTotal > 0) {
    const top = sortedCourses.slice(0, 4)
    const rest = sortedCourses.slice(4).reduce((a, [, n]) => a + n, 0)
    top.forEach(([name, n], i) =>
      courseDistribution.push({ name, value: Math.round((n / courseTotal) * 100), color: PIE_COLORS[i] }),
    )
    if (rest > 0)
      courseDistribution.push({ name: "Other", value: Math.round((rest / courseTotal) * 100), color: PIE_COLORS[4] })
  }

  // ---- Performance distribution (by grade bucket, from gpa) ----
  const order = ["A+", "A", "B+", "B", "C+", "C", "Below C"]
  const gradeCount = new Map<string, number>(order.map((g) => [g, 0]))
  for (const s of studentRows) {
    if (s.gpa == null) continue
    const g = gradeBucket(Number(s.gpa))
    gradeCount.set(g, (gradeCount.get(g) ?? 0) + 1)
  }
  const performanceDistribution = order.map((grade) => ({ grade, count: gradeCount.get(grade) ?? 0 }))

  return { stats, attendanceTrends, growthData, sessionActivity, courseDistribution, performanceDistribution }
}
