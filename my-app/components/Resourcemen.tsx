"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  ExternalLink,
  Filter,
  Link as LinkIcon,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  getMentorResources,
  createMentorResource,
  uploadMentorResource,
  updateMentorResource,
  deleteMentorResource,
} from "@/lib/data/mentor";
import type { MentorResource, MentorResourceStatus } from "@/lib/data/mentor.types";

type ResourceStatus = MentorResourceStatus;
type Resource = MentorResource;

const categories = ["College Preparation", "Career Development", "Health & Wellness"];
const resourceTypes = ["Applications", "Test Prep", "Workshop", "Interactive"];

const statusStyles: Record<ResourceStatus, string> = {
  Approved: "bg-[#d8f8e2] text-[#00a85a]",
  Pending: "bg-[#fff2c6] text-[#e09a00]",
  Rejected: "bg-[#ffe0e3] text-[#ff3647]",
};

const StatusBadge = ({ status }: { status: ResourceStatus }) => (
  <span className={`inline-flex h-[24px] items-center rounded-full px-[14px] text-[12px] font-medium ${statusStyles[status]}`}>
    {status}
  </span>
);

const SelectShell = ({
  value,
  defaultValue,
  onChange,
  name,
  required,
  children,
  className = "",
}: {
  value?: string;
  defaultValue?: string;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  name?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`relative ${className}`}>
    <select
      name={name}
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      required={required}
      className="h-full w-full appearance-none rounded-[8px] border border-[#d8dde3] bg-white px-[16px] pr-[42px] text-[14px] font-normal text-[#666666] outline-none"
    >
      {children}
    </select>
    <ChevronDown className="pointer-events-none absolute right-[16px] top-1/2 -translate-y-1/2 text-[#666666]" size={20} strokeWidth={2} />
  </div>
);

