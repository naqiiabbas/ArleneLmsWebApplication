"use client";

import React, { useEffect, useMemo, useState } from "react";
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
import { getStudentNotes } from "@/lib/data/student";
import type { StudentNote as MentorNote } from "@/lib/data/student.types";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const borderFor = (isNew: boolean) => (isNew ? "border-[#1976d2]" : "border-[#dddddd]");

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
  <article className={`relative min-h-[212px] rounded-[12px] border ${borderFor(note.isNew)} bg-white px-[22px] py-[24px]`}>
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
  const [notes, setNotes] = useState<MentorNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<MentorNote | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMentor, setSelectedMentor] = useState("All Mentor");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [showMentorDropdown, setShowMentorDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  useEffect(() => {
    getStudentNotes()
      .then(setNotes)
      .catch((e) => setNotice((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  const newNotesCount = useMemo(() => notes.filter((n) => n.isNew).length, [notes]);

  const handleViewNote = (id: string) => {
    const noteToView = notes.find((note) => note.id === id) || null;
    setNotes((prev) => prev.map((note) => (note.id === id ? { ...note, isNew: false } : note)));
    setSelectedNote(noteToView ? { ...noteToView, isNew: false } : null);
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

      {notice && (
        <div className="mb-[16px] rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-semibold text-red-700">
          {notice}
        </div>
      )}

      <div className="space-y-[16px]">
        {loading ? (
          <div className="rounded-[12px] border border-dashed border-[#dddddd] bg-white py-20 text-center">
            <p className="text-[15px] font-normal text-[#666666]">Loading notes…</p>
          </div>
        ) : filteredNotes.length > 0 ? (
          filteredNotes.map((note) => (
            <NoteCard key={note.id} note={note} onClick={() => handleViewNote(note.id)} />
          ))
        ) : (
          <div className="rounded-[12px] border border-dashed border-[#dddddd] bg-white py-20 text-center">
            <p className="text-[15px] font-normal text-[#666666]">No notes from your mentors yet.</p>
          </div>
        )}
      </div>

      <NoteViewModal note={selectedNote} onClose={() => setSelectedNote(null)} />
    </section>
  );
};

export default MentorNotesPanel;
