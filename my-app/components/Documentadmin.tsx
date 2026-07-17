"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  listDocuments,
  uploadDocument,
  getDocumentDownloadUrl,
  setDocumentStatus,
} from "@/lib/data/documents";

type DocStatus = "Pending" | "Approved" | "Rejected";

type DocumentItem = {
  id: string;
  name: string;
  uploader: string;
  uploaderEmail: string;
  category: string;
  type: string;
  size: string;
  date: string;
  status: DocStatus;
  description: string;
  role: string;
  source?: "mentor" | "admin";
};

type Notice = { type: "success" | "error"; msg: string };

const statusClass: Record<DocStatus, string> = {
  Pending: "bg-[#ffe6c2] text-[#c94f00]",
  Approved: "bg-[#d9f8e6] text-[#008a3b]",
  Rejected: "bg-[#ffe0e0] text-[#d10000]",
};

export default function Documentadmin() {
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [tab, setTab] = useState<"all" | "mentor">("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | DocStatus>("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showUpload, setShowUpload] = useState(false);
  const [selected, setSelected] = useState<DocumentItem | null>(null);
  const [modal, setModal] = useState<"detail" | "approve" | "reject" | null>(null);
  const [uploadForm, setUploadForm] = useState({
    name: "",
    category: "Reports",
    type: "PDF",
    size: "1.0 MB",
  });

  const refresh = async () => {
    setLoading(true);
    try {
      setDocs((await listDocuments()) as DocumentItem[]);
    } catch (e) {
      setNotice({ type: "error", msg: (e as Error).message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    const lock = showUpload || !!modal;
    if (!lock) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [showUpload, modal]);

  const stats = useMemo(
    () => ({
      total: docs.length,
      approved: docs.filter((doc) => doc.status === "Approved").length,
      pending: docs.filter((doc) => doc.status === "Pending").length,
      rejected: docs.filter((doc) => doc.status === "Rejected").length,
    }),
    [docs]
  );

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();
    return docs.filter((doc) => {
      const inTab = tab === "all" || doc.source === "mentor";
      const matchesSearch = doc.name.toLowerCase().includes(query) || doc.uploader.toLowerCase().includes(query);
      const matchesStatus = statusFilter === "All" || doc.status === statusFilter;
      const matchesCategory = categoryFilter === "All" || doc.category === categoryFilter;
      return inTab && matchesSearch && matchesStatus && matchesCategory;
    });
  }, [docs, tab, search, statusFilter, categoryFilter]);

  const mentorPending = docs.filter((doc) => doc.source === "mentor" && doc.status === "Pending").length;

  const updateStatus = async (status: DocStatus) => {
    if (!selected) return;
    const target = selected;
    setModal(null);
    const res = await setDocumentStatus(target.id, status);
    if (res.error) {
      setNotice({ type: "error", msg: res.error });
      return;
    }
    setNotice({ type: "success", msg: `Document ${status.toLowerCase()}.` });
    await refresh();
  };

  const download = async (doc: DocumentItem | null) => {
    if (!doc) return;
    const res = await getDocumentDownloadUrl(doc.id);
    if (res.error || !res.url) {
      setNotice({ type: "error", msg: res.error ?? "Could not open the file." });
      return;
    }
    window.open(res.url, "_blank", "noopener,noreferrer");
  };

  const addDocument = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    fd.set("description", "Uploaded via admin panel");
    setSubmitting(true);
    const res = await uploadDocument(fd);
    setSubmitting(false);
    if (res.error) {
      setNotice({ type: "error", msg: res.error });
      return;
    }
    setNotice({ type: "success", msg: "Document uploaded (pending review)." });
    setShowUpload(false);
    setUploadForm({ name: "", category: "Reports", type: "PDF", size: "1.0 MB" });
    await refresh();
  };

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
      <div className="mb-[24px] flex items-center justify-between gap-4">
        <div className="flex items-center gap-[12px]">
          <div className="flex h-[48px] w-[48px] items-center justify-center rounded-[8px] bg-[#fff7e8]">
            <img src="/images/admin-doc-main.svg" alt="" className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-[24px] font-semibold leading-none text-[#111111]">Documents Management</h1>
            <p className="mt-[8px] text-[16px] font-normal leading-none text-[#666666]">{docs.length} total documents</p>
          </div>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="flex h-[48px] items-center gap-[8px] rounded-[8px] bg-[#ffa313] px-[22px] text-[16px] font-normal text-white transition-colors hover:bg-[#ef970d]"
        >
          <UploadGlyph color="white" />
          Upload Document
        </button>
      </div>

      <div className="mb-[24px] grid grid-cols-1 gap-[16px] sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Documents" value={stats.total} color="text-[#1976D2]" />
        <StatCard label="Approved" value={stats.approved} color="text-[#00A63E]" />
        <StatCard label="Pending Review" value={stats.pending} color="text-[#FF4B00]" />
        <StatCard label="Rejected" value={stats.rejected} color="text-[#FF0000]" />
      </div>

      <section className="overflow-hidden rounded-[8px] border border-[#d6d6d6] bg-white">
        <div className="flex h-[77px] items-end gap-[10px] border-b border-[#d6d6d6] px-[20px]">
          <TabButton active={tab === "all"} onClick={() => setTab("all")}>
            All Documents
          </TabButton>
          <TabButton active={tab === "mentor"} onClick={() => setTab("mentor")}>
            Mentor Uploads - Pending Approval
            <span className="ml-[2px] inline-flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#8a8a8a] text-[12px] text-white">
              {mentorPending}
            </span>
          </TabButton>
        </div>

        <div className="flex flex-wrap items-center gap-[16px] border-b border-[#d6d6d6] px-[24px] py-[24px]">
          <div className="flex h-[48px] min-w-[280px] flex-1 items-center rounded-[8px] border border-[#d6d6d6] px-[16px]">
            <SearchGlyph />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search documents..."
              className="ml-[13px] h-full min-w-0 flex-1 bg-transparent text-[16px] font-normal text-[#111111] outline-none placeholder:text-[#777777]"
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(value) => setStatusFilter(value as "All" | DocStatus)}
            options={["All", "Pending", "Approved", "Rejected"]}
            allLabel="All Status"
          />
          <Select
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={["All", "Reports", "Attendance", "Feedback", "Enrollment", "Session Notes", "Certificates", "Assignments", "Course Materials"]}
            allLabel="All Categories"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1060px] border-collapse text-left">
            <thead className="bg-[#f3f3f3] text-[15px] font-normal text-[#666666]">
              <tr>
                <th className="px-[24px] py-[15px] font-normal">Document Name</th>
                <th className="px-[14px] py-[15px] font-normal">Uploaded By</th>
                <th className="px-[14px] py-[15px] font-normal">Category</th>
                <th className="px-[14px] py-[15px] font-normal">Type</th>
                <th className="px-[14px] py-[15px] font-normal">Size</th>
                <th className="px-[14px] py-[15px] font-normal">Date</th>
                {tab === "all" && <th className="px-[14px] py-[15px] font-normal">Status</th>}
                <th className="px-[14px] py-[15px] font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={tab === "all" ? 8 : 7} className="px-[24px] py-[40px] text-center text-[#777777]">
                    Loading documents...
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={tab === "all" ? 8 : 7} className="px-[24px] py-[40px] text-center text-[#777777]">
                    No documents found.
                  </td>
                </tr>
              )}
              {!loading && filtered.map((doc) => (
                <tr key={doc.id} className="border-t border-[#d6d6d6] text-[15px] font-normal text-[#666666]">
                  <td className="px-[24px] py-[17px] text-[#111111]">
                    <div className="flex items-center gap-[10px]">
                      <img src="/images/admin-doc-row.svg" alt="" className="h-4 w-4" />
                      <span className="max-w-[235px] truncate">{doc.name}</span>
                    </div>
                  </td>
                  <td className="px-[14px] py-[17px]">
                    {tab === "mentor" ? (
                      <div className="flex items-center gap-[12px]">
                        <Initials name={doc.uploader} />
                        <div>
                          <p className="text-[#111111]">{doc.uploader}</p>
                          <p className="text-[13px] leading-none text-[#666666]">{doc.uploaderEmail}</p>
                        </div>
                      </div>
                    ) : (
                      <span>{breakText(doc.uploader)}</span>
                    )}
                  </td>
                  <td className="px-[14px] py-[17px]">{doc.category}</td>
                  <td className="px-[14px] py-[17px]">{doc.type}</td>
                  <td className="px-[14px] py-[17px]">{breakText(doc.size)}</td>
                  <td className="px-[14px] py-[17px]">{doc.date}</td>
                  {tab === "all" && (
                    <td className="px-[14px] py-[17px]">
                      <StatusBadge status={doc.status} />
                    </td>
                  )}
                  <td className="px-[14px] py-[17px]">
                    <div className="flex items-center gap-[17px]">
                      <IconButton label="View" onClick={() => { setSelected(doc); setModal("detail"); }}>
                        <img src={tab === "mentor" ? "/images/admin-doc-eye-gold.svg" : "/images/admin-doc-eye-blue.svg"} alt="" className="h-4 w-4" />
                      </IconButton>
                      <IconButton label="Download" onClick={() => download(doc)}>
                        <img src={tab === "mentor" ? "/images/admin-doc-download-gold.svg" : "/images/admin-doc-download.svg"} alt="" className="h-4 w-4" />
                      </IconButton>
                      {(tab === "mentor" || doc.status === "Pending") && (
                        <>
                          <IconButton label="Approve" onClick={() => { setSelected(doc); setModal("approve"); }}>
                            <CircleCheckGlyph />
                          </IconButton>
                          <IconButton label="Reject" onClick={() => { setSelected(doc); setModal("reject"); }}>
                            <CircleXGlyph />
                          </IconButton>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {showUpload && (
        <UploadModal
          form={uploadForm}
          setForm={setUploadForm}
          onClose={() => setShowUpload(false)}
          onSubmit={addDocument}
          submitting={submitting}
        />
      )}

      {modal === "detail" && selected && (
        <DocumentDetailModal
          doc={selected}
          onClose={() => setModal(null)}
          onDownload={() => download(selected)}
          onApprove={() => updateStatus("Approved")}
          onReject={() => updateStatus("Rejected")}
          variant={tab === "mentor" ? "mentor" : "compact"}
        />
      )}

      {modal === "approve" && selected && (
        <ConfirmModal
          title="Approve Document"
          message={`Are you sure you want to approve the document "${selected.name}"?`}
          confirmText="Approve"
          confirmClass="bg-[#00ab42] hover:bg-[#009438]"
          onClose={() => setModal(null)}
          onConfirm={() => updateStatus("Approved")}
        />
      )}

      {modal === "reject" && selected && (
        <ConfirmModal
          title="Reject Document"
          message={`Are you sure you want to reject the document "${selected.name}"?`}
          confirmText="Reject"
          confirmClass="bg-[#ef0010] hover:bg-[#d8000e]"
          onClose={() => setModal(null)}
          onConfirm={() => updateStatus("Rejected")}
        />
      )}
    </div>
  );
}

function UploadModal({
  form,
  setForm,
  onClose,
  onSubmit,
  submitting,
}: {
  form: { name: string; category: string; type: string; size: string };
  setForm: React.Dispatch<React.SetStateAction<{ name: string; category: string; type: string; size: string }>>;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  submitting?: boolean;
}) {
  return (
    <ModalFrame width="max-w-[447px]" onClose={onClose}>
      <h2 className="mb-[25px] text-[18px] font-normal leading-none text-[#111111]">Upload Document</h2>
      <form onSubmit={onSubmit}>
        <Field label="Document Name *">
          <input
            required
            name="name"
            value={form.name}
            onChange={(event) => setForm((previous) => ({ ...previous, name: event.target.value }))}
            placeholder="Enter document name"
          />
        </Field>
        <Field label="Category *">
          <input
            required
            name="category"
            value={form.category}
            onChange={(event) => setForm((previous) => ({ ...previous, category: event.target.value }))}
            placeholder="Reports"
          />
        </Field>
        <Field label="File *">
          <input
            required
            type="file"
            name="file"
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                name: previous.name || event.target.value.replace(/^.*[\\/]/, ""),
              }))
            }
          />
        </Field>
        <div className="mt-[33px] grid grid-cols-[1fr_82px] gap-[13px]">
          <button type="submit" disabled={submitting} className="h-[42px] rounded-[8px] bg-[#ffa313] text-[16px] font-normal text-white hover:bg-[#ef970d] disabled:cursor-not-allowed disabled:opacity-70">
            {submitting ? "Uploading..." : "Upload Document"}
          </button>
          <button type="button" onClick={onClose} className="h-[42px] rounded-[8px] border border-[#d6d6d6] bg-white text-[16px] font-normal text-[#666666] hover:bg-[#f7f7f7]">
            Cancel
          </button>
        </div>
      </form>
    </ModalFrame>
  );
}

