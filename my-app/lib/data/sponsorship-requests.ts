"use server"

// Admin → Sponsorship Requests: the review queue for requests sponsors submit
// from their "Request Donate" wizard (sponsor.ts → submitSponsorRequest).
// Approving creates the sponsorship program the sponsor then sees on their
// dashboard; every decision notifies the sponsor and is written to the audit log.
import { createAdminClient } from "@/lib/supabase/admin"
import { assertAdmin } from "@/lib/data/guards"
import { logActivity, notifyUsers } from "@/lib/data/audit"
import type {
  AdminSponsorshipRequest,
  RequestDecision,
  RequestStatus,
  SponsorshipRequestsData,
} from "@/lib/data/sponsorship-requests.types"

const TIER_UI: Record<string, string> = { platinum: "Platinum", gold: "Gold", silver: "Silver", bronze: "Bronze" }
const OPEN_STATUSES: RequestStatus[] = ["pending", "under_review"]

function fmtDate(iso: string | null, withTime = false): string {
  if (!iso) return ""
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
    timeZone: "America/Los_Angeles",
  })
}

/** "2026-11-01" + 12 months → "2027-11-01" (date-only, no timezone drift). */
function addMonths(ymd: string, months: number): string {
  const [y, m, d] = ymd.split("-").map(Number)
  const dt = new Date(Date.UTC(y, m - 1 + months, d))
  return dt.toISOString().slice(0, 10)
}

type RequestRow = {
  id: string
  status: RequestStatus
  program_name: string | null
  tier: string | null
  amount: number | string | null
  duration_months: number | null
  start_date: string | null
  benefits: string[] | null
  company_name: string | null
  contact_name: string | null
  email: string | null
  phone: string | null
  submitted_at: string | null
  reviewed_at: string | null
  review_notes: string | null
  program_id: string | null
  sponsor: { company_name: string | null; logo_url: string | null } | null
  reviewer: { full_name: string | null } | null
}

/** Every sponsorship request, newest first, with status counts. */
export async function listSponsorshipRequests(): Promise<SponsorshipRequestsData> {
  await assertAdmin()
  const admin = createAdminClient()

  const { data, error } = await admin
    .from("sponsorship_requests")
    .select(
      "id, status, program_name, tier, amount, duration_months, start_date, benefits, company_name, contact_name, email, phone, submitted_at, reviewed_at, review_notes, program_id, " +
        "sponsor:sponsors ( company_name, logo_url ), " +
        // reviewed_by is the only FK to profiles; hint it anyway for clarity.
        "reviewer:profiles!sponsorship_requests_reviewed_by_fkey ( full_name )",
    )
    .order("submitted_at", { ascending: false })
  if (error) throw new Error(error.message)

  const requests: AdminSponsorshipRequest[] = ((data ?? []) as unknown as RequestRow[]).map((r) => ({
    id: r.id,
    ref: `REQ-${r.id.slice(0, 6).toUpperCase()}`,
    status: r.status,
    programName: r.program_name ?? "—",
    tier: TIER_UI[r.tier ?? ""] ?? "—",
    amount: Number(r.amount ?? 0),
    durationMonths: r.duration_months,
    startDate: r.start_date ? fmtDate(`${r.start_date}T12:00:00Z`) : "Not specified",
    benefits: r.benefits ?? [],
    companyName: r.company_name ?? r.sponsor?.company_name ?? "—",
    contactName: r.contact_name ?? "—",
    email: r.email ?? "—",
    phone: r.phone ?? "—",
    sponsorName: r.sponsor?.company_name ?? "—",
    sponsorLogo: r.sponsor?.logo_url ?? "",
    submitted: fmtDate(r.submitted_at, true),
    submittedAt: r.submitted_at ?? "",
    reviewedBy: r.reviewer?.full_name ?? "",
    reviewed: fmtDate(r.reviewed_at, true),
    reviewNotes: r.review_notes ?? "",
    programId: r.program_id,
  }))

  const count = (s: RequestStatus) => requests.filter((r) => r.status === s).length
  return {
    stats: {
      total: requests.length,
      pending: count("pending"),
      underReview: count("under_review"),
      approved: count("approved"),
      rejected: count("rejected"),
    },
    requests,
  }
}

