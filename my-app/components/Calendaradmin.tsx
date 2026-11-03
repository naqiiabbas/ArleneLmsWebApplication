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
import { MapPin, Paperclip, Pencil, Trash2, X } from "lucide-react";
import {
  createEvent,
  deleteEvent,
  deleteEventMaterial,
  listEvents,
  updateEvent,
  uploadEventMaterial,
} from "@/lib/data/events";
import type { EventAudience, EventMaterial, EventType, UIEvent } from "@/lib/data/events.types";
import { EventMaterialLink } from "@/components/ProgramEvents";

type EventItem = UIEvent;

const MATERIAL_MAX_BYTES = 10 * 1024 * 1024;
const MATERIAL_ACCEPT = ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.txt,.jpg,.jpeg,.png,.webp,.gif";

const EMPTY_FORM = {
  title: "",
  date: "",
  startTime: "",
  endTime: "",
  type: "Session" as EventType,
  participants: "",
  description: "",
  audience: "Everyone" as EventAudience,
  location: "",
};


const typeColor: Record<EventType, string> = {
  Session: "bg-[#2f80ed]",
  Meeting: "bg-[#00c853]",
  Deadline: "bg-[#ff2d3d]",
  Holiday: "bg-[#a842f4]",
  Workshop: "bg-[#00acc1]",
  Fundraiser: "bg-[#f4511e]",
};

