"use client";

import React, { useMemo, useState } from "react";

type Status = "Active" | "Pending" | "Completed";

type Program = {
  id: string;
  name: string;
  tier: "Platinum" | "Gold" | "Silver" | "Bronze";
  amount: string;
  status: Status;
  start: string;
  end: string;
};

type Detail = {
  id: string;
  title: string;
  tier: Program["tier"];
  amount: string;
  start: string;
  end: string;
  status: Status;
  deliverables: string[];
  timeline: { label: string; date: string; state: "done" | "in-progress" | "pending" }[];
  impact: { label: string; value: string }[];
};

const stats = [
  { label: "Active Sponsorships", value: "12", icon: "/images/sponsor-dashboard-active.svg" },
  { label: "Total Sponsored Amount", value: "$245,000", icon: "/images/sponsor-dashboard-dollar.svg" },
  { label: "Payments Status", value: "8/12 Paid", icon: "/images/sponsor-dashboard-trend.svg" },
  { label: "Upcoming Events", value: "5", icon: "/images/sponsor-dashboard-calendar.png" },
];

const programs: Program[] = [
  { id: "p1", name: "Passport to the Future Program", tier: "Platinum", amount: "$50,000", status: "Active", start: "2025-01-01", end: "2025-12-31" },
  { id: "p2", name: "Passport to the Future Program", tier: "Gold", amount: "$30,000", status: "Active", start: "2025-02-15", end: "2025-11-15" },
  { id: "p3", name: "Passport to the Future Program", tier: "Silver", amount: "$15,000", status: "Active", start: "2025-03-01", end: "2025-10-01" },
  { id: "p4", name: "Passport to the Future Program", tier: "Platinum", amount: "$45,000", status: "Pending", start: "2025-04-01", end: "2025-12-31" },
  { id: "p5", name: "Passport to the Future Program", tier: "Bronze", amount: "$10,000", status: "Active", start: "2025-01-15", end: "2025-08-15" },
  { id: "p6", name: "Passport to the Future Program", tier: "Gold", amount: "$35,000", status: "Completed", start: "2024-05-01", end: "2024-12-31" },
  { id: "p7", name: "Passport to the Future Program", tier: "Silver", amount: "$20,000", status: "Active", start: "2025-02-01", end: "2025-11-01" },
  { id: "p8", name: "Passport to the Future Program", tier: "Platinum", amount: "$40,000", status: "Active", start: "2025-01-10", end: "2025-12-10" },
];

const detail: Detail = {
  id: "p1",
  title: "STEM Mentorship Program",
  tier: "Platinum",
  amount: "$50,000",
  start: "2025-01-01",
  end: "2025-12-31",
  status: "Active",
  deliverables: [
    "Logo placement on website and marketing materials",
    "Recognition at annual gala event",
    "Quarterly impact reports",
    "Social media shoutouts (4 per year)",
  ],
  timeline: [
    { label: "Contract Signed", date: "2025-01-01", state: "done" },
    { label: "Initial Payment", date: "Completed", state: "done" },
    { label: "Ongoing Activities", date: "In Progress", state: "in-progress" },
    { label: "Final Report", date: "2025-12-31", state: "pending" },
  ],
  impact: [
    { label: "Students Reached", value: "324" },
    { label: "Sessions Completed", value: "48" },
    { label: "Satisfaction Rate", value: "96%" },
  ],
};

const tierColor = (tier: Program["tier"]) => {
  switch (tier) {
    case "Platinum":
      return "bg-purple-100 text-purple-700";
    case "Gold":
      return "bg-amber-200 text-amber-700";
    case "Silver":
      return "bg-gray-200 text-gray-700";
    case "Bronze":
      return "bg-orange-200 text-orange-800";
  }
};

const statusColor = (status: Status) => {
  if (status === "Active") return "bg-green-100 text-green-700";
  if (status === "Pending") return "bg-amber-100 text-amber-700";
  return "bg-gray-200 text-gray-700";
};

const timelineIcon = (state: Detail["timeline"][number]["state"]) => {
  if (state === "done") return "/images/sponsor-timeline-done.svg";
  if (state === "in-progress") return "/images/sponsor-timeline-progress.svg";
  return "/images/sponsor-timeline-pending.svg";
};

const SearchGlyph = () => (
  <span className="relative block h-[18px] w-[18px]" aria-hidden="true">
    <span className="absolute left-[1px] top-[1px] h-[12px] w-[12px] rounded-full border-[1.8px] border-[#666666]" />
    <span className="absolute bottom-[2px] right-[1px] h-[7px] w-[1.8px] rotate-[-45deg] rounded-full bg-[#666666]" />
  </span>
);

