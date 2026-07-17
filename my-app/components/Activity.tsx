"use client";

import React, { useMemo, useState } from "react";

type ActivityStatus = "Success" | "Failed";

type ActivityLog = {
  id: number;
  time: string;
  user: string;
  role: string;
  action: string;
  actionIcon: string;
  target: string;
  ip: string;
  status: ActivityStatus;
};

const LOG_STATS = [
  { id: "total", label: "Total Activities", value: "8", color: "#0f65d8" },
  { id: "success", label: "Successful", value: "7", color: "#00a64f" },
  { id: "failed", label: "Failed", value: "1", color: "#f00012" },
  { id: "active", label: "Active Users", value: "7", color: "#0f65d8" },
];

const ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 1,
    time: "2025-11-28 10:30:15",
    user: "John Admin",
    role: "Admin",
    action: "Logged in to system",
    actionIcon: "/images/activity-icon-login.svg",
    target: "System",
    ip: "192.168.1.100",
    status: "Success",
  },
  {
    id: 2,
    time: "2025-11-28 10:25:42",
    user: "Dr. Sarah Johnson",
    role: "Mentor",
    action: "Created new student record",
    actionIcon: "/images/activity-icon-create.svg",
    target: "Student: Alex Martinez",
    ip: "192.168.1.101",
    status: "Success",
  },
  {
    id: 3,
    time: "2025-11-28 10:15:30",
    user: "Maria Garcia",
    role: "Manager",
    action: "Updated attendance record",
    actionIcon: "/images/activity-icon-update.svg",
    target: "Attendance: Session #1234",
    ip: "192.168.1.102",
    status: "Success",
  },
  {
    id: 4,
    time: "2025-11-28 10:05:18",
    user: "Alex Martinez",
    role: "Student",
    action: "Downloaded document",
    actionIcon: "/images/activity-icon-download.svg",
    target: "Document: Python Assignment 5",
    ip: "192.168.1.103",
    status: "Success",
  },
  {
    id: 5,
    time: "2025-11-28 09:55:22",
    user: "Robert Smith",
    role: "Student",
    action: "Failed login attempt",
    actionIcon: "/images/activity-icon-failed-login.svg",
    target: "System",
    ip: "192.168.1.104",
    status: "Failed",
  },
  {
    id: 6,
    time: "2025-11-28 09:45:10",
    user: "Prof. Michael Chen",
    role: "Mentor",
    action: "Deleted student note",
    actionIcon: "/images/activity-icon-delete.svg",
    target: "Note #567",
    ip: "192.168.1.105",
    status: "Success",
  },
  {
    id: 7,
    time: "2025-11-28 09:30:05",
    user: "John Admin",
    role: "Admin",
    action: "Viewed user management",
    actionIcon: "/images/activity-icon-view-user.svg",
    target: "User Management",
    ip: "192.168.1.100",
    status: "Success",
  },
  {
    id: 8,
    time: "2025-11-28 09:15:40",
    user: "Emma Williams",
    role: "Student",
    action: "Logged out from system",
    actionIcon: "/images/activity-icon-login.svg",
    target: "System",
    ip: "192.168.1.106",
    status: "Success",
  },
];

function StatCard({ stat }: { stat: (typeof LOG_STATS)[number] }) {
  return (
    <div className="h-[108px] rounded-[8px] border border-[#d9d9d9] bg-white px-[24px] py-[25px]">
      <p className="text-[15px] font-normal leading-none text-[#666666]">{stat.label}</p>
      <p className="mt-[14px] text-[24px] font-normal leading-none" style={{ color: stat.color }}>
        {stat.value}
      </p>
    </div>
  );
}

