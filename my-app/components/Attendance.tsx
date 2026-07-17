"use client";

import React, { useState, useMemo, useRef } from 'react';
import { Poppins } from 'next/font/google';
// @ts-ignore
import type { toJpeg } from 'html-to-image';
import { 
  Download,
  ChevronDown,
  Funnel
} from 'lucide-react';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

const ATTENDANCE_HISTORY = [
  { id: 1, date: "Nov 22, 2025", month: "November", session: "Career Development", mentor: "Dr. Sarah Mitchell", time: "2:00 PM - 3:30 PM", status: "Present" },
  { id: 2, date: "Nov 18, 2025", month: "November", session: "Skills Workshop", mentor: "Prof. James Wilson", time: "10:00 AM - 11:30 AM", status: "Present" },
  { id: 3, date: "Nov 15, 2025", month: "November", session: "Progress Review", mentor: "Dr. Sarah Mitchell", time: "2:00 PM - 3:00 PM", status: "Present" },
  { id: 4, date: "Nov 11, 2025", month: "November", session: "Goal Setting", mentor: "Prof. James Wilson", time: "10:00 AM - 11:30 AM", status: "Absent" },
  { id: 5, date: "Nov 8, 2025", month: "November", session: "Career Development", mentor: "Dr. Sarah Mitchell", time: "2:00 PM - 3:30 PM", status: "Present" },
  { id: 6, date: "Nov 4, 2025", month: "November", session: "Academic Planning", mentor: "Prof. James Wilson", time: "10:00 AM - 11:30 AM", status: "Present" },
  { id: 7, date: "Nov 1, 2025", month: "November", session: "Monthly Review", mentor: "Dr. Sarah Mitchell", time: "2:00 PM - 3:00 PM", status: "Absent" },
];

const ATTENDANCE_STATS = [
  { id: 1, label: "Total Sessions", value: "25", icon: "/images/attendance-total-sessions.svg" },
  { id: 2, label: "Attended", value: "23", icon: "/images/attendance-attended.svg" },
  { id: 3, label: "Missed", value: "2", icon: "/images/attendance-missed.svg" },
  { id: 4, label: "Attendance Rate", value: "92%", icon: "/images/attendance-rate.svg" },
  { id: 5, label: "Attendance Time", value: "2:00", icon: "/images/attendance-time.svg" }
];

