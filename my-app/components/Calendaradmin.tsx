"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  differenceInCalendarDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";

type EventType = "Session" | "Meeting" | "Deadline" | "Holiday";

type EventItem = {
  id: string;
  title: string;
  date: string;
  time: string;
  type: EventType;
  participants: string[];
  description: string;
};

const SEED_EVENTS: EventItem[] = [
  {
    id: "e1",
    title: "Python Fundamentals Session",
    date: "2025-12-05",
    time: "09:00 AM - 10:00 AM",
    type: "Session",
    participants: ["Dr. Sarah Johnson", "+1"],
    description: "Intro to Python fundamentals.",
  },
  {
    id: "e2",
    title: "Web Development Session",
    date: "2025-12-05",
    time: "10:30 AM - 11:30 AM",
    type: "Session",
    participants: ["Prof. Michael Chen", "+1"],
    description: "React state management patterns.",
  },
  {
    id: "e3",
    title: "Assignment Deadline - Data Structures",
    date: "2025-12-06",
    time: "11:59 PM",
    type: "Deadline",
    participants: ["All Students"],
    description: "Submit assignment 3.",
  },
  {
    id: "e4",
    title: "Team Meeting - Curriculum Review",
    date: "2025-12-07",
    time: "02:00 PM - 03:00 PM",
    type: "Meeting",
    participants: ["All Mentors", "+1"],
    description: "Curriculum planning.",
  },
];

const typeColor: Record<EventType, string> = {
  Session: "bg-[#2f80ed]",
  Meeting: "bg-[#00c853]",
  Deadline: "bg-[#ff2d3d]",
  Holiday: "bg-[#a842f4]",
};

