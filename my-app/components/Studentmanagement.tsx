"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ChevronDown, Eye, Mail, MapPin, Pencil, Phone, Plus, Search, Trash2 } from "lucide-react";
import {
  listStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from "@/lib/data/students";

type StudentStatus = "Active" | "Inactive";

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  mentor: string;
  course: string;
  status: StudentStatus;
  avatar: string;
  enrollmentDate: string;
  performance: { attendance: number; grade: string };
  quickActions: string[];
  address: string;
}

type ViewMode = "list" | "detail" | "add" | "edit";

type Notice = { type: "success" | "error"; msg: string };

interface FormState {
  name: string;
  email: string;
  phone: string;
  status: StudentStatus;
  mentor: string;
  course: string;
  address: string;
}

const emptyForm: FormState = {
  name: "",
  email: "",
  phone: "",
  status: "Active",
  mentor: "",
  course: "",
  address: "",
};

const ORANGE = "#F9A618";

const inputClass =
  "h-[42px] w-full rounded-[8px] border border-[#d9d9d9] bg-white px-[15px] text-[16px] font-normal text-[#111111] outline-none placeholder:text-[#8a8a8a] focus:border-[#F9A618] focus:ring-2 focus:ring-[#F9A618]/15";

const labelClass = "mb-[10px] block text-[14px] font-medium leading-none text-[#666666]";

const AdminFooter = () => (
  <div className="mt-6 rounded-[8px] bg-white py-[21px] text-center text-[15px] font-normal leading-none text-[#666666]">
    Support <span className="mx-[13px]">{"\u2022"}</span> Privacy <span className="mx-[13px]">{"\u2022"}</span> Terms
  </div>
);

const BackButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="flex h-[40px] w-[40px] items-center justify-center rounded-[8px] border border-[#cfcfcf] bg-white transition-colors hover:bg-[#fff7e8]"
    aria-label="Back"
  >
    <img src="/images/admin-student-go-back.svg" alt="" className="h-4 w-4" />
  </button>
);

const HeaderIcon = () => (
  <div className="flex h-[48px] w-[48px] items-center justify-center rounded-[8px] bg-[#fff7e8]">
    <img src="/images/admin-student-icon-46.svg" alt="" className="h-6 w-6" />
  </div>
);

const StatusBadge = ({ status }: { status: StudentStatus }) => (
  <span
    className={`inline-flex h-[25px] min-w-[56px] items-center justify-center rounded-full px-[13px] text-[13px] font-normal leading-none ${
      status === "Active" ? "bg-[#d9f8e6] text-[#009a3d]" : "bg-[#f1f1f1] text-[#111111]"
    }`}
  >
    {status}
  </span>
);

const ActionIcon = ({ children, onClick, label }: { children: React.ReactNode; onClick: () => void; label: string }) => (
  <button
    onClick={onClick}
    aria-label={label}
    className="flex h-7 w-7 items-center justify-center rounded-full text-[#F9A618] transition-colors hover:bg-[#fff7e8]"
  >
    {children}
  </button>
);

