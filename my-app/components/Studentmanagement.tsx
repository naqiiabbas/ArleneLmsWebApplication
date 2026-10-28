"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { chatLink } from "@/components/useChatDeepLink";
import { ChevronDown, Eye, IdCard, KeyRound, Mail, MapPin, Phone, Plus, Search, Trash2 } from "lucide-react";
import {
  listStudents,
  listMentorOptions,
  listClassOptions,
  createStudent,
  updateStudent,
  deleteStudent,
} from "@/lib/data/students";
import type { ClassOption, MentorOption, UIStudent } from "@/lib/data/students.types";

type StudentStatus = "Active" | "Inactive";

type Student = UIStudent;

type ViewMode = "list" | "detail" | "add" | "edit";

type Notice = { type: "success" | "error"; msg: string };

interface FormState {
  name: string;
  email: string;
  phone: string;
  status: StudentStatus;
  mentorId: string;
  classId: string;
  course: string;
  address: string;
}

const emptyForm: FormState = {
  name: "",
  email: "",
  phone: "",
  status: "Active",
  mentorId: "",
  classId: "",
  course: "",
  address: "",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Mirrors the fields marked * in the form (the server re-checks the same rules).
function validateForm(f: FormState): string | null {
  if (!f.name.trim()) return "Full name is required.";
  if (!f.email.trim()) return "Email is required.";
  if (!EMAIL_RE.test(f.email.trim())) return "Enter a valid email address.";
  if (!f.phone.trim()) return "Phone is required.";
  return null;
}

const inputClass =
  "h-[42px] w-full rounded-[8px] border border-[#d9d9d9] bg-white px-[15px] text-[16px] font-normal text-[#111111] outline-none placeholder:text-[#8a8a8a] focus:border-[#F9A618] focus:ring-2 focus:ring-[#F9A618]/15";

const labelClass = "mb-[10px] block text-[14px] font-medium leading-none text-[#666666]";

const AdminFooter = () => (
  <div className="mt-6 rounded-[8px] bg-white py-[21px] text-center text-[15px] font-normal leading-none text-[#666666]">
    Support <span className="mx-[13px]">{"•"}</span> Privacy <span className="mx-[13px]">{"•"}</span> Terms
  </div>
);

const BackButton = ({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="flex h-[40px] w-[40px] items-center justify-center rounded-[8px] border border-[#cfcfcf] bg-white transition-colors hover:bg-[#fff7e8] disabled:cursor-not-allowed disabled:opacity-60"
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
    type="button"
    onClick={onClick}
    aria-label={label}
    className="flex h-7 w-7 items-center justify-center rounded-full text-[#F9A618] transition-colors hover:bg-[#fff7e8]"
  >
    {children}
  </button>
);

// Rendered on every view. Previously it only existed on the list, so the
// success message after "Add Student" — which carries the ONLY copy of the new
// student's temporary password — was invisible on the detail screen it opens.
const NoticeBar = ({ notice, onDismiss }: { notice: Notice | null; onDismiss: () => void }) => {
  const [copied, setCopied] = useState(false);
  if (!notice) return null;
  const password = /Temporary password: (\S+)/.exec(notice.msg)?.[1];
  return (
    <div
      className={`mb-4 flex items-start justify-between gap-4 rounded-[8px] border px-4 py-3 text-[14px] font-semibold ${
        notice.type === "success"
          ? "border-green-200 bg-green-50 text-green-700"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      <span className="break-words">{notice.msg}</span>
      <div className="flex shrink-0 items-center gap-3">
        {password && (
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(password);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              } catch {
                /* clipboard blocked — the password is still shown inline */
              }
            }}
            className="text-[13px] underline"
          >
            {copied ? "Copied" : "Copy password"}
          </button>
        )}
        <button type="button" onClick={onDismiss} className="text-[13px] underline">
          Dismiss
        </button>
      </div>
    </div>
  );
};

function StudentForm({
  title,
  mode,
  form,
  setForm,
  mentors,
  classes,
  mentorsLoading,
  onBack,
  onSave,
  submitting,
  error,
  notice,
  onDismissNotice,
}: {
  title: string;
  mode: "add" | "edit";
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  mentors: MentorOption[];
  classes: ClassOption[];
  mentorsLoading: boolean;
  onBack: () => void;
  onSave: () => void;
  submitting?: boolean;
  error?: string;
  notice: Notice | null;
  onDismissNotice: () => void;
}) {
  // Keep a student's current mentor selectable even if that mentor has since
  // been deactivated, so opening Edit doesn't silently unassign them.
  const options = mentors.filter((m) => m.active || m.id === form.mentorId);

  return (
    <div className="min-h-full bg-[#f4f4f4] px-6 py-6 font-[Poppins]">
      <NoticeBar notice={notice} onDismiss={onDismissNotice} />
      <div className="mb-[24px] flex items-center gap-[10px]">
        <BackButton onClick={onBack} disabled={submitting} />
        <h1 className="text-[24px] font-semibold leading-none text-[#111111]">{title}</h1>
      </div>

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (!submitting) onSave();
        }}
        className="rounded-[8px] border border-[#d6d6d6] bg-white px-[24px] py-[24px]"
      >
        <div className="grid grid-cols-1 gap-x-[26px] gap-y-[25px] lg:grid-cols-2">
          <label>
            <span className={labelClass}>Full Name *</span>
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              placeholder="Enter student name"
            />
          </label>

          <label>
            <span className={labelClass}>Email *</span>
            <input
              type="email"
              autoComplete="off"
              className={inputClass}
              value={form.email}
              onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
              placeholder="student@email.com"
            />
          </label>

          <label>
            <span className={labelClass}>Phone *</span>
            <input
              type="tel"
              className={inputClass}
              value={form.phone}
              onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
              placeholder="+1 234-567-8900"
            />
          </label>

          <label>
            <span className={labelClass}>Status *</span>
            <span className="relative block">
              <select
                className={`${inputClass} appearance-none pr-9`}
                value={form.status}
                onChange={(e) => setForm((s) => ({ ...s, status: e.target.value as StudentStatus }))}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <ChevronDown size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#666666]" />
            </span>
          </label>

          <label>
            <span className={labelClass}>Assigned Mentor</span>
            {/* A real list of mentors. It used to be free text matched by exact
                name, so a typo silently left the student unassigned. */}
            <span className="relative block">
              <select
                className={`${inputClass} appearance-none pr-9`}
                value={form.mentorId}
                disabled={mentorsLoading}
                onChange={(e) => setForm((s) => ({ ...s, mentorId: e.target.value }))}
              >
                <option value="">{mentorsLoading ? "Loading mentors..." : "No mentor (unassigned)"}</option>
                {options.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.active ? m.name : `${m.name} (inactive)`}
                  </option>
                ))}
              </select>
              <ChevronDown size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#666666]" />
            </span>
            {!mentorsLoading && options.length === 0 && (
              <span className="mt-[6px] block text-[12px] text-[#999999]">
                No mentors yet — add one in Mentor Management first.
              </span>
            )}
          </label>

          <label>
            <span className={labelClass}>Class</span>
            {/* Enrollment is what lets the iPad kiosk find the student's session.
                Nothing used to set it, so every kiosk check-in failed. */}
            <span className="relative block">
              <select
                className={`${inputClass} appearance-none pr-9`}
                value={form.classId}
                disabled={mentorsLoading}
                onChange={(e) => setForm((s) => ({ ...s, classId: e.target.value }))}
              >
                <option value="">{mentorsLoading ? "Loading classes..." : "Not enrolled"}</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <ChevronDown size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#666666]" />
            </span>
            {!mentorsLoading && !form.classId && (
              <span className="mt-[6px] block text-[12px] text-[#c2410c]">
                Without a class the student can't check in at the iPad kiosk.
              </span>
            )}
          </label>

          <label>
            <span className={labelClass}>Course</span>
            <input
              className={inputClass}
              value={form.course}
              onChange={(e) => setForm((s) => ({ ...s, course: e.target.value }))}
              placeholder="Enter course name"
            />
          </label>

          <label className="lg:col-span-2">
            <span className={labelClass}>Address</span>
            <input
              className={inputClass}
              value={form.address}
              onChange={(e) => setForm((s) => ({ ...s, address: e.target.value }))}
              placeholder="Enter full address"
            />
          </label>
        </div>

        <div className="mt-[19px] border-t border-[#dedede] pt-[24px]">
          {error && <p className="mb-3 text-[14px] font-medium text-red-600">{error}</p>}
          <div className="flex flex-wrap items-center gap-[16px]">
            <button
              type="submit"
              disabled={submitting}
              className="h-[43px] rounded-[8px] bg-[#F9A618] px-[28px] text-[16px] font-medium text-white transition-colors hover:bg-[#f0a014] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "Saving..." : mode === "add" ? "Add Student" : "Save Changes"}
            </button>
            {/* Locked while saving: leaving mid-request let the completed save
                yank the view back to the detail page afterwards. */}
            <button
              type="button"
              onClick={onBack}
              disabled={submitting}
              className="h-[43px] rounded-[8px] border border-[#d6d6d6] bg-white px-[26px] text-[16px] font-medium text-[#666666] transition-colors hover:bg-[#f7f7f7] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function StudentDetails({
  student,
  onBack,
  onEdit,
  onDownload,
  notice,
  onDismissNotice,
}: {
  student: Student;
  onBack: () => void;
  onEdit: () => void;
  onDownload: () => void;
  notice: Notice | null;
  onDismissNotice: () => void;
}) {
  const router = useRouter();
  return (
    <div className="min-h-full bg-[#f4f4f4] px-6 py-6 font-[Poppins]">
      <NoticeBar notice={notice} onDismiss={onDismissNotice} />
      <div className="mb-[24px] flex items-center justify-between">
        <div className="flex items-center gap-[10px]">
          <BackButton onClick={onBack} />
          <h1 className="text-[24px] font-semibold leading-none text-[#111111]">Student Details</h1>
        </div>
        <button
          type="button"
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
              <InfoBlock label="Current Mentor" value={student.mentor || "Unassigned"} />
              <InfoBlock label="Class" value={student.className || "Not enrolled"} />
              <InfoBlock label="Course" value={student.course} />
              <InfoBlock icon={<MapPin size={15} />} label="Address" value={student.address} />
            </div>

            <div className="mt-[27px] grid grid-cols-1 gap-[12px] md:grid-cols-2">
              <CodeBlock
                icon={<IdCard size={18} />}
                label="Student ID"
                hint="Used on the student login's Student ID tab."
                value={student.studentCode}
              />
              <CodeBlock
                icon={<KeyRound size={18} />}
                label="iPad Kiosk PIN"
                hint="Entered at the kiosk to mark attendance."
                value={student.attendanceCode}
              />
            </div>
            {(!student.studentCode || !student.attendanceCode) && (
              <p className="mt-[10px] text-[13px] text-[#999999]">
                Missing codes are generated automatically the next time you save this student.
              </p>
            )}
          </div>
        </section>

        <aside className="space-y-[24px]">
          <div className="rounded-[8px] border border-[#d6d6d6] bg-white px-[24px] py-[24px]">
            <h2 className="mb-[25px] text-[18px] font-normal leading-none text-[#111111]">Performance</h2>
            <div className="mb-[20px]">
              <div className="mb-[6px] flex items-start justify-between text-[16px] font-normal text-[#666666]">
                <span>Attendance</span>
                <span className="text-[16px] text-[#111111]">{student.performance.attendance == null ? "No records yet" : `${student.performance.attendance}%`}</span>
              </div>
              <div className="h-[7px] overflow-hidden rounded-full bg-[#e5e5e5]">
                <div className="h-full rounded-full bg-[#F9A618]" style={{ width: `${student.performance.attendance ?? 0}%` }} />
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
                  type="button"
                  key={action}
                  onClick={() =>
                    action === "Download Report"
                      ? onDownload()
                      : action === "Send Message"
                        ? router.push(chatLink("/adminpanel/message", student.id))
                        : undefined
                  }
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

function CodeBlock({ icon, label, hint, value }: { icon: React.ReactNode; label: string; hint: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[8px] border border-[#F9A618]/40 bg-[#FFF7EA] px-[18px] py-[15px]">
      <div className="flex items-center gap-[10px]">
        <span className="text-[#F9A618]">{icon}</span>
        <div>
          <p className="text-[14px] font-medium leading-none text-[#666666]">{label}</p>
          <p className="mt-[6px] text-[12px] leading-snug text-[#999999]">{hint}</p>
        </div>
      </div>
      <span className="font-mono text-[22px] font-semibold tracking-[0.12em] text-[#111111]">{value || "—"}</span>
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
  const [mentors, setMentors] = useState<MentorOption[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [mentorsLoading, setMentorsLoading] = useState(false);

  const refresh = async (): Promise<Student[]> => {
    setLoading(true);
    try {
      const data = await listStudents();
      setStudents(data);
      return data;
    } catch (e) {
      setNotice({ type: "error", msg: (e as Error).message });
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetched each time a form opens so a mentor/class added elsewhere shows up.
  // When adding a student and only one class exists, preselect it.
  const loadMentors = async (preselectClass = false) => {
    setMentorsLoading(true);
    try {
      const [m, c] = await Promise.all([listMentorOptions(), listClassOptions()]);
      setMentors(m);
      setClasses(c);
      if (preselectClass && c.length === 1) setForm((f) => (f.classId ? f : { ...f, classId: c[0].id }));
    } catch (e) {
      setFormError(`Could not load mentors/classes: ${(e as Error).message}`);
    } finally {
      setMentorsLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return students.filter((s) => {
      const matchesText =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.studentCode.toLowerCase().includes(q);
      const matchesStatus = filterStatus === "All Status" ? true : s.status === filterStatus;
      return matchesText && matchesStatus;
    });
  }, [students, search, filterStatus]);

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
      { label: "Student ID", value: student.studentCode },
      { label: "Email", value: student.email },
      { label: "Mentor", value: student.mentor },
      { label: "Course", value: student.course },
      { label: "Status", value: student.status },
      { label: "Class", value: student.className },
      { label: "Attendance", value: student.performance.attendance == null ? "No records yet" : `${student.performance.attendance}%` },
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

  // Errors belong to the action that produced them; drop them on navigation.
  // Success notices are kept — the one after Add carries the temp password.
  const clearError = () => setNotice((n) => (n?.type === "error" ? null : n));

  const resetList = () => {
    clearError();
    setView("list");
    setSelected(null);
    setForm(emptyForm);
    setFormError("");
  };

  const handleAdd = () => {
    clearError();
    setSelected(null);
    setForm(emptyForm);
    setFormError("");
    setView("add");
    loadMentors(true);
  };

  const openDetail = (s: Student) => {
    clearError();
    setSelected(s);
    setView("detail");
  };

  const saveNew = async () => {
    const invalid = validateForm(form);
    if (invalid) {
      setFormError(invalid);
      return;
    }
    setFormError("");
    setSubmitting(true);
    let res: Awaited<ReturnType<typeof createStudent>>;
    try {
      res = await createStudent(form);
    } catch (e) {
      // Without this a thrown server error left the button stuck on "Saving...".
      setFormError((e as Error).message || "Something went wrong. Please try again.");
      return;
    } finally {
      setSubmitting(false);
    }
    if (res.error) {
      setFormError(res.error);
      return;
    }
    setNotice({
      type: "success",
      msg: `Student created. Temporary password: ${res.tempPassword} — share it securely; they should change it after first login.`,
    });
    const list = await refresh();
    const created = res.id ? list.find((s) => s.id === res.id) ?? null : null;
    if (created) {
      setSelected(created);
      setView("detail");
    } else {
      setView("list");
      setForm(emptyForm);
    }
  };

  const handleEdit = (s: Student) => {
    clearError();
    setSelected(s);
    setFormError("");
    setForm({
      name: s.name,
      email: s.email,
      phone: s.phone,
      status: s.status,
      mentorId: s.mentorId,
      classId: s.classId,
      course: s.course,
      address: s.address,
    });
    setView("edit");
    loadMentors();
  };

  const saveEdit = async () => {
    if (!selected) return;
    const invalid = validateForm(form);
    if (invalid) {
      setFormError(invalid);
      return;
    }
    setFormError("");
    setSubmitting(true);
    let res: Awaited<ReturnType<typeof updateStudent>>;
    try {
      res = await updateStudent(selected.id, form);
    } catch (e) {
      setFormError((e as Error).message || "Something went wrong. Please try again.");
      return;
    } finally {
      setSubmitting(false);
    }
    if (res.error) {
      setFormError(res.error);
      return;
    }
    setNotice({ type: "success", msg: "Student updated." });
    const list = await refresh();
    const updated = list.find((s) => s.id === selected.id) ?? null;
    setSelected(updated);
    setView(updated ? "detail" : "list");
  };

  const confirmDelete = async () => {
    if (!deleteTarget || submitting) return;
    setSubmitting(true);
    let res: Awaited<ReturnType<typeof deleteStudent>>;
    try {
      res = await deleteStudent(deleteTarget.id);
    } catch (e) {
      res = { error: (e as Error).message || "Something went wrong. Please try again." };
    } finally {
      setSubmitting(false);
    }
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

  if (view === "add" || view === "edit") {
    return (
      <StudentForm
        title={view === "add" ? "Add New Student" : "Edit Student"}
        mode={view}
        form={form}
        setForm={setForm}
        mentors={mentors}
        classes={classes}
        mentorsLoading={mentorsLoading}
        onBack={resetList}
        onSave={view === "add" ? saveNew : saveEdit}
        submitting={submitting}
        error={formError}
        notice={notice}
        onDismissNotice={() => setNotice(null)}
      />
    );
  }

  if (view === "detail" && selected) {
    return (
      <StudentDetails
        student={selected}
        onBack={resetList}
        onEdit={() => handleEdit(selected)}
        onDownload={() => downloadReport(selected)}
        notice={notice}
        onDismissNotice={() => setNotice(null)}
      />
    );
  }

  return (
    <div className="min-h-full bg-[#f4f4f4] px-6 py-6 font-[Poppins]">
      <NoticeBar notice={notice} onDismiss={() => setNotice(null)} />
      <div className="mb-[24px] flex items-center justify-between gap-4">
        <div className="flex items-center gap-[12px]">
          <HeaderIcon />
          <div>
            <h1 className="text-[24px] font-semibold leading-none text-[#111111]">Students Management</h1>
            <p className="mt-[7px] text-[16px] font-normal leading-none text-[#666666]">
              {loading ? "Loading..." : `${students.length} total student${students.length === 1 ? "" : "s"}`}
            </p>
          </div>
        </div>
        <button
          type="button"
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
              placeholder="Search by name, email or Student ID..."
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
                  {students.length === 0 ? "No students yet. Click “Add Student” to create one." : "No students match your search."}
                </td>
              </tr>
            )}
            {!loading && filtered.map((s) => (
              <tr key={s.id} className="border-b border-[#e5e5e5] text-[16px] font-normal leading-none text-[#666666] last:border-b-0">
                <td className="px-[24px] py-[24px] text-[#111111]">{s.name}</td>
                <td className="px-[24px] py-[24px]">{s.email}</td>
                <td className="px-[24px] py-[24px]">{s.phone}</td>
                <td className="px-[24px] py-[24px]">{s.mentor || <span className="text-[#aaaaaa]">Unassigned</span>}</td>
                <td className="px-[24px] py-[24px]">{s.course}</td>
                <td className="px-[24px] py-[24px]">
                  <StatusBadge status={s.status} />
                </td>
                <td className="px-[24px] py-[21px]">
                  <div className="flex items-center justify-center gap-[14px]">
                    <ActionIcon label="View" onClick={() => openDetail(s)}>
                      <Eye size={16} strokeWidth={2} />
                    </ActionIcon>
                    <ActionIcon label="Edit" onClick={() => handleEdit(s)}>
                      <img src="/images/admin-user-icon-42.svg" alt="" className="h-4 w-4" />
                    </ActionIcon>
                    <button
                      type="button"
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
              Permanently delete {deleteTarget.name}? Their login, attendance history and mentor
              assignment will be removed. To keep their records, set them to Inactive instead.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={confirmDelete}
                disabled={submitting}
                className="h-[42px] flex-1 rounded-[8px] bg-[#ff0000] text-[15px] font-semibold text-white hover:bg-[#dc0000] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? "Deleting..." : "Delete"}
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={submitting}
                className="h-[42px] flex-1 rounded-[8px] border border-[#d6d6d6] bg-white text-[15px] font-semibold text-[#666666] hover:bg-[#f7f7f7] disabled:cursor-not-allowed disabled:opacity-60"
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
