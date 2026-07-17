"use client";

import React, { useMemo } from "react";

type InvoiceStatus = "Paid" | "Outstanding";

type Invoice = {
  id: string;
  program: string;
  amount: number;
  dateIssued: string;
  dueDate: string;
  status: InvoiceStatus;
};

type PaymentRecord = {
  date: string;
  amount: number;
  method: string;
  program: string;
  status: "Completed";
};

const invoices: Invoice[] = [
  { id: "INV-2025-001", program: "STEM Mentorship Program", amount: 50000, dateIssued: "2025-01-15", dueDate: "2025-01-30", status: "Paid" },
  { id: "INV-2025-002", program: "Leadership Development", amount: 30000, dateIssued: "2025-02-10", dueDate: "2025-02-25", status: "Paid" },
  { id: "INV-2025-003", program: "Women in Tech Initiative", amount: 15000, dateIssued: "2025-03-05", dueDate: "2025-03-20", status: "Outstanding" },
  { id: "INV-2025-004", program: "Tech Bootcamp Sponsorship", amount: 45000, dateIssued: "2025-03-15", dueDate: "2025-03-30", status: "Outstanding" },
  { id: "INV-2025-005", program: "Career Readiness Program", amount: 10000, dateIssued: "2025-01-20", dueDate: "2025-02-05", status: "Paid" },
  { id: "INV-2024-012", program: "Youth Entrepreneurship", amount: 35000, dateIssued: "2024-12-10", dueDate: "2024-12-25", status: "Paid" },
  { id: "INV-2025-006", program: "Data Science Academy", amount: 20000, dateIssued: "2025-02-15", dueDate: "2025-03-01", status: "Paid" },
  { id: "INV-2025-007", program: "Green Tech Innovation", amount: 40000, dateIssued: "2025-03-10", dueDate: "2025-03-25", status: "Outstanding" },
];

const paymentHistory: PaymentRecord[] = [
  { date: "2025-03-01", amount: 50000, method: "Wire Transfer", program: "STEM Mentorship Program", status: "Completed" },
  { date: "2025-02-28", amount: 30000, method: "ACH", program: "Leadership Development", status: "Completed" },
  { date: "2025-02-15", amount: 20000, method: "Check", program: "Data Science Academy", status: "Completed" },
  { date: "2025-01-25", amount: 10000, method: "Wire Transfer", program: "Career Readiness Program", status: "Completed" },
  { date: "2024-12-20", amount: 35000, method: "ACH", program: "Youth Entrepreneurship", status: "Completed" },
];

const money = (value: number) => `$${value.toLocaleString()}`;

const statusBadge = (status: InvoiceStatus | "Completed") => {
  if (status === "Paid" || status === "Completed") {
    return "bg-[#dcfce7] text-[#008236]";
  }
  return "bg-[#ffedd4] text-[#fb2c36]";
};