const Modal = ({ title, isOpen, onClose, children }: { title: string; isOpen: boolean; onClose: () => void; children: React.ReactNode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 p-4 font-poppins text-left">
      <div className="flex max-h-[92vh] w-full max-w-[768px] flex-col overflow-hidden rounded-[8px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <div className="flex h-[80px] shrink-0 items-center justify-between border-b border-[#d8dde3] px-[24px]">
          <h2 className="text-[24px] font-bold leading-none text-[#2b3b4d]">{title}</h2>
          <button type="button" onClick={onClose} className="flex h-[34px] w-[34px] items-center justify-center rounded-full text-[#2b3b4d] hover:bg-[#f3f4f6]">
            <X size={22} strokeWidth={2} />
          </button>
        </div>
        <div className="overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

const ResourceCard = ({
  resource,
  onEdit,
  onDelete,
}: {
  resource: Resource;
  onEdit: (resource: Resource) => void;
  onDelete: (id: string) => void;
}) => (
  <div className="rounded-[8px] border border-[#d8dde3] bg-white px-[24px] py-[22px]">
    <div className="flex items-start justify-between gap-5">
      <div className="min-w-0 flex-1">
        <div className="mb-[12px] flex flex-wrap items-center gap-[10px]">
          <h3 className="text-[18px] font-semibold leading-none text-[#2b3b4d]">{resource.title}</h3>
          <StatusBadge status={resource.status} />
          {resource.isFeatured && (
            <span className="inline-flex h-[24px] items-center gap-[5px] rounded-full bg-[#ffa313] px-[13px] text-[12px] font-semibold text-white">
              <Star size={13} fill="white" strokeWidth={2.2} />
              Featured
            </span>
          )}
        </div>
        <p className="mb-[16px] text-[14px] font-normal leading-none text-[#5f6b78]">{resource.description}</p>
        <div className="flex flex-wrap items-center gap-[14px]">
          <span className="inline-flex h-[28px] min-w-[146px] items-center justify-center rounded-[4px] bg-[#ffa313] px-[12px] text-[13px] font-semibold text-white">
            {resource.category}
          </span>
          <span className="inline-flex h-[28px] min-w-[82px] items-center justify-center rounded-[4px] bg-[#f2f3f5] px-[12px] text-[13px] font-normal text-[#5f6b78]">
            {resource.type}
          </span>
          {resource.rating > 0 && (
            <span className="inline-flex items-center gap-[5px] text-[13px] font-normal text-[#5f6b78]">
              <Star size={14} fill="#ffa313" stroke="#ffa313" />
              {resource.rating.toFixed(1)}
            </span>
          )}
          <span className="text-[13px] font-normal text-[#5f6b78]">Submitted: {resource.submittedDate}</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-[10px]">
        {resource.link && (
          <a
            href={resource.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-[34px] w-[34px] items-center justify-center rounded-[8px] border border-[#d8dde3] text-[#687586] transition hover:border-[#ffa313] hover:text-[#ffa313]"
            title="Open Resource"
          >
            <ExternalLink size={18} strokeWidth={2} />
          </a>
        )}
        <button
          type="button"
          onClick={() => onEdit(resource)}
          className="flex h-[34px] w-[34px] items-center justify-center rounded-[8px] border border-[#d8dde3] text-[#687586] transition hover:border-[#ffa313] hover:text-[#ffa313]"
          aria-label="Edit resource"
        >
          <Pencil size={18} strokeWidth={2} />
        </button>
        <button
          type="button"
          onClick={() => onDelete(resource.id)}
          className="flex h-[34px] w-[34px] items-center justify-center rounded-[8px] border border-[#d8dde3] text-[#ff3647] transition hover:bg-[#fff1f2]"
          aria-label="Delete resource"
        >
          <Trash2 size={18} strokeWidth={2} />
        </button>
      </div>
    </div>
  </div>
);

export default function LearningResourcesSection() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeResource, setActiveResource] = useState<Resource | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editFileName, setEditFileName] = useState<string | null>(null);

  const loadResources = () => {
    getMentorResources()
      .then(setResources)
      .catch((e) => setNotice((e as Error).message));
  };

  useEffect(loadResources, []);

  const stats = useMemo(
    () => ({
      total: resources.length,
      approved: resources.filter((resource) => resource.status === "Approved").length,
      pending: resources.filter((resource) => resource.status === "Pending").length,
      featured: resources.filter((resource) => resource.isFeatured).length,
    }),
    [resources],
  );

  const filteredResources = useMemo(() => {
    return resources.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = filterCategory === "All" || item.category === filterCategory;
      const matchesStatus = filterStatus === "All" || item.status === filterStatus;
      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [resources, searchQuery, filterCategory, filterStatus]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, mode: "add" | "edit") => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (mode === "add") { setSelectedFileName(file.name); setSelectedFile(file); }
    else setEditFileName(file.name);
  };

  const handleAddSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    const formData = new FormData(event.currentTarget);
    const title = (formData.get("title") as string) ?? "";
    const description = (formData.get("description") as string) ?? "";
    const category = (formData.get("category") as string) ?? "";
    const type = (formData.get("type") as string) ?? "";
    setSaving(true);
    // If a file was chosen, upload it; otherwise create a link-based resource.
    let res: { error?: string };
    if (selectedFile) {
      const fd = new FormData();
      fd.append("file", selectedFile);
      fd.append("title", title);
      fd.append("description", description);
      fd.append("category", category);
      fd.append("type", type);
      res = await uploadMentorResource(fd);
    } else {
      res = await createMentorResource({
        title, description, category, type,
        link: (formData.get("link") as string) ?? "",
        featured: formData.get("featured") === "on",
      });
    }
    setSaving(false);
    if (res.error) {
      setNotice(res.error);
      return;
    }
    setIsAddModalOpen(false);
    setSelectedFileName(null);
    setSelectedFile(null);
    loadResources();
  };

  const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeResource || saving) return;
    const formData = new FormData(event.currentTarget);
    setSaving(true);
    const res = await updateMentorResource(activeResource.id, {
      title: (formData.get("title") as string) ?? "",
      description: (formData.get("description") as string) ?? "",
      category: (formData.get("category") as string) ?? "",
      type: (formData.get("type") as string) ?? "",
      link: (formData.get("link") as string) ?? "",
      featured: activeResource.isFeatured,
    });
    setSaving(false);
    if (res.error) {
      setNotice(res.error);
      return;
    }
    setIsEditModalOpen(false);
    loadResources();
  };

  const openEditModal = (resource: Resource) => {
    setActiveResource(resource);
    setEditFileName(resource.fileName || null);
    setIsEditModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    const id = deleteId;
    setResources(resources.filter((resource) => resource.id !== id));
    setIsDeleteModalOpen(false);
    setDeleteId(null);
    const res = await deleteMentorResource(id);
    if (res.error) {
      setNotice(res.error);
      loadResources();
    }
  };

  return (
    <section className="min-h-screen w-full bg-[#f3f3f3] px-[24px] py-[28px] font-poppins text-left">
      <div className="w-full">
        <div className="mb-[28px] flex items-start justify-between gap-4">
          <div>
            <h1 className="mb-[7px] text-[32px] font-bold leading-none text-[#111111]">Learning Resources</h1>
            <p className="text-[15px] font-normal leading-none text-[#666666]">Upload and manage educational resources for your students</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedFileName(null);
              setIsAddModalOpen(true);
            }}
            className="mt-[5px] inline-flex h-[42px] items-center gap-[9px] rounded-[9px] bg-[#ffa313] px-[18px] text-[14px] font-semibold text-white transition hover:bg-[#f09500]"
          >
            <Plus size={18} strokeWidth={2.3} />
            Add Resource
          </button>
        </div>

        {notice && (
          <div className="mb-[16px] flex items-start justify-between gap-4 rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-semibold text-red-700">
            <span className="break-all">{notice}</span>
            <button type="button" onClick={() => setNotice(null)} className="shrink-0 text-[13px] underline">Dismiss</button>
          </div>
        )}

        <div className="mb-[25px] grid grid-cols-1 gap-[16px] md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Resources" value={stats.total} icon={<LinkIcon size={25} />} iconClass="bg-[#dceaff] text-[#006dff]" />
          <StatCard label="Approved" value={stats.approved} icon={<CheckCircle2 size={27} />} iconClass="bg-[#d8f8e2] text-[#00a85a]" />
          <StatCard label="Pending Review" value={stats.pending} icon={<Clock size={27} />} iconClass="bg-[#fff2c6] text-[#d79800]" />
          <StatCard label="Featured" value={stats.featured} icon={<Star size={28} />} iconClass="bg-[#ffa313] text-white" />
        </div>

        <div className="mb-[24px] rounded-[8px] border border-[#d8dde3] bg-white p-[15px]">
          <div className="flex flex-col gap-[17px] lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-[15px] top-1/2 -translate-y-1/2 text-[#687586]" size={21} strokeWidth={2} />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search resources..."
                className="h-[48px] w-full rounded-[8px] border border-[#d8dde3] bg-white pl-[44px] pr-[16px] text-[16px] font-normal text-[#2b3b4d] outline-none placeholder:text-[#9aa4b2]"
              />
            </div>
            <Filter className="hidden shrink-0 text-[#687586] lg:block" size={21} strokeWidth={2} />
            <SelectShell value={filterCategory} onChange={(event) => setFilterCategory(event.target.value)} className="h-[48px] w-full lg:w-[181px]">
              <option value="All">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </SelectShell>
            <SelectShell value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)} className="h-[48px] w-full lg:w-[181px]">
              <option value="All">All Status</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </SelectShell>
          </div>
        </div>

        <div className="space-y-[17px]">
          {filteredResources.length > 0 ? (
            filteredResources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onEdit={openEditModal}
                onDelete={(id) => {
                  setDeleteId(id);
                  setIsDeleteModalOpen(true);
                }}
              />
            ))
          ) : (
            <div className="rounded-[8px] border border-dashed border-[#d8dde3] bg-white py-16 text-center text-[15px] text-[#666666]">
              No resources found matching your criteria.
            </div>
          )}
        </div>

        <Modal title="Add New Resource" isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
          <ResourceForm
            mode="add"
            onSubmit={handleAddSubmit}
            onCancel={() => setIsAddModalOpen(false)}
            fileInputRef={fileInputRef}
            selectedFileName={selectedFileName}
            onFileChange={(event) => handleFileChange(event, "add")}
          />
        </Modal>

        <Modal title="Edit Resource" isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
          {activeResource && (
            <ResourceForm
              mode="edit"
              resource={activeResource}
              onSubmit={handleEditSubmit}
              onCancel={() => setIsEditModalOpen(false)}
              fileInputRef={editFileInputRef}
              selectedFileName={editFileName}
              onFileChange={(event) => handleFileChange(event, "edit")}
            />
          )}
        </Modal>

        <Modal title="Delete Resource" isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
          <div className="px-[24px] py-[30px]">
            <p className="mb-[28px] text-[16px] text-[#5f6b78]">Are you sure you want to delete this resource? This action cannot be undone.</p>
            <div className="flex justify-end gap-[12px]">
              <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="h-[40px] rounded-[8px] border border-[#d8dde3] px-[24px] text-[14px] font-semibold text-[#2b3b4d]">
                Cancel
              </button>
              <button type="button" onClick={handleDeleteConfirm} className="h-[40px] rounded-[8px] bg-[#ff3647] px-[24px] text-[14px] font-semibold text-white">
                Delete
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </section>
  );
}

