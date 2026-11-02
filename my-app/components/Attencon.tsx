"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Camera, Download, Eye, MapPin, X } from "lucide-react";
import { getAttendanceData, setAttendanceExcuse, getAttendancePhotoUrl } from "@/lib/data/attendance";
import { usePermissions } from "@/components/PermissionsProvider";
import { addDaysYmd, addMonthsYmd, ymdInZone } from "@/lib/time";

const DATE_RANGES = [
  { id: "all", label: "All Dates" },
  { id: "today", label: "Today" },
  { id: "7", label: "Last 7 Days" },
  { id: "14", label: "Last 14 Days" },
  { id: "21", label: "Last 21 Days" },
  { id: "month", label: "Last 1 Month" },
] as const;
type DateRange = (typeof DATE_RANGES)[number]["id"];
import type { UIAttendanceRecord, AttendanceStatus, AttendanceData, ExcuseState } from "@/lib/data/attendance.types";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type AttendanceRecord = UIAttendanceRecord;

const STATUS_FILTERS = [
  { id: "All", label: "All Status" },
  { id: "Present", label: "Present" },
  { id: "Late", label: "Late" },
  { id: "Absent", label: "Absent" },
  { id: "needs_review", label: "Absent: Needs Review" },
  { id: "excused", label: "Absent: Excused" },
  { id: "unexcused", label: "Absent: Unexcused" },
] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number]["id"];

const EXCUSE_LABEL: Record<ExcuseState, string> = { none: "Needs review", excused: "Excused", unexcused: "Unexcused" };
const excuseLabel = (r: AttendanceRecord) => (r.status === "Absent" ? EXCUSE_LABEL[r.excuse] : "");

const statusBadgeClass: Record<AttendanceStatus, string> = {
  Present: "bg-[#d9f8e6] text-[#009a3d]",
  Late: "bg-[#ffe9d6] text-[#c65300]",
  Absent: "bg-[#ffe1e1] text-[#c90000]",
};

const StatusBadge = ({ status }: { status: AttendanceStatus }) => (
  <span className={`inline-flex h-[25px] items-center rounded-full px-[13px] text-[13px] font-normal leading-none ${statusBadgeClass[status]}`}>
    {status}
  </span>
);

const excuseBadgeClass: Record<ExcuseState, string> = {
  none: "bg-[#fff7e8] text-[#b97700]",
  excused: "bg-[#dbeafe] text-[#0057ff]",
  unexcused: "bg-[#f1f1f1] text-[#666666]",
};

const ExcuseBadge = ({ excuse }: { excuse: ExcuseState }) => (
  <span className={`inline-flex h-[25px] items-center whitespace-nowrap rounded-full px-[13px] text-[13px] font-normal leading-none ${excuseBadgeClass[excuse]}`}>
    {EXCUSE_LABEL[excuse]}
  </span>
);

const AdminFooter = () => (
  <div className="mt-6 rounded-[8px] bg-white py-[21px] text-center text-[15px] font-normal leading-none text-[#666666]">
    Support <span className="mx-[13px]">{"\u2022"}</span> Privacy <span className="mx-[13px]">{"\u2022"}</span> Terms
  </div>
);

const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="overflow-hidden rounded-[8px] border border-[#d6d6d6] bg-white">
    <div className="flex h-[71px] items-center border-b border-[#e2e2e2] px-[24px]">
      <h2 className="text-[18px] font-normal leading-none text-[#111111]">{title}</h2>
    </div>
    <div className="h-[350px] bg-[#fff7e8] px-[28px] py-[29px]">
      {children}
    </div>
  </section>
);

const EMPTY_ATTENDANCE: AttendanceData = {
  today: "",
  records: [],
  stats: { present: 0, absent: 0, late: 0, rate: 0 },
  weekly: [],
  monthly: [],
};

