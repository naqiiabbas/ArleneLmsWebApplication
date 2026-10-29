// UI-facing types for Admin → Sponsorship Requests (review queue).
export type RequestStatus = "pending" | "under_review" | "approved" | "rejected"
export type RequestDecision = "approve" | "reject" | "under_review"

export interface AdminSponsorshipRequest {
  id: string
  ref: string // REQ-XXXXXX, the same reference the sponsor sees
  status: RequestStatus
  programName: string
  tier: string // Platinum / Gold / Silver / Bronze
  amount: number
  durationMonths: number | null
  startDate: string // display date or "Not specified"
  benefits: string[]
  companyName: string
  contactName: string
  email: string
  phone: string
  sponsorName: string // the sponsor account the request came from
  sponsorLogo: string
  submitted: string
  submittedAt: string // ISO, for sorting
  reviewedBy: string
  reviewed: string
  reviewNotes: string
  programId: string | null
}

export interface SponsorshipRequestsData {
  stats: { total: number; pending: number; underReview: number; approved: number; rejected: number }
  requests: AdminSponsorshipRequest[]
}
