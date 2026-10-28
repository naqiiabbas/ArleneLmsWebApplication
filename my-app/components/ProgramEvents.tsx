"use client";

// Admin-created program events (Calendar → "Who should see this?") shown
// read-only inside the mentor and student calendars. They used to exist only in
// the admin calendar, so mentors and students never saw them.
import React, { useEffect, useState } from "react";
import { CalendarDays, Clock, X } from "lucide-react";
import { getMyEvents } from "@/lib/data/events";
import type { VisibleEvent } from "@/lib/data/events.types";

/** Purple, so events never get mistaken for the orange class sessions. */
export const EVENT_COLOR = "#7c3aed";

export function useMyEvents(): VisibleEvent[] {
  const [events, setEvents] = useState<VisibleEvent[]>([]);
  useEffect(() => {
    let alive = true;
    getMyEvents()
      .then((e) => alive && setEvents(e))
      .catch(() => {
        /* events are supplementary — never break the calendar over them */
      });
    return () => {
      alive = false;
    };
  }, []);
  return events;
}

/** Events grouped by "yyyy-mm-dd". */
export function eventsByDate(events: VisibleEvent[]): Map<string, VisibleEvent[]> {
  const map = new Map<string, VisibleEvent[]>();
  for (const e of events) map.set(e.date, [...(map.get(e.date) ?? []), e]);
  return map;
}

const longDay = (ymd: string) => {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
};

export function EventChip({ event, onOpen }: { event: VisibleEvent; onOpen: (e: VisibleEvent) => void }) {
  return (
    <button
      type="button"
      onClick={(ev) => {
        ev.stopPropagation();
        onOpen(event);
      }}
      title={`${event.type}: ${event.title}`}
      className="block w-full truncate rounded-[4px] px-[8px] py-[6px] text-left text-[12px] font-normal text-white"
      style={{ backgroundColor: EVENT_COLOR }}
    >
      {event.time ? <span className="font-semibold">{event.time} </span> : null}
      {event.title}
    </button>
  );
}

export function UpcomingEventsList({
  events,
  today,
  onOpen,
}: {
  events: VisibleEvent[];
  today: string;
  onOpen: (e: VisibleEvent) => void;
}) {
  const upcoming = events.filter((e) => e.date >= today).slice(0, 6);
  if (!upcoming.length) return null;
  return (
    <div className="mt-[25px] rounded-[8px] border border-[#dddddd] bg-white px-[24px] pb-[23px] pt-[27px]">
      <h3 className="mb-[19px] flex items-center gap-[10px] text-[22px] font-semibold leading-none text-[#111111]">
        <span className="h-[12px] w-[12px] rounded-full" style={{ backgroundColor: EVENT_COLOR }} />
        Upcoming Program Events
      </h3>
      <div className="space-y-[12px]">
        {upcoming.map((e) => {
          const [y, m, d] = e.date.split("-").map(Number);
          const dt = new Date(y, m - 1, d);
          return (
            <button
              type="button"
              key={e.id}
              onClick={() => onOpen(e)}
              className="flex min-h-[72px] w-full items-center gap-[16px] rounded-[8px] border border-[#dddddd] bg-white px-[16px] py-[10px] text-left transition hover:bg-[#faf7ff]"
            >
              <div className="flex h-[54px] w-[52px] shrink-0 flex-col items-center justify-center rounded-[9px] leading-none text-white" style={{ backgroundColor: EVENT_COLOR }}>
                <span className="text-[11px] uppercase">{dt.toLocaleDateString("en-US", { month: "short" })}</span>
                <span className="mt-[3px] text-[18px] font-semibold">{d}</span>
              </div>
              <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold leading-none text-[#111111]">{e.title}</p>
                <p className="mt-[7px] text-[12px] leading-[1.4] text-[#666666]">
                  {e.type}
                  {e.time ? ` · ${e.time}` : ""}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function EventDetailsModal({ event, onClose }: { event: VisibleEvent | null; onClose: () => void }) {
  if (!event) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-[520px] overflow-hidden rounded-[8px] bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 border-b border-[#dddddd] px-[24px] py-[20px]">
          <div>
            <span className="inline-flex rounded-full px-[10px] py-[4px] text-[12px] font-medium text-white" style={{ backgroundColor: EVENT_COLOR }}>
              {event.type}
            </span>
            <h3 className="mt-[10px] text-[22px] font-semibold leading-tight text-[#2d3b4f]">{event.title}</h3>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="text-[#2d3b4f] hover:text-[#111111]">
            <X size={22} strokeWidth={1.8} />
          </button>
        </div>
        <div className="space-y-[14px] px-[24px] py-[20px] text-[15px] text-[#2d3b4f]">
          <p className="flex items-center gap-[10px]">
            <CalendarDays size={18} className="text-[#657183]" /> {longDay(event.date)}
          </p>
          {event.time && (
            <p className="flex items-center gap-[10px]">
              <Clock size={18} className="text-[#657183]" /> {event.time}
            </p>
          )}
          <p className="whitespace-pre-wrap leading-[1.5] text-[#555555]">{event.description || "No description provided."}</p>
          <p className="text-[12px] text-[#999999]">Posted by the program administrators.</p>
        </div>
      </div>
    </div>
  );
}
