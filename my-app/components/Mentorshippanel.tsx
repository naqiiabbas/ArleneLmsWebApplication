"use client";

import React from "react";
import dynamic from "next/dynamic";
import { TrendingDown, TrendingUp } from "lucide-react";

const AttendanceChart = dynamic(() => import("./Attendancechart"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[255px] items-center justify-center rounded-[8px] bg-[#f7f7f7] text-[14px] text-[#666666]">
      Loading Chart...
    </div>
  ),
});

const dashboardData = {
  welcome: { message: "Welcome back, John. Here's your mentorship overview." },
  stats: [
    {
      id: 1,
      label: "Active Students",
      value: "14",
      trend: "+2",
      trendType: "up",
      icon: "/images/mentor-sidebar-assigned.svg",
      iconBg: "bg-transparent",
      iconColor: "text-[#ffa313]",
    },
    {
      id: 2,
      label: "Sessions Today",
      value: "4",
      trend: null,
      trendType: null,
      icon: "/images/mentor-dashboard-calendar.svg",
      iconBg: "bg-[#e8f2ff]",
      iconColor: "text-[#2f80ed]",
    },
    {
      id: 3,
      label: "Pending Notes",
      value: "3",
      trend: null,
      trendType: null,
      icon: "/images/mentor-dashboard-note.svg",
      iconBg: "bg-[#fff0e4]",
      iconColor: "text-[#f97316]",
    },
    {
      id: 4,
      label: "Alerts / Risks",
      value: "2",
      trend: "-1",
      trendType: "down",
      icon: "/images/mentor-dashboard-alert.svg",
      iconBg: "bg-[#ffe8e8]",
      iconColor: "text-[#ff4d43]",
    },
  ],
  sessions: [
    { id: "s1", name: "Marcus Johnson", time: "10:00 AM", status: "Scheduled", avatar: "/images/avatar1.png" },
    { id: "s2", name: "David Williams", time: "11:30 AM", status: "Scheduled", avatar: "/images/avatar2.png" },
    { id: "s3", name: "James Brown", time: "2:00 PM", status: "Scheduled", avatar: "/images/avatar3.png" },
    { id: "s4", name: "Michael Davis", time: "3:30 PM", status: "Scheduled", avatar: "/images/avatar.png" },
  ],
  activities: [
    { id: "a1", text: "Marcus Johnson marked present for Math Session", time: "2 hours ago", color: "#18bd5b" },
    { id: "a2", text: "New note added for David Williams", time: "4 hours ago", color: "#2f80ed" },
    { id: "a3", text: "James Brown has 3 consecutive absences", time: "5 hours ago", color: "#ff3947" },
    { id: "a4", text: "New message from Michael Davis", time: "1 day ago", color: "#18bd5b" },
  ],
  attendance: [
    { day: "Mon", present: 12, absent: 2 },
    { day: "Tue", present: 14, absent: 0 },
    { day: "Wed", present: 11, absent: 3 },
    { day: "Thu", present: 13, absent: 1 },
    { day: "Fri", present: 12, absent: 2 },
  ],
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
  return (
    <section className="min-h-full w-full overflow-x-hidden bg-[#f4f4f4] px-4 pb-[32px] pt-[28px] font-poppins text-[#111111] md:px-6 lg:px-[24px]">
      <div className="mb-[26px]">
        <h1 className="text-[30px] font-bold leading-none tracking-[-0.02em] text-[#111111]">Dashboard</h1>
        <p className="mt-[10px] text-[14px] font-normal leading-none text-[#666666]">{dashboardData.welcome.message}</p>
      </div>

      <div className="mb-[24px] grid grid-cols-1 gap-[16px] sm:grid-cols-2 xl:grid-cols-4">
        {dashboardData.stats.map((stat) => {
          const TrendIcon = stat.trendType === "up" ? TrendingUp : TrendingDown;

          return (
            <div key={stat.id} className="flex min-h-[136px] items-center justify-between rounded-[8px] border border-[#dddddd] bg-white px-[23px] py-[23px]">
              <div className="min-w-0">
                <p className="text-[14px] font-normal leading-none text-[#666666]">{stat.label}</p>
                <p className="mt-[17px] text-[22px] font-semibold leading-none text-[#111111]">{stat.value}</p>
                {stat.trend && (
                  <p className="mt-[19px] flex items-center gap-[5px] text-[13px] font-normal leading-none">
                    <TrendIcon size={14} strokeWidth={2} className={stat.trendType === "up" ? "text-[#18bd5b]" : "text-[#18bd5b]"} />
                    <span className={stat.trendType === "up" ? "text-[#18bd5b]" : "text-[#18bd5b]"}>{stat.trend}</span>
                    <span className="text-[#666666]">vs last month</span>
                  </p>
                )}
              </div>
              <div className={`flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-[9px] ${stat.iconBg}`}>
                <span className={stat.iconColor}>
                  <MaskIcon src={stat.icon} />
                </span>
              </div>
            </div>
          );
        })}
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
                {dashboardData.sessions.map((session) => (
                  <tr key={session.id} className="border-b border-[#e5e5e5] last:border-b">
                    <td className="py-[15px] pl-[8px]">
                      <div className="flex items-center gap-[13px]">
                        <img src={session.avatar} alt={session.name} className="h-[32px] w-[32px] rounded-full object-cover" />
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
            {dashboardData.activities.map((activity) => (
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
          <AttendanceChart data={dashboardData.attendance} />
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