export default function Calendaradmin() {
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date("2025-12-02")));
  const [events, setEvents] = useState<EventItem[]>(SEED_EVENTS);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: "",
    date: "",
    time: "",
    type: "Session" as EventType,
    participants: "",
    description: "",
  });

  const days = useMemo(() => buildCalendar(currentMonth), [currentMonth]);

  const upcoming = useMemo(() => {
    const today = new Date("2025-12-02");
    return [...events]
      .filter((event) => differenceInCalendarDays(parseISO(event.date), today) >= 0)
      .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
      .slice(0, 4);
  }, [events]);

  const addEvent = (event: React.FormEvent) => {
    event.preventDefault();
    const newEvent: EventItem = {
      id: crypto.randomUUID(),
      title: form.title,
      date: form.date,
      time: form.time,
      type: form.type,
      participants: form.participants
        ? form.participants
            .split(",")
            .map((participant) => participant.trim())
            .filter(Boolean)
        : [],
      description: form.description,
    };

    setEvents((previous) => [...previous, newEvent]);
    setShowModal(false);
    setForm({ title: "", date: "", time: "", type: "Session", participants: "", description: "" });
  };

  useEffect(() => {
    if (!showModal) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [showModal]);

  return (
    <div className="min-h-full bg-[#f4f4f4] px-6 py-6 font-[Poppins]">
      <div className="mb-[25px] flex items-center justify-between gap-4">
        <div className="flex items-center gap-[12px]">
          <div className="flex h-[48px] w-[48px] items-center justify-center rounded-[8px] bg-[#fff7e8]">
            <img src="/images/admin-calendar-icon.svg" alt="" className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-[24px] font-semibold leading-none text-[#111111]">Calendar Systems</h1>
            <p className="mt-[8px] text-[16px] font-normal leading-none text-[#666666]">
              Manage sessions, meetings, and deadlines
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex h-[42px] items-center gap-[10px] rounded-[8px] bg-[#ffa313] px-[21px] text-[16px] font-normal text-white transition-colors hover:bg-[#ef970d]"
        >
          <span className="text-[22px] leading-none">+</span>
          Add Event
        </button>
      </div>

      <div className="grid grid-cols-1 gap-[16px] xl:grid-cols-[1fr_363px]">
        <section className="overflow-hidden rounded-[8px] border border-[#d6d6d6] bg-white">
          <div className="flex h-[68px] items-center justify-between border-b border-[#d6d6d6] px-[16px]">
            <div>
              <h2 className="text-[18px] font-normal leading-[22px] text-[#111111]">{format(currentMonth, "MMMM")}</h2>
              <p className="text-[18px] font-normal leading-[22px] text-[#111111]">{format(currentMonth, "yyyy")}</p>
            </div>
            <div className="flex items-center gap-[22px] pr-[12px]">
              <button
                onClick={() => setCurrentMonth((month) => addMonths(month, -1))}
                className="flex h-8 w-8 items-center justify-center text-[#006fd6]"
                aria-label="Previous month"
              >
                <Chevron direction="left" />
              </button>
              <button
                onClick={() => setCurrentMonth((month) => addMonths(month, 1))}
                className="flex h-8 w-8 items-center justify-center text-[#006fd6]"
                aria-label="Next month"
              >
                <Chevron direction="right" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 px-[16px] pt-[26px] text-center text-[15px] font-normal leading-none text-[#666666]">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((weekday) => (
              <span key={weekday}>{weekday}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-[8px] px-[16px] pb-[16px] pt-[19px]">
            {days.map((day) => {
              const outside = !isSameMonth(day, currentMonth);
              const isSelected = isSameDay(day, new Date("2025-12-02"));
              return (
                <div
                  key={day.toISOString()}
                  className={`h-[96px] rounded-[8px] border px-[9px] py-[10px] ${
                    outside
                      ? "border-transparent bg-transparent text-transparent"
                      : isSelected
                        ? "border-[#b5cedf] bg-[#e1f2ff] text-[#0073d8]"
                        : "border-[#d6d6d6] bg-white text-[#111111]"
                  }`}
                >
                  {!outside && <span className="text-[16px] font-normal leading-none">{format(day, "d")}</span>}
                </div>
              );
            })}
          </div>
        </section>

        <aside className="overflow-hidden rounded-[8px] border border-[#d6d6d6] bg-white">
          <h2 className="border-b border-[#d6d6d6] px-[16px] py-[20px] text-[18px] font-normal leading-none text-[#111111]">
            Upcoming Events
          </h2>
          <div>
            {upcoming.map((event) => (
              <div key={event.id} className="flex gap-[12px] border-b border-[#d6d6d6] px-[16px] py-[17px] last:border-b-0">
                <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-[8px] bg-[#fff7e8]">
                  <img src="/images/admin-calendar-icon.svg" alt="" className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-[15px] font-normal leading-none text-[#111111]">{event.title}</h3>
                  <p className="mt-[10px] flex items-center gap-[5px] text-[13px] font-normal leading-none text-[#666666]">
                    <ClockIcon />
                    {event.time}
                  </p>
                  <p className="mt-[10px] text-[13px] font-normal leading-none text-[#666666]">{event.date}</p>
                  <p className="mt-[10px] flex items-start gap-[5px] text-[13px] font-normal leading-[16px] text-[#666666]">
                    <UsersIcon />
                    <span>{event.participants.join("\n")}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <section className="mt-[24px] rounded-[8px] border border-[#d6d6d6] bg-white px-[24px] py-[28px]">
        <h2 className="mb-[24px] text-[18px] font-normal leading-none text-[#111111]">Event Types</h2>
        <div className="grid grid-cols-2 gap-y-[18px] sm:grid-cols-4">
          <Legend label="Sessions" color={typeColor.Session} />
          <Legend label="Meetings" color={typeColor.Meeting} />
          <Legend label="Deadlines" color={typeColor.Deadline} />
          <Legend label="Holidays" color={typeColor.Holiday} />
        </div>
      </section>

      {showModal && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="max-h-[calc(100vh-24px)] w-full max-w-[447px] overflow-y-auto rounded-[8px] bg-white px-[24px] py-[33px] shadow-2xl [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="mb-[27px] flex items-center justify-between">
              <h3 className="text-[18px] font-semibold leading-none text-[#111111]">Add New Event</h3>
              <button onClick={() => setShowModal(false)} className="relative h-6 w-6" aria-label="Close">
                <span className="absolute left-1/2 top-1/2 h-[2px] w-[18px] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[#666666]" />
                <span className="absolute left-1/2 top-1/2 h-[2px] w-[18px] -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-[#666666]" />
              </button>
            </div>

            <form onSubmit={addEvent}>
              <Field label="Event Title *">
                <input
                  required
                  value={form.title}
                  onChange={(event) => setForm((previous) => ({ ...previous, title: event.target.value }))}
                  placeholder="Enter event title"
                />
              </Field>
              <Field label="Date *">
                <input
                  required
                  value={form.date}
                  onChange={(event) => setForm((previous) => ({ ...previous, date: event.target.value }))}
                  placeholder="MM/DD/YYYY"
                />
              </Field>
              <Field label="Time *">
                <input
                  required
                  value={form.time}
                  onChange={(event) => setForm((previous) => ({ ...previous, time: event.target.value }))}
                  placeholder="e.g., 09:00 AM - 10:00 AM"
                />
              </Field>
              <Field label="Event Type *">
                <select
                  value={form.type}
                  onChange={(event) => setForm((previous) => ({ ...previous, type: event.target.value as EventType }))}
                >
                  <option value="Session">Session</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Deadline">Deadline</option>
                  <option value="Holiday">Holiday</option>
                </select>
              </Field>
              <Field label="Participants (comma-separated)">
                <input
                  value={form.participants}
                  onChange={(event) => setForm((previous) => ({ ...previous, participants: event.target.value }))}
                  placeholder="e.g., John Doe, Jane Smith"
                />
              </Field>
              <Field label="Description">
                <textarea
                  value={form.description}
                  onChange={(event) => setForm((previous) => ({ ...previous, description: event.target.value }))}
                  placeholder="Event description"
                />
              </Field>

              <div className="mt-[38px] grid grid-cols-[1fr_82px] gap-[13px]">
                <button
                  type="submit"
                  className="h-[42px] rounded-[8px] bg-[#ffa313] text-[16px] font-semibold text-white transition-colors hover:bg-[#ef970d]"
                >
                  Add Event
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="h-[42px] rounded-[8px] border border-[#d6d6d6] bg-white text-[16px] font-semibold text-[#666666] transition-colors hover:bg-[#f7f7f7]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const Legend = ({ label, color }: { label: string; color: string }) => (
  <div className="flex items-center gap-[9px] text-[15px] font-normal leading-none text-[#666666]">
    <span className={`h-[16px] w-[16px] rounded-[4px] ${color}`} />
    <span>{label}</span>
  </div>
);

const Field = ({ label, children }: { label: string; children: React.ReactElement<{ className?: string }> }) => {
  const isTextarea = children.type === "textarea";
  return (
    <label className="mb-[17px] block">
      <span className="mb-[11px] block text-[15px] font-semibold leading-none text-[#666666]">{label}</span>
      {React.cloneElement(children, {
        className:
          `${isTextarea ? "h-[90px] resize-none py-[14px]" : "h-[42px]"} w-full rounded-[8px] border border-[#d6d6d6] bg-white px-[15px] text-[16px] font-semibold text-[#111111] outline-none placeholder:text-[#777777]`,
      })}
    </label>
  );
};

const Chevron = ({ direction }: { direction: "left" | "right" }) => (
  <span
    className={`block h-[10px] w-[10px] rotate-45 border-[#006fd6] ${
      direction === "left" ? "border-b-2 border-l-2" : "border-r-2 border-t-2"
    }`}
  />
);

const ClockIcon = () => (
  <span className="relative h-[13px] w-[13px] shrink-0 rounded-full border border-[#666666] before:absolute before:left-[5px] before:top-[2px] before:h-[5px] before:w-[1px] before:bg-[#666666] after:absolute after:left-[5px] after:top-[6px] after:h-[1px] after:w-[4px] after:bg-[#666666]" />
);

const UsersIcon = () => (
  <span className="relative mt-[1px] h-[13px] w-[13px] shrink-0 before:absolute before:left-[4px] before:top-0 before:h-[5px] before:w-[5px] before:rounded-full before:border before:border-[#666666] after:absolute after:left-[2px] after:top-[7px] after:h-[5px] after:w-[9px] after:rounded-t-full after:border after:border-[#666666] after:border-b-0" />
);

const buildCalendar = (currentMonth: Date) => {
  const start = startOfWeek(startOfMonth(currentMonth));
  const end = endOfWeek(endOfMonth(currentMonth));
  const days: Date[] = [];
  let day = start;
  while (day <= end) {
    days.push(new Date(day));
    day = addDays(day, 1);
  }
  return days;
};
