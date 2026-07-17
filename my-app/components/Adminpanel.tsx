"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  X, 
  ChevronRight,
  Plus,
} from "lucide-react";

// --- TYPES ---
type Session = {
  id: string;
  title: string;
  mentor: string;
  student: string;
  time: string;
  date: string;
  duration: string;
  status: "Ongoing" | "Scheduled" | "Completed" | string;
  link: string;
  description: string;
  objectives: string[];
  notes: string;
};

type PersonBase = { id: number; name: string; email: string; phone: string; };
type Student = PersonBase & { status: string };
type Mentor = PersonBase & { sessions: number; status: string };

// --- DATA ---
const DASHBOARD_STATS = [
  { id: 1, label: "Total Students", value: "248", trend: "+12%", icon: "/images/admin-icon-17.svg" },
  { id: 2, label: "Total Mentors", value: "32", trend: "+3", icon: "/images/admin-icon-18.svg" },
  { id: 3, label: "Today's Sessions", value: "18", trend: "5 ongoing", icon: "/images/admin-icon-19.svg" },
  { id: 4, label: "Pending Approvals", value: "7", trend: "3 urgent", icon: "/images/admin-icon-20.svg" },
];

const INITIAL_SESSIONS: Session[] = [
  { id: "1", title: "Python Fundamentals", mentor: "Dr. Sarah Johnson", student: "Alex Martinez", time: "09:00 AM - 10:00 AM", date: "2025-01-26", duration: "60 min", status: "Ongoing", link: "https://meet.google.com/abc-defg-hij", description: "Introduction to Python programming basics, covering variables, data types, and basic operations.", objectives: ["Understand Python syntax", "Learn about variables and data types", "Practice basic operations"], notes: "Student has completed homework assignments and is ready to move forward." },
  { id: "2", title: "Web Development", mentor: "Prof. Michael Chen", student: "Emma Williams", time: "10:30 AM - 11:30 AM", date: "2025-01-26", duration: "60 min", status: "Scheduled", link: "https://meet.google.com/web-session", description: "Deep dive into CSS Grid and Flexbox layouts.", objectives: ["Master Flexbox", "Master CSS Grid"], notes: "Focus on responsive design." },
  { id: "3", title: "Data Science Intro", mentor: "Dr. Lisa Anderson", student: "James Taylor", time: "11:00 AM - 12:00 PM", date: "2025-01-27", duration: "60 min", status: "Ongoing", link: "https://meet.google.com/data-sci", description: "Foundations of data analysis.", objectives: ["Numpy basics"], notes: "" },
  { id: "4", title: "Machine Learning", mentor: "Prof. Robert Kim", student: "Sophia Brown", time: "02:00 PM - 03:00 PM", date: "2025-01-27", duration: "60 min", status: "Scheduled", link: "", description: "", objectives: [], notes: "" },
];

const STUDENTS_LIST: Student[] = [
  { id: 1, name: "Alex Martinez", email: "alex.m@email.com", phone: "+1 234-567-8901", status: "active" },
  { id: 2, name: "Emma Williams", email: "emma.w@email.com", phone: "+1 234-567-8902", status: "active" },
  { id: 3, name: "James Taylor", email: "james.t@email.com", phone: "+1 234-567-8903", status: "active" },
];

const MENTORS_LIST: Mentor[] = [
  { id: 1, name: "Dr. Sarah Johnson", email: "sarah.j@email.com", phone: "+1 234-567-9001", sessions: 12, status: "active" },
  { id: 2, name: "Prof. Michael Chen", email: "michael.c@email.com", phone: "+1 234-567-9002", sessions: 8, status: "active" },
];

// --- MODAL WRAPPER ---
const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title?: string; children: React.ReactNode; }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} className="text-gray-500" /></button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

const IconImg = ({ src, className = "h-[18px] w-[18px]" }: { src: string; className?: string }) => (
  <img src={src} alt="" aria-hidden="true" className={className} />
);

