"use client";

import React, { useMemo, useState } from "react";
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

type StatCardData = {
  id: string;
  title: string;
  value: string;
  subtitle: string;
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

type MessageItem = {
  id: string;
  sender: string;
  text: string;
  time: string;
  image: string;
  hasUpdate?: boolean;
};

type SessionModalData = {
  title: string;
  mentorName: string;
  time: string;
  location: string;
  type: string;
  description: string;
  agenda: string[];
};

const STATS: StatCardData[] = [
  {
    id: "attendance",
    title: "Attendance Rate",
    value: "92%",
    subtitle: "23 of 25 sessions",
    iconBg: "bg-[#10c79a]",
    icon: <img src="/images/student-overview-trend-icon.svg" alt="" className="h-[48px] w-[48px]" />,
  },
  {
    id: "upcoming",
    title: "Upcoming Sessions",
    value: "4",
    subtitle: "This week",
    iconBg: "bg-[#1976d2]",
    icon: <img src="/images/student-overview-calendar-icon.svg" alt="" className="h-[48px] w-[48px]" />,
  },
  {
    id: "tasks",
    title: "Pending Tasks",
    value: "3",
    subtitle: "2 urgent",
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

const MESSAGES: MessageItem[] = [
  {
    id: "m1",
    sender: "Dr. Sarah Mitchell",
    text: "Looking forward to our session today...",
    time: "10m ago",
    image: "/images/avatar1.png",
    hasUpdate: true,
  },
  {
    id: "m2",
    sender: "Admin Office",
    text: "Reminder: Monthly attendance verification due...",
    time: "1h ago",
    image: "/images/avatar2.png",
    hasUpdate: true,
  },
  {
    id: "m3",
    sender: "Prof. James Wilson",
    text: "Great work on your last assignment!",
    time: "2h ago",
    image: "/images/avatar3.png",
  },
];

const SESSION = {
  title: "Career Development Session",
  instructor: "Dr. Sarah Mitchell",
  time: "2:00 PM - 3:30 PM",
  location: "Room 304, Building A",
  type: "In-Person",
};

const SESSION_MODAL_DATA: SessionModalData = {
  title: "Career Development Session",
  mentorName: "Dr. Sarah Mitchell",
  time: "2:00 PM - 3:30 PM",
  location: "Room 304, Building A",
  type: "In-Person",
  description:
    "Discussion on career goals, internship opportunities, and professional development strategies.",
  agenda: [
    "Review current career objectives",
    "Explore internship opportunities",
    "Discuss skill development plan",
    "Q&A session",
  ],
};

const CALENDAR_EVENTS = [
  {
    date: "2025-11-25",
    title: "Career Development",
    time: "2:00 PM",
  },
];

function StatCard({ item }: { item: StatCardData }) {
  return (
    <article className="h-[126px] rounded-[12px] border border-[#dddddd] bg-white px-[20px] py-[20px]">
      <div className="flex items-start justify-between">
        <div className="flex h-[48px] w-[48px] items-center justify-center rounded-[10px]">
          {item.icon}
        </div>
        <p className="text-[26px] font-medium leading-none text-[#111111]">{item.value}</p>
      </div>
      <p className="mt-[13px] text-[15px] font-semibold leading-none text-[#666666]">{item.title}</p>
      <p className="mt-[9px] text-[13px] font-normal leading-none text-[#9a9a9a]">{item.subtitle}</p>
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
  data: SessionModalData;
}) {
  if (!isOpen) return null;

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
          <p className="mt-[9px] max-w-[142px] text-[13px] font-normal leading-[1.45] text-[#767676]">
            with Dr. Sarah
            <br />
            Mitchell
          </p>

          <div className="mt-[1px] space-y-[13px]">
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

          <div className="mt-[22px]">
            <h4 className="text-[14px] font-normal leading-none text-[#111111]">Description</h4>
            <p className="mt-[13px] text-[12px] font-normal leading-[1.45] text-[#777777]">
              {data.description}
            </p>
          </div>

          <div className="mt-[23px]">
            <h4 className="text-[14px] font-normal leading-none text-[#111111]">Agenda</h4>
            <ul className="mt-[13px] space-y-[11px]">
              {data.agenda.map((item) => (
                <li key={item} className="flex items-center gap-[9px] text-[12px] font-normal leading-none text-[#777777]">
                  <span className="h-[2px] w-[2px] shrink-0 rounded-full bg-[#ffa313]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-[27px]">
            <h4 className="text-[14px] font-normal leading-none text-[#111111]">Materials</h4>
            <div className="mt-[12px] space-y-[8px]">
              <div className="flex min-h-[36px] flex-wrap items-center justify-between gap-2 rounded-[8px] bg-[#f4f4f4] px-[9px] py-[8px]">
                <p className="text-[12px] font-normal text-[#111111]">Career Planning Worksheet</p>
                <button type="button" className="flex items-center gap-[8px] text-[12px] font-normal text-[#ffa313]">
                  <Download className="h-[14px] w-[14px]" strokeWidth={2} />
                  Download
                </button>
              </div>
              <div className="flex min-h-[36px] flex-wrap items-center justify-between gap-2 rounded-[8px] bg-[#f4f4f4] px-[9px] py-[8px]">
                <p className="text-[12px] font-normal text-[#111111]">Internship Guide 2025</p>
                <button type="button" className="flex items-center gap-[8px] text-[12px] font-normal text-[#ffa313]">
                  <Download className="h-[14px] w-[14px]" strokeWidth={2} />
                  Download
                </button>
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
}: {
  isOpen: boolean;
  onClose: () => void;
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

        <div className="mt-[27px] space-y-[24px]">
          <div>
            <label className="mb-[9px] block text-[15px] font-normal leading-none text-[#666666]">
              Date of Absence <span className="text-[#ff5f64]">*</span>
            </label>
            <input
              type="text"
              placeholder="MM/DD/YYYY"
              className="h-[44px] w-full rounded-[9px] border border-[#dddddd] bg-white px-[10px] text-[16px] font-normal text-[#111111] outline-none transition placeholder:text-[#111111] focus:border-[#ff5f64]"
            />
          </div>
          <div>
            <label className="mb-[9px] block text-[15px] font-normal leading-none text-[#666666]">
              Reason for Absence <span className="text-[#ff5f64]">*</span>
            </label>
            <select defaultValue="" className="h-[44px] w-full rounded-[9px] border border-[#dddddd] bg-white px-[10px] text-[16px] font-normal text-[#111111] outline-none transition focus:border-[#ff5f64]">
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
            className="h-[49px] rounded-[9px] bg-[#ff6467] px-4 text-[16px] font-normal text-white transition hover:bg-[#ff5a5f]"
          >
            Submit Report
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Studentpanel() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 1));
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 10, 25));
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAbsenceModalOpen, setIsAbsenceModalOpen] = useState(false);

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
    return CALENDAR_EVENTS.find((event) => event.date === dateStr);
  };

  const selectedEvent = getEventForDay(selectedDate.getDate());

  return (
    <div className="min-h-full w-full overflow-x-hidden bg-[#f5f5f5] px-4 pb-6 pt-5 font-sans md:px-6">
      <div className="w-full space-y-[22px]">
        <section>
          <h2 className="mb-[12px] text-[20px] font-semibold leading-none text-[#111111]">Overview</h2>
          <div className="grid grid-cols-1 gap-[14px] md:grid-cols-3">
            {STATS.map((item) => (
              <StatCard key={item.id} item={item} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-[12px] text-[20px] font-semibold leading-none text-[#111111]">Today's Session</h2>
          <div className="min-h-[198px] rounded-[12px] border border-[#dddddd] bg-white px-[20px] py-[20px]">
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
                  <h3 className="text-[16px] font-bold leading-tight text-[#111111]">{SESSION.title}</h3>
                  <p className="mt-[10px] text-[14px] font-normal leading-none text-[#777777]">with {SESSION.instructor}</p>
                  <div className="mt-[12px] flex flex-wrap items-center gap-x-[12px] gap-y-[8px] text-[13px] font-normal leading-none text-[#777777]">
                    <span className="flex items-center gap-[6px]">
                      <Clock className="h-[15px] w-[15px]" strokeWidth={2} />
                      {SESSION.time}
                    </span>
                    <span className="flex items-center gap-[6px]">
                      <MapPin className="h-[15px] w-[15px]" strokeWidth={2} />
                      {SESSION.location}
                    </span>
                  </div>
                  <span className="mt-[12px] inline-flex rounded-[8px] bg-[#fff0cf] px-[9px] py-[5px] text-[13px] font-normal leading-none text-[#f0a21b]">
                    {SESSION.type}
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
              {MESSAGES.map((msg) => (
                <Link
                  key={msg.id}
                  href="/studentpanel/messages/"
                  className="flex items-start justify-between border-b border-[#d9d9d9] pb-[15px] last:border-b-0 transition hover:bg-white"
                >
                  <div className="flex min-w-0 items-center gap-[12px]">
                    <img
                      src={msg.image}
                      alt=""
                      className="h-[34px] w-[34px] shrink-0 rounded-full object-cover"
                    />
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
        data={SESSION_MODAL_DATA}
      />
      <ReportAbsenceModal
        isOpen={isAbsenceModalOpen}
        onClose={() => setIsAbsenceModalOpen(false)}
      />
    </div>
  );
}

