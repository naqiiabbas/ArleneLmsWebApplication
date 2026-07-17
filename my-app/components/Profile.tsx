"use client";

import React, { useState, useMemo } from 'react';
import { Poppins } from 'next/font/google';
import {
  Award,
  Calendar,
  ChevronDown,
  Clock,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  SquarePen,
  Star,
  Target,
  Users,
  X,
} from 'lucide-react';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

// --- Types ---
type TabType = 'Overview' | 'Progress' | 'Goals' | 'Activity' | 'Mentors';

interface Goal {
  id: string;
  title: string;
  status: 'In Progress' | 'Completed' | 'Not Started';
  dueDate: string;
  progress: number;
}

interface Activity {
  id: string;
  type: 'session' | 'report' | 'badge' | 'goal';
  title: string;
  date: string;
}

interface Mentor {
  id: string;
  name: string;
  role: string;
  department: string;
  image?: string;
  email: string;
  phone: string;
  students: number;
  rating: number;
  availability: 'Available' | 'Limited' | 'Full';
  tags: string[];
  experience: number;
  about: string;
  education: string[];
}

// --- Data Objects ---
const USER_INITIAL_DATA = {
  name: "Alex Johnson",
  major: "Computer Science",
  year: "Sophomore",
  studentId: "CS2025-001",
  gpa: "3.85",
  email: "alex.johnson@university.edu",
  phone: "+1 (555) 123-4567",
  address: "123 University Ave, Campus Building, Room 405",
  dob: "January 15, 2002",
  about: "Passionate computer science student with interests in artificial intelligence and machine learning. Actively participating in mentorship program to enhance professional development and career planning skills.",
  enrollmentDate: "September 2024",
  expectedGraduation: "June 2028"
};

const PERFORMANCE_METRICS = [
  { id: 1, title: 'Sessions Completed', value: '23/25', percent: 92, color: '#00D094' },
  { id: 2, title: 'Documents Submitted', value: '18/20', percent: 90, color: '#F4A11D' },
  { id: 3, title: 'Goals Achieved', value: '7/10', percent: 70, color: '#F4A11D' },
  { id: 4, title: 'Engagement Score', value: '95/100', percent: 95, color: '#7C3AED' },
];

const ACHIEVEMENTS = [
  { id: 1, title: 'Perfect Attendance - Q3', date: 'Oct 2025', color: '#fac73f', icon: '/images/profile-achievement-award.svg' },
  { id: 2, title: 'Top Performer', date: 'Sep 2025', color: '#ff6467', icon: '/images/profile-achievement-star.svg' },
  { id: 3, title: 'Active Participant', date: 'Aug 2025', color: '#11c993', icon: '/images/profile-achievement-trend.svg' },
  { id: 4, title: 'Workshop Completion', date: 'Jul 2025', color: '#2075d1', icon: '/images/profile-achievement-book.svg' },
];

const INITIAL_GOALS: Goal[] = [
  { id: '1', title: 'Complete Machine Learning Certification', status: 'In Progress', dueDate: 'Dec 2025', progress: 65 },
  { id: '2', title: 'Secure Summer Internship', status: 'In Progress', dueDate: 'Jan 2026', progress: 40 },
  { id: '3', title: 'Improve Public Speaking Skills', status: 'Not Started', dueDate: 'Feb 2026', progress: 0 },
  { id: '4', title: 'Build Portfolio Website', status: 'Completed', dueDate: 'Nov 2025', progress: 100 },
];

const ACTIVITIES: Activity[] = [
  { id: '1', type: 'session', title: 'Attended Career Development Session', date: 'Nov 22, 2025' },
  { id: '2', type: 'report', title: 'Submitted Progress Report', date: 'Nov 20, 2025' },
  { id: '3', type: 'badge', title: 'Earned Perfect Attendance Badge', date: 'Nov 15, 2025' },
  { id: '4', type: 'goal', title: 'Updated Career Goals', date: 'Nov 10, 2025' },
];

