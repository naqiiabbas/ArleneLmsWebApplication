"use client";

import React, { useEffect, useMemo, useState } from "react";
import { listResources, setResourceStatus } from "@/lib/data/resources";
import type { UIResource, ResourceStatus } from "@/lib/data/resources.types";

type Resource = UIResource;

const statusStyle: Record<ResourceStatus, string> = {
  pending: "bg-[#ffe6c2] text-[#c94f00]",
  approved: "bg-[#d9f8e6] text-[#008a3b]",
  rejected: "bg-[#ffe0e0] text-[#d10000]",
};

const labelFor = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export default function Resourceadmin() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ResourceStatus>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selected, setSelected] = useState<Resource | null>(null);
  const [modal, setModal] = useState<"detail" | "approve" | "reject" | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await listResources();
      setResources(data);
      setSelected((prev) => (prev && data.find((r) => r.id === prev.id)) || data[0] || null);
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (!modal) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [modal]);

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();
    return resources.filter((resource) => {
      const matchesSearch =
        resource.title.toLowerCase().includes(query) ||
        resource.description.toLowerCase().includes(query) ||
        resource.uploader.toLowerCase().includes(query);
      const matchesStatus = statusFilter === "all" || resource.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || resource.category === categoryFilter;
      const matchesType = typeFilter === "all" || resource.type === typeFilter;
      return matchesSearch && matchesStatus && matchesCategory && matchesType;
    });
  }, [resources, search, statusFilter, categoryFilter, typeFilter]);

  const stats = useMemo(
    () => ({
      total: resources.length,
      pending: resources.filter((resource) => resource.status === "pending").length,
      approved: resources.filter((resource) => resource.status === "approved").length,
      rejected: resources.filter((resource) => resource.status === "rejected").length,
      downloads: resources.reduce((sum, resource) => sum + resource.downloads, 0),
    }),
    [resources]
  );

  const setStatus = async (status: ResourceStatus) => {
    if (!selected) return;
    const target = selected;
    setModal(null);
    setRejectReason("");
    const res = await setResourceStatus(target.id, status);
    if (res.error) {
      setNotice(res.error);
      return;
    }
    setNotice(`Resource ${status}.`);
    await refresh();
  };

  return (
    <div className="min-h-full bg-[#f4f4f4] px-6 py-6 font-[Poppins]">
      <div className="mb-[24px] flex items-center gap-[12px]">
        <div className="flex h-[48px] w-[48px] items-center justify-center rounded-[8px] bg-[#fff7e8]">
          <img src="/images/admin-resource-book.svg" alt="" className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-[21px] font-normal leading-none text-[#111111]">Resources Management</h1>
          <p className="mt-[8px] text-[14px] font-normal leading-none text-[#666666]">
            Review and approve educational resources uploaded by mentors
          </p>
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

      <div className="mb-[24px] grid grid-cols-1 gap-[16px] sm:grid-cols-2 xl:grid-cols-5">
        <Stat label="Total Resources" value={stats.total} color="text-[#d6b15c]" />
        <Stat label="Pending Review" value={stats.pending} color="text-[#ff4b00]" />
        <Stat label="Approved" value={stats.approved} color="text-[#00a63e]" />
        <Stat label="Rejected" value={stats.rejected} color="text-[#ff0000]" />
        <Stat label="Total Downloads" value={stats.downloads} color="text-[#d6b15c]" />
      </div>

      <div className="grid grid-cols-1 gap-[10px] xl:grid-cols-[1fr_358px]">
        <section className="overflow-hidden rounded-[8px] bg-white">
          <div className="border-b border-[#d6d6d6] p-[11px]">
            <div className="flex h-[48px] items-center rounded-[8px] border border-[#d6d6d6] px-[16px]">
              <SearchGlyph />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search users..."
                className="ml-[13px] h-full min-w-0 flex-1 bg-transparent text-[16px] font-normal text-[#111111] outline-none placeholder:text-[#777777]"
              />
            </div>
            <div className="mt-[10px] grid grid-cols-1 gap-[10px] md:grid-cols-3">
              <Select value={statusFilter} onChange={(value) => setStatusFilter(value as "all" | ResourceStatus)} options={["all", "pending", "approved", "rejected"]} label="All status" />
              <Select value={categoryFilter} onChange={setCategoryFilter} options={["all", "tutorial", "video", "reference", "assignment", "design", "link"]} label="All Categories" />
              <Select value={typeFilter} onChange={setTypeFilter} options={["all", "pdf", "mp4", "html"]} label="All Type" />
            </div>
          </div>

          <div>
            {loading && (
              <p className="px-[18px] py-[24px] text-[14px] text-[#666666]">Loading resources...</p>
            )}
            {!loading && filtered.length === 0 && (
              <p className="px-[18px] py-[24px] text-[14px] text-[#666666]">No resources found.</p>
            )}
            {filtered.map((resource) => (
              <button
                key={resource.id}
                onClick={() => setSelected(resource)}
                className={`block w-full border-b border-[#d6d6d6] px-[18px] py-[19px] text-left transition ${
                  selected?.id === resource.id ? "bg-[#fff8eb]" : "bg-white hover:bg-[#fffdf8]"
                }`}
              >
                <div className="flex items-start justify-between gap-[18px]">
                  <div className="flex min-w-0 flex-1 gap-[14px]">
                    <ResourceIcon type={resource.iconType} />
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-[15px] font-normal leading-none text-[#111111]">{resource.title}</h2>
                      <p className="mt-[14px] truncate text-[12px] font-normal leading-none text-[#666666]">{resource.description}</p>
                      <div className="mt-[12px] flex flex-wrap items-center gap-[18px] text-[12px] font-normal leading-none text-[#666666]">
                        <span>{resource.uploader}</span>
                        <span>•</span>
                        <span>{resource.course}</span>
                        <span>•</span>
                        <span>{resource.size}</span>
                        {resource.status === "approved" && (
                          <>
                            <span>•</span>
                            <span>{resource.downloads} downloads</span>
                          </>
                        )}
                      </div>
                      <div className="mt-[13px] flex flex-wrap gap-[8px]">
                        {resource.tags.slice(0, 3).map((tag) => (
                          <Tag key={tag}>{tag}</Tag>
                        ))}
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={resource.status} />
                </div>
              </button>
            ))}
          </div>
        </section>

        <aside className="rounded-[8px] bg-white px-[25px] py-[27px]">
          {selected ? (
            <>
              <div className="flex items-start gap-[12px]">
                <ResourceIcon type={selected.iconType} />
                <div className="min-w-0 flex-1">
                  <h2 className="text-[17px] font-normal leading-[21px] text-[#111111]">{selected.title}</h2>
                  <div className="mt-[10px] flex flex-wrap items-center gap-x-[8px] gap-y-[7px]">
                    <StatusBadge status={selected.status} />
                    <Tag color="blue">{selected.category}</Tag>
                    <Tag color="purple">{selected.type}</Tag>
                  </div>
                </div>
              </div>

              <SideInfo label="Description" value={selected.description} />
              <SideInfo label="Uploaded By" value={selected.uploader} subValue={selected.role} />
              <SideInfo label="Course" value={selected.course} />
              <SideInfo label="File Size" value={selected.size} />
              <SideInfo label="Uploaded" value={selected.date} />
              <SideInfo label="Downloads" value={String(selected.downloads)} />
              <div className="border-t border-[#d6d6d6] py-[17px]">
                <p className="mb-[12px] text-[14px] font-normal leading-none text-[#666666]">Tags</p>
                <div className="flex flex-wrap gap-[8px]">
                  {selected.tags.map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </div>
              </div>

              <button onClick={() => setModal("approve")} className="mb-[8px] flex h-[40px] w-full items-center justify-center gap-[7px] rounded-[8px] bg-[#00ab42] text-[16px] font-normal text-white hover:bg-[#009438]">
                <img src="/images/admin-resource-approve.svg" alt="" className="h-4 w-4" />
                Approve Resource
              </button>
              <button onClick={() => setModal("reject")} className="mb-[25px] flex h-[40px] w-full items-center justify-center gap-[7px] rounded-[8px] bg-[#ef0010] text-[16px] font-normal text-white hover:bg-[#d8000e]">
                <img src="/images/admin-resource-reject.svg" alt="" className="h-4 w-4" />
                Reject Resource
              </button>
              <button onClick={() => setModal("detail")} className="flex h-[40px] w-full items-center justify-center gap-[7px] rounded-[8px] border border-[#d6d6d6] bg-white text-[16px] font-normal text-[#ff9500] hover:bg-[#fff8eb]">
                <EyeGlyph color="#ff9500" />
                View Full Details
              </button>
            </>
          ) : (
            <div className="flex h-full min-h-[300px] items-center justify-center text-[#666666]">Select a resource to view details.</div>
          )}
        </aside>
      </div>

      <Footer />

      {modal === "detail" && selected && (
        <ResourceDetailModal resource={selected} onClose={() => setModal(null)} onApprove={() => setStatus("approved")} onReject={() => setModal("reject")} />
      )}

      {modal === "approve" && selected && (
        <ConfirmModal
          title="Approve Resource"
          message={`Are you sure you want to approve "${selected.title}"? This will make it available to all students.`}
          confirmText="Approve"
          confirmClass="bg-[#00ab42] hover:bg-[#009438]"
          onCancel={() => setModal(null)}
          onConfirm={() => setStatus("approved")}
        />
      )}

      {modal === "reject" && selected && (
        <RejectModal
          resource={selected}
          reason={rejectReason}
          setReason={setRejectReason}
          onCancel={() => setModal(null)}
          onConfirm={() => setStatus("rejected")}
        />
      )}
    </div>
  );
}

function ResourceDetailModal({
  resource,
  onClose,
  onApprove,
  onReject,
}: {
  resource: Resource;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <ModalFrame width="max-w-[768px]" onClose={onClose} closeRound>
      <h2 className="text-[20px] font-semibold leading-none text-[#242424]">Resource Details</h2>
      <div className="-mx-[24px] mt-[35px] border-t border-[#d6d6d6]" />
      <div className="mt-[28px] flex items-center gap-[14px]">
        <ResourceIcon type={resource.iconType} />
        <h3 className="text-[24px] font-semibold leading-none text-[#242424]">{resource.title}</h3>
      </div>
      <div className="mt-[16px] flex flex-wrap items-center gap-x-[8px] gap-y-[7px]">
        <StatusBadge status={resource.status} />
        <Tag>Guide</Tag>
        <Tag color="blue">College Preparation</Tag>
        {resource.featured && <Tag icon="star">Featured</Tag>}
      </div>

      <InfoBlock label="Description" value={resource.description} className="mt-[25px]" />
      <div className="mt-[24px] grid grid-cols-1 gap-[16px] sm:grid-cols-2">
        <InfoBlock label="Category" value="College Preparation" />
        <InfoBlock label="Sub-Category" value="Applications" />
        <InfoBlock label="Difficulty" value={resource.difficulty || "Beginner"} />
        <InfoBlock label="Estimated Time" value={resource.estimatedTime || "2 hours"} />
      </div>
      <div className="mt-[24px] rounded-[8px] bg-[#f4f4f4] px-[16px] py-[17px]">
        <p className="text-[14px] font-normal leading-none text-[#666666]">Rating</p>
        <div className="mt-[14px] flex items-center gap-[9px] text-[20px] font-normal leading-none text-[#111111]">
          <StarGlyph />
          {resource.rating || "4.8 / 5.0"}
        </div>
      </div>
      <div className="mt-[25px] border-t border-[#d6d6d6] pt-[16px]">
        <div className="grid grid-cols-2 gap-[12px]">
          <button onClick={onApprove} className="flex h-[48px] items-center justify-center gap-[7px] rounded-[8px] bg-[#00ab42] text-[16px] font-normal text-white hover:bg-[#009438]">
            <img src="/images/admin-resource-approve.svg" alt="" className="h-4 w-4" />
            Approve Resource
          </button>
          <button onClick={onReject} className="flex h-[48px] items-center justify-center gap-[7px] rounded-[8px] bg-[#ef0010] text-[16px] font-normal text-white hover:bg-[#d8000e]">
            <img src="/images/admin-resource-reject.svg" alt="" className="h-4 w-4" />
            Reject Resource
          </button>
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
  onCancel,
  onConfirm,
}: {
  title: string;
  message: string;
  confirmText: string;
  confirmClass: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <ModalFrame width="max-w-[447px]" onClose={onCancel} hideClose>
      <h2 className="text-[18px] font-semibold leading-none text-[#242424]">{title}</h2>
      <p className="mt-[25px] text-[14px] font-semibold leading-[20px] text-[#666666]">{message}</p>
      <div className="mt-[28px] flex justify-end gap-[13px]">
        <button onClick={onCancel} className="h-[42px] w-[82px] rounded-[8px] border border-[#d6d6d6] bg-white text-[16px] font-semibold text-[#666666] hover:bg-[#f7f7f7]">
          Cancel
        </button>
        <button onClick={onConfirm} className={`h-[42px] w-[91px] rounded-[8px] text-[16px] font-semibold text-white ${confirmClass}`}>
          {confirmText}
        </button>
      </div>
    </ModalFrame>
  );
}

function RejectModal({
  resource,
  reason,
  setReason,
  onCancel,
  onConfirm,
}: {
  resource: Resource;
  reason: string;
  setReason: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <ModalFrame width="max-w-[447px]" onClose={onCancel} hideClose>
      <h2 className="text-[18px] font-semibold leading-none text-[#242424]">Reject Resource</h2>
      <p className="mt-[25px] text-[14px] font-semibold leading-[20px] text-[#666666]">Are you sure you want to reject "{resource.title}"?</p>
      <label className="mt-[20px] block">
        <span className="mb-[11px] block text-[14px] font-semibold leading-none text-[#666666]">Reason for Rejection (Optional)</span>
        <textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          className="h-[90px] w-full resize-none rounded-[8px] border border-[#d6d6d6] bg-white px-[12px] py-[10px] text-[14px] outline-none"
        />
      </label>
      <div className="mt-[31px] flex justify-end gap-[13px]">
        <button onClick={onCancel} className="h-[42px] w-[82px] rounded-[8px] border border-[#d6d6d6] bg-white text-[16px] font-semibold text-[#666666] hover:bg-[#f7f7f7]">
          Cancel
        </button>
        <button onClick={onConfirm} className="h-[42px] w-[77px] rounded-[8px] bg-[#ef0010] text-[16px] font-semibold text-white hover:bg-[#d8000e]">
          Reject
        </button>
      </div>
    </ModalFrame>
  );
}

function ModalFrame({
  children,
  onClose,
  width,
  hideClose = false,
  closeRound = false,
}: {
  children: React.ReactNode;
  onClose: () => void;
  width: string;
  hideClose?: boolean;
  closeRound?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className={`relative max-h-[calc(100vh-24px)] w-full ${width} overflow-y-auto rounded-[8px] bg-white px-[24px] py-[34px] font-[Poppins] shadow-2xl [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden`}>
        {!hideClose && (
          <button
            onClick={onClose}
            className={`absolute right-[24px] top-[32px] flex h-6 w-6 items-center justify-center ${closeRound ? "rounded-full border-2 border-[#777777]" : ""}`}
            aria-label="Close"
          >
            <CloseGlyph />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}

const Stat = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="h-[86px] rounded-[8px] border border-[#d6d6d6] bg-white px-[16px] py-[19px]">
    <p className="text-[14px] font-normal leading-none text-[#666666]">{label}</p>
    <p className={`mt-[13px] text-[24px] font-normal leading-none ${color}`}>{value}</p>
  </div>
);

const Select = ({ value, onChange, options, label }: { value: string; onChange: (value: string) => void; options: string[]; label: string }) => (
  <div className="relative h-[42px]">
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-full w-full appearance-none rounded-[8px] border border-[#d6d6d6] bg-white px-[10px] pr-[36px] text-[16px] font-normal text-[#666666] outline-none"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option === "all" ? label : labelFor(option)}
        </option>
      ))}
    </select>
    <ChevronGlyph />
  </div>
);

const StatusBadge = ({ status }: { status: ResourceStatus }) => (
  <span className={`inline-flex min-h-[26px] items-center rounded-full px-[11px] py-[4px] text-[12px] font-normal leading-none ${statusStyle[status]}`}>
    {status}
  </span>
);

const Tag = ({ children, color = "orange", icon }: { children: React.ReactNode; color?: "orange" | "blue" | "purple"; icon?: "star" }) => {
  const styles = {
    orange: "bg-[#fff0d7] text-[#ff9500]",
    blue: "bg-[#d9eaff] text-[#0056c8]",
    purple: "bg-[#edd7ff] text-[#7a22bd]",
  };
  return (
    <span className={`inline-flex min-h-[24px] items-center gap-[5px] rounded-[5px] px-[9px] py-[4px] text-[12px] font-normal leading-none ${styles[color]}`}>
      {icon === "star" && <StarGlyph small />}
      {children}
    </span>
  );
};

const ResourceIcon = ({ type = "file" }: { type?: Resource["iconType"] }) => (
  <img
    src={type === "image" ? "/images/admin-resource-image.svg" : type === "link" ? "/images/admin-resource-link.svg" : "/images/admin-resource-file.svg"}
    alt=""
    className="mt-[1px] h-5 w-5 shrink-0"
  />
);

const SideInfo = ({ label, value, subValue }: { label: string; value: string; subValue?: string }) => (
  <div className="border-t border-[#d6d6d6] py-[17px]">
    <p className="mb-[10px] text-[14px] font-normal leading-none text-[#666666]">{label}</p>
    <p className="text-[15px] font-normal leading-[20px] text-[#111111]">{value}</p>
    {subValue && <p className="text-[13px] font-normal leading-[18px] text-[#666666]">{subValue}</p>}
  </div>
);

const InfoBlock = ({ label, value, className = "" }: { label: string; value: string; className?: string }) => (
  <div className={`rounded-[8px] bg-[#f4f4f4] px-[16px] py-[17px] ${className}`}>
    <p className="text-[14px] font-normal leading-none text-[#666666]">{label}</p>
    <p className="mt-[15px] text-[14px] font-normal leading-[20px] text-[#111111]">{value}</p>
  </div>
);

const Footer = () => (
  <div className="mt-[27px] flex h-[70px] items-center justify-center rounded-[8px] bg-white text-[15px] font-normal text-[#666666]">
    Support <span className="mx-[14px]">•</span> Privacy <span className="mx-[14px]">•</span> Terms
  </div>
);

const SearchGlyph = () => (
  <span className="relative block h-[18px] w-[18px] shrink-0 rounded-full border-2 border-[#666666] after:absolute after:bottom-[-5px] after:right-[-3px] after:h-[7px] after:w-[2px] after:-rotate-45 after:bg-[#666666]" />
);

const ChevronGlyph = () => (
  <span className="pointer-events-none absolute right-[15px] top-1/2 h-[11px] w-[11px] -translate-y-[65%] rotate-45 border-b-2 border-r-2 border-[#666666]" />
);

const EyeGlyph = ({ color = "#ff9500" }: { color?: string }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M1.37 8.23C1.32 8.08 1.32 7.91 1.37 7.76C1.91 6.45 2.83 5.33 4.01 4.54C5.19 3.75 6.58 3.33 7.99 3.33C9.41 3.33 10.8 3.75 11.98 4.54C13.16 5.33 14.07 6.45 14.62 7.76C14.67 7.91 14.67 8.08 14.62 8.23C14.07 9.54 13.16 10.66 11.98 11.45C10.8 12.24 9.41 12.66 7.99 12.66C6.58 12.66 5.19 12.24 4.01 11.45C2.83 10.66 1.91 9.54 1.37 8.23Z" stroke={color} strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7.99 9.99C9.1 9.99 9.99 9.1 9.99 7.99C9.99 6.89 9.1 6 7.99 6C6.89 6 6 6.89 6 7.99C6 9.1 6.89 9.99 7.99 9.99Z" stroke={color} strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const StarGlyph = ({ small = false }: { small?: boolean }) => (
  <svg width={small ? "12" : "20"} height={small ? "12" : "20"} viewBox="0 0 20 20" fill="none">
    <path d="M10 1.8 12.5 7l5.7.8-4.1 4 1 5.7-5.1-2.7-5.1 2.7 1-5.7-4.1-4 5.7-.8L10 1.8Z" fill="#F9A618" />
  </svg>
);

const CloseGlyph = () => (
  <span className="relative block h-5 w-5">
    <span className="absolute left-1/2 top-1/2 h-[2px] w-[16px] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[#777777]" />
    <span className="absolute left-1/2 top-1/2 h-[2px] w-[16px] -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-[#777777]" />
  </span>
);
