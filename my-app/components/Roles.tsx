"use client";

import React, { useState } from "react";

type ViewMode = "list" | "add" | "edit";

type Role = {
  id: number;
  name: string;
  description: string;
  users: number;
  icon: string;
  permissions: string[];
  remaining: number;
};

type PermissionItem = {
  title: string;
  description: string;
};

type PermissionGroup = {
  title: string;
  items: PermissionItem[];
};

const initialRoles: Role[] = [
  {
    id: 1,
    name: "Super Admin",
    description: "Full system access with all permissions",
    users: 2,
    icon: "/images/roles-container-purple.svg",
    permissions: ["Dashboard", "Users", "Users"],
    remaining: 13,
  },
  {
    id: 2,
    name: "Manager",
    description: "Manage users, students, and mentors",
    users: 5,
    icon: "/images/roles-container-blue.svg",
    permissions: ["Dashboard", "Users", "Users"],
    remaining: 7,
  },
  {
    id: 3,
    name: "Mentor",
    description: "Access to teaching and student management",
    users: 32,
    icon: "/images/roles-container-green.svg",
    permissions: ["Dashboard", "Students", "Attendance"],
    remaining: 4,
  },
  {
    id: 4,
    name: "Student",
    description: "Basic access for students",
    users: 248,
    icon: "/images/roles-container-orange.svg",
    permissions: ["Dashboard", "Documents"],
    remaining: 0,
  },
];

const permissionGroups: PermissionGroup[] = [
  {
    title: "Dashboard",
    items: [{ title: "View Dashboard", description: "Access to main dashboard" }],
  },
  {
    title: "Users",
    items: [
      { title: "Manage Users", description: "Create, edit, delete users" },
      { title: "View Users", description: "View user list and details" },
    ],
  },
  {
    title: "Students",
    items: [
      { title: "Manage Students", description: "Full student management" },
      { title: "View Students", description: "View student information" },
    ],
  },
  {
    title: "Mentors",
    items: [
      { title: "Manage Mentors", description: "Full mentor management" },
      { title: "View Mentors", description: "View mentor information" },
    ],
  },
  {
    title: "Attendance",
    items: [
      { title: "Manage Attendance", description: "Mark and edit attendance" },
      { title: "View Attendance", description: "View attendance records" },
    ],
  },
  {
    title: "Documents",
    items: [
      { title: "Manage Documents", description: "Upload, approve, delete documents" },
      { title: "View Documents", description: "View and download documents" },
    ],
  },
  {
    title: "Reports",
    items: [
      { title: "Generate Reports", description: "Create and export reports" },
      { title: "View Reports", description: "View analytics and reports" },
    ],
  },
  {
    title: "Billing",
    items: [{ title: "Manage Billing", description: "Handle billing and invoices" }],
  },
  {
    title: "System",
    items: [
      { title: "Manage Roles", description: "Create and edit roles" },
      { title: "View Activity Logs", description: "Access system logs" },
    ],
  },
];

