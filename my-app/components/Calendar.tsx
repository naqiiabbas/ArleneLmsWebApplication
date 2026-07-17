"use client";

import React, { useState, useMemo } from 'react';
import { Poppins } from 'next/font/google';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  MapPin,
  Plus,
  Users,
  Video,
  X,
} from 'lucide-react';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
});

// --- Types ---
type SessionType = 'In-Person' | 'Virtual' | 'Deadline' | 'Workshop';

interface Session {
  id: string;
  title: string;
  mentor: string;
  time: string;
  endTime: string;
  location: string;
  type: SessionType;
  date: string; // YYYY-MM-DD
  description: string;
  agenda: string[];
}

// --- Data Objects ---
const SESSIONS_DATA: Session[] = [
  {
    id: 's1',
    title: "Career Development Session",
    mentor: "Dr. Sarah Mitchell",
    time: "2:00 PM",
    endTime: "3:30 PM",
    location: "Room 304, Building A",
    type: "In-Person",
    date: "2025-11-25",
    description: "Join us for an in-depth career development session where we'll discuss your career goals, explore potential career paths, and create an actionable plan for achieving your professional objectives. We'll also review your resume and discuss strategies for job searching and networking.",
    agenda: ["Review current skills and interests", "Explore career opportunities", "Create 90-day action plan", "Resume review and feedback"]
  },
  {
    id: 's2',
    title: "Document Submission Deadline",
    mentor: "Admin Office",
    time: "5:00 PM",
    endTime: "5:00 PM",
    location: "Online Portal",
    type: "Deadline",
    date: "2025-11-27",
    description: "Final deadline for submitting your monthly progress reports and attendance verification sheets.",
    agenda: ["Upload PDF documents", "Verify digital signature"]
  },
  {
    id: 's3',
    title: "Progress Review Meeting",
    mentor: "Prof. James Wilson",
    time: "10:00 AM",
    endTime: "11:00 AM",
    location: "Virtual Meeting",
    type: "Virtual",
    date: "2025-11-28",
    description: "One-on-one meeting to discuss your academic progress and project milestones.",
    agenda: ["Milestone check-in", "Feedback session", "Next steps planning"]
  },
  {
    id: 's4',
    title: "Skills Workshop",
    mentor: "Multiple Mentors",
    time: "3:00 PM",
    endTime: "5:00 PM",
    location: "Conference Hall",
    type: "Workshop",
    date: "2025-11-29",
    description: "Hands-on workshop focused on technical skill acquisition and collaborative problem solving.",
    agenda: ["Technical introduction", "Group exercise", "Project showcase"]
  }
];

// --- Components ---

