"use client";

import React from "react";
import Link from "next/link";
import { BarChart3, ChevronRight } from "lucide-react";

/**
 * --- DYNAMIC DATA ---
 */
const REPORTS_DATA = {
  header: {
    title: "Reports & Insights",
    subtitle: "Last 6 Months Overview",
    buttonText: "Open Full Reports",
    link: "/adminpanel/reports" 
  },
  stats: [
    { label: "Avg. Attendance", value: "91.5%" },
    { label: "Total Sessions", value: "1,248" },
    { label: "Completion Rate", value: "94.2%" },
    { label: "Satisfaction Score", value: "4.7/5.0" },
  ],
  charts: [
    {
      title: "Monthly Attendance Trends",
      type: "area",
      labels: ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"],
      values: [95, 90, 98, 92, 99, 95]
    },
    {
      title: "Student vs Mentor Activity",
      type: "line",
      labels: ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"],
      mentors: [40, 42, 43, 45, 46, 48],
      students: [240, 245, 250, 255, 258, 260]
    }
  ]
};

/**
 * --- COMPONENTS ---
 */

const ReportCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="min-w-0 flex-1">
    <h3 className="mb-[14px] text-[14px] font-semibold leading-none text-[#242424]">{title}</h3>
    <div className="relative h-[158px] overflow-hidden rounded-[6px] bg-[#fff7e8] px-[28px] py-[14px]">
      {children}
    </div>
  </div>
);

export default function ReportsInsightsSection() {
  return (
    <div className="bg-[#f4f4f4] px-4 pb-6 pt-5 font-['Poppins'] md:px-6">
    <div className="overflow-hidden rounded-[8px] border border-[#dddddd] bg-white">
      
      {/* Header Section */}
      <div className="flex flex-col gap-4 px-[16px] py-[17px] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-[12px]">
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[8px] bg-[#fff7e8]">
            <BarChart3 className="text-[#F9A618]" size={18} strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-[17px] font-semibold leading-none text-[#242424]">
              {REPORTS_DATA.header.title}
            </h2>
            <p className="mt-[5px] text-[11px] leading-none text-[#777777]">
              {REPORTS_DATA.header.subtitle}
            </p>
          </div>
        </div>
        <Link 
          href={REPORTS_DATA.header.link}
          className="flex h-[38px] items-center justify-center gap-[6px] rounded-[7px] bg-[#ffa313] px-[14px] text-[13px] font-semibold text-white transition-colors hover:bg-[#f29a0b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffa313]/30"
        >
          {REPORTS_DATA.header.buttonText} <ChevronRight size={15} strokeWidth={2.5} />
        </Link>
      </div>

      {/* Graphs Section */}
      <div className="grid gap-[20px] px-[16px] pb-[24px] pt-[10px] lg:grid-cols-2">
        {/* Monthly Attendance Trends (Area Chart Style) */}
        <ReportCard title={REPORTS_DATA.charts[0].title}>
          <div className="absolute inset-x-[34px] bottom-[29px] top-[18px]">
            <div className="absolute inset-0 grid grid-rows-4 border-l border-[#dfd2b8]">
              <span className="border-t border-dashed border-[#efd9ac]" />
              <span className="border-t border-dashed border-[#efd9ac]" />
              <span className="border-t border-dashed border-[#efd9ac]" />
              <span className="border-t border-dashed border-[#efd9ac]" />
            </div>
            <svg viewBox="0 0 400 100" className="relative z-10 h-full w-full">
              <path 
                d="M0,18 C70,23 90,28 140,19 C190,10 220,22 270,20 C320,12 350,16 400,18 L400,100 L0,100 Z" 
                fill="#F9A618" 
                fillOpacity="0.16"
              />
              <path 
                d="M0,18 C70,23 90,28 140,19 C190,10 220,22 270,20 C320,12 350,16 400,18" 
                fill="none" 
                stroke="#F9A618" 
                strokeWidth="1.5"
              />
            </svg>
          </div>
          <div className="absolute bottom-[12px] left-[34px] right-[18px] flex justify-between">
            {REPORTS_DATA.charts[0].labels.map((label, i) => (
              <span key={i} className="text-[10px] font-medium text-[#777777]">{label}</span>
            ))}
          </div>
          <div className="absolute left-[12px] top-[15px] flex h-[112px] flex-col justify-between text-[10px] font-medium text-[#777777]">
            <span>100</span><span>75</span><span>50</span><span>25</span><span>0</span>
          </div>
        </ReportCard>

        {/* Student vs Mentor Activity (Line Chart Style) */}
        <ReportCard title={REPORTS_DATA.charts[1].title}>
          <div className="absolute inset-x-[34px] bottom-[31px] top-[18px]">
            <div className="absolute inset-0 grid grid-rows-4 border-l border-[#dfd2b8]">
              <span className="border-t border-dashed border-[#efd9ac]" />
              <span className="border-t border-dashed border-[#efd9ac]" />
              <span className="border-t border-dashed border-[#efd9ac]" />
              <span className="border-t border-dashed border-[#efd9ac]" />
            </div>
               <svg viewBox="0 0 400 100" className="relative z-10 h-full w-full overflow-visible">
                 <polyline 
                  points="0,18 80,17 160,15 240,13 320,12 400,11" 
                  fill="none" 
                  stroke="#F9A618" 
                  strokeWidth="2" 
                 />
                 <polyline 
                  points="0,82 80,81 160,80 240,79 320,79 400,78" 
                  fill="none" 
                  stroke="#9b8a32" 
                  strokeWidth="2" 
                 />
                 {[0, 80, 160, 240, 320, 400].map((x, index) => (
                  <circle key={`student-${x}`} cx={x} cy={[18,17,15,13,12,11][index]} r="2.2" fill="#F9A618" />
                 ))}
                 {[0, 80, 160, 240, 320, 400].map((x, index) => (
                  <circle key={`mentor-${x}`} cx={x} cy={[82,81,80,79,79,78][index]} r="2.2" fill="#9b8a32" />
                 ))}
               </svg>
          </div>
            <div className="absolute bottom-[30px] left-[34px] right-[18px] flex justify-between">
              {REPORTS_DATA.charts[1].labels.map((label, i) => (
                <span key={i} className="text-[10px] font-medium text-[#777777]">{label}</span>
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
          <div className="absolute left-[12px] top-[15px] flex h-[112px] flex-col justify-between text-[10px] font-medium text-[#777777]">
            <span>260</span><span>130</span><span>65</span><span>0</span>
          </div>
        </ReportCard>
      </div>

      {/* Stats Footer Section */}
      <div className="grid grid-cols-2 gap-4 border-t border-[#eeeeee] px-[16px] py-[20px] md:grid-cols-4">
        {REPORTS_DATA.stats.map((stat, i) => (
          <div key={i} className="text-center">
            <p className="mb-[8px] text-[11px] font-medium leading-none text-[#777777]">
              {stat.label}
            </p>
            <p className="text-[12px] font-semibold leading-none text-[#444444]">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

    </div>
    </div>
  );
}
