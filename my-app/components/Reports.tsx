"use client";

import React, { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const ORANGE = "#F9A618";
const GREEN = "#00A63E";
const GOLD = "#B4941F";
const CREAM = "#fff7e8";
const GRID = "#eadfca";

const DASHBOARD_DATA = {
  stats: [
    { id: 1, label: "Avg. Attendance", value: "91.5%", trend: "+2.3% from last month", icon: "/images/admin-reports-trend.svg" },
    { id: 2, label: "Total Sessions", value: "1,235", trend: "+156 from last month", icon: "/images/admin-reports-calendar.svg" },
    { id: 3, label: "Active Students", value: "248", trend: "+12 from last month", icon: "/images/admin-reports-users.svg" },
    { id: 4, label: "Satisfaction", value: "4.7/5.0", trend: "+0.2 from last month", icon: "/images/admin-reports-trend.svg" },
  ],
  attendanceTrends: [
    { month: "Jun", value: 94 },
    { month: "Jul", value: 90 },
    { month: "Aug", value: 96 },
    { month: "Sep", value: 91 },
    { month: "Oct", value: 97 },
    { month: "Nov", value: 93 },
  ],
  growthData: [
    { month: "Jun", mentors: 26, students: 240 },
    { month: "Jul", mentors: 28, students: 244 },
    { month: "Aug", mentors: 29, students: 250 },
    { month: "Sep", mentors: 31, students: 254 },
    { month: "Oct", mentors: 33, students: 256 },
    { month: "Nov", mentors: 34, students: 258 },
  ],
  sessionActivity: [
    { month: "Jun", sessions: 180 },
    { month: "Jul", sessions: 195 },
    { month: "Aug", sessions: 210 },
    { month: "Sep", sessions: 205 },
    { month: "Oct", sessions: 225 },
    { month: "Nov", sessions: 220 },
  ],
  courseDistribution: [
    { name: "Python", value: 34, color: ORANGE },
    { name: "Web Dev", value: 26, color: "#b99b16" },
    { name: "Data Science", value: 19, color: "#e3c77e" },
    { name: "ML/AI", value: 13, color: "#f2dfb6" },
    { name: "Other", value: 8, color: "#f8edd2" },
  ],
  performanceDistribution: [
    { grade: "A+", count: 45 },
    { grade: "A", count: 68 },
    { grade: "B+", count: 52 },
    { grade: "B", count: 37 },
    { grade: "C+", count: 25 },
    { grade: "C", count: 15 },
    { grade: "Below C", count: 5 },
  ],
};

type StatItem = (typeof DASHBOARD_DATA.stats)[number];

const axisProps = {
  tick: { fill: "#707070", fontSize: 12 },
  tickLine: false,
  axisLine: { stroke: "#777777", strokeWidth: 1 },
};

export default function ReportsAnalytics() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    const reportContent = JSON.stringify(DASHBOARD_DATA, null, 2);
    const blob = new Blob([reportContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Analytics_Report_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setTimeout(() => setIsExporting(false), 1000);
  };

  return (
    <section className="min-h-full font-[Poppins] text-[#111111]">
      <div className="mb-[24px] flex items-center justify-between">
        <div className="flex items-center gap-[12px]">
          <span className="flex h-[48px] w-[48px] items-center justify-center rounded-[8px] bg-[#fff5e4]">
            <img src="/images/admin-reports-header.svg" alt="" aria-hidden="true" className="h-[24px] w-[24px]" />
          </span>
          <div>
            <h1 className="text-[24px] font-bold leading-[1.15]">Reports &amp; Analytics</h1>
            <p className="mt-[4px] text-[15px] font-normal leading-none text-[#666666]">Comprehensive insights and trends</p>
          </div>
        </div>

        <button
          onClick={handleExport}
          disabled={isExporting}
          className="flex h-[45px] items-center gap-[10px] rounded-[10px] bg-[#f9a313] px-[22px] text-[16px] font-medium text-white transition-colors hover:bg-[#f3a018] disabled:opacity-70"
        >
          <DownloadGlyph />
          {isExporting ? "Exporting..." : "Export All Reports"}
        </button>
      </div>

      <div className="mb-[24px] grid grid-cols-1 gap-[18px] md:grid-cols-2 xl:grid-cols-4">
        {DASHBOARD_DATA.stats.map((stat) => (
          <StatCard key={stat.id} item={stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-[16px] xl:grid-cols-2">
        <ChartCard title="Monthly Attendance Trends">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={DASHBOARD_DATA.attendanceTrends} margin={{ top: 28, right: 28, bottom: 18, left: 26 }}>
              <defs>
                <linearGradient id="attendanceFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={ORANGE} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={ORANGE} stopOpacity={0.08} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
              <XAxis dataKey="month" {...axisProps} />
              <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} {...axisProps} />
              <Tooltip cursor={{ stroke: ORANGE, strokeOpacity: 0.2 }} />
              <Area type="monotone" dataKey="value" stroke={ORANGE} strokeWidth={2} fill="url(#attendanceFill)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Student vs Mentor Growth">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={DASHBOARD_DATA.growthData} margin={{ top: 28, right: 28, bottom: 18, left: 26 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
              <XAxis dataKey="month" {...axisProps} />
              <YAxis domain={[0, 260]} ticks={[0, 65, 130, 195, 260]} {...axisProps} />
              <Tooltip />
              <Legend
                verticalAlign="bottom"
                align="center"
                iconType="plainline"
                formatter={(value) => <span className="text-[16px] text-[#c08f09]">{String(value)}</span>}
              />
              <Line type="monotone" dataKey="mentors" name="Mentors" stroke={GOLD} strokeWidth={2} dot={{ r: 4, fill: GOLD, stroke: "#ffffff", strokeWidth: 1 }} />
              <Line type="monotone" dataKey="students" name="Students" stroke={ORANGE} strokeWidth={2} dot={{ r: 5, fill: ORANGE, stroke: ORANGE }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly Session Activity">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={DASHBOARD_DATA.sessionActivity} margin={{ top: 28, right: 28, bottom: 18, left: 26 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
              <XAxis dataKey="month" {...axisProps} />
              <YAxis domain={[0, 240]} ticks={[0, 60, 120, 180, 240]} {...axisProps} />
              <Tooltip cursor={{ fill: "rgba(249, 166, 24, 0.08)" }} />
              <Bar dataKey="sessions" fill={ORANGE} radius={[8, 8, 0, 0]} barSize={56} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Course Distribution">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 20, right: 34, bottom: 20, left: 34 }}>
              <Pie
                data={DASHBOARD_DATA.courseDistribution}
                cx="50%"
                cy="54%"
                outerRadius={86}
                dataKey="value"
                labelLine={false}
                label={({ name, value, x, y }) =>
                  name === "Other" ? null : (
                    <text x={x} y={y} fill={name === "ML/AI" || name === "Data Science" ? "#e2bd69" : ORANGE} textAnchor="middle" dominantBaseline="central" fontSize={12}>
                      {name}: {value}%
                    </text>
                  )
                }
              >
                {DASHBOARD_DATA.courseDistribution.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} stroke="#fff7e8" strokeWidth={1} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="mt-[16px]">
        <ChartCard title="Student Performance Distribution" tall>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={DASHBOARD_DATA.performanceDistribution} margin={{ top: 28, right: 34, bottom: 18, left: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
              <XAxis dataKey="grade" {...axisProps} />
              <YAxis domain={[0, 80]} ticks={[0, 20, 40, 60, 80]} {...axisProps} />
              <Tooltip cursor={{ fill: "rgba(249, 166, 24, 0.08)" }} />
              <Bar dataKey="count" fill={ORANGE} radius={[8, 8, 0, 0]} barSize={118} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </section>
  );
}

const StatCard = ({ item }: { item: StatItem }) => (
  <article className="flex h-[131px] flex-col justify-between rounded-[8px] border border-[#d9d9d9] bg-white px-[24px] py-[23px]">
    <div className="flex items-start justify-between">
      <span className="text-[15px] font-normal leading-none text-[#666666]">{item.label}</span>
      <img src={item.icon} alt="" aria-hidden="true" className="h-[16px] w-[16px] object-contain" />
    </div>
    <div className="text-[25px] font-normal leading-none text-[#f9a313]">{item.value}</div>
    <div className="text-[13px] font-normal leading-none text-[#00a63e]">{item.trend}</div>
  </article>
);

const ChartCard = ({ title, children, tall = false }: { title: string; children: React.ReactNode; tall?: boolean }) => (
  <article className="overflow-hidden rounded-[8px] border border-[#d9d9d9] bg-white">
    <div className="flex h-[71px] items-center justify-between border-b border-[#e0e0e0] bg-white px-[24px]">
      <h2 className="text-[18px] font-normal leading-none text-[#111111]">{title}</h2>
      <button className="text-[15px] font-normal leading-none text-[#ff9900] transition-colors hover:text-[#e58c00]">View Details</button>
    </div>
    <div className={`${tall ? "h-[350px]" : "h-[300px]"} bg-[#fff7e8]`}>
      {children}
    </div>
  </article>
);

const DownloadGlyph = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M8 2.5v7.2m0 0 2.9-2.9M8 9.7 5.1 6.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 10.5v1.8c0 .7.5 1.2 1.2 1.2h7.6c.7 0 1.2-.5 1.2-1.2v-1.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);
