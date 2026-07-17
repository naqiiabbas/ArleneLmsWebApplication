"use client";

import React, { useMemo, useState } from "react";
import { Camera, Download, Eye, MapPin, X } from "lucide-react";
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

type AttendanceStatus = "Present" | "Absent" | "Late";

type AttendanceRecord = {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  time: string;
  status: AttendanceStatus;
  batch: string;
  date: string;
  device: string;
  location: string;
  photoUrl: string;
};

const RECORDS: AttendanceRecord[] = [
  {
    id: "1",
    studentId: "STU001",
    studentName: "Alex Martinez",
    className: "Computer Science",
    time: "09:15 AM",
    status: "Present",
    batch: "Batch A",
    date: "2026-01-19",
    device: "iPhone 13 Pro",
    location: "Building A, Room 101",
    photoUrl: "/images/avatar1.png",
  },
  {
    id: "2",
    studentId: "STU002",
    studentName: "Emma Williams",
    className: "Data Science",
    time: "09:12 AM",
    status: "Present",
    batch: "Batch B",
    date: "2026-01-19",
    device: "Samsung S23",
    location: "Building B, Room 203",
    photoUrl: "/images/avatar2.png",
  },
  {
    id: "3",
    studentId: "STU003",
    studentName: "James Taylor",
    className: "Computer Science",
    time: "09:35 AM",
    status: "Late",
    batch: "Batch C",
    date: "2026-01-19",
    device: "MacBook Pro",
    location: "Building A, Room 201",
    photoUrl: "/images/avatar3.png",
  },
  {
    id: "4",
    studentId: "STU004",
    studentName: "Sophia Brown",
    className: "Web Development",
    time: "09:10 AM",
    status: "Present",
    batch: "Batch B",
    date: "2026-01-19",
    device: "iPhone 12",
    location: "Building C, Room 101",
    photoUrl: "/images/avatar.png",
  },
  {
    id: "5",
    studentId: "STU005",
    studentName: "Noah Johnson",
    className: "Data Science",
    time: "-",
    status: "Absent",
    batch: "Batch A",
    date: "2026-01-19",
    device: "N/A",
    location: "N/A",
    photoUrl: "/images/avatar1.png",
  },
];

const WEEKLY_BREAKDOWN = [
  { day: "Mon", present: 42, absent: 3, late: 2 },
  { day: "Tue", present: 45, absent: 1, late: 1 },
  { day: "Wed", present: 44, absent: 2, late: 1 },
  { day: "Thu", present: 46, absent: 1, late: 0 },
  { day: "Fri", present: 43, absent: 2, late: 2 },
];

const MONTHLY_TREND = [
  { week: "Week 1", rate: 95 },
  { week: "Week 2", rate: 91 },
  { week: "Week 3", rate: 97 },
  { week: "Week 4", rate: 94 },
];

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

