"use client";

import React, { useEffect, useMemo, useState } from "react";
import { listNotes, setNoteStatus } from "@/lib/data/notes";
import type { UINote, NoteStatus } from "@/lib/data/notes.types";

type Note = UINote;

const statusBadgeClass: Record<NoteStatus, string> = {
  approved: "bg-[#d9f8e6] text-[#009a3d]",
  pending: "bg-[#ffe9d6] text-[#c65300]",
  rejected: "bg-[#ffe1e1] text-[#c90000]",
  flagged: "bg-[#ffe1e8] text-[#d21c45]",
};

const categoryBadgeClass: Record<string, string> = {
  Session: "bg-[#dbeafe] text-[#0057ff]",
  Feedback: "bg-[#d9f8e6] text-[#009a3d]",
  Progress: "bg-[#f0dcff] text-[#9818d6]",
  Report: "bg-[#ffe1e8] text-[#d21c45]",
};

const StatusBadge = ({ status }: { status: NoteStatus }) => (
  <span className={`inline-flex h-[24px] items-center rounded-full px-[12px] text-[13px] font-normal leading-none ${statusBadgeClass[status]}`}>
    {status}
  </span>
);

const CategoryBadge = ({ category }: { category: string }) => (
  <span className={`inline-flex h-[24px] items-center rounded-full px-[12px] text-[13px] font-normal leading-none ${categoryBadgeClass[category] ?? "bg-[#eeeeee] text-[#666666]"}`}>
    {category.toLowerCase()}
  </span>
);