export default function AdminDashboard() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>(INITIAL_SESSIONS);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Session>>({});

  // Filters State
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [dateFilter, setDateFilter] = useState("");

  // Logic: Filtered Sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      const matchesStatus = statusFilter === "All Status" || session.status === statusFilter;
      const matchesDate = !dateFilter || session.date === dateFilter;
      return matchesStatus && matchesDate;
    });
  }, [sessions, statusFilter, dateFilter]);

  const handleView = (session: Session) => {
    setSelectedSession(session);
    setIsViewModalOpen(true);
  };

  const handleEdit = (session: Session) => {
    setFormData(session);
    setSelectedSession(session);
    setIsEditModalOpen(true);
    if(isViewModalOpen) setIsViewModalOpen(false); // Close view if opening edit
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setSessions(prev => prev.map(s => s.id === formData.id ? { ...s, ...formData } as Session : s));
    setIsEditModalOpen(false);
    setSelectedSession(null);
  };

  const markComplete = (id: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, status: "Completed" } : s));
    setIsViewModalOpen(false);
  };

  return (
    <div className="bg-[#f4f4f4] px-4 pb-0 pt-5 font-[Poppins] text-sm md:px-6">
      
      {/* 1. Top Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4 md:gap-5">
        {DASHBOARD_STATS.map((stat) => (
          <div key={stat.id} className="relative h-[126px] overflow-hidden rounded-[8px] border border-[#dddddd] bg-white px-[18px] py-[18px]">
            <div className="mb-[18px] flex items-start justify-between">
              <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[8px] bg-[#fff7e8]">
                <img src={stat.icon} alt="" aria-hidden="true" className="h-5 w-5" />
              </div>
              <TrendingUpIcon />
            </div>
            <div className="h-px w-full bg-[#ffa313]" />
            <div className="mt-[12px] text-[12px] font-medium leading-none text-[#666666]">{stat.label}</div>
            <div className="mt-[12px] flex items-baseline justify-between">
              <span className="text-[12px] font-semibold leading-none text-[#666666]">{stat.value}</span>
              <span className="text-[11px] font-medium leading-none text-[#9b9b9b]">{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 2. Sessions Table with Logic */}
      <div className="mb-5 overflow-hidden rounded-[8px] border border-[#dddddd] bg-white">
        <div className="border-b border-[#eeeeee] px-[16px] pb-[16px] pt-[17px]">
          <div className="mb-[17px] flex items-center justify-between">
            <h3 className="text-[19px] font-semibold leading-none text-[#242424]">Today's Mentoring Sessions</h3>
            <button className="flex h-[31px] items-center gap-[6px] rounded-[5px] px-2 text-[12px] font-medium text-[#F9A618]">
              <img src="/images/admin-icon-21.svg" alt="" aria-hidden="true" className="h-[15px] w-[15px]" />
              Filter
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-[34px] w-[116px] rounded-[5px] border border-[#dddddd] bg-white px-3 text-[11px] text-[#777777] outline-none"
            >
              <option>All Status</option>
              <option>Ongoing</option>
              <option>Scheduled</option>
              <option>Completed</option>
            </select>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="h-[34px] w-[130px] rounded-[5px] border border-[#dddddd] bg-white px-3 text-[11px] text-[#777777] outline-none"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#f4f4f4] text-[11px] font-medium text-[#777777]">
              <tr>
                <th className="px-4 py-[14px]">Session Title</th>
                <th className="px-4 py-[14px]">Mentor</th>
                <th className="px-4 py-[14px]">Student</th>
                <th className="px-4 py-[14px]">Time</th>
                <th className="px-4 py-[14px]">Status</th>
                <th className="px-4 py-[14px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eeeeee] text-[#777777]">
              {filteredSessions.length > 0 ? filteredSessions.map((session) => (
                <tr key={session.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-[14px] text-[12px] font-semibold text-[#444444]">{session.title}</td>
                  <td className="px-4 py-[14px] text-[12px]">{session.mentor}</td>
                  <td className="px-4 py-[14px] text-[12px]">{session.student}</td>
                  <td className="px-4 py-[14px] text-[12px]">{session.time}</td>
                  <td className="px-4 py-[14px]">
                    <span className={`px-2 py-[3px] rounded-full text-[10px] font-medium ${
                      session.status === "Ongoing" ? "bg-green-100 text-green-600" : 
                      session.status === "Completed" ? "bg-gray-100 text-gray-500" : "bg-blue-100 text-blue-600"
                    }`}>
                      {session.status}
                    </span>
                  </td>
                  <td className="px-4 py-[14px]">
                    <div className="flex gap-4">
                      <button onClick={() => handleView(session)} title="View Details"><img src="/images/admin-icon-22.svg" alt="" className="h-4 w-4" /></button>
                      <button onClick={() => handleEdit(session)} title="Edit Session"><img src="/images/admin-icon-39.svg" alt="" className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400">No sessions found for this filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Management Sections */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ManagementCard title="Student Management" list={STUDENTS_LIST} type="student" onAddClick={() => router.push("/adminpanel/studentmanagment")} />
        <ManagementCard title="Mentor Management" list={MENTORS_LIST} type="mentor" onAddClick={() => router.push("/adminpanel/mentormanagment")} />
      </div>

      {/* --- VIEW MODAL (Matched to Screenshot 142146) --- */}
      <SessionViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        session={selectedSession}
        onEdit={() => selectedSession && handleEdit(selectedSession)}
        onComplete={() => selectedSession && markComplete(selectedSession.id)}
      />
      {/* --- EDIT MODAL (Matched to Screenshot 142203) --- */}
      <EditSessionModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleSaveEdit}
        formData={formData}
        setFormData={setFormData}
      />
    </div>
  );
}

function SessionViewModal({
  isOpen,
  onClose,
  session,
  onEdit,
  onComplete,
}: {
  isOpen: boolean;
  onClose: () => void;
  session: Session | null;
  onEdit: () => void;
  onComplete: () => void;
}) {
  if (!isOpen || !session) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="max-h-[calc(100vh-24px)] w-full max-w-[766px] overflow-y-auto rounded-[8px] bg-white font-[Poppins] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="px-6 pb-6 pt-[26px]">
          <div className="mb-[24px] flex items-start justify-between">
            <div>
              <h2 className="text-[21px] font-normal leading-none text-[#242424]">{session.title}</h2>
              <span className="mt-[14px] inline-flex rounded-full bg-[#dcfce7] px-[12px] py-[5px] text-[13px] leading-none text-[#008236]">
                {session.status}
              </span>
            </div>
            <button onClick={onClose} className="mt-[18px] text-[#777777] hover:text-[#242424]">
              <X size={22} />
            </button>
          </div>

          <div className="mb-[24px] h-px bg-[#dddddd]" />

          <div className="grid gap-4 md:grid-cols-2">
            <PersonCard initials="DSJ" label="Mentor" name={session.mentor} email="sarah.j@email.com" color="#ffa313" />
            <PersonCard initials="AM" label="Student" name={session.student} email="alex.m@email.com" color="#2f7df6" />
          </div>

          <div className="mt-[25px] rounded-[8px] border border-[#dddddd] px-4 pb-[2px] pt-[18px]">
            <h3 className="mb-[32px] text-[15px] font-normal text-[#242424]">Session Details</h3>
            <div className="grid gap-x-[72px] gap-y-[22px] md:grid-cols-2">
              <DetailIcon icon="/images/admin-session-icon-33.svg" label="Date" value="Sunday, January 26, 2025" />
              <DetailIcon icon="/images/admin-session-icon-34.svg" label="Time" value={session.time} />
              <DetailIcon icon="/images/admin-session-icon-35.svg" label="Duration" value={session.duration} />
              <DetailIcon icon="/images/admin-session-icon-36.svg" label="Meeting Link" value="Join Meeting" link={session.link} />
            </div>
          </div>

          <SectionCard icon="/images/admin-session-icon-37.svg" title="Description">
            <p className="text-[15px] leading-[22px] text-[#777777]">{session.description || "No description provided."}</p>
          </SectionCard>

          <SectionCard icon="/images/admin-session-icon-38.svg" title="Learning Objectives">
            <ul className="space-y-[13px] text-[15px] leading-none text-[#777777]">
              {session.objectives.map((objective) => (
                <li key={objective} className="flex items-center gap-[10px]">
                  <span className="h-[3px] w-[3px] rounded-full bg-[#ffa313]" />
                  {objective}
                </li>
              ))}
            </ul>
          </SectionCard>

          <div className="mt-[24px] rounded-[8px] border border-[#ffa313] bg-[#fff7e8] px-4 py-[17px]">
            <h3 className="mb-[14px] text-[15px] font-normal text-[#242424]">Session Notes</h3>
            <p className="text-[15px] leading-[22px] text-[#777777]">{session.notes || "No notes added yet."}</p>
          </div>
        </div>

        <div className="border-t border-[#dddddd] px-6 py-[24px]">
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr]">
            <a href={session.link} target="_blank" className="flex h-[42px] items-center justify-center gap-2 rounded-[8px] bg-[#ffa313] text-[16px] font-medium text-white">
              <IconImg src="/images/admin-session-icon-32.svg" className="h-4 w-4" /> Join Meeting
            </a>
            <button onClick={onComplete} className="flex h-[42px] items-center justify-center rounded-[8px] bg-[#00a63e] text-[16px] font-medium text-white">
              Mark Complete
            </button>
            <button onClick={onEdit} className="flex h-[42px] items-center justify-center gap-2 rounded-[8px] border border-[#dddddd] bg-white text-[16px] font-medium text-[#777777]">
              <IconImg src="/images/admin-icon-39.svg" className="h-4 w-4" /> Edit Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditSessionModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: Partial<Session>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Session>>>;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <form onSubmit={onSubmit} className="max-h-[calc(100vh-24px)] w-full max-w-[766px] overflow-y-auto rounded-[8px] bg-white font-[Poppins] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex h-[84px] items-center justify-between border-b border-[#dddddd] px-6">
          <h2 className="text-[21px] font-normal text-[#242424]">Edit Session</h2>
          <button type="button" onClick={onClose} className="text-[#777777] hover:text-[#242424]">
            <X size={22} />
          </button>
        </div>

        <div className="space-y-[20px] px-6 py-[25px]">
          <h3 className="text-[15px] font-normal text-[#242424]">Basic Information</h3>
          <ModalInput label="Session Title *" value={formData.title || ""} onChange={(value) => setFormData({ ...formData, title: value })} />
          <div className="grid gap-4 md:grid-cols-2">
            <ModalInput label="Mentor *" value={formData.mentor || ""} onChange={(value) => setFormData({ ...formData, mentor: value })} />
            <ModalInput label="Student *" value={formData.student || ""} onChange={(value) => setFormData({ ...formData, student: value })} />
          </div>

          <h3 className="pt-[1px] text-[15px] font-normal text-[#242424]">Schedule</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <ModalInput label="Date *" value={formData.date || ""} onChange={(value) => setFormData({ ...formData, date: value })} />
            <ModalInput label="Time *" value={formData.time || ""} onChange={(value) => setFormData({ ...formData, time: value })} />
            <ModalInput label="Duration *" value={formData.duration || ""} onChange={(value) => setFormData({ ...formData, duration: value })} />
          </div>

          <h3 className="pt-[1px] text-[15px] font-normal text-[#242424]">Type & Location</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <ModalInput label="Session Type *" value={(formData as any).sessionType || ""} onChange={(value) => setFormData({ ...formData, sessionType: value } as any)} />
            <ModalInput label="Status *" value={formData.status || ""} onChange={(value) => setFormData({ ...formData, status: value })} />
          </div>
          <ModalInput label="Meeting Link" value={formData.link || ""} onChange={(value) => setFormData({ ...formData, link: value })} placeholder="https://meet.example.com/python-session-123" />
          <ModalTextarea label="Description" value={formData.description || ""} onChange={(value) => setFormData({ ...formData, description: value })} placeholder="Brief description of what will be covered..." />
          <ModalInput label="Session Notes" value={formData.notes || ""} onChange={(value) => setFormData({ ...formData, notes: value })} placeholder="Any additional notes or preparation required..." />
        </div>

        <div className="flex gap-3 border-t border-[#dddddd] px-6 py-4">
          <button type="submit" className="h-[44px] flex-1 rounded-[8px] bg-[#ffa313] text-[16px] font-medium text-white">Save Changes</button>
          <button type="button" onClick={onClose} className="h-[44px] w-[120px] rounded-[8px] border border-[#dddddd] text-[16px] font-medium text-[#777777]">Cancel</button>
        </div>
      </form>
    </div>
  );
}

function PersonCard({ initials, label, name, email, color }: { initials: string; label: string; name: string; email: string; color: string }) {
  return (
    <div className="flex h-[99px] items-center gap-3 rounded-[8px] bg-[#f4f4f4] px-4">
      <div className="flex h-[40px] w-[40px] items-center justify-center rounded-full text-[16px] font-medium text-white" style={{ backgroundColor: color }}>
        {initials}
      </div>
      <div>
        <p className="text-[13px] leading-[18px] text-[#777777]">{label}</p>
        <p className="text-[15px] leading-[20px] text-[#242424]">{name}</p>
        <p className="mt-[14px] text-[13px] leading-none text-[#777777]">{email}</p>
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
          <a href={link} target="_blank" className="mt-[6px] block text-[15px] leading-none text-[#ffa313]">{value}</a>
        ) : (
          <p className="mt-[6px] text-[15px] leading-none text-[#242424]">{value}</p>
        )}
      </div>
    </div>
  );
}

