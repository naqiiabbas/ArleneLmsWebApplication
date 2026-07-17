"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
} from "@/lib/data/users";

type Role = "Admin" | "Mentor" | "Student" | "Manager";
type Status = "Active" | "Suspended";

type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  status: Status;
  lastLogin: string;
  createdAt: string;
};

type View = "list" | "add" | "edit" | "details";

type Notice = { type: "success" | "error"; msg: string };

const badgeColor = (role: Role) => {
  switch (role) {
    case "Admin":
      return "bg-purple-100 text-purple-700";
    case "Mentor":
      return "bg-blue-100 text-blue-700";
    case "Student":
      return "bg-green-100 text-green-700";
    case "Manager":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const statusColor = (status: Status) =>
  status === "Active"
    ? "bg-green-100 text-green-700"
    : "bg-red-100 text-red-600";

const ActionIcon = ({ src, label }: { src: string; label: string }) => (
  <img src={src} alt={label} className="h-[19px] w-[19px] object-contain" />
);

const AdminFooter = () => (
  <div className="mt-6 rounded-[8px] bg-white py-[21px] text-center text-[15px] font-semibold leading-none text-[#666666]">
    Support <span className="mx-[13px]">•</span> Privacy <span className="mx-[13px]">•</span> Terms
  </div>
);

const BackButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="flex h-[40px] w-[40px] items-center justify-center rounded-[8px] border border-[#cfcfcf] bg-white hover:bg-[#fff7e8]"
    aria-label="Back"
  >
    <img src="/images/admin-go-back.svg" alt="" className="h-4 w-4" />
  </button>
);

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [view, setView] = useState<View>("list");
  const [selected, setSelected] = useState<User | null>(null);
  const [roleFilter, setRoleFilter] = useState<Role | "All">("All");
  const [statusFilter, setStatusFilter] = useState<Status | "All">("All");
  const [search, setSearch] = useState("");
  const [showDelete, setShowDelete] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      setUsers((await listUsers()) as User[]);
    } catch (e) {
      setNotice({ type: "error", msg: (e as Error).message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const summary = useMemo(() => {
    const total = users.length;
    const roles: Record<Role, number> = { Admin: 0, Mentor: 0, Student: 0, Manager: 0 };
    let activeStudents = 0;
    users.forEach((u) => {
      roles[u.role] += 1;
      if (u.role === "Student" && u.status === "Active") activeStudents += 1;
    });
    return { total, roles, activeStudents };
  }, [users]);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === "All" || u.role === roleFilter;
      const matchesStatus = statusFilter === "All" || u.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const resetFormState = () => {
    setSelected(null);
    setView("list");
  };

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSubmitting(true);
    const res = await createUser({
      name: (fd.get("name") as string).trim(),
      email: (fd.get("email") as string).trim(),
      phone: (fd.get("phone") as string).trim(),
      role: fd.get("role") as Role,
      status: fd.get("status") as Status,
      password: ((fd.get("password") as string) || "").trim(),
    });
    setSubmitting(false);
    if (res.error) {
      setNotice({ type: "error", msg: res.error });
      return;
    }
    setNotice({
      type: "success",
      msg: res.tempPassword
        ? `User created. Temporary password: ${res.tempPassword} — share it securely; they should change it on first login.`
        : "User created successfully.",
    });
    await refresh();
    resetFormState();
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selected) return;
    const fd = new FormData(e.currentTarget);
    setSubmitting(true);
    const res = await updateUser(selected.id, {
      name: (fd.get("name") as string).trim(),
      email: (fd.get("email") as string).trim(),
      phone: (fd.get("phone") as string).trim(),
      role: fd.get("role") as Role,
      status: fd.get("status") as Status,
    });
    setSubmitting(false);
    if (res.error) {
      setNotice({ type: "error", msg: res.error });
      return;
    }
    setNotice({ type: "success", msg: "User updated successfully." });
    await refresh();
    resetFormState();
  };

  const confirmDelete = async () => {
    if (!selected) return;
    setSubmitting(true);
    const res = await deleteUser(selected.id);
    setSubmitting(false);
    if (res.error) {
      setNotice({ type: "error", msg: res.error });
      setShowDelete(false);
      return;
    }
    setNotice({ type: "success", msg: "User deleted." });
    await refresh();
    setShowDelete(false);
    setSelected(null);
    setView("list");
  };

  const FormView = ({ mode }: { mode: "add" | "edit" }) => (
    <div className="px-6 py-6 md:px-6">
      <div className="mb-[24px] flex items-center gap-[10px] text-[21px] font-semibold leading-none text-[#111111]">
        <BackButton onClick={() => setView("list")} />
        <span>{mode === "add" ? "Add New User" : "Edit User"}</span>
      </div>

      <div className="rounded-[8px] border border-[#d6d6d6] bg-white px-[24px] py-[24px]">
        <form
          onSubmit={mode === "add" ? handleAdd : handleEdit}
          className="grid grid-cols-1 gap-x-[24px] gap-y-[20px] md:grid-cols-2"
        >
          <div className="space-y-2">
            <label className="text-[14px] font-semibold leading-none text-[#666666]">Full Name *</label>
            <input
              name="name"
              required
              defaultValue={mode === "edit" ? selected?.name : ""}
              className="h-[42px] w-full rounded-[8px] border border-[#d6d6d6] px-[15px] text-[16px] font-semibold text-[#777777] outline-none placeholder:text-[#777777] focus:border-[#ffa313]"
              placeholder="Enter user name"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[14px] font-semibold leading-none text-[#666666]">Email *</label>
            <input
              name="email"
              type="email"
              required
              defaultValue={mode === "edit" ? selected?.email : ""}
              className="h-[42px] w-full rounded-[8px] border border-[#d6d6d6] px-[15px] text-[16px] font-semibold text-[#777777] outline-none placeholder:text-[#777777] focus:border-[#ffa313]"
              placeholder="user@email.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[14px] font-semibold leading-none text-[#666666]">Phone *</label>
            <input
              name="phone"
              required
              defaultValue={mode === "edit" ? selected?.phone : ""}
              className="h-[42px] w-full rounded-[8px] border border-[#d6d6d6] px-[15px] text-[16px] font-semibold text-[#777777] outline-none placeholder:text-[#777777] focus:border-[#ffa313]"
              placeholder="+1 234-567-8900"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[14px] font-semibold leading-none text-[#666666]">Role *</label>
            <select
              name="role"
              defaultValue={mode === "edit" ? selected?.role : "Student"}
              className="h-[42px] w-full rounded-[8px] border border-[#d6d6d6] px-[10px] text-[16px] font-semibold text-[#777777] outline-none focus:border-[#ffa313]"
            >
              <option value="Admin">Admin</option>
              <option value="Mentor">Mentor</option>
              <option value="Student">Student</option>
              <option value="Manager">Manager</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[14px] font-semibold leading-none text-[#666666]">Status *</label>
            <select
              name="status"
              defaultValue={mode === "edit" ? selected?.status : "Active"}
              className="h-[42px] w-full rounded-[8px] border border-[#d6d6d6] px-[10px] text-[16px] font-semibold text-[#111111] outline-none focus:border-[#ffa313]"
            >
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
          {mode === "add" && (
            <div className="space-y-2 md:col-span-2">
              <label className="text-[14px] font-semibold leading-none text-[#666666]">Temporary Password</label>
              <input
                name="password"
                type="text"
                className="h-[42px] w-full rounded-[8px] border border-[#d6d6d6] px-[15px] text-[16px] font-semibold text-[#777777] outline-none placeholder:text-[#777777] focus:border-[#ffa313]"
                placeholder="Leave blank to auto-generate a secure password"
              />
            </div>
          )}
          <div className="md:col-span-2 mt-[10px] flex gap-[16px] border-t border-[#dddddd] pt-[24px]">
            <button
              type="submit"
              disabled={submitting}
              className={`h-[43px] rounded-[8px] px-[17px] text-[16px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70 ${
                mode === "add" ? "bg-[#ffa313] hover:bg-[#f29a0b]" : "bg-[#1976d2] hover:bg-[#1768ba]"
              }`}
            >
              {submitting ? "Saving..." : mode === "add" ? "Add User" : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              className="h-[43px] rounded-[8px] border border-[#dddddd] px-[22px] text-[16px] font-semibold text-[#666666] hover:bg-[#f7f7f7]"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const DetailsView = () =>
    selected && (
      <div className="px-6 py-6 md:px-6">
        <div className="mb-[24px] flex items-center justify-between">
          <div className="flex items-center gap-[10px] text-[21px] font-semibold leading-none text-[#111111]">
            <BackButton onClick={() => setView("list")} />
            <span>User Details</span>
          </div>
          <button
            onClick={() => setView("edit")}
            className="flex h-[40px] items-center gap-[9px] rounded-[8px] bg-[#ffa313] px-[20px] text-[16px] font-semibold text-white hover:bg-[#f29a0b]"
          >
            <img src="/images/admin-user-icon-44.svg" alt="" className="h-4 w-4" /> Edit User
          </button>
        </div>

        <div className="rounded-[8px] border border-[#d6d6d6] bg-white px-[24px] py-[28px]">
          <div className="flex flex-col gap-4 border-b border-[#dddddd] pb-[24px] md:flex-row md:items-center">
            <div className="flex items-center gap-[26px]">
              <img src="/images/avatar.png" alt={selected.name} className="h-[84px] w-[84px] rounded-full object-cover" />
              <div>
                <h3 className="text-[21px] font-semibold leading-none text-[#111111]">{selected.name}</h3>
                <div className="mt-[15px] flex gap-[10px]">
                  <span className={`rounded-full px-[10px] py-[5px] text-[12px] font-semibold leading-none ${badgeColor(selected.role)}`}>
                    {selected.role}
                  </span>
                  <span className={`rounded-full px-[10px] py-[5px] text-[12px] font-semibold leading-none ${statusColor(selected.status)}`}>
                    {selected.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-x-[80px] gap-y-[28px] pt-[27px] text-[#111111] md:grid-cols-2">
            <div>
              <p className="mb-[10px] text-[14px] font-semibold leading-none text-[#666666]">Email</p>
              <div className="flex items-center gap-[9px]">
                <img src="/images/admin-user-icon-43.svg" alt="" className="h-4 w-4" />
                <p className="text-[14px] font-semibold leading-none">{selected.email}</p>
              </div>
            </div>
            <div>
              <p className="mb-[10px] text-[14px] font-semibold leading-none text-[#666666]">Phone</p>
              <div className="flex items-center gap-[9px]">
                <PhoneIcon />
                <p className="text-[14px] font-semibold leading-none">{selected.phone}</p>
              </div>
            </div>
            <div>
              <p className="mb-[10px] text-[14px] font-semibold leading-none text-[#666666]">Created At</p>
              <p className="text-[14px] font-semibold leading-none">{selected.createdAt}</p>
            </div>
            <div>
              <p className="mb-[10px] text-[14px] font-semibold leading-none text-[#666666]">Last Login</p>
              <p className="text-[14px] font-semibold leading-none">{selected.lastLogin}</p>
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-full bg-[#f4f4f4] px-6 py-6 font-[Poppins]">
      <div className="mx-auto w-full max-w-[1600px]">
        {notice && (
          <div
            className={`mb-4 flex items-start justify-between gap-4 rounded-[8px] border px-4 py-3 text-[14px] font-semibold ${
              notice.type === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            <span className="break-all">{notice.msg}</span>
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="shrink-0 text-[13px] underline"
            >
              Dismiss
            </button>
          </div>
        )}
        {/* LIST VIEW */}
        {view === "list" && (
          <div>
            <div className="mb-[24px] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-[12px]">
                <div className="flex h-[48px] w-[48px] items-center justify-center rounded-[8px] bg-[#fff7e8]">
                  <img src="/images/admin-user-icon-41.svg" alt="" className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-[21px] font-semibold leading-none text-[#111111]">User Management</h1>
                  <p className="mt-[7px] text-[15px] leading-none text-[#666666]">{users.length} total users</p>
                </div>
              </div>
              <button
                onClick={() => setView("add")}
                className="flex h-[40px] items-center gap-[9px] rounded-[8px] bg-[#ffa313] px-[20px] text-[16px] font-semibold text-white hover:bg-[#f29a0b]"
              >
                <Plus size={17} strokeWidth={2.4} /> Add User
              </button>
            </div>

            <div className="mb-[25px] grid grid-cols-1 gap-[16px] md:grid-cols-5">
              <SummaryCard label="Total Users" value={summary.total} color="text-blue-600" />
              <SummaryCard label="Admins" value={summary.roles.Admin} color="text-purple-600" />
              <SummaryCard label="Mentors" value={summary.roles.Mentor} color="text-blue-600" />
              <SummaryCard label="Students" value={summary.roles.Student} color="text-green-600" />
              <SummaryCard label="Managers" value={summary.roles.Manager} color="text-amber-600" />
            </div>

            <div className="flex flex-col gap-[16px] rounded-t-[8px] border border-b-0 border-[#d6d6d6] bg-white px-[24px] py-[25px] md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-[16px] top-1/2 -translate-y-1/2 text-[#666666]" size={19} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search users..."
                className="h-[47px] w-full rounded-[8px] border border-[#d6d6d6] bg-white pl-[52px] pr-3 text-[16px] font-semibold text-[#666666] outline-none placeholder:text-[#777777] focus:border-[#ffa313]"
              />
            </div>
            <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as Role | "All")}
                className="h-[47px] w-full rounded-[8px] border border-[#d6d6d6] bg-white px-[12px] text-[16px] font-semibold text-[#666666] outline-none md:w-[118px]"
              >
                <option value="All">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="Mentor">Mentor</option>
                <option value="Student">Student</option>
                <option value="Manager">Manager</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as Status | "All")}
                className="h-[47px] w-full rounded-[8px] border border-[#d6d6d6] bg-white px-[12px] text-[16px] font-semibold text-[#666666] outline-none md:w-[134px]"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>

            <div className="min-h-[790px] overflow-x-auto rounded-b-[8px] border border-[#d6d6d6] bg-white">
              <table className="w-full text-[14px]">
                <thead className="bg-[#f4f4f4] text-[#666666]">
                  <tr>
                    <th className="px-[24px] py-[15px] text-left font-semibold">Name</th>
                    <th className="px-[24px] py-[15px] text-left font-semibold">Email</th>
                    <th className="px-[24px] py-[15px] text-left font-semibold">Phone</th>
                    <th className="px-[24px] py-[15px] text-left font-semibold">Role</th>
                    <th className="px-[24px] py-[15px] text-left font-semibold">Status</th>
                    <th className="px-[24px] py-[15px] text-left font-semibold">Last Login</th>
                    <th className="px-[24px] py-[15px] text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dddddd]">
                  {loading && (
                    <tr>
                      <td colSpan={7} className="px-[24px] py-[40px] text-center font-semibold text-[#777777]">
                        Loading users...
                      </td>
                    </tr>
                  )}
                  {!loading && filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-[24px] py-[40px] text-center font-semibold text-[#777777]">
                        No users found.
                      </td>
                    </tr>
                  )}
                  {!loading && filtered.map((user) => (
                    <tr key={user.id} className="h-[65px] hover:bg-[#fafafa]">
                      <td className="px-[24px] py-[18px] font-semibold text-[#111111]">{user.name}</td>
                      <td className="px-[24px] py-[18px] font-semibold text-[#777777]">{user.email}</td>
                      <td className="px-[24px] py-[18px] font-semibold text-[#777777]">{user.phone}</td>
                      <td className="px-[24px] py-[18px]">
                        <span className={`rounded-full px-[10px] py-[5px] text-[12px] font-semibold leading-none ${badgeColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-[24px] py-[18px]">
                        <span className={`rounded-full px-[10px] py-[5px] text-[12px] font-semibold leading-none ${statusColor(user.status)}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-[24px] py-[18px] font-semibold text-[#777777]">{user.lastLogin}</td>
                      <td className="px-[24px] py-[18px]">
                        <div className="flex items-center gap-[16px]">
                          <button
                            onClick={() => {
                              setSelected(user);
                              setView("details");
                            }}
                            className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-[#fff7e8]"
                            aria-label="View"
                          >
                            <ActionIcon src="/images/admin-icon-22.svg" label="View" />
                          </button>
                          <button
                            onClick={() => {
                              setSelected(user);
                              setView("edit");
                            }}
                            className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-[#fff7e8]"
                            aria-label="Edit"
                          >
                            <ActionIcon src="/images/admin-user-icon-42.svg" label="Edit" />
                          </button>
                          <button
                            onClick={() => {
                              setSelected(user);
                              setShowDelete(true);
                            }}
                            className="flex h-9 w-9 items-center justify-center rounded-full text-[#e7000b] transition hover:bg-red-50 hover:text-[#bf0008]"
                            aria-label="Delete"
                          >
                            <Trash2 size={20} strokeWidth={2.1} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <AdminFooter />
          </div>
        )}

        {view === "add" && <FormView mode="add" />}
        {view === "edit" && <FormView mode="edit" />}
        {view === "details" && <DetailsView />}
      </div>

      {showDelete && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-[340px] p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Delete</h3>
            <p className="text-sm text-gray-600 mb-5">
              Are you sure you want to delete the user{" "}
              <span className="font-semibold text-gray-900">{selected?.name}</span>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmDelete}
                className="flex-1 h-11 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDelete(false)}
                className="flex-1 h-11 border border-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
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

const SummaryCard = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="h-[86px] rounded-[8px] border border-[#d6d6d6] bg-white px-[16px] py-[18px]">
    <p className="text-[14px] font-semibold leading-none text-[#666666]">{label}</p>
    <p className={`mt-[12px] text-[24px] font-semibold leading-none ${color}`}>{value}</p>
  </div>
);

const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07A19.5 19.5 0 0 1 5.15 12.8 19.8 19.8 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.13.96.35 1.89.66 2.78a2 2 0 0 1-.45 2.11L8 9.88a16 16 0 0 0 6.12 6.12l1.27-1.27a2 2 0 0 1 2.11-.45c.89.31 1.82.53 2.78.66A2 2 0 0 1 22 16.92Z" stroke="#F9A618" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