const StatCard = ({ label, value, icon, iconClass }: { label: string; value: number; icon: React.ReactNode; iconClass: string }) => (
  <div className="flex h-[84px] items-center justify-between rounded-[8px] border border-[#d8dde3] bg-white px-[16px]">
    <div>
      <p className="mb-[9px] text-[13px] font-normal leading-none text-[#5f6b78]">{label}</p>
      <p className="text-[20px] font-semibold leading-none text-[#2b3b4d]">{value}</p>
    </div>
    <div className={`flex h-[48px] w-[48px] items-center justify-center rounded-full ${iconClass}`}>{icon}</div>
  </div>
);

const ResourceForm = ({
  mode,
  resource,
  onSubmit,
  onCancel,
  fileInputRef,
  selectedFileName,
  onFileChange,
}: {
  mode: "add" | "edit";
  resource?: Resource;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  selectedFileName: string | null;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  const isEdit = mode === "edit";

  return (
    <form onSubmit={onSubmit}>
      <div className="space-y-[18px] px-[24px] py-[26px]">
        <FormInput
          label="Resource Title"
          name="title"
          placeholder="e.g., College Application Guide 2025"
          defaultValue={resource?.title}
          required
        />
        <FormTextArea
          label="Description"
          name="description"
          placeholder="Provide a detailed description of the resource..."
          defaultValue={resource?.description}
          required
        />
        <div className="grid grid-cols-1 gap-[10px] md:grid-cols-2">
          <FormSelect label="Category" name="category" defaultValue={resource?.category} placeholder="Select a Category" options={categories} required />
          <FormSelect label="Resource Type" name="type" defaultValue={resource?.type} placeholder="Select Type" options={resourceTypes} required />
        </div>
        <div>
          <label className="mb-[9px] block text-[15px] font-normal text-[#687586]">
            Resource Link or File <span className="text-[#ff3647]">*</span>
          </label>
          <div className="relative">
            <LinkIcon className="absolute left-[13px] top-1/2 -translate-y-1/2 text-[#687586]" size={19} strokeWidth={2} />
            <input
              type="url"
              name="link"
              defaultValue={resource?.link}
              placeholder="https://example.com/resource"
              className="h-[42px] w-full rounded-[8px] border border-[#d8dde3] bg-white pl-[39px] pr-[14px] text-[16px] font-normal text-[#111111] outline-none placeholder:text-[#9aa4b2]"
            />
          </div>
        </div>

        <div className="flex items-center gap-[16px]">
          <div className="h-px flex-1 bg-[#d8dde3]" />
          <span className="text-[13px] font-normal text-[#687586]">OR</span>
          <div className="h-px flex-1 bg-[#d8dde3]" />
        </div>

        <input type="file" ref={fileInputRef} className="hidden" onChange={onFileChange} />
        <div className="flex h-[144px] flex-col items-center justify-center rounded-[8px] border border-[#d8dde3] bg-white text-center">
          <Upload className="mb-[8px] text-[#687586]" size={34} strokeWidth={2} />
          <p className="mb-[12px] text-[14px] font-normal text-[#687586]">
            {selectedFileName || "Upload a file (PDF, DOC, DOCX)"}
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex h-[42px] items-center gap-[9px] rounded-[8px] border border-[#d8dde3] bg-white px-[18px] text-[15px] font-normal text-[#2b3b4d]"
          >
            <Upload size={16} strokeWidth={2} />
            Choose File
          </button>
        </div>

        {isEdit ? (
          <div className="flex min-h-[75px] items-start gap-[11px] rounded-[8px] border border-[#a8d4ff] bg-[#eef6ff] px-[16px] py-[15px]">
            <CheckCircle2 className="mt-[1px] shrink-0 text-[#00a85a]" size={18} strokeWidth={2.2} />
            <div>
              <p className="mb-[9px] text-[13px] font-bold leading-none text-[#2b3b4d]">Status: Approved</p>
              <p className="text-[13px] font-normal leading-none text-[#687586]">Approved on 2024-11-22. Visible to students.</p>
            </div>
          </div>
        ) : (
          <label className="flex min-h-[72px] items-center gap-[12px] rounded-[8px] bg-[#fafafa] px-[16px]">
            <input type="checkbox" name="featured" className="h-[20px] w-[20px] rounded border-[#d8dde3]" />
            <span>
              <span className="block text-[13px] font-bold leading-none text-[#2b3b4d]">Mark as Featured</span>
              <span className="mt-[8px] block text-[13px] font-normal leading-none text-[#687586]">Featured resources will be highlighted for students</span>
            </span>
          </label>
        )}
      </div>

      <div className="flex h-[90px] items-center justify-end gap-[12px] border-t border-[#d8dde3] px-[24px]">
        <button type="button" onClick={onCancel} className="h-[41px] rounded-[8px] border border-[#d8dde3] bg-white px-[18px] text-[13px] font-bold text-[#2b3b4d]">
          Cancel
        </button>
        <button type="submit" className="inline-flex h-[41px] items-center gap-[8px] rounded-[8px] bg-[#ffa313] px-[18px] text-[13px] font-bold text-white">
          {isEdit && <Check size={15} strokeWidth={2.4} />}
          {isEdit ? "Update Resource" : "Submit for Approval"}
        </button>
      </div>
    </form>
  );
};

const FormInput = ({ label, required, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
  <div>
    <label className="mb-[9px] block text-[15px] font-normal text-[#687586]">
      {label} {required && <span className="text-[#ff3647]">*</span>}
    </label>
    <input
      {...props}
      required={required}
      className="h-[42px] w-full rounded-[8px] border border-[#d8dde3] bg-white px-[16px] text-[16px] font-normal text-[#111111] outline-none placeholder:text-[#9aa4b2]"
    />
  </div>
);

const FormTextArea = ({ label, required, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) => (
  <div>
    <label className="mb-[9px] block text-[15px] font-normal text-[#687586]">
      {label} {required && <span className="text-[#ff3647]">*</span>}
    </label>
    <textarea
      {...props}
      required={required}
      className="h-[114px] w-full resize-none rounded-[8px] border border-[#d8dde3] bg-white px-[16px] py-[12px] text-[16px] font-normal text-[#111111] outline-none placeholder:text-[#9aa4b2]"
    />
  </div>
);

const FormSelect = ({
  label,
  required,
  options,
  placeholder,
  defaultValue,
  name,
}: {
  label: string;
  required?: boolean;
  options: string[];
  placeholder: string;
  defaultValue?: string;
  name: string;
}) => (
  <div>
    <label className="mb-[9px] block text-[15px] font-normal text-[#687586]">
      {label} {required && <span className="text-[#ff3647]">*</span>}
    </label>
    <SelectShell className="h-[38px]" name={name} defaultValue={defaultValue || ""} required={required}>
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </SelectShell>
  </div>
);
