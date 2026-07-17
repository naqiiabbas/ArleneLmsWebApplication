"use client";

import React, { useEffect, useState } from "react";
import {
  listRoles,
  listPermissionGroups,
  createRole,
  updateRole,
  deleteRole,
} from "@/lib/data/roles";
import type {
  UIRole,
  UIPermissionGroup,
  RoleInput,
} from "@/lib/data/roles.types";

type ViewMode = "list" | "add" | "edit";
type Notice = { type: "success" | "error"; msg: string };

const COLOR_ICONS: Record<string, string> = {
  Purple: "/images/roles-container-purple.svg",
  Blue: "/images/roles-container-blue.svg",
  Green: "/images/roles-container-green.svg",
  Orange: "/images/roles-container-orange.svg",
};
const ICON_TO_COLOR = (icon: string) =>
  Object.entries(COLOR_ICONS).find(([, v]) => v === icon)?.[0] ?? "Purple";

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

function RoleCard({
  role,
  onEdit,
  onDelete,
}: {
  role: UIRole;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="flex min-h-[350px] flex-col rounded-[8px] border border-[#d9d9d9] bg-white px-[24px] pb-[18px] pt-[24px]">
      <div className="flex items-start justify-between">
        <img src={role.icon} alt="" aria-hidden="true" className="h-[40px] w-[40px]" />
        <div className="flex items-center gap-[12px] pt-[6px]">
          <ActionButton icon="/images/roles-icon-edit.svg" label={`Edit ${role.name}`} onClick={onEdit} />
          {!role.isSystem && (
            <ActionButton icon="/images/roles-icon-delete.svg" label={`Delete ${role.name}`} onClick={onDelete} />
          )}
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

function PermissionCheckbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <span className="relative mt-[3px] h-[16px] w-[16px] shrink-0">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
      />
      <span className="absolute inset-0 rounded-[3px] border border-[#e5e5e5] bg-white peer-checked:border-transparent peer-checked:bg-[url('/images/roles-checkbox-outline.png')] peer-checked:bg-cover peer-checked:bg-center peer-checked:bg-no-repeat" />
    </span>
  );
}