const MENTORS: Mentor[] = [
  {
    id: 'm1',
    name: "Dr. Sarah Mitchell",
    role: "Senior Career Counselor",
    department: "Career Development",
    image: "https://images.unsplash.com/photo-1583195764036-6dc248ac07d9?w=200&h=200&fit=crop",
    email: "s.mitchell@university.edu",
    phone: "+1 (555) 987-6543",
    students: 12,
    rating: 4.9,
    availability: 'Available',
    tags: ["Career Planning", "Resume Building", "Interview Prep"],
    experience: 10,
    about: "Dr. Sarah Mitchell is a senior career counselor focused on career development, interview preparation, and professional growth planning for undergraduate students.",
    education: ["PhD in Counseling Psychology - Stanford", "MA in Career Counseling - NYU"]
  },
  {
    id: 'm2',
    name: "Prof. Michael Chen",
    role: "AI/ML Research Lead",
    department: "Computer Science",
    image: "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?w=200&h=200&fit=crop",
    email: "m.chen@university.edu",
    phone: "+1 (555) 123-8765",
    students: 8,
    rating: 4.8,
    availability: 'Available',
    tags: ["Machine Learning", "Data Science", "Research Methods"],
    experience: 12,
    about: "Professor Michael Chen is a leading researcher in artificial intelligence and machine learning with multiple publications in top-tier conferences. He guides students through cutting-edge research projects and industry collaborations.",
    education: ["PhD in Computer Science - MIT", "MS in AI - Carnegie Mellon University"]
  },
  {
    id: 'm3',
    name: "Dr. Emily Rodriguez",
    role: "Software Engineering Mentor",
    department: "Computer Science",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop",
    email: "e.rodriguez@university.edu",
    phone: "+1 (555) 456-7890",
    students: 15,
    rating: 4.7,
    availability: 'Limited',
    tags: ["Web Development", "Software Architecture", "Agile Methods"],
    experience: 9,
    about: "Dr. Emily Rodriguez mentors students in modern software engineering practices, full-stack development, and team-based delivery.",
    education: ["PhD in Software Engineering - Georgia Tech", "MS in Computer Science - UCLA"]
  },
  {
    id: 'm4',
    name: "Dr. James Williams",
    role: "Entrepreneurship Advisor",
    department: "Business & Innovation",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    email: "j.williams@university.edu",
    phone: "+1 (555) 234-5678",
    students: 10,
    rating: 4.9,
    availability: 'Available',
    tags: ["Startup Development", "Business Strategy", "Networking"],
    experience: 11,
    about: "Dr. James Williams helps students turn ideas into viable ventures through practical business planning and mentorship.",
    education: ["MBA - Wharton", "PhD in Innovation Studies - Stanford"]
  },
  {
    id: 'm5',
    name: "Prof. Lisa Anderson",
    role: "Academic Success Coach",
    department: "Student Services",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
    email: "l.anderson@university.edu",
    phone: "+1 (555) 345-6789",
    students: 14,
    rating: 4.8,
    availability: 'Available',
    tags: ["Study Skills", "Time Management", "Academic Writing"],
    experience: 8,
    about: "Prof. Lisa Anderson supports students with academic planning, study systems, writing, and long-term success habits.",
    education: ["MA in Education - Columbia", "BA in English - Boston University"]
  },
  {
    id: 'm6',
    name: "Dr. Robert Taylor",
    role: "Research Methodology Expert",
    department: "Graduate Studies",
    image: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=200&h=200&fit=crop",
    email: "r.taylor@university.edu",
    phone: "+1 (555) 567-8901",
    students: 18,
    rating: 4.6,
    availability: 'Full',
    tags: ["Research Design", "Data Analysis", "Publication Strategy"],
    experience: 14,
    about: "Dr. Robert Taylor guides students through research design, analysis planning, and publication strategy.",
    education: ["PhD in Research Methods - University of Chicago", "MS in Statistics - Duke"]
  }
];

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-full max-w-[514px] overflow-hidden rounded-[10px] bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="px-[32px] pb-[32px] pt-[34px]">
          <div className="mb-[32px] flex items-center justify-between gap-4">
            <h3 className="text-[20px] font-normal leading-none text-[#111111]">{title}</h3>
            <button onClick={onClose} className="text-[#666666] transition hover:text-[#111111]" aria-label="Close modal"><X size={22} strokeWidth={1.8} /></button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

