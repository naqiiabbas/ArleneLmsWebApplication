"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { assertPermission } from "@/lib/auth/permissions"
import type { BillingData, InvoiceStatus, UIInvoice } from "@/lib/data/billing.types"

function uiStatus(dbStatus: string): InvoiceStatus {
  if (dbStatus === "paid") return "Paid"
  if (dbStatus === "overdue") return "Overdue"
  return "Pending" // pending / outstanding / draft
}

type InvoiceRow = {
  invoice_number: string | null
  amount: number | string
  due_date: string | null
  paid_date: string | null
  status: string
  description: string | null
  org: { name: string | null } | null
  sponsor: { company_name: string | null } | null
}

export async function getBillingData(): Promise<BillingData> {
  await assertPermission("billing.manage")
  const admin = createAdminClient()

  const [inv, plans, subs] = await Promise.all([
    admin
      .from("invoices")
      .select(
        "invoice_number, amount, due_date, paid_date, status, description, org:organizations ( name ), sponsor:sponsors ( company_name )",
      )
      .order("issued_date", { ascending: false }),
    admin.from("billing_plans").select("name, price_monthly, features").order("price_monthly"),
    admin
      .from("subscriptions")
      .select("current_period_end, plan:billing_plans ( name, price_monthly )")
      .eq("status", "active")
      .order("started_at", { ascending: false })
      .limit(1),
  ])
  if (inv.error) throw new Error(inv.error.message)
  if (plans.error) throw new Error(plans.error.message)

  const rows = (inv.data ?? []) as unknown as InvoiceRow[]
  const invoices: UIInvoice[] = rows
    .filter((r) => r.status !== "void")
    .map((r) => ({
      id: r.invoice_number ?? "—",
      organization: r.org?.name ?? r.sponsor?.company_name ?? r.description ?? "—",
      amount: Number(r.amount) || 0,
      dueDate: r.due_date ?? "-",
      paidDate: r.paid_date ?? "-",
      status: uiStatus(r.status),
    }))

  let totalRevenue = 0
  let pendingAmount = 0
  let pendingCount = 0
  let overdueAmount = 0
  let overdueCount = 0
  for (const i of invoices) {
    if (i.status === "Paid") totalRevenue += i.amount
    else if (i.status === "Overdue") {
      overdueAmount += i.amount
      overdueCount += 1
    } else {
      pendingAmount += i.amount
      pendingCount += 1
    }
  }

  const uiPlans = (plans.data ?? []).map((p) => ({
    name: p.name,
    price: Number(p.price_monthly) || 0,
    features: p.features ?? [],
  }))

  const sub = (subs.data ?? [])[0] as
    | { current_period_end: string | null; plan: { name: string | null; price_monthly: number | string } | null }
    | undefined
  const currentPlan = sub?.plan
    ? {
        name: sub.plan.name ?? "",
        price: Number(sub.plan.price_monthly) || 0,
        renews: sub.current_period_end
          ? new Date(sub.current_period_end).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "",
      }
    : null

  return {
    totalRevenue,
    pendingAmount,
    pendingCount,
    overdueAmount,
    overdueCount,
    totalInvoices: invoices.length,
    invoices,
    plans: uiPlans,
    currentPlan,
  }
}
