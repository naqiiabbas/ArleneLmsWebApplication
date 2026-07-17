"use client";

import React, { useMemo, useState } from "react";
import { ChevronDown, Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";

type OrgType = "University" | "Company" | "Nonprofit" | "Government";
type Status = "Active" | "Inactive";

type Organization = {
  id: string;
  name: string;
  type: OrgType;
  contactPerson: string;
  email: string;
  phone: string;
  students: number;
  mentors: number;
  programs: number;
  status: Status;
  createdAt: string;
};

const INITIAL_ORGS: Organization[] = [
  {
    id: "o1",
    name: "Tech University",
    type: "University",
    contactPerson: "Dr. Jane Smith",
    email: "contact@techuni.edu",
    phone: "+1 234-567-1000",
    students: 120,
    mentors: 15,
    programs: 8,
    status: "Active",
    createdAt: "1/15/2024",
  },
  {
    id: "o2",
    name: "Innovation Corp",
    type: "Company",
    contactPerson: "John Davis",
    email: "hr@innovationcorp.com",
    phone: "+1 234-567-2200",
    students: 45,
    mentors: 8,
    programs: 3,
    status: "Active",
    createdAt: "3/12/2024",
  },
  {
    id: "o3",
    name: "Future Leaders Foundation",
    type: "Nonprofit",
    contactPerson: "Maria Garcia",
    email: "info@futureleaders.org",
    phone: "+1 234-567-3300",
    students: 65,
    mentors: 7,
    programs: 5,
    status: "Active",
    createdAt: "4/02/2024",
  },
  {
    id: "o4",
    name: "State Education Department",
    type: "Government",
    contactPerson: "Robert Johnson",
    email: "contact@stateedu.gov",
    phone: "+1 234-567-4400",
    students: 18,
    mentors: 2,
    programs: 2,
    status: "Active",
    createdAt: "2/19/2024",
  },
];

type View = "list" | "add" | "edit" | "details";

const inputClass =
  "h-[42px] w-full rounded-[8px] border border-[#d9d9d9] bg-white px-[15px] text-[16px] font-normal text-[#111111] outline-none placeholder:text-[#8a8a8a] focus:border-[#F9A618] focus:ring-2 focus:ring-[#F9A618]/15";

const labelClass = "mb-[10px] block text-[14px] font-medium leading-none text-[#666666]";

const AdminFooter = () => (
  <div className="mt-6 rounded-[8px] bg-white py-[21px] text-center text-[15px] font-normal leading-none text-[#666666]">
    Support <span className="mx-[13px]">{"\u2022"}</span> Privacy <span className="mx-[13px]">{"\u2022"}</span> Terms
  </div>
);

const BackButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="flex h-[40px] w-[40px] items-center justify-center rounded-[8px] border border-[#cfcfcf] bg-white transition-colors hover:bg-[#fff7e8]"
    aria-label="Back"
  >
    <img src="/images/admin-go-back.svg" alt="" className="h-4 w-4" />
  </button>
);

const HeaderIcon = () => (
  <div className="flex h-[48px] w-[48px] items-center justify-center rounded-[8px] bg-[#fff7e8]">
    <img src="/images/admin-org-icon.svg" alt="" className="h-6 w-6" />
  </div>
);

const typeBadgeClass: Record<OrgType, string> = {
  University: "bg-[#dbeafe] text-[#0057ff]",
  Company: "bg-[#d9f8e6] text-[#009a3d]",
  Nonprofit: "bg-[#f0dcff] text-[#9818d6]",
  Government: "bg-[#ffe9d6] text-[#b83b00]",
};

const TypeBadge = ({ type }: { type: OrgType }) => (
  <span className={`inline-flex h-[25px] items-center rounded-full px-[13px] text-[13px] font-normal leading-none ${typeBadgeClass[type]}`}>
    {type}
  </span>
);

const ActionIcon = ({ children, onClick, label }: { children: React.ReactNode; onClick: () => void; label: string }) => (
  <button
    onClick={onClick}
    aria-label={label}
    className="flex h-7 w-7 items-center justify-center rounded-full text-[#F9A618] transition-colors hover:bg-[#fff7e8]"
  >
    {children}
  </button>
);