export default function Sponpro() {
  const [view, setView] = useState<"list" | "detail">("list");
  const [selectedId, setSelectedId] = useState<string>("p1");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"All Status" | Status>("All Status");
  const [timeFilter, setTimeFilter] = useState<string>("All Times");

  const filtered = useMemo(() => {
    return programs.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = status === "All Status" || p.status === status;
      return matchSearch && matchStatus;
    });
  }, [search, status]);

  const selected = programs.find((p) => p.id === selectedId) || programs[0];
  const detailView: Detail = {
    ...detail,
    title: selected.name.replace("Passport to the Future Program", "STEM Mentorship Program"),
    tier: selected.tier,
    amount: selected.amount,
    start: selected.start,
    end: selected.end,
    status: selected.status as Status,
  };

  return (
    <div className="min-h-screen bg-[#F4F4F5] px-[24px] pb-[40px] pt-[28px] font-['Poppins',_sans-serif] text-[#1f2937]">
      <div className="w-full">
        {view === "list" ? (
          <>
            <div>
              <h1 className="text-[28px] font-semibold leading-none text-[#1f2937]">Sponsorships</h1>
              <p className="mt-[20px] text-[15px] font-normal leading-none text-[#667085]">Manage and view all your sponsorship programs.</p>
            </div>

            <div className="mt-[20px] grid grid-cols-1 gap-[16px] sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((s, i) => (
                <div key={i} className="flex h-[136px] flex-col items-start rounded-[8px] border border-[#d9d9d9] bg-white px-[24px] py-[24px] shadow-[0_2px_2px_rgba(0,0,0,0.12)]">
                  <img src={s.icon} alt="" aria-hidden="true" className="h-[20px] w-[20px] object-contain" />
                  <p className="mt-[18px] text-[20px] font-semibold leading-none text-[#1f2937]">{s.value}</p>
                  <p className="mt-[20px] text-[14px] font-normal leading-none text-[#667085]">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-[16px] overflow-hidden rounded-[8px] border border-[#d9d9d9] bg-white shadow-[0_2px_2px_rgba(0,0,0,0.12)]">
              <div className="flex flex-wrap items-center gap-[16px] border-b border-[#d9d9d9] px-[24px] py-[24px]">
                <div className="relative min-w-[260px] flex-1">
                  <span className="absolute left-[16px] top-1/2 -translate-y-1/2">
                    <SearchGlyph />
                  </span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search documents..."
                    className="h-[48px] w-full rounded-[8px] border border-[#d9d9d9] bg-white pl-[52px] pr-[16px] text-[16px] font-normal text-[#1f2937] outline-none placeholder:text-[#777777] focus:border-[#F9A618]"
                />
                </div>
                <Select value={timeFilter} onChange={setTimeFilter} options={["All Times", "This Year", "Last Year"]} />
                <Select value={status} onChange={(v) => setStatus(v as any)} options={["All Status", "Active", "Pending", "Completed"]} />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] text-left">
                  <thead className="bg-[#f9fafb] text-[#667085]">
                  <tr>
                      <th className="px-[24px] py-[26px] text-[14px] font-normal leading-none">Program</th>
                      <th className="px-[24px] py-[26px] text-[14px] font-normal leading-none">Tier</th>
                      <th className="px-[24px] py-[26px] text-[14px] font-normal leading-none">Amount</th>
                      <th className="px-[24px] py-[26px] text-[14px] font-normal leading-none">Status</th>
                      <th className="px-[24px] py-[26px] text-[14px] font-normal leading-none">Start Date</th>
                      <th className="px-[24px] py-[26px] text-[14px] font-normal leading-none">End Date</th>
                      <th className="px-[24px] py-[26px] text-[14px] font-normal leading-none">Actions</th>
                  </tr>
                </thead>
                  <tbody className="divide-y divide-[#d9d9d9]">
                  {filtered.map((p) => (
                      <tr key={p.id} className="h-[88px]">
                        <td className="px-[24px] py-[22px] text-[14px] font-normal text-[#1f2937]">{p.name}</td>
                        <td className="px-[24px] py-[22px]">
                          <span className={`inline-flex h-[40px] items-center rounded-full px-[16px] text-[14px] font-normal ${tierColor(p.tier)}`}>{p.tier}</span>
                      </td>
                        <td className="px-[24px] py-[22px] text-[14px] font-normal text-[#1f2937]">{p.amount}</td>
                        <td className="px-[24px] py-[22px]">
                          <span className={`inline-flex h-[38px] items-center rounded-full px-[16px] text-[14px] font-normal ${statusColor(p.status)}`}>{p.status}</span>
                      </td>
                        <td className="px-[24px] py-[22px] text-[14px] font-normal text-[#1f2937]">{p.start}</td>
                        <td className="px-[24px] py-[22px] text-[14px] font-normal text-[#1f2937]">{p.end}</td>
                        <td className="px-[24px] py-[22px]">
                        <button
                          onClick={() => {
                            setSelectedId(p.id);
                            setView("detail");
                          }}
                            className="flex items-center gap-[4px] text-[14px] font-normal leading-none text-[#ff9f0f]"
                        >
                            <img src="/images/sponsor-view-eye.svg" alt="" aria-hidden="true" className="h-[16px] w-[16px] object-contain" />
                            View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          </>
        ) : (
          <>
            <div>
              <button
                onClick={() => setView("list")}
                className="flex items-center gap-[6px] text-[16px] font-normal leading-none text-[#ff9f0f]"
              >
                <span aria-hidden="true">←</span>
                Back to Sponsorships
              </button>

              <div className="mt-[20px] flex items-start justify-between gap-[16px]">
                <h2 className="text-[28px] font-semibold leading-none text-[#1f2937]">STEM Mentorship Program</h2>
                <span className={`inline-flex h-[24px] shrink-0 items-center rounded-full px-[12px] text-[13px] font-normal ${statusColor(detailView.status)}`}>
                  {detailView.status}
                </span>
              </div>
            </div>

            <div className="mt-[20px] grid grid-cols-1 gap-[24px] lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-[16px]">
                <div className="rounded-[8px] border border-[#d9d9d9] bg-white px-[24px] py-[28px] shadow-[0_2px_2px_rgba(0,0,0,0.12)]">
                  <h3 className="text-[20px] font-semibold leading-none text-[#1f2937]">Sponsorship Summary</h3>
                  <div className="mt-[24px] grid grid-cols-2 gap-[28px] md:grid-cols-4">
                    <Info label="Tier" value={detailView.tier} />
                    <Info label="Amount" value={detailView.amount} />
                    <Info label="Start Date" value={detailView.start} />
                    <Info label="End Date" value={detailView.end} />
                  </div>
                </div>

                <div className="rounded-[8px] border border-[#d9d9d9] bg-white px-[24px] py-[28px] shadow-[0_2px_2px_rgba(0,0,0,0.12)]">
                  <h3 className="text-[20px] font-semibold leading-none text-[#1f2937]">Deliverables</h3>
                  <div className="mt-[24px] space-y-[14px]">
                  {detailView.deliverables.map((d, idx) => (
                      <label key={idx} className="flex items-center gap-[12px] text-[15px] font-normal leading-none text-[#1f2937]">
                        <input type="checkbox" className="h-[20px] w-[20px] rounded-[4px] border-[#d9d9d9] text-[#F9A618] focus:ring-0" />
                        <span>{d}</span>
                    </label>
                  ))}
                  </div>
                </div>
              </div>

              <div className="space-y-[16px]">
                <div className="rounded-[8px] border border-[#d9d9d9] bg-white px-[24px] py-[28px] shadow-[0_2px_2px_rgba(0,0,0,0.12)]">
                  <h3 className="text-[20px] font-semibold leading-none text-[#1f2937]">Timeline</h3>
                  <div className="mt-[20px] space-y-[16px]">
                    {detailView.timeline.map((t, idx) => (
                      <div key={idx} className="flex items-start gap-[16px]">
                        <img src={timelineIcon(t.state)} alt="" aria-hidden="true" className="h-[32px] w-[32px] shrink-0 object-contain" />
                        <div className="min-w-0">
                          <p className="text-[15px] font-normal leading-none text-[#1f2937]">{t.label}</p>
                          <p className="mt-[9px] text-[14px] font-normal leading-none text-[#667085]">{t.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[8px] border border-[#d9d9d9] bg-white px-[24px] py-[28px] shadow-[0_2px_2px_rgba(0,0,0,0.12)]">
                  <h3 className="text-[20px] font-semibold leading-none text-[#1f2937]">Impact Metrics</h3>
                  <div className="mt-[22px]">
                    {detailView.impact.map((i, idx) => (
                      <div key={idx} className="border-b border-[#d9d9d9] py-[13px] first:pt-0 last:border-b-0 last:pb-0">
                        <p className="text-[14px] font-normal leading-none text-[#667085]">{i.label}</p>
                        <p className="mt-[10px] text-[14px] font-normal leading-none text-[#1f2937]">{i.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const Select = ({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) => (
  <div className="relative w-full sm:w-[180px]">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-[48px] w-full appearance-none rounded-[8px] border border-[#d9d9d9] bg-white pl-[12px] pr-[36px] text-[16px] font-normal text-[#666666] outline-none focus:border-[#F9A618]"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
    <span className="pointer-events-none absolute right-[16px] top-1/2 h-[8px] w-[8px] -translate-y-1/2 rotate-45 border-b-[1.5px] border-r-[1.5px] border-[#666666]" />
  </div>
);

const Info = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-[14px] font-normal leading-none text-[#667085]">{label}</p>
    <p className="mt-[12px] text-[14px] font-normal leading-none text-[#1f2937]">{value}</p>
  </div>
);