/**
 * Review one request. "approve" creates the sponsorship program; "reject"
 * records the reason; "under_review" just marks it as being looked at.
 * Approved / rejected requests are final, so a request can never create two
 * programs (the status change is claimed atomically before anything else).
 */
export async function reviewSponsorshipRequest(
  id: string,
  decision: RequestDecision,
  notes = "",
): Promise<{ error?: string }> {
  let userId: string
  try {
    ;({ userId } = await assertAdmin())
  } catch (e) {
    return { error: (e as Error).message }
  }
  const admin = createAdminClient()
  const note = notes.trim()

  const { data: req, error: readErr } = await admin
    .from("sponsorship_requests")
    .select("id, status, sponsor_id, program_name, tier, amount, duration_months, start_date, benefits, company_name, sponsor:sponsors ( profile_id, company_name )")
    .eq("id", id)
    .maybeSingle()
  if (readErr) return { error: readErr.message }
  if (!req) return { error: "Request not found." }
  if (!OPEN_STATUSES.includes(req.status as RequestStatus)) {
    return { error: `This request was already ${req.status}. Refresh to see the latest status.` }
  }
  if (decision === "under_review" && req.status === "under_review") return {}

  const newStatus: RequestStatus =
    decision === "approve" ? "approved" : decision === "reject" ? "rejected" : "under_review"

  // Claim the decision: only succeeds if nobody else decided it meanwhile.
  const { data: claimed, error: claimErr } = await admin
    .from("sponsorship_requests")
    .update({
      status: newStatus,
      reviewed_by: userId,
      reviewed_at: new Date().toISOString(),
      review_notes: note || null,
    })
    .eq("id", id)
    .in("status", OPEN_STATUSES)
    .select("id")
  if (claimErr) return { error: claimErr.message }
  if (!claimed || claimed.length === 0) {
    return { error: "This request was just reviewed by someone else. Refresh to see the latest status." }
  }

  const sponsor = req.sponsor as unknown as { profile_id: string | null; company_name: string | null } | null
  const program = req.program_name ?? "your sponsorship"

  if (decision === "approve") {
    if (!req.sponsor_id) {
      await admin.from("sponsorship_requests").update({ status: req.status, reviewed_by: null, reviewed_at: null, review_notes: null }).eq("id", id)
      return { error: "This request is not linked to a sponsor account, so it can't become a sponsorship." }
    }
    const today = new Date().toISOString().slice(0, 10)
    const start = req.start_date ?? today
    const { data: created, error: progErr } = await admin
      .from("sponsorship_programs")
      .insert({
        sponsor_id: req.sponsor_id,
        name: program,
        tier: req.tier,
        amount: req.amount,
        start_date: start,
        end_date: req.duration_months ? addMonths(start, req.duration_months) : null,
        status: "active",
        deliverables: req.benefits ?? [],
      })
      .select("id")
      .single()
    if (progErr) {
      // Put the request back so it can be approved again.
      await admin.from("sponsorship_requests").update({ status: req.status, reviewed_by: null, reviewed_at: null, review_notes: null }).eq("id", id)
      return { error: `Could not create the sponsorship: ${progErr.message}` }
    }
    await admin.from("sponsorship_requests").update({ program_id: created.id }).eq("id", id)
  }

  if (sponsor?.profile_id) {
    const body =
      decision === "approve"
        ? `Your request "${program}" was approved and is now an active sponsorship.${note ? ` Note: ${note}` : ""}`
        : decision === "reject"
          ? `Your request "${program}" was not approved.${note ? ` Reason: ${note}` : ""}`
          : `Your request "${program}" is now under review.`
    await notifyUsers(
      [sponsor.profile_id],
      {
        type: "sponsor",
        title:
          decision === "approve"
            ? "Sponsorship request approved"
            : decision === "reject"
              ? "Sponsorship request rejected"
              : "Sponsorship request under review",
        body,
        senderId: userId,
        entityType: "sponsorship_request",
        entityId: id,
      },
      admin,
    )
  }

  await logActivity(
    {
      actorId: userId,
      action:
        decision === "approve"
          ? "Approved sponsorship request"
          : decision === "reject"
            ? "Rejected sponsorship request"
            : "Marked sponsorship request under review",
      targetType: "sponsorship_request",
      targetId: id,
      description: `${req.company_name ?? sponsor?.company_name ?? "Sponsor"} — ${program}`,
    },
    admin,
  )
  return {}
}
