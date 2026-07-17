"use client";

import React from "react";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Search, Trash2, ChevronDown, Plus } from "lucide-react";
import {
  listMentors,
  createMentor,
  updateMentor,
  deleteMentor,
} from "@/lib/data/mentors";

type MentorStatus = "Active" | "Inactive";

interface Mentor {
  id: string;
  name: string;
  email: string;
  expertise: string;
  sessions: number;
  students: number;
  rating: number;
  status: MentorStatus;
  phone: string;
  experience: string;
  address: string;
  joinDate: string;
  avatar: string;
  stats: {
    totalSessions: number;
    studentsAssigned: number;
    avgPerMonth: number;
  };
  quickActions: string[];
}

type ViewMode = "list" | "detail" | "add" | "edit";

type Notice = { type: "success" | "error"; msg: string };

const statusStyles: Record<MentorStatus, string> = {
  Active: "bg-[#E9F7ED] text-[#1BA160] border border-[#CFEEDD]",
  Inactive: "bg-[#F1F5F9] text-[#8C8C8C] border border-[#E5E7EB]",
};

const badge = (status: MentorStatus) => (
  <span
    className={`px-3 py-[6px] rounded-full text-[12px] font-semibold leading-none inline-flex items-center gap-1 ${statusStyles[status]}`}
  >
    <span className="w-2 h-2 rounded-full bg-current" />
    {status}
  </span>
);

const inputClasses =
  "h-[42px] w-full rounded-[8px] border border-[#d6d6d6] px-[15px] text-[16px] text-[#777777] outline-none placeholder:text-[#777777] focus:border-[#ffa313]";

const labelClasses = "mb-[10px] text-[14px] font-normal leading-none text-[#666666]";

const BackButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="flex h-[40px] w-[40px] items-center justify-center rounded-[8px] border border-[#cfcfcf] bg-white hover:bg-[#fff7e8]"
    aria-label="Back"
  >
    <img src="/images/admin-go-back.svg" alt="" className="h-4 w-4" />
  </button>
);

const AdminFooter = () => (
  <div className="mt-6 rounded-[8px] bg-white py-[21px] text-center text-[15px] font-normal leading-none text-[#666666]">
    Support <span className="mx-[13px]">•</span> Privacy <span className="mx-[13px]">•</span> Terms
  </div>
);

const ActionIcon = ({ src, label }: { src: string; label: string }) => (
  <img src={src} alt={label} className="h-[19px] w-[19px] object-contain" />
);

