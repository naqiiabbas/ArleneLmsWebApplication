"use client";

import React from "react";

type Stat = { id: number; label: string; value: string; icon: string };
type Activity = { id: number; title: string; subtitle: string; time: string; color: string };
type Event = { id: number; title: string; date: string; attendees: string };

const stats: Stat[] = [
  { id: 1, label: "Active Sponsorships", value: "12", icon: "/images/sponsor-dashboard-active.svg" },
  { id: 2, label: "Total Sponsored Amount", value: "$245,000", icon: "/images/sponsor-dashboard-dollar.svg" },
  { id: 3, label: "Payments Status", value: "8/12 Paid", icon: "/images/sponsor-dashboard-trend.svg" },
  { id: 4, label: "Upcoming Events", value: "5", icon: "/images/sponsor-dashboard-calendar.png" },
];

const activities: Activity[] = [
  { id: 1, title: "Payment received", subtitle: "STEM Mentorship Program", time: "2 hours ago", color: "bg-[#00C853]" },
  { id: 2, title: "New sponsorship request", subtitle: "Leadership Development", time: "5 hours ago", color: "bg-[#F5B400]" },
  { id: 3, title: "Report generated", subtitle: "Q4 Impact Report", time: "1 day ago", color: "bg-[#2F80FF]" },
  { id: 4, title: "Invoice sent", subtitle: "Tech Bootcamp Sponsorship", time: "2 days ago", color: "bg-[#FF5A1F]" },
  { id: 5, title: "Sponsorship approved", subtitle: "Women in Tech Initiative", time: "3 days ago", color: "bg-[#00C853]" },
];

const events: Event[] = [
  { id: 1, title: "Annual Gala & Awards Ceremony", date: "Dec 15, 2025", attendees: "250 attendees" },
  { id: 2, title: "Q1 Mentorship Kickoff", date: "Jan 10, 2026", attendees: "120 attendees" },
  { id: 3, title: "Tech Career Fair", date: "Feb 5, 2026", attendees: "300 attendees" },
  { id: 4, title: "Leadership Summit", date: "Mar 20, 2026", attendees: "180 attendees" },
];

export default function Dashspon() {
  return (
    <div className="px-[24px] pb-[40px] pt-[28px] font-['Poppins',_sans-serif] text-[#1f2937]">
      <div className="w-full">
        <div>
          <h1 className="text-[24px] font-semibold leading-none text-[#111111]">My Profile</h1>
          <p className="mt-[16px] text-[16px] font-normal leading-none text-[#666666]">Manage your personal information and track your progress</p>
        </div>

        <div className="mt-[20px] grid grid-cols-1 gap-[16px] sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.id}
              className="flex h-[136px] flex-col items-start rounded-[8px] border border-[#d9d9d9] bg-white px-[24px] py-[24px] shadow-[0_2px_2px_rgba(0,0,0,0.12)]"
            >
              <img src={s.icon} alt="" aria-hidden="true" className="h-[20px] w-[20px] object-contain" />
              <p className="mt-[18px] text-[20px] font-semibold leading-none text-[#1f2937]">{s.value}</p>
              <p className="mt-[20px] text-[14px] font-normal leading-none text-[#667085]">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-[16px] grid grid-cols-1 gap-[16px] lg:grid-cols-2">
          <div className="min-h-[520px] rounded-[8px] border border-[#d9d9d9] bg-white px-[24px] pb-[24px] pt-[28px] shadow-[0_2px_2px_rgba(0,0,0,0.12)]">
            <h3 className="text-[20px] font-semibold leading-none text-[#1f2937]">Recent Activity</h3>
            <div className="mt-[22px]">
              {activities.map((a) => (
                <div key={a.id} className="flex gap-[16px] border-b border-[#d9d9d9] py-[12px] first:pt-0 last:border-b-0">
                  <span className={`mt-[3px] h-[8px] w-[8px] shrink-0 rounded-full ${a.color}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-normal leading-none text-[#1f2937]">{a.title}</p>
                    <p className="mt-[14px] text-[14px] font-normal leading-none text-[#667085]">{a.subtitle}</p>
                    <p className="mt-[14px] text-[13px] font-normal leading-none text-[#667085]">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="min-h-[520px] rounded-[8px] border border-[#d9d9d9] bg-white px-[24px] pb-[24px] pt-[28px] shadow-[0_2px_2px_rgba(0,0,0,0.12)]">
            <h3 className="text-[20px] font-semibold leading-none text-[#1f2937]">Upcoming Events & Campaigns</h3>
            <div className="mt-[22px] space-y-[16px]">
              {events.map((ev) => (
                <div key={ev.id} className="flex min-h-[84px] items-center justify-between gap-[18px] rounded-[8px] border border-[#d9d9d9] bg-[#f9fafb] px-[20px] py-[16px]">
                  <div className="min-w-0">
                    <p className="text-[15px] font-normal leading-none text-[#1f2937]">{ev.title}</p>
                    <p className="mt-[12px] text-[13px] font-normal leading-none text-[#667085]">{ev.date}</p>
                  </div>
                  <p className="w-[92px] shrink-0 text-left text-[13px] font-normal leading-[20px] text-[#ff9f0f]">{ev.attendees}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
