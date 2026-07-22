"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { assertSponsor } from "@/lib/data/guards"
import type {
  SponsorActivity,
  SponsorDashboard,
  SponsorEvent,
  SponsorInvoice,
  SponsorPaymentRecord,
  SponsorPaymentsData,
  SponsorProgram,
  SponsorProgramDetail,
  SponsorPrograms,
  SponsorCompanyProfile,
  SponsorReportRow,
  SponsorReports,
  SponsorRequest,
  SponsorSettings,
  SponsorTeamMember,
  SponsorTeamMemberInput,
  SponsorRequestInput,
  SponsorRequestStatus,
  SponsorRequestsData,
  SponsorStats,
  SponsorStatus,
  SponsorTier,
} from "@/lib/data/sponsor.types"

const PIE_COLORS = ["#F59E0B", "#3B82F6", "#10B981", "#F97316", "#EF4444", "#8B5CF6"]

type Admin = ReturnType<typeof createAdminClient>

const METHOD_UI: Record<string, string> = {
  wire_transfer: "Wire Transfer",
  ach: "ACH",
  check: "Check",
  card: "Card",
  cash: "Cash",
  other: "Other",
}

const TIER_UI: Record<string, SponsorTier> = { platinum: "Platinum", gold: "Gold", silver: "Silver", bronze: "Bronze" }
const TIER_DB: Record<SponsorTier, "platinum" | "gold" | "silver" | "bronze"> = { Platinum: "platinum", Gold: "gold", Silver: "silver", Bronze: "bronze" }
const REQ_STATUS_UI: Record<string, SponsorRequestStatus> = { approved: "Approved", under_review: "Under review", rejected: "Rejected", pending: "Pending" }
const STATUS_UI: Record<string, SponsorStatus> = { active: "Active", pending: "Pending", completed: "Completed", archived: "Completed" }
const money = (v: number | string | null) => `$${Number(v ?? 0).toLocaleString("en-US")}`

/** Shared stat block used by the dashboard and the sponsorships list. */
async function sponsorStats(admin: Admin, sponsorId: string): Promise<SponsorStats> {
  const nowIso = new Date().toISOString()
  const [{ data: programs }, { data: payments }, { count: upcoming }] = await Promise.all([
    admin.from("sponsorship_programs").select("id, amount, status").eq("sponsor_id", sponsorId),
    admin.from("payments").select("program_id, status").eq("sponsor_id", sponsorId),
    admin.from("events").select("id", { count: "exact", head: true }).gte("start_at", nowIso),
  ])
  const progs = (programs ?? []) as { id: string; amount: number | string | null; status: string }[]
  const paidIds = new Set(((payments ?? []) as { program_id: string | null; status: string }[]).filter((p) => p.status === "completed" && p.program_id).map((p) => p.program_id))
  return {
    activeSponsorships: progs.filter((p) => p.status === "active").length,
    totalAmount: progs.reduce((s, p) => s + Number(p.amount ?? 0), 0),
    paidPrograms: progs.filter((p) => paidIds.has(p.id)).length,
    totalPrograms: progs.length,
    upcomingEvents: upcoming ?? 0,
  }
}

function relative(iso: string | null): string {
  if (!iso) return ""
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return "just now"
  const m = Math.floor(s / 60)
  if (m < 60) return `${m} minute${m > 1 ? "s" : ""} ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} hour${h > 1 ? "s" : ""} ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d} day${d > 1 ? "s" : ""} ago`
  return new Date(iso).toLocaleDateString("en-US")
}

/** Resolve the sponsor row linked to the logged-in profile. */
async function resolveSponsor(
  admin: Admin,
  userId: string,
): Promise<{ id: string; company_name: string } | null> {
  const { data } = await admin
    .from("sponsors")
    .select("id, company_name")
    .eq("profile_id", userId)
    .maybeSingle()
  return (data as { id: string; company_name: string } | null) ?? null
}