function DetailCard({ mentor, onDownload }: { mentor: Mentor; onDownload: (mentor: Mentor) => void }) {
  return (
    <div className="grid grid-cols-1 gap-[10px] xl:grid-cols-[1fr_410px]">
      <div className="min-h-[569px] rounded-[8px] border border-[#d6d6d6] bg-white px-[24px] py-[24px]">
        <div className="mb-[28px] flex gap-[26px] border-b border-[#dddddd] pb-[24px]">
          <div className="relative h-[84px] w-[84px] overflow-hidden rounded-full">
            <Image src={mentor.avatar} alt={mentor.name} fill className="object-cover" />
          </div>
          <div className="flex-1">
            <p className="text-[21px] font-normal leading-none text-[#111111]">{mentor.name}</p>
            <div className="mt-[15px] flex items-start gap-[8px] text-[15px] leading-[20px] text-[#666666]">
              <img src="/images/admin-mentor-icon-45.svg" alt="" className="mt-[2px] h-4 w-4" />
              <div>
                <p>Rating:</p>
                <p>{mentor.rating}/5.0</p>
                <span className={`mt-[3px] inline-flex rounded-full px-[10px] py-[5px] text-[12px] font-normal leading-none ${mentor.status === "Active" ? "bg-[#dcfce7] text-[#008236]" : "bg-[#f4f4f4] text-[#111111]"}`}>
                  {mentor.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-[80px] gap-y-[29px] text-[15px] text-[#111111] md:grid-cols-2">
          <div className="space-y-1">
            <p className="text-[#666666]">Email</p>
            <p className="flex items-center gap-[9px]"><img src="/images/admin-user-icon-43.svg" alt="" className="h-4 w-4" />{mentor.email}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[#666666]">Phone</p>
            <p className="flex items-center gap-2">
              <span className="text-[#F4A11D]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.37 1.77.72 2.59a2 2 0 0 1-.45 2.11L8 9a16 16 0 0 0 6 6l.58-.38a2 2 0 0 1 2.11-.45 11.3 11.3 0 0 0 2.59.72A2 2 0 0 1 22 16.92z" />
                </svg>
              </span>
              {mentor.phone}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[#666666]">Join Date</p>
            <p>{mentor.joinDate}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[#666666]">Experience</p>
            <p>{mentor.experience}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[#666666]">Expertise</p>
            <p>{mentor.expertise}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[#666666]">Address</p>
            <p className="flex items-start gap-2">
              <span className="mt-0.5 text-[#F4A11D]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </span>
              {mentor.address}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-[25px]">
        <div className="min-h-[288px] rounded-[8px] border border-[#d6d6d6] bg-white px-[24px] py-[27px]">
          <p className="mb-[24px] text-[16px] font-normal text-[#111111]">Statistics</p>
          <div className="space-y-[26px]">
            <div className="text-[15px] text-[#666666]">
              <p>Total Sessions</p>
              <p className="mt-[7px] text-[23px] leading-none text-[#ffa313]">{mentor.stats.totalSessions}</p>
            </div>
            <div className="text-[15px] text-[#666666]">
              <p>Students Assigned</p>
              <p className="mt-[7px] text-[23px] leading-none text-[#ffa313]">{mentor.stats.studentsAssigned}</p>
            </div>
            <div className="text-[15px] text-[#666666]">
              <p>Avg Sessions/Month</p>
              <p className="mt-[7px] text-[23px] leading-none text-[#ffa313]">{mentor.stats.avgPerMonth}</p>
            </div>
          </div>
        </div>

        <div className="min-h-[257px] rounded-[8px] border border-[#d6d6d6] bg-white px-[24px] py-[27px]">
          <p className="mb-[29px] text-[16px] font-normal text-[#111111]">Quick Actions</p>
          <div className="space-y-[25px]">
            {mentor.quickActions.map((action) => (
              <button
                key={action}
                onClick={() => action === "Download Report" ? onDownload(mentor) : undefined}
                className="block w-full text-left text-[15px] font-normal leading-none text-[#ffa313] hover:underline"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  status: MentorStatus;
  expertise: string;
  experience: string;
  address: string;
}

const emptyForm: FormState = {
  name: "",
  email: "",
  phone: "",
  status: "Active",
  expertise: "",
  experience: "",
  address: "",
};

export default function Mentormanagement() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All Status" | MentorStatus>("All Status");
  const [view, setView] = useState<ViewMode>("list");
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [formState, setFormState] = useState<FormState>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Mentor | null>(null);

  const refresh = async (): Promise<Mentor[]> => {
    setLoading(true);
    try {
      const data = (await listMentors()) as Mentor[];
      setMentors(data);
      return data;
    } catch (e) {
      setNotice({ type: "error", msg: (e as Error).message });
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const filteredMentors = useMemo(() => {
    return mentors.filter((mentor) => {
      const matchesName = mentor.name.toLowerCase().includes(searchTerm.toLowerCase().trim());
      const matchesStatus = statusFilter === "All Status" ? true : mentor.status === statusFilter;
      return matchesName && matchesStatus;
    });
  }, [mentors, searchTerm, statusFilter]);

  const escapePdfText = (text: string) =>
    text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

  const makePdfBlob = (title: string, rows: { label: string; value: string }[]) => {
    const content: string[] = [];
    content.push("BT");
    content.push("/F2 18 Tf");
    content.push("72 740 Td");
    content.push(`(${escapePdfText(title)}) Tj`);
    content.push("/F1 11 Tf");
    content.push("0 -22 Td");
    content.push(`(Generated: ${escapePdfText(new Date().toLocaleString())}) Tj`);
    content.push("0 -20 Td");
    content.push("0.8 0.8 0.8 RG");
    content.push("0 0 0 rg");
    content.push("ET");

    const rowLines: string[] = [];
    rows.forEach((r, idx) => {
      rowLines.push("BT");
      rowLines.push("/F3 11 Tf");
      rowLines.push(`72 ${680 - idx * 18} Td`);
      rowLines.push(`(${escapePdfText(r.label)}:) Tj`);
      rowLines.push("/F1 11 Tf");
      rowLines.push("120 0 Td");
      rowLines.push(`(${escapePdfText(r.value)}) Tj`);
      rowLines.push("ET");
    });

    const stream = [...content, ...rowLines].join("\n");

    const objs: string[] = [];
    objs.push("1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n");
    objs.push("2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n");
    objs.push(
      "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R /F3 7 0 R >> >> >> endobj\n"
    );
    objs.push(`4 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream\nendobj\n`);
    objs.push("5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n");
    objs.push("6 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj\n");
    objs.push("7 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique >> endobj\n");

    let pdf = "%PDF-1.4\n";
    const offsets = [0];
    objs.forEach((obj) => {
      offsets.push(pdf.length);
      pdf += obj;
    });
    const xref = pdf.length;
    pdf += "xref\n0 8\n";
    pdf += "0000000000 65535 f \n";
    offsets.slice(1).forEach((o) => (pdf += `${o.toString().padStart(10, "0")} 00000 n \n`));
    pdf += "trailer << /Size 8 /Root 1 0 R >>\nstartxref\n";
    pdf += `${xref}\n%%EOF`;

    return new Blob([pdf], { type: "application/pdf" });
  };

  const downloadReport = (mentor: Mentor) => {
    const blob = makePdfBlob("Mentor Report", [
      { label: "Name", value: mentor.name },
      { label: "Email", value: mentor.email },
      { label: "Phone", value: mentor.phone },
      { label: "Expertise", value: mentor.expertise },
      { label: "Status", value: mentor.status },
      { label: "Sessions", value: mentor.sessions.toString() },
      { label: "Students", value: mentor.students.toString() },
      { label: "Rating", value: mentor.rating.toString() },
      { label: "Address", value: mentor.address },
    ]);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${mentor.name.replace(/\s+/g, "_")}_report.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const resetToList = () => {
    setView("list");
    setSelectedMentor(null);
    setFormState(emptyForm);
  };

  const handleAdd = () => {
    setView("add");
    setFormState(emptyForm);
    setSelectedMentor(null);
  };

  const handleSaveNew = async () => {
    if (!formState.name.trim()) return;
    setSubmitting(true);
    const res = await createMentor(formState);
    setSubmitting(false);
    if (res.error) {
      setNotice({ type: "error", msg: res.error });
      return;
    }
    setNotice({
      type: "success",
      msg: res.tempPassword
        ? `Mentor created. Temporary password: ${res.tempPassword} — share it securely; they should change it on first login.`
        : "Mentor created.",
    });
    const list = await refresh();
    const created = res.id ? list.find((m) => m.id === res.id) ?? null : null;
    if (created) {
      setSelectedMentor(created);
      setView("detail");
    } else {
      resetToList();
    }
  };

  const handleEdit = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setFormState({
      name: mentor.name,
      email: mentor.email,
      phone: mentor.phone,
      status: mentor.status,
      expertise: mentor.expertise,
      experience: mentor.experience,
      address: mentor.address,
    });
    setView("edit");
  };

  const handleSaveEdit = async () => {
    if (!selectedMentor) return;
    setSubmitting(true);
    const res = await updateMentor(selectedMentor.id, formState);
    setSubmitting(false);
    if (res.error) {
      setNotice({ type: "error", msg: res.error });
      return;
    }
    setNotice({ type: "success", msg: "Mentor updated." });
    const list = await refresh();
    const updated = list.find((m) => m.id === selectedMentor.id) ?? null;
    setSelectedMentor(updated);
    setView(updated ? "detail" : "list");
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    const res = await deleteMentor(deleteTarget.id);
    setSubmitting(false);
    if (res.error) {
      setNotice({ type: "error", msg: res.error });
      setDeleteTarget(null);
      return;
    }
    setNotice({ type: "success", msg: "Mentor deleted." });
    const wasSelected = selectedMentor?.id === deleteTarget.id;
    setDeleteTarget(null);
    await refresh();
    if (wasSelected) resetToList();
  };

  const totalMentors = mentors.length;

  const renderHeader = (title: string, actionButton?: React.ReactNode) => (
    <div className="mb-[24px] flex items-center justify-between">
      <div className="flex items-center gap-[10px] text-[21px] font-semibold leading-none text-[#111111]">
        <BackButton onClick={resetToList} />
        {title}
      </div>
      {actionButton}
    </div>
  );

  const renderForm = (mode: "add" | "edit") => (
    <div>
      {renderHeader(mode === "add" ? "Add New Mentor" : "Edit Mentor")}
      <div className="rounded-[8px] border border-[#d6d6d6] bg-white px-[24px] py-[24px]">
        <div className="grid grid-cols-1 gap-x-[30px] gap-y-[22px] md:grid-cols-2">
          <div>
            <p className={labelClasses}>Full Name *</p>
            <input
              className={inputClasses}
              value={formState.name}
              onChange={(e) => setFormState((s) => ({ ...s, name: e.target.value }))}
              placeholder="Enter mentor name"
            />
          </div>
          <div>
            <p className={labelClasses}>Email *</p>
            <input
              className={inputClasses}
              value={formState.email}
              onChange={(e) => setFormState((s) => ({ ...s, email: e.target.value }))}
              placeholder="mentor@email.com"
            />
          </div>
          <div>
            <p className={labelClasses}>Phone *</p>
            <input
              className={inputClasses}
              value={formState.phone}
              onChange={(e) => setFormState((s) => ({ ...s, phone: e.target.value }))}
              placeholder="+1 234-567-8900"
            />
          </div>
          <div>
            <p className={labelClasses}>Status *</p>
            <select
              className={`${inputClasses} appearance-none pr-8`}
              value={formState.status}
              onChange={(e) => setFormState((s) => ({ ...s, status: e.target.value as MentorStatus }))}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div>
            <p className={labelClasses}>Expertise *</p>
            <input
              className={inputClasses}
              value={formState.expertise}
              onChange={(e) => setFormState((s) => ({ ...s, expertise: e.target.value }))}
              placeholder="e.g., Python, Data Science"
            />
          </div>
          <div>
            <p className={labelClasses}>Experience</p>
            <input
              className={inputClasses}
              value={formState.experience}
              onChange={(e) => setFormState((s) => ({ ...s, experience: e.target.value }))}
              placeholder="e.g., 8 years"
            />
          </div>
          <div className="md:col-span-2">
            <p className={labelClasses}>Address</p>
            <input
              className={inputClasses}
              value={formState.address}
              onChange={(e) => setFormState((s) => ({ ...s, address: e.target.value }))}
              placeholder="Enter full address"
            />
          </div>
        </div>
        <div className="mt-[24px] flex items-center gap-[16px] border-t border-[#dddddd] pt-[24px]">
          <button
            onClick={mode === "add" ? handleSaveNew : handleSaveEdit}
            disabled={submitting}
            className="h-[42px] rounded-[8px] bg-[#ffa313] px-[19px] text-[16px] font-normal text-white hover:bg-[#f29a0b] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "Saving..." : mode === "add" ? "Add Mentor" : "Save Changes"}
          </button>
          <button
            onClick={resetToList}
            className="h-[42px] rounded-[8px] border border-[#dddddd] px-[22px] text-[16px] font-normal text-[#666666] hover:bg-[#f7f7f7]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-full bg-[#f4f4f4] px-6 py-6 font-[Poppins]">
      {notice && (
        <div
          className={`mb-4 flex items-start justify-between gap-4 rounded-[8px] border px-4 py-3 text-[14px] font-semibold ${
            notice.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          <span className="break-all">{notice.msg}</span>
          <button type="button" onClick={() => setNotice(null)} className="shrink-0 text-[13px] underline">
            Dismiss
          </button>
        </div>
      )}
      {view === "list" && (
        <>
        <div className="mb-[24px] flex items-center justify-between">
            <div className="flex items-center gap-[12px]">
              <div className="flex h-[48px] w-[48px] items-center justify-center rounded-[8px] bg-[#fff7e8]">
                <img src="/images/admin-mentor-icon-45.svg" alt="" className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-[21px] font-semibold leading-none text-[#111111]">Mentors Management</h1>
                <p className="mt-[7px] text-[15px] leading-none text-[#666666]">{totalMentors} total mentors</p>
              </div>
            </div>
            <button
              onClick={handleAdd}
              className="flex h-[40px] items-center gap-[9px] rounded-[8px] bg-[#ffa313] px-[20px] text-[16px] font-normal text-white hover:bg-[#f29a0b]"
            >
              <Plus size={17} strokeWidth={2.4} /> Add Mentor
            </button>
          </div>

          <div className="flex flex-col gap-[16px] rounded-t-[8px] border border-b-0 border-[#d6d6d6] bg-white px-[24px] py-[25px] sm:flex-row sm:items-center">
            <div className="flex h-[48px] flex-1 items-center rounded-[8px] border border-[#d6d6d6] bg-white px-[16px]">
              <Search size={19} className="text-[#666666]" />
              <input
                className="h-full flex-1 pl-[17px] text-[16px] text-[#666666] outline-none placeholder:text-[#777777]"
                placeholder="Search mentors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="relative w-full sm:w-[150px]">
              <select
                className="h-[48px] w-full appearance-none rounded-[8px] border border-[#d6d6d6] bg-white pl-[15px] pr-8 text-[16px] text-[#666666] outline-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "All Status" | MentorStatus)}
              >
                <option>All Status</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            </div>
          </div>

          <div className="min-h-[944px] overflow-x-auto rounded-b-[8px] border border-[#d6d6d6] bg-white">
              <table className="min-w-full bg-white text-left text-[15px]">
                <thead className="bg-[#f4f4f4] text-[15px] font-normal text-[#666666]">
                  <tr>
                    {["Name", "Email", "Expertise", "Sessions", "Students", "Rating", "Status", "Actions"].map(
                      (h) => (
                        <th
                          key={h}
                          className={`px-[24px] py-[15px] font-normal ${
                            ["Sessions", "Students", "Rating", "Status", "Actions"].includes(h)
                              ? "text-center"
                              : "text-left"
                          }`}
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dddddd]">
                  {loading && (
                    <tr>
                      <td colSpan={8} className="px-[24px] py-[40px] text-center text-[#777777]">
                        Loading mentors...
                      </td>
                    </tr>
                  )}
                  {!loading && filteredMentors.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-[24px] py-[40px] text-center text-[#777777]">
                        No mentors found.
                      </td>
                    </tr>
                  )}
                  {!loading && filteredMentors.map((mentor) => (
                    <tr key={mentor.id} className="h-[73px] align-middle text-[#111111]">
                      <td className="px-[24px] py-[15px] font-normal">
                        {mentor.name}
                      </td>
                      <td className="px-[24px] py-[15px] text-[#666666]">{mentor.email}</td>
                      <td className="px-[24px] py-[15px] text-[#666666]">{mentor.expertise}</td>
                      <td className="px-[24px] py-[15px] text-center text-[#666666]">{mentor.sessions}</td>
                      <td className="px-[24px] py-[15px] text-center text-[#666666]">{mentor.students}</td>
                      <td className="px-[24px] py-[15px]">
                        <span className="flex items-center justify-center gap-[6px] text-[#666666]">
                          <img src="/images/admin-mentor-icon-45.svg" alt="" className="h-4 w-4" />
                          {mentor.rating}
                        </span>
                      </td>
                      <td className="px-[24px] py-[15px] text-center">{badge(mentor.status)}</td>
                      <td className="px-[24px] py-[15px]">
                        <div className="flex items-center justify-center gap-[16px]">
                          <button
                            onClick={() => {
                              setSelectedMentor(mentor);
                              setView("detail");
                            }}
                            aria-label="View"
                            className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-[#fff7e8]"
                          >
                            <ActionIcon src="/images/admin-icon-22.svg" label="View" />
                          </button>
                          <button
                            onClick={() => handleEdit(mentor)}
                            aria-label="Edit"
                            className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-[#fff7e8]"
                          >
                            <ActionIcon src="/images/admin-user-icon-42.svg" label="Edit" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(mentor)}
                            aria-label="Delete"
                            className="flex h-9 w-9 items-center justify-center rounded-full text-[#e7000b] transition hover:bg-red-50 hover:text-[#bf0008]"
                          >
                            <Trash2 size={20} strokeWidth={2.1} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          </div>
          <AdminFooter />
        </>
      )}

      {view === "detail" && selectedMentor && (
        <div>
            {renderHeader(
              "Mentor Details",
              (
                <button
                  onClick={() => handleEdit(selectedMentor)}
                  className="flex h-[40px] items-center gap-[9px] rounded-[8px] bg-[#ffa313] px-[20px] text-[16px] font-normal text-white hover:bg-[#f29a0b]"
                >
                  <img src="/images/admin-user-icon-44.svg" alt="" className="h-4 w-4" />
                  Edit Mentor
                </button>
              )
            )}
              <DetailCard mentor={selectedMentor} onDownload={downloadReport} />
        </div>
      )}

      {view === "add" && renderForm("add")}
      {view === "edit" && renderForm("edit")}

      {deleteTarget && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-[360px] p-6 shadow-lg text-[#2E2E2E]">
            <p className="text-[17px] font-semibold mb-3">Confirm Delete</p>
            <p className="text-[14px] text-[#4B5563] mb-5 leading-relaxed">
              Are you sure you want to delete the mentor {deleteTarget.name}?
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={confirmDelete}
                className="flex-1 h-10 rounded-lg bg-[#D80808] text-white font-semibold text-[14px] hover:bg-[#c40707]"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 h-10 rounded-lg border border-[#E5E7EB] text-[14px] font-semibold text-[#6B7280] hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
