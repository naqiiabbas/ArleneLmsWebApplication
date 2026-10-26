"use client";

import React from "react";
import Link from "next/link";
import { BarChart3, ChevronRight } from "lucide-react";
import type { ReportData } from "@/lib/data/reports.types";

// Charts are drawn from getReportData() (the same source as the Reports page);
// they used to be fixed SVG paths with hardcoded figures (1,248 sessions, 4.7/5).

const W = 400; // SVG viewBox width
const H = 100; // SVG viewBox height

const xAt = (i: number, n: number) => (n <= 1 ? W / 2 : (i * W) / (n - 1));

/** Tidy upper bound for a count axis. */
const niceMax = (n: number) => {
  if (n <= 4) return 4;
  const step = Math.pow(10, Math.floor(Math.log10(n)));
  return Math.ceil(n / step) * step;
};

const ReportCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="min-w-0 flex-1">
    <h3 className="mb-[14px] text-[14px] font-semibold leading-none text-[#242424]">{title}</h3>
    <div className="relative h-[158px] overflow-hidden rounded-[6px] bg-[#fff7e8] px-[28px] py-[14px]">{children}</div>
  </div>
);

const GridLines = () => (
  <div className="absolute inset-0 grid grid-rows-4 border-l border-[#dfd2b8]">
    <span className="border-t border-dashed border-[#efd9ac]" />
    <span className="border-t border-dashed border-[#efd9ac]" />
    <span className="border-t border-dashed border-[#efd9ac]" />
    <span className="border-t border-dashed border-[#efd9ac]" />
  </div>
);

export default function ReportsInsightsSection({ report }: { report: ReportData | null }) {
  if (!report) return null;

  const att = report.attendanceTrends;
  const attPts = att.map((d, i) => `${xAt(i, att.length)},${H - Math.max(0, Math.min(100, d.value))}`);
  const attLine = attPts.join(" ");
  const attArea = att.length ? `M${attPts[0]} L${attPts.slice(1).join(" L")} L${W},${H} L0,${H} Z` : "";

  const growth = report.growthData;
  const gMax = niceMax(Math.max(1, ...growth.map((g) => Math.max(g.students, g.mentors))));
  const gy = (v: number) => H - (v / gMax) * H;
  const studentPts = growth.map((g, i) => `${xAt(i, growth.length)},${gy(g.students)}`).join(" ");
  const mentorPts = growth.map((g, i) => `${xAt(i, growth.length)},${gy(g.mentors)}`).join(" ");

  return (
    <div className="bg-[#f4f4f4] px-4 pb-6 pt-5 font-['Poppins'] md:px-6">
      <div className="overflow-hidden rounded-[8px] border border-[#dddddd] bg-white">
        <div className="flex flex-col gap-4 px-[16px] py-[17px] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-[12px]">
            <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[8px] bg-[#fff7e8]">
              <BarChart3 className="text-[#F9A618]" size={18} strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-[17px] font-semibold leading-none text-[#242424]">Reports &amp; Insights</h2>
              <p className="mt-[5px] text-[11px] leading-none text-[#777777]">Last 6 Months Overview</p>
            </div>
          </div>
          <Link
            href="/adminpanel/reports"
            className="flex h-[38px] items-center justify-center gap-[6px] rounded-[7px] bg-[#ffa313] px-[14px] text-[13px] font-semibold text-white transition-colors hover:bg-[#f29a0b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffa313]/30"
          >
            Open Full Reports <ChevronRight size={15} strokeWidth={2.5} />
          </Link>
        </div>

        <div className="grid gap-[20px] px-[16px] pb-[24px] pt-[10px] lg:grid-cols-2">
          <ReportCard title="Monthly Attendance Trends (%)">
            <div className="absolute inset-x-[34px] bottom-[29px] top-[18px]">
              <GridLines />
              <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="relative z-10 h-full w-full overflow-visible">
                {attArea && <path d={attArea} fill="#F9A618" fillOpacity="0.16" />}
                <polyline points={attLine} fill="none" stroke="#F9A618" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
              </svg>
            </div>
            <div className="absolute bottom-[12px] left-[34px] right-[18px] flex justify-between">
              {att.map((d) => (
                <span key={d.month} className="text-[10px] font-medium text-[#777777]" title={`${d.value}%`}>{d.month}</span>
              ))}
            </div>
            <div className="absolute left-[8px] top-[15px] flex h-[112px] flex-col justify-between text-[10px] font-medium text-[#777777]">
              <span>100</span><span>75</span><span>50</span><span>25</span><span>0</span>
            </div>
          </ReportCard>

          <ReportCard title="Student vs Mentor Growth">
            <div className="absolute inset-x-[34px] bottom-[45px] top-[18px]">
              <GridLines />
              <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="relative z-10 h-full w-full overflow-visible">
                <polyline points={studentPts} fill="none" stroke="#F9A618" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                <polyline points={mentorPts} fill="none" stroke="#9b8a32" strokeWidth="2" vectorEffect="non-scaling-stroke" />
              </svg>
            </div>
            <div className="absolute bottom-[28px] left-[34px] right-[18px] flex justify-between">
              {growth.map((g) => (
                <span key={g.month} className="text-[10px] font-medium text-[#777777]" title={`${g.students} students, ${g.mentors} mentors`}>
                  {g.month}
                </span>
              ))}
            </div>
            <div className="absolute bottom-[8px] left-0 right-0 flex justify-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="h-1 w-3 rounded-full bg-[#9b8a32]" />
                <span className="text-[10px] font-semibold text-[#9b8a32]">Mentors</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-1 w-3 rounded-full bg-[#F9A618]" />
                <span className="text-[10px] font-semibold text-[#F9A618]">Students</span>
              </div>
            </div>
            <div className="absolute left-[8px] top-[15px] flex h-[97px] flex-col justify-between text-[10px] font-medium text-[#777777]">
              <span>{gMax}</span><span>{Math.round(gMax / 2)}</span><span>0</span>
            </div>
          </ReportCard>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-[#eeeeee] px-[16px] py-[20px] md:grid-cols-4">
          {report.stats.map((stat) => (
            <div key={stat.id} className="text-center">
              <p className="mb-[8px] text-[11px] font-medium leading-none text-[#777777]">{stat.label}</p>
              <p className="text-[14px] font-semibold leading-none text-[#444444]">{stat.value}</p>
              <p className="mt-[5px] text-[10px] leading-none text-[#aaaaaa]">{stat.trend}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