function HeaderIcon() {
  return (
    <span className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-[10px] bg-[#fff3df]">
      <img src="/images/roles-icon-shield-orange.svg" alt="" aria-hidden="true" className="h-[24px] w-[24px]" />
    </span>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[9px] border border-[#d2d2d2] bg-white"
      aria-label="Back"
    >
      <img src="/images/roles-go-back.svg" alt="" aria-hidden="true" className="h-[16px] w-[16px]" />
    </button>
  );
}

function ActionButton({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className="flex h-[24px] w-[24px] items-center justify-center">
      <img src={icon} alt="" aria-hidden="true" className="h-[16px] w-[16px]" />
    </button>
  );
}

function UsersGlyph() {
  return (
    <img src="/images/roles-users-icon.svg" alt="" aria-hidden="true" className="mt-[1px] h-[16px] w-[16px] shrink-0" />
  );
}

function RoleCard({ role, onEdit, onDelete }: { role: Role; onEdit: () => void; onDelete: () => void }) {
  return (
    <article className="flex min-h-[350px] flex-col rounded-[8px] border border-[#d9d9d9] bg-white px-[24px] pb-[18px] pt-[24px]">
      <div className="flex items-start justify-between">
        <img src={role.icon} alt="" aria-hidden="true" className="h-[40px] w-[40px]" />
        <div className="flex items-center gap-[12px] pt-[6px]">
          <ActionButton icon="/images/roles-icon-edit.svg" label={`Edit ${role.name}`} onClick={onEdit} />
          <ActionButton icon="/images/roles-icon-delete.svg" label={`Delete ${role.name}`} onClick={onDelete} />
        </div>
      </div>

      <h2 className="mt-[18px] text-[18px] font-medium leading-none text-[#111111]">{role.name}</h2>
      <p className="mt-[19px] min-h-[44px] max-w-[220px] text-[15px] font-normal leading-[20px] text-[#666666]">{role.description}</p>

      <div className="mt-[13px] flex items-start gap-[8px] border-b border-[#e3e3e3] pb-[8px]">
        <UsersGlyph />
        <div className="text-[14px] font-normal leading-[18px] text-[#666666]">
          <p>{role.users}</p>
          <p>users</p>
        </div>
      </div>

      <div className="mt-[12px] flex-1 text-[12px] font-normal leading-[15px] text-[#666666]">
        <div>
          <p>Permissions</p>
          <p>({role.permissions.length + role.remaining})</p>
        </div>

        <div className="mt-[5px] flex max-w-[220px] flex-wrap gap-[5px]">
          {role.permissions.map((permission, index) => (
            <span key={`${permission}-${index}`} className="rounded-[4px] bg-[#fff3df] px-[8px] py-[4px] text-[12px] font-normal leading-none text-[#f9a618]">
              {permission}
            </span>
          ))}
        </div>
        {role.remaining > 0 ? (
          <p className="ml-[8px] mt-[8px] text-[12px] font-normal leading-[16px] text-[#666666]">
            +{role.remaining}
            <br />
            more
          </p>
        ) : null}
      </div>
    </article>
  );
}

function PermissionCheckbox({ checked }: { checked: boolean }) {
  return (
    <span className="relative mt-[3px] h-[16px] w-[16px] shrink-0">
      <input type="checkbox" defaultChecked={checked} className="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0" />
      <span className="absolute inset-0 rounded-[3px] border border-[#e5e5e5] bg-white peer-checked:border-transparent peer-checked:bg-[url('/images/roles-checkbox-outline.png')] peer-checked:bg-cover peer-checked:bg-center peer-checked:bg-no-repeat" />
    </span>
  );
}

function PermissionEditor({ checked }: { checked: boolean }) {
  return (
    <section className="rounded-[8px] border border-[#d9d9d9] bg-white px-[24px] pb-[18px] pt-[24px]">
      <h2 className="text-[18px] font-normal leading-none text-[#111111]">Permissions</h2>
      <div className="mt-[20px]">
        {permissionGroups.map((group, index) => (
          <div key={group.title} className={index === 0 ? "pb-[28px]" : "border-t border-[#e3e3e3] py-[28px]"}>
            <h3 className="text-[15px] font-normal leading-none text-[#111111]">{group.title}</h3>
            <div className="mt-[24px] grid grid-cols-1 gap-x-[190px] gap-y-[18px] pl-[12px] lg:grid-cols-2">
              {group.items.map((item) => (
                <label key={item.title} className="flex max-w-[300px] items-start gap-[12px]">
                  <PermissionCheckbox checked={checked} />
                  <span>
                    <span className="block text-[15px] font-normal leading-none text-[#111111]">{item.title}</span>
                    <span className="mt-[6px] block text-[13px] font-normal leading-[16px] text-[#666666]">{item.description}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function RoleForm({
  mode,
  role,
  onBack,
  onSave,
}: {
  mode: "add" | "edit";
  role?: Role;
  onBack: () => void;
  onSave: () => void;
}) {
  const isEdit = mode === "edit";

  return (
    <section className="min-h-full bg-[#f4f4f4] px-[24px] pb-[24px] pt-[24px] font-[Poppins] text-[#111111]">
      <div className="flex items-center gap-[12px]">
        <BackButton onClick={onBack} />
        <h1 className="text-[22px] font-bold leading-none text-[#111111]">{isEdit ? "Edit Role" : "Create New Role"}</h1>
      </div>

      <div className="mt-[24px] rounded-[8px] border border-[#d9d9d9] bg-white px-[24px] pb-[28px] pt-[26px]">
        <h2 className="text-[18px] font-normal leading-none text-[#111111]">Basic Information</h2>
        <div className="mt-[20px] grid grid-cols-1 gap-x-[24px] gap-y-[24px] lg:grid-cols-2">
          <label className="block">
            <span className="block text-[14px] font-normal leading-none text-[#666666]">Role Name *</span>
            <input
              defaultValue={isEdit ? "Super Admin" : undefined}
              placeholder={isEdit ? undefined : "Mentor"}
              className="mt-[12px] h-[42px] w-full rounded-[8px] border border-[#d9d9d9] bg-white px-[14px] text-[16px] font-normal text-[#111111] outline-none placeholder:text-[#777777] focus:border-[#f9a618]"
            />
          </label>
          <label className="block">
            <span className="block text-[14px] font-normal leading-none text-[#666666]">Color</span>
            <input
              defaultValue="Purple"
              className="mt-[12px] h-[42px] w-full rounded-[8px] border border-[#d9d9d9] bg-white px-[14px] text-[16px] font-normal text-[#111111] outline-none focus:border-[#f9a618]"
            />
          </label>
          <label className="block lg:col-span-2">
            <span className="block text-[14px] font-normal leading-none text-[#666666]">Description</span>
            <textarea
              defaultValue={isEdit ? "Full system access with all permissions" : undefined}
              placeholder={isEdit ? undefined : "Enter role description"}
              className="mt-[12px] h-[88px] w-full resize-none rounded-[8px] border border-[#d9d9d9] bg-white px-[14px] py-[12px] text-[16px] font-normal leading-[20px] text-[#111111] outline-none placeholder:text-[#777777] focus:border-[#f9a618]"
            />
          </label>
        </div>
      </div>

      <div className="mt-[24px]">
        <PermissionEditor checked={isEdit} />
      </div>

      <div className="mt-[24px] flex items-center gap-[16px]">
        <button type="button" onClick={onSave} className="h-[42px] rounded-[8px] bg-[#f9a618] px-[18px] text-[15px] font-normal text-white">
          Save Changes
        </button>
        <button type="button" onClick={onBack} className="h-[42px] rounded-[8px] border border-[#d9d9d9] bg-white px-[20px] text-[15px] font-normal text-[#666666]">
          Cancel
        </button>
      </div>
    </section>
  );
}

export default function RolesPermissions() {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [view, setView] = useState<ViewMode>("list");
  const [selectedRole, setSelectedRole] = useState<Role | undefined>();
  const [deleteRole, setDeleteRole] = useState<Role | null>(null);

  const handleCreate = () => {
    const newRole: Role = {
      id: Date.now(),
      name: "Mentor",
      description: "Access to teaching and student management",
      users: 0,
      icon: "/images/roles-container-green.svg",
      permissions: ["Dashboard"],
      remaining: 0,
    };
    setRoles((current) => [...current, newRole]);
    setView("list");
  };

  const handleDelete = () => {
    if (!deleteRole) return;
    setRoles((current) => current.filter((role) => role.id !== deleteRole.id));
    setDeleteRole(null);
  };

  if (view === "add") {
    return <RoleForm mode="add" onBack={() => setView("list")} onSave={handleCreate} />;
  }

  if (view === "edit" && selectedRole) {
    return <RoleForm mode="edit" role={selectedRole} onBack={() => setView("list")} onSave={() => setView("list")} />;
  }

  return (
    <section className="min-h-full bg-[#f4f4f4] px-[24px] py-[24px] font-[Poppins] text-[#111111]">
      <div className="flex items-center justify-between gap-[20px]">
        <div className="flex items-center gap-[12px]">
          <HeaderIcon />
          <div>
            <h1 className="text-[22px] font-bold leading-[1.15] text-[#111111]">Roles and Permissions</h1>
            <p className="mt-[3px] text-[15px] font-normal leading-none text-[#666666]">Manage user roles and access control</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setView("add")}
          className="flex h-[42px] items-center justify-center gap-[10px] rounded-[8px] bg-[#f9a618] px-[20px] text-[16px] font-normal text-white"
        >
          <span className="text-[20px] leading-none">+</span>
          Create Role
        </button>
      </div>

      <div className="mt-[24px] grid grid-cols-1 gap-[16px] md:grid-cols-2 xl:grid-cols-4">
        {roles.slice(0, 4).map((role) => (
          <RoleCard
            key={role.id}
            role={role}
            onEdit={() => {
              setSelectedRole(role);
              setView("edit");
            }}
            onDelete={() => setDeleteRole(role)}
          />
        ))}
      </div>

      {deleteRole ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-[440px] rounded-[8px] bg-white p-[24px] shadow-xl">
            <h3 className="text-[20px] font-semibold text-[#111111]">Delete Role</h3>
            <p className="mt-[16px] text-[15px] font-normal leading-[22px] text-[#666666]">
              Are you sure you want to delete the role "{deleteRole.name}"? This action cannot be undone.
            </p>
            <div className="mt-[24px] flex justify-end gap-[12px]">
              <button type="button" onClick={() => setDeleteRole(null)} className="h-[40px] rounded-[8px] border border-[#d9d9d9] bg-white px-[18px] text-[15px] text-[#666666]">
                Cancel
              </button>
              <button type="button" onClick={handleDelete} className="h-[40px] rounded-[8px] bg-[#e7000b] px-[20px] text-[15px] text-white">
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