export default function Attencon() {
  const { isAdminTier } = usePermissions();
  const [data, setData] = useState<AttendanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [selected, setSelected] = useState<AttendanceRecord | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const attendance = data ?? EMPTY_ATTENDANCE;
  // Dates are the program's (Pacific) calendar days, not the viewer's.
  const todayStr = data?.today ?? ymdInZone();
  const rangeLabel = DATE_RANGES.find((r) => r.id === dateRange)?.label ?? "All Dates";
  const rangeStart =
    dateRange === "all" ? "" :
    dateRange === "today" ? todayStr :
    dateRange === "month" ? addMonthsYmd(todayStr, -1) :
    addDaysYmd(todayStr, -(Number(dateRange) - 1)); // inclusive of today

  const refresh = async () => {
    setLoading(true);
    try {
      setData(await getAttendanceData());
    } catch (e) {
      setNotice({ text: (e as Error).message, error: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (!selected) {
      setPhotoUrl(null);
      return;
    }
    setPhotoUrl(null);
    getAttendancePhotoUrl(selected.id).then((r) => setPhotoUrl(r.url ?? null));
  }, [selected]);

  const handleExcuse = async (excuse: "excused" | "unexcused") => {
    if (!selected || saving) return;
    setSaving(true);
    const res = await setAttendanceExcuse(selected.id, excuse);
    setSaving(false);
    if (res.error) {
      setNotice({ text: res.error, error: true });
      return;
    }
    setSelected((prev) => (prev ? { ...prev, excuse } : prev));
    setNotice({ text: `${selected.studentName}'s absence on ${selected.date} marked ${excuse}.` });
    await refresh();
  };

  const recordsInRange = useMemo(
    () => (rangeStart ? attendance.records.filter((r) => r.date >= rangeStart && r.date <= todayStr) : attendance.records),
    [attendance.records, rangeStart, todayStr]
  );

  const filteredRecords = useMemo(
    () =>
      recordsInRange.filter((r) => {
        if (statusFilter === "All") return true;
        if (statusFilter === "needs_review") return r.status === "Absent" && r.excuse === "none";
        if (statusFilter === "excused" || statusFilter === "unexcused") return r.status === "Absent" && r.excuse === statusFilter;
        return r.status === statusFilter;
      }),
    [recordsInRange, statusFilter]
  );
  const statusFilterLabel = STATUS_FILTERS.find((f) => f.id === statusFilter)?.label ?? "All Status";
  const needsReview = useMemo(
    () => recordsInRange.filter((r) => r.status === "Absent" && r.excuse === "none").length,
    [recordsInRange]
  );

  // The cards follow the selected range; "All Dates" keeps the 7-day summary.
  const summary = useMemo(() => {
    if (!rangeStart) return attendance.stats;
    const count = (s: AttendanceStatus) => recordsInRange.filter((r) => r.status === s).length;
    const present = count("Present"), late = count("Late"), absent = count("Absent");
    const total = present + late + absent;
    return { present, late, absent, rate: total ? Math.round(((present + late) / total) * 1000) / 10 : 0 };
  }, [attendance.stats, recordsInRange, rangeStart]);
  const statsSub = rangeStart ? rangeLabel : "Last 7 Days";

  const downloadReport = async () => {
    if (typeof window === "undefined") return;

    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Attendance Report", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);
    doc.text(`Filters: Status = ${statusFilterLabel}, Date = ${rangeLabel}`, 14, 28);

    autoTable(doc, {
      head: [["Student ID", "Student Name", "Class", "Time", "Status", "Absence", "Date", "Batch"]],
      body: filteredRecords.map((r) => [r.studentId, r.studentName, r.className, r.time, r.status, excuseLabel(r), r.date, r.batch]),
      startY: 34,
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [249, 166, 24] },
    });

    doc.save(`attendance-report-${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const downloadCsv = () => {
    if (typeof window === "undefined") return;
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const header = "Student ID,Student Name,Class,Time,Status,Absence,Date,Batch\n";
    const rows = filteredRecords
      .map((r) => [r.studentId, r.studentName, r.className, r.time, r.status, excuseLabel(r), r.date, r.batch].map(esc).join(","))
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-full bg-[#f4f4f4] px-6 py-6 font-[Poppins]">
      <div className="mb-[24px] flex items-center justify-between gap-4">
        <div className="flex items-center gap-[12px]">
          <div className="flex h-[48px] w-[48px] items-center justify-center rounded-[8px] bg-[#fff7e8]">
            <img src="/images/admin-attendance-header.svg" alt="" className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-[24px] font-semibold leading-none text-[#111111]">Attendance Management</h1>
            <p className="mt-[7px] text-[16px] font-normal leading-none text-[#666666]">Track and manage student attendance</p>
          </div>
        </div>

        <div className="flex items-center gap-[12px]">
          <label className={`relative flex h-[48px] min-w-[170px] items-center gap-[10px] rounded-[8px] border border-[#d6d6d6] px-[16px] text-[16px] font-normal text-[#F9A618] transition-colors hover:bg-[#fff7e8] ${dateRange !== "all" ? "bg-[#fff7e8]" : "bg-white"}`}>
            <img src="/images/admin-attendance-filter.svg" alt="" className="h-4 w-4" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRange)}
              aria-label="Filter by date range"
              className="h-full w-full cursor-pointer bg-transparent text-[16px] text-[#F9A618] outline-none"
            >
              {DATE_RANGES.map((r) => (
                <option key={r.id} value={r.id} className="text-[#111111]">{r.label}</option>
              ))}
            </select>
          </label>
          <button
            onClick={downloadCsv}
            className="flex h-[48px] min-w-[126px] items-center justify-center gap-[10px] rounded-[8px] border border-[#d6d6d6] bg-white px-[20px] text-[16px] font-normal text-[#F9A618] transition-colors hover:bg-[#fff7e8]"
          >
            <Download size={18} strokeWidth={2} />
            Export CSV
          </button>
          <button
            onClick={downloadReport}
            className="flex h-[48px] min-w-[160px] items-center justify-center gap-[10px] rounded-[8px] bg-[#F9A618] px-[24px] text-[16px] font-medium text-white transition-colors hover:bg-[#f0a014]"
          >
            <Download size={18} strokeWidth={2} />
            Export PDF
          </button>
        </div>
      </div>

      {notice && (
        <div className={`mb-[24px] flex items-start justify-between gap-4 rounded-[8px] border px-4 py-3 text-[14px] font-semibold ${notice.error ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"}`}>
          <span className="break-words">{notice.text}</span>
          <button type="button" onClick={() => setNotice(null)} className="shrink-0 text-[13px] underline">
            Dismiss
          </button>
        </div>
      )}

      <div className="mb-[24px] grid grid-cols-1 gap-[18px] sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Present" value={summary.present} sub={statsSub} color="text-[#00a641]" />
        <StatCard label="Total Absent" value={summary.absent} sub={statsSub} color="text-[#ff0000]" />
        <StatCard label="Late Arrivals" value={summary.late} sub={statsSub} color="text-[#ff7a00]" />
        <StatCard label="Attendance Rate" value={`${summary.rate}%`} sub={statsSub} color="text-[#F9A618]" />
      </div>

      <div className="mb-[24px] grid grid-cols-1 gap-[18px] xl:grid-cols-2">
        <ChartCard title="Weekly Attendance Breakdown">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={attendance.weekly} margin={{ top: 0, right: 10, left: 18, bottom: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4d7bd" vertical />
              <XAxis dataKey="day" stroke="#666666" fontSize={13} tickLine={false} axisLine={{ stroke: "#777777" }} />
              <YAxis domain={[0, 60]} ticks={[0, 15, 30, 45, 60]} stroke="#666666" fontSize={13} tickLine={false} axisLine={{ stroke: "#777777" }} />
              <Tooltip cursor={{ fill: "rgba(249,166,24,0.08)" }} />
              <Legend
                verticalAlign="bottom"
                align="center"
                iconType="square"
                formatter={(value) => <span className="text-[16px] capitalize text-[#e43131]">{String(value)}</span>}
              />
              <Bar dataKey="absent" name="Absent" fill="#dc2f2f" barSize={19} radius={[8, 8, 0, 0]} />
              <Bar dataKey="late" name="Late" fill="#f47c00" barSize={19} radius={[8, 8, 0, 0]} />
              <Bar dataKey="present" name="Present" fill="#F9A618" barSize={19} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly Attendance Trend">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={attendance.monthly} margin={{ top: 3, right: 10, left: 18, bottom: 15 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4d7bd" vertical />
              <XAxis dataKey="week" stroke="#666666" fontSize={13} tickLine={false} axisLine={{ stroke: "#777777" }} />
              <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} stroke="#666666" fontSize={13} tickLine={false} axisLine={{ stroke: "#777777" }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="#F9A618"
                strokeWidth={3}
                dot={{ r: 7, fill: "#F9A618", stroke: "#F9A618" }}
                activeDot={{ r: 7, fill: "#F9A618", stroke: "#F9A618" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <section className="overflow-hidden rounded-[8px] border border-[#d6d6d6] bg-white">
        <div className="flex h-[71px] items-center justify-between border-b border-[#e5e5e5] px-[24px]">
          <div className="flex items-center gap-[12px]">
            <h2 className="text-[18px] font-normal leading-none text-[#111111]">Recent Attendance Records</h2>
            {needsReview > 0 && (
              <button
                type="button"
                onClick={() => setStatusFilter("needs_review")}
                className="inline-flex h-[28px] items-center whitespace-nowrap rounded-full bg-[#fff7e8] px-[13px] text-[13px] font-medium leading-none text-[#b97700] transition-colors hover:bg-[#ffedcc]"
              >
                {needsReview} need{needsReview === 1 ? "s" : ""} review
              </button>
            )}
          </div>
          <div className="relative h-[40px] w-[205px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              aria-label="Filter by status"
              className="h-full w-full appearance-none rounded-[8px] border border-[#d6d6d6] bg-white px-[13px] pr-[34px] text-[15px] font-normal text-[#666666] outline-none"
            >
              {STATUS_FILTERS.map((f) => (
                <option key={f.id} value={f.id}>{f.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1020px] w-full text-left">
            <thead className="bg-[#f2f2f2] text-[16px] font-normal leading-none text-[#666666]">
              <tr>
                <th className="px-[24px] py-[18px] font-normal">Student ID</th>
                <th className="px-[24px] py-[18px] font-normal">Student Name</th>
                <th className="px-[24px] py-[18px] font-normal">Class</th>
                <th className="px-[24px] py-[18px] font-normal">Time</th>
                <th className="px-[24px] py-[18px] font-normal">Status</th>
                <th className="px-[24px] py-[18px] font-normal">Absence</th>
                <th className="px-[24px] py-[18px] font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={7} className="px-[24px] py-[40px] text-center text-[#777777]">Loading attendance...</td></tr>
              )}
              {!loading && filteredRecords.length === 0 && (
                <tr><td colSpan={7} className="px-[24px] py-[40px] text-center text-[#777777]">No attendance records found.</td></tr>
              )}
              {!loading && filteredRecords.map((r) => (
                <tr key={r.id} className="border-b border-[#e5e5e5] text-[16px] font-normal leading-none text-[#666666] last:border-b-0">
                  <td className="px-[24px] py-[20px] text-[#111111]">{r.studentId}</td>
                  <td className="px-[24px] py-[20px] text-[#111111]">{r.studentName}</td>
                  <td className="px-[24px] py-[20px]">{r.className}</td>
                  <td className="px-[24px] py-[20px]">{r.time}</td>
                  <td className="px-[24px] py-[20px]"><StatusBadge status={r.status} /></td>
                  <td className="px-[24px] py-[20px]">{r.status === "Absent" ? <ExcuseBadge excuse={r.excuse} /> : "-"}</td>
                  <td className="px-[24px] py-[20px]">
                    <button
                      onClick={() => setSelected(r)}
                      className="flex items-center gap-[6px] text-[15px] font-normal text-[#d99a23] transition-colors hover:text-[#F9A618]"
                    >
                      <Eye size={16} strokeWidth={2} />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <AdminFooter />

      {selected && (
        <AttendanceDetailModal
          record={selected}
          photoUrl={photoUrl}
          canReview={isAdminTier}
          saving={saving}
          onExcuse={handleExcuse}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

function AttendanceDetailModal({
  record,
  photoUrl,
  canReview,
  saving,
  onExcuse,
  onClose,
}: {
  record: AttendanceRecord;
  photoUrl: string | null;
  canReview: boolean;
  saving: boolean;
  onExcuse: (excuse: "excused" | "unexcused") => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="flex max-h-[calc(100vh-24px)] w-full max-w-[670px] flex-col overflow-hidden rounded-[8px] bg-white shadow-2xl">
        <div className="flex h-[73px] flex-none items-center justify-between border-b border-[#d9d9d9] px-[24px]">
          <h2 className="text-[18px] font-normal leading-none text-[#111111]">Attendance Detail</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#777777] transition-colors hover:bg-[#f2f2f2]"
            aria-label="Close"
          >
            <X size={24} strokeWidth={2} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-[24px] py-[24px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <section className="rounded-[8px] bg-[#fff7e8] px-[24px] py-[24px]">
            <h3 className="mb-[22px] text-[15px] font-normal leading-none text-[#666666]">Student Information</h3>
            <div className="grid grid-cols-2 gap-x-[76px] gap-y-[20px]">
              <ModalInfo label="Student ID" value={record.studentId} />
              <ModalInfo label="Student Name" value={record.studentName} />
              <ModalInfo label="Class" value={record.className} />
              <ModalInfo label="Batch" value={record.batch} />
            </div>
          </section>

          <h3 className="mt-[25px] text-[16px] font-normal leading-none text-[#666666]">Attendance Metadata</h3>
          <div className="mt-[18px] grid grid-cols-1 gap-[16px] md:grid-cols-2">
            <MetaBox icon="/images/admin-attendance-date.svg" label="Date" value={record.date} />
            <MetaBox icon="/images/admin-attendance-time.svg" label="Time" value={record.time} />
            <MetaBox icon="/images/admin-attendance-device.svg" label="Device" value={record.device} />
            <MetaBox node={<MapPin size={20} strokeWidth={1.8} />} label="Location" value={record.location} />
          </div>

          <h3 className="mt-[25px] text-[16px] font-normal leading-none text-[#666666]">Attendance Status</h3>
          <div className="mt-[18px] flex items-center gap-[10px]">
            <StatusBadge status={record.status} />
            {record.status === "Absent" && <ExcuseBadge excuse={record.excuse} />}
          </div>

          {record.status === "Absent" && (
            <div className="mt-[18px] rounded-[8px] border border-[#d6d6d6] bg-[#fafafa] px-[16px] py-[16px]">
              <p className="text-[14px] font-normal leading-none text-[#666666]">Absence Management (Admin)</p>
              <p className="mt-[12px] text-[14px] font-normal leading-[20px] text-[#111111]">
                <span className="text-[#777777]">Student&apos;s reason: </span>
                {record.absenceReason ?? "No absence report submitted."}
              </p>
              {canReview ? (
                <div className="mt-[14px] flex flex-wrap gap-[12px]">
                  <button
                    onClick={() => onExcuse("excused")}
                    disabled={saving || record.excuse === "excused"}
                    className="h-[38px] rounded-[8px] bg-[#0057ff] px-[18px] text-[15px] font-medium text-white hover:bg-[#0048d1] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {record.excuse === "excused" ? "Excused" : "Mark Excused"}
                  </button>
                  <button
                    onClick={() => onExcuse("unexcused")}
                    disabled={saving || record.excuse === "unexcused"}
                    className="h-[38px] rounded-[8px] border border-[#d6d6d6] bg-white px-[18px] text-[15px] font-medium text-[#666666] hover:bg-[#f2f2f2] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {record.excuse === "unexcused" ? "Unexcused" : "Mark Unexcused"}
                  </button>
                </div>
              ) : (
                <p className="mt-[12px] text-[13px] font-normal leading-none text-[#777777]">Only an admin can change this.</p>
              )}
            </div>
          )}

          <div className="mt-[25px] flex items-center gap-[7px] text-[16px] font-normal leading-none text-[#666666]">
            <Camera size={16} strokeWidth={1.8} />
            Photo Proof (Read-Only)
          </div>
          <div className="mt-[18px] flex h-[258px] items-center justify-center overflow-hidden rounded-[8px] bg-[#f4f4f4]">
            {photoUrl ? (
              <img src={photoUrl} alt="Attendance proof" className="h-full w-full max-w-[400px] object-contain" />
            ) : (
              <span className="text-[14px] text-[#999999]">
                {record.hasPhoto ? "Loading photo..." : "No photo proof for this record."}
              </span>
            )}
          </div>
        </div>

        <div className="flex h-[88px] flex-none items-center justify-end border-t border-[#d9d9d9] px-[24px]">
          <button
            onClick={onClose}
            className="h-[40px] rounded-[8px] bg-[#F9A618] px-[23px] text-[16px] font-medium text-white transition-colors hover:bg-[#f0a014]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

const ModalInfo = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="mb-[8px] text-[13px] font-normal leading-none text-[#777777]">{label}</p>
    <p className="text-[15px] font-normal leading-none text-[#111111]">{value}</p>
  </div>
);

const MetaBox = ({ icon, node, label, value }: { icon?: string; node?: React.ReactNode; label: string; value: string }) => (
  <div className="flex h-[63px] items-center gap-[12px] rounded-[8px] border border-[#d6d6d6] bg-white px-[14px]">
    <span className="flex h-6 w-6 items-center justify-center text-[#F9A618]">
      {icon ? <img src={icon} alt="" className="h-5 w-5" /> : node}
    </span>
    <div>
      <p className="mb-[6px] text-[13px] font-normal leading-none text-[#777777]">{label}</p>
      <p className="text-[15px] font-normal leading-none text-[#111111]">{value}</p>
    </div>
  </div>
);

const StatCard = ({ label, value, sub, color }: { label: string; value: string | number; sub: string; color: string }) => (
  <div className="h-[131px] rounded-[8px] border border-[#d6d6d6] bg-white px-[24px] py-[27px]">
    <p className="text-[16px] font-normal leading-none text-[#666666]">{label}</p>
    <p className={`mt-[17px] text-[25px] font-normal leading-none ${color}`}>{value}</p>
    <p className="mt-[16px] text-[13px] font-normal leading-none text-[#666666]">{sub}</p>
  </div>
);