function StudentForm({
  title,
  mode,
  form,
  setForm,
  onBack,
  onSave,
  submitting,
  error,
}: {
  title: string;
  mode: "add" | "edit";
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  onBack: () => void;
  onSave: () => void;
  submitting?: boolean;
  error?: string;
}) {
  return (
    <div className="min-h-full bg-[#f4f4f4] px-6 py-6 font-[Poppins]">
      <div className="mb-[24px] flex items-center gap-[10px]">
        <BackButton onClick={onBack} />
        <h1 className="text-[24px] font-semibold leading-none text-[#111111]">{title}</h1>
      </div>

      <div className="rounded-[8px] border border-[#d6d6d6] bg-white px-[24px] py-[24px]">
        <div className="grid grid-cols-1 gap-x-[26px] gap-y-[25px] lg:grid-cols-2">
          <label>
            <span className={labelClass}>Full Name *</span>
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              placeholder={mode === "add" ? "Enter student name" : "Alex Martinez"}
            />
          </label>

          <label>
            <span className={labelClass}>Email *</span>
            <input
              className={inputClass}
              value={form.email}
              onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
              placeholder={mode === "add" ? "student@email.com" : "alex.m@email.com"}
            />
          </label>

          <label>
            <span className={labelClass}>Phone *</span>
            <input
              className={inputClass}
              value={form.phone}
              onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
              placeholder="+1 234-567-8900"
            />
          </label>

          <label>
            <span className={labelClass}>Status *</span>
            <select
              className={`${inputClass} appearance-none`}
              value={form.status}
              onChange={(e) => setForm((s) => ({ ...s, status: e.target.value as StudentStatus }))}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </label>

          <label>
            <span className={labelClass}>Assigned Mentor</span>
            <input
              className={inputClass}
              value={form.mentor}
              onChange={(e) => setForm((s) => ({ ...s, mentor: e.target.value }))}
              placeholder={mode === "add" ? "Select or enter mentor name" : "Dr. Sarah Johnson"}
            />
          </label>

          <label>
            <span className={labelClass}>Course</span>
            <input
              className={inputClass}
              value={form.course}
              onChange={(e) => setForm((s) => ({ ...s, course: e.target.value }))}
              placeholder={mode === "add" ? "Enter course name" : "Python Fundamentals"}
            />
          </label>

          <label className="lg:col-span-2">
            <span className={labelClass}>Address</span>
            <input
              className={inputClass}
              value={form.address}
              onChange={(e) => setForm((s) => ({ ...s, address: e.target.value }))}
              placeholder={mode === "add" ? "Enter full address" : "123 Main St, New York, NY"}
            />
          </label>
        </div>

        <div className="mt-[19px] border-t border-[#dedede] pt-[24px]">
          {error && <p className="mb-3 text-[14px] font-medium text-red-600">{error}</p>}
          <div className="flex flex-wrap items-center gap-[16px]">
            <button
              onClick={onSave}
              disabled={submitting}
              className="h-[43px] rounded-[8px] bg-[#F9A618] px-[28px] text-[16px] font-medium text-white transition-colors hover:bg-[#f0a014] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "Saving..." : mode === "add" ? "Add Student" : "Save Changes"}
            </button>
            <button
              onClick={onBack}
              className="h-[43px] rounded-[8px] border border-[#d6d6d6] bg-white px-[26px] text-[16px] font-medium text-[#666666] transition-colors hover:bg-[#f7f7f7]"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StudentDetails({
  student,
  onBack,
  onEdit,
  onDownload,
}: {
  student: Student;
  onBack: () => void;
  onEdit: () => void;
  onDownload: () => void;
}) {
  return (
    <div className="min-h-full bg-[#f4f4f4] px-6 py-6 font-[Poppins]">
      <div className="mb-[24px] flex items-center justify-between">
        <div className="flex items-center gap-[10px]">
          <BackButton onClick={onBack} />
          <h1 className="text-[24px] font-semibold leading-none text-[#111111]">Student Details</h1>
        </div>
        <button
          onClick={onEdit}
          className="flex h-[40px] items-center gap-[9px] rounded-[8px] bg-[#F9A618] px-[18px] text-[16px] font-medium text-white transition-colors hover:bg-[#f0a014]"
        >
          <img src="/images/admin-user-icon-44.svg" alt="" className="h-4 w-4" />
          Edit Student
        </button>
      </div>

      <div className="grid grid-cols-1 gap-[24px] xl:grid-cols-[1fr_363px]">
        <section className="min-h-[433px] rounded-[8px] border border-[#d6d6d6] bg-white px-[24px] py-[24px]">
          <div className="flex items-start gap-[26px] pb-[24px]">
            <div className="relative h-[96px] w-[96px] overflow-hidden rounded-full bg-[#eeeeee]">
              <Image src={student.avatar} alt={student.name} fill className="object-cover" />
            </div>
            <div className="pt-[5px]">
              <h2 className="text-[22px] font-normal leading-none text-[#111111]">{student.name}</h2>
              <div className="mt-[18px]">
                <StatusBadge status={student.status} />
              </div>
            </div>
          </div>

          <div className="border-t border-[#d9d9d9] pt-[27px]">
            <div className="grid grid-cols-1 gap-x-[88px] gap-y-[25px] md:grid-cols-2">
              <InfoBlock icon={<Mail size={15} />} label="Email" value={student.email} />
              <InfoBlock icon={<Phone size={15} />} label="Phone" value={student.phone} />
              <InfoBlock label="Enrollment Date" value={student.enrollmentDate} />
              <InfoBlock label="Current Mentor" value={student.mentor} />
              <InfoBlock label="Course" value={student.course} />
              <InfoBlock icon={<MapPin size={15} />} label="Address" value={student.address} />
            </div>
          </div>
        </section>

        <aside className="space-y-[24px]">
          <div className="rounded-[8px] border border-[#d6d6d6] bg-white px-[24px] py-[24px]">
            <h2 className="mb-[25px] text-[18px] font-normal leading-none text-[#111111]">Performance</h2>
            <div className="mb-[20px]">
              <div className="mb-[6px] flex items-start justify-between text-[16px] font-normal text-[#666666]">
                <span>Attendance</span>
                <span className="text-[16px] text-[#111111]">{student.performance.attendance}</span>
              </div>
              <div className="h-[7px] overflow-hidden rounded-full bg-[#e5e5e5]">
                <div className="h-full rounded-full bg-[#F9A618]" style={{ width: `${student.performance.attendance}%` }} />
              </div>
            </div>
            <div>
              <p className="mb-[10px] text-[16px] font-normal leading-none text-[#666666]">Current Grade</p>
              <p className="text-[25px] font-normal leading-none text-[#F9A618]">{student.performance.grade}</p>
            </div>
          </div>

          <div className="rounded-[8px] border border-[#d6d6d6] bg-white px-[24px] py-[24px]">
            <h2 className="mb-[25px] text-[18px] font-normal leading-none text-[#111111]">Quick Actions</h2>
            <div className="flex flex-col items-start gap-[27px] pl-[17px]">
              {student.quickActions.map((action) => (
                <button
                  key={action}
                  onClick={() => (action === "Download Report" ? onDownload() : undefined)}
                  className="text-[16px] font-normal leading-none text-[#F9A618] transition-colors hover:text-[#d98a00]"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function InfoBlock({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <p className="mb-[9px] text-[15px] font-normal leading-none text-[#777777]">{label}</p>
      <p className="flex items-center gap-[8px] text-[16px] font-normal leading-none text-[#111111]">
        {icon && <span className="text-[#F9A618]">{icon}</span>}
        {value}
      </p>
    </div>
  );
}

export default function Studentmanagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [formError, setFormError] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"All Status" | StudentStatus>("All Status");
  const [view, setView] = useState<ViewMode>("list");
  const [selected, setSelected] = useState<Student | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);

  const refresh = async (): Promise<Student[]> => {
    setLoading(true);
    try {
      const data = (await listStudents()) as Student[];
      setStudents(data);
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

  const filtered = useMemo(
    () =>
      students.filter((s) => {
        const matchesName = s.name.toLowerCase().includes(search.toLowerCase().trim());
        const matchesStatus = filterStatus === "All Status" ? true : s.status === filterStatus;
        return matchesName && matchesStatus;
      }),
    [students, search, filterStatus]
  );

  const escapePdfText = (text: string) => text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

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

  const downloadReport = (student: Student) => {
    const blob = makePdfBlob("Student Report", [
      { label: "Name", value: student.name },
      { label: "Email", value: student.email },
      { label: "Mentor", value: student.mentor },
      { label: "Course", value: student.course },
      { label: "Status", value: student.status },
      { label: "Attendance", value: `${student.performance.attendance}%` },
      { label: "Grade", value: student.performance.grade },
      { label: "Address", value: student.address },
    ]);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${student.name.replace(/\s+/g, "_")}_report.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const resetList = () => {
    setView("list");
    setSelected(null);
    setForm(emptyForm);
    setFormError("");
  };

  const handleAdd = () => {
    setForm(emptyForm);
    setView("add");
  };

  const saveNew = async () => {
    if (!form.name.trim()) return;
    setFormError("");
    setSubmitting(true);
    const res = await createStudent(form);
    setSubmitting(false);
    if (res.error) {
      setFormError(res.error);
      return;
    }
    const parts = [
      res.tempPassword
        ? `Student created. Temporary password: ${res.tempPassword} — share it securely.`
        : "Student created.",
    ];
    if (res.mentorUnmatched)
      parts.push(`Mentor "${form.mentor}" was not found, so the student is unassigned.`);
    setNotice({ type: "success", msg: parts.join(" ") });
    const list = await refresh();
    const created = res.id ? list.find((s) => s.id === res.id) ?? null : null;
    if (created) {
      setSelected(created);
      setView("detail");
    } else {
      resetList();
    }
  };

  const handleEdit = (s: Student) => {
    setSelected(s);
    setForm({
      name: s.name,
      email: s.email,
      phone: s.phone,
      status: s.status,
      mentor: s.mentor,
      course: s.course,
      address: s.address,
    });
    setView("edit");
  };

  const saveEdit = async () => {
    if (!selected) return;
    setFormError("");
    setSubmitting(true);
    const res = await updateStudent(selected.id, form);
    setSubmitting(false);
    if (res.error) {
      setFormError(res.error);
      return;
    }
    setNotice({
      type: "success",
      msg: res.mentorUnmatched
        ? `Student updated. Mentor "${form.mentor}" was not found, so the student is unassigned.`
        : "Student updated.",
    });
    const list = await refresh();
    const updated = list.find((s) => s.id === selected.id) ?? null;
    setSelected(updated);
    setView(updated ? "detail" : "list");
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    const res = await deleteStudent(deleteTarget.id);
    setSubmitting(false);
    if (res.error) {
      setNotice({ type: "error", msg: res.error });
      setDeleteTarget(null);
      return;
    }
    setNotice({ type: "success", msg: "Student deleted." });
    const wasSelected = selected?.id === deleteTarget.id;
    setDeleteTarget(null);
    await refresh();
    if (wasSelected) resetList();
  };

  if (view === "add") {
    return <StudentForm title="Add New Student" mode="add" form={form} setForm={setForm} onBack={resetList} onSave={saveNew} submitting={submitting} error={formError} />;
  }

  if (view === "edit") {
    return <StudentForm title="Edit Student" mode="edit" form={form} setForm={setForm} onBack={resetList} onSave={saveEdit} submitting={submitting} error={formError} />;
  }

  if (view === "detail" && selected) {
    return (
      <StudentDetails
        student={selected}
        onBack={resetList}
        onEdit={() => handleEdit(selected)}
        onDownload={() => downloadReport(selected)}
      />
    );
  }

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
      <div className="mb-[24px] flex items-center justify-between gap-4">
        <div className="flex items-center gap-[12px]">
          <HeaderIcon />
          <div>
            <h1 className="text-[24px] font-semibold leading-none text-[#111111]">Students Management</h1>
            <p className="mt-[7px] text-[16px] font-normal leading-none text-[#666666]">{students.length} total students</p>
          </div>
        </div>
        <button
          onClick={handleAdd}
          className="flex h-[41px] items-center gap-[9px] rounded-[8px] bg-[#F9A618] px-[20px] text-[16px] font-medium text-white transition-colors hover:bg-[#f0a014]"
        >
          <Plus size={18} strokeWidth={2} />
          Add Student
        </button>
      </div>

      <div className="rounded-t-[8px] border border-b-0 border-[#d6d6d6] bg-white px-[24px] py-[25px]">
        <div className="flex flex-col gap-[16px] lg:flex-row lg:items-center">
          <div className="flex h-[48px] flex-1 items-center rounded-[8px] border border-[#d6d6d6] bg-white px-[16px]">
            <Search size={21} className="mr-[15px] text-[#666666]" strokeWidth={2} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Student..."
              className="h-full flex-1 bg-transparent text-[18px] font-normal text-[#111111] outline-none placeholder:text-[#777777]"
            />
          </div>

          <div className="relative h-[48px] w-full lg:w-[149px]">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as "All Status" | StudentStatus)}
              className="h-full w-full appearance-none rounded-[8px] border border-[#d6d6d6] bg-white px-[14px] pr-[38px] text-[17px] font-normal text-[#666666] outline-none"
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
            <ChevronDown size={20} className="pointer-events-none absolute right-[13px] top-1/2 -translate-y-1/2 text-[#666666]" />
          </div>
        </div>
      </div>

      <div className="min-h-[944px] overflow-x-auto rounded-b-[8px] border border-[#d6d6d6] bg-white">
        <table className="min-w-[1060px] w-full text-left">
          <thead className="bg-[#f2f2f2] text-[16px] font-normal leading-none text-[#666666]">
            <tr>
              <th className="px-[24px] py-[18px] font-normal">Name</th>
              <th className="px-[24px] py-[18px] font-normal">Email</th>
              <th className="px-[24px] py-[18px] font-normal">Phone</th>
              <th className="px-[24px] py-[18px] font-normal">Mentor</th>
              <th className="px-[24px] py-[18px] font-normal">Course</th>
              <th className="px-[24px] py-[18px] font-normal">Status</th>
              <th className="px-[24px] py-[18px] text-center font-normal">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="px-[24px] py-[40px] text-center text-[#777777]">
                  Loading students...
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-[24px] py-[40px] text-center text-[#777777]">
                  No students found.
                </td>
              </tr>
            )}
            {!loading && filtered.map((s) => (
              <tr key={s.id} className="border-b border-[#e5e5e5] text-[16px] font-normal leading-none text-[#666666] last:border-b-0">
                <td className="px-[24px] py-[24px] text-[#111111]">{s.name}</td>
                <td className="px-[24px] py-[24px]">{s.email}</td>
                <td className="px-[24px] py-[24px]">{s.phone}</td>
                <td className="px-[24px] py-[24px]">{s.mentor}</td>
                <td className="px-[24px] py-[24px]">{s.course}</td>
                <td className="px-[24px] py-[24px]">
                  <StatusBadge status={s.status} />
                </td>
                <td className="px-[24px] py-[21px]">
                  <div className="flex items-center justify-center gap-[14px]">
                    <ActionIcon label="View" onClick={() => { setSelected(s); setView("detail"); }}>
                      <Eye size={16} strokeWidth={2} />
                    </ActionIcon>
                    <ActionIcon label="Edit" onClick={() => handleEdit(s)}>
                      <img src="/images/admin-user-icon-42.svg" alt="" className="h-4 w-4" />
                    </ActionIcon>
                    <button
                      onClick={() => setDeleteTarget(s)}
                      aria-label="Delete"
                      className="flex h-7 w-7 items-center justify-center rounded-full text-[#ff0000] transition-colors hover:bg-[#fff1f1]"
                    >
                      <Trash2 size={16} strokeWidth={2} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminFooter />

      {deleteTarget && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-[390px] rounded-[10px] bg-white p-6 shadow-xl">
            <h2 className="text-[20px] font-semibold text-[#111111]">Confirm Delete</h2>
            <p className="mt-3 text-[15px] leading-6 text-[#666666]">
              Are you sure you want to delete the student {deleteTarget.name}?
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={confirmDelete}
                className="h-[42px] flex-1 rounded-[8px] bg-[#ff0000] text-[15px] font-semibold text-white hover:bg-[#dc0000]"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteTarget(null)}
                className="h-[42px] flex-1 rounded-[8px] border border-[#d6d6d6] bg-white text-[15px] font-semibold text-[#666666] hover:bg-[#f7f7f7]"
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