function OrganizationForm({
  title,
  mode,
  selected,
  onBack,
  onSubmit,
}: {
  title: string;
  mode: "add" | "edit";
  selected: Organization | null;
  onBack: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="min-h-full bg-[#f4f4f4] px-6 py-6 font-[Poppins]">
      <div className="mb-[24px] flex items-center gap-[10px]">
        <BackButton onClick={onBack} />
        <h1 className="text-[24px] font-semibold leading-none text-[#111111]">{title}</h1>
      </div>

      <form onSubmit={onSubmit} className="rounded-[8px] border border-[#d6d6d6] bg-white px-[24px] py-[24px]">
        <div className="grid grid-cols-1 gap-x-[30px] gap-y-[25px] lg:grid-cols-2">
          <label className="lg:col-span-2">
            <span className={labelClass}>Organization Name *</span>
            <input
              name="name"
              required
              defaultValue={mode === "edit" ? selected?.name : ""}
              className={inputClass}
              placeholder={mode === "add" ? "Enter organization name" : "Tech University"}
            />
          </label>

          <label>
            <span className={labelClass}>Type *</span>
            <select name="type" defaultValue={mode === "edit" ? selected?.type : "University"} className={`${inputClass} appearance-none`}>
              <option value="University">University</option>
              <option value="Company">Company</option>
              <option value="Nonprofit">Nonprofit</option>
              <option value="Government">Government</option>
            </select>
          </label>

          <label>
            <span className={labelClass}>Status *</span>
            <select name="status" defaultValue={mode === "edit" ? selected?.status : "Active"} className={`${inputClass} appearance-none`}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </label>

          <label>
            <span className={labelClass}>Contact Person *</span>
            <input
              name="contactPerson"
              required
              defaultValue={mode === "edit" ? selected?.contactPerson : ""}
              className={inputClass}
              placeholder={mode === "add" ? "Enter contact person name" : "Dr. Jane Smith"}
            />
          </label>

          <label>
            <span className={labelClass}>Email *</span>
            <input
              name="email"
              type="email"
              required
              defaultValue={mode === "edit" ? selected?.email : ""}
              className={inputClass}
              placeholder={mode === "add" ? "contact@organization.com" : "contact@techuni.edu"}
            />
          </label>

          <label>
            <span className={labelClass}>Phone *</span>
            <input
              name="phone"
              required
              defaultValue={mode === "edit" ? selected?.phone : ""}
              className={inputClass}
              placeholder="+1 234-567-8900"
            />
          </label>
        </div>

        <div className="mt-[24px] border-t border-[#dedede] pt-[24px]">
          <div className="flex flex-wrap items-center gap-[16px]">
            <button
              type="submit"
              className="h-[43px] rounded-[8px] bg-[#F9A618] px-[18px] text-[16px] font-medium text-white transition-colors hover:bg-[#f0a014]"
            >
              {mode === "add" ? "Add Organization" : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={onBack}
              className="h-[43px] rounded-[8px] border border-[#d6d6d6] bg-white px-[26px] text-[16px] font-medium text-[#666666] transition-colors hover:bg-[#f7f7f7]"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function OrganizationDetails({
  selected,
  onBack,
  onEdit,
}: {
  selected: Organization;
  onBack: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="min-h-full bg-[#f4f4f4] px-6 py-6 font-[Poppins]">
      <div className="mb-[24px] flex items-center justify-between">
        <div className="flex items-center gap-[10px]">
          <BackButton onClick={onBack} />
          <h1 className="text-[24px] font-semibold leading-none text-[#111111]">Organization Details</h1>
        </div>
        <button
          onClick={onEdit}
          className="flex h-[40px] items-center gap-[9px] rounded-[8px] bg-[#F9A618] px-[18px] text-[16px] font-medium text-white transition-colors hover:bg-[#f0a014]"
        >
          <img src="/images/admin-user-icon-44.svg" alt="" className="h-4 w-4" />
          Edit Organization
        </button>
      </div>

      <div className="grid grid-cols-1 gap-[24px] xl:grid-cols-[1fr_363px]">
        <section className="min-h-[274px] rounded-[8px] border border-[#d6d6d6] bg-white px-[24px] py-[27px]">
          <h2 className="text-[24px] font-normal leading-none text-[#111111]">{selected.name}</h2>
          <div className="mt-[18px]">
            <TypeBadge type={selected.type} />
          </div>
          <div className="mt-[25px] border-t border-[#d9d9d9] pt-[27px]">
            <div className="grid grid-cols-1 gap-x-[88px] gap-y-[28px] md:grid-cols-2">
              <Info label="Contact Person" value={selected.contactPerson} />
              <Info label="Email" value={selected.email} />
              <Info label="Phone" value={selected.phone} />
              <Info label="Created Date" value={selected.createdAt} />
            </div>
          </div>
        </section>

        <aside className="rounded-[8px] border border-[#d6d6d6] bg-white px-[24px] py-[27px]">
          <h2 className="mb-[27px] text-[18px] font-normal leading-none text-[#111111]">Statistics</h2>
          <div className="space-y-[23px]">
            <StatRow label="Students" value={selected.students} />
            <StatRow label="Mentors" value={selected.mentors} />
            <StatRow label="Programs" value={selected.programs} />
          </div>
        </aside>
      </div>
    </div>
  );
}

const Info = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="mb-[11px] text-[16px] font-normal leading-none text-[#777777]">{label}</p>
    <p className="text-[16px] font-normal leading-none text-[#111111]">{value}</p>
  </div>
);

const StatRow = ({ label, value }: { label: string; value: number }) => (
  <div className="flex items-center justify-between">
    <span className="text-[16px] font-normal leading-none text-[#666666]">{label}</span>
    <span className="text-[24px] font-normal leading-none text-[#F9A618]">{value}</span>
  </div>
);

const SummaryCard = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="h-[109px] rounded-[8px] border border-[#d6d6d6] bg-white px-[24px] py-[27px]">
    <p className="text-[16px] font-normal leading-none text-[#666666]">{label}</p>
    <p className={`mt-[17px] text-[25px] font-normal leading-none ${color}`}>{value}</p>
  </div>
);

export default function OrganizationPage() {
  const [orgs, setOrgs] = useState<Organization[]>(INITIAL_ORGS);
  const [view, setView] = useState<View>("list");
  const [selected, setSelected] = useState<Organization | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "All">("All");
  const [showDelete, setShowDelete] = useState(false);

  const summary = useMemo(() => {
    const totalStudents = orgs.reduce((sum, o) => sum + o.students, 0);
    const totalMentors = orgs.reduce((sum, o) => sum + o.mentors, 0);
    const totalPrograms = orgs.reduce((sum, o) => sum + o.programs, 0);
    return { total: orgs.length, totalStudents, totalMentors, totalPrograms };
  }, [orgs]);

  const filtered = useMemo(() => {
    return orgs.filter((o) => {
      const q = search.toLowerCase().trim();
      const matchesSearch = o.name.toLowerCase().includes(q) || o.email.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "All" || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orgs, search, statusFilter]);

  const resetList = () => {
    setView("list");
    setSelected(null);
  };

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newOrg: Organization = {
      id: crypto.randomUUID(),
      name: (fd.get("name") as string).trim(),
      type: fd.get("type") as OrgType,
      contactPerson: (fd.get("contactPerson") as string).trim(),
      email: (fd.get("email") as string).trim(),
      phone: (fd.get("phone") as string).trim(),
      students: 0,
      mentors: 0,
      programs: 0,
      status: fd.get("status") as Status,
      createdAt: new Date().toLocaleDateString(),
    };
    setOrgs((prev) => [...prev, newOrg]);
    setSelected(newOrg);
    setView("details");
  };

  const handleEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selected) return;
    const fd = new FormData(e.currentTarget);
    const updated: Organization = {
      ...selected,
      name: (fd.get("name") as string).trim(),
      type: fd.get("type") as OrgType,
      contactPerson: (fd.get("contactPerson") as string).trim(),
      email: (fd.get("email") as string).trim(),
      phone: (fd.get("phone") as string).trim(),
      status: fd.get("status") as Status,
    };
    setOrgs((prev) => prev.map((o) => (o.id === selected.id ? updated : o)));
    setSelected(updated);
    setView("details");
  };

  const confirmDelete = () => {
    if (!selected) return;
    setOrgs((prev) => prev.filter((o) => o.id !== selected.id));
    setShowDelete(false);
    resetList();
  };

  if (view === "add") {
    return <OrganizationForm title="Add New Organization" mode="add" selected={null} onBack={resetList} onSubmit={handleAdd} />;
  }

  if (view === "edit") {
    return <OrganizationForm title="Edit Organization" mode="edit" selected={selected} onBack={resetList} onSubmit={handleEdit} />;
  }

  if (view === "details" && selected) {
    return <OrganizationDetails selected={selected} onBack={resetList} onEdit={() => setView("edit")} />;
  }

  return (
    <div className="min-h-full bg-[#f4f4f4] px-6 py-6 font-[Poppins]">
      <div className="mb-[24px] flex items-center justify-between gap-4">
        <div className="flex items-center gap-[12px]">
          <HeaderIcon />
          <div>
            <h1 className="text-[24px] font-semibold leading-none text-[#111111]">Organizations / Programs</h1>
            <p className="mt-[7px] text-[16px] font-normal leading-none text-[#666666]">{orgs.length} organizations</p>
          </div>
        </div>
        <button
          onClick={() => setView("add")}
          className="flex h-[48px] items-center gap-[9px] rounded-[8px] bg-[#F9A618] px-[25px] text-[16px] font-medium text-white transition-colors hover:bg-[#f0a014]"
        >
          <Plus size={18} strokeWidth={2} />
          Add Organization
        </button>
      </div>

      <div className="mb-[24px] grid grid-cols-1 gap-[18px] md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Organizations" value={summary.total} color="text-[#0073d8]" />
        <SummaryCard label="Total Students" value={summary.totalStudents} color="text-[#00a641]" />
        <SummaryCard label="Total Mentors" value={summary.totalMentors} color="text-[#0057ff]" />
        <SummaryCard label="Total Programs" value={summary.totalPrograms} color="text-[#9818ff]" />
      </div>

      <div className="rounded-t-[8px] border border-b-0 border-[#d6d6d6] bg-white px-[24px] py-[25px]">
        <div className="flex flex-col gap-[16px] lg:flex-row lg:items-center">
          <div className="flex h-[48px] flex-1 items-center rounded-[8px] border border-[#d6d6d6] bg-white px-[16px]">
            <Search size={21} className="mr-[15px] text-[#666666]" strokeWidth={2} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Organization..."
              className="h-full flex-1 bg-transparent text-[18px] font-normal text-[#111111] outline-none placeholder:text-[#777777]"
            />
          </div>

          <div className="relative h-[48px] w-full lg:w-[149px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Status | "All")}
              className="h-full w-full appearance-none rounded-[8px] border border-[#d6d6d6] bg-white px-[14px] pr-[38px] text-[17px] font-normal text-[#666666] outline-none"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <ChevronDown size={20} className="pointer-events-none absolute right-[13px] top-1/2 -translate-y-1/2 text-[#666666]" />
          </div>
        </div>
      </div>

      <div className="min-h-[787px] overflow-x-auto rounded-b-[8px] border border-[#d6d6d6] bg-white">
        <table className="min-w-[1050px] w-full text-left">
          <thead className="bg-[#f2f2f2] text-[16px] font-normal leading-none text-[#666666]">
            <tr>
              <th className="px-[24px] py-[18px] font-normal">Organization</th>
              <th className="px-[24px] py-[18px] font-normal">Type</th>
              <th className="px-[24px] py-[18px] font-normal">
                <span className="block leading-[18px]">Cont<br />act Person</span>
              </th>
              <th className="px-[24px] py-[18px] font-normal">Email</th>
              <th className="px-[24px] py-[18px] font-normal">Students</th>
              <th className="px-[24px] py-[18px] font-normal">Mentors</th>
              <th className="px-[24px] py-[18px] font-normal">Programs</th>
              <th className="px-[24px] py-[18px] text-center font-normal">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((org) => (
              <tr key={org.id} className="border-b border-[#e5e5e5] text-[16px] font-normal leading-none text-[#666666] last:border-b-0">
                <td className="px-[24px] py-[24px] text-[#111111]">
                  <span className="block max-w-[180px] leading-[20px]">{org.name}</span>
                </td>
                <td className="px-[24px] py-[24px]">
                  <TypeBadge type={org.type} />
                </td>
                <td className="px-[24px] py-[24px]">
                  <span className="block max-w-[120px] leading-[20px]">{org.contactPerson}</span>
                </td>
                <td className="px-[24px] py-[24px]">{org.email}</td>
                <td className="px-[24px] py-[24px]">{org.students}</td>
                <td className="px-[24px] py-[24px]">{org.mentors}</td>
                <td className="px-[24px] py-[24px]">{org.programs}</td>
                <td className="px-[24px] py-[21px]">
                  <div className="flex items-center justify-center gap-[14px]">
                    <ActionIcon label="View" onClick={() => { setSelected(org); setView("details"); }}>
                      <Eye size={16} strokeWidth={2} />
                    </ActionIcon>
                    <ActionIcon label="Edit" onClick={() => { setSelected(org); setView("edit"); }}>
                      <img src="/images/admin-user-icon-42.svg" alt="" className="h-4 w-4" />
                    </ActionIcon>
                    <button
                      onClick={() => { setSelected(org); setShowDelete(true); }}
                      aria-label="Delete"
                      className="flex h-7 w-7 items-center justify-center rounded-full text-[#ff0000] transition-colors hover:bg-[#fff1f1]"
                    >
                      <Trash2 size={16} strokeWidth={2} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminFooter />

      {showDelete && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-[400px] rounded-[10px] bg-white p-6 shadow-xl">
            <h2 className="text-[20px] font-semibold text-[#111111]">Confirm Deletion</h2>
            <p className="mt-3 text-[15px] leading-6 text-[#666666]">
              Are you sure you want to delete the organization <span className="font-semibold text-[#111111]">{selected?.name}</span>?
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={confirmDelete}
                className="h-[42px] flex-1 rounded-[8px] bg-[#ff0000] text-[15px] font-semibold text-white hover:bg-[#dc0000]"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDelete(false)}
                className="h-[42px] flex-1 rounded-[8px] border border-[#d6d6d6] bg-white text-[15px] font-semibold text-[#666666] hover:bg-[#f7f7f7]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
