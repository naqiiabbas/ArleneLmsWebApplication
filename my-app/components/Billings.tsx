"use client";

import React, { useEffect, useState } from "react";
import { getBillingData } from "@/lib/data/billing";
import type { BillingData, InvoiceStatus, UIInvoice } from "@/lib/data/billing.types";

type BillingTab = "Overview" | "Invoices" | "Plans & Pricing";

const STAT_STYLES = {
  totalRevenue: {
    label: "Total Revenue",
    icon: "/images/admin-billing-revenue.svg",
    cardClass: "border-[#f4eadc] bg-[#fbf7ef]",
    valueClass: "text-[#f9a313]",
    subtextClass: "text-[#00a63e]",
  },
  pending: {
    label: "Pending",
    icon: "/images/admin-billing-pending.svg",
    cardClass: "border-[#f6e6c8] bg-[#fff3de]",
    valueClass: "text-[#ff4f00]",
    subtextClass: "text-[#666666]",
  },
  overdue: {
    label: "Overdue",
    icon: "/images/admin-billing-overdue.svg",
    cardClass: "border-[#f8dbe2] bg-[#ffe7eb]",
    valueClass: "text-[#ff0000]",
    subtextClass: "text-[#666666]",
  },
  totalInvoices: {
    label: "Total Invoices",
    icon: "/images/admin-billing-card.svg",
    cardClass: "border-[#e3e3e3] bg-white",
    valueClass: "text-[#f9a313]",
    subtextClass: "text-[#666666]",
  },
};

const money = (n: number) => `$${n.toLocaleString("en-US")}`;
const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;

const EMPTY_BILLING: BillingData = {
  totalRevenue: 0,
  pendingAmount: 0,
  pendingCount: 0,
  overdueAmount: 0,
  overdueCount: 0,
  totalInvoices: 0,
  invoices: [],
  plans: [],
  currentPlan: null,
};