function DocumentDetailModal({
  doc,
  onClose,
  onDownload,
  onApprove,
  onReject,
  variant,
}: {
  doc: DocumentItem;
  onClose: () => void;
  onDownload: () => void;
  onApprove: () => void;
  onReject: () => void;
  variant: "compact" | "mentor";
}) {
  if (variant === "mentor") {
    return (
      <ModalFrame width="max-w-[768px]" onClose={onClose}>
        <h2 className="text-[22px] font-semibold leading-none text-[#242424]">Document Details</h2>
        <div className="mt-[21px]">
          <StatusBadge status={doc.status} />
        </div>
        <div className="-mx-[24px] mt-[25px] border-t border-[#d6d6d6]" />

        <div className="mt-[25px] rounded-[8px] border border-[#d6b15c] bg-[#fff8eb] px-[16px] py-[20px]">
          <div className="flex items-center gap-[14px]">
            <img src="/images/admin-doc-row.svg" alt="" className="h-6 w-6" />
            <div>
              <h3 className="text-[20px] font-semibold leading-none text-[#242424]">{doc.name}</h3>
              <div className="mt-[14px] flex gap-[8px]">
                <span className="rounded-full bg-[#d9eaff] px-[12px] py-[5px] text-[13px] font-semibold leading-none text-[#0056c8]">
                  {doc.category}
                </span>
                <span className="rounded-full bg-[#d9eaff] px-[12px] py-[5px] text-[13px] font-semibold leading-none text-[#111111]">
                  {doc.type}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-[25px] rounded-[8px] border border-[#d6d6d6] px-[16px] py-[18px]">
          <p className="text-[15px] font-semibold text-[#242424]">Uploaded By</p>
          <div className="mt-[18px] flex items-center gap-[16px]">
            <Initials name={doc.uploader} />
            <div>
              <p className="text-[15px] font-semibold leading-[18px] text-[#111111]">{doc.uploader}</p>
              <p className="text-[13px] font-semibold leading-[16px] text-[#666666]">{doc.uploaderEmail}</p>
              <p className="text-[13px] font-semibold leading-[16px] text-[#666666]">{doc.role}</p>
            </div>
          </div>
        </div>

        <div className="mt-[25px] grid grid-cols-1 gap-[16px] sm:grid-cols-2">
          <DetailInfoCard icon={<ClockGlyph />} label="Upload Date" value={formatLongDate(doc.date)} />
          <DetailInfoCard icon={<img src="/images/admin-doc-row.svg" alt="" className="h-4 w-4" />} label="File Size" value={doc.size} />
        </div>

        <div className="mt-[25px] rounded-[8px] border border-[#d6d6d6] px-[16px] py-[18px]">
          <p className="text-[15px] font-semibold leading-none text-[#242424]">Description</p>
          <p className="mt-[18px] text-[15px] font-semibold leading-[21px] text-[#666666]">{doc.description}</p>
        </div>

        <div className="mt-[25px] rounded-[8px] border border-[#ffa313] bg-[#fff8eb] px-[16px] py-[17px]">
          <div className="flex items-center gap-[11px]">
            <ClockGlyph strong />
            <p className="text-[15px] font-semibold leading-none text-[#7d2b00]">Pending Review</p>
          </div>
          <p className="mt-[12px] text-[13px] font-semibold leading-[18px] text-[#d13700]">
            This document was uploaded by a mentor and is awaiting admin approval before it becomes visible to students.
          </p>
        </div>

        <div className="-mx-[24px] mt-[25px] border-t border-[#d6d6d6]" />
        <div className="mt-[25px] grid grid-cols-3 gap-[12px]">
          <ActionButton className="bg-[#d6b15c] hover:bg-[#c5a04f]" onClick={onDownload}>
            <img src="/images/admin-doc-download-white.svg" alt="" className="h-4 w-4" />
            Download
          </ActionButton>
          <ActionButton className="bg-[#00ab42] hover:bg-[#009438]" onClick={onApprove}>
            <img src="/images/admin-doc-approve-white.svg" alt="" className="h-4 w-4" />
            Approve Document
          </ActionButton>
          <ActionButton className="bg-[#ef0010] hover:bg-[#d8000e]" onClick={onReject}>
            <img src="/images/admin-doc-reject-white.svg" alt="" className="h-4 w-4" />
            Reject Document
          </ActionButton>
        </div>
      </ModalFrame>
    );
  }

  return (
    <ModalFrame width="max-w-[768px]" onClose={onClose}>
      <h2 className="text-[22px] font-semibold leading-none text-[#242424]">Document Details</h2>
      <div className="mt-[21px] rounded-[8px] bg-[#f4f4f4] px-[16px] py-[20px]">
        <h3 className="text-[20px] font-semibold leading-none text-[#242424]">{doc.name}</h3>
        <div className="mt-[14px] flex gap-[8px]">
          <StatusBadge status={doc.status} />
          <span className="rounded-full bg-[#d9eaff] px-[12px] py-[5px] text-[13px] font-semibold leading-none text-[#0056c8]">
            {doc.category}
          </span>
        </div>
      </div>
      <div className="mt-[19px] grid grid-cols-2 gap-y-[20px]">
        <InfoPair label="Uploaded By" value={doc.uploader} />
        <InfoPair label="Upload Date" value={doc.date} />
        <InfoPair label="File Type" value={doc.type} />
        <InfoPair label="File Size" value={doc.size} />
      </div>
      <div className="mt-[19px] border-t border-[#d6d6d6] pt-[17px]">
        <div className="grid grid-cols-3 gap-[12px]">
          <ActionButton className="bg-[#d6b15c] hover:bg-[#c5a04f]" onClick={onDownload}>
            <img src="/images/admin-doc-download-white.svg" alt="" className="h-4 w-4" />
            Download
          </ActionButton>
          <ActionButton className="bg-[#00ab42] hover:bg-[#009438]" onClick={onApprove}>
            <img src="/images/admin-doc-approve-white.svg" alt="" className="h-4 w-4" />
            Approve
          </ActionButton>
          <ActionButton className="bg-[#ef0010] hover:bg-[#d8000e]" onClick={onReject}>
            <img src="/images/admin-doc-reject-white.svg" alt="" className="h-4 w-4" />
            Reject
          </ActionButton>
        </div>
      </div>
    </ModalFrame>
  );
}

function ConfirmModal({
  title,
  message,
  confirmText,
  confirmClass,
  onClose,
  onConfirm,
}: {
  title: string;
  message: string;
  confirmText: string;
  confirmClass: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <ModalFrame width="max-w-[447px]" onClose={onClose}>
      <h2 className="text-[18px] font-semibold leading-none text-[#242424]">{title}</h2>
      <p className="mt-[27px] text-[15px] font-semibold leading-[20px] text-[#666666]">{message}</p>
      <div className="mt-[34px] grid grid-cols-[1fr_82px] gap-[13px]">
        <button onClick={onConfirm} className={`h-[42px] rounded-[8px] text-[16px] font-semibold text-white ${confirmClass}`}>
          {confirmText}
        </button>
        <button onClick={onClose} className="h-[42px] rounded-[8px] border border-[#d6d6d6] bg-white text-[16px] font-semibold text-[#666666] hover:bg-[#f7f7f7]">
          Cancel
        </button>
      </div>
    </ModalFrame>
  );
}

function ModalFrame({ children, onClose, width }: { children: React.ReactNode; onClose: () => void; width: string }) {
  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className={`relative max-h-[calc(100vh-24px)] w-full ${width} overflow-y-auto rounded-[8px] bg-white px-[24px] py-[34px] font-[Poppins] shadow-2xl [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden`}>
        <button onClick={onClose} className="absolute right-[24px] top-[34px] h-6 w-6" aria-label="Close">
          <CloseGlyph />
        </button>
        {children}
      </div>
    </div>
  );
}

