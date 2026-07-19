"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { getMentorDashboard } from "@/lib/data/mentor";
import type { MentorDashboard } from "@/lib/data/mentor.types";

const AttendanceChart = dynamic(() => import("./Attendancechart"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[255px] items-center justify-center rounded-[8px] bg-[#f7f7f7] text-[14px] text-[#666666]">
      Loading Chart...
    </div>
  ),
});

const STAT_STYLES = [
  { key: "activeStudents", label: "Active Students", icon: "/images/mentor-sidebar-assigned.svg", iconBg: "bg-transparent", iconColor: "text-[#ffa313]" },
  { key: "sessionsToday", label: "Sessions Today", icon: "/images/mentor-dashboard-calendar.svg", iconBg: "bg-[#e8f2ff]", iconColor: "text-[#2f80ed]" },
  { key: "pendingNotes", label: "Pending Notes", icon: "/images/mentor-dashboard-note.svg", iconBg: "bg-[#fff0e4]", iconColor: "text-[#f97316]" },
  { key: "alerts", label: "Alerts / Risks", icon: "/images/mentor-dashboard-alert.svg", iconBg: "bg-[#ffe8e8]", iconColor: "text-[#ff4d43]" },
] as const;

const EMPTY_DASHBOARD: MentorDashboard = {
  welcomeName: "",
  stats: { activeStudents: 0, sessionsToday: 0, pendingNotes: 0, alerts: 0 },
  sessions: [],
  activities: [],
  attendance: [],
};

const MaskIcon = ({ src }: { src: string }) => (
  <span
    aria-hidden="true"
    className="block h-[24px] w-[24px] bg-current"
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

const MentorshipDashboard = () => {
  const [data, setData] = useState<MentorDashboard | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    getMentorDashboard()
      .then(setData)
      .catch((e) => setNotice((e as Error).message));
  }, []);

  const d = data ?? EMPTY_DASHBOARD;

  return (
    <section className="min-h-full w-full overflow-x-hidden bg-[#f4f4f4] px-4 pb-[32px] pt-[28px] font-poppins text-[#111111] md:px-6 lg:px-[24px]">
      <div className="mb-[26px]">
        <h1 className="text-[30px] font-bold leading-none tracking-[-0.02em] text-[#111111]">Dashboard</h1>
        <p className="mt-[10px] text-[14px] font-normal leading-none text-[#666666]">
          Welcome back{d.welcomeName ? `, ${d.welcomeName}` : ""}. Here&apos;s your mentorship overview.
        </p>
      </div>

      {notice && (
        <div className="mb-[24px] rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-semibold text-red-700">
          {notice}
        </div>
      )}

      <div className="mb-[24px] grid grid-cols-1 gap-[16px] sm:grid-cols-2 xl:grid-cols-4">
        {STAT_STYLES.map((stat) => (
          <div key={stat.key} className="flex min-h-[136px] items-center justify-between rounded-[8px] border border-[#dddddd] bg-white px-[23px] py-[23px]">
            <div className="min-w-0">
              <p className="text-[14px] font-normal leading-none text-[#666666]">{stat.label}</p>
              <p className="mt-[17px] text-[22px] font-semibold leading-none text-[#111111]">{d.stats[stat.key]}</p>
            </div>
            <div className={`flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-[9px] ${stat.iconBg}`}>
              <span className={stat.iconColor}>
                <MaskIcon src={stat.icon} />
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-[24px] grid grid-cols-1 gap-[16px] xl:grid-cols-[minmax(0,2fr)_360px]">
        <div className="rounded-[8px] border border-[#dddddd] bg-white px-[24px] pb-[53px] pt-[25px]">
          <h2 className="mb-[34px] text-[20px] font-semibold leading-none text-[#111111]">Today's Sessions</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#e5e5e5]">
                  <th className="pb-[16px] pl-[8px] text-[15px] font-semibold leading-none text-[#666666]">Student Name</th>
                  <th className="pb-[16px] text-[15px] font-semibold leading-none text-[#666666]">Session Time</th>
                  <th className="pb-[16px] text-[15px] font-semibold leading-none text-[#666666]">Status</th>
                </tr>
              </thead>
              <tbody>
                {d.sessions.length === 0 && (
                  <tr><td colSpan={3} className="py-[24px] text-center text-[15px] text-[#666666]">No sessions scheduled today.</td></tr>
                )}
                {d.sessions.map((session) => (
                  <tr key={session.id} className="border-b border-[#e5e5e5] last:border-b">
                    <td className="py-[15px] pl-[8px]">
                      <div className="flex items-center gap-[13px]">
                        <img src="/images/mentor-dashboard-calendar.svg" alt="" className="h-[32px] w-[32px] rounded-full bg-[#e8f2ff] p-[7px]" />
                        <span className="text-[16px] font-normal leading-none text-[#111111]">{session.name}</span>
                      </div>
                    </td>
                    <td className="py-[15px] text-[16px] font-normal leading-none text-[#666666]">{session.time}</td>
                    <td className="py-[15px]">
                      <span className="inline-flex h-[29px] items-center rounded-full bg-[#dcecff] px-[11px] text-[16px] font-normal leading-none text-[#0054ff]">
                        {session.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="rounded-[8px] border border-[#dddddd] bg-white px-[24px] pb-[33px] pt-[25px]">
          <h2 className="mb-[28px] text-[20px] font-semibold leading-none text-[#111111]">Recent Activity</h2>
          <div className="space-y-[20px]">
            {d.activities.length === 0 && (
              <p className="text-[14px] text-[#666666]">No recent activity.</p>
            )}
            {d.activities.map((activity) => (
              <div key={activity.id} className="flex min-h-[62px] gap-[13px] border-b border-[#e5e5e5] pb-[18px] last:border-b-0 last:pb-0">
                <span className="mt-[5px] h-[8px] w-[8px] shrink-0 rounded-full" style={{ backgroundColor: activity.color }} />
                <div>
                  <p className="max-w-[245px] text-[14px] font-normal leading-[1.35] text-[#111111]">{activity.text}</p>
                  <p className="mt-[8px] text-[13px] font-normal leading-none text-[#666666]">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <div className="rounded-[8px] border border-[#dddddd] bg-white px-[24px] pb-[8px] pt-[26px]">
        <h2 className="mb-[24px] text-[20px] font-semibold leading-none text-[#111111]">Weekly Attendance Overview</h2>
        <div className="h-[270px] px-[8px]">
          <AttendanceChart data={d.attendance} />
        </div>
        <div className="mt-[4px] flex items-center justify-center gap-[6px] text-[15px] font-normal leading-none">
          <span className="h-[13px] w-[13px] bg-[#ef493e]" />
          <span className="text-[#ef493e]">Absent</span>
          <span className="ml-[2px] h-[13px] w-[13px] bg-[#ffa313]" />
          <span className="text-[#ffa313]">Present</span>
        </div>
      </div>
    </section>
  );
};

export default MentorshipDashboard;
