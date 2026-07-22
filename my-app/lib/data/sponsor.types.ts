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
