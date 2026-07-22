"use client";

import React, { useEffect, useState } from "react";
import { getSponsorDashboard } from "@/lib/data/sponsor";
import type { SponsorDashboard } from "@/lib/data/sponsor.types";

const STAT_META: { key: string; label: string; icon: string }[] = [
  { key: "activeSponsorships", label: "Active Sponsorships", icon: "/images/sponsor-dashboard-active.svg" },
  { key: "totalAmount", label: "Total Sponsored Amount", icon: "/images/sponsor-dashboard-dollar.svg" },
  { key: "payments", label: "Payments Status", icon: "/images/sponsor-dashboard-trend.svg" },
  { key: "upcomingEvents", label: "Upcoming Events", icon: "/images/sponsor-dashboard-calendar.png" },
];

const EMPTY: SponsorDashboard = {
  companyName: "",
  stats: { activeSponsorships: 0, totalAmount: 0, paidPrograms: 0, totalPrograms: 0, upcomingEvents: 0 },
  activities: [],
  events: [],
};

export default function Dashspon() {
  const [data, setData] = useState<SponsorDashboard | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    getSponsorDashboard()
      .then(setData)
      .catch((e) => setNotice((e as Error).message));
  }, []);

  const d = data ?? EMPTY;
  const statValue: Record<string, string> = {
    activeSponsorships: String(d.stats.activeSponsorships),
    totalAmount: `$${d.stats.totalAmount.toLocaleString("en-US")}`,
    payments: `${d.stats.paidPrograms}/${d.stats.totalPrograms} Paid`,
    upcomingEvents: String(d.stats.upcomingEvents),
  };

  return (
    <div className="px-[24px] pb-[40px] pt-[28px] font-['Poppins',_sans-serif] text-[#1f2937]">
      <div className="w-full">
        <div>
          <h1 className="text-[24px] font-semibold leading-none text-[#111111]">Dashboard</h1>
          <p className="mt-[16px] text-[16px] font-normal leading-none text-[#666666]">
            Welcome back{d.companyName ? `, ${d.companyName}` : ""}. An overview of your sponsorships and impact.
          </p>
        </div>

        {notice && (
          <div className="mt-[20px] rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-semibold text-red-700">
            {notice}
          </div>
        )}

        <div className="mt-[20px] grid grid-cols-1 gap-[16px] sm:grid-cols-2 xl:grid-cols-4">
          {STAT_META.map((s) => (
            <div
              key={s.key}
              className="flex h-[136px] flex-col items-start rounded-[8px] border border-[#d9d9d9] bg-white px-[24px] py-[24px] shadow-[0_2px_2px_rgba(0,0,0,0.12)]"
            >
              <img src={s.icon} alt="" aria-hidden="true" className="h-[20px] w-[20px] object-contain" />
              <p className="mt-[18px] text-[20px] font-semibold leading-none text-[#1f2937]">{statValue[s.key]}</p>
              <p className="mt-[20px] text-[14px] font-normal leading-none text-[#667085]">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-[16px] grid grid-cols-1 gap-[16px] lg:grid-cols-2">
          <div className="min-h-[520px] rounded-[8px] border border-[#d9d9d9] bg-white px-[24px] pb-[24px] pt-[28px] shadow-[0_2px_2px_rgba(0,0,0,0.12)]">
            <h3 className="text-[20px] font-semibold leading-none text-[#1f2937]">Recent Activity</h3>
            <div className="mt-[22px]">
              {d.activities.length === 0 && (
                <p className="text-[14px] text-[#667085]">No recent activity.</p>
              )}
              {d.activities.map((a) => (
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
            <h3 className="text-[20px] font-semibold leading-none text-[#1f2937]">Upcoming Events &amp; Campaigns</h3>
            <div className="mt-[22px] space-y-[16px]">
              {d.events.length === 0 && (
                <p className="text-[14px] text-[#667085]">No upcoming events.</p>
              )}
              {d.events.map((ev) => (
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
