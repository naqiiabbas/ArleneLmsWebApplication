"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Plus,
  Filter,
  ChevronDown,
  Pencil,
  User,
  Calendar,
  X,
  Upload,
  FileText,
  Tag
} from "lucide-react";
import {
  getMentorNotes,
  createMentorNote,
  updateMentorNote,
  attachNoteFile,
} from "@/lib/data/mentor";
import type { MentorNote, MentorStudentOption } from "@/lib/data/mentor.types";

const categories = ["Academic", "Career", "Personal"];

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-[#fff4c6] text-[#c98600]",
  approved: "bg-[#dff9ea] text-[#009d4c]",
  rejected: "bg-[#ffe3e6] text-[#ff001a]",
  flagged: "bg-[#ffe8d6] text-[#d2691e]",
};

// --- Sub-Components ---

const Badge = ({ type }: { type: string }) => {
  const styles: Record<string, string> = {
    Academic: "bg-[#dcebff] text-[#006ce5]",
    Career: "bg-[#f0d8ff] text-[#a000ff]",
    Personal: "bg-[#dff9ea] text-[#009d4c]",
  };
  return (
    <span className={`inline-flex h-[23px] items-center rounded-full px-[12px] text-[12px] font-normal leading-none ${styles[type] || "bg-gray-50 text-gray-500"}`}>
      {type}
    </span>
  );
};

