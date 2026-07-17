"use client";

import React, { useMemo, useState } from "react";
import { Poppins } from "next/font/google";
import {
  Calendar,
  ChevronDown,
  Eye,
  FileText,
  Filter,
  Paperclip,
  Search,
  User,
  X,
} from "lucide-react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

type MentorNote = {
  id: number;
  title: string;
  mentor: string;
  role: string;
  date: string;
  description: string;
  content: string;
  attachments: number;
  category: string;
  avatar: string;
  isNew: boolean;
  borderColor: string;
};

const MENTOR_NOTES_DATA: MentorNote[] = [
  {
    id: 1,
    title: "Career Development Plan - Q1 Goals",
    mentor: "Dr. Emily Chen",
    role: "Career Mentor",
    date: "3/5/2025",
    description:
      "Hi there, I've reviewed your progress from last semester and I'm impressed with your growth! Here are some key areas I'd like you to focus on this qu...",
    content:
      "Hi there,\n\nI've reviewed your progress from last semester and I'm impressed with your growth! Here are some key areas I'd like you to focus on this quarter:\n\n**Technical Skills:**\n- Complete the advanced JavaScript course on frontend frameworks\n- Build at least 2 portfolio projects showcasing React skills\n- Practice algorithm problems (aim for 3-4 per week)\n\n**Soft Skills:**\n- Work on presentation skills - prepare for the upcoming project showcase\n- Network with at least 5 professionals in your field of interest",
    attachments: 2,
    category: "Career Development",
    avatar: "/images/avatar1.png",
    isNew: false,
    borderColor: "border-[#dddddd]",
  },
  {
    id: 2,
    title: "Research Paper Feedback",
    mentor: "Prof. Michael Rodriguez",
    role: "Academic Mentor",
    date: "3/4/2025",
    description:
      'Hello, I\'ve finished reviewing your draft research paper on "AI in Healthcare". Overall, it\'s a strong piece of work! Here are my notes: **Strengths...',
    content:
      'Hello, I\'ve finished reviewing your draft research paper on "AI in Healthcare". Overall, it\'s a strong piece of work! Here are my notes:\n\n**Strengths:**\n- Clear topic and structure\n- Strong literature review\n- Good examples throughout\n\nPlease revise the conclusion and citation formatting before final submission.',
    attachments: 1,
    category: "Academic",
    avatar: "/images/avatar2.png",
    isNew: false,
    borderColor: "border-[#dddddd]",
  },
  {
    id: 3,
    title: "Upcoming Workshop - Leadership Skills",
    mentor: "Sarah Martinez",
    role: "Leadership Coach",
    date: "3/3/2025",
    description:
      "Dear Student, I'm organizing a leadership workshop next week and I think you'd benefit greatly from attending. **Workshop Details:** - Date: March ...",
    content:
      "Dear Student, I'm organizing a leadership workshop next week and I think you'd benefit greatly from attending.\n\n**Workshop Details:**\n- Date: March 12, 2025\n- Focus: presentation, teamwork, and confidence building\n\nPlease review the attached preparation notes before the session.",
    attachments: 1,
    category: "Professional Development",
    avatar: "/images/avatar3.png",
    isNew: true,
    borderColor: "border-[#1976d2]",
  },
  {
    id: 4,
    title: "Internship Opportunity - Tech Startup",
    mentor: "James Thompson",
    role: "Industry Mentor",
    date: "3/2/2025",
    description:
      "Hi, Great news! I came across an internship opportunity that perfectly matches your interests and skills. **Company:** InnovateTech Solutions **Posi...",
    content:
      "Hi, Great news! I came across an internship opportunity that perfectly matches your interests and skills.\n\n**Company:** InnovateTech Solutions\n**Position:** Frontend Engineering Intern\n\nPlease prepare your resume and portfolio so we can review them together.",
    attachments: 2,
    category: "Career Development",
    avatar: "/images/avatar.png",
    isNew: true,
    borderColor: "border-[#1976d2]",
  },
  {
    id: 5,
    title: "Monthly Progress Review - February",
    mentor: "Dr. Emily Chen",
    role: "Career Mentor",
    date: "3/1/2025",
    description:
      "Hello, Here's a summary of your progress for February: **Achievements:** Completed 3 online courses, attended all mentorship sessions and submitted...",
    content:
      "Hello, Here's a summary of your progress for February:\n\n**Achievements:** Completed 3 online courses, attended all mentorship sessions, and submitted the required documents on time.\n\nNext month, let's focus on interview preparation and project documentation.",
    attachments: 0,
    category: "Progress Review",
    avatar: "/images/mentor1.png",
    isNew: false,
    borderColor: "border-[#dddddd]",
  },
  {
    id: 6,
    title: "Study Resources for Upcoming Exam",
    mentor: "Prof. Michael Rodriguez",
    role: "Academic Mentor",
    date: "2/28/2025",
    description:
      "Hi there, I've compiled some study resources that will help you prepare for your upcoming Data Structures exam: **Recommended Materials:** - Chapter...",
    content:
      "Hi there, I've compiled some study resources that will help you prepare for your upcoming Data Structures exam:\n\n**Recommended Materials:**\n- Chapter review notes\n- Practice problems\n- Recorded workshop links\n\nStart with arrays, linked lists, and recursion before moving to graphs.",
    attachments: 2,
    category: "Academic",
    avatar: "/images/avatar1.png",
    isNew: false,
    borderColor: "border-[#dddddd]",
  },
];

