"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { assertSponsor } from "@/lib/data/guards"
import type {
  SponsorActivity,
  SponsorDashboard,
  SponsorEvent,
  SponsorProgram,
  SponsorProgramDetail,
  SponsorPrograms,
  SponsorStats,
  SponsorStatus,
  SponsorTier,
} from "@/lib/data/sponsor.types"

type Admin = ReturnType<typeof createAdminClient>

const TIER_UI: Record<string, SponsorTier> = { platinum: "Platinum", gold: "Gold", silver: "Silver", bronze: "Bronze" }
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