const FileUploadArea = ({ 
  attachedFile, 
  onFileChange, 
  onRemove 
}: { 
  attachedFile: File | null, 
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  onRemove: () => void 
}) => {
  return (
    <div className="mt-[16px]">
      <label className="relative flex h-[86px] w-full cursor-pointer flex-col items-center justify-center rounded-[8px] border border-[#d6dce3] bg-white transition-colors hover:bg-[#f7f8fa]">
        <div className="flex flex-col items-center justify-center">
          <Upload className="mb-[5px] h-6 w-6 text-[#9aa3af]" />
          <p className="text-[13px] font-normal text-[#657183]">Drop files here or click to browse</p>
        </div>
        <input type="file" className="hidden" onChange={onFileChange} />
      </label>

      {attachedFile && (
        <div className="mt-3 flex items-center justify-between rounded-[8px] border border-[#d6dce3] bg-white p-3">
          <div className="flex items-center gap-3">
            <div className="rounded-[8px] bg-[#fff4df] p-2">
              <FileText className="text-[#ffa313]" size={18} />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#2d3b4f]">{attachedFile.name}</p>
              <p className="text-[11px] text-[#657183]">{(attachedFile.size / (1024 * 1024)).toFixed(1)} MB</p>
            </div>
          </div>
          <button onClick={onRemove} className="rounded-full p-1 text-[#657183] hover:bg-[#f7f8fa]">
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

// --- Main Panel Component ---

const NotesAndReports = () => {
  const [notes, setNotes] = useState<MentorNote[]>([]);
  const [students, setStudents] = useState<MentorStudentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<MentorNote | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  // Form States
  const [formData, setFormData] = useState({
    studentId: "",
    category: "Academic",
    title: "",
    content: ""
  });
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  const loadNotes = () => {
    getMentorNotes()
      .then(({ notes, students }) => {
        setNotes(notes);
        setStudents(students);
      })
      .catch((e) => setNotice((e as Error).message))
      .finally(() => setLoading(false));
  };

  useEffect(loadNotes, []);

  // --- Search & Filter Logic ---
  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            note.student.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All Categories" || note.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [notes, searchQuery, selectedCategory]);

  const handleOpenModal = (note: MentorNote | null = null) => {
    if (note) {
      setEditingNote(note);
      setFormData({
        studentId: note.studentId,
        category: note.category,
        title: note.title,
        content: note.content
      });
    } else {
      setEditingNote(null);
      setFormData({ studentId: "", category: "Academic", title: "", content: "" });
    }
    setAttachedFile(null);
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedFile(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    const res: { error?: string; id?: string } = editingNote
      ? await updateMentorNote(editingNote.id, formData)
      : await createMentorNote(formData);
    // Persist the attachment (if any) against the newly-created note.
    if (!res.error && !editingNote && res.id && attachedFile) {
      const fd = new FormData();
      fd.append("file", attachedFile);
      const up = await attachNoteFile(res.id, fd);
      if (up.error) setNotice(`Note saved, but the attachment failed: ${up.error}`);
    }
    setSaving(false);
    if (res.error) {
      setNotice(res.error);
      return;
    }
    setAttachedFile(null);
    setIsModalOpen(false);
    loadNotes();
  };

  return (
    <div className="relative min-h-screen bg-[#f4f4f4] px-4 pb-[24px] pt-[28px] font-poppins md:px-6">
      {/* Header Section */}
      <div className="mb-[26px] flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[30px] font-bold leading-none tracking-[-0.02em] text-[#111111]">Notes &amp; Reports</h1>
          <p className="mt-[10px] text-[14px] font-normal leading-none text-[#666666]">Document student progress and observations</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex h-[41px] w-full items-center justify-center gap-[9px] rounded-[10px] bg-[#ffa313] px-[24px] text-[14px] font-semibold text-white transition hover:bg-[#f59a0d] sm:w-auto"
        >
          <Plus size={17} strokeWidth={2} />
          New Note
        </button>
      </div>

      {notice && (
        <div className="mb-[20px] rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-semibold text-red-700">
          {notice}
        </div>
      )}

      {/* Filter Bar */}
      <div className="mb-[24px] flex min-h-[80px] flex-col gap-[12px] rounded-[8px] border border-[#dddddd] bg-white px-[16px] py-[16px] lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-[16px] top-1/2 -translate-y-1/2 text-[#666666]" size={20} strokeWidth={1.8} />
          <input 
            type="text" 
            placeholder="Search notes..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-[48px] w-full rounded-[8px] border border-[#dddddd] bg-white pl-[43px] pr-[14px] text-[16px] font-normal text-[#111111] outline-none placeholder:text-[#9aa3af] focus:border-[#ffa313]"
          />
        </div>
        <div className="flex gap-[13px]">
          <button className="flex h-[48px] w-[38px] items-center justify-center rounded-[8px] text-[#666666] transition hover:bg-[#f7f7f7]" aria-label="Filter">
            <Filter size={20} strokeWidth={1.8} />
          </button>
          <div className="relative w-full min-w-[180px]">
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-[48px] w-full appearance-none rounded-[8px] border border-[#dddddd] bg-white px-[16px] pr-[42px] text-[15px] font-normal text-[#111111] outline-none"
            >
              <option value="All Categories">All Categories</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <ChevronDown size={18} strokeWidth={1.8} className="pointer-events-none absolute right-[14px] top-1/2 -translate-y-1/2 text-[#666666]" />
          </div>
        </div>
      </div>

      {/* Notes List */}
      <div className="space-y-[16px]">
        {loading ? (
          <div className="rounded-[8px] border border-dashed border-[#dddddd] bg-white py-20 text-center text-[15px] text-[#657183]">
            Loading notes…
          </div>
        ) : filteredNotes.length > 0 ? (
          filteredNotes.map((note) => (
            <div key={note.id} className="relative min-h-[136px] rounded-[8px] border border-[#dddddd] bg-white px-[24px] py-[25px] transition-shadow hover:shadow-sm">
              <div className="mb-[13px] flex items-start justify-between gap-4">
                <div className="flex flex-wrap items-center gap-[13px]">
                  <h3 className="text-[17px] font-semibold leading-none text-[#2d3b4f]">{note.title}</h3>
                  <Badge type={note.category} />
                  <span className={`inline-flex h-[23px] items-center rounded-full px-[12px] text-[12px] font-normal capitalize leading-none ${STATUS_STYLES[note.status] || "bg-gray-100 text-gray-500"}`}>
                    {note.status}
                  </span>
                </div>
                <button 
                  onClick={() => handleOpenModal(note)}
                  className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px] border border-[#d6d6d6] text-[#657183] transition hover:bg-[#f7f7f7]"
                  aria-label={`Edit ${note.title}`}
                >
                  <Pencil size={18} strokeWidth={1.8} />
                </button>
              </div>

              <div className="mb-[17px] flex flex-wrap items-center gap-x-[17px] gap-y-[8px] text-[15px] font-normal leading-none text-[#657183]">
                <div className="flex items-center gap-[7px]">
                  <User size={16} strokeWidth={1.8} /> {note.student}
                </div>
                <div className="flex items-center gap-[7px]">
                  <Calendar size={16} strokeWidth={1.8} /> {note.date}
                </div>
                <div>By {note.author}</div>
              </div>

              <p className="max-w-[1090px] text-[14px] font-normal leading-[1.45] text-[#2d3b4f]">
                {note.content}
              </p>
            </div>
          ))
        ) : (
          <div className="rounded-[8px] border border-dashed border-[#dddddd] bg-white py-20 text-center text-[15px] text-[#657183]">
            No notes found matching your criteria.
          </div>
        )}
      </div>

      {/* Modal - Create/Edit Note */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#000000]/50 p-4">
          <div className="relative flex max-h-[92vh] w-full max-w-[770px] flex-col overflow-hidden rounded-[8px] bg-white shadow-2xl">
            <div className="flex h-[80px] shrink-0 items-center justify-between border-b border-[#d6dce3] px-[24px]">
              <h2 className="text-[24px] font-semibold leading-none text-[#2d3b4f]">
                {editingNote ? "Edit Note" : "Create New Note"}
              </h2>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-[24px] pb-[18px] pt-[28px]">
              <div>
                <label className="mb-[10px] block text-[16px] font-normal leading-none text-[#657183]">Student</label>
                <div className="relative">
                  <User className="absolute left-[13px] top-1/2 -translate-y-1/2 text-[#657183]" size={18} strokeWidth={1.8} />
                  <select
                    value={formData.studentId}
                    onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                    className="h-[38px] w-full appearance-none rounded-[8px] border border-[#d6dce3] bg-white pl-[38px] pr-[42px] text-[16px] font-normal text-[#2d3b4f] outline-none focus:border-[#ffa313]"
                  >
                    <option value="">Select Student...</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-[13px] top-1/2 -translate-y-1/2 text-[#657183]" size={20} strokeWidth={1.8} />
                </div>
              </div>

              <div className="mt-[20px] grid grid-cols-1 gap-[16px] sm:grid-cols-2">
                <div>
                  <label className="mb-[10px] block text-[16px] font-normal leading-none text-[#657183]">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-[13px] top-1/2 -translate-y-1/2 text-[#657183]" size={18} strokeWidth={1.8} />
                    <input
                      type="text"
                      value={editingNote ? editingNote.date : "Set automatically"}
                      readOnly
                      className="h-[44px] w-full cursor-default rounded-[8px] border border-[#d6dce3] bg-[#f7f8fa] pl-[38px] pr-[13px] text-[16px] font-normal text-[#657183] outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-[10px] block text-[16px] font-normal leading-none text-[#657183]">Category</label>
                  <div className="relative">
                    <Tag className="absolute left-[13px] top-1/2 -translate-y-1/2 text-[#657183]" size={18} strokeWidth={1.8} />
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="h-[44px] w-full appearance-none rounded-[8px] border border-[#d6dce3] bg-white pl-[38px] pr-[42px] text-[16px] font-normal text-[#2d3b4f] outline-none focus:border-[#ffa313]"
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-[13px] top-1/2 -translate-y-1/2 text-[#657183]" size={20} strokeWidth={1.8} />
                  </div>
                </div>
              </div>

              <div className="mt-[20px]">
                <label className="mb-[10px] block text-[16px] font-normal leading-none text-[#657183]">Title</label>
                <input 
                  type="text" 
                  placeholder="Note title..."
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="h-[44px] w-full rounded-[8px] border border-[#d6dce3] bg-white px-[16px] text-[16px] font-normal text-[#2d3b4f] outline-none placeholder:text-[#9aa3af] focus:border-[#ffa313]" 
                />
              </div>

              <div className="mt-[20px]">
                <label className="mb-[10px] block text-[16px] font-normal leading-none text-[#657183]">Note Content</label>
                <textarea 
                  placeholder="Write your observations, progress notes, or concerns..."
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  className="h-[109px] w-full resize-none rounded-[8px] border border-[#d6dce3] bg-white px-[16px] py-[13px] text-[16px] font-normal leading-[1.45] text-[#2d3b4f] outline-none placeholder:text-[#9aa3af] focus:border-[#ffa313]"
                />
              </div>

              <FileUploadArea 
                attachedFile={attachedFile} 
                onFileChange={handleFileChange} 
                onRemove={() => setAttachedFile(null)} 
              />
            </div>

            <div className="flex h-[91px] shrink-0 items-center justify-end gap-[16px] border-t border-[#d6dce3] px-[24px]">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="h-[42px] rounded-[8px] border border-[#d6dce3] bg-white px-[18px] text-[14px] font-semibold text-[#2d3b4f] transition hover:bg-[#f7f8fa]"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="h-[42px] rounded-[8px] bg-[#ffa313] px-[22px] text-[14px] font-semibold text-white transition hover:bg-[#f59a0d] disabled:opacity-60"
              >
                {saving ? "Saving…" : editingNote ? "Save Changes" : "Save & Send Note"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesAndReports;