function SelectFilter({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative w-full">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-[48px] w-full appearance-none rounded-[8px] border border-[#d9d9d9] bg-white px-[12px] pr-[38px] text-[16px] font-normal text-[#666666] outline-none transition focus:border-[#f9a313]"
      >
        <option value="">{label}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-[16px] top-1/2 h-[9px] w-[9px] -translate-y-[65%] rotate-45 border-b-[1.5px] border-r-[1.5px] border-[#666666]" />
    </div>
  );
}

function StatusBadge({ status }: { status: ActivityStatus }) {
  const success = status === "Success";
  return (
    <span
      className={`inline-flex h-[24px] min-w-[70px] items-center justify-center rounded-full px-[12px] text-[13px] font-normal ${
        success ? "bg-[#dcfce7] text-[#008a37]" : "bg-[#ffe1e4] text-[#d8000e]"
      }`}
    >
      {status}
    </span>
  );
}

function SearchGlyph() {
  return (
    <span className="relative h-[18px] w-[18px] shrink-0 rounded-full border-[2px] border-[#666666]" aria-hidden="true">
      <span className="absolute bottom-[-4px] right-[-3px] h-[7px] w-[2px] rotate-[-45deg] rounded-full bg-[#666666]" />
    </span>
  );
}

export default function ActivityLogs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAction, setSelectedAction] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const actionOptions = useMemo(() => Array.from(new Set(ACTIVITY_LOGS.map((log) => log.action))), []);
  const roleOptions = useMemo(() => Array.from(new Set(ACTIVITY_LOGS.map((log) => log.role))), []);
  const statusOptions = ["Success", "Failed"];

  const filteredLogs = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return ACTIVITY_LOGS.filter((log) => {
      const matchesSearch =
        log.user.toLowerCase().includes(query) ||
        log.action.toLowerCase().includes(query) ||
        log.target.toLowerCase().includes(query) ||
        log.ip.includes(query);

      return (
        matchesSearch &&
        (selectedAction === "" || log.action === selectedAction) &&
        (selectedRole === "" || log.role === selectedRole) &&
        (selectedStatus === "" || log.status === selectedStatus)
      );
    });
  }, [searchQuery, selectedAction, selectedRole, selectedStatus]);

  const handleExport = async () => {
    if (typeof window === "undefined") return;

    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Activity Logs Report", 14, 20);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);

      autoTable(doc, {
        startY: 35,
        head: [["Time", "User", "Action", "Target", "IP Address", "Status"]],
        body: filteredLogs.map((log) => [log.time, log.user, log.action, log.target, log.ip, log.status]),
        headStyles: { fillColor: [249, 166, 24] },
        theme: "striped",
        styles: { font: "helvetica", fontSize: 8 },
      });

      doc.save(`Activity_Logs_${Date.now()}.pdf`);
    } catch (error) {
      console.error("PDF Export failed:", error);
    }
  };

  return (
    <section className="min-h-full bg-[#f4f4f4] px-[24px] py-[24px] font-['Poppins',sans-serif]">
      <div className="mb-[24px] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-[12px]">
          <div className="flex h-[48px] w-[48px] items-center justify-center rounded-[10px] bg-[#fff3df]">
            <img src="/images/activity-header-icon.svg" alt="" className="h-[24px] w-[24px]" />
          </div>
          <div>
            <h1 className="text-[22px] font-bold leading-[1.15] text-[#111111]">Activity Logs</h1>
            <p className="mt-[4px] text-[15px] font-normal leading-none text-[#666666]">Monitor all system activities and user actions</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExport}
          className="flex h-[42px] items-center gap-[9px] rounded-[8px] bg-[#f9a313] px-[20px] text-[16px] font-normal text-white transition hover:bg-[#f2a000]"
        >
          <img src="/images/activity-icon-download.svg" alt="" className="h-[16px] w-[16px] brightness-0 invert" />
          Export Logs
        </button>
      </div>

      <div className="mb-[24px] grid grid-cols-1 gap-[24px] md:grid-cols-2 xl:grid-cols-4">
        {LOG_STATS.map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </div>

      <div className="overflow-hidden rounded-[8px] border border-[#d9d9d9] bg-white">
        <div className="px-[24px] py-[24px]">
          <div className="grid grid-cols-1 gap-[16px] lg:grid-cols-[260px_1fr_1fr_1fr]">
            <div className="flex h-[48px] min-w-0 items-center gap-[13px] rounded-[8px] border border-[#d9d9d9] bg-white px-[16px]">
              <SearchGlyph />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search logs..."
                className="h-full min-w-0 flex-1 bg-transparent text-[16px] font-normal text-[#111111] outline-none placeholder:text-[#8a8a8a]"
              />
            </div>
            <SelectFilter label="All Actions" options={actionOptions} value={selectedAction} onChange={setSelectedAction} />
            <SelectFilter label="All Users" options={roleOptions} value={selectedRole} onChange={setSelectedRole} />
            <SelectFilter label="All Users" options={statusOptions} value={selectedStatus} onChange={setSelectedStatus} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] border-collapse text-left">
            <thead className="bg-[#f2f2f2] text-[15px] font-normal text-[#666666]">
              <tr>
                <th className="px-[24px] py-[14px] font-normal">Time</th>
                <th className="px-[24px] py-[14px] font-normal">User</th>
                <th className="px-[24px] py-[14px] font-normal">Action</th>
                <th className="px-[24px] py-[14px] font-normal">Target</th>
                <th className="px-[24px] py-[14px] font-normal">IP Address</th>
                <th className="px-[24px] py-[14px] font-normal">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e5e5] bg-white">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="h-[70px] text-[15px] transition hover:bg-[#fafafa]">
                    <td className="px-[24px] py-[14px] font-normal text-[#666666]">{log.time}</td>
                    <td className="px-[24px] py-[14px]">
                      <p className="font-normal leading-none text-[#111111]">{log.user}</p>
                      <p className="mt-[8px] text-[13px] font-normal leading-none text-[#666666]">{log.role}</p>
                    </td>
                    <td className="px-[24px] py-[14px]">
                      <div className="flex items-center gap-[9px]">
                        <img src={log.actionIcon} alt="" className="h-[16px] w-[16px]" />
                        <span className="font-normal leading-none text-[#111111]">{log.action}</span>
                      </div>
                    </td>
                    <td className="px-[24px] py-[14px] font-normal text-[#666666]">{log.target}</td>
                    <td className="px-[24px] py-[14px] font-normal text-[#666666]">{log.ip}</td>
                    <td className="px-[24px] py-[14px]">
                      <StatusBadge status={log.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-[24px] py-12 text-center text-[15px] text-[#777777]">
                    No logs found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
