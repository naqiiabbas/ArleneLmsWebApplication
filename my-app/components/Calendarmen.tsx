"use client";

import React, { useMemo, useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  MapPin,
  Plus,
  User,
  X,
} from "lucide-react";

const INITIAL_SESSIONS = [
  { id: 1, student: "Marcus Johnson", type: "Math Tutoring", date: "2024-11-27", time: "10:00 AM", location: "Library Room 301", notes: "Focus on quadratic equations" },
  { id: 2, student: "David Williams", type: "Career Discussion", date: "2024-11-27", time: "02:00 PM", location: "Virtual Meeting", notes: "Discussing engineering pathways" },
  { id: 3, student: "James Brown", type: "Study Skills", date: "2024-11-28", time: "11:30 AM", location: "Room 204", notes: "Organization techniques" },
  { id: 4, student: "Michael Davis", type: "Check-in", date: "2024-11-29", time: "09:00 AM", location: "Cafe", notes: "Weekly progress review" },
  { id: 5, student: "Robert Miller", type: "Math Tutoring", date: "2024-12-02", time: "01:00 PM", location: "Library", notes: "Calculus basics" },
];

const STUDENTS = ["Marcus Johnson", "David Williams", "James Brown", "Michael Davis", "Robert Miller"];
const SESSION_TYPES = ["Math Tutoring", "Career Discussion", "Study Skills", "Check-in"];