const ProfileSection = () => {
  const [activeTab, setActiveTab] = useState<TabType>('Overview');
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(USER_INITIAL_DATA);
  const [goals, setGoals] = useState<Goal[]>(INITIAL_GOALS);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddGoal = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newGoal: Goal = {
      id: Math.random().toString(),
      title: formData.get('title') as string,
      status: formData.get('status') as any,
      dueDate: formData.get('dueDate') as string,
      progress: 0
    };
    setGoals([newGoal, ...goals]);
    setIsGoalModalOpen(false);
  };

  return (
    <div className={`${poppins.variable} min-h-full w-full overflow-x-hidden bg-[#f5f5f5] px-4 pb-6 pt-6 font-sans md:px-6 md:pt-7`}>
      <div className="mb-[26px]">
        <h1 className="text-[24px] font-semibold leading-none text-[#111111]">My Profile</h1>
        <p className="mt-[14px] text-[16px] font-normal leading-none text-[#666666]">Manage your personal information and track your progress</p>
      </div>
      {/* Header Banner */}
      <div className="relative mb-[24px] overflow-hidden rounded-[12px] bg-white">
        <div className="h-[160px] bg-[#ffa313]" />
        {/* Adjusted spacing here to keep content below the yellow box */}
        <div className="relative flex min-h-[160px] flex-col gap-4 px-[32px] pb-[26px] md:flex-row md:items-start">
          <div className="-mt-[10px] h-[128px] w-[128px] shrink-0 overflow-hidden rounded-full border-[5px] border-white bg-white shadow-lg">
            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400" alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0 flex-1 pt-[2px]">
            <h2 className="text-[24px] font-semibold leading-none text-[#111111]">{userData.name}</h2>
            <p className="mt-[13px] text-[16px] font-normal leading-[1.45] text-[#666666]">{userData.major} &bull; {userData.year}</p>
            <p className="mt-[8px] text-[14px] font-normal leading-none text-[#666666]">Student ID: {userData.studentId} <span className="mx-[13px]">&bull;</span> GPA: {userData.gpa}</p>
          </div>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="flex h-[49px] w-full shrink-0 items-center justify-center gap-[10px] rounded-[10px] bg-[#ffa313] px-[25px] text-[16px] font-normal whitespace-nowrap text-white transition-opacity hover:opacity-90 md:mt-[72px] md:w-[170px]"
          >
            <img src="/images/profile-edit-icon.svg" alt="" className="h-[20px] w-[20px] shrink-0" />
            {isEditing ? 'Save Profile' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="mb-0 flex overflow-x-auto rounded-t-[12px] border border-[#dddddd] bg-white no-scrollbar">
        {(['Overview', 'Progress', 'Goals', 'Activity', 'Mentors'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`h-[55px] min-w-[140px] flex-1 border-b text-[16px] font-normal transition-all ${activeTab === tab ? 'border-[#ffa313] text-[#ffa313]' : 'border-transparent text-[#666666] hover:text-[#111111]'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content Area */}
      <div className="grid grid-cols-1 gap-8 rounded-b-[12px] border border-t-0 border-[#dddddd] bg-white px-[24px] pb-[31px] pt-[36px]">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'Overview' && (
          <div className="grid grid-cols-1 gap-[24px] lg:grid-cols-2">
            <div>
              <section>
                <h3 className="mb-[20px] text-[20px] font-normal leading-none text-[#111111]">Personal Information</h3>
                <div className="space-y-[16px]">
                  {[
                    { label: 'Email Address', key: 'email', icon: '📧' },
                    { label: 'Phone Number', key: 'phone', icon: '📞' },
                    { label: 'Address', key: 'address', icon: '📍' },
                    { label: 'Date of Birth', key: 'dob', icon: '🎂' }
                  ].map((field) => (
                    <div key={field.key} className="flex min-h-[72px] items-center gap-[16px] rounded-[9px] bg-[#f4f4f4] px-[17px] py-[14px]">
                      {field.key === 'email' && <Mail className="shrink-0 text-[#ffa313]" size={20} strokeWidth={1.8} />}
                      {field.key === 'phone' && <Phone className="shrink-0 text-[#ffa313]" size={20} strokeWidth={1.8} />}
                      {field.key === 'address' && <MapPin className="shrink-0 text-[#ffa313]" size={20} strokeWidth={1.8} />}
                      {field.key === 'dob' && <Calendar className="shrink-0 text-[#ffa313]" size={20} strokeWidth={1.8} />}
                      <div className="min-w-0">
                      <p className="mb-[7px] text-[12px] font-normal leading-none text-[#666666]">{field.label}</p>
                      {isEditing ? (
                        <input name={field.key} value={(userData as any)[field.key]} onChange={handleUserChange} className="w-full bg-transparent text-[14px] font-normal text-[#111111] outline-none border-b border-orange-200" />
                      ) : (
                        <p className="truncate text-[14px] font-normal leading-none text-[#111111]">{(userData as any)[field.key]}</p>
                      )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
            <div className="space-y-[24px]">
               <section>
                 <h3 className="mb-[20px] text-[20px] font-normal leading-none text-[#111111]">Academic Information</h3>
                 <div className="grid grid-cols-1 gap-[16px] sm:grid-cols-2">
                    <div className="rounded-[9px] bg-[#f4f4f4] px-[16px] py-[18px]">
                      <p className="mb-[10px] text-[12px] font-normal leading-none text-[#666666]">Department</p>
                      <p className="text-[14px] font-normal leading-none text-[#111111]">{userData.major}</p>
                    </div>
                    <div className="rounded-[9px] bg-[#f4f4f4] px-[16px] py-[18px]">
                      <p className="mb-[10px] text-[12px] font-normal leading-none text-[#666666]">Current Year</p>
                      <p className="text-[14px] font-normal leading-none text-[#111111]">{userData.year}</p>
                    </div>
                    <div className="rounded-[9px] bg-[#f4f4f4] px-[16px] py-[18px]">
                      <p className="mb-[10px] text-[12px] font-normal leading-none text-[#666666]">Enrollment Date</p>
                      <p className="text-[14px] font-normal leading-none text-[#111111]">{userData.enrollmentDate}</p>
                    </div>
                    <div className="rounded-[9px] bg-[#f4f4f4] px-[16px] py-[18px]">
                      <p className="mb-[10px] text-[12px] font-normal leading-none text-[#666666]">Expected Graduation</p>
                      <p className="text-[14px] font-normal leading-none text-[#111111]">{userData.expectedGraduation}</p>
                    </div>
                 </div>
                 <div className="mt-[16px] rounded-[9px] border border-[#10c79a] bg-[#e8f6ea] px-[16px] py-[17px]">
                    <p className="text-[12px] font-normal leading-none text-[#666666]">Current GPA</p>
                    <p className="mt-[10px] text-[24px] font-normal leading-none text-[#10c79a]">{userData.gpa}</p>
                 </div>
               </section>
               <section>
                  <h3 className="mb-[20px] text-[20px] font-normal leading-none text-[#111111]">Mentor Information</h3>
                  <div className="rounded-[9px] border border-[#ffa313] bg-gradient-to-br from-[#E3F2FD] to-[#F5F5F5] px-[24px] py-[24px]">
                    <div className="mb-[17px] flex items-center gap-[16px]">
                      <div className="flex h-[48px] w-[48px] items-center justify-center rounded-full bg-[#6514df] text-[16px] font-normal text-white">SM</div>
                      <div>
                        <h4 className="text-[16px] font-normal leading-none text-[#111111]">Dr. Sarah Mitchell</h4>
                        <p className="mt-[10px] text-[14px] font-normal leading-none text-[#666666]">Senior Career Counselor</p>
                      </div>
                    </div>
                    <div className="space-y-[12px] text-[13px] font-normal leading-none text-[#666666]">
                      <p className="flex items-center gap-[9px]"><Mail size={15} strokeWidth={1.8} /> s.mitchell@university.edu</p>
                      <p className="flex items-center gap-[9px]"><Phone size={15} strokeWidth={1.8} /> +1 (555) 987-6543</p>
                    </div>
                  </div>
               </section>
            </div>
            <section className="lg:col-span-2">
                <h3 className="mb-[20px] text-[20px] font-normal leading-none text-[#111111]">About Me</h3>
                {isEditing ? (
                  <textarea name="about" value={userData.about} onChange={handleUserChange} rows={4} className="w-full rounded-[9px] bg-[#f4f4f4] p-[24px] text-[15px] font-normal leading-[1.5] text-[#666666] outline-none" />
                ) : (
                  <p className="rounded-[9px] bg-[#f4f4f4] px-[24px] py-[24px] text-[15px] font-normal leading-[1.55] text-[#666666]">{userData.about}</p>
                )}
              </section>
          </div>
        )}
        {/* PROGRESS TAB */}
        {activeTab === 'Progress' && (
          <div className="space-y-[32px] px-[18px] py-[4px] md:px-[18px]">
            <section>
              <h3 className="mb-[28px] text-[20px] font-normal leading-none text-[#111111]">Performance Metrics</h3>
              <div className="grid grid-cols-1 gap-[24px] md:grid-cols-2">
                {PERFORMANCE_METRICS.map(m => (
                  <div key={m.id} className="rounded-[8px] bg-[#f4f4f4] px-[24px] py-[27px]">
                    <div className="mb-[18px] flex items-center justify-between gap-4">
                      <p className="text-[15px] font-normal leading-none text-[#666666]">{m.title}</p>
                      <p className="text-[20px] font-normal leading-none text-[#111111]">{m.value}</p>
                    </div>
                    <div className="h-[11px] overflow-hidden rounded-full bg-white">
                      <div className="h-full rounded-full" style={{ width: `${m.percent}%`, backgroundColor: m.color }} />
                    </div>
                    <p className="mt-[12px] text-[12px] font-normal leading-[1.25] text-[#666666]">{m.percent}%<br />Complete</p>
                  </div>
                ))}
              </div>
            </section>
            <section>
              <h3 className="mb-[22px] text-[20px] font-normal leading-none text-[#111111]">Achievements &amp; Badges</h3>
              <div className="grid grid-cols-1 gap-[16px] md:grid-cols-2">
                {ACHIEVEMENTS.map(a => (
                  <div key={a.id} className="flex min-h-[96px] items-center gap-[18px] rounded-[8px] border border-[#dddddd] bg-white px-[24px] py-[18px]">
                    <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-[9px] text-white" style={{ backgroundColor: a.color }}>
                      <img src={a.icon} alt="" className="h-[24px] w-[24px]" />
                    </div>
                    <div>
                      <h4 className="text-[17px] font-normal leading-none text-[#111111]">{a.title}</h4>
                      <p className="mt-[11px] text-[14px] font-normal leading-none text-[#666666]">{a.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
        {/* GOALS TAB */}
        {activeTab === 'Goals' && (
          <section className="px-[18px] py-[4px]">
            <div className="mb-[24px] flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-[20px] font-normal leading-none text-[#111111]">My Goals</h3>
              <button onClick={() => setIsGoalModalOpen(true)} className="flex h-[40px] shrink-0 items-center justify-center gap-[7px] rounded-[10px] bg-[#ffa313] px-[16px] text-[16px] font-normal whitespace-nowrap text-white">
                <Target size={17} strokeWidth={2} />
                Add New Goal
              </button>
            </div>
            <div className="space-y-[16px]">
              {goals.map(g => (
                <div key={g.id} className="rounded-[8px] border border-[#dddddd] bg-white px-[25px] py-[25px]">
                  <div className="mb-[12px] flex items-start justify-between gap-4">
                    <div>
                      <h4 className="mb-[14px] text-[17px] font-normal leading-none text-[#111111]">{g.title}</h4>
                      <div className="flex flex-wrap items-center gap-[13px]">
                        <span className={`rounded-[8px] px-[12px] py-[5px] text-[14px] font-normal leading-none ${g.status === 'Completed' ? 'bg-[#dbf5e5] text-[#10c79a]' : g.status === 'Not Started' ? 'bg-[#eeeeee] text-[#666666]' : 'bg-[#fff4df] text-[#ffa313]'}`}>{g.status}</span>
                        <span className="flex items-center gap-[5px] text-[14px] font-normal leading-none text-[#666666]"><Clock size={15} strokeWidth={1.8} /> Due: {g.dueDate}</span>
                      </div>
                    </div>
                    <button className="mt-[4px] text-[#666666]" aria-label="Edit goal"><SquarePen size={18} strokeWidth={1.8} /></button>
                  </div>
                  <div className="mt-[10px] h-[7px] overflow-hidden rounded-full bg-[#f2f2f2]">
                    <div className="h-full rounded-full bg-[#ffa313]" style={{ width: `${g.progress}%` }} />
                  </div>
                  <p className="mt-[13px] text-[13px] font-normal leading-[1.2] text-[#666666]">{g.progress}%<br />Complete</p>
                </div>
              ))}
            </div>
          </section>
        )}
        {/* ACTIVITY TAB */}
        {activeTab === 'Activity' && (
          <section className="min-h-[500px] px-[18px] py-[4px]">
            <h3 className="mb-[29px] text-[20px] font-normal leading-none text-[#111111]">Recent Activity</h3>
            <div className="space-y-[16px]">
              {ACTIVITIES.map(act => (
                <div key={act.id} className="flex min-h-[72px] items-center gap-[16px] rounded-[8px] bg-[#f4f4f4] px-[16px] py-[14px]">
                  <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full bg-[#ffa313] text-white">
                    {act.type === 'session' && <MessageSquare size={20} strokeWidth={2} />}
                    {act.type === 'report' && <FileText size={20} strokeWidth={2} />}
                    {act.type === 'badge' && <Award size={20} strokeWidth={2} />}
                    {act.type === 'goal' && <Target size={20} strokeWidth={2} />}
                  </div>
                  <div>
                    <h5 className="text-[15px] font-normal leading-none text-[#111111]">{act.title}</h5>
                    <p className="mt-[12px] text-[12px] font-normal leading-none text-[#666666]">{act.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        {/* MENTORS TAB */}
        {activeTab === 'Mentors' && (
          <section className="px-[18px] py-[4px]">
            <h3 className="text-[20px] font-normal leading-none text-[#111111]">Available Mentors</h3>
            <p className="mt-[12px] text-[14px] font-normal leading-none text-[#666666]">Browse and connect with mentors across different departments</p>
            <div className="mt-[28px] grid grid-cols-1 gap-[24px] lg:grid-cols-2">
              {MENTORS.map(m => (
                <div key={m.id} className={`rounded-[10px] border px-[24px] py-[24px] ${m.id === 'm1' ? 'border-[#10c79a] bg-[#f4fff9]' : 'border-[#dddddd] bg-white'}`}>
                  {m.id === 'm1' && <span className="mb-[20px] inline-flex h-[22px] items-center rounded-[7px] bg-[#10c79a] px-[13px] text-[11px] font-normal leading-none text-white"><Star size={11} className="mr-[4px]" />Your Current Mentor</span>}
                  <div className="flex items-start gap-[16px]">
                    <img src={m.image} alt={m.name} className="h-[61px] w-[61px] shrink-0 rounded-[11px] object-cover" />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-[18px] font-normal leading-none text-[#111111]">{m.name}</h4>
                      <p className="mt-[10px] text-[14px] font-normal leading-none text-[#666666]">{m.role}</p>
                      <p className="mt-[9px] text-[12px] font-normal leading-none text-[#666666]">{m.department}</p>
                    </div>
                  </div>
                  <div className="mt-[24px] flex flex-wrap gap-[8px]">
                    {m.tags.map(t => <span key={t} className="rounded-[8px] bg-[#f2f2f2] px-[11px] py-[5px] text-[11px] font-normal leading-none text-[#666666]">{t}</span>)}
                  </div>
                  <div className="mt-[24px] grid grid-cols-[auto_1fr_auto_1fr_auto] items-start gap-x-[8px] gap-y-[9px] text-[13px] font-normal leading-none text-[#666666]">
                    <Users size={15} strokeWidth={1.8} />
                    <span className="inline-flex items-center gap-[4px] whitespace-nowrap leading-none">
                      <span>{m.students}</span>
                      <span>Students</span>
                    </span>
                    <Star size={15} className="text-[#ffa313]" strokeWidth={1.8} />
                    <span>{m.rating}</span>
                    <span className={`rounded-[7px] px-[10px] py-[5px] text-[12px] leading-none ${m.availability === 'Full' ? 'bg-[#ffe1e4] text-[#ff6467]' : m.availability === 'Limited' ? 'bg-[#fff4df] text-[#ffa313]' : 'bg-[#dbf5e5] text-[#10c79a]'}`}>{m.availability}</span>
                    <Mail size={15} strokeWidth={1.8} />
                    <span className="col-span-4">{m.email}</span>
                    <Phone size={15} strokeWidth={1.8} />
                    <span className="col-span-4">{m.phone}</span>
                  </div>
                  <div className="mt-[17px] border-t border-[#dddddd] pt-[22px]">
                    <button onClick={() => setSelectedMentor(m)} className="h-[37px] rounded-[8px] border border-[#dddddd] bg-white px-[14px] text-[14px] font-normal text-[#666666]">View Profile</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>

      {/* --- MODALS --- */}

      {/* Add Goal Modal */}
      <Modal isOpen={isGoalModalOpen} onClose={() => setIsGoalModalOpen(false)} title="Add New Goal">
        <form onSubmit={handleAddGoal} className="space-y-[19px]">
          <div>
            <label className="mb-[9px] block text-[15px] font-semibold leading-none text-[#666666]">Goal Title</label>
            <input name="title" required placeholder="Enter your goal..." className="h-[56px] w-full rounded-[8px] border border-[#dddddd] bg-white px-[16px] text-[16px] font-normal text-[#111111] outline-none placeholder:text-[#777777] focus:border-[#ffa313]" />
          </div>
          <div>
            <label className="mb-[9px] block text-[15px] font-semibold leading-none text-[#666666]">Status</label>
            <div className="relative">
              <select name="status" className="h-[56px] w-full appearance-none rounded-[8px] border border-[#dddddd] bg-white px-[16px] pr-[46px] text-[16px] font-normal text-[#666666] outline-none focus:border-[#ffa313]">
                <option>Not Started</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-[13px] top-1/2 -translate-y-1/2 text-[#666666]" size={20} strokeWidth={1.8} />
            </div>
          </div>
          <div>
            <label className="mb-[9px] block text-[15px] font-semibold leading-none text-[#666666]">Due Date</label>
            <input name="dueDate" required placeholder="e.g., Dec 2025" className="h-[56px] w-full rounded-[8px] border border-[#dddddd] bg-white px-[16px] text-[16px] font-normal text-[#111111] outline-none placeholder:text-[#777777] focus:border-[#ffa313]" />
          </div>
          <div className="grid grid-cols-1 gap-[10px] pt-[5px] sm:grid-cols-2">
            <button type="button" onClick={() => setIsGoalModalOpen(false)} className="h-[43px] rounded-[8px] border border-[#dddddd] bg-white text-[16px] font-normal text-[#666666] transition hover:bg-[#f8f8f8]">Cancel</button>
            <button type="submit" className="h-[43px] rounded-[8px] bg-[#ffa313] text-[16px] font-normal text-white transition hover:bg-[#f59a0d]">Add Goal</button>
          </div>
        </form>
      </Modal>
      {/* Mentor Profile Modal */}
      {selectedMentor && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[92vh] w-full max-w-[771px] overflow-y-auto rounded-[10px] bg-white shadow-2xl">
            <div className="border-b border-[#dddddd] px-[32px] py-[24px]">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-[16px]">
                  <img src={selectedMentor.image} alt={selectedMentor.name} className="h-[80px] w-[80px] rounded-[12px] object-cover" />
                  <div>
                    <h3 className="text-[24px] font-normal leading-none text-[#111111]">{selectedMentor.name}</h3>
                    <p className="mt-[15px] text-[16px] font-normal leading-none text-[#666666]">{selectedMentor.role}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedMentor(null)} className="mt-[28px] text-[#666666]" aria-label="Close mentor profile"><X size={24} strokeWidth={2} /></button>
              </div>
            </div>
            <div className="px-[32px] py-[32px]">
              <div className="grid grid-cols-2 gap-[16px] md:grid-cols-4">
                {[
                  { l: 'Years Experience', v: selectedMentor.experience },
                  { l: 'Total Students', v: 95 },
                  { l: 'Current Students', v: selectedMentor.students },
                  { l: 'Rating', v: selectedMentor.rating, star: true }
                ].map(stat => (
                  <div key={stat.l} className="rounded-[8px] bg-[#f4f4f4] px-[12px] py-[19px] text-center">
                    <p className="text-[24px] font-normal leading-none text-[#ffa313]">{stat.star && <Star className="mr-[4px] inline-block align-[-2px]" size={18} strokeWidth={1.8} />}{stat.v}</p>
                    <p className="mt-[14px] text-[12px] font-normal leading-none text-[#666666]">{stat.l}</p>
                  </div>
                ))}
              </div>
              <div className="mt-[28px] space-y-[28px]">
                <section>
                  <h4 className="mb-[18px] text-[20px] font-normal leading-none text-[#111111]">About</h4>
                  <p className="text-[15px] font-normal leading-[1.55] text-[#666666]">{selectedMentor.about}</p>
                </section>
                <div className="grid grid-cols-1 gap-[16px] md:grid-cols-2">
                  <div className="rounded-[8px] bg-[#f4f4f4] px-[16px] py-[17px]">
                    <p className="mb-[10px] text-[12px] font-normal leading-none text-[#666666]">Department</p>
                    <p className="text-[15px] font-normal leading-none text-[#111111]">{selectedMentor.department}</p>
                  </div>
                  <div className="rounded-[8px] bg-[#f4f4f4] px-[16px] py-[17px]">
                    <p className="mb-[10px] text-[12px] font-normal leading-none text-[#666666]">Availability</p>
                    <span className="rounded-[7px] bg-[#dbf5e5] px-[11px] py-[5px] text-[12px] font-normal leading-none text-[#10c79a]">{selectedMentor.availability}</span>
                  </div>
                </div>
                <section>
                  <h4 className="mb-[18px] text-[20px] font-normal leading-none text-[#111111]">Areas of Specialization</h4>
                  <div className="flex flex-wrap gap-[8px]">
                    {selectedMentor.tags.map(t => <span key={t} className="rounded-[8px] bg-[#e8f6ff] px-[16px] py-[9px] text-[14px] font-normal leading-none text-[#ffa313]">{t}</span>)}
                  </div>
                </section>
                <section>
                  <h4 className="mb-[18px] text-[20px] font-normal leading-none text-[#111111]">Education</h4>
                  <div className="space-y-[8px]">
                    {selectedMentor.education.map(ed => (
                      <div key={ed} className="flex min-h-[46px] items-center gap-[12px] rounded-[8px] bg-[#f4f4f4] px-[13px] py-[12px]">
                        <GraduationCap size={18} className="shrink-0 text-[#ffa313]" strokeWidth={1.8} />
                        <p className="text-[15px] font-normal leading-none text-[#111111]">{ed}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      )}


      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default ProfileSection;