const NoteViewModal = ({
  note,
  onClose,
}: {
  note: MentorNote | null;
  onClose: () => void;
}) => {
  if (!note) return null;

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center overflow-y-auto bg-black/40 p-4">
      <div className="my-auto flex max-h-[calc(100vh-32px)] w-full max-w-[800px] flex-col overflow-hidden rounded-[10px] bg-white shadow-2xl">
        <div className="shrink-0 border-b border-[#dddddd] px-[24px] py-[27px]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-[16px]">
              <img src={note.avatar} alt={note.mentor} className="h-[48px] w-[48px] shrink-0 rounded-full object-cover" />
              <div className="min-w-0">
                <h2 className="truncate text-[22px] font-normal leading-none text-[#111111]">{note.title}</h2>
                <div className="mt-[12px] flex flex-wrap items-center gap-[11px] text-[13px] font-normal leading-none text-[#666666]">
                  <span>{note.mentor}</span>
                  <span>&bull;</span>
                  <span>{note.role}</span>
                  <span>&bull;</span>
                  <span>{note.date}</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="mt-[8px] shrink-0 text-[#666666] hover:text-[#111111]" aria-label="Close note">
              <X size={24} strokeWidth={2} />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-[24px] pb-[8px] pt-[24px]">
          <span className="inline-flex h-[22px] items-center rounded-[7px] bg-[#e0f2fe] px-[10px] text-[12px] font-semibold leading-none text-[#0078d4]">
            {note.category}
          </span>
          <div className="mt-[20px] whitespace-pre-wrap text-[16px] font-normal leading-[1.6] text-[#111111]">
            {note.content}
          </div>
        </div>

        <div className="shrink-0 border-t border-[#dddddd] bg-[#f4f4f4] px-[24px] py-[24px]">
          <button onClick={onClose} className="h-[46px] w-full rounded-[9px] bg-[#ffa313] px-4 text-[16px] font-semibold text-white transition hover:bg-[#f59a0d]">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const NoteCard = ({ note, onClick }: { note: MentorNote; onClick: () => void }) => (
  <article className={`relative min-h-[212px] rounded-[12px] border ${note.borderColor} bg-white px-[22px] py-[24px]`}>
    <div className="flex items-start gap-[16px]">
      <img src={note.avatar} alt={note.mentor} className="h-[48px] w-[48px] shrink-0 rounded-full object-cover" />
      <div className="min-w-0 flex-1 pr-[54px] md:pr-[150px]">
        <div className="flex min-w-0 items-center gap-[9px]">
          <h3 className="truncate text-[18px] font-normal leading-none text-[#111111]">{note.title}</h3>
          {note.isNew && <span className="h-[8px] w-[8px] shrink-0 rounded-full bg-[#1976d2]" />}
        </div>
        <div className="mt-[14px] flex flex-wrap items-center gap-x-[12px] gap-y-[8px] text-[13px] font-normal leading-none text-[#666666]">
          <span className="flex items-center gap-[5px]"><User size={14} strokeWidth={1.8} />{note.mentor}</span>
          <span>&bull;</span>
          <span>{note.role}</span>
          <span>&bull;</span>
          <span className="flex items-center gap-[5px]"><Calendar size={14} strokeWidth={1.8} />{note.date}</span>
        </div>
        <p className="mt-[21px] line-clamp-2 text-[16px] font-normal leading-[1.45] text-[#666666]">{note.description}</p>
        {note.attachments > 0 && (
          <div className="mt-[16px] inline-flex h-[36px] items-center gap-[9px] rounded-[8px] bg-[#f4f4f4] px-[12px] text-[14px] font-normal text-[#666666]">
            <Paperclip size={16} strokeWidth={1.8} />
            <span>{note.attachments} {note.attachments === 1 ? "attachment" : "attachments"}</span>
          </div>
        )}
      </div>
      <span className="absolute right-[162px] top-[25px] hidden h-[22px] items-center rounded-[7px] bg-[#e0f2fe] px-[10px] text-[12px] font-semibold leading-none text-[#0078d4] md:inline-flex">
        {note.category}
      </span>
      <button onClick={onClick} className="absolute right-[35px] top-[37px] text-[#0078d4] transition hover:scale-110" aria-label={`View ${note.title}`}>
        <Eye size={20} strokeWidth={2.2} />
      </button>
    </div>
  </article>
);

const MentorNotesPanel = () => {
  const [notes, setNotes] = useState(MENTOR_NOTES_DATA);
  const [selectedNote, setSelectedNote] = useState<MentorNote | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMentor, setSelectedMentor] = useState("All Mentor");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [showMentorDropdown, setShowMentorDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const newNotesCount = useMemo(() => notes.filter((n) => n.isNew).length, [notes]);

  const handleViewNote = (id: number) => {
    const noteToView = notes.find((note) => note.id === id) || null;
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, isNew: false, borderColor: "border-[#dddddd]" } : note
      )
    );
    setSelectedNote(noteToView ? { ...noteToView, isNew: false, borderColor: "border-[#dddddd]" } : null);
  };

  const mentors = useMemo(() => ["All Mentor", ...Array.from(new Set(notes.map((n) => n.mentor)))], [notes]);
  const categories = useMemo(() => ["All Categories", ...Array.from(new Set(notes.map((n) => n.category)))], [notes]);

  const filteredNotes = notes.filter((note) => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMentor = selectedMentor === "All Mentor" || note.mentor === selectedMentor;
    const matchesCategory = selectedCategory === "All Categories" || note.category === selectedCategory;
    return matchesSearch && matchesMentor && matchesCategory;
  });

  return (
    <section className={`${poppins.variable} min-h-full w-full overflow-x-hidden bg-[#f5f5f5] px-4 pb-6 pt-6 font-sans md:px-6 md:pt-7`}>
      <div className="mb-[30px] flex items-start justify-between gap-4">
        <div className="flex items-start gap-[12px]">
          <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-[12px] bg-[#ffa313] text-white">
            <FileText size={24} strokeWidth={2} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-[10px]">
              <h1 className="text-[30px] font-semibold leading-none text-[#111111]">Mentor Notes</h1>
              {newNotesCount > 0 && (
                <span className="flex h-[23px] items-center rounded-[8px] bg-[#ff666c] px-[10px] text-[12px] font-semibold leading-none text-white">
                  {newNotesCount} New
                </span>
              )}
            </div>
            <p className="mt-[14px] text-[16px] font-normal leading-none text-[#666666]">View notes and messages from your mentors</p>
          </div>
        </div>
        <div className="hidden text-right sm:block">
          <p className="text-[14px] font-normal leading-none text-[#666666]">Total Notes</p>
          <p className="mt-[29px] text-[24px] font-semibold leading-none text-[#111111]">{filteredNotes.length}</p>
        </div>
      </div>

      <div className="mb-[24px] rounded-[12px] border border-[#dddddd] bg-white px-[24px] py-[23px]">
        <div className="grid grid-cols-1 gap-[16px] lg:grid-cols-[1fr_1fr_1fr]">
          <div className="relative">
            <Search className="absolute left-[16px] top-1/2 -translate-y-1/2 text-[#666666]" size={20} strokeWidth={1.8} />
            <input
              type="text"
              placeholder="Search notes.."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-[48px] w-full rounded-[9px] border border-[#dddddd] bg-white pl-[45px] pr-4 text-[16px] font-normal text-[#111111] outline-none placeholder:text-[#8a8a8a]"
            />
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => { setShowMentorDropdown(!showMentorDropdown); setShowCategoryDropdown(false); }}
              className="flex h-[48px] w-full items-center justify-between rounded-[9px] border border-[#dddddd] bg-white px-[17px] text-[16px] font-normal text-[#666666]"
            >
              <span className="flex min-w-0 items-center gap-[8px]"><User size={17} strokeWidth={1.8} /> <span className="truncate">{selectedMentor}</span></span>
              <ChevronDown size={20} strokeWidth={1.8} />
            </button>
            {showMentorDropdown && (
              <div className="absolute left-0 top-[54px] z-30 w-full overflow-hidden rounded-[9px] border border-[#dddddd] bg-white shadow-xl">
                {mentors.map((mentor) => (
                  <button key={mentor} type="button" onClick={() => { setSelectedMentor(mentor); setShowMentorDropdown(false); }} className="block w-full px-4 py-2 text-left text-[14px] text-[#666666] hover:bg-[#fff8ef]">
                    {mentor}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => { setShowCategoryDropdown(!showCategoryDropdown); setShowMentorDropdown(false); }}
              className="flex h-[48px] w-full items-center justify-between rounded-[9px] border border-[#dddddd] bg-white px-[17px] text-[16px] font-normal text-[#666666]"
            >
              <span className="flex min-w-0 items-center gap-[8px]"><Filter size={17} strokeWidth={1.8} /> <span className="truncate">{selectedCategory}</span></span>
              <ChevronDown size={20} strokeWidth={1.8} />
            </button>
            {showCategoryDropdown && (
              <div className="absolute left-0 top-[54px] z-30 w-full overflow-hidden rounded-[9px] border border-[#dddddd] bg-white shadow-xl">
                {categories.map((category) => (
                  <button key={category} type="button" onClick={() => { setSelectedCategory(category); setShowCategoryDropdown(false); }} className="block w-full px-4 py-2 text-left text-[14px] text-[#666666] hover:bg-[#fff8ef]">
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-[16px]">
        {filteredNotes.length > 0 ? (
          filteredNotes.map((note) => (
            <NoteCard key={note.id} note={note} onClick={() => handleViewNote(note.id)} />
          ))
        ) : (
          <div className="rounded-[12px] border border-dashed border-[#dddddd] bg-white py-20 text-center">
            <p className="text-[15px] font-normal text-[#666666]">No notes found matching your criteria.</p>
          </div>
        )}
      </div>

      <NoteViewModal note={selectedNote} onClose={() => setSelectedNote(null)} />
    </section>
  );
};

export default MentorNotesPanel;
