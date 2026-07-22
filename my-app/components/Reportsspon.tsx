"use client";

import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { getSponsorReports } from "@/lib/data/sponsor";
import type { SponsorReports } from "@/lib/data/sponsor.types";

const money = (v: number) => `$${(v / 1000).toFixed(0)}K`;
const fullMoney = (v: number) => `$${v.toLocaleString()}`;

const EMPTY: SponsorReports = { metrics: { students: 0, sessions: 0, investment: 0, avgSatisfaction: 0, programs: 0 }, performance: [], distribution: [], financial: [], impact: [] };

export default function Reportsspon() {
  const [data, setData] = useState<SponsorReports | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    getSponsorReports()
      .then(setData)
      .catch((e) => setNotice((e as Error).message));
  }, []);

  const { metrics, performance: performanceRows, distribution: pieData, financial: financialData, impact: impactData } = data ?? EMPTY;
  const totals = { students: metrics.students, sponsored: metrics.investment, avgSat: `${metrics.avgSatisfaction}%` };

  const exportCsv = () => {
    const header = "Program,Students,Sessions,Investment,Satisfaction,ROI\n";
    const rows = performanceRows
      .map((r) => `${r.program},${r.students},${r.sessions},${r.investment},${r.satisfaction},${r.roi}`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sponsorship-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPdf = async () => {
    if (typeof window === "undefined") return;
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Reports & Analytics", 14, 16);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 23);
    doc.text(`Total Students Reached: ${totals.students}`, 14, 30);
    doc.text(`Sponsored Amount: ${fullMoney(totals.sponsored)}`, 14, 36);
    doc.text(`Average Satisfaction: ${totals.avgSat}`, 14, 42);

    autoTable(doc, {
      startY: 48,
      head: [["Program", "Students", "Sessions", "Investment", "Satisfaction", "ROI"]],
      body: performanceRows.map((r) => [
        r.program,
        String(r.students),
        String(r.sessions),
        fullMoney(r.investment),
        r.satisfaction,
        r.roi,
      ]),
      headStyles: { fillColor: [249, 166, 24] },
      styles: { fontSize: 9 },
    });

    doc.save(`sponsorship-report-${new Date().toISOString().split("T")[0]}.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#F4F4F5] px-[24px] pb-[40px] pt-[28px] font-['Poppins',_sans-serif] text-[#1f2937]">
      <div className="w-full space-y-[16px]">
        <div className="flex flex-wrap items-start justify-between gap-[20px]">
          <div>
            <h1 className="text-[28px] font-semibold leading-none text-[#1f2937]">Reports & Analytics</h1>
            <p className="mt-[16px] text-[15px] font-normal leading-none text-[#667085]">Track your sponsorship impact and financial summary.</p>
          </div>
          <div className="flex gap-[16px]">
            <button
              onClick={exportCsv}
              className="flex h-[56px] items-center gap-[10px] rounded-[8px] border border-[#d9d9d9] bg-white px-[32px] text-[14px] font-semibold text-[#1f2937]"
            >
              <MaskIcon src="/images/payment-download-icon.svg" className="h-[16px] w-[16px] bg-[#1f2937]" />
              Export CSV
            </button>
            <button
              onClick={exportPdf}
              className="flex h-[56px] items-center gap-[10px] rounded-[8px] bg-[#F9A618] px-[32px] text-[14px] font-semibold text-white"
            >
              <MaskIcon src="/images/payment-download-icon.svg" className="h-[16px] w-[16px] bg-white" />
              Export PDF
            </button>
          </div>
        </div>

        {notice && (
          <div className="rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-semibold text-red-700">{notice}</div>
        )}

        <div className="grid grid-cols-1 gap-[24px] sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Total Students Reached" value={metrics.students.toLocaleString()} sub={`Across ${metrics.programs} programs`} subClass="text-[#00a63e]" />
          <MetricCard title="Sessions Sponsored" value={String(metrics.sessions)} sub="Completed sessions" subClass="text-[#00a63e]" />
          <MetricCard title="Total Investment" value={money(metrics.investment)} sub={`Across ${metrics.programs} programs`} subClass="text-[#155dfc]" />
          <MetricCard title="Avg Satisfaction" value={`${metrics.avgSatisfaction}%`} sub="Program average" subClass="text-[#00a63e]" />
        </div>

        <Card title="Investment Over Time">
          <div className="h-[320px]">
            {impactData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-[14px] text-[#667085]">No payment activity yet.</div>
            ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={impactData} margin={{ top: 8, right: 22, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dddddd" />
                <XAxis dataKey="month" tick={{ fill: "#667085", fontSize: 12 }} axisLine={{ stroke: "#9ca3af" }} tickLine={false} />
                <YAxis tick={{ fill: "#667085", fontSize: 12 }} axisLine={{ stroke: "#9ca3af" }} tickLine={false} tickFormatter={(v: number) => money(v)} />
                <Tooltip formatter={(v: number) => fullMoney(v)} />
                <Legend iconType="plainline" wrapperStyle={{ fontSize: 14, color: "#667085" }} />
                <Line type="monotone" dataKey="amount" stroke="#ff9f0f" strokeWidth={2} dot={{ r: 3, strokeWidth: 2, fill: "#fff" }} name="Sponsored ($)" />
              </LineChart>
            </ResponsiveContainer>
            )}
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-[16px] lg:grid-cols-2">
          <Card title="Financial Summary">
            <div className="h-[300px]">
              {financialData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-[14px] text-[#667085]">No financial activity yet.</div>
              ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={financialData} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#dddddd" />
                  <XAxis dataKey="quarter" tick={{ fill: "#667085", fontSize: 12 }} tickLine={false} axisLine={{ stroke: "#9ca3af" }} />
                  <YAxis tick={{ fill: "#667085", fontSize: 12 }} tickLine={false} axisLine={{ stroke: "#9ca3af" }} tickFormatter={(v: number) => money(v)} />
                  <Tooltip formatter={(v: number) => fullMoney(v)} />
                  <Legend iconType="square" wrapperStyle={{ fontSize: 14 }} />
                  <Bar dataKey="amountSpent" fill="#3B82F6" name="Amount Spent" barSize={42} />
                  <Bar dataKey="sponsoredAmount" fill="#F9A618" name="Sponsored Amount" barSize={42} />
                </BarChart>
              </ResponsiveContainer>
              )}
            </div>
          </Card>

          <Card title="Program Distribution">
            <div className="h-[300px]">
              {pieData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-[14px] text-[#667085]">No programs yet.</div>
              ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    label={({ name, value }) => `${name} ${value}%`}
                    labelLine={false}
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
              )}
            </div>
          </Card>
        </div>

        <Card title="Program Performance Details">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left">
              <thead className="bg-[#f9fafb] text-[#667085]">
                <tr>
                  <th className="px-[24px] py-[28px] text-[14px] font-semibold leading-none">Program</th>
                  <th className="px-[24px] py-[28px] text-[14px] font-semibold leading-none">Students</th>
                  <th className="px-[24px] py-[28px] text-[14px] font-semibold leading-none">Sessions</th>
                  <th className="px-[24px] py-[28px] text-[14px] font-semibold leading-none">Investment</th>
                  <th className="px-[24px] py-[28px] text-[14px] font-semibold leading-none">Satisfaction</th>
                  <th className="px-[24px] py-[28px] text-[14px] font-semibold leading-none">ROI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d9d9d9]">
                {performanceRows.length === 0 && (
                  <tr><td colSpan={6} className="px-[24px] py-[28px] text-center text-[14px] text-[#667085]">No program data yet.</td></tr>
                )}
                {performanceRows.map((row) => (
                  <tr key={row.program} className="h-[72px]">
                    <td className="px-[24px] py-[22px] text-[14px] font-normal text-[#1f2937]">{row.program}</td>
                    <td className="px-[24px] py-[22px] text-[14px] font-normal text-[#1f2937]">{row.students}</td>
                    <td className="px-[24px] py-[22px] text-[14px] font-normal text-[#1f2937]">{row.sessions}</td>
                    <td className="px-[24px] py-[22px] text-[14px] font-normal text-[#1f2937]">{fullMoney(row.investment)}</td>
                    <td className="px-[24px] py-[22px] text-[14px] font-normal text-[#1f2937]">{row.satisfaction}</td>
                    <td className={`px-[24px] py-[22px] text-[14px] font-normal ${row.roi === "High" ? "text-[#00a63e]" : row.roi === "Medium" ? "text-[#155dfc]" : "text-red-600"}`}>
                      {row.roi}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  sub,
  subClass = "text-[#00a63e]",
}: {
  title: string;
  value: string;
  sub: string;
  subClass?: string;
}) {
  return (
    <div className="flex h-[132px] flex-col justify-center rounded-[8px] border border-[#d9d9d9] bg-white px-[24px] shadow-[0_2px_2px_rgba(0,0,0,0.12)]">
      <p className="text-[15px] font-normal leading-none text-[#667085]">{title}</p>
      <p className="mt-[16px] text-[22px] font-semibold leading-none text-[#1f2937]">{value}</p>
      <p className={`mt-[16px] text-[14px] font-normal leading-none ${subClass}`}>{sub}</p>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[8px] border border-[#d9d9d9] bg-white shadow-[0_2px_2px_rgba(0,0,0,0.12)]">
      <div className="px-[24px] pt-[28px]">
        <h2 className="text-[22px] font-semibold leading-none text-[#1f2937]">{title}</h2>
      </div>
      <div className="px-[24px] pb-[28px] pt-[18px]">{children}</div>
    </div>
  );
}

function MaskIcon({ src, className }: { src: string; className: string }) {
  return (
    <span
      aria-hidden="true"
      className={`block ${className}`}
      style={{
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
    />
  );
}