export default function Attencon() {
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | "All">("All");
  const [filteredDate, setFilteredDate] = useState<string | null>(null);
  const [selected, setSelected] = useState<AttendanceRecord | null>(null);

  const filteredRecords = useMemo(() => {
    return RECORDS.filter((r) => {
      const matchStatus = statusFilter === "All" || r.status === statusFilter;
      const matchDate = !filteredDate || r.date === filteredDate;
      return matchStatus && matchDate;
    });
  }, [statusFilter, filteredDate]);

  const summary = useMemo(() => {
    return {
      present: 220,
      absent: 9,
      late: 6,
      rate: 93.6,
    };
  }, []);

  const downloadReport = async () => {
    if (typeof window === "undefined") return;

    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Attendance Report", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);
    doc.text(`Filters: Status = ${statusFilter}, Date = ${filteredDate ?? "All"}`, 14, 28);

    autoTable(doc, {
      head: [["Student ID", "Student Name", "Class", "Time", "Status", "Date", "Batch"]],
      body: filteredRecords.map((r) => [r.studentId, r.studentName, r.className, r.time, r.status, r.date, r.batch]),
      startY: 34,
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [249, 166, 24] },
    });

    doc.save(`attendance-report-${new Date().toISOString().split("T")[0]}.pdf`);
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
          <button
            onClick={() => setFilteredDate((prev) => (prev ? null : "2026-01-19"))}
            className="flex h-[48px] min-w-[126px] items-center justify-center gap-[10px] rounded-[8px] border border-[#d6d6d6] bg-white px-[20px] text-[16px] font-normal text-[#F9A618] transition-colors hover:bg-[#fff7e8]"
          >
            <img src="/images/admin-attendance-filter.svg" alt="" className="h-4 w-4" />
            Filter
          </button>
          <button
            onClick={downloadReport}
            className="flex h-[48px] min-w-[194px] items-center justify-center gap-[10px] rounded-[8px] bg-[#F9A618] px-[24px] text-[16px] font-medium text-white transition-colors hover:bg-[#f0a014]"
          >
            <Download size={18} strokeWidth={2} />
            Export Report
          </button>
        </div>
      </div>

      <div className="mb-[24px] grid grid-cols-1 gap-[18px] sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Present" value={summary.present} sub="This week" color="text-[#00a641]" />
        <StatCard label="Total Absent" value={summary.absent} sub="This week" color="text-[#ff0000]" />
        <StatCard label="Late Arrivals" value={summary.late} sub="This week" color="text-[#ff7a00]" />
        <StatCard label="Attendance Rate" value={`${summary.rate}%`} sub="This week" color="text-[#F9A618]" />
      </div>

      <div className="mb-[24px] grid grid-cols-1 gap-[18px] xl:grid-cols-2">
        <ChartCard title="Weekly Attendance Breakdown">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={WEEKLY_BREAKDOWN} margin={{ top: 0, right: 10, left: 18, bottom: 12 }}>
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
            <LineChart data={MONTHLY_TREND} margin={{ top: 3, right: 10, left: 18, bottom: 15 }}>
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
          <h2 className="text-[18px] font-normal leading-none text-[#111111]">Recent Attendance Records</h2>
          <div className="relative h-[40px] w-[135px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as AttendanceStatus | "All")}
              className="h-full w-full appearance-none rounded-[8px] border border-[#d6d6d6] bg-white px-[13px] pr-[34px] text-[15px] font-normal text-[#666666] outline-none"
            >
              <option value="All">All Status</option>
              <option value="Present">Present</option>
              <option value="Late">Late</option>
              <option value="Absent">Absent</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-left">
            <thead className="bg-[#f2f2f2] text-[16px] font-normal leading-none text-[#666666]">
              <tr>
                <th className="px-[24px] py-[18px] font-normal">Student ID</th>
                <th className="px-[24px] py-[18px] font-normal">Student Name</th>
                <th className="px-[24px] py-[18px] font-normal">Class</th>
                <th className="px-[24px] py-[18px] font-normal">Time</th>
                <th className="px-[24px] py-[18px] font-normal">Status</th>
                <th className="px-[24px] py-[18px] font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((r) => (
                <tr key={r.id} className="border-b border-[#e5e5e5] text-[16px] font-normal leading-none text-[#666666] last:border-b-0">
                  <td className="px-[24px] py-[20px] text-[#111111]">{r.studentId}</td>
                  <td className="px-[24px] py-[20px] text-[#111111]">{r.studentName}</td>
                  <td className="px-[24px] py-[20px]">{r.className}</td>
                  <td className="px-[24px] py-[20px]">{r.time}</td>
                  <td className="px-[24px] py-[20px]"><StatusBadge status={r.status} /></td>
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

      {selected && <AttendanceDetailModal record={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function AttendanceDetailModal({ record, onClose }: { record: AttendanceRecord; onClose: () => void }) {
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
          <div className="mt-[18px]">
            <StatusBadge status={record.status} />
          </div>

          <div className="mt-[25px] flex items-center gap-[7px] text-[16px] font-normal leading-none text-[#666666]">
            <Camera size={16} strokeWidth={1.8} />
            Photo Proof (Read-Only)
          </div>
          <div className="mt-[18px] h-[258px] overflow-hidden rounded-t-[8px] bg-[#f4f4f4] px-[112px] pt-[16px]">
            <img src={record.photoUrl} alt="Attendance proof" className="mx-auto h-[278px] w-full max-w-[400px] rounded-[8px] object-cover object-top" />
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