const StatCard = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="h-[108px] rounded-[8px] border border-[#d6d6d6] bg-white px-[24px] py-[25px]">
    <p className="text-[15px] font-normal leading-none text-[#666666]">{label}</p>
    <p className={`mt-[16px] text-[25px] font-normal leading-none ${color}`}>{value}</p>
  </div>
);

const TabButton = ({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`flex h-full items-center border-b-2 px-[20px] text-[15px] font-normal ${active ? "border-[#ffa313] text-[#ff9500]" : "border-transparent text-[#666666]"}`}
  >
    {children}
  </button>
);

const Select = ({
  value,
  onChange,
  options,
  allLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  allLabel: string;
}) => (
  <div className="relative h-[48px] w-[180px] shrink-0">
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-full w-full appearance-none rounded-[8px] border border-[#d6d6d6] bg-white px-[10px] pr-[36px] text-[16px] font-normal text-[#666666] outline-none"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option === "All" ? allLabel : option}
        </option>
      ))}
    </select>
    <ChevronGlyph />
  </div>
);

const StatusBadge = ({ status }: { status: DocStatus }) => (
  <span className={`inline-flex h-[25px] items-center rounded-full px-[12px] text-[13px] font-normal leading-none ${statusClass[status]}`}>
    {status}
  </span>
);