export default function Calendaradmin() {
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [today, setToday] = useState<Date | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [keptMaterials, setKeptMaterials] = useState<EventMaterial[]>([]);
  const [removedMaterials, setRemovedMaterials] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<EventItem | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      setEvents((await listEvents()) as EventItem[]);
    } catch (e) {
      setNotice({ type: "error", msg: (e as Error).message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setToday(new Date());
    refresh();
  }, []);

  const days = useMemo(() => buildCalendar(currentMonth), [currentMonth]);

  const upcoming = useMemo(() => {
    const ref = today ?? new Date();
    return [...events]
      .filter((event) => differenceInCalendarDays(parseISO(event.date), ref) >= 0)
      .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
      .slice(0, 4);
  }, [events, today]);

  // The side panel: the clicked day's events (any date, past included), else what's next.
  const listed = useMemo(
    () => (selectedDay ? events.filter((ev) => ev.date === selectedDay) : upcoming),
    [events, selectedDay, upcoming],
  );

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, date: selectedDay ?? "" });
    setKeptMaterials([]);
    setRemovedMaterials([]);
    setNewFiles([]);
    setShowModal(true);
  };

  const openEdit = (ev: EventItem) => {
    const { start, end } = parseTimeLabel(ev.time);
    setEditingId(ev.id);
    setForm({
      title: ev.title,
      date: ev.date,
      startTime: start,
      endTime: end,
      type: ev.type,
      participants: ev.participants.join(", "),
      description: ev.description,
      audience: ev.audience,
      location: ev.location,
    });
    setKeptMaterials(ev.materials);
    setRemovedMaterials([]);
    setNewFiles([]);
    setShowModal(true);
  };

  const pickFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(event.target.files ?? []);
    event.target.value = ""; // allow re-picking the same file
    const tooBig = picked.filter((f) => f.size > MATERIAL_MAX_BYTES);
    if (tooBig.length) {
      setNotice({ type: "error", msg: `${tooBig.map((f) => f.name).join(", ")} is larger than 10 MB.` });
    }
    setNewFiles((files) => [...files, ...picked.filter((f) => f.size <= MATERIAL_MAX_BYTES)]);
  };

  const confirmDelete = async () => {
    if (!deleting || deleteBusy) return;
    setDeleteBusy(true);
    const res = await deleteEvent(deleting.id);
    setDeleteBusy(false);
    if (res.error) {
      setNotice({ type: "error", msg: res.error });
    } else {
      setNotice({ type: "success", msg: `"${deleting.title}" deleted.` });
    }
    setDeleting(null);
    await refresh();
  };

  const saveEvent = async (event: React.FormEvent) => {
    event.preventDefault();
    const participants = form.participants
      ? form.participants.split(",").map((p) => p.trim()).filter(Boolean)
      : [];
    if (form.endTime <= form.startTime) {
      setNotice({ type: "error", msg: "End time must be after start time." });
      return;
    }
    setSubmitting(true);
    const input = {
      title: form.title,
      date: form.date,
      time: `${formatTime(form.startTime)} - ${formatTime(form.endTime)}`,
      type: form.type,
      participants,
      description: form.description,
      audience: form.audience,
      location: form.location,
    };
    let eventId = editingId;
    let saveError: string | undefined;
    if (editingId) {
      saveError = (await updateEvent(editingId, input)).error;
    } else {
      const created = await createEvent(input);
      saveError = created.error;
      eventId = created.id ?? null;
    }
    if (saveError || !eventId) {
      setSubmitting(false);
      setNotice({ type: "error", msg: saveError ?? "The event couldn't be saved." });
      return;
    }

    // The event itself is saved; file problems are reported without losing it.
    const fileErrors: string[] = [];
    for (const id of removedMaterials) {
      const r = await deleteEventMaterial(id);
      if (r.error) fileErrors.push(r.error);
    }
    for (const file of newFiles) {
      const fd = new FormData();
      fd.set("file", file);
      try {
        const r = await uploadEventMaterial(eventId, fd);
        if (r.error) fileErrors.push(r.error);
      } catch {
        fileErrors.push(`"${file.name}" couldn't be uploaded.`);
      }
    }
    setSubmitting(false);

    const saved = editingId ? "Event updated." : "Event added.";
    setNotice(
      fileErrors.length
        ? { type: "error", msg: `${saved} But: ${fileErrors.join(" ")}` }
        : { type: "success", msg: saved },
    );
    setShowModal(false);
    setForm(EMPTY_FORM);
    setEditingId(null);
    await refresh();
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
          onClick={openAdd}
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
              const isSelected = today ? isSameDay(day, today) : false;
              const dayKey = format(day, "yyyy-MM-dd");
              const dayEvents = outside ? [] : events.filter((ev) => ev.date === dayKey);
              return (
                <button
                  type="button"
                  key={day.toISOString()}
                  disabled={outside}
                  onClick={() => setSelectedDay((d) => (d === dayKey ? null : dayKey))}
                  aria-pressed={selectedDay === dayKey}
                  aria-label={`${format(day, "MMMM d, yyyy")}, ${dayEvents.length} event${dayEvents.length === 1 ? "" : "s"}`}
                  className={`flex h-[96px] w-full flex-col items-start justify-start rounded-[8px] border px-[9px] py-[10px] text-left ${
                    outside
                      ? "border-transparent bg-transparent text-transparent"
                      : selectedDay === dayKey
                        ? "border-[#ffa313] bg-[#fff7e8] text-[#111111]"
                        : isSelected
                          ? "border-[#b5cedf] bg-[#e1f2ff] text-[#0073d8] hover:border-[#ffa313]"
                          : "border-[#d6d6d6] bg-white text-[#111111] hover:border-[#ffa313]"
                  }`}
                >
                  {!outside && (
                    <>
                      <span className="text-[16px] font-normal leading-none">{format(day, "d")}</span>
                      {dayEvents.length > 0 && (
                        <div className="mt-[8px] flex flex-wrap gap-[3px]">
                          {dayEvents.slice(0, 4).map((ev) => (
                            <span key={ev.id} title={ev.title} className={`h-[6px] w-[6px] rounded-full ${typeColor[ev.type]}`} />
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <aside className="overflow-hidden rounded-[8px] border border-[#d6d6d6] bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-[#d6d6d6] px-[16px] py-[20px]">
            <h2 className="text-[18px] font-normal leading-none text-[#111111]">
              {selectedDay ? format(parseISO(selectedDay), "MMM d, yyyy") : "Upcoming Events"}
            </h2>
            {selectedDay && (
              <button type="button" onClick={() => setSelectedDay(null)} className="shrink-0 text-[13px] text-[#ff9f0f] hover:underline">
                Show upcoming
              </button>
            )}
          </div>
          <div>
            {loading && (
              <p className="px-[16px] py-[17px] text-[14px] text-[#666666]">Loading events...</p>
            )}
            {!loading && listed.length === 0 && (
              <p className="px-[16px] py-[17px] text-[14px] text-[#666666]">
                {selectedDay ? "No events on this day." : "No upcoming events. Click a day to see past events."}
              </p>
            )}
            {listed.map((event) => (
              <div key={event.id} className="flex gap-[12px] border-b border-[#d6d6d6] px-[16px] py-[17px] last:border-b-0">
                <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-[8px] bg-[#fff7e8]">
                  <img src="/images/admin-calendar-icon.svg" alt="" className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="min-w-0 break-words text-[15px] font-normal leading-[18px] text-[#111111]">{event.title}</h3>
                    <div className="flex shrink-0 gap-[4px]">
                      <button type="button" onClick={() => openEdit(event)} aria-label={`Edit ${event.title}`} title="Edit event" className="flex h-[28px] w-[28px] items-center justify-center rounded-[6px] text-[#666666] transition-colors hover:bg-[#fff7e8] hover:text-[#ff9f0f]">
                        <Pencil size={15} />
                      </button>
                      <button type="button" onClick={() => setDeleting(event)} aria-label={`Delete ${event.title}`} title="Delete event" className="flex h-[28px] w-[28px] items-center justify-center rounded-[6px] text-[#666666] transition-colors hover:bg-[#fff1f2] hover:text-[#ff1f2d]">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                  <p className="mt-[10px] flex items-center gap-[5px] text-[13px] font-normal leading-none text-[#666666]">
                    <ClockIcon />
                    {event.time}
                  </p>
                  <p className="mt-[10px] text-[13px] font-normal leading-none text-[#666666]">{event.date} · {event.type}</p>
                  {event.location && (
                    <p className="mt-[10px] flex items-start gap-[5px] break-words text-[13px] font-normal leading-[16px] text-[#666666]">
                      <MapPin size={13} className="mt-[1px] shrink-0" />
                      <span className="min-w-0 break-words">{event.location}</span>
                    </p>
                  )}
                  {event.participants.length > 0 && (
                    <p className="mt-[10px] flex items-start gap-[5px] text-[13px] font-normal leading-[16px] text-[#666666]">
                      <UsersIcon />
                      <span>{event.participants.join(", ")}</span>
                    </p>
                  )}
                  {event.materials.length > 0 && (
                    <div className="mt-[10px] space-y-[5px]">
                      {event.materials.map((m) => (
                        <EventMaterialLink key={m.id} material={m} />
                      ))}
                    </div>
                  )}
                  <p className="mt-[8px] inline-flex rounded-full bg-[#fff7e8] px-[8px] py-[3px] text-[11px] font-medium text-[#c2410c]">
                    {event.audience === "Everyone" ? "Visible to everyone" : event.audience === "Admins" ? "Admins only" : `${event.audience} only`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <section className="mt-[24px] rounded-[8px] border border-[#d6d6d6] bg-white px-[24px] py-[28px]">
        <h2 className="mb-[24px] text-[18px] font-normal leading-none text-[#111111]">Event Types</h2>
        <div className="grid grid-cols-2 gap-y-[18px] sm:grid-cols-3 lg:grid-cols-6">
          <Legend label="Sessions" color={typeColor.Session} />
          <Legend label="Meetings" color={typeColor.Meeting} />
          <Legend label="Deadlines" color={typeColor.Deadline} />
          <Legend label="Holidays" color={typeColor.Holiday} />
          <Legend label="Workshops" color={typeColor.Workshop} />
          <Legend label="Fundraisers" color={typeColor.Fundraiser} />
        </div>
      </section>

      {showModal && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="max-h-[calc(100vh-24px)] w-full max-w-[447px] overflow-y-auto rounded-[8px] bg-white px-[24px] py-[33px] shadow-2xl [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="mb-[27px] flex items-center justify-between">
              <h3 className="text-[18px] font-semibold leading-none text-[#111111]">{editingId ? "Edit Event" : "Add New Event"}</h3>
              <button onClick={() => setShowModal(false)} className="relative h-6 w-6" aria-label="Close">
                <span className="absolute left-1/2 top-1/2 h-[2px] w-[18px] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[#666666]" />
                <span className="absolute left-1/2 top-1/2 h-[2px] w-[18px] -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-[#666666]" />
              </button>
            </div>

            <form onSubmit={saveEvent}>
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
                  type="date"
                  required
                  value={form.date}
                  onClick={(event) => event.currentTarget.showPicker?.()}
                  onChange={(event) => setForm((previous) => ({ ...previous, date: event.target.value }))}
                />
              </Field>
              <div className="mb-[17px]">
                <span className="mb-[11px] block text-[15px] font-semibold leading-none text-[#666666]">Time *</span>
                <div className="grid grid-cols-2 gap-[12px]">
                  <label className="block">
                    <span className="mb-[6px] block text-[12px] font-medium text-[#888888]">Start</span>
                    <input
                      type="time"
                      required
                      value={form.startTime}
                      onClick={(event) => event.currentTarget.showPicker?.()}
                      onChange={(event) => setForm((previous) => ({ ...previous, startTime: event.target.value }))}
                      className={`${inputClass} cursor-pointer`}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-[6px] block text-[12px] font-medium text-[#888888]">End</span>
                    <input
                      type="time"
                      required
                      min={form.startTime || undefined}
                      value={form.endTime}
                      onClick={(event) => event.currentTarget.showPicker?.()}
                      onChange={(event) => setForm((previous) => ({ ...previous, endTime: event.target.value }))}
                      className={`${inputClass} cursor-pointer`}
                    />
                  </label>
                </div>
              </div>
              <Field label="Event Type *">
                <select
                  value={form.type}
                  onChange={(event) => setForm((previous) => ({ ...previous, type: event.target.value as EventType }))}
                >
                  <option value="Session">Session</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Deadline">Deadline</option>
                  <option value="Holiday">Holiday</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Fundraiser">Fundraiser</option>
                </select>
              </Field>
              <Field label="Who should see this? *">
                {/* Mentors and students now see events in their own calendars. */}
                <select
                  value={form.audience}
                  onChange={(event) => setForm((previous) => ({ ...previous, audience: event.target.value as EventAudience }))}
                >
                  <option value="Everyone">Everyone (mentors, students &amp; sponsors)</option>
                  <option value="Mentors">Mentors only</option>
                  <option value="Students">Students only</option>
                  <option value="Admins">Admins only (not shared)</option>
                </select>
              </Field>
              <Field label="Location">
                <input
                  value={form.location}
                  onChange={(event) => setForm((previous) => ({ ...previous, location: event.target.value }))}
                  placeholder="e.g., Library Room 301 or a meeting link"
                />
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
              <div className="mb-[17px]">
                <span className="mb-[11px] block text-[15px] font-semibold leading-none text-[#666666]">Attached Materials</span>
                {keptMaterials.map((m) => (
                  <AttachmentRow
                    key={m.id}
                    name={m.name}
                    onRemove={() => {
                      setKeptMaterials((list) => list.filter((x) => x.id !== m.id));
                      setRemovedMaterials((ids) => [...ids, m.id]);
                    }}
                  />
                ))}
                {newFiles.map((f, i) => (
                  <AttachmentRow key={`${f.name}-${i}`} name={f.name} onRemove={() => setNewFiles((list) => list.filter((_, j) => j !== i))} />
                ))}
                <label className="flex h-[42px] cursor-pointer items-center justify-center gap-[8px] rounded-[8px] border border-dashed border-[#d6d6d6] text-[14px] font-medium text-[#666666] transition-colors hover:border-[#ffa313] hover:text-[#ff9f0f]">
                  <Paperclip size={15} />
                  Add files
                  <input type="file" multiple accept={MATERIAL_ACCEPT} onChange={pickFiles} className="hidden" />
                </label>
                <p className="mt-[6px] text-[12px] text-[#888888]">PDF, Word, PowerPoint, Excel, text or images. Up to 10 MB each.</p>
              </div>

              <div className="mt-[38px] grid grid-cols-[1fr_82px] gap-[13px]">
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-[42px] rounded-[8px] bg-[#ffa313] text-[16px] font-semibold text-white transition-colors hover:bg-[#ef970d] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? "Saving..." : editingId ? "Save Changes" : "Add Event"}
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

      {deleting && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-[420px] rounded-[8px] bg-white p-[24px] shadow-2xl">
            <h3 className="text-[18px] font-semibold leading-tight text-[#111111]">Delete this event?</h3>
            <p className="mt-[12px] break-words text-[14px] leading-[20px] text-[#666666]">
              &quot;{deleting.title}&quot; on {deleting.date} will be removed from every calendar, along with its attached materials. This can&apos;t be undone.
            </p>
            <div className="mt-[20px] grid grid-cols-2 gap-[10px]">
              <button type="button" disabled={deleteBusy} onClick={() => setDeleting(null)} className="h-[42px] rounded-[8px] border border-[#d6d6d6] bg-white text-[15px] text-[#666666] hover:bg-[#f7f7f7] disabled:opacity-60">
                Cancel
              </button>
              <button type="button" disabled={deleteBusy} onClick={confirmDelete} className="h-[42px] rounded-[8px] bg-[#e0342b] text-[15px] font-medium text-white hover:bg-[#c92b23] disabled:opacity-60">
                {deleteBusy ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const AttachmentRow = ({ name, onRemove }: { name: string; onRemove: () => void }) => (
  <div className="mb-[8px] flex items-center justify-between gap-3 rounded-[8px] bg-[#f6f6f6] px-[12px] py-[8px] text-[14px] text-[#444444]">
    <span className="truncate">{name}</span>
    <button type="button" onClick={onRemove} aria-label={`Remove ${name}`} className="shrink-0 text-[#888888] hover:text-[#e0342b]">
      <X size={16} />
    </button>
  </div>
);

const Legend = ({ label, color }: { label: string; color: string }) => (
  <div className="flex items-center gap-[9px] text-[15px] font-normal leading-none text-[#666666]">
    <span className={`h-[16px] w-[16px] rounded-[4px] ${color}`} />
    <span>{label}</span>
  </div>
);

const inputClass =
  "h-[42px] w-full rounded-[8px] border border-[#d6d6d6] bg-white px-[15px] text-[16px] font-semibold text-[#111111] outline-none placeholder:text-[#777777]";

// "14:30" -> "02:30 PM"
const formatTime = (value: string) => {
  const [h, m] = value.split(":").map(Number);
  return `${String(h % 12 || 12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};

// "02:30 PM - 03:00 PM" -> { start: "14:30", end: "15:00" } (blank if it isn't in that form).
const parseTimeLabel = (label: string) => {
  const toHm = (t: string | undefined) => {
    const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec((t ?? "").trim());
    if (!m) return "";
    const h = (Number(m[1]) % 12) + (m[3].toUpperCase() === "PM" ? 12 : 0);
    return `${String(h).padStart(2, "0")}:${m[2]}`;
  };
  const [start, end] = label.split(" - ");
  return { start: toHm(start), end: toHm(end) };
};

const Field = ({ label, children }: { label: string; children: React.ReactElement<{ className?: string }> }) => {
  const isTextarea = children.type === "textarea";
  return (
    <label className="mb-[17px] block">
      <span className="mb-[11px] block text-[15px] font-semibold leading-none text-[#666666]">{label}</span>
      {React.cloneElement(children, {
        className: isTextarea
          ? inputClass.replace("h-[42px]", "h-[90px] resize-none py-[14px]")
          : inputClass,
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
