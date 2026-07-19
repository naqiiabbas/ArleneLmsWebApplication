"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Info,
  MapPin,
  MessageSquare,
  Video,
  X,
} from "lucide-react";
import { getStudentDashboard, submitAbsenceReport } from "@/lib/data/student";
import type { StudentDashboard } from "@/lib/data/student.types";

type StatMeta = {
  id: string;
  title: string;
  iconBg: string;
  icon: React.ReactNode;
};

type QuickAction = {
  id: string;
  label: string;
  href: string;
  color: string;
  icon: React.ReactNode;
  isButton?: boolean;
};

type SessionModalData = import("@/lib/data/student.types").StudentTodaySession;

const STAT_META: StatMeta[] = [
  {
    id: "attendance",
    title: "Attendance Rate",
    iconBg: "bg-[#10c79a]",
    icon: <img src="/images/student-overview-trend-icon.svg" alt="" className="h-[48px] w-[48px]" />,
  },
  {
    id: "upcoming",
    title: "Upcoming Sessions",
    iconBg: "bg-[#1976d2]",
    icon: <img src="/images/student-overview-calendar-icon.svg" alt="" className="h-[48px] w-[48px]" />,
  },
  {
    id: "tasks",
    title: "Pending Tasks",
    iconBg: "bg-[#ffc247]",
    icon: <img src="/images/student-overview-check-icon.svg" alt="" className="h-[48px] w-[48px]" />,
  },
];

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "upload",
    label: "Upload Document",
    href: "/studentpanel/document",
    color: "bg-[#1976d2]",
    icon: <img src="/images/student-upload-icon.svg" alt="" className="h-[48px] w-[48px]" />,
  },
  {
    id: "absence",
    label: "Report Absence",
    href: "#",
    color: "bg-[#ff5a5a]",
    icon: <Info className="h-[20px] w-[20px] text-white" strokeWidth={2.2} />,
    isButton: true,
  },
  {
    id: "messages",
    label: "Open Messages",
    href: "/studentpanel/messages/",
    color: "bg-[#6514df]",
    icon: <img src="/images/student-message-icon.svg" alt="" className="h-[48px] w-[48px]" />,
  },
  {
    id: "calendar",
    label: "View Calendar",
    href: "/studentpanel/calendar/",
    color: "bg-[#10c79a]",
    icon: <img src="/images/student-calendar-green-icon.svg" alt="" className="h-[48px] w-[48px]" />,
  },
];

function StatCard({ item, value, subtitle }: { item: StatMeta; value: string; subtitle: string }) {
  return (
    <article className="h-[126px] rounded-[12px] border border-[#dddddd] bg-white px-[20px] py-[20px]">
      <div className="flex items-start justify-between">
        <div className="flex h-[48px] w-[48px] items-center justify-center rounded-[10px]">
          {item.icon}
        </div>
        <p className="text-[26px] font-medium leading-none text-[#111111]">{value}</p>
      </div>
      <p className="mt-[13px] text-[15px] font-semibold leading-none text-[#666666]">{item.title}</p>
      <p className="mt-[9px] text-[13px] font-normal leading-none text-[#9a9a9a]">{subtitle}</p>
    </article>
  );
}

function QuickActionCard({
  action,
  onReportAbsence,
}: {
  action: QuickAction;
  onReportAbsence: () => void;
}) {
  const body = (
    <div className="flex h-[78px] items-center gap-[12px] rounded-[12px] border border-[#dddddd] bg-white px-[20px] transition hover:bg-white">
      <span className={`flex h-[48px] w-[48px] shrink-0 items-center justify-center overflow-hidden rounded-[10px] ${action.color}`}>{action.icon}</span>
      <span className="text-[15px] font-semibold leading-tight text-[#111111]">{action.label}</span>
    </div>
  );

  if (action.isButton) {
    return (
      <button type="button" onClick={onReportAbsence} className="w-full text-left">
        {body}
      </button>
    );
  }

  return <Link href={action.href}>{body}</Link>;
}