const Field = ({ label, children }: { label: string; children: React.ReactElement<{ className?: string }> }) => (
  <label className="mb-[17px] block">
    <span className="mb-[11px] block text-[15px] font-normal leading-none text-[#666666]">{label}</span>
    {React.cloneElement(children, {
      className: "h-[42px] w-full rounded-[8px] border border-[#d6d6d6] bg-white px-[15px] text-[16px] font-normal text-[#111111] outline-none placeholder:text-[#777777]",
    })}
  </label>
);

const InfoPair = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-[15px] font-semibold leading-none text-[#666666]">{label}</p>
    <p className="mt-[10px] text-[15px] font-semibold leading-none text-[#111111]">{value}</p>
  </div>
);

const DetailInfoCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="rounded-[8px] border border-[#d6d6d6] px-[16px] py-[18px]">
    <div className="flex items-center gap-[9px]">
      {icon}
      <p className="text-[15px] font-semibold leading-none text-[#666666]">{label}</p>
    </div>
    <p className="mt-[16px] text-[15px] font-semibold leading-none text-[#111111]">{value}</p>
  </div>
);

const ActionButton = ({ children, className, onClick }: { children: React.ReactNode; className: string; onClick: () => void }) => (
  <button onClick={onClick} className={`flex h-[42px] items-center justify-center gap-[6px] rounded-[8px] text-[16px] font-semibold text-white ${className}`}>
    {children}
  </button>
);