const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const monthLabel = (date: Date) => date.toLocaleString("default", { month: "long", year: "numeric" });

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4 font-poppins">
      <div className="w-full max-w-[670px] overflow-hidden rounded-[8px] bg-white shadow-2xl">
        <div className="flex h-[85px] items-center justify-between border-b border-[#dddddd] px-[24px]">
          <h3 className="text-[24px] font-semibold leading-none text-[#2d3b4f]">{title}</h3>
          <button onClick={onClose} className="text-[#2d3b4f] transition hover:text-[#111111]" aria-label="Close modal">
            <X size={22} strokeWidth={1.8} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default function CalendarSection() {
  const [sessions, setSessions] = useState(INITIAL_SESSIONS);
  const [currentDate, setCurrentDate] = useState(new Date(2024, 10, 1));
  const [isNewSessionOpen, setIsNewSessionOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [calendarView, setCalendarView] = useState("Month");
  const [weekView, setWeekView] = useState("Week");
  const [formData, setFormData] = useState({ student: "", type: "", date: "", time: "", location: "", notes: "" });

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = new Date(year, month, 1);
    const days: (Date | null)[] = [];

    const firstDayIndex = date.getDay();
    for (let i = 0; i < firstDayIndex; i++) days.push(null);

    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }

    return days;
  }, [currentDate]);

  const sortedSessions = useMemo(
    () => [...sessions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [sessions]
  );

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const handleExport = () => window.print();

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    const newSession = { ...formData, id: Date.now() };
    setSessions([...sessions, newSession]);
    setIsNewSessionOpen(false);
    setFormData({ student: "", type: "", date: "", time: "", location: "", notes: "" });
  };

  return (
    <div className="min-h-screen w-full bg-[#f4f4f4] px-4 pb-[26px] pt-[28px] font-poppins md:px-6">
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .calendar-container { padding: 0 !important; margin: 0 !important; width: 100% !important; }
          button, select { display: none !important; }
        }
      `}</style>

      <div className="calendar-container">
        <div className="mb-[26px] flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[30px] font-bold leading-none tracking-[-0.02em] text-[#111111]">Calendar</h1>
            <p className="mt-[10px] text-[14px] font-normal leading-none text-[#666666]">Schedule and manage sessions</p>
          </div>
          <div className="flex flex-col gap-[10px] no-print sm:flex-row">
            <button onClick={handleExport} className="flex h-[41px] items-center justify-center gap-[9px] rounded-[9px] border border-[#d6d6d6] bg-white px-[24px] text-[14px] font-semibold text-[#111111] transition hover:bg-[#f7f7f7]">
              <Download size={16} strokeWidth={2} /> Export
            </button>
            <button onClick={() => setIsNewSessionOpen(true)} className="flex h-[41px] items-center justify-center gap-[9px] rounded-[9px] bg-[#ffa313] px-[27px] text-[14px] font-semibold text-white transition hover:bg-[#f59a0d]">
              <Plus size={17} strokeWidth={2} /> New Session
            </button>
          </div>
        </div>

        <div className="mb-[25px] flex min-h-[73px] flex-col gap-4 rounded-[8px] border border-[#dddddd] bg-white px-[24px] py-[16px] lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-[21px]">
            <button onClick={handlePrevMonth} className="text-[#111111] no-print" aria-label="Previous month"><ChevronLeft size={24} strokeWidth={2} /></button>
            <h2 className="min-w-[202px] text-[22px] font-semibold leading-none text-[#111111]">{monthLabel(currentDate)}</h2>
            <button onClick={handleNextMonth} className="text-[#111111] no-print" aria-label="Next month"><ChevronRight size={24} strokeWidth={2} /></button>
          </div>
          <div className="flex gap-[9px] no-print">
            <div className="relative">
              <select
                value={calendarView}
                onChange={(e) => setCalendarView(e.target.value)}
                className="h-[41px] w-[140px] appearance-none rounded-[9px] bg-[#ffa313] px-[16px] pr-[38px] text-[14px] font-semibold text-white outline-none"
              >
                <option value="Month" className="bg-white text-[#111111]">Month</option>
                <option value="Week" className="bg-white text-[#111111]">Week</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-[14px] top-1/2 -translate-y-1/2 text-white" size={18} strokeWidth={1.8} />
            </div>
            <div className="relative">
              <select
                value={weekView}
                onChange={(e) => setWeekView(e.target.value)}
                className="h-[41px] w-[140px] appearance-none rounded-[9px] border border-[#d6d6d6] bg-white px-[16px] pr-[38px] text-[14px] font-semibold text-[#666666] outline-none"
              >
                <option value="Week" className="bg-white text-[#111111]">Week</option>
                <option value="Month" className="bg-white text-[#111111]">Month</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-[14px] top-1/2 -translate-y-1/2 text-[#666666]" size={18} strokeWidth={1.8} />
            </div>
          </div>
        </div>

        <div className="mb-[25px] rounded-[8px] border border-[#dddddd] bg-white px-[24px] pb-[24px] pt-[35px]">
          <div className="grid grid-cols-7 gap-[8px]">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="pb-[17px] text-center text-[16px] font-normal leading-none text-[#666666]">{day}</div>
            ))}
            {daysInMonth.map((date, idx) => {
              const dateStr = date ? formatLocalDate(date) : "";
              const daySessions = sessions.filter((session) => session.date === dateStr);
              const isHighlighted = dateStr === "2024-11-27";

              return (
                <div key={`${dateStr || "empty"}-${idx}`} className={`min-h-[121px] rounded-[8px] border border-[#dddddd] px-[10px] py-[12px] ${date ? "bg-white" : "bg-[#f6f7f8]"}`}>
                  {date && (
                    <>
                      <span className={`mb-[8px] flex h-[32px] w-[32px] items-center justify-center text-[16px] font-normal leading-none ${isHighlighted ? "rounded-full bg-[#ffa313] text-white" : "text-[#111111]"}`}>
                        {date.getDate()}
                      </span>
                      <div className="space-y-[4px]">
                        {daySessions.map((session) => (
                          <div key={session.id} className="flex h-[48px] items-center truncate rounded-[4px] bg-[#ffa313] px-[8px] text-[12px] font-normal text-white">
                            {session.student}
                          </div>
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
            {sortedSessions.map((session) => (
              <div key={session.id} className="flex min-h-[80px] items-center justify-between rounded-[8px] border border-[#dddddd] bg-white px-[16px] py-[10px]">
                <div className="flex items-center gap-[16px]">
                  <div className="flex h-[50px] w-[48px] shrink-0 items-center justify-center rounded-[9px] bg-[#ffa313] text-[16px] font-normal text-white">
                    {Number(session.date.split("-")[2])}
                  </div>
                  <div>
                    <h4 className="text-[15px] font-semibold leading-none text-[#111111]">{session.student}</h4>
                    <p className="mt-[7px] text-[12px] font-normal leading-[1.2] text-[#666666]">{session.type} &bull;<br />{session.date}</p>
                  </div>
                </div>
                <button onClick={() => { setSelectedSession(session); setIsDetailsOpen(true); }} className="h-[39px] rounded-[8px] border border-[#dddddd] bg-white px-[18px] text-[14px] font-normal text-[#666666] transition hover:bg-[#f7f7f7] no-print">
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal isOpen={isNewSessionOpen} onClose={() => setIsNewSessionOpen(false)} title="Schedule New Session">
        <form onSubmit={handleCreateSession}>
          <div className="px-[24px] pb-[30px] pt-[28px]">
            <div className="mb-[16px]">
              <label className="mb-[10px] block text-[16px] font-normal leading-none text-[#657183]">Student<span className="text-[#ff4d4f]">*</span></label>
              <div className="relative">
                <select required value={formData.student} onChange={(e) => setFormData({ ...formData, student: e.target.value })} className="h-[43px] w-full appearance-none rounded-[8px] border border-[#d6dce3] bg-white px-[10px] pr-[42px] text-[16px] font-normal text-[#666666] outline-none focus:border-[#ffa313]">
                  <option value="">Select a student...</option>
                  {STUDENTS.map((student) => <option key={student} value={student}>{student}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-[13px] top-1/2 -translate-y-1/2 text-[#657183]" size={20} strokeWidth={1.8} />
              </div>
            </div>
            <div className="mb-[16px]">
              <label className="mb-[10px] block text-[16px] font-normal leading-none text-[#657183]">Session Type<span className="text-[#ff4d4f]">*</span></label>
              <div className="relative">
                <select required value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="h-[43px] w-full appearance-none rounded-[8px] border border-[#d6dce3] bg-white px-[10px] pr-[42px] text-[16px] font-normal text-[#666666] outline-none focus:border-[#ffa313]">
                  <option value="">Select session type...</option>
                  {SESSION_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-[13px] top-1/2 -translate-y-1/2 text-[#657183]" size={20} strokeWidth={1.8} />
              </div>
            </div>
            <div className="mb-[17px] grid grid-cols-1 gap-[16px] sm:grid-cols-2">
              <div>
                <label className="mb-[10px] block text-[16px] font-normal leading-none text-[#657183]">Date<span className="text-[#ff4d4f]">*</span></label>
                <input type="text" required value={formData.date} placeholder="DD/MM/YYYY" onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="h-[43px] w-full rounded-[8px] border border-[#d6dce3] bg-white px-[10px] text-[16px] font-normal text-[#2d3b4f] outline-none placeholder:text-[#8d949e] focus:border-[#ffa313]" />
              </div>
              <div>
                <label className="mb-[10px] block text-[16px] font-normal leading-none text-[#657183]">Time<span className="text-[#ff4d4f]">*</span></label>
                <input type="time" required value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} className="h-[43px] w-full rounded-[8px] border border-[#d6dce3] bg-white px-[10px] text-[16px] font-normal text-[#2d3b4f] outline-none focus:border-[#ffa313]" />
              </div>
            </div>
            <div className="mb-[17px]">
              <label className="mb-[10px] block text-[16px] font-normal leading-none text-[#657183]">Location</label>
              <div className="relative">
                <MapPin className="absolute left-[13px] top-1/2 -translate-y-1/2 text-[#657183]" size={20} strokeWidth={1.8} />
                <input type="text" value={formData.location} placeholder="e.g., Library Room 301, Virtual Meeting" onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="h-[43px] w-full rounded-[8px] border border-[#d6dce3] bg-white pl-[41px] pr-[10px] text-[16px] font-normal text-[#2d3b4f] outline-none placeholder:text-[#9aa3af] focus:border-[#ffa313]" />
              </div>
            </div>
            <div>
              <label className="mb-[10px] block text-[16px] font-normal leading-none text-[#657183]">Session Notes</label>
              <textarea value={formData.notes} placeholder="Add any notes or objectives for this session..." onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="h-[112px] w-full resize-none rounded-[8px] border border-[#d6dce3] bg-white px-[16px] py-[13px] text-[16px] font-normal text-[#2d3b4f] outline-none placeholder:text-[#9aa3af] focus:border-[#ffa313]" />
            </div>
          </div>
          <div className="flex h-[88px] items-center justify-end gap-[12px] border-t border-[#dddddd] px-[24px]">
            <button type="button" onClick={() => setIsNewSessionOpen(false)} className="h-[38px] rounded-[8px] border border-[#d6dce3] bg-white px-[21px] text-[14px] font-semibold text-[#2d3b4f] transition hover:bg-[#f7f8fa]">Cancel</button>
            <button type="submit" className="flex h-[38px] items-center justify-center gap-[7px] rounded-[8px] bg-[#ffa313] px-[23px] text-[14px] font-semibold text-white transition hover:bg-[#f59a0d]">
              <CalendarIcon size={16} strokeWidth={1.8} /> Create Session
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} title="Session Details">
        {selectedSession && (
          <>
            <div className="px-[24px] pb-[24px] pt-[25px]">
              <div className="mb-[20px] space-y-[17px]">
                <div className="flex items-start gap-[13px]">
                  <User size={21} strokeWidth={1.8} className="mt-[2px] shrink-0 text-[#657183]" />
                  <div>
                    <p className="text-[13px] font-normal leading-none text-[#657183]">Student</p>
                    <p className="mt-[7px] text-[15px] font-normal leading-none text-[#2d3b4f]">{selectedSession.student}</p>
                  </div>
                </div>
                <div className="flex items-start gap-[13px]">
                  <Clock size={21} strokeWidth={1.8} className="mt-[1px] shrink-0 text-[#657183]" />
                  <div>
                    <p className="text-[13px] font-normal leading-none text-[#657183]">Date &amp; Time</p>
                    <p className="mt-[7px] text-[15px] font-normal leading-[1.25] text-[#2d3b4f]">{selectedSession.date} at {selectedSession.time}</p>
                  </div>
                </div>
                <div className="flex items-start gap-[13px]">
                  <MapPin size={21} strokeWidth={1.8} className="mt-[1px] shrink-0 text-[#657183]" />
                  <div>
                    <p className="text-[13px] font-normal leading-none text-[#657183]">Location</p>
                    <p className="mt-[7px] text-[15px] font-normal leading-none text-[#2d3b4f]">{selectedSession.location || "N/A"}</p>
                  </div>
                </div>
              </div>
              <div className="border-y border-[#dddddd] py-[19px]">
                <p className="mb-[10px] text-[13px] font-normal leading-none text-[#657183]">Session Type</p>
                <span className="inline-flex h-[28px] items-center rounded-full bg-[#ffa313] px-[12px] text-[16px] font-normal leading-none text-white">{selectedSession.type}</span>
              </div>
              <div className="pt-[20px]">
                <p className="mb-[13px] text-[13px] font-normal leading-none text-[#657183]">Notes</p>
                <p className="text-[15px] font-normal leading-none text-[#2d3b4f]">{selectedSession.notes || "No notes available."}</p>
              </div>
            </div>
            <div className="flex h-[87px] items-center justify-end gap-[12px] border-t border-[#dddddd] px-[24px]">
              <button onClick={() => setIsDetailsOpen(false)} className="h-[39px] rounded-[8px] border border-[#d6dce3] bg-white px-[22px] text-[14px] font-semibold text-[#2d3b4f] transition hover:bg-[#f7f8fa]">Close</button>
              <button className="h-[39px] rounded-[8px] bg-[#ffa313] px-[22px] text-[14px] font-semibold text-white transition hover:bg-[#f59a0d]">Start Session</button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