function PermissionEditor({
  groups,
  checkedKeys,
  onToggle,
}: {
  groups: UIPermissionGroup[];
  checkedKeys: Set<string>;
  onToggle: (key: string) => void;
}) {
  return (
    <section className="rounded-[8px] border border-[#d9d9d9] bg-white px-[24px] pb-[18px] pt-[24px]">
      <h2 className="text-[18px] font-normal leading-none text-[#111111]">Permissions</h2>
      <div className="mt-[20px]">
        {groups.length === 0 && <p className="text-[14px] text-[#666666]">Loading permissions...</p>}
        {groups.map((group, index) => (
          <div key={group.title} className={index === 0 ? "pb-[28px]" : "border-t border-[#e3e3e3] py-[28px]"}>
            <h3 className="text-[15px] font-normal leading-none text-[#111111]">{group.title}</h3>
            <div className="mt-[24px] grid grid-cols-1 gap-x-[190px] gap-y-[18px] pl-[12px] lg:grid-cols-2">
              {group.items.map((item) => (
                <label key={item.key} className="flex max-w-[300px] items-start gap-[12px]">
                  <PermissionCheckbox checked={checkedKeys.has(item.key)} onChange={() => onToggle(item.key)} />
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
  initial,
  groups,
  submitting,
  error,
  onBack,
  onSave,
}: {
  mode: "add" | "edit";
  initial: RoleInput;
  groups: UIPermissionGroup[];
  submitting?: boolean;
  error?: string;
  onBack: () => void;
  onSave: (values: RoleInput) => void;
}) {
  const isEdit = mode === "edit";
  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description);
  const [color, setColor] = useState(ICON_TO_COLOR(initial.icon));
  const [checkedKeys, setCheckedKeys] = useState<Set<string>>(new Set(initial.permissionKeys));

  const toggle = (key: string) =>
    setCheckedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const save = () =>
    onSave({
      name: name.trim(),
      description: description.trim(),
      icon: COLOR_ICONS[color] ?? COLOR_ICONS.Purple,
      permissionKeys: [...checkedKeys],
    });

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
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mentor"
              className="mt-[12px] h-[42px] w-full rounded-[8px] border border-[#d9d9d9] bg-white px-[14px] text-[16px] font-normal text-[#111111] outline-none placeholder:text-[#777777] focus:border-[#f9a618]"
            />
          </label>
          <label className="block">
            <span className="block text-[14px] font-normal leading-none text-[#666666]">Color</span>
            <select
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="mt-[12px] h-[42px] w-full rounded-[8px] border border-[#d9d9d9] bg-white px-[14px] text-[16px] font-normal text-[#111111] outline-none focus:border-[#f9a618]"
            >
              <option value="Purple">Purple</option>
              <option value="Blue">Blue</option>
              <option value="Green">Green</option>
              <option value="Orange">Orange</option>
            </select>
          </label>
          <label className="block lg:col-span-2">
            <span className="block text-[14px] font-normal leading-none text-[#666666]">Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter role description"
              className="mt-[12px] h-[88px] w-full resize-none rounded-[8px] border border-[#d9d9d9] bg-white px-[14px] py-[12px] text-[16px] font-normal leading-[20px] text-[#111111] outline-none placeholder:text-[#777777] focus:border-[#f9a618]"
            />
          </label>
        </div>
      </div>

      <div className="mt-[24px]">
        <PermissionEditor groups={groups} checkedKeys={checkedKeys} onToggle={toggle} />
      </div>

      {error && <p className="mt-[16px] text-[14px] font-medium text-red-600">{error}</p>}

      <div className="mt-[24px] flex items-center gap-[16px]">
        <button
          type="button"
          onClick={save}
          disabled={submitting}
          className="h-[42px] rounded-[8px] bg-[#f9a618] px-[18px] text-[15px] font-normal text-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? "Saving..." : isEdit ? "Save Changes" : "Create Role"}
        </button>
        <button type="button" onClick={onBack} className="h-[42px] rounded-[8px] border border-[#d9d9d9] bg-white px-[20px] text-[15px] font-normal text-[#666666]">
          Cancel
        </button>
      </div>
    </section>
  );
}

const emptyRoleInput: RoleInput = {
  name: "",
  description: "",
  icon: COLOR_ICONS.Purple,
  permissionKeys: [],
};

export default function RolesPermissions() {
  const [roles, setRoles] = useState<UIRole[]>([]);
  const [groups, setGroups] = useState<UIPermissionGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [formError, setFormError] = useState("");
  const [view, setView] = useState<ViewMode>("list");
  const [selectedRole, setSelectedRole] = useState<UIRole | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<UIRole | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      setRoles(await listRoles());
    } catch (e) {
      setNotice({ type: "error", msg: (e as Error).message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    listPermissionGroups()
      .then(setGroups)
      .catch((e) => setNotice({ type: "error", msg: (e as Error).message }));
  }, []);

  const goList = () => {
    setView("list");
    setSelectedRole(undefined);
    setFormError("");
  };

  const handleCreate = async (values: RoleInput) => {
    if (!values.name) {
      setFormError("Role name is required.");
      return;
    }
    setFormError("");
    setSubmitting(true);
    const res = await createRole(values);
    setSubmitting(false);
    if (res.error) {
      setFormError(res.error);
      return;
    }
    setNotice({ type: "success", msg: "Role created." });
    await refresh();
    goList();
  };

  const handleUpdate = async (values: RoleInput) => {
    if (!selectedRole) return;
    if (!values.name) {
      setFormError("Role name is required.");
      return;
    }
    setFormError("");
    setSubmitting(true);
    const res = await updateRole(selectedRole.id, values);
    setSubmitting(false);
    if (res.error) {
      setFormError(res.error);
      return;
    }
    setNotice({ type: "success", msg: "Role updated." });
    await refresh();
    goList();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    const res = await deleteRole(deleteTarget.id);
    setSubmitting(false);
    setDeleteTarget(null);
    if (res.error) {
      setNotice({ type: "error", msg: res.error });
      return;
    }
    setNotice({ type: "success", msg: "Role deleted." });
    await refresh();
  };

  if (view === "add") {
    return (
      <RoleForm
        mode="add"
        initial={emptyRoleInput}
        groups={groups}
        submitting={submitting}
        error={formError}
        onBack={goList}
        onSave={handleCreate}
      />
    );
  }

  if (view === "edit" && selectedRole) {
    return (
      <RoleForm
        mode="edit"
        initial={{
          name: selectedRole.name,
          description: selectedRole.description,
          icon: selectedRole.icon,
          permissionKeys: selectedRole.permissionKeys,
        }}
        groups={groups}
        submitting={submitting}
        error={formError}
        onBack={goList}
        onSave={handleUpdate}
      />
    );
  }

  return (
    <section className="min-h-full bg-[#f4f4f4] px-[24px] py-[24px] font-[Poppins] text-[#111111]">
      {notice && (
        <div
          className={`mb-[20px] flex items-start justify-between gap-4 rounded-[8px] border px-4 py-3 text-[14px] font-semibold ${
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
          onClick={() => {
            setFormError("");
            setView("add");
          }}
          className="flex h-[42px] items-center justify-center gap-[10px] rounded-[8px] bg-[#f9a618] px-[20px] text-[16px] font-normal text-white"
        >
          <span className="text-[20px] leading-none">+</span>
          Create Role
        </button>
      </div>

      {loading ? (
        <p className="mt-[24px] text-[15px] text-[#666666]">Loading roles...</p>
      ) : roles.length === 0 ? (
        <p className="mt-[24px] text-[15px] text-[#666666]">No roles found.</p>
      ) : (
        <div className="mt-[24px] grid grid-cols-1 gap-[16px] md:grid-cols-2 xl:grid-cols-4">
          {roles.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              onEdit={() => {
                setSelectedRole(role);
                setFormError("");
                setView("edit");
              }}
              onDelete={() => setDeleteTarget(role)}
            />
          ))}
        </div>
      )}

      {deleteTarget ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-[440px] rounded-[8px] bg-white p-[24px] shadow-xl">
            <h3 className="text-[20px] font-semibold text-[#111111]">Delete Role</h3>
            <p className="mt-[16px] text-[15px] font-normal leading-[22px] text-[#666666]">
              Are you sure you want to delete the role "{deleteTarget.name}"? This action cannot be undone.
            </p>
            <div className="mt-[24px] flex justify-end gap-[12px]">
              <button type="button" onClick={() => setDeleteTarget(null)} className="h-[40px] rounded-[8px] border border-[#d9d9d9] bg-white px-[18px] text-[15px] text-[#666666]">
                Cancel
              </button>
              <button type="button" onClick={handleDelete} disabled={submitting} className="h-[40px] rounded-[8px] bg-[#e7000b] px-[20px] text-[15px] text-white disabled:opacity-70">
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
