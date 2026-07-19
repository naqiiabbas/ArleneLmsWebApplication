"use client";

import React, { useEffect, useMemo, useState } from "react";
import { listActivityLogs } from "@/lib/data/activity";
import type { UIActivityLog, ActivityStatus } from "@/lib/data/activity.types";

type ActivityLog = UIActivityLog;

function StatCard({ stat }: { stat: { id: string; label: string; value: string; color: string } }) {
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
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAction, setSelectedAction] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    listActivityLogs()
      .then(setLogs)
      .catch((e) => setNotice((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  const actionOptions = useMemo(() => Array.from(new Set(logs.map((log) => log.action))), [logs]);
  const roleOptions = useMemo(() => Array.from(new Set(logs.map((log) => log.role).filter(Boolean))), [logs]);
  const statusOptions = ["Success", "Failed"];

  const stats = useMemo(() => {
    const success = logs.filter((l) => l.status === "Success").length;
    const failed = logs.filter((l) => l.status === "Failed").length;
    const activeUsers = new Set(logs.map((l) => l.user)).size;
    return [
      { id: "total", label: "Total Activities", value: String(logs.length), color: "#0f65d8" },
      { id: "success", label: "Successful", value: String(success), color: "#00a64f" },
      { id: "failed", label: "Failed", value: String(failed), color: "#f00012" },
      { id: "active", label: "Active Users", value: String(activeUsers), color: "#0f65d8" },
    ];
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return logs.filter((log) => {
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
  }, [logs, searchQuery, selectedAction, selectedRole, selectedStatus]);

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

      {notice && (
        <div className="mb-[24px] rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-semibold text-red-700">
          {notice}
        </div>
      )}

      <div className="mb-[24px] grid grid-cols-1 gap-[24px] md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
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
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-[24px] py-12 text-center text-[15px] text-[#777777]">
                    Loading activity logs...
                  </td>
                </tr>
              ) : filteredLogs.length > 0 ? (
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
