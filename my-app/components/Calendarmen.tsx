"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  User,
  X,
} from "lucide-react";
import {
  getMentorCalendar,
  createMentorSession,
  updateMentorSession,
  setMentorSessionStatus,
  deleteMentorSession,
} from "@/lib/data/mentor";
import type { MentorSession, MentorClassOption, SessionStatus } from "@/lib/data/mentor.types";

const SESSION_TYPES = ["Tutoring", "Career Discussion", "Study Skills", "Check-in", "Workshop"];

const STATUS_LABEL: Record<SessionStatus, string> = {
  scheduled: "Scheduled",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_CHIP: Record<SessionStatus, string> = {
  scheduled: "bg-[#ffa313] text-white",
  in_progress: "bg-[#2f7df6] text-white",
  completed: "bg-[#16a34a] text-white",
  cancelled: "bg-[#e5e7eb] text-[#6b7280] line-through",
};

type Notice = { type: "success" | "error"; msg: string };
type FormState = { classId: string; title: string; date: string; startTime: string; endTime: string; location: string };
type Confirm = { kind: "cancel" | "delete"; session: MentorSession };

const emptyForm = (date = ""): FormState => ({
  classId: "",
  title: "",
  date,
  startTime: "16:00",
  endTime: "17:00",
  location: "",
});

const pad = (n: number) => String(n).padStart(2, "0");

// Calendar-grid dates are plain calendar days; build their keys from local
// date parts so a cell never shifts a day.
const formatLocalDate = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const parseYmd = (ymd: string) => {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d);
};

/** "HH:MM" + minutes, clamped to 23:59 (sessions don't cross midnight). */
const addMinutes = (hm: string, mins: number) => {
  const [h, m] = hm.split(":").map(Number);
  const total = Math.min(h * 60 + m + mins, 23 * 60 + 59);
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
};

const shortDay = (ymd: string) =>
  parseYmd(ymd).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

const longDay = (ymd: string) =>
  parseYmd(ymd).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4 font-poppins">
      <div className="max-h-[calc(100vh-32px)] w-full max-w-[670px] overflow-y-auto rounded-[8px] bg-white shadow-2xl">
        <div className="flex h-[85px] items-center justify-between border-b border-[#dddddd] px-[24px]">
          <h3 className="text-[24px] font-semibold leading-none text-[#2d3b4f]">{title}</h3>
          <button type="button" onClick={onClose} className="text-[#2d3b4f] transition hover:text-[#111111]" aria-label="Close modal">
            <X size={22} strokeWidth={1.8} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Errors are shown INSIDE the open modal. On the page they rendered behind the
// overlay, so a failed save looked like nothing happened.
const ModalError = ({ msg }: { msg: string }) =>
  msg ? <p className="mb-[16px] rounded-[8px] border border-red-200 bg-red-50 px-3 py-2 text-[14px] font-medium text-red-700">{msg}</p> : null;

const labelCls = "mb-[10px] block text-[16px] font-normal leading-none text-[#657183]";
const inputCls =
  "h-[43px] w-full rounded-[8px] border border-[#d6dce3] bg-white px-[10px] text-[16px] font-normal text-[#2d3b4f] outline-none placeholder:text-[#9aa3af] focus:border-[#ffa313]";