const IconButton = ({ children, label, onClick }: { children: React.ReactNode; label: string; onClick: () => void }) => (
  <button onClick={onClick} aria-label={label} className="flex h-5 w-5 items-center justify-center">
    {children}
  </button>
);

const Initials = ({ name }: { name: string }) => (
  <div className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full bg-[#d6b15c] text-[12px] font-normal text-white">
    {initials(name)}
  </div>
);

const SearchGlyph = () => (
  <span className="relative block h-[18px] w-[18px] shrink-0 rounded-full border-2 border-[#666666] after:absolute after:bottom-[-5px] after:right-[-3px] after:h-[7px] after:w-[2px] after:-rotate-45 after:bg-[#666666]" />
);

const EyeGlyph = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M1.8 8s2.2-3.3 6.2-3.3S14.2 8 14.2 8 12 11.3 8 11.3 1.8 8 1.8 8Z" stroke="#1976D2" strokeWidth="1.4" />
    <circle cx="8" cy="8" r="1.7" stroke="#1976D2" strokeWidth="1.4" />
  </svg>
);

const CircleCheckGlyph = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="6.1" stroke="#00AB42" strokeWidth="1.4" />
    <path d="M5 8.2 7 10.1 11.2 5.9" stroke="#00AB42" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CircleXGlyph = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="6.1" stroke="#EF0010" strokeWidth="1.4" />
    <path d="m6 6 4 4m0-4-4 4" stroke="#EF0010" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const ClockGlyph = ({ strong = false }: { strong?: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="6.3" stroke={strong ? "#ff4b00" : "#d6b15c"} strokeWidth="1.4" />
    <path d="M8 4.7v3.6l2.4 1.4" stroke={strong ? "#ff4b00" : "#d6b15c"} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const UploadGlyph = ({ color = "#1976D2", rotate = false }: { color?: string; rotate?: boolean }) => (
  <span className={rotate ? "rotate-180" : ""}>
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 10V2" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 10v2.7c0 .7-.6 1.3-1.3 1.3H3.3C2.6 14 2 13.4 2 12.7V10" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.7 6.7 8 10l3.3-3.3" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </span>
);

const CloseGlyph = () => (
  <>
    <span className="absolute left-1/2 top-1/2 h-[2px] w-[18px] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[#666666]" />
    <span className="absolute left-1/2 top-1/2 h-[2px] w-[18px] -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-[#666666]" />
  </>
);

const ChevronGlyph = () => (
  <span className="pointer-events-none absolute right-[15px] top-1/2 h-[11px] w-[11px] -translate-y-[65%] rotate-45 border-b-2 border-r-2 border-[#666666]" />
);

const breakText = (value: string) => value;

const formatLongDate = (value: string) => {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
};

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
