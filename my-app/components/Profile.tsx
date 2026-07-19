"use client";

import React, { useEffect, useState } from 'react';
import { Poppins } from 'next/font/google';
import {
  Award,
  Calendar,
  ChevronDown,
  Clock,
  FileText,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Target,
  X,
} from 'lucide-react';
import {
  getStudentProfile,
  updateStudentProfile,
  getStudentGoals,
  addStudentGoal,
} from '@/lib/data/student';
import type { StudentProfile, StudentGoal } from '@/lib/data/student.types';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

type TabType = 'Overview' | 'Progress' | 'Goals' | 'Activity' | 'Mentors';

const initials = (name: string) =>
  name.split(' ').filter(Boolean).map((p) => p[0]).join('').toUpperCase().slice(0, 2);

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-full max-w-[514px] overflow-hidden rounded-[10px] bg-white shadow-2xl">
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

const emptyForm = { email: '', phone: '', address: '', dob: '', about: '' };

const ProfileSection = () => {
  const [activeTab, setActiveTab] = useState<TabType>('Overview');
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [goals, setGoals] = useState<StudentGoal[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  const loadProfile = () => {
    getStudentProfile()
      .then(setProfile)
      .catch((e) => setNotice((e as Error).message));
  };
  const loadGoals = () => {
    getStudentGoals().then(setGoals).catch((e) => setNotice((e as Error).message));
  };

  useEffect(() => {
    loadProfile();
    loadGoals();
  }, []);

  const startEdit = () => {
    if (!profile) return;
    setForm({ email: profile.email, phone: profile.phone, address: profile.address, dob: profile.dob === '—' ? '' : profile.dob, about: profile.about });
    setIsEditing(true);
  };

  const saveEdit = async () => {
    if (saving) return;
    setSaving(true);
    const res = await updateStudentProfile(form);
    setSaving(false);
    if (res.error) {
      setNotice(res.error);
      return;
    }
    setIsEditing(false);
    loadProfile();
  };

  const handleAddGoal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await addStudentGoal({
      title: (fd.get('title') as string) ?? '',
      status: (fd.get('status') as StudentGoal['status']) ?? 'Not Started',
      dueDate: (fd.get('dueDate') as string) ?? '',
    });
    if (res.error) {
      setNotice(res.error);
      return;
    }
    setIsGoalModalOpen(false);
    loadGoals();
  };

  const d = profile;
  const personalFields: { label: string; key: 'email' | 'phone' | 'address' | 'dob' }[] = [
    { label: 'Email Address', key: 'email' },
    { label: 'Phone Number', key: 'phone' },
    { label: 'Address', key: 'address' },
    { label: 'Date of Birth', key: 'dob' },
  ];

  return (
    <div className={`${poppins.variable} min-h-full w-full overflow-x-hidden bg-[#f5f5f5] px-4 pb-6 pt-6 font-sans md:px-6 md:pt-7`}>
      <div className="mb-[26px]">
        <h1 className="text-[24px] font-semibold leading-none text-[#111111]">My Profile</h1>
        <p className="mt-[14px] text-[16px] font-normal leading-none text-[#666666]">Manage your personal information and track your progress</p>
      </div>

      {notice && (
        <div className="mb-[16px] flex items-start justify-between gap-4 rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-semibold text-red-700">
          <span className="break-all">{notice}</span>
          <button type="button" onClick={() => setNotice(null)} className="shrink-0 text-[13px] underline">Dismiss</button>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative mb-[24px] overflow-hidden rounded-[12px] bg-white">
        <div className="h-[160px] bg-[#ffa313]" />
        <div className="relative flex min-h-[160px] flex-col gap-4 px-[32px] pb-[26px] md:flex-row md:items-start">
          <div className="-mt-[10px] flex h-[128px] w-[128px] shrink-0 items-center justify-center overflow-hidden rounded-full border-[5px] border-white bg-[#6514df] text-[36px] font-semibold text-white shadow-lg">
            {d ? initials(d.name) : ''}
          </div>
          <div className="min-w-0 flex-1 pt-[2px]">
            <h2 className="text-[24px] font-semibold leading-none text-[#111111]">{d?.name ?? '—'}</h2>
            <p className="mt-[13px] text-[16px] font-normal leading-[1.45] text-[#666666]">{d?.major} &bull; {d?.year}</p>
            <p className="mt-[8px] text-[14px] font-normal leading-none text-[#666666]">Student ID: {d?.studentId} <span className="mx-[13px]">&bull;</span> GPA: {d?.gpa}</p>
          </div>
          <button
            onClick={() => (isEditing ? saveEdit() : startEdit())}
            disabled={!d || saving}
            className="flex h-[49px] w-full shrink-0 items-center justify-center gap-[10px] rounded-[10px] bg-[#ffa313] px-[25px] text-[16px] font-normal whitespace-nowrap text-white transition-opacity hover:opacity-90 disabled:opacity-60 md:mt-[72px] md:w-[170px]"
          >
            <img src="/images/profile-edit-icon.svg" alt="" className="h-[20px] w-[20px] shrink-0" />
            {isEditing ? (saving ? 'Saving…' : 'Save Profile') : 'Edit Profile'}
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

      {/* Tab Content */}
      <div className="grid grid-cols-1 gap-8 rounded-b-[12px] border border-t-0 border-[#dddddd] bg-white px-[24px] pb-[31px] pt-[36px]">

        {activeTab === 'Overview' && (
          <div className="grid grid-cols-1 gap-[24px] lg:grid-cols-2">
            <div>
              <section>
                <h3 className="mb-[20px] text-[20px] font-normal leading-none text-[#111111]">Personal Information</h3>
                <div className="space-y-[16px]">
                  {personalFields.map((field) => (
                    <div key={field.key} className="flex min-h-[72px] items-center gap-[16px] rounded-[9px] bg-[#f4f4f4] px-[17px] py-[14px]">
                      {field.key === 'email' && <Mail className="shrink-0 text-[#ffa313]" size={20} strokeWidth={1.8} />}
                      {field.key === 'phone' && <Phone className="shrink-0 text-[#ffa313]" size={20} strokeWidth={1.8} />}
                      {field.key === 'address' && <MapPin className="shrink-0 text-[#ffa313]" size={20} strokeWidth={1.8} />}
                      {field.key === 'dob' && <Calendar className="shrink-0 text-[#ffa313]" size={20} strokeWidth={1.8} />}
                      <div className="min-w-0 flex-1">
                        <p className="mb-[7px] text-[12px] font-normal leading-none text-[#666666]">{field.label}</p>
                        {isEditing ? (
                          <input
                            value={form[field.key]}
                            onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                            className="w-full border-b border-orange-200 bg-transparent text-[14px] font-normal text-[#111111] outline-none"
                          />
                        ) : (
                          <p className="truncate text-[14px] font-normal leading-none text-[#111111]">{d ? d[field.key] || '—' : '—'}</p>
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
                    <p className="text-[14px] font-normal leading-none text-[#111111]">{d?.major}</p>
                  </div>
                  <div className="rounded-[9px] bg-[#f4f4f4] px-[16px] py-[18px]">
                    <p className="mb-[10px] text-[12px] font-normal leading-none text-[#666666]">Current Year</p>
                    <p className="text-[14px] font-normal leading-none text-[#111111]">{d?.year}</p>
                  </div>
                  <div className="rounded-[9px] bg-[#f4f4f4] px-[16px] py-[18px]">
                    <p className="mb-[10px] text-[12px] font-normal leading-none text-[#666666]">Enrollment Date</p>
                    <p className="text-[14px] font-normal leading-none text-[#111111]">{d?.enrollmentDate}</p>
                  </div>
                  <div className="rounded-[9px] bg-[#f4f4f4] px-[16px] py-[18px]">
                    <p className="mb-[10px] text-[12px] font-normal leading-none text-[#666666]">Expected Graduation</p>
                    <p className="text-[14px] font-normal leading-none text-[#111111]">{d?.expectedGraduation}</p>
                  </div>
                </div>
                <div className="mt-[16px] rounded-[9px] border border-[#10c79a] bg-[#e8f6ea] px-[16px] py-[17px]">
                  <p className="text-[12px] font-normal leading-none text-[#666666]">Current GPA</p>
                  <p className="mt-[10px] text-[24px] font-normal leading-none text-[#10c79a]">{d?.gpa}</p>
                </div>
              </section>
              <section>
                <h3 className="mb-[20px] text-[20px] font-normal leading-none text-[#111111]">Mentor Information</h3>
                {d?.mentor ? (
                  <div className="rounded-[9px] border border-[#ffa313] bg-gradient-to-br from-[#E3F2FD] to-[#F5F5F5] px-[24px] py-[24px]">
                    <div className="mb-[17px] flex items-center gap-[16px]">
                      <div className="flex h-[48px] w-[48px] items-center justify-center rounded-full bg-[#6514df] text-[16px] font-normal text-white">{initials(d.mentor.name)}</div>
                      <div>
                        <h4 className="text-[16px] font-normal leading-none text-[#111111]">{d.mentor.name}</h4>
                        <p className="mt-[10px] text-[14px] font-normal leading-none text-[#666666]">{d.mentor.role}</p>
                      </div>
                    </div>
                    <div className="space-y-[12px] text-[13px] font-normal leading-none text-[#666666]">
                      {d.mentor.email && <p className="flex items-center gap-[9px]"><Mail size={15} strokeWidth={1.8} /> {d.mentor.email}</p>}
                      {d.mentor.phone && <p className="flex items-center gap-[9px]"><Phone size={15} strokeWidth={1.8} /> {d.mentor.phone}</p>}
                    </div>
                  </div>
                ) : (
                  <p className="rounded-[9px] bg-[#f4f4f4] px-[24px] py-[24px] text-[14px] text-[#666666]">No mentor assigned yet.</p>
                )}
              </section>
            </div>
            <section className="lg:col-span-2">
              <h3 className="mb-[20px] text-[20px] font-normal leading-none text-[#111111]">About Me</h3>
              {isEditing ? (
                <textarea value={form.about} onChange={(e) => setForm({ ...form, about: e.target.value })} rows={4} className="w-full rounded-[9px] bg-[#f4f4f4] p-[24px] text-[15px] font-normal leading-[1.5] text-[#666666] outline-none" />
              ) : (
                <p className="rounded-[9px] bg-[#f4f4f4] px-[24px] py-[24px] text-[15px] font-normal leading-[1.55] text-[#666666]">{d?.about || 'No bio added yet.'}</p>
              )}
            </section>
          </div>
        )}

        {activeTab === 'Progress' && (
          <div className="space-y-[32px] px-[18px] py-[4px] md:px-[18px]">
            <section>
              <h3 className="mb-[28px] text-[20px] font-normal leading-none text-[#111111]">Performance Metrics</h3>
              <div className="grid grid-cols-1 gap-[24px] md:grid-cols-2">
                {(d?.metrics ?? []).map((m) => (
                  <div key={m.title} className="rounded-[8px] bg-[#f4f4f4] px-[24px] py-[27px]">
                    <div className="mb-[18px] flex items-center justify-between gap-4">
                      <p className="text-[15px] font-normal leading-none text-[#666666]">{m.title}</p>
                      <p className="text-[20px] font-normal leading-none text-[#111111]">{m.value}</p>
                    </div>
                    <div className="h-[11px] overflow-hidden rounded-full bg-white">
                      <div className="h-full rounded-full" style={{ width: `${m.percent}%`, backgroundColor: m.color }} />
                    </div>
                    <p className="mt-[12px] text-[12px] font-normal leading-[1.25] text-[#666666]">{m.percent}% Complete</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

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
              {goals.length === 0 && <p className="rounded-[8px] border border-dashed border-[#dddddd] py-12 text-center text-[14px] text-[#666666]">No goals yet. Add your first one.</p>}
              {goals.map((g) => (
                <div key={g.id} className="rounded-[8px] border border-[#dddddd] bg-white px-[25px] py-[25px]">
                  <div className="mb-[12px] flex items-start justify-between gap-4">
                    <div>
                      <h4 className="mb-[14px] text-[17px] font-normal leading-none text-[#111111]">{g.title}</h4>
                      <div className="flex flex-wrap items-center gap-[13px]">
                        <span className={`rounded-[8px] px-[12px] py-[5px] text-[14px] font-normal leading-none ${g.status === 'Completed' ? 'bg-[#dbf5e5] text-[#10c79a]' : g.status === 'Not Started' ? 'bg-[#eeeeee] text-[#666666]' : 'bg-[#fff4df] text-[#ffa313]'}`}>{g.status}</span>
                        <span className="flex items-center gap-[5px] text-[14px] font-normal leading-none text-[#666666]"><Clock size={15} strokeWidth={1.8} /> Due: {g.dueDate}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-[10px] h-[7px] overflow-hidden rounded-full bg-[#f2f2f2]">
                    <div className="h-full rounded-full bg-[#ffa313]" style={{ width: `${g.progress}%` }} />
                  </div>
                  <p className="mt-[13px] text-[13px] font-normal leading-[1.2] text-[#666666]">{g.progress}% Complete</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'Activity' && (
          <section className="min-h-[300px] px-[18px] py-[4px]">
            <h3 className="mb-[29px] text-[20px] font-normal leading-none text-[#111111]">Recent Activity</h3>
            <div className="space-y-[16px]">
              {(d?.activity ?? []).length === 0 && <p className="text-[14px] text-[#666666]">No recent activity.</p>}
              {(d?.activity ?? []).map((act) => (
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

        {activeTab === 'Mentors' && (
          <section className="px-[18px] py-[4px]">
            <h3 className="text-[20px] font-normal leading-none text-[#111111]">Your Mentors</h3>
            <p className="mt-[12px] text-[14px] font-normal leading-none text-[#666666]">The mentors assigned to your mentorship</p>
            <div className="mt-[28px] grid grid-cols-1 gap-[24px] lg:grid-cols-2">
              {(d?.mentors ?? []).length === 0 && <p className="text-[14px] text-[#666666]">No mentors assigned yet.</p>}
              {(d?.mentors ?? []).map((m) => (
                <div key={m.id} className="rounded-[10px] border border-[#10c79a] bg-[#f4fff9] px-[24px] py-[24px]">
                  <div className="flex items-start gap-[16px]">
                    <div className="flex h-[61px] w-[61px] shrink-0 items-center justify-center rounded-[11px] bg-[#6514df] text-[18px] font-semibold text-white">{initials(m.name)}</div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-[18px] font-normal leading-none text-[#111111]">{m.name}</h4>
                      <p className="mt-[10px] text-[14px] font-normal leading-none text-[#666666]">{m.role}</p>
                      <p className="mt-[9px] text-[12px] font-normal leading-none text-[#666666]">{m.department}</p>
                    </div>
                  </div>
                  <div className="mt-[20px] space-y-[9px] text-[13px] font-normal leading-none text-[#666666]">
                    {m.email && <p className="flex items-center gap-[8px]"><Mail size={15} strokeWidth={1.8} /> {m.email}</p>}
                    {m.phone && <p className="flex items-center gap-[8px]"><Phone size={15} strokeWidth={1.8} /> {m.phone}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

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
            <input name="dueDate" placeholder="e.g., Dec 2025" className="h-[56px] w-full rounded-[8px] border border-[#dddddd] bg-white px-[16px] text-[16px] font-normal text-[#111111] outline-none placeholder:text-[#777777] focus:border-[#ffa313]" />
          </div>
          <div className="grid grid-cols-1 gap-[10px] pt-[5px] sm:grid-cols-2">
            <button type="button" onClick={() => setIsGoalModalOpen(false)} className="h-[43px] rounded-[8px] border border-[#dddddd] bg-white text-[16px] font-normal text-[#666666] transition hover:bg-[#f8f8f8]">Cancel</button>
            <button type="submit" className="h-[43px] rounded-[8px] bg-[#ffa313] text-[16px] font-normal text-white transition hover:bg-[#f59a0d]">Add Goal</button>
          </div>
        </form>
      </Modal>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default ProfileSection;
