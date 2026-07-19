// UI-facing types for the admin Billing module.
export type InvoiceStatus = "Paid" | "Pending" | "Overdue"

export type UIInvoice = {
  id: string
  organization: string
  amount: number
  dueDate: string
  paidDate: string
  status: InvoiceStatus
}

export type UIPlan = {
  name: string
  price: number
  features: string[]
}

export type BillingData = {
  totalRevenue: number
  pendingAmount: number
  pendingCount: number
  overdueAmount: number
  overdueCount: number
  totalInvoices: number
  invoices: UIInvoice[]
  plans: UIPlan[]
  currentPlan: { name: string; price: number; renews: string } | null
}