/** Aggregated sponsor dashboard (stats, recent activity, upcoming events). */
export async function getSponsorDashboard(): Promise<SponsorDashboard> {
  const { userId } = await assertSponsor()
  const admin = createAdminClient()

  const sponsor = await resolveSponsor(admin, userId)
  const empty: SponsorDashboard = {
    companyName: sponsor?.company_name ?? "",
    stats: { activeSponsorships: 0, totalAmount: 0, paidPrograms: 0, totalPrograms: 0, upcomingEvents: 0 },
    activities: [],
    events: [],
  }
  if (!sponsor) return empty

  const nowIso = new Date().toISOString()
  const [{ data: programs }, { data: payments }, { data: requests }, { data: events }] = await Promise.all([
    admin.from("sponsorship_programs").select("id, name, amount, status, updated_at").eq("sponsor_id", sponsor.id),
    admin.from("payments").select("id, amount, status, program_id, paid_at").eq("sponsor_id", sponsor.id).order("paid_at", { ascending: false }).limit(20),
    admin.from("sponsorship_requests").select("id, program_name, submitted_at").eq("sponsor_id", sponsor.id).order("submitted_at", { ascending: false }).limit(10),
    admin.from("events").select("id, title, start_at, time_label, participant_labels").gte("start_at", nowIso).order("start_at", { ascending: true }).limit(5),
  ])

  const allPrograms = (programs ?? []) as { id: string; name: string; amount: number | string | null; status: string; updated_at: string | null }[]
  const allPayments = (payments ?? []) as { id: string; amount: number | string; status: string; program_id: string | null; paid_at: string | null }[]

  const activeSponsorships = allPrograms.filter((p) => p.status === "active").length
  const totalAmount = allPrograms.reduce((sum, p) => sum + Number(p.amount ?? 0), 0)
  const totalPrograms = allPrograms.length
  const paidProgramIds = new Set(allPayments.filter((p) => p.status === "completed" && p.program_id).map((p) => p.program_id))
  const paidPrograms = allPrograms.filter((p) => paidProgramIds.has(p.id)).length

  // Recent activity — payments + requests + newly-active programs, newest first.
  const acts: { ts: string | null; title: string; subtitle: string; color: string }[] = []
  const programName = (id: string | null) => allPrograms.find((p) => p.id === id)?.name ?? "Sponsorship"
  for (const pay of allPayments.slice(0, 6)) {
    acts.push({ ts: pay.paid_at, title: pay.status === "completed" ? "Payment received" : "Payment " + pay.status, subtitle: programName(pay.program_id), color: pay.status === "completed" ? "bg-[#00C853]" : "bg-[#F5B400]" })
  }
  for (const req of (requests ?? []) as { id: string; program_name: string | null; submitted_at: string | null }[]) {
    acts.push({ ts: req.submitted_at, title: "Sponsorship request", subtitle: req.program_name ?? "New request", color: "bg-[#F5B400]" })
  }
  acts.sort((a, b) => new Date(b.ts ?? 0).getTime() - new Date(a.ts ?? 0).getTime())
  const activities: SponsorActivity[] = acts.slice(0, 6).map((a, i) => ({
    id: `act${i}`,
    title: a.title,
    subtitle: a.subtitle,
    time: relative(a.ts),
    color: a.color,
  }))

  const evs: SponsorEvent[] = ((events ?? []) as { id: string; title: string; start_at: string | null; time_label: string | null; participant_labels: string[] | null }[]).map((e) => ({
    id: e.id,
    title: e.title,
    date: e.start_at ? new Date(e.start_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "",
    attendees: e.participant_labels && e.participant_labels.length ? `${e.participant_labels.length} participants` : e.time_label ?? "",
  }))

  return {
    companyName: sponsor.company_name,
    stats: { activeSponsorships, totalAmount, paidPrograms, totalPrograms, upcomingEvents: evs.length },
    activities,
    events: evs,
  }
}

/** The sponsor's programs (Sponsorships list) + the shared stat block. */
export async function getSponsorPrograms(): Promise<SponsorPrograms> {
  const { userId } = await assertSponsor()
  const admin = createAdminClient()
  const sponsor = await resolveSponsor(admin, userId)
  const emptyStats: SponsorStats = { activeSponsorships: 0, totalAmount: 0, paidPrograms: 0, totalPrograms: 0, upcomingEvents: 0 }
  if (!sponsor) return { stats: emptyStats, programs: [] }

  const [stats, { data, error }] = await Promise.all([
    sponsorStats(admin, sponsor.id),
    admin
      .from("sponsorship_programs")
      .select("id, name, tier, amount, status, start_date, end_date")
      .eq("sponsor_id", sponsor.id)
      .order("created_at", { ascending: false }),
  ])
  if (error) throw new Error(error.message)

  const programs: SponsorProgram[] = ((data ?? []) as {
    id: string
    name: string
    tier: string | null
    amount: number | string | null
    status: string
    start_date: string | null
    end_date: string | null
  }[]).map((p) => ({
    id: p.id,
    name: p.name,
    tier: TIER_UI[p.tier ?? ""] ?? "Bronze",
    amount: money(p.amount),
    status: STATUS_UI[p.status] ?? "Pending",
    start: p.start_date ?? "—",
    end: p.end_date ?? "—",
  }))
  return { stats, programs }
}

/** Company profile + team members (Settings). */
export async function getSponsorSettings(): Promise<SponsorSettings> {
  const { userId } = await assertSponsor()
  const admin = createAdminClient()

  const { data: s } = await admin
    .from("sponsors")
    .select("id, company_name, website, industry, company_size, address, city, state, zip_code, phone, contact_name, email")
    .eq("profile_id", userId)
    .maybeSingle()

  const empty: SponsorCompanyProfile = {
    companyName: "", website: "", industry: "", companySize: "", address: "",
    city: "", state: "", zipCode: "", phone: "", primaryContactName: "", primaryContactEmail: "",
  }
  if (!s) return { profile: empty, members: [] }

  const row = s as {
    id: string; company_name: string | null; website: string | null; industry: string | null
    company_size: string | null; address: string | null; city: string | null; state: string | null
    zip_code: string | null; phone: string | null; contact_name: string | null; email: string | null
  }

  const { data: mem } = await admin
    .from("sponsor_team_members")
    .select("id, name, email, role, access_level, can_remove")
    .eq("sponsor_id", row.id)
    .order("created_at", { ascending: true })

  const members: SponsorTeamMember[] = ((mem ?? []) as {
    id: string; name: string; email: string | null; role: string | null; access_level: string; can_remove: boolean
  }[]).map((m) => ({
    id: m.id,
    name: m.name,
    email: m.email ?? "",
    role: m.role ?? "",
    accessLevel: m.access_level,
    canRemove: m.can_remove,
  }))

  return {
    profile: {
      companyName: row.company_name ?? "",
      website: row.website ?? "",
      industry: row.industry ?? "",
      companySize: row.company_size ?? "",
      address: row.address ?? "",
      city: row.city ?? "",
      state: row.state ?? "",
      zipCode: row.zip_code ?? "",
      phone: row.phone ?? "",
      primaryContactName: row.contact_name ?? "",
      primaryContactEmail: row.email ?? "",
    },
    members,
  }
}

/** Save the sponsor's company profile fields. */
export async function updateSponsorCompanyProfile(
  input: SponsorCompanyProfile,
): Promise<{ error?: string }> {
  const { userId } = await assertSponsor()
  const admin = createAdminClient()
  const t = (v: string) => v.trim() || null
  const { error } = await admin
    .from("sponsors")
    .update({
      company_name: input.companyName.trim() || "Company",
      website: t(input.website),
      industry: t(input.industry),
      company_size: t(input.companySize),
      address: t(input.address),
      city: t(input.city),
      state: t(input.state),
      zip_code: t(input.zipCode),
      phone: t(input.phone),
      contact_name: t(input.primaryContactName),
      email: t(input.primaryContactEmail),
    })
    .eq("profile_id", userId)
  if (error) return { error: error.message }
  return {}
}

/** Add a team member to the sponsor portal. */
export async function addSponsorTeamMember(
  input: SponsorTeamMemberInput,
): Promise<{ error?: string; id?: string }> {
  const { userId } = await assertSponsor()
  const admin = createAdminClient()
  const sponsor = await resolveSponsor(admin, userId)
  if (!sponsor) return { error: "No sponsor profile is linked to your account." }
  if (!input.name.trim() || !input.email.trim()) return { error: "Name and email are required." }

  const { data, error } = await admin
    .from("sponsor_team_members")
    .insert({
      sponsor_id: sponsor.id,
      name: input.name.trim(),
      email: input.email.trim(),
      role: input.role.trim() || null,
      access_level: input.accessLevel || "Full Access",
      can_remove: true,
    })
    .select("id")
    .single()
  if (error) return { error: error.message }
  return { id: data.id }
}

/** Remove a team member (only removable ones, scoped to the sponsor). */
export async function removeSponsorTeamMember(id: string): Promise<{ error?: string }> {
  const { userId } = await assertSponsor()
  const admin = createAdminClient()
  const sponsor = await resolveSponsor(admin, userId)
  if (!sponsor) return { error: "No sponsor profile is linked to your account." }

  const { error } = await admin
    .from("sponsor_team_members")
    .delete()
    .eq("id", id)
    .eq("sponsor_id", sponsor.id)
    .eq("can_remove", true)
  if (error) return { error: error.message }
  return {}
}

function quarterLabel(iso: string): string {
  const d = new Date(iso)
  return `Q${Math.floor(d.getMonth() / 3) + 1} ${d.getFullYear()}`
}

/** Reports & analytics over the sponsor's programs, impact, payments and invoices. */
export async function getSponsorReports(): Promise<SponsorReports> {
  const { userId } = await assertSponsor()
  const admin = createAdminClient()
  const sponsor = await resolveSponsor(admin, userId)
  const empty: SponsorReports = { metrics: { students: 0, sessions: 0, investment: 0, avgSatisfaction: 0, programs: 0 }, performance: [], distribution: [], financial: [], impact: [] }
  if (!sponsor) return empty

  const { data: progData } = await admin
    .from("sponsorship_programs")
    .select("id, name, amount")
    .eq("sponsor_id", sponsor.id)
  const programs = (progData ?? []) as { id: string; name: string; amount: number | string | null }[]
  const programIds = programs.map((p) => p.id)

  const [{ data: impactData }, { data: payData }, { data: invData }] = await Promise.all([
    programIds.length ? admin.from("sponsorship_impact").select("program_id, label, value").in("program_id", programIds) : Promise.resolve({ data: [] as unknown[] }),
    admin.from("payments").select("amount, status, paid_at").eq("sponsor_id", sponsor.id).eq("status", "completed"),
    admin.from("invoices").select("amount, issued_date").eq("sponsor_id", sponsor.id),
  ])
  const impacts = (impactData ?? []) as { program_id: string; label: string; value: string }[]

  const num = (s: string | undefined) => (s ? parseFloat(s.replace(/[^0-9.]/g, "")) || 0 : 0)
  const findImpact = (pid: string, needle: string) => impacts.find((i) => i.program_id === pid && i.label.toLowerCase().includes(needle))?.value

  const performance: SponsorReportRow[] = programs.map((p) => {
    const students = num(findImpact(p.id, "student"))
    const sessions = num(findImpact(p.id, "session"))
    const satRaw = findImpact(p.id, "satisf")
    const sat = num(satRaw)
    const roi: SponsorReportRow["roi"] = sat >= 95 ? "High" : sat >= 90 ? "Medium" : sat > 0 ? "Low" : "Medium"
    return { program: p.name, students, sessions, investment: Number(p.amount ?? 0), satisfaction: satRaw ?? "—", roi }
  })

  const totalStudents = performance.reduce((s, r) => s + r.students, 0)
  const totalSessions = performance.reduce((s, r) => s + r.sessions, 0)
  const totalInvestment = performance.reduce((s, r) => s + r.investment, 0)
  const sats = performance.map((r) => num(r.satisfaction)).filter((v) => v > 0)
  const avgSatisfaction = sats.length ? Math.round(sats.reduce((a, b) => a + b, 0) / sats.length) : 0

  const distribution = programs
    .filter((p) => Number(p.amount ?? 0) > 0)
    .map((p, i) => ({
      name: p.name,
      value: totalInvestment ? Math.round((Number(p.amount ?? 0) / totalInvestment) * 100) : 0,
      color: PIE_COLORS[i % PIE_COLORS.length],
    }))

  // Financial by quarter: amountSpent = completed payments, sponsoredAmount = invoices issued.
  const finMap = new Map<string, { amountSpent: number; sponsoredAmount: number; ts: number }>()
  for (const p of (payData ?? []) as { amount: number | string; paid_at: string | null }[]) {
    if (!p.paid_at) continue
    const q = quarterLabel(p.paid_at)
    const e = finMap.get(q) ?? { amountSpent: 0, sponsoredAmount: 0, ts: new Date(p.paid_at).getTime() }
    e.amountSpent += Number(p.amount ?? 0)
    finMap.set(q, e)
  }
  for (const iv of (invData ?? []) as { amount: number | string; issued_date: string | null }[]) {
    if (!iv.issued_date) continue
    const q = quarterLabel(iv.issued_date)
    const e = finMap.get(q) ?? { amountSpent: 0, sponsoredAmount: 0, ts: new Date(iv.issued_date).getTime() }
    e.sponsoredAmount += Number(iv.amount ?? 0)
    finMap.set(q, e)
  }
  const financial = [...finMap.entries()]
    .sort((a, b) => a[1].ts - b[1].ts)
    .map(([quarter, v]) => ({ quarter, amountSpent: v.amountSpent, sponsoredAmount: v.sponsoredAmount }))

  // Impact over time: sponsored $ per month (from completed payments).
  const monthMap = new Map<string, { amount: number; ts: number }>()
  for (const p of (payData ?? []) as { amount: number | string; paid_at: string | null }[]) {
    if (!p.paid_at) continue
    const d = new Date(p.paid_at)
    const key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" })
    const e = monthMap.get(key) ?? { amount: 0, ts: new Date(d.getFullYear(), d.getMonth(), 1).getTime() }
    e.amount += Number(p.amount ?? 0)
    monthMap.set(key, e)
  }
  const impact = [...monthMap.entries()]
    .sort((a, b) => a[1].ts - b[1].ts)
    .map(([month, v]) => ({ month, amount: v.amount }))

  return {
    metrics: { students: totalStudents, sessions: totalSessions, investment: totalInvestment, avgSatisfaction, programs: programs.length },
    performance,
    distribution,
    financial,
    impact,
  }
}

/** The sponsor's sponsorship requests + status counts (Request Donate). */
export async function getSponsorRequests(): Promise<SponsorRequestsData> {
  const { userId } = await assertSponsor()
  const admin = createAdminClient()
  const sponsor = await resolveSponsor(admin, userId)
  const empty: SponsorRequestsData = { stats: { total: 0, approved: 0, underReview: 0, pending: 0 }, requests: [] }
  if (!sponsor) return empty

  const { data, error } = await admin
    .from("sponsorship_requests")
    .select("id, program_name, tier, amount, status, submitted_at, company_name, contact_name, email, phone, duration_months, start_date, benefits")
    .eq("sponsor_id", sponsor.id)
    .order("submitted_at", { ascending: false })
  if (error) throw new Error(error.message)

  const requests: SponsorRequest[] = ((data ?? []) as unknown as {
    id: string
    program_name: string | null
    tier: string | null
    amount: number | string | null
    status: string
    submitted_at: string | null
    company_name: string | null
    contact_name: string | null
    email: string | null
    phone: string | null
    duration_months: number | null
    start_date: string | null
    benefits: string[] | null
  }[]).map((r) => ({
    id: r.id,
    ref: `REQ-${r.id.slice(0, 6).toUpperCase()}`,
    programName: r.program_name ?? "—",
    tier: TIER_UI[r.tier ?? ""] ?? "Bronze",
    amount: Number(r.amount ?? 0),
    status: REQ_STATUS_UI[r.status] ?? "Pending",
    submitted: r.submitted_at ? new Date(r.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—",
    companyName: r.company_name ?? "—",
    contactName: r.contact_name ?? "—",
    email: r.email ?? "—",
    phone: r.phone ?? "—",
    durationMonths: Number(r.duration_months ?? 0),
    startDate: r.start_date ?? "Not specified",
    benefits: r.benefits ?? [],
  }))

  const stats = {
    total: requests.length,
    approved: requests.filter((r) => r.status === "Approved").length,
    underReview: requests.filter((r) => r.status === "Under review").length,
    pending: requests.filter((r) => r.status === "Pending").length,
  }
  return { stats, requests }
}

/** Submit a new sponsorship request (status pending → admin review). */
export async function submitSponsorRequest(
  input: SponsorRequestInput,
): Promise<{ error?: string; id?: string }> {
  const { userId } = await assertSponsor()
  const admin = createAdminClient()
  const sponsor = await resolveSponsor(admin, userId)
  if (!sponsor) return { error: "No sponsor profile is linked to your account." }
  if (!input.programName.trim()) return { error: "Please enter a program name." }

  const amount = Number(String(input.amount).replace(/[^0-9.]/g, ""))
  const duration = parseInt(String(input.durationMonths).replace(/[^0-9]/g, ""), 10)
  const parsedDate = new Date(input.startDate)
  const startDate = input.startDate.trim() && !isNaN(parsedDate.getTime())
    ? `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, "0")}-${String(parsedDate.getDate()).padStart(2, "0")}`
    : null

  const { data, error } = await admin
    .from("sponsorship_requests")
    .insert({
      sponsor_id: sponsor.id,
      program_name: input.programName.trim(),
      tier: TIER_DB[input.tier],
      amount: isNaN(amount) ? null : amount,
      duration_months: isNaN(duration) ? null : duration,
      start_date: startDate,
      company_name: input.companyName.trim() || null,
      contact_name: input.contactName.trim() || null,
      email: input.email.trim() || null,
      phone: input.phone.trim() || null,
      benefits: input.benefits,
      status: "pending",
    })
    .select("id")
    .single()
  if (error) return { error: error.message }
  return { id: data.id }
}

/** The sponsor's invoices + payment history (Payments & Invoices). */
export async function getSponsorPayments(): Promise<SponsorPaymentsData> {
  const { userId } = await assertSponsor()
  const admin = createAdminClient()
  const sponsor = await resolveSponsor(admin, userId)
  const empty: SponsorPaymentsData = { summary: { totalPaid: 0, outstanding: 0, totalInvoices: 0 }, invoices: [], history: [] }
  if (!sponsor) return empty

  const [{ data: invData }, { data: payData }] = await Promise.all([
    admin
      .from("invoices")
      .select("invoice_number, amount, issued_date, due_date, status, program:sponsorship_programs ( name )")
      .eq("sponsor_id", sponsor.id)
      .order("issued_date", { ascending: false }),
    admin
      .from("payments")
      .select("amount, method, status, paid_at, program:sponsorship_programs ( name )")
      .eq("sponsor_id", sponsor.id)
      .order("paid_at", { ascending: false }),
  ])

  const invoices: SponsorInvoice[] = ((invData ?? []) as unknown as {
    invoice_number: string | null
    amount: number | string
    issued_date: string | null
    due_date: string | null
    status: string
    program: { name: string | null } | null
  }[]).map((i) => ({
    id: i.invoice_number ?? "—",
    program: i.program?.name ?? "—",
    amount: Number(i.amount ?? 0),
    dateIssued: i.issued_date ?? "—",
    dueDate: i.due_date ?? "—",
    status: i.status === "paid" ? "Paid" : "Outstanding",
  }))

  const history: SponsorPaymentRecord[] = ((payData ?? []) as unknown as {
    amount: number | string
    method: string
    status: string
    paid_at: string | null
    program: { name: string | null } | null
  }[]).map((p) => ({
    date: p.paid_at ? p.paid_at.slice(0, 10) : "—",
    amount: Number(p.amount ?? 0),
    method: METHOD_UI[p.method] ?? p.method,
    program: p.program?.name ?? "—",
    status: p.status.charAt(0).toUpperCase() + p.status.slice(1),
  }))

  const totalPaid = invoices.filter((i) => i.status === "Paid").reduce((s, i) => s + i.amount, 0)
  const outstanding = invoices.filter((i) => i.status === "Outstanding").reduce((s, i) => s + i.amount, 0)

  return { summary: { totalPaid, outstanding, totalInvoices: invoices.length }, invoices, history }
}

/** One program's full detail (summary + deliverables + timeline + impact), ownership-checked. */
export async function getSponsorProgramDetail(programId: string): Promise<SponsorProgramDetail | null> {
  const { userId } = await assertSponsor()
  const admin = createAdminClient()
  const sponsor = await resolveSponsor(admin, userId)
  if (!sponsor) return null

  const { data: prog } = await admin
    .from("sponsorship_programs")
    .select("id, name, tier, amount, status, start_date, end_date, deliverables, sponsor_id")
    .eq("id", programId)
    .maybeSingle()
  const p = prog as {
    id: string; name: string; tier: string | null; amount: number | string | null; status: string
    start_date: string | null; end_date: string | null; deliverables: string[] | null; sponsor_id: string | null
  } | null
  if (!p || p.sponsor_id !== sponsor.id) return null

  const [{ data: timeline }, { data: impact }] = await Promise.all([
    admin.from("sponsorship_timeline").select("label, due_date, state, sort_order").eq("program_id", programId).order("sort_order", { ascending: true }),
    admin.from("sponsorship_impact").select("label, value").eq("program_id", programId),
  ])

  return {
    id: p.id,
    title: p.name,
    tier: TIER_UI[p.tier ?? ""] ?? "Bronze",
    amount: money(p.amount),
    status: STATUS_UI[p.status] ?? "Pending",
    start: p.start_date ?? "—",
    end: p.end_date ?? "—",
    deliverables: p.deliverables ?? [],
    timeline: ((timeline ?? []) as { label: string; due_date: string | null; state: string }[]).map((t) => ({
      label: t.label,
      date: t.due_date ?? (t.state === "done" ? "Completed" : t.state === "in_progress" ? "In Progress" : ""),
      state: t.state === "done" ? "done" : t.state === "in_progress" ? "in-progress" : "pending",
    })),
    impact: ((impact ?? []) as { label: string; value: string }[]).map((i) => ({ label: i.label, value: i.value })),
  }
}