export default function Payment() {
  const totals = useMemo(() => {
    const totalPaid = invoices.filter((i) => i.status === "Paid").reduce((sum, i) => sum + i.amount, 0);
    const outstanding = invoices.filter((i) => i.status === "Outstanding").reduce((sum, i) => sum + i.amount, 0);
    return { totalPaid, outstanding, totalInvoices: invoices.length };
  }, []);

  const downloadInvoicePdf = async (invoice: Invoice) => {
    if (typeof window === "undefined") return;
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Invoice", 14, 18);
    doc.setFontSize(11);
    doc.text(`Invoice ID: ${invoice.id}`, 14, 30);
    doc.text(`Program: ${invoice.program}`, 14, 38);
    doc.text(`Amount: ${money(invoice.amount)}`, 14, 46);
    doc.text(`Date Issued: ${invoice.dateIssued}`, 14, 54);
    doc.text(`Due Date: ${invoice.dueDate}`, 14, 62);
    doc.text(`Status: ${invoice.status}`, 14, 70);

    doc.save(`${invoice.id}.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#F4F4F5] px-[24px] pb-[40px] pt-[28px] font-['Poppins',_sans-serif] text-[#1f2937]">
      <div className="w-full space-y-[16px]">
        <div>
          <h1 className="text-[28px] font-semibold leading-none text-[#1f2937]">Payments & Invoices</h1>
          <p className="mt-[16px] text-[15px] font-normal leading-none text-[#667085]">View and manage your payment history and invoices.</p>
        </div>

        <div className="grid grid-cols-1 gap-[16px] md:grid-cols-3">
          <SummaryCard title="Total Paid" value={money(totals.totalPaid)} valueClass="text-green-600" />
          <SummaryCard title="Outstanding" value={money(totals.outstanding)} valueClass="text-orange-600" />
          <SummaryCard title="Total Invoices" value={String(totals.totalInvoices)} valueClass="text-gray-800" />
        </div>

        <SectionCard title="Invoices">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left">
              <thead className="bg-[#f9fafb] text-[#667085]">
                <tr>
                  <th className="px-[24px] py-[28px] text-[14px] font-semibold leading-none">Invoice ID</th>
                  <th className="px-[24px] py-[28px] text-[14px] font-semibold leading-none">Program</th>
                  <th className="px-[24px] py-[28px] text-[14px] font-semibold leading-none">Amount</th>
                  <th className="px-[24px] py-[28px] text-[14px] font-semibold leading-none">Date Issued</th>
                  <th className="px-[24px] py-[28px] text-[14px] font-semibold leading-none">Due Date</th>
                  <th className="px-[24px] py-[28px] text-[14px] font-semibold leading-none">Status</th>
                  <th className="px-[24px] py-[28px] text-[14px] font-semibold leading-none">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d9d9d9]">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="h-[88px]">
                    <td className="px-[24px] py-[22px] text-[14px] font-normal text-[#1f2937]">{invoice.id}</td>
                    <td className="px-[24px] py-[22px] text-[14px] font-normal text-[#1f2937]">{invoice.program}</td>
                    <td className="px-[24px] py-[22px] text-[14px] font-normal text-[#1f2937]">{money(invoice.amount)}</td>
                    <td className="px-[24px] py-[22px] text-[14px] font-normal text-[#1f2937]">{invoice.dateIssued}</td>
                    <td className="px-[24px] py-[22px] text-[14px] font-normal text-[#1f2937]">{invoice.dueDate}</td>
                    <td className="px-[24px] py-[22px]">
                      <span className={`inline-flex h-[39px] items-center rounded-full px-[16px] text-[14px] font-normal ${statusBadge(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-[24px] py-[22px]">
                      <button
                        onClick={() => downloadInvoicePdf(invoice)}
                        className="flex items-center gap-[8px] text-[14px] font-normal text-[#ff9f0f]"
                      >
                        <img src="/images/payment-download-icon.svg" alt="" aria-hidden="true" className="h-[16px] w-[16px]" />
                        PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="Payment History">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-[#f9fafb] text-[#667085]">
                <tr>
                  <th className="px-[24px] py-[28px] text-[14px] font-semibold leading-none">Date</th>
                  <th className="px-[24px] py-[28px] text-[14px] font-semibold leading-none">Amount</th>
                  <th className="px-[24px] py-[28px] text-[14px] font-semibold leading-none">Payment Method</th>
                  <th className="px-[24px] py-[28px] text-[14px] font-semibold leading-none">Program</th>
                  <th className="px-[24px] py-[28px] text-[14px] font-semibold leading-none">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d9d9d9]">
                {paymentHistory.map((item, idx) => (
                  <tr key={`${item.date}-${idx}`} className="h-[88px]">
                    <td className="px-[24px] py-[22px] text-[14px] font-normal text-[#1f2937]">{item.date}</td>
                    <td className="px-[24px] py-[22px] text-[14px] font-semibold text-[#1f2937]">{money(item.amount)}</td>
                    <td className="px-[24px] py-[22px] text-[14px] font-normal text-[#1f2937]">{item.method}</td>
                    <td className="px-[24px] py-[22px] text-[14px] font-normal text-[#1f2937]">{item.program}</td>
                    <td className="px-[24px] py-[22px]">
                      <span className={`inline-flex h-[39px] items-center rounded-full px-[16px] text-[14px] font-normal ${statusBadge(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  valueClass,
}: {
  title: string;
  value: string;
  valueClass: string;
}) {
  return (
    <div className="flex h-[136px] flex-col justify-center rounded-[8px] border border-[#d9d9d9] bg-white px-[24px] shadow-[0_2px_2px_rgba(0,0,0,0.12)]">
      <p className="text-[15px] font-normal leading-none text-[#667085]">{title}</p>
      <p className={`mt-[18px] max-w-[80px] text-[22px] font-semibold leading-[28px] ${valueClass}`}>{value}</p>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[8px] border border-[#d9d9d9] bg-white shadow-[0_2px_2px_rgba(0,0,0,0.12)]">
      <div className="border-b border-[#d9d9d9] px-[24px] py-[28px]">
        <h2 className="text-[22px] font-semibold leading-none text-[#1f2937]">{title}</h2>
      </div>
      <div>{children}</div>
    </div>
  );
}