const SessionModal = ({ session, isOpen, onClose, onAddToCalendar }: { 
  session: Session | null, 
  isOpen: boolean, 
  onClose: () => void,
  onAddToCalendar: (session: Session) => void
}) => {
  if (!isOpen || !session) return null;

  const typeColors: Record<SessionType, string> = {
    'In-Person': 'bg-[#E0F2FE] text-[#0284C7]',
    'Virtual': 'bg-[#F3E8FF] text-[#7C3AED]',
    'Deadline': 'bg-[#FFF7ED] text-[#EA580C]',
    'Workshop': 'bg-[#DCFCE7] text-[#16A34A]',
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto bg-black/40 p-4 font-sans">
      <div className="my-auto flex max-h-[calc(100vh-32px)] w-full max-w-[672px] flex-col overflow-hidden rounded-[10px] bg-white shadow-2xl">
        <div className="shrink-0 border-b border-[#dddddd] px-[24px] py-[25px]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-[12px]">
                <h2 className="text-[24px] font-normal leading-none text-[#111111]">{session.title}</h2>
                <span className={`rounded-[5px] px-[12px] py-[6px] text-[12px] font-normal leading-none ${typeColors[session.type]}`}>{session.type}</span>
              </div>
              <p className="mt-[14px] flex items-center gap-[5px] text-[14px] font-normal leading-none text-[#666666]">
                <Clock size={15} strokeWidth={1.8} />
                Mar 8, 2026 &bull; {session.time} - {session.endTime}
              </p>
            </div>
            <button onClick={onClose} className="mt-[8px] text-[#666666] transition-colors hover:text-[#111111]" aria-label="Close session details">
              <X size={24} strokeWidth={2} />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-[24px] pb-[24px] pt-[25px]">
          <div className="flex min-h-[80px] items-center gap-[16px] rounded-[8px] bg-[#f4f4f4] px-[16px] py-[16px]">
            <div className="h-[48px] w-[48px] shrink-0 overflow-hidden rounded-full bg-gray-200">
              <img src="https://i.pravatar.cc/96?u=sarah-mitchell-calendar" alt={session.mentor} className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="text-[14px] font-normal leading-none text-[#666666]">Hosted by</p>
              <p className="mt-[7px] text-[16px] font-normal leading-none text-[#111111]">{session.mentor}</p>
            </div>
          </div>

          <div className="mt-[27px] flex items-start gap-[13px]">
            <MapPin className="mt-[2px] h-[19px] w-[19px] shrink-0 text-[#666666]" strokeWidth={1.8} />
            <div>
              <p className="text-[14px] font-normal leading-none text-[#666666]">Location</p>
              <p className="mt-[13px] text-[16px] font-normal leading-none text-[#111111]">{session.location}</p>
            </div>
          </div>

          <div className="mt-[29px]">
            <h4 className="text-[18px] font-semibold leading-none text-[#111111]">Description</h4>
            <p className="mt-[16px] text-[16px] font-normal leading-[1.6] text-[#666666]">{session.description}</p>
          </div>

          <div className="mt-[28px]">
            <h4 className="text-[16px] font-normal leading-none text-[#111111]">Agenda</h4>
            <div className="mt-[19px] space-y-[13px]">
              {session.agenda.map((item, idx) => (
                <div key={item} className="flex items-center gap-[12px]">
                  <div className="flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full bg-[#e0f2fe] text-[12px] font-normal leading-none text-[#0284c7]">{idx + 1}</div>
                  <span className="text-[16px] font-normal leading-none text-[#666666]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-[#dddddd] bg-[#f4f4f4] px-[24px] py-[24px]">
          <div className="grid grid-cols-1 gap-[12px] sm:grid-cols-2">
            <button onClick={onClose} className="h-[49px] rounded-[9px] border border-[#dddddd] bg-white px-4 text-[16px] font-normal text-[#666666] transition hover:bg-[#fafafa]">Close</button>
            <button 
              onClick={() => onAddToCalendar(session)}
              className="flex h-[49px] items-center justify-center gap-[4px] rounded-[9px] bg-[#ffa313] px-4 text-[16px] font-normal text-white transition hover:bg-[#f59a0d]"
            >
              <Plus size={20} strokeWidth={2} />
              Add to Calendar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CalendarSection = () => {
  const [filter, setFilter] = useState<SessionType | 'All Types'>('All Types');
  
  // -- NEW WORKABLE CALENDAR LOGIC --
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 1)); // Default Nov 2025
  const [selectedDay, setSelectedDay] = useState(25);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [scheduledSessions, setScheduledSessions] = useState<Session[]>([]);

  // Month Navigation
  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  // Dynamic Days Generation
  const calendarGrid = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [currentDate]);

  // Filter based on Current View
  const filteredSessions = useMemo(() => {
    const y = currentDate.getFullYear();
    const m = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const d = selectedDay.toString().padStart(2, '0');
    const fullSelectedDate = `${y}-${m}-${d}`;

    return SESSIONS_DATA.filter(s => {
      const matchesDay = s.date === fullSelectedDate;
      const matchesType = filter === 'All Types' ? true : s.type === filter;
      return matchesDay && matchesType;
    });
  }, [filter, selectedDay, currentDate]);

  const upcomingSessions = useMemo(() => {
    const mStr = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const yStr = currentDate.getFullYear().toString();

    return SESSIONS_DATA.filter(s => {
      const matchesMonth = s.date.startsWith(`${yStr}-${mStr}`);
      const matchesType = filter === 'All Types' ? true : s.type === filter;
      return matchesMonth && matchesType;
    });
  }, [filter, currentDate]);

  // Dots logic for current month
  const sessionDaysInMonth = useMemo(() => {
    const mStr = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const yStr = currentDate.getFullYear().toString();
    return SESSIONS_DATA
      .filter(s => s.date.startsWith(`${yStr}-${mStr}`))
      .map(s => parseInt(s.date.split('-')[2]));
  }, [currentDate]);

  const handleAddToCalendar = (session: Session) => {
    if (!scheduledSessions.find(s => s.id === session.id)) {
      setScheduledSessions([...scheduledSessions, session]);
    }
    setSelectedSession(null);
  };

  return (
    <section className={`${poppins.variable} min-h-full w-full overflow-x-hidden bg-[#f5f5f5] px-4 pb-6 pt-6 font-sans md:px-6 md:pt-7`}>
      <header>
        <h2 className="text-[24px] font-semibold leading-none text-[#111111]">Calendar</h2>
        <p className="mt-[14px] text-[16px] font-normal leading-none text-[#666666]">Manage your mentoring sessions and events</p>
      </header>

      <div className="mt-[26px] grid grid-cols-1 gap-[18px] xl:grid-cols-[1fr_355px]">
        <div className="rounded-[12px] border border-[#dddddd] bg-white px-[22px] py-[24px]">
          <div className="mb-[16px] flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-[22px]">
              <button onClick={handlePrevMonth} className="mt-[6px] text-[#666666] transition-colors hover:text-[#111111]" aria-label="Previous month">
                <ChevronLeft size={22} strokeWidth={2} />
              </button>
              <h3 className="min-w-[112px] text-[20px] font-normal leading-[1.45] text-[#111111]">
                {currentDate.toLocaleString('default', { month: 'long' })}
                <br />
                {currentDate.getFullYear()}
              </h3>
              <button onClick={handleNextMonth} className="mt-[6px] text-[#666666] transition-colors hover:text-[#111111]" aria-label="Next month">
                <ChevronRight size={22} strokeWidth={2} />
              </button>
            </div>
            <div className="flex items-center gap-[18px]">
              <button className="h-[36px] rounded-[9px] bg-[#ffa313] px-[18px] text-[14px] font-normal text-white">Month</button>
              <button className="h-[36px] px-[4px] text-[14px] font-normal text-[#666666]">Week</button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-[8px]">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="pb-[12px] text-center text-[14px] font-normal text-[#666666]">{d}</div>
            ))}
            
            {calendarGrid.map((day, i) => {
              if (day === null) return <div key={`empty-${i}`} />;
              const isSelected = day === selectedDay;
              const hasDot = sessionDaysInMonth.includes(day);
              
              return (
                <div key={day} className="flex justify-center">
                  <button 
                    onClick={() => setSelectedDay(day)}
                    className={`relative flex aspect-square w-full max-w-[92px] items-center justify-center rounded-[9px] border text-[14px] font-normal transition-all ${
                      isSelected
                        ? 'border-[#ffa313] bg-[#ffa313] text-white'
                        : 'border-[#d7d7d7] bg-white text-[#111111] hover:bg-[#fff8ef]'
                    }`}
                  >
                    {day}
                    {hasDot && <span className={`absolute bottom-[8px] h-[4px] w-[4px] rounded-full ${isSelected ? 'bg-white' : 'bg-[#ffa313]'}`} />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-[12px] border border-[#dddddd] bg-white px-[23px] py-[28px]">
          <div className="mb-[16px] flex items-center justify-between gap-3">
            <h4 className="text-[20px] font-normal leading-none text-[#111111]">Upcoming Session</h4>
            <div className="relative">
              <select
                className="h-[32px] w-[107px] cursor-pointer appearance-none rounded-[9px] bg-[#f1f1f1] pl-[15px] pr-[30px] text-[12px] font-normal text-[#111111] outline-none"
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
              >
                <option>All Types</option>
                <option>In-Person</option>
                <option>Virtual</option>
                <option>Deadline</option>
                <option>Workshop</option>
              </select>
              <Filter className="pointer-events-none absolute right-[10px] top-1/2 -translate-y-1/2 text-[#666666]" size={13} strokeWidth={1.8} />
            </div>
          </div>

          <div className="space-y-[16px]">
            {upcomingSessions.length > 0 ? (
              upcomingSessions.map((s) => {
                const typeStyle: Record<SessionType, { border: string, text: string, bg: string, card: string, icon: 'users' | 'clock' | 'map' | 'video' }> = {
                  'In-Person': { border: 'border-l-[#ffa313]', text: 'text-[#ffa313]', bg: 'bg-[#fff8ef]', card: 'bg-[#fbf7ef]', icon: 'map' },
                  'Deadline': { border: 'border-l-[#ffa313]', text: 'text-[#ffa313]', bg: 'bg-[#fff4df]', card: 'bg-[#fff3de]', icon: 'clock' },
                  'Virtual': { border: 'border-l-[#a020f0]', text: 'text-[#a020f0]', bg: 'bg-[#f2e2f5]', card: 'bg-[#f0e3f2]', icon: 'video' },
                  'Workshop': { border: 'border-l-[#10c79a]', text: 'text-[#10c79a]', bg: 'bg-[#e8f8ec]', card: 'bg-[#e8f6ea]', icon: 'map' },
                };
                const isDeadline = s.type === 'Deadline';
                const locationIcon = typeStyle[s.type].icon === 'video' ? Video : MapPin;
                const LocationIcon = locationIcon;

                return (
                  <button 
                    key={s.id} 
                    onClick={() => setSelectedSession(s)}
                    className={`min-h-[88px] w-full rounded-[9px] border-l-[3px] px-[16px] py-[16px] text-left transition-transform active:scale-95 ${typeStyle[s.type].border} ${typeStyle[s.type].card}`}
                  >
                    <div className="mb-[12px] flex items-start justify-between gap-2">
                      <h5 className="truncate text-[15px] font-normal leading-none text-[#111111]">{s.title}</h5>
                      <span className={`shrink-0 rounded-[5px] px-[7px] py-[5px] text-[12px] font-normal leading-none ${typeStyle[s.type].bg} ${typeStyle[s.type].text}`}>{s.type}</span>
                    </div>
                    <div className="space-y-[8px] text-[12px] font-normal leading-none text-[#666666]">
                      {!isDeadline && (
                        <div className="flex items-center gap-[8px]">
                          <Users size={13} strokeWidth={1.8} />
                          {s.mentor}
                        </div>
                      )}
                      <div className="flex items-center gap-[8px]">
                        <Clock size={13} strokeWidth={1.8} />
                        {isDeadline ? s.time : `${s.time} - ${s.endTime}`}
                      </div>
                      {!isDeadline && (
                        <div className="flex items-center gap-[8px]">
                          <LocationIcon size={13} strokeWidth={1.8} />
                          {s.location}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="py-12 text-center opacity-60">
                <p className="text-[#9CA3AF] text-[14px] font-bold">No upcoming sessions for this date.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-[26px] rounded-[12px] border border-[#dddddd] bg-white px-[23px] py-[24px]">
        <div className="mb-[22px] flex items-center gap-[10px]">
          <div className="h-[32px] w-[3px] bg-[#ffa313]" />
          <h4 className="text-[20px] font-normal leading-none text-[#111111]">Today&apos;s Schedule</h4>
        </div>

        <div>
          {filteredSessions.length > 0 ? (
            filteredSessions.map((session) => (
              <div key={session.id} className="flex min-h-[104px] flex-col justify-between gap-4 rounded-[9px] bg-[#fbf7ef] px-[17px] py-[18px] sm:flex-row sm:items-center">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-[18px]">
                  <div className="min-w-[74px]">
                    <p className="text-[16px] font-normal leading-none text-[#ffa313]">{session.time}</p>
                    <p className="mt-[8px] text-[12px] font-normal leading-none text-[#666666]">1h 30m</p>
                  </div>
                  <div>
                    <h5 className="text-[16px] font-normal leading-none text-[#111111]">{session.title}</h5>
                    <p className="mt-[13px] text-[14px] font-normal leading-none text-[#666666]">with {session.mentor}</p>
                    <div className="mt-[13px] flex items-center gap-[8px] text-[12px] font-normal leading-none text-[#666666]">
                        <MapPin size={13} strokeWidth={1.8} />
                        {session.location}
                    </div>
                  </div>
                </div>
                <button className="h-[35px] w-full rounded-[9px] bg-[#ffa313] px-[20px] text-[14px] font-normal text-white transition-transform hover:scale-105 sm:w-[60px]">Join</button>
              </div>
            ))
          ) : (
            <div className="py-[24px] text-center">
              <p className="text-[15px] font-normal text-[#666666]">No more sessions scheduled for today</p>
            </div>
          )}
          {filteredSessions.length > 0 && (
            <div className="py-[32px] text-center">
              <p className="text-[15px] font-normal text-[#666666]">No more sessions scheduled for today</p>
            </div>
          )}
        </div>
      </div>

      <SessionModal 
        isOpen={!!selectedSession} 
        session={selectedSession} 
        onClose={() => setSelectedSession(null)} 
        onAddToCalendar={handleAddToCalendar}
      />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
      `}</style>
    </section>
  );
};

export default CalendarSection;