export default function BillingSection() {
  const [activeTab, setActiveTab] = useState<BillingTab>("Overview");
  const [isMounted, setIsMounted] = useState(false);
  const [data, setData] = useState<BillingData | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    getBillingData()
      .then(setData)
      .catch((e) => setNotice((e as Error).message));
  }, []);

  const billing = data ?? EMPTY_BILLING;

  const handleExport = async () => {
    if (typeof window === "undefined") return;
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Billing & Plans Report", 14, 20);
      doc.setFontSize(10);
      doc.text(`Tab: ${activeTab} | Date: ${new Date().toLocaleDateString()}`, 14, 28);

      autoTable(doc, {
        startY: 35,
        head: [["Invoice #", "Organization", "Amount", "Status", "Due Date"]],
        body: billing.invoices.map((invoice) => [invoice.id, invoice.organization, `$${invoice.amount.toFixed(2)}`, invoice.status, invoice.dueDate]),
        headStyles: { fillColor: [249, 166, 24] },
        theme: "striped",
      });

      doc.save(`Billing_Report_${activeTab.replace(/\s/g, "_")}.pdf`);
    } catch (error) {
      console.error("PDF Export failed:", error);
    }
  };

  if (!isMounted) return <div className="min-h-screen bg-[#f4f4f4]" />;

  return (
    <section className="min-h-full bg-[#f4f4f4] px-[24px] py-[24px] font-[Poppins] text-[#111111]">
      <div className="mb-[24px] flex items-center justify-between">
        <div className="flex items-center gap-[12px]">
          <span className="flex h-[48px] w-[48px] items-center justify-center rounded-[8px] bg-[#fff5e4]">
            <img src="/images/admin-billing-header.svg" alt="" aria-hidden="true" className="h-[24px] w-[24px]" />
          </span>
          <div>
            <h1 className="text-[22px] font-bold leading-[1.15]">Billing and Plans</h1>
            <p className="mt-[4px] text-[15px] font-normal leading-none text-[#666666]">Manage subscriptions and invoices</p>
          </div>
        </div>

        <button
          onClick={handleExport}
          className="flex h-[45px] items-center gap-[9px] rounded-[10px] bg-[#f9a313] px-[23px] text-[16px] font-medium text-white transition-colors hover:bg-[#f0a018]"
        >
          <DownloadWhiteGlyph />
          Export Report
        </button>
      </div>

      {notice && (
        <div className="mb-4 rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-semibold text-red-700">
          {notice}
        </div>
      )}

      <div className="overflow-hidden rounded-[8px] border border-[#d9d9d9] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="flex h-[48px] items-end gap-[20px] border-b border-[#d9d9d9] px-[22px]">
          {(["Overview", "Invoices", "Plans & Pricing"] as BillingTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative h-full px-[2px] text-[15px] font-normal transition-colors ${
                activeTab === tab ? "text-[#f9a313]" : "text-[#666666] hover:text-[#f9a313]"
              }`}
            >
              {tab}
              {activeTab === tab && <span className="absolute bottom-0 left-0 h-[1px] w-full bg-[#f9a313]" />}
            </button>
          ))}
        </div>

        <div className="p-[24px]">
          {activeTab === "Overview" && <Overview data={billing} />}
          {activeTab === "Invoices" && <InvoicesTable data={billing} loading={!data} onDownload={handleExport} />}
          {activeTab === "Plans & Pricing" && <Plans data={billing} />}
        </div>
      </div>
    </section>
  );
}

const Overview = ({ data }: { data: BillingData }) => {
  const cards = [
    { ...STAT_STYLES.totalRevenue, value: money(data.totalRevenue), subtext: "paid invoices" },
    { ...STAT_STYLES.pending, value: money(data.pendingAmount), subtext: plural(data.pendingCount, "invoice") },
    { ...STAT_STYLES.overdue, value: money(data.overdueAmount), subtext: plural(data.overdueCount, "invoice") },
    { ...STAT_STYLES.totalInvoices, value: String(data.totalInvoices), subtext: "all time" },
  ];
  return (
    <div className="space-y-[22px]">
      <div className="grid grid-cols-1 gap-[18px] md:grid-cols-2 xl:grid-cols-4">
        {cards.map((stat) => (
          <article key={stat.label} className={`flex h-[110px] flex-col justify-between rounded-[8px] border px-[22px] py-[18px] ${stat.cardClass}`}>
            <div className="flex items-center justify-between">
              <span className="text-[15px] text-[#666666]">{stat.label}</span>
              <img src={stat.icon} alt="" aria-hidden="true" className="h-[20px] w-[20px]" />
            </div>
            <div>
              <p className={`text-[24px] leading-none ${stat.valueClass}`}>{stat.value}</p>
              <p className={`mt-[8px] text-[12px] ${stat.subtextClass}`}>{stat.subtext}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="rounded-[8px] border border-[#d9d9d9] bg-white p-[24px]">
        <p className="text-[14px] font-semibold uppercase tracking-wide text-[#777777]">Current Plan</p>
        <div className="mt-[12px] flex items-center justify-between gap-[18px]">
          {data.currentPlan ? (
            <div>
              <h2 className="text-[22px] font-semibold text-[#f9a313]">{data.currentPlan.name} Plan</h2>
              <p className="mt-[6px] text-[14px] text-[#666666]">
                {money(data.currentPlan.price)}/month{data.currentPlan.renews ? ` · Renews on ${data.currentPlan.renews}` : ""}
              </p>
            </div>
          ) : (
            <div>
              <h2 className="text-[22px] font-semibold text-[#666666]">No active plan</h2>
              <p className="mt-[6px] text-[14px] text-[#666666]">Choose a plan below to get started.</p>
            </div>
          )}
          <button className="h-[42px] rounded-[8px] border border-[#f9a313] px-[22px] text-[15px] font-medium text-[#f9a313] hover:bg-[#fff7e8]">
            {data.currentPlan ? "Upgrade Plan" : "Choose Plan"}
          </button>
        </div>
      </div>
    </div>
  );
};

const InvoicesTable = ({ data, loading, onDownload }: { data: BillingData; loading: boolean; onDownload: () => void }) => (
  <div className="overflow-x-auto">
    <table className="w-full min-w-[920px] border-collapse">
      <thead>
        <tr className="h-[45px] bg-[#f1f1f1] text-left text-[15px] font-normal text-[#666666]">
          <th className="px-[24px] font-normal">Invoice #</th>
          <th className="px-[24px] font-normal">Organization</th>
          <th className="px-[24px] font-normal">Amount</th>
          <th className="px-[24px] font-normal">Due Date</th>
          <th className="px-[24px] font-normal">Paid Date</th>
          <th className="px-[24px] font-normal">Status</th>
          <th className="px-[24px] text-center font-normal">Actions</th>
        </tr>
      </thead>
      <tbody>
        {loading && (
          <tr><td colSpan={7} className="px-[24px] py-[40px] text-center text-[#777777]">Loading invoices...</td></tr>
        )}
        {!loading && data.invoices.length === 0 && (
          <tr><td colSpan={7} className="px-[24px] py-[40px] text-center text-[#777777]">No invoices yet.</td></tr>
        )}
        {data.invoices.map((invoice) => (
          <tr key={invoice.id} className="h-[66px] border-b border-[#e0e0e0] text-[15px]">
            <td className="px-[24px] text-[#111111]">{invoice.id}</td>
            <td className="px-[24px] text-[#666666]">{invoice.organization}</td>
            <td className="px-[24px] text-[#111111]">
              <Amount value={invoice.amount} />
            </td>
            <td className="px-[24px] text-[#666666]">{invoice.dueDate}</td>
            <td className="px-[24px] text-[#666666]">{invoice.paidDate}</td>
            <td className="px-[24px]">
              <StatusBadge status={invoice.status} />
            </td>
            <td className="px-[24px] text-center">
              <button onClick={onDownload} className="inline-flex h-[32px] w-[32px] items-center justify-center rounded-[6px] transition-colors hover:bg-[#eaf3ff]" aria-label={`Download ${invoice.id}`}>
                <img src="/images/admin-billing-download.svg" alt="" aria-hidden="true" className="h-[16px] w-[16px]" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Plans = ({ data }: { data: BillingData }) => {
  const plans = data.plans.length
    ? data.plans
    : [
        { name: "Basic", price: 49, features: [] },
        { name: "Professional", price: 99, features: [] },
        { name: "Enterprise", price: 199, features: [] },
      ];
  return (
    <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-3">
      {plans.map((plan) => {
        const isCurrent = data.currentPlan?.name === plan.name;
        return (
          <article key={plan.name} className={`rounded-[8px] border p-[24px] ${isCurrent ? "border-[#f9a313] bg-[#fffaf1]" : "border-[#d9d9d9] bg-white"}`}>
            <h2 className="text-[20px] font-semibold">{plan.name}</h2>
            <p className="mt-[12px] text-[30px] font-semibold text-[#f9a313]">{money(plan.price)}</p>
            <p className="mt-[4px] text-[14px] text-[#666666]">per month</p>
            {plan.features.length > 0 && (
              <ul className="mt-[14px] space-y-[6px] text-[13px] text-[#666666]">
                {plan.features.map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>
            )}
            <button className={`mt-[22px] h-[42px] w-full rounded-[8px] text-[15px] font-medium ${isCurrent ? "bg-[#f9a313] text-white" : "border border-[#d9d9d9] text-[#666666]"}`}>
              {isCurrent ? "Current Plan" : "Choose Plan"}
            </button>
          </article>
        );
      })}
    </div>
  );
};

const StatusBadge = ({ status }: { status: InvoiceStatus }) => {
  const styles: Record<InvoiceStatus, string> = {
    Paid: "bg-[#dcfce7] text-[#008236]",
    Pending: "bg-[#ffedd4] text-[#c2410c]",
    Overdue: "bg-[#ffe2e2] text-[#c10007]",
  };

  return <span className={`inline-flex h-[24px] items-center rounded-full px-[12px] text-[13px] font-normal ${styles[status]}`}>{status}</span>;
};

const Amount = ({ value }: { value: number }) => <span>${value.toFixed(2)}</span>;

const DownloadWhiteGlyph = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M8 2.5v7.2m0 0 2.9-2.9M8 9.7 5.1 6.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 10.5v1.8c0 .7.5 1.2 1.2 1.2h7.6c.7 0 1.2-.5 1.2-1.2v-1.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);
