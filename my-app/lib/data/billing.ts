"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { assertPermission } from "@/lib/auth/permissions"
import { logActivity } from "@/lib/data/audit"
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
    admin.from("billing_plans").select("id, name, price_monthly, features").eq("active", true).order("price_monthly"),
    admin
      .from("subscriptions")
      .select("plan_id, current_period_end, plan:billing_plans ( name, price_monthly )")
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
    id: p.id,
    name: p.name,
    price: Number(p.price_monthly) || 0,
    features: p.features ?? [],
  }))

  const sub = (subs.data ?? [])[0] as
    | { plan_id: string | null; current_period_end: string | null; plan: { name: string | null; price_monthly: number | string } | null }
    | undefined
  const currentPlan = sub?.plan
    ? {
        planId: sub.plan_id ?? "",
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

/**
 * Switch the program to `planId`: the current subscription is cancelled, the
 * new one starts now for one month, and a PENDING invoice for that first month
 * is issued (no payment gateway exists — invoices are settled offline and
 * marked paid). Rolled back if the invoice can't be created. The "Choose Plan"
 * buttons used to do nothing at all.
 */
export async function selectPlan(planId: string): Promise<{ error?: string; invoiceNumber?: string }> {
  let me
  try {
    me = await assertPermission("billing.manage")
  } catch (e) {
    return { error: (e as Error).message }
  }
  const admin = createAdminClient()

  const { data: plan } = await admin
    .from("billing_plans")
    .select("id, name, price_monthly, active")
    .eq("id", planId)
    .maybeSingle()
  if (!plan || !plan.active) return { error: "That plan is no longer available." }

  const { data: current } = await admin
    .from("subscriptions")
    .select("id, plan_id")
    .in("status", ["active", "trialing"])
  const currentRows = current ?? []
  if (currentRows.some((s) => s.plan_id === plan.id)) return { error: `You're already on the ${plan.name} plan.` }

  const now = new Date()
  const periodEnd = new Date(now)
  periodEnd.setMonth(periodEnd.getMonth() + 1)

  const { data: sub, error: subErr } = await admin
    .from("subscriptions")
    .insert({ plan_id: plan.id, status: "active", started_at: now.toISOString(), current_period_end: periodEnd.toISOString() })
    .select("id")
    .single()
  if (subErr) return { error: subErr.message }
  const oldIds = currentRows.map((s) => s.id)
  if (oldIds.length) await admin.from("subscriptions").update({ status: "cancelled" }).in("id", oldIds)

  // INV-YYYY-NNN, next in sequence; invoice_number is UNIQUE so retry on a race.
  const year = now.getFullYear()
  const today = now.toISOString().slice(0, 10)
  const due = new Date(now.getTime() + 14 * 86_400_000).toISOString().slice(0, 10)
  const month = now.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  let invoiceNumber = ""
  let invErr: { message: string; code?: string } | null = null
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: nums } = await admin.from("invoices").select("invoice_number").like("invoice_number", `INV-${year}-%`)
    const max = Math.max(0, ...(nums ?? []).map((r) => parseInt((r.invoice_number ?? "").split("-")[2] ?? "0", 10) || 0))
    invoiceNumber = `INV-${year}-${String(max + 1).padStart(3, "0")}`
    const { error } = await admin.from("invoices").insert({
      invoice_number: invoiceNumber,
      amount: Number(plan.price_monthly) || 0,
      issued_date: today,
      due_date: due,
      status: "pending",
      description: `${plan.name} plan — ${month}`,
    })
    invErr = error
    if (!error || error.code !== "23505") break
  }
  if (invErr) {
    // Undo the switch so billing never shows a plan without its invoice.
    await admin.from("subscriptions").delete().eq("id", sub.id)
    if (oldIds.length) await admin.from("subscriptions").update({ status: "active" }).in("id", oldIds)
    return { error: `Couldn't issue the invoice, so the plan wasn't changed: ${invErr.message}` }
  }

  await logActivity(
    { actorId: me.userId, action: "Changed plan", targetType: "billing", targetId: sub.id, description: `${plan.name} (${invoiceNumber})` },
    admin,
  )
  return { invoiceNumber }
}