function SectionCard({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="mt-[24px] rounded-[8px] border border-[#dddddd] px-4 py-[17px]">
      <h3 className="mb-[16px] flex items-center gap-[8px] text-[15px] font-normal text-[#242424]">
        <IconImg src={icon} className="h-[18px] w-[18px]" /> {title}
      </h3>
      {children}
    </div>
  );
}

function ModalInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-[10px] block text-[14px] leading-none text-[#777777]">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-[42px] w-full rounded-[8px] border border-[#dddddd] px-4 text-[16px] text-[#242424] outline-none placeholder:text-[#8d8d8d] focus:border-[#ffa313]" />
    </label>
  );
}

function ModalTextarea({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-[10px] block text-[14px] leading-none text-[#777777]">{label}</span>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3} className="min-h-[91px] w-full resize-none rounded-[8px] border border-[#dddddd] px-4 py-3 text-[16px] text-[#242424] outline-none placeholder:text-[#8d8d8d] focus:border-[#ffa313]" />
    </label>
  );
}

// --- SUB COMPONENTS ---

const ManagementCard = ({ title, list, type, onAddClick }: ManagementCardProps) => (
  <div className="flex min-h-[308px] flex-col overflow-hidden rounded-[8px] border border-[#dddddd] bg-white">
    <div className="flex items-center justify-between border-b border-[#eeeeee] px-[16px] py-[14px]">
      <div className="flex items-center gap-3">
        <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[8px] bg-[#fff7e8]">
          <img src={type === "student" ? "/images/admin-icon-17.svg" : "/images/admin-icon-18.svg"} alt="" className="h-5 w-5" />
        </div>
        <h3 className="text-[17px] font-semibold text-[#242424]">{title}</h3>
      </div>
      <button onClick={onAddClick} className="flex h-[34px] min-w-[86px] items-center justify-center gap-2 rounded-[7px] bg-[#F9A618] px-4 text-[12px] font-medium text-white transition-colors hover:bg-[#f29a0b]"><Plus size={14} /> Add</button>
    </div>
    <div className="divide-y divide-[#eeeeee] px-[14px]">
      {list.map((item) => {
        const isMentor = type === "mentor";
        return (
          <div key={item.id} className="flex min-h-[58px] items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[12px] font-semibold text-[#444444]">{item.name}</p>
              <div>
                <p className="truncate text-[10px] leading-4 text-[#777777]">{item.email}  {item.phone}</p>
                {isMentor && <span className="text-[10px] font-medium leading-4 text-[#F9A618]">{(item as Mentor).sessions} sessions this month</span>}
              </div>
            </div>
            <span className="shrink-0 rounded-full bg-green-100 px-[10px] py-[3px] text-[10px] font-medium text-green-600">active</span>
          </div>
        );
      })}
    </div>
    <div className="mt-auto border-t border-[#eeeeee] p-4 text-center">
      <button className="mx-auto flex items-center gap-5 text-[12px] font-medium leading-[14px] text-[#F9A618] hover:underline">
        <span>View All<br />{type === "student" ? "Students" : "Mentors"}</span>
        <ChevronRight size={14} />
      </button>
    </div>
  </div>
);

const TrendingUpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M23 6L13.5 15.5L8.5 10.5L1 18" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 6H23V12" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

interface ManagementCardProps {
  title: string;
  list: (Student | Mentor)[];
  type: "student" | "mentor";
  onAddClick: () => void;
}