export default function AttendanceSection() {
  const [selectedMonth, setSelectedMonth] = useState("All Months");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const reportRef = useRef<HTMLDivElement>(null);

  const filteredHistory = useMemo(() => {
    return ATTENDANCE_HISTORY.filter(row => {
      const matchesMonth = selectedMonth === "All Months" || row.month === selectedMonth;
      const matchesStatus = selectedStatus === "All Status" || row.status === selectedStatus;
      return matchesMonth && matchesStatus;
    });
  }, [selectedMonth, selectedStatus]);

  // --- New Stable Export Logic ---
  const handleExportReport = async () => {
    if (typeof window !== "undefined" && reportRef.current) {
      try {
        // Dynamically loading html-to-image
        const { toJpeg } = await import('html-to-image');
        
        const dataUrl = await toJpeg(reportRef.current, { 
          quality: 0.95,
          backgroundColor: '#F8FAFC',
          pixelRatio: 2, // Sharp image
        });

        const link = document.createElement('a');
        link.download = `Attendance_Report_${Date.now()}.jpg`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error("Export failed:", err);
        alert("Report download mein masla aa raha hai.");
      }
    }
  };

  const months = ["All Months", ...Array.from(new Set(ATTENDANCE_HISTORY.map(item => item.month)))];
  const statuses = ["All Status", "Present", "Absent"];

  return (
    <section className={`${poppins.variable} min-h-full w-full overflow-x-hidden bg-[#f5f5f5] px-4 pb-6 pt-6 font-sans md:px-6 md:pt-7`}>
      <div className="mb-[26px] flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-[24px] font-semibold leading-none text-[#111111]">Attendance</h1>
          <p className="mt-[14px] text-[16px] font-normal leading-none text-[#666666]">Track your mentoring session attendance and history</p>
        </div>
        <button 
          onClick={handleExportReport}
          className="flex h-[48px] w-full items-center justify-center gap-[10px] rounded-[10px] bg-[#ffa313] px-[26px] text-[16px] font-semibold text-white transition hover:bg-[#f59a0d] md:w-auto"
        >
          <Download size={18} strokeWidth={2.4} />
          Export Report
        </button>
      </div>

      <div ref={reportRef}>
        {/* Stats Grid */}
        <div className="mb-[24px] grid grid-cols-1 gap-[16px] sm:grid-cols-2 lg:grid-cols-5">
          {ATTENDANCE_STATS.map((stat) => {
            return (
              <div key={stat.id} className="h-[126px] min-w-0 rounded-[12px] border border-[#dddddd] bg-white px-[22px] py-[24px]">
                <div className="grid h-[48px] grid-cols-[48px_minmax(0,1fr)] items-center gap-3">
                  <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center overflow-hidden rounded-[10px]">
                    <img src={stat.icon} alt="" className="h-[48px] w-[48px]" />
                  </div>
                  <span className="flex h-[48px] items-center justify-end text-[30px] font-medium leading-none text-[#111111]">
                    {stat.value}
                  </span>
                </div>
                <p className="mt-[15px] truncate text-[15px] font-normal leading-none text-[#666666]">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-[12px] border border-[#dddddd] bg-white">
          <div className="flex flex-col gap-4 border-b border-[#e5e5e5] px-[24px] py-[24px] md:flex-row md:items-center md:justify-between">
            <h2 className="text-[20px] font-normal leading-none text-[#111111]">Attendance History</h2>
            <div className="flex flex-col gap-[10px] sm:flex-row sm:flex-wrap sm:items-center">
              <div className="flex items-center gap-[8px] text-[14px] font-normal text-[#666666]">
                <Funnel size={16} strokeWidth={1.8} />
                Filter:
              </div>
              <div className="relative w-full sm:w-[153px]">
                <select 
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="h-[42px] w-full cursor-pointer appearance-none rounded-[9px] bg-[#f1f1f1] pl-[18px] pr-[42px] text-[14px] font-normal text-[#777777] outline-none"
                >
                  {months.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-[14px] top-1/2 -translate-y-1/2 text-[#666666]" size={22} strokeWidth={2} />
              </div>
              <div className="relative w-full sm:w-[138px]">
                <select 
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="h-[42px] w-full cursor-pointer appearance-none rounded-[9px] bg-[#f1f1f1] pl-[18px] pr-[42px] text-[14px] font-normal text-[#777777] outline-none"
                >
                  {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-[14px] top-1/2 -translate-y-1/2 text-[#666666]" size={22} strokeWidth={2} />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead>
                <tr className="bg-[#f3f3f3]">
                  <th className="px-[24px] py-[17px] text-[14px] font-semibold text-[#666666]">Date</th>
                  <th className="px-[24px] py-[17px] text-[14px] font-semibold text-[#666666]">Session</th>
                  <th className="px-[24px] py-[17px] text-[14px] font-semibold text-[#666666]">Mentor</th>
                  <th className="px-[24px] py-[17px] text-[14px] font-semibold text-[#666666]">Time</th>
                  <th className="px-[24px] py-[17px] text-[14px] font-semibold text-[#666666]">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((row) => (
                  <tr key={row.id} className="border-b border-[#e9e9e9] transition-colors last:border-b-0 hover:bg-[#fafafa]">
                    <td className="px-[24px] py-[19px] text-[14px] font-normal text-[#111111]">{row.date}</td>
                    <td className="px-[24px] py-[19px] text-[14px] font-normal text-[#111111]">{row.session}</td>
                    <td className="px-[24px] py-[19px] text-[14px] font-normal text-[#666666]">{row.mentor}</td>
                    <td className="px-[24px] py-[19px] text-[14px] font-normal text-[#666666]">{row.time}</td>
                    <td className="px-[24px] py-[19px]">
                      <span className={`inline-flex items-center gap-[6px] rounded-[9px] px-[11px] py-[6px] text-[14px] font-normal leading-none ${
                        row.status === "Present" 
                        ? "bg-[#E7F8EC] text-[#10C79A]" 
                        : "bg-[#FFECEF] text-[#FF5A5A]"
                      }`}>
                        <img
                          src={row.status === "Present" ? "/images/attendance-status-present.svg" : "/images/attendance-status-absent.svg"}
                          alt=""
                          className="h-[16px] w-[16px] shrink-0"
                        />
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