export default function Notesmode() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<NoteStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Note | null>(null);
  const [modal, setModal] = useState<"approve" | "reject" | "detail" | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await listNotes();
      setNotes(data);
      setSelected((prev) => (prev && data.find((n) => n.id === prev.id)) || data[0] || null);
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(() => {
    return notes.filter((n) => {
      const q = search.toLowerCase().trim();
      const matchesSearch = n.title.toLowerCase().includes(q) || n.snippet.toLowerCase().includes(q) || n.author.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || n.status === statusFilter;
      const matchesCat = categoryFilter === "all" || n.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCat;
    });
  }, [notes, search, statusFilter, categoryFilter]);

  const stats = useMemo(() => {
    return {
      total: notes.length,
      pending: notes.filter((n) => n.status === "pending").length,
      approved: notes.filter((n) => n.status === "approved").length,
      rejected: notes.filter((n) => n.status === "rejected").length,
      flagged: notes.filter((n) => n.status === "flagged").length,
    };
  }, [notes]);

  const updateStatus = async (status: NoteStatus) => {
    if (!selected) return;
    const res = await setNoteStatus(selected.id, status);
    if (res.error) {
      setNotice(res.error);
      return;
    }
    setNotice(`Note ${status}.`);
    await refresh();
  };

  return (
    <div className="min-h-full bg-[#f4f4f4] px-6 py-6 font-[Poppins]">
      <div className="mb-[24px] flex items-center gap-[12px]">
        <div className="flex h-[48px] w-[48px] items-center justify-center rounded-[8px] bg-[#fff7e8]">
          <img src="/images/admin-notes-icon-11.svg" alt="" className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-[24px] font-semibold leading-none text-[#111111]">Notes Moderation</h1>
          <p className="mt-[7px] text-[16px] font-normal leading-none text-[#666666]">Review and moderate user-generated notes</p>
        </div>
      </div>

      {notice && (
        <div className="mb-4 flex items-start justify-between gap-4 rounded-[8px] border border-green-200 bg-green-50 px-4 py-3 text-[14px] font-semibold text-green-700">
          <span className="break-all">{notice}</span>
          <button type="button" onClick={() => setNotice(null)} className="shrink-0 text-[13px] underline">
            Dismiss
          </button>
        </div>
      )}

      <div className="mb-[24px] grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total Notes" value={stats.total} color="text-[#0073d8]" />
        <StatCard label="Pending" value={stats.pending} color="text-[#ff4b00]" />
        <StatCard label="Approved" value={stats.approved} color="text-[#00a641]" />
        <StatCard label="Rejected" value={stats.rejected} color="text-[#ff0000]" />
        <StatCard label="Flagged" value={stats.flagged} color="text-[#d40000]" />
      </div>

      <div className="grid grid-cols-1 gap-[24px] xl:grid-cols-[1fr_358px]">
        <section className="min-h-[990px] overflow-hidden rounded-[8px] border border-[#d6d6d6] bg-white">
          <div className="border-b border-[#d6d6d6] px-[24px] py-[24px]">
            <div className="flex h-[48px] items-center rounded-[8px] border border-[#d6d6d6] bg-white px-[16px]">
              <span className="relative mr-[15px] block h-[21px] w-[21px] rounded-full border-2 border-[#666666] after:absolute after:ml-[14px] after:mt-[14px] after:block after:h-[8px] after:w-[2px] after:-rotate-45 after:bg-[#666666]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notes..."
                className="h-full flex-1 bg-transparent text-[18px] font-normal text-[#111111] outline-none placeholder:text-[#777777]"
              />
            </div>

            <div className="mt-[16px] flex flex-wrap gap-[16px]">
              <Select
                value={statusFilter}
                onChange={(v) => setStatusFilter(v as NoteStatus | "all")}
                options={[
                  { value: "all", label: "All Status" },
                  { value: "pending", label: "Pending" },
                  { value: "approved", label: "Approved" },
                  { value: "rejected", label: "Rejected" },
                  { value: "flagged", label: "Flagged" },
                ]}
              />
              <Select
                value={categoryFilter}
                onChange={setCategoryFilter}
                options={[
                  { value: "all", label: "All Categories" },
                  { value: "Session", label: "Session" },
                  { value: "Feedback", label: "Feedback" },
                  { value: "Progress", label: "Progress" },
                  { value: "Report", label: "Report" },
                ]}
              />
            </div>
          </div>

          <div>
            {loading && (
              <p className="px-[16px] py-[20px] text-[14px] text-[#666666]">Loading notes...</p>
            )}
            {!loading && filtered.length === 0 && (
              <p className="px-[16px] py-[20px] text-[14px] text-[#666666]">No notes found.</p>
            )}
            {filtered.map((note) => (
              <button
                key={note.id}
                onClick={() => setSelected(note)}
                className={`grid w-full grid-cols-[1fr_auto] gap-[16px] border-b border-[#d6d6d6] px-[16px] py-[15px] text-left transition-colors last:border-b-0 ${
                  selected?.id === note.id ? "bg-[#e3f3ff]" : "bg-white hover:bg-[#f8fbff]"
                }`}
              >
                <div className="min-w-0">
                  <h2 className="truncate text-[16px] font-normal leading-none text-[#111111]">{note.title}</h2>
                  <p className="mt-[17px] truncate text-[13px] font-normal leading-none text-[#666666]">{note.snippet}</p>
                  <div className="mt-[10px] flex flex-wrap items-end justify-between gap-[12px]">
                    <p className="text-[13px] font-normal leading-[16px] text-[#666666]">
                      {note.author}
                      <br />
                      ({note.role})
                    </p>
                    <p className="text-[13px] font-normal leading-none text-[#666666]">{note.createdAt}</p>
                  </div>
                </div>
                <StatusBadge status={note.status} />
              </button>
            ))}
          </div>
        </section>

        <aside className="min-h-[990px] rounded-[8px] border border-[#d6d6d6] bg-white px-[24px] py-[26px]">
          {!selected ? (
            <p className="text-[15px] font-normal text-[#666666]">
              {loading ? "Loading..." : "No notes to review."}
            </p>
          ) : (
            <>
              <h2 className="text-[18px] font-normal leading-none text-[#111111]">{selected.title}</h2>
              <div className="mt-[16px] flex gap-[8px]">
                <StatusBadge status={selected.status} />
                <CategoryBadge category={selected.category} />
              </div>

              <PanelBlock label="Author">
                <p className="text-[15px] font-normal leading-none text-[#111111]">{selected.author}</p>
                <p className="mt-[9px] text-[13px] font-normal leading-none text-[#666666]">{selected.role}</p>
              </PanelBlock>

              <PanelBlock label="Session">
                <p className="text-[15px] font-normal leading-none text-[#111111]">{selected.session}</p>
              </PanelBlock>

              <PanelBlock label="Created">
                <p className="text-[15px] font-normal leading-none text-[#111111]">{selected.createdAt}</p>
              </PanelBlock>

              <PanelBlock label="Content">
                <p className="text-[15px] font-normal leading-[21px] text-[#111111]">{selected.snippet}</p>
              </PanelBlock>

              <div className="mt-[16px] space-y-[16px]">
                <button
                  onClick={() => setModal("approve")}
                  className="flex h-[41px] w-full items-center justify-center gap-[8px] rounded-[8px] bg-[#00ab42] text-[18px] font-normal text-white transition-colors hover:bg-[#009438]"
                >
                  <img src="/images/admin-notes-icon-8.svg" alt="" className="h-4 w-4" />
                  Approve Note
                </button>
                <button
                  onClick={() => setModal("reject")}
                  className="flex h-[41px] w-full items-center justify-center gap-[8px] rounded-[8px] bg-[#ef0010] text-[18px] font-normal text-white transition-colors hover:bg-[#d8000e]"
                >
                  <img src="/images/admin-notes-icon-7.svg" alt="" className="h-5 w-5" />
                  Reject Note
                </button>
                <button
                  onClick={() => updateStatus("flagged")}
                  className="flex h-[43px] w-full items-center justify-center gap-[8px] rounded-[8px] border border-[#d6d6d6] bg-white text-[18px] font-normal text-[#666666] transition-colors hover:bg-[#f7f7f7]"
                >
                  <img src="/images/admin-notes-icon-9.svg" alt="" className="h-4 w-4" />
                  Flag for Review
                </button>
                <button
                  onClick={() => setModal("detail")}
                  className="flex h-[43px] w-full items-center justify-center gap-[8px] rounded-[8px] border border-[#d6d6d6] bg-white text-[18px] font-normal text-[#1976D2] transition-colors hover:bg-[#f7fbff]"
                >
                  <img src="/images/admin-notes-icon-10.svg" alt="" className="h-4 w-4" />
                  View Full Details
                </button>
              </div>
            </>
          )}
        </aside>
      </div>

      {modal === "detail" && selected && (
        <NoteDetailModal
          note={selected}
          onClose={() => setModal(null)}
          onApprove={() => {
            updateStatus("approved");
            setModal(null);
          }}
          onReject={() => {
            updateStatus("rejected");
            setModal(null);
          }}
        />
      )}

      {modal === "approve" && selected && (
        <ConfirmModal
          title="Approve Note"
          message={`Are you sure you want to approve the note "${selected.title}"?`}
          actionLabel="Approve"
          actionClass="bg-[#00ab42] hover:bg-[#009438]"
          onCancel={() => setModal(null)}
          onAction={() => {
            updateStatus("approved");
            setModal(null);
          }}
        />
      )}

      {modal === "reject" && selected && (
        <ConfirmModal
          title="Reject Note"
          message={`Are you sure you want to reject the note "${selected.title}"?`}
          actionLabel="Reject"
          actionClass="bg-[#ef0010] hover:bg-[#d8000e]"
          onCancel={() => setModal(null)}
          onAction={() => {
            updateStatus("rejected");
            setModal(null);
          }}
        />
      )}
    </div>
  );
}