export default function CalendarSection() {
  const [sessions, setSessions] = useState<MentorSession[]>([]);
  const [classes, setClasses] = useState<MentorClassOption[]>([]);
  const [today, setToday] = useState(() => formatLocalDate(new Date()));
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<Notice | null>(null);

  const [view, setView] = useState<"Month" | "Week">("Month");
  const [anchor, setAnchor] = useState(() => new Date());

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<MentorSession | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [selected, setSelected] = useState<MentorSession | null>(null);
  const [detailError, setDetailError] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<Confirm | null>(null);

  const loadCalendar = async (): Promise<MentorSession[]> => {
    try {
      const res = await getMentorCalendar();
      setSessions(res.sessions);
      setClasses(res.classes);
      setToday(res.today);
      return res.sessions;
    } catch (e) {
      setNotice({ type: "error", msg: (e as Error).message });
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalendar();
  }, []);

  // Grid cells for the current Month or Week view (null = padding cell).
  const cells = useMemo(() => {
    if (view === "Week") {
      const start = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() - anchor.getDay());
      return Array.from({ length: 7 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
    }
    const year = anchor.getFullYear();
    const month = anchor.getMonth();
    const days: (Date | null)[] = [];
    const first = new Date(year, month, 1);
    for (let i = 0; i < first.getDay(); i++) days.push(null);
    for (let d = new Date(first); d.getMonth() === month; d = new Date(year, month, d.getDate() + 1)) days.push(d);
    return days;
  }, [anchor, view]);

  const byDate = useMemo(() => {
    const map = new Map<string, MentorSession[]>();
    for (const s of sessions) {
      const list = map.get(s.date) ?? [];
      list.push(s);
      map.set(s.date, list);
    }
    for (const list of map.values()) list.sort((a, b) => a.startIso.localeCompare(b.startIso));
    return map;
  }, [sessions]);

  // Only what's actually ahead: today onward and not finished/called off.
  // (This used to list every session ever, oldest first.)
  const upcoming = useMemo(
    () =>
      sessions
        .filter((s) => s.date >= today && (s.status === "scheduled" || s.status === "in_progress"))
        .sort((a, b) => a.startIso.localeCompare(b.startIso)),
    [sessions, today]
  );

  const heading = useMemo(() => {
    if (view === "Month") return anchor.toLocaleString("en-US", { month: "long", year: "numeric" });
    const first = cells[0] as Date;
    const last = cells[6] as Date;
    const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `${fmt(first)} – ${fmt(last)}, ${last.getFullYear()}`;
  }, [anchor, view, cells]);

  const shift = (dir: -1 | 1) =>
    setAnchor((a) =>
      view === "Month"
        ? new Date(a.getFullYear(), a.getMonth() + dir, 1)
        : new Date(a.getFullYear(), a.getMonth(), a.getDate() + dir * 7)
    );

  const goToday = () => setAnchor(parseYmd(today));

  const openCreate = (date?: string) => {
    setEditing(null);
    setForm(emptyForm(date ?? today));
    setFormError("");
    setFormOpen(true);
  };

  const openEdit = (s: MentorSession) => {
    setEditing(s);
    setForm({ classId: s.classId, title: s.title, date: s.date, startTime: s.startHm, endTime: s.endHm, location: s.location });
    setFormError("");
    setSelected(null);
    setFormOpen(true);
  };

  const openDetails = (s: MentorSession) => {
    setDetailError("");
    setSelected(s);
  };

  const validate = (f: FormState): string | null => {
    if (!f.classId) return "Please select a class.";
    if (!f.title.trim()) return "Please enter a session title.";
    if (!f.date) return "Please pick a date.";
    if (!f.startTime || !f.endTime) return "Please pick a start and end time.";
    if (f.endTime <= f.startTime) return "End time must be after the start time.";
    return null;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    const invalid = validate(form);
    if (invalid) {
      setFormError(invalid);
      return;
    }
    setFormError("");
    setSaving(true);
    let res: { error?: string };
    try {
      res = editing ? await updateMentorSession(editing.id, form) : await createMentorSession(form);
    } catch (err) {
      res = { error: (err as Error).message || "Something went wrong. Please try again." };
    } finally {
      setSaving(false);
    }
    if (res.error) {
      setFormError(res.error);
      return;
    }
    setFormOpen(false);
    setNotice({ type: "success", msg: editing ? "Session updated." : `Session scheduled for ${longDay(form.date)}.` });
    await loadCalendar();
    setAnchor(parseYmd(form.date)); // show the month/week the session landed in
  };

  const runAction = async (fn: () => Promise<{ error?: string }>, okMsg: string) => {
    if (busy) return;
    setBusy(true);
    setDetailError("");
    let res: { error?: string };
    try {
      res = await fn();
    } catch (err) {
      res = { error: (err as Error).message || "Something went wrong. Please try again." };
    } finally {
      setBusy(false);
    }
    if (res.error) {
      setDetailError(res.error);
      setConfirm(null);
      return;
    }
    setConfirm(null);
    setNotice({ type: "success", msg: okMsg });
    const fresh = await loadCalendar();
    setSelected((cur) => (cur ? fresh.find((s) => s.id === cur.id) ?? null : null));
  };

  const setStatus = (s: MentorSession, status: SessionStatus, okMsg: string) =>
    runAction(() => setMentorSessionStatus(s.id, status), okMsg);

  const active = (s: MentorSession) => s.status === "scheduled" || s.status === "in_progress";

  return (
    <div className="min-h-screen w-full bg-[#f4f4f4] px-4 pb-[26px] pt-[28px] font-poppins md:px-6">
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .calendar-container { padding: 0 !important; margin: 0 !important; width: 100% !important; }
        }
      `}</style>

      <div className="calendar-container">
        <div className="mb-[26px] flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[30px] font-bold leading-none tracking-[-0.02em] text-[#111111]">Calendar</h1>
            <p className="mt-[10px] text-[14px] font-normal leading-none text-[#666666]">
              Schedule and manage sessions · times in Pacific Time
            </p>
          </div>
          <div className="no-print flex flex-col gap-[10px] sm:flex-row">
            <button type="button" onClick={() => window.print()} className="flex h-[41px] items-center justify-center gap-[9px] rounded-[9px] border border-[#d6d6d6] bg-white px-[24px] text-[14px] font-semibold text-[#111111] transition hover:bg-[#f7f7f7]">
              <Download size={16} strokeWidth={2} /> Export
            </button>
            <button type="button" onClick={() => openCreate()} className="flex h-[41px] items-center justify-center gap-[9px] rounded-[9px] bg-[#ffa313] px-[27px] text-[14px] font-semibold text-white transition hover:bg-[#f59a0d]">
              <Plus size={17} strokeWidth={2} /> New Session
            </button>
          </div>
        </div>

        {notice && (
          <div
            className={`no-print mb-[16px] flex items-start justify-between gap-4 rounded-[8px] border px-4 py-3 text-[14px] font-semibold ${
              notice.type === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            <span>{notice.msg}</span>
            <button type="button" onClick={() => setNotice(null)} className="shrink-0 text-[13px] underline">Dismiss</button>
          </div>
        )}

        <div className="mb-[25px] flex min-h-[73px] flex-col gap-4 rounded-[8px] border border-[#dddddd] bg-white px-[24px] py-[16px] lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-[21px]">
            <button type="button" onClick={() => shift(-1)} className="no-print text-[#111111]" aria-label={`Previous ${view.toLowerCase()}`}>
              <ChevronLeft size={24} strokeWidth={2} />
            </button>
            <h2 className="min-w-[202px] text-[22px] font-semibold leading-none text-[#111111]">{heading}</h2>
            <button type="button" onClick={() => shift(1)} className="no-print text-[#111111]" aria-label={`Next ${view.toLowerCase()}`}>
              <ChevronRight size={24} strokeWidth={2} />
            </button>
          </div>
          <div className="no-print flex gap-[9px]">
            <button type="button" onClick={goToday} className="h-[41px] rounded-[9px] border border-[#d6d6d6] bg-white px-[18px] text-[14px] font-semibold text-[#666666] transition hover:bg-[#f7f7f7]">
              Today
            </button>
            <div className="relative">
              <select
                value={view}
                onChange={(e) => setView(e.target.value as "Month" | "Week")}
                className="h-[41px] w-[140px] appearance-none rounded-[9px] bg-[#ffa313] px-[16px] pr-[38px] text-[14px] font-semibold text-white outline-none"
                aria-label="Calendar view"
              >
                <option value="Month" className="bg-white text-[#111111]">Month</option>
                <option value="Week" className="bg-white text-[#111111]">Week</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-[14px] top-1/2 -translate-y-1/2 text-white" size={18} strokeWidth={1.8} />
            </div>
          </div>
        </div>

        <div className="mb-[25px] overflow-x-auto rounded-[8px] border border-[#dddddd] bg-white px-[24px] pb-[24px] pt-[35px]">
          <div className="grid min-w-[700px] grid-cols-7 gap-[8px]">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="pb-[17px] text-center text-[16px] font-normal leading-none text-[#666666]">{day}</div>
            ))}
            {cells.map((date, idx) => {
              const dateStr = date ? formatLocalDate(date) : "";
              const daySessions = date ? byDate.get(dateStr) ?? [] : [];
              const isToday = dateStr === today;
              return (
                <div
                  key={`${dateStr || "empty"}-${idx}`}
                  onClick={date ? () => openCreate(dateStr) : undefined}
                  title={date ? "Click an empty spot to schedule a session on this day" : undefined}
                  className={`${view === "Week" ? "min-h-[260px]" : "min-h-[121px]"} rounded-[8px] border border-[#dddddd] px-[10px] py-[12px] ${
                    date ? "cursor-pointer bg-white hover:bg-[#fffaf0]" : "bg-[#f6f7f8]"
                  }`}
                >
                  {date && (
                    <>
                      <span className={`mb-[8px] flex h-[32px] w-[32px] items-center justify-center text-[16px] font-normal leading-none ${isToday ? "rounded-full bg-[#ffa313] text-white" : "text-[#111111]"}`}>
                        {date.getDate()}
                      </span>
                      <div className="space-y-[4px]">
                        {daySessions.map((s) => (
                          <button
                            type="button"
                            key={s.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              openDetails(s);
                            }}
                            className={`block w-full truncate rounded-[4px] px-[8px] py-[6px] text-left text-[12px] font-normal ${STATUS_CHIP[s.status]}`}
                            title={`${s.time} ${s.title}`}
                          >
                            <span className="font-semibold">{s.time}</span> {s.title}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-[8px] border border-[#dddddd] bg-white px-[24px] pb-[23px] pt-[27px]">
          <h3 className="mb-[19px] text-[22px] font-semibold leading-none text-[#111111]">Upcoming Sessions</h3>
          <div className="space-y-[12px]">
            {loading && <p className="py-[16px] text-[14px] text-[#666666]">Loading sessions...</p>}
            {!loading && upcoming.length === 0 && (
              <p className="py-[16px] text-[14px] text-[#666666]">
                No upcoming sessions. Click <span className="font-semibold">New Session</span> or a day on the calendar to schedule one.
              </p>
            )}
            {upcoming.map((s) => (
              <div key={s.id} className="flex min-h-[80px] items-center justify-between gap-3 rounded-[8px] border border-[#dddddd] bg-white px-[16px] py-[10px]">
                <div className="flex min-w-0 items-center gap-[16px]">
                  <div className="flex h-[54px] w-[52px] shrink-0 flex-col items-center justify-center rounded-[9px] bg-[#ffa313] leading-none text-white">
                    <span className="text-[11px] uppercase">{parseYmd(s.date).toLocaleDateString("en-US", { month: "short" })}</span>
                    <span className="mt-[3px] text-[18px] font-semibold">{parseYmd(s.date).getDate()}</span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="truncate text-[15px] font-semibold leading-none text-[#111111]">
                      {s.title}
                      {s.status === "in_progress" && <span className="ml-2 rounded-full bg-[#2f7df6] px-2 py-[2px] text-[11px] font-medium text-white">In Progress</span>}
                    </h4>
                    <p className="mt-[7px] text-[12px] font-normal leading-[1.4] text-[#666666]">
                      {shortDay(s.date)} · {s.time} – {s.endTime}
                      <br />
                      {s.className}
                      {s.location ? ` · ${s.location}` : ""}
                    </p>
                  </div>
                </div>
                <button type="button" onClick={() => openDetails(s)} className="no-print h-[39px] shrink-0 rounded-[8px] border border-[#dddddd] bg-white px-[18px] text-[14px] font-normal text-[#666666] transition hover:bg-[#f7f7f7]">
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---- Create / edit ---- */}
      <Modal isOpen={formOpen} onClose={() => !saving && setFormOpen(false)} title={editing ? "Edit Session" : "Schedule New Session"}>
        <form onSubmit={handleSave} noValidate>
          <div className="px-[24px] pb-[30px] pt-[28px]">
            <ModalError msg={formError} />
            <div className="mb-[16px]">
              <label className={labelCls}>Class<span className="text-[#ff4d4f]">*</span></label>
              <div className="relative">
                <select value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value })} className={`${inputCls} appearance-none pr-[42px] text-[#666666]`}>
                  <option value="">{classes.length ? "Select a class..." : "No classes available"}</option>
                  {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-[13px] top-1/2 -translate-y-1/2 text-[#657183]" size={20} strokeWidth={1.8} />
              </div>
              {classes.length === 0 && (
                <p className="mt-[6px] text-[12px] text-[#999999]">No classes exist yet — ask an administrator to create one.</p>
              )}
            </div>
            <div className="mb-[16px]">
              <label className={labelCls}>Session Title<span className="text-[#ff4d4f]">*</span></label>
              <input list="mentor-session-types" maxLength={120} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g., Career Discussion" className={`${inputCls} px-[13px]`} />
              <datalist id="mentor-session-types">
                {SESSION_TYPES.map((type) => <option key={type} value={type} />)}
              </datalist>
            </div>
            <div className="mb-[17px] grid grid-cols-1 gap-[16px] sm:grid-cols-3">
              <div>
                {/* A real date picker. The old free-text box said DD/MM/YYYY but
                    the server parsed US-style, so 05/06 silently became May 6. */}
                <label className={labelCls}>Date<span className="text-[#ff4d4f]">*</span></label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Start<span className="text-[#ff4d4f]">*</span></label>
                <input
                  type="time"
                  value={form.startTime}
                  onChange={(e) => {
                    const startTime = e.target.value;
                    // Keep the length when the start moves (1 h default).
                    setForm((f) => ({
                      ...f,
                      startTime,
                      endTime: startTime && (!f.endTime || f.endTime <= startTime) ? addMinutes(startTime, 60) : f.endTime,
                    }));
                  }}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>End<span className="text-[#ff4d4f]">*</span></label>
                <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className={inputCls} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Location</label>
              <div className="relative">
                <MapPin className="absolute left-[13px] top-1/2 -translate-y-1/2 text-[#657183]" size={20} strokeWidth={1.8} />
                <input type="text" value={form.location} placeholder="e.g., Library Room 301, Virtual Meeting" onChange={(e) => setForm({ ...form, location: e.target.value })} className={`${inputCls} pl-[41px]`} />
              </div>
            </div>
            <p className="mt-[14px] text-[12px] text-[#999999]">Times are Pacific Time, the class&apos;s local time.</p>
          </div>
          <div className="flex h-[88px] items-center justify-end gap-[12px] border-t border-[#dddddd] px-[24px]">
            <button type="button" disabled={saving} onClick={() => setFormOpen(false)} className="h-[38px] rounded-[8px] border border-[#d6dce3] bg-white px-[21px] text-[14px] font-semibold text-[#2d3b4f] transition hover:bg-[#f7f8fa] disabled:opacity-60">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex h-[38px] items-center justify-center gap-[7px] rounded-[8px] bg-[#ffa313] px-[23px] text-[14px] font-semibold text-white transition hover:bg-[#f59a0d] disabled:opacity-60">
              <CalendarIcon size={16} strokeWidth={1.8} />
              {saving ? "Saving…" : editing ? "Save Changes" : "Create Session"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ---- Details ---- */}
      <Modal isOpen={!!selected} onClose={() => !busy && setSelected(null)} title="Session Details">
        {selected && (
          <>
            <div className="px-[24px] pb-[24px] pt-[25px]">
              <ModalError msg={detailError} />
              <div className="mb-[20px] space-y-[17px]">
                <div className="flex items-start gap-[13px]">
                  <User size={21} strokeWidth={1.8} className="mt-[2px] shrink-0 text-[#657183]" />
                  <div>
                    <p className="text-[13px] font-normal leading-none text-[#657183]">Session</p>
                    <p className="mt-[7px] text-[15px] font-normal leading-none text-[#2d3b4f]">{selected.title}</p>
                  </div>
                </div>
                <div className="flex items-start gap-[13px]">
                  <Clock size={21} strokeWidth={1.8} className="mt-[1px] shrink-0 text-[#657183]" />
                  <div>
                    <p className="text-[13px] font-normal leading-none text-[#657183]">Date &amp; Time</p>
                    <p className="mt-[7px] text-[15px] font-normal leading-[1.25] text-[#2d3b4f]">
                      {longDay(selected.date)}
                      <br />
                      {selected.time} – {selected.endTime} (Pacific)
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-[13px]">
                  <MapPin size={21} strokeWidth={1.8} className="mt-[1px] shrink-0 text-[#657183]" />
                  <div>
                    <p className="text-[13px] font-normal leading-none text-[#657183]">Location</p>
                    <p className="mt-[7px] text-[15px] font-normal leading-none text-[#2d3b4f]">{selected.location || "Not set"}</p>
                  </div>
                </div>
              </div>
              <div className="border-y border-[#dddddd] py-[19px]">
                <p className="mb-[10px] text-[13px] font-normal leading-none text-[#657183]">Class</p>
                <span className="inline-flex h-[28px] items-center rounded-full bg-[#ffa313] px-[12px] text-[16px] font-normal leading-none text-white">{selected.className || "—"}</span>
              </div>
              <div className="pt-[20px]">
                <p className="mb-[13px] text-[13px] font-normal leading-none text-[#657183]">Status</p>
                <span className={`inline-flex rounded-full px-[12px] py-[5px] text-[14px] leading-none ${STATUS_CHIP[selected.status]}`}>{STATUS_LABEL[selected.status]}</span>
                {selected.hasAttendance && <p className="mt-[10px] text-[12px] text-[#999999]">Attendance has been recorded for this session.</p>}
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-[10px] border-t border-[#dddddd] px-[24px] py-[20px]">
              {(selected.status === "scheduled" || selected.status === "cancelled") && !selected.hasAttendance && (
                <button type="button" disabled={busy} onClick={() => setConfirm({ kind: "delete", session: selected })} className="mr-auto flex h-[39px] items-center gap-[6px] rounded-[8px] px-[10px] text-[14px] font-semibold text-[#d80808] transition hover:bg-red-50 disabled:opacity-60">
                  <Trash2 size={16} /> Delete
                </button>
              )}
              {active(selected) && (
                <>
                  <button type="button" disabled={busy} onClick={() => setConfirm({ kind: "cancel", session: selected })} className="h-[39px] rounded-[8px] border border-[#d6dce3] bg-white px-[16px] text-[14px] font-semibold text-[#d80808] transition hover:bg-red-50 disabled:opacity-60">
                    Cancel Session
                  </button>
                  <button type="button" disabled={busy} onClick={() => openEdit(selected)} className="flex h-[39px] items-center gap-[6px] rounded-[8px] border border-[#d6dce3] bg-white px-[16px] text-[14px] font-semibold text-[#2d3b4f] transition hover:bg-[#f7f8fa] disabled:opacity-60">
                    <Pencil size={15} /> Edit
                  </button>
                </>
              )}
              {selected.status === "scheduled" && (
                <button type="button" disabled={busy} onClick={() => setStatus(selected, "in_progress", "Session started.")} className="h-[39px] rounded-[8px] bg-[#ffa313] px-[18px] text-[14px] font-semibold text-white transition hover:bg-[#f59a0d] disabled:opacity-60">
                  {busy ? "Working…" : "Start Session"}
                </button>
              )}
              {selected.status === "in_progress" && (
                <button type="button" disabled={busy} onClick={() => setStatus(selected, "completed", "Session marked complete.")} className="h-[39px] rounded-[8px] bg-[#16a34a] px-[18px] text-[14px] font-semibold text-white transition hover:bg-[#12893e] disabled:opacity-60">
                  {busy ? "Working…" : "Mark Complete"}
                </button>
              )}
              {!active(selected) && (
                <button type="button" onClick={() => setSelected(null)} className="h-[39px] rounded-[8px] border border-[#d6dce3] bg-white px-[22px] text-[14px] font-semibold text-[#2d3b4f] transition hover:bg-[#f7f8fa]">
                  Close
                </button>
              )}
            </div>
          </>
        )}
      </Modal>

      {/* ---- Confirm cancel / delete ---- */}
      {confirm && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4 font-poppins">
          <div className="w-full max-w-[400px] rounded-[10px] bg-white p-6 shadow-xl">
            <h2 className="text-[20px] font-semibold text-[#111111]">{confirm.kind === "delete" ? "Delete session?" : "Cancel session?"}</h2>
            <p className="mt-3 text-[15px] leading-6 text-[#666666]">
              {confirm.kind === "delete"
                ? `"${confirm.session.title}" on ${shortDay(confirm.session.date)} will be removed permanently.`
                : `"${confirm.session.title}" on ${shortDay(confirm.session.date)} will be marked cancelled. Students will no longer be able to check in to it at the kiosk.`}
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  confirm.kind === "delete"
                    ? runAction(() => deleteMentorSession(confirm.session.id), "Session deleted.")
                    : setStatus(confirm.session, "cancelled", "Session cancelled.")
                }
                className="h-[42px] flex-1 rounded-[8px] bg-[#d80808] text-[15px] font-semibold text-white hover:bg-[#c40707] disabled:opacity-70"
              >
                {busy ? "Working…" : confirm.kind === "delete" ? "Delete" : "Cancel Session"}
              </button>
              <button type="button" disabled={busy} onClick={() => setConfirm(null)} className="h-[42px] flex-1 rounded-[8px] border border-[#d6d6d6] bg-white text-[15px] font-semibold text-[#666666] hover:bg-[#f7f7f7] disabled:opacity-60">
                Keep
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
