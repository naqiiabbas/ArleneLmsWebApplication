"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { X, ChevronRight, Plus, ChevronDown } from "lucide-react";
import {
  listSessionsOn,
  listMentorPicks,
  updateDashboardSession,
  setDashboardSessionStatus,
} from "@/lib/data/dashboard";
import type {
  AdminDashboard as DashboardData,
  DashboardMentor,
  DashboardPerson,
  DashboardSession,
  DashboardSessionInput,
  MentorPick,
} from "@/lib/data/dashboard.types";
import type { SessionStatus } from "@/lib/data/mentor.types";

const STATUS_LABEL: Record<SessionStatus, string> = {
  scheduled: "Scheduled",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_PILL: Record<SessionStatus, string> = {
  scheduled: "bg-blue-100 text-blue-600",
  in_progress: "bg-green-100 text-green-600",
  completed: "bg-gray-100 text-gray-500",
  cancelled: "bg-red-50 text-red-500",
};

const parseYmd = (ymd: string) => {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const longDay = (ymd: string) =>
  parseYmd(ymd).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 3).map((p) => p[0]?.toUpperCase()).join("") || "?";
const minutesBetween = (a: string, b: string) => {
  const [ah, am] = a.split(":").map(Number);
  const [bh, bm] = b.split(":").map(Number);
  return bh * 60 + bm - (ah * 60 + am);
};
const isUrl = (s: string) => /^https?:\/\//i.test(s.trim());

const IconImg = ({ src, className = "h-[18px] w-[18px]" }: { src: string; className?: string }) => (
  <img src={src} alt="" aria-hidden="true" className={className} />
);

export default function AdminDashboard({ data, error }: { data: DashboardData | null; error?: string }) {
  const router = useRouter();
  const today = data?.today ?? "";
  const canEdit = !!data?.canEditSessions;

  const [dateFilter, setDateFilter] = useState(today);
  const [statusFilter, setStatusFilter] = useState<"all" | SessionStatus>("all");
  const [sessions, setSessions] = useState<DashboardSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [sessionsError, setSessionsError] = useState("");

  const [viewing, setViewing] = useState<DashboardSession | null>(null);
  const [editing, setEditing] = useState<DashboardSession | null>(null);
  const [mentors, setMentors] = useState<MentorPick[]>([]);
  const [modalError, setModalError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (today && !dateFilter) setDateFilter(today);
  }, [today, dateFilter]);

  const loadSessions = async (date: string) => {
    if (!date) return;
    setLoadingSessions(true);
    setSessionsError("");
    try {
      setSessions(await listSessionsOn(date));
    } catch (e) {
      setSessionsError((e as Error).message);
      setSessions([]);
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    loadSessions(dateFilter);
  }, [dateFilter]);

  const filteredSessions = useMemo(
    () => sessions.filter((s) => statusFilter === "all" || s.status === statusFilter),
    [sessions, statusFilter]
  );

  const stats = data
    ? [
        { label: "Total Students", value: data.stats.totalStudents, sub: `${data.stats.activeStudents} active`, icon: "/images/admin-icon-17.svg" },
        { label: "Total Mentors", value: data.stats.totalMentors, sub: `${data.stats.activeMentors} active`, icon: "/images/admin-icon-18.svg" },
        { label: "Today's Sessions", value: data.stats.todaySessions, sub: `${data.stats.inProgressToday} in progress`, icon: "/images/admin-icon-19.svg" },
        {
          label: "Pending Approvals",
          value: data.stats.pendingApprovals,
          sub: `${data.stats.pendingDocuments} docs · ${data.stats.pendingAbsences} absences`,
          icon: "/images/admin-icon-20.svg",
        },
      ]
    : [];

  const afterChange = async () => {
    await loadSessions(dateFilter);
    router.refresh(); // re-runs the server page so the stat cards update too
  };

  const openEdit = async (s: DashboardSession) => {
    setModalError("");
    setViewing(null);
    setEditing(s);
    try {
      setMentors(await listMentorPicks());
    } catch (e) {
      setModalError(`Could not load mentors: ${(e as Error).message}`);
    }
  };

  const markComplete = async (s: DashboardSession) => {
    if (busy) return;
    setBusy(true);
    setModalError("");
    try {
      const res = await setDashboardSessionStatus(s.id, "completed");
      if (res.error) {
        setModalError(res.error);
        return;
      }
      setViewing(null);
      await afterChange();
    } catch (e) {
      setModalError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const saveEdit = async (input: DashboardSessionInput) => {
    if (!editing || busy) return;
    setBusy(true);
    setModalError("");
    try {
      const res = await updateDashboardSession(editing.id, input);
      if (res.error) {
        setModalError(res.error);
        return;
      }
      setEditing(null);
      if (input.date !== dateFilter) setDateFilter(input.date); // follow the session; reloads via effect
      else await loadSessions(dateFilter);
      router.refresh();
    } catch (e) {
      setModalError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const heading = dateFilter && dateFilter !== today ? `Mentoring Sessions — ${longDay(dateFilter)}` : "Today's Mentoring Sessions";

  return (
    <div className="bg-[#f4f4f4] px-4 pb-0 pt-5 font-[Poppins] text-sm md:px-6">
      {error && (
        <div className="mb-5 rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-semibold text-red-700">
          Could not load the dashboard: {error}
        </div>
      )}

      {/* 1. Top stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4 md:gap-5">
        {(data ? stats : Array.from({ length: 4 }, () => ({ label: "", value: 0, sub: "", icon: "" }))).map((stat, i) => (
          <div key={i} className="relative h-[126px] overflow-hidden rounded-[8px] border border-[#dddddd] bg-white px-[18px] py-[18px]">
            <div className="mb-[18px] flex items-start justify-between">
              <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[8px] bg-[#fff7e8]">
                {stat.icon && <img src={stat.icon} alt="" aria-hidden="true" className="h-5 w-5" />}
              </div>
            </div>
            <div className="h-px w-full bg-[#ffa313]" />
            <div className="mt-[12px] text-[12px] font-medium leading-none text-[#666666]">{stat.label || "—"}</div>
            <div className="mt-[12px] flex items-baseline justify-between gap-2">
              <span className="text-[18px] font-semibold leading-none text-[#242424]">{data ? stat.value.toLocaleString() : "—"}</span>
              <span className="truncate text-[11px] font-medium leading-none text-[#9b9b9b]">{stat.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 2. Sessions */}
      <div className="mb-5 overflow-hidden rounded-[8px] border border-[#dddddd] bg-white">
        <div className="border-b border-[#eeeeee] px-[16px] pb-[16px] pt-[17px]">
          <div className="mb-[17px] flex items-center justify-between gap-3">
            <h3 className="text-[19px] font-semibold leading-none text-[#242424]">{heading}</h3>
            {dateFilter !== today && today && (
              <button type="button" onClick={() => setDateFilter(today)} className="text-[12px] font-medium text-[#F9A618] hover:underline">
                Back to today
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "all" | SessionStatus)}
                className="h-[34px] w-[130px] appearance-none rounded-[5px] border border-[#dddddd] bg-white px-3 pr-7 text-[11px] text-[#777777] outline-none"
                aria-label="Filter by status"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <ChevronDown size={13} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#999999]" />
            </div>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => e.target.value && setDateFilter(e.target.value)}
              className="h-[34px] w-[140px] rounded-[5px] border border-[#dddddd] bg-white px-3 text-[11px] text-[#777777] outline-none"
              aria-label="Session date"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#f4f4f4] text-[11px] font-medium text-[#777777]">
              <tr>
                <th className="px-4 py-[14px]">Session Title</th>
                <th className="px-4 py-[14px]">Mentor</th>
                <th className="px-4 py-[14px]">Class / Students</th>
                <th className="px-4 py-[14px]">Time</th>
                <th className="px-4 py-[14px]">Status</th>
                <th className="px-4 py-[14px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eeeeee] text-[#777777]">
              {loadingSessions && (
                <tr><td colSpan={6} className="py-10 text-center text-gray-400">Loading sessions...</td></tr>
              )}
              {!loadingSessions && sessionsError && (
                <tr><td colSpan={6} className="py-10 text-center text-red-500">{sessionsError}</td></tr>
              )}
              {!loadingSessions && !sessionsError && filteredSessions.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-400">
                    {sessions.length === 0
                      ? "No sessions scheduled for this day. Mentors schedule sessions from their Calendar."
                      : "No sessions match this status."}
                  </td>
                </tr>
              )}
              {!loadingSessions &&
                filteredSessions.map((session) => (
                  <tr key={session.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-4 py-[14px] text-[12px] font-semibold text-[#444444]">{session.title}</td>
                    <td className="px-4 py-[14px] text-[12px]">{session.mentorName}</td>
                    <td className="px-4 py-[14px] text-[12px]">
                      {session.className || "—"}
                      <span className="block text-[11px] text-[#999999]">
                        {session.studentCount} student{session.studentCount === 1 ? "" : "s"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-[14px] text-[12px]">{session.time} – {session.endTime}</td>
                    <td className="px-4 py-[14px]">
                      <span className={`rounded-full px-2 py-[3px] text-[10px] font-medium ${STATUS_PILL[session.status]}`}>
                        {STATUS_LABEL[session.status]}
                      </span>
                    </td>
                    <td className="px-4 py-[14px]">
                      <div className="flex gap-4">
                        <button type="button" onClick={() => { setModalError(""); setViewing(session); }} title="View Details" aria-label="View details">
                          <img src="/images/admin-icon-22.svg" alt="" className="h-4 w-4" />
                        </button>
                        {canEdit && (
                          <button type="button" onClick={() => openEdit(session)} title="Edit Session" aria-label="Edit session">
                            <img src="/images/admin-icon-39.svg" alt="" className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. People */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ManagementCard
          title="Student Management"
          type="student"
          list={data?.recentStudents ?? []}
          total={data?.stats.totalStudents ?? 0}
          href="/adminpanel/studentmanagment"
        />
        <ManagementCard
          title="Mentor Management"
          type="mentor"
          list={data?.recentMentors ?? []}
          total={data?.stats.totalMentors ?? 0}
          href="/adminpanel/mentormanagment"
        />
      </div>

      <SessionViewModal
        session={viewing}
        canEdit={canEdit}
        busy={busy}
        error={modalError}
        onClose={() => !busy && setViewing(null)}
        onEdit={() => viewing && openEdit(viewing)}
        onComplete={() => viewing && markComplete(viewing)}
      />
      {editing && (
        <EditSessionModal
          key={editing.id}
          session={editing}
          mentors={mentors}
          busy={busy}
          error={modalError}
          onClose={() => !busy && setEditing(null)}
          onSave={saveEdit}
        />
      )}
    </div>
  );
}

function SessionViewModal({
  session,
  canEdit,
  busy,
  error,
  onClose,
  onEdit,
  onComplete,
}: {
  session: DashboardSession | null;
  canEdit: boolean;
  busy: boolean;
  error: string;
  onClose: () => void;
  onEdit: () => void;
  onComplete: () => void;
}) {
  if (!session) return null;
  const mins = minutesBetween(session.startHm, session.endHm);
  const finished = session.status === "completed" || session.status === "cancelled";
  const link = isUrl(session.location) ? session.location.trim() : "";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="max-h-[calc(100vh-24px)] w-full max-w-[766px] overflow-y-auto rounded-[8px] bg-white font-[Poppins] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="px-6 pb-6 pt-[26px]">
          <div className="mb-[24px] flex items-start justify-between">
            <div>
              <h2 className="text-[21px] font-normal leading-none text-[#242424]">{session.title}</h2>
              <span className={`mt-[14px] inline-flex rounded-full px-[12px] py-[5px] text-[13px] leading-none ${STATUS_PILL[session.status]}`}>
                {STATUS_LABEL[session.status]}
              </span>
            </div>
            <button type="button" onClick={onClose} className="mt-[18px] text-[#777777] hover:text-[#242424]" aria-label="Close">
              <X size={22} />
            </button>
          </div>

          {error && <p className="mb-4 rounded-[8px] border border-red-200 bg-red-50 px-3 py-2 text-[14px] font-medium text-red-700">{error}</p>}

          <div className="mb-[24px] h-px bg-[#dddddd]" />

          <div className="grid gap-4 md:grid-cols-2">
            <PersonCard initials={initials(session.mentorName)} label="Mentor" name={session.mentorName} sub={session.mentorEmail} color="#ffa313" />
            <PersonCard
              initials={String(session.studentCount)}
              label={session.className ? `Class · ${session.className}` : "Class"}
              name={`${session.studentCount} enrolled student${session.studentCount === 1 ? "" : "s"}`}
              sub={session.studentNames.slice(0, 3).join(", ") + (session.studentNames.length > 3 ? ` +${session.studentNames.length - 3} more` : "")}
              color="#2f7df6"
            />
          </div>

          <div className="mt-[25px] rounded-[8px] border border-[#dddddd] px-4 pb-[18px] pt-[18px]">
            <h3 className="mb-[24px] text-[15px] font-normal text-[#242424]">Session Details</h3>
            <div className="grid gap-x-[72px] gap-y-[22px] md:grid-cols-2">
              <DetailIcon icon="/images/admin-session-icon-33.svg" label="Date" value={longDay(session.date)} />
              <DetailIcon icon="/images/admin-session-icon-34.svg" label="Time (Pacific)" value={`${session.time} – ${session.endTime}`} />
              <DetailIcon icon="/images/admin-session-icon-35.svg" label="Duration" value={mins > 0 ? `${mins} min` : "—"} />
              <DetailIcon
                icon="/images/admin-session-icon-36.svg"
                label="Location"
                value={link ? "Join Meeting" : session.location || "Not set"}
                link={link || undefined}
              />
            </div>
          </div>
        </div>

        <div className="border-t border-[#dddddd] px-6 py-[24px]">
          <div className="flex flex-wrap gap-3">
            {link && (
              <a href={link} target="_blank" rel="noopener noreferrer" className="flex h-[42px] flex-1 items-center justify-center gap-2 rounded-[8px] bg-[#ffa313] px-4 text-[16px] font-medium text-white">
                <IconImg src="/images/admin-session-icon-32.svg" className="h-4 w-4" /> Join Meeting
              </a>
            )}
            {canEdit && !finished && (
              <button type="button" disabled={busy} onClick={onComplete} className="flex h-[42px] flex-1 items-center justify-center rounded-[8px] bg-[#00a63e] px-4 text-[16px] font-medium text-white disabled:opacity-60">
                {busy ? "Saving..." : "Mark Complete"}
              </button>
            )}
            {canEdit && (
              <button type="button" disabled={busy} onClick={onEdit} className="flex h-[42px] flex-1 items-center justify-center gap-2 rounded-[8px] border border-[#dddddd] bg-white px-4 text-[16px] font-medium text-[#777777] disabled:opacity-60">
                <IconImg src="/images/admin-icon-39.svg" className="h-4 w-4" /> Edit Session
              </button>
            )}
            {!canEdit && (
              <button type="button" onClick={onClose} className="flex h-[42px] flex-1 items-center justify-center rounded-[8px] border border-[#dddddd] bg-white px-4 text-[16px] font-medium text-[#777777]">
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EditSessionModal({
  session,
  mentors,
  busy,
  error,
  onClose,
  onSave,
}: {
  session: DashboardSession;
  mentors: MentorPick[];
  busy: boolean;
  error: string;
  onClose: () => void;
  onSave: (input: DashboardSessionInput) => void;
}) {
  const [form, setForm] = useState<DashboardSessionInput>({
    title: session.title,
    mentorId: session.mentorId,
    date: session.date,
    startTime: session.startHm,
    endTime: session.endHm,
    location: session.location,
    status: session.status,
  });
  const [localError, setLocalError] = useState("");

  // Keep the current mentor selectable even if inactive / not in the list.
  const options =
    form.mentorId && !mentors.some((m) => m.id === form.mentorId)
      ? [{ id: form.mentorId, name: session.mentorName }, ...mentors]
      : mentors;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (!form.title.trim()) return setLocalError("Please enter a session title.");
    if (!form.date) return setLocalError("Please pick a date.");
    if (!form.startTime || !form.endTime) return setLocalError("Please pick a start and end time.");
    if (form.endTime <= form.startTime) return setLocalError("End time must be after the start time.");
    setLocalError("");
    onSave(form);
  };

  const shown = localError || error;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <form noValidate onSubmit={submit} className="max-h-[calc(100vh-24px)] w-full max-w-[766px] overflow-y-auto rounded-[8px] bg-white font-[Poppins] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex h-[84px] items-center justify-between border-b border-[#dddddd] px-6">
          <h2 className="text-[21px] font-normal text-[#242424]">Edit Session</h2>
          <button type="button" onClick={onClose} className="text-[#777777] hover:text-[#242424]" aria-label="Close">
            <X size={22} />
          </button>
        </div>

        <div className="space-y-[20px] px-6 py-[25px]">
          {shown && <p className="rounded-[8px] border border-red-200 bg-red-50 px-3 py-2 text-[14px] font-medium text-red-700">{shown}</p>}
          <h3 className="text-[15px] font-normal text-[#242424]">Basic Information</h3>
          <ModalInput label="Session Title *" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
          <div className="grid gap-4 md:grid-cols-2">
            <ModalSelect label="Mentor" value={form.mentorId} onChange={(v) => setForm({ ...form, mentorId: v })}>
              <option value="">Unassigned</option>
              {options.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </ModalSelect>
            <ModalSelect label="Status *" value={form.status} onChange={(v) => setForm({ ...form, status: v as SessionStatus })}>
              {(Object.keys(STATUS_LABEL) as SessionStatus[]).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
            </ModalSelect>
          </div>

          <h3 className="pt-[1px] text-[15px] font-normal text-[#242424]">Schedule (Pacific Time)</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <ModalInput type="date" label="Date *" value={form.date} onChange={(v) => setForm({ ...form, date: v })} />
            <ModalInput type="time" label="Start *" value={form.startTime} onChange={(v) => setForm({ ...form, startTime: v })} />
            <ModalInput type="time" label="End *" value={form.endTime} onChange={(v) => setForm({ ...form, endTime: v })} />
          </div>
          <ModalInput
            label="Location or Meeting Link"
            value={form.location}
            onChange={(v) => setForm({ ...form, location: v })}
            placeholder="e.g., Library Room 301 or https://meet.example.com/..."
          />
          <p className="text-[12px] text-[#999999]">Class: {session.className || "—"} (class can&apos;t be changed here).</p>
        </div>

        <div className="flex gap-3 border-t border-[#dddddd] px-6 py-4">
          <button type="submit" disabled={busy} className="h-[44px] flex-1 rounded-[8px] bg-[#ffa313] text-[16px] font-medium text-white disabled:opacity-60">
            {busy ? "Saving..." : "Save Changes"}
          </button>
          <button type="button" disabled={busy} onClick={onClose} className="h-[44px] w-[120px] rounded-[8px] border border-[#dddddd] text-[16px] font-medium text-[#777777] disabled:opacity-60">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function PersonCard({ initials, label, name, sub, color }: { initials: string; label: string; name: string; sub: string; color: string }) {
  return (
    <div className="flex min-h-[99px] items-center gap-3 rounded-[8px] bg-[#f4f4f4] px-4 py-3">
      <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full text-[15px] font-medium text-white" style={{ backgroundColor: color }}>
        {initials}
      </div>
      <div className="min-w-0">
        <p className="text-[13px] leading-[18px] text-[#777777]">{label}</p>
        <p className="text-[15px] leading-[20px] text-[#242424]">{name}</p>
        {sub && <p className="mt-[8px] truncate text-[13px] leading-none text-[#777777]">{sub}</p>}
      </div>
    </div>
  );
}

function DetailIcon({ icon, label, value, link }: { icon: string; label: string; value: string; link?: string }) {
  return (
    <div className="grid grid-cols-[18px_minmax(0,1fr)] gap-[12px]">
      <IconImg src={icon} className="mt-[2px] h-[18px] w-[18px]" />
      <div>
        <p className="text-[13px] leading-none text-[#777777]">{label}</p>
        {link ? (
          <a href={link} target="_blank" rel="noopener noreferrer" className="mt-[6px] block text-[15px] leading-none text-[#ffa313]">{value}</a>
        ) : (
          <p className="mt-[6px] text-[15px] leading-snug text-[#242424]">{value}</p>
        )}
      </div>
    </div>
  );
}

function ModalInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-[10px] block text-[14px] leading-none text-[#777777]">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-[42px] w-full rounded-[8px] border border-[#dddddd] px-4 text-[16px] text-[#242424] outline-none placeholder:text-[#8d8d8d] focus:border-[#ffa313]" />
    </label>
  );
}

function ModalSelect({ label, value, onChange, children }: { label: string; value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-[10px] block text-[14px] leading-none text-[#777777]">{label}</span>
      <span className="relative block">
        <select value={value} onChange={(e) => onChange(e.target.value)} className="h-[42px] w-full appearance-none rounded-[8px] border border-[#dddddd] bg-white px-4 pr-9 text-[16px] text-[#242424] outline-none focus:border-[#ffa313]">
          {children}
        </select>
        <ChevronDown size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#999999]" />
      </span>
    </label>
  );
}

function ManagementCard({
  title,
  type,
  list,
  total,
  href,
}: {
  title: string;
  type: "student" | "mentor";
  list: (DashboardPerson | DashboardMentor)[];
  total: number;
  href: string;
}) {
  const router = useRouter();
  const noun = type === "student" ? "Students" : "Mentors";
  return (
    <div className="flex min-h-[308px] flex-col overflow-hidden rounded-[8px] border border-[#dddddd] bg-white">
      <div className="flex items-center justify-between border-b border-[#eeeeee] px-[16px] py-[14px]">
        <div className="flex items-center gap-3">
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[8px] bg-[#fff7e8]">
            <img src={type === "student" ? "/images/admin-icon-17.svg" : "/images/admin-icon-18.svg"} alt="" className="h-5 w-5" />
          </div>
          <h3 className="text-[17px] font-semibold text-[#242424]">{title}</h3>
        </div>
        <button type="button" onClick={() => router.push(href)} className="flex h-[34px] min-w-[86px] items-center justify-center gap-2 rounded-[7px] bg-[#F9A618] px-4 text-[12px] font-medium text-white transition-colors hover:bg-[#f29a0b]">
          <Plus size={14} /> Add
        </button>
      </div>
      <div className="divide-y divide-[#eeeeee] px-[14px]">
        {list.length === 0 && (
          <p className="py-10 text-center text-[12px] text-[#999999]">No {noun.toLowerCase()} yet.</p>
        )}
        {list.map((item) => (
          <div key={item.id} className="flex min-h-[58px] items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[12px] font-semibold text-[#444444]">{item.name}</p>
              <p className="truncate text-[10px] leading-4 text-[#777777]">
                {item.email}
                {item.phone ? ` · ${item.phone}` : ""}
              </p>
              {"sessionsThisMonth" in item && (
                <span className="text-[10px] font-medium leading-4 text-[#F9A618]">
                  {item.sessionsThisMonth} session{item.sessionsThisMonth === 1 ? "" : "s"} this month
                </span>
              )}
            </div>
            <span
              className={`shrink-0 rounded-full px-[10px] py-[3px] text-[10px] font-medium ${
                item.status === "active" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"
              }`}
            >
              {item.status}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-auto border-t border-[#eeeeee] p-4 text-center">
        <button type="button" onClick={() => router.push(href)} className="mx-auto flex items-center gap-2 text-[12px] font-medium leading-[14px] text-[#F9A618] hover:underline">
          View all {total} {noun.toLowerCase()} <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