const StatCard = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="h-[86px] rounded-[8px] border border-[#d6d6d6] bg-white px-[16px] py-[18px]">
    <p className="text-[16px] font-normal leading-none text-[#666666]">{label}</p>
    <p className={`mt-[13px] text-[25px] font-normal leading-none ${color}`}>{value}</p>
  </div>
);

const Select = ({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) => (
  <div className="relative h-[48px] w-[160px]">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-full w-full appearance-none rounded-[8px] border border-[#d6d6d6] bg-white px-[11px] pr-[38px] text-[16px] font-normal text-[#666666] outline-none"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    <span className="pointer-events-none absolute right-[16px] top-1/2 h-[11px] w-[11px] -translate-y-[65%] rotate-45 border-b-2 border-r-2 border-[#666666]" />
  </div>
);

const PanelBlock = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="mt-[20px] border-b border-[#d9d9d9] pb-[18px]">
    <p className="mb-[12px] text-[16px] font-normal leading-none text-[#666666]">{label}</p>
    {children}
  </div>
);

function NoteDetailModal({
  note,
  onClose,
  onApprove,
  onReject,
}: {
  note: Note;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="max-h-[calc(100vh-24px)] w-full max-w-[768px] overflow-y-auto rounded-[8px] bg-white font-[Poppins] shadow-2xl [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex h-[89px] items-center justify-between border-b border-[#d9d9d9] px-[24px]">
          <h2 className="text-[22px] font-normal leading-none text-[#111111]">Note Details</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#777777] transition-colors hover:bg-[#f2f2f2]"
            aria-label="Close"
          >
            <span className="relative h-[24px] w-[24px] before:absolute before:left-1/2 before:top-1/2 before:h-[2px] before:w-[22px] before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-45 before:bg-[#777777] after:absolute after:left-1/2 after:top-1/2 after:h-[2px] after:w-[22px] after:-translate-x-1/2 after:-translate-y-1/2 after:-rotate-45 after:bg-[#777777]" />
          </button>
        </div>

        <div className="px-[24px] py-[28px]">
          <h3 className="text-[26px] font-normal leading-none text-[#111111]">{note.title}</h3>
          <div className="mt-[18px] flex gap-[8px]">
            <StatusBadge status={note.status} />
            <CategoryBadge category={note.category} />
          </div>

          <DetailSection className="mt-[24px]" title="Author Information">
            <div className="grid grid-cols-2 gap-[24px]">
              <ModalInfo label="Name" value={note.author} />
              <ModalInfo label="Role" value={capitalize(note.role)} />
            </div>
          </DetailSection>

          <DetailSection className="mt-[23px]" title="Session Information">
            <p className="text-[15px] font-normal leading-none text-[#111111]">{note.session}</p>
          </DetailSection>

          <DetailSection className="mt-[23px]" title="Created At">
            <p className="text-[15px] font-normal leading-none text-[#111111]">{note.createdAt}</p>
          </DetailSection>

          <p className="mt-[25px] text-[16px] font-normal leading-none text-[#666666]">Content</p>
          <div className="mt-[12px] rounded-[8px] bg-[#f4f4f4] px-[16px] py-[16px]">
            <p className="truncate text-[15px] font-normal leading-none text-[#111111]">{note.content}</p>
          </div>

          <div className="mt-[24px] grid grid-cols-2 gap-[12px] border-t border-[#d9d9d9] pt-[16px]">
            <button
              onClick={onApprove}
              className="flex h-[48px] items-center justify-center gap-[7px] rounded-[8px] bg-[#00ab42] text-[18px] font-normal text-white transition-colors hover:bg-[#009438]"
            >
              <img src="/images/admin-notes-icon-6.svg" alt="" className="h-5 w-5" />
              Approve Note
            </button>
            <button
              onClick={onReject}
              className="flex h-[48px] items-center justify-center gap-[7px] rounded-[8px] bg-[#ef0010] text-[18px] font-normal text-white transition-colors hover:bg-[#d8000e]"
            >
              <img src="/images/admin-notes-icon-7.svg" alt="" className="h-5 w-5" />
              Reject Note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const DetailSection = ({ title, className = "", children }: { title: string; className?: string; children: React.ReactNode }) => (
  <section className={`${className} rounded-[8px] bg-[#f4f4f4] px-[16px] py-[17px]`}>
    <p className="mb-[15px] text-[16px] font-normal leading-none text-[#666666]">{title}</p>
    {children}
  </section>
);

const ModalInfo = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="mb-[9px] text-[13px] font-normal leading-none text-[#666666]">{label}</p>
    <p className="text-[15px] font-normal leading-none text-[#111111]">{value}</p>
  </div>
);

function ConfirmModal({
  title,
  message,
  actionLabel,
  actionClass,
  onCancel,
  onAction,
}: {
  title: string;
  message: string;
  actionLabel: string;
  actionClass: string;
  onCancel: () => void;
  onAction: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-[446px] rounded-[8px] bg-white px-[24px] py-[28px] font-[Poppins] shadow-2xl">
        <h2 className="text-[20px] font-normal leading-none text-[#111111]">{title}</h2>
        <p className="mt-[22px] max-w-[390px] text-[15px] font-normal leading-[20px] text-[#666666]">{message}</p>
        <div className="mt-[19px] flex justify-end gap-[13px]">
          <button
            onClick={onCancel}
            className="h-[42px] rounded-[8px] border border-[#d6d6d6] bg-white px-[14px] text-[16px] font-normal text-[#666666] transition-colors hover:bg-[#f7f7f7]"
          >
            Cancel
          </button>
          <button
            onClick={onAction}
            className={`h-[42px] rounded-[8px] px-[14px] text-[16px] font-normal text-white transition-colors ${actionClass}`}
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