function SessionDetailsModal({
  isOpen,
  onClose,
  data,
}: {
  isOpen: boolean;
  onClose: () => void;
  data: SessionModalData | null;
}) {
  if (!isOpen || !data) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-black/35 p-4"
      onClick={onClose}
    >
      <div
        className="my-auto flex max-h-[calc(100vh-32px)] w-full max-w-[530px] flex-col overflow-hidden rounded-[16px] bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="min-h-0 flex-1 overflow-y-auto px-[24px] pb-[14px] pt-[18px]">
          <h3 className="text-[18px] font-medium leading-[1.35] text-[#111111]">{data.title}</h3>
          <p className="mt-[9px] text-[13px] font-normal leading-[1.45] text-[#767676]">
            with {data.mentorName}
          </p>

          <div className="mt-[16px] space-y-[13px]">
            <div className="flex h-[62px] items-center gap-[12px] rounded-[8px] bg-[#f4f4f4] px-[14px]">
              <Clock className="h-[15px] w-[15px] shrink-0 text-[#ffa313]" strokeWidth={2} />
              <div>
                <p className="text-[12px] font-normal leading-[1.15] text-[#777777]">Time</p>
                <p className="mt-[5px] text-[14px] font-normal leading-none text-[#111111]">{data.time}</p>
              </div>
            </div>
            <div className="flex h-[62px] items-center gap-[12px] rounded-[8px] bg-[#f4f4f4] px-[14px]">
              <MapPin className="h-[15px] w-[15px] shrink-0 text-[#ffa313]" strokeWidth={2} />
              <div>
                <p className="text-[12px] font-normal leading-[1.15] text-[#777777]">Location</p>
                <p className="mt-[5px] text-[14px] font-normal leading-none text-[#111111]">{data.location}</p>
              </div>
            </div>
            <div className="flex h-[62px] items-center gap-[12px] rounded-[8px] bg-[#f4f4f4] px-[14px]">
              <Video className="h-[15px] w-[15px] shrink-0 text-[#ffa313]" strokeWidth={2} />
              <div>
                <p className="text-[12px] font-normal leading-[1.15] text-[#777777]">Type</p>
                <p className="mt-[5px] text-[14px] font-normal leading-none text-[#111111]">{data.type}</p>
              </div>
            </div>
          </div>

        </div>

        <div className="shrink-0 bg-white px-[24px] pb-[15px] pt-[5px]">
          <div className="flex gap-[10px]">
            <button
              type="button"
              onClick={onClose}
              className="h-[41px] flex-1 rounded-[8px] border border-[#e5e5e5] px-4 text-[13px] font-normal text-[#666666] transition hover:bg-gray-50"
            >
              Close
            </button>
            <button
              type="button"
              className="h-[41px] flex-1 rounded-[8px] bg-[#ffa313] px-4 text-[13px] font-normal text-white transition hover:bg-[#f59a0d]"
            >
              Join Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportAbsenceModal({
  isOpen,
  onClose,
  form,
  setForm,
  onSubmit,
  submitting,
  error,
}: {
  isOpen: boolean;
  onClose: () => void;
  form: { date: string; reason: string; notes: string };
  setForm: (f: { date: string; reason: string; notes: string }) => void;
  onSubmit: () => void;
  submitting: boolean;
  error: string | null;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto bg-black/35 p-4" onClick={onClose}>
      <div
        className="my-auto w-full max-w-[512px] rounded-[10px] bg-white px-[32px] pb-[32px] pt-[32px] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-[12px]">
            <span className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[9px] bg-[#ff5f64]">
              <Info className="h-[20px] w-[20px] text-white" strokeWidth={2.4} />
            </span>
            <h3 className="text-[22px] font-normal leading-none text-[#111111]">Report Absence</h3>
          </div>
          <button type="button" onClick={onClose} className="mt-[13px] text-[#666666] transition hover:text-[#111111]" aria-label="Close report absence modal">
            <X className="h-[20px] w-[20px]" strokeWidth={2} />
          </button>
        </div>

        <p className="mt-[24px] max-w-[405px] text-[15px] font-normal leading-[1.35] text-[#666666]">
          Please fill out this form to report your absence. Your mentor will be notified automatically.
        </p>

        {error && (
          <div className="mt-[16px] rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-semibold text-red-700">
            {error}
          </div>
        )}

        <div className="mt-[27px] space-y-[24px]">
          <div>
            <label className="mb-[9px] block text-[15px] font-normal leading-none text-[#666666]">
              Date of Absence <span className="text-[#ff5f64]">*</span>
            </label>
            <input
              type="text"
              placeholder="MM/DD/YYYY"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="h-[44px] w-full rounded-[9px] border border-[#dddddd] bg-white px-[10px] text-[16px] font-normal text-[#111111] outline-none transition placeholder:text-[#8a8a8a] focus:border-[#ff5f64]"
            />
          </div>
          <div>
            <label className="mb-[9px] block text-[15px] font-normal leading-none text-[#666666]">
              Reason for Absence <span className="text-[#ff5f64]">*</span>
            </label>
            <select
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              className="h-[44px] w-full rounded-[9px] border border-[#dddddd] bg-white px-[10px] text-[16px] font-normal text-[#111111] outline-none transition focus:border-[#ff5f64]"
            >
              <option value="" disabled>Select a reason...</option>
              <option>Medical Issue</option>
              <option>Family Emergency</option>
              <option>Personal Reasons</option>
              <option>Academic Conflict</option>
            </select>
          </div>
          <div>
            <label className="mb-[11px] block text-[15px] font-normal leading-none text-[#666666]">
              Additional Notes (Optional)
            </label>
            <textarea
              placeholder="Provide any additional details..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="h-[122px] w-full resize-none rounded-[9px] border border-[#dddddd] bg-white px-[15px] py-[14px] text-[16px] font-normal text-[#111111] outline-none transition placeholder:text-[#8a8a8a] focus:border-[#ff5f64]"
            />
          </div>
        </div>

        <div className="mt-[27px] grid grid-cols-1 gap-[12px] sm:grid-cols-2">
          <button
            type="button"
            onClick={onClose}
            className="h-[49px] rounded-[9px] border border-[#dddddd] bg-white px-4 text-[16px] font-normal text-[#666666] transition hover:bg-[#fafafa]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="h-[49px] rounded-[9px] bg-[#ff6467] px-4 text-[16px] font-normal text-white transition hover:bg-[#ff5a5f] disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Submit Report"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Studentpanel() {
  const [data, setData] = useState<StudentDashboard | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(() => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), 1); });
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAbsenceModalOpen, setIsAbsenceModalOpen] = useState(false);
  const [absenceForm, setAbsenceForm] = useState({ date: "", reason: "", notes: "" });
  const [absenceSubmitting, setAbsenceSubmitting] = useState(false);
  const [absenceError, setAbsenceError] = useState<string | null>(null);

  const loadDashboard = () => {
    getStudentDashboard()
      .then(setData)
      .catch((e) => setNotice((e as Error).message));
  };

  useEffect(loadDashboard, []);

  const events = data?.calendarEvents ?? [];

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    return { firstDay, totalDays };
  }, [currentDate]);

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const getEventForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.find((event) => event.date === dateStr);
  };

  const selectedEvent = getEventForDay(selectedDate.getDate());

  const statValues: Record<string, { value: string; subtitle: string }> = {
    attendance: {
      value: `${data?.stats.attendancePct ?? 0}%`,
      subtitle: `${data?.stats.attendedSessions ?? 0} of ${data?.stats.totalSessions ?? 0} sessions`,
    },
    upcoming: { value: `${data?.stats.upcomingCount ?? 0}`, subtitle: "This week" },
    tasks: {
      value: `${data?.stats.pendingTasks ?? 0}`,
      subtitle: `${data?.stats.urgentTasks ?? 0} urgent`,
    },
  };

  const handleSubmitAbsence = async () => {
    if (absenceSubmitting) return;
    setAbsenceSubmitting(true);
    setAbsenceError(null);
    const res = await submitAbsenceReport(absenceForm);
    setAbsenceSubmitting(false);
    if (res.error) {
      setAbsenceError(res.error);
      return;
    }
    setIsAbsenceModalOpen(false);
    setAbsenceForm({ date: "", reason: "", notes: "" });
    loadDashboard();
  };

  return (
    <div className="min-h-full w-full overflow-x-hidden bg-[#f5f5f5] px-4 pb-6 pt-5 font-sans md:px-6">
      <div className="w-full space-y-[22px]">
        {notice && (
          <div className="rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-semibold text-red-700">
            {notice}
          </div>
        )}

        <section>
          <h2 className="mb-[12px] text-[20px] font-semibold leading-none text-[#111111]">Overview</h2>
          <div className="grid grid-cols-1 gap-[14px] md:grid-cols-3">
            {STAT_META.map((item) => (
              <StatCard
                key={item.id}
                item={item}
                value={statValues[item.id]?.value ?? "0"}
                subtitle={statValues[item.id]?.subtitle ?? ""}
              />
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-[12px] text-[20px] font-semibold leading-none text-[#111111]">Today's Session</h2>
          <div className="min-h-[198px] rounded-[12px] border border-[#dddddd] bg-white px-[20px] py-[20px]">
            {data?.todaySession ? (
              <div className="flex h-full flex-col justify-between">
                <div className="flex items-start gap-[14px]">
                  <div className="relative h-[64px] w-[64px] shrink-0 overflow-hidden rounded-[12px]">
                    <Image
                      src="/images/student-session-icon.png"
                      alt=""
                      fill
                      sizes="64px"
                      className="object-contain"
                      priority
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[16px] font-bold leading-tight text-[#111111]">{data.todaySession.title}</h3>
                    <p className="mt-[10px] text-[14px] font-normal leading-none text-[#777777]">with {data.todaySession.mentorName}</p>
                    <div className="mt-[12px] flex flex-wrap items-center gap-x-[12px] gap-y-[8px] text-[13px] font-normal leading-none text-[#777777]">
                      <span className="flex items-center gap-[6px]">
                        <Clock className="h-[15px] w-[15px]" strokeWidth={2} />
                        {data.todaySession.time}
                      </span>
                      <span className="flex items-center gap-[6px]">
                        <MapPin className="h-[15px] w-[15px]" strokeWidth={2} />
                        {data.todaySession.location}
                      </span>
                    </div>
                    <span className="mt-[12px] inline-flex rounded-[8px] bg-[#fff0cf] px-[9px] py-[5px] text-[13px] font-normal leading-none text-[#f0a21b]">
                      {data.todaySession.type}
                    </span>
                  </div>
                </div>

                <div className="mt-[20px] grid grid-cols-1 gap-[12px] sm:grid-cols-2">
                  <button
                    type="button"
                    className="h-[46px] rounded-[8px] bg-[#ffa313] px-4 text-[15px] font-semibold text-black transition hover:bg-[#ffa313]"
                  >
                    Join Session
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDetailsModalOpen(true)}
                    className="h-[46px] rounded-[8px] bg-[#f4f4f4] px-4 text-[15px] font-normal text-[#111111] transition hover:bg-[#f4f4f4]"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex h-[158px] items-center justify-center text-[15px] text-[#777777]">
                No sessions scheduled for today.
              </div>
            )}
          </div>
        </section>

        <section>
          <h2 className="mb-[12px] text-[20px] font-semibold leading-none text-[#111111]">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2 xl:grid-cols-4">
            {QUICK_ACTIONS.map((action) => (
              <QuickActionCard
                key={action.id}
                action={action}
                onReportAbsence={() => setIsAbsenceModalOpen(true)}
              />
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-[16px] xl:grid-cols-[1.05fr_1fr]">
          <div className="rounded-[12px] border border-[#dddddd] bg-white px-[20px] py-[22px] xl:min-h-[455px]">
            <div className="mb-[28px] flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-[9px] text-[18px] font-normal leading-none text-[#111111]">
                <MessageSquare className="h-[18px] w-[18px] text-[#ffa313]" strokeWidth={2} />
                Recent Messages
              </h2>
              <Link href="/studentpanel/messages/" className="shrink-0 text-[13px] font-normal leading-none text-[#ffa313] hover:underline">
                View All &rarr;
              </Link>
            </div>

            <div className="space-y-[18px]">
              {(data?.messages.length ?? 0) === 0 && (
                <p className="text-[13px] text-[#777777]">No messages yet.</p>
              )}
              {data?.messages.map((msg) => (
                <Link
                  key={msg.id}
                  href="/studentpanel/messages/"
                  className="flex items-start justify-between border-b border-[#d9d9d9] pb-[15px] last:border-b-0 transition hover:bg-white"
                >
                  <div className="flex min-w-0 items-center gap-[12px]">
                    <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-[#ffa313] text-[13px] font-semibold text-white">
                      {msg.avatar}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-semibold leading-none text-[#111111]">{msg.sender}</p>
                      <p className="mt-[7px] truncate text-[13px] font-normal leading-none text-[#111111]">{msg.text}</p>
                    </div>
                  </div>
                  <div className="ml-[10px] flex shrink-0 items-center gap-[10px] pt-[3px]">
                    <span className="text-[12px] font-normal leading-none text-[#777777]">{msg.time}</span>
                    {msg.hasUpdate && <span className="h-[7px] w-[7px] rounded-full bg-[#ff5a5f]" />}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-[12px] border border-[#dddddd] bg-white px-[20px] py-[22px] xl:min-h-[455px]">
            <div className="mb-[22px] flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-[9px] text-[18px] font-normal leading-none text-[#111111]">
                <Calendar className="h-[18px] w-[18px] text-[#ffa313]" strokeWidth={2} />
                Calendar
              </h2>
              <div className="flex shrink-0 items-center gap-[10px] text-[13px] font-normal leading-none text-[#777777]">
                <button type="button" onClick={() => changeMonth(-1)} className="p-0 hover:text-[#777777]">
                  <ChevronLeft className="h-[15px] w-[15px]" strokeWidth={2} />
                </button>
                <span className="font-normal">
                  {currentDate.toLocaleString("default", { month: "long" })} {currentDate.getFullYear()}
                </span>
                <button type="button" onClick={() => changeMonth(1)} className="p-0 hover:text-[#777777]">
                  <ChevronRight className="h-[15px] w-[15px]" strokeWidth={2} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-[7px] text-center">
              {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                <div key={`${day}-${index}`} className="pb-[9px] text-[12px] font-normal leading-none text-[#777777]">
                  {day}
                </div>
              ))}

              {Array.from({ length: daysInMonth.firstDay }).map((_, idx) => (
                <div key={`off-${idx}`} />
              ))}

              {Array.from({ length: daysInMonth.totalDays }).map((_, idx) => {
                const day = idx + 1;
                const event = getEventForDay(day);
                const isSelected =
                  selectedDate.getDate() === day &&
                  selectedDate.getMonth() === currentDate.getMonth() &&
                  selectedDate.getFullYear() === currentDate.getFullYear();

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() =>
                      setSelectedDate(
                        new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
                      )
                    }
                    className={`relative mx-auto flex aspect-square w-full max-w-[48px] items-center justify-center rounded-[8px] border text-[13px] font-normal transition ${
                      isSelected
                        ? "border-[#ffa313] bg-[#ffa313] text-white"
                        : "border-[#dddddd] bg-white text-[#111111] hover:bg-white"
                    }`}
                  >
                    {day}
                    {event && (
                      <span
                        className={`absolute bottom-[6px] h-[3px] w-[3px] rounded-full ${
                          isSelected ? "bg-white" : "bg-[#ffa313]"
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-[14px] border-t border-[#eeeeee] pt-[14px]">
              <p className="mb-[10px] text-[12px] font-normal leading-none text-[#777777]">
                Events on {selectedDate.toLocaleString("default", { month: "short" })} {selectedDate.getDate()}
              </p>
              {selectedEvent ? (
                <div className="min-h-[56px] rounded-[8px] bg-[#f4f4f4] px-[12px] py-[13px]">
                  <p className="text-[14px] font-normal leading-none text-[#111111]">
                    <span className="mr-[8px] inline-block h-[8px] w-[8px] rounded-full bg-[#ffa313] align-middle" />
                    {selectedEvent.title}
                  </p>
                  <p className="mt-[7px] pl-[18px] text-[12px] font-normal leading-none text-[#777777]">{selectedEvent.time}</p>
                </div>
              ) : (
                <p className="text-[13px] text-[#777777]">No events scheduled.</p>
              )}
            </div>
          </div>
        </section>
      </div>

      <SessionDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        data={data?.todaySession ?? null}
      />
      <ReportAbsenceModal
        isOpen={isAbsenceModalOpen}
        onClose={() => setIsAbsenceModalOpen(false)}
        form={absenceForm}
        setForm={setAbsenceForm}
        onSubmit={handleSubmitAbsence}
        submitting={absenceSubmitting}
        error={absenceError}
      />
    </div>
  );
}

