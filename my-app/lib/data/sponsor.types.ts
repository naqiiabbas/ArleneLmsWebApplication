// UI-facing types for the sponsor panel.

export interface SponsorActivity {
  id: string
  title: string
  subtitle: string
  time: string
  color: string
}

export interface SponsorEvent {
  id: string
  title: string
  date: string
  attendees: string
}

export interface SponsorStats {
  activeSponsorships: number
  totalAmount: number
  paidPrograms: number
  totalPrograms: number
  upcomingEvents: number
}

export interface SponsorDashboard {
  companyName: string
  stats: SponsorStats
  activities: SponsorActivity[]
  events: SponsorEvent[]
}

export type SponsorTier = "Platinum" | "Gold" | "Silver" | "Bronze"
export type SponsorStatus = "Active" | "Pending" | "Completed"

export interface SponsorProgram {
  id: string
  name: string
  tier: SponsorTier
  amount: string
  status: SponsorStatus
  start: string
  end: string
}

export interface SponsorProgramDetail {
  id: string
  title: string
  tier: SponsorTier
  amount: string
  status: SponsorStatus
  start: string
  end: string
  deliverables: string[]
  timeline: { label: string; date: string; state: "done" | "in-progress" | "pending" }[]
  impact: { label: string; value: string }[]
}

export interface SponsorPrograms {
  stats: SponsorStats
  programs: SponsorProgram[]
}

export type SponsorInvoiceStatus = "Paid" | "Outstanding"

export interface SponsorInvoice {
  id: string
  program: string
  amount: number
  dateIssued: string
  dueDate: string
  status: SponsorInvoiceStatus
}

export interface SponsorPaymentRecord {
  date: string
  amount: number
  method: string
  program: string
  status: string
}

export interface SponsorPaymentsData {
  summary: { totalPaid: number; outstanding: number; totalInvoices: number }
  invoices: SponsorInvoice[]
  history: SponsorPaymentRecord[]
}

export type SponsorRequestStatus = "Approved" | "Under review" | "Pending" | "Rejected"

export interface SponsorRequest {
  id: string // uuid (key/selection)
  ref: string // display ref, e.g. REQ-AB12CD
  programName: string
  tier: SponsorTier
  amount: number
  status: SponsorRequestStatus
  submitted: string
  companyName: string
  contactName: string
  email: string
  phone: string
  durationMonths: number
  startDate: string
  benefits: string[]
}

export interface SponsorRequestsData {
  stats: { total: number; approved: number; underReview: number; pending: number }
  requests: SponsorRequest[]
}

export interface SponsorRequestInput {
  tier: SponsorTier
  programName: string
  companyName: string
  contactName: string
  email: string
  phone: string
  amount: string
  durationMonths: string
  startDate: string
  benefits: string[]
}

export interface SponsorReportRow {
  program: string
  students: number
  sessions: number
  investment: number
  satisfaction: string
  roi: "High" | "Medium" | "Low"
}

export interface SponsorReports {
  metrics: { students: number; sessions: number; investment: number; avgSatisfaction: number; programs: number }
  performance: SponsorReportRow[]
  distribution: { name: string; value: number; color: string }[]
  financial: { quarter: string; amountSpent: number; sponsoredAmount: number }[]
  impact: { month: string; amount: number }[]
}

export interface SponsorCompanyProfile {
  companyName: string
  website: string
  industry: string
  companySize: string
  address: string
  city: string
  state: string
  zipCode: string
  phone: string
  primaryContactName: string
  primaryContactEmail: string
}

export interface SponsorTeamMember {
  id: string
  name: string
  email: string
  role: string
  accessLevel: string
  canRemove: boolean
}

export interface SponsorSettings {
  profile: SponsorCompanyProfile
  members: SponsorTeamMember[]
}

export interface SponsorTeamMemberInput {
  name: string
  email: string
  role: string
  accessLevel: string
}
