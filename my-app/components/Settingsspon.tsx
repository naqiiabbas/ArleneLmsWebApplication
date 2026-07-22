"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  getSponsorSettings,
  updateSponsorCompanyProfile,
  addSponsorTeamMember,
  removeSponsorTeamMember,
} from "@/lib/data/sponsor";
import type {
  SponsorCompanyProfile as CompanyProfile,
  SponsorTeamMember as TeamMember,
} from "@/lib/data/sponsor.types";

type AccessLevel = "Full Access" | "Payments Only" | "Reports & Resources";

const emptyProfile: CompanyProfile = {
  companyName: "", website: "", industry: "", companySize: "", address: "",
  city: "", state: "", zipCode: "", phone: "", primaryContactName: "", primaryContactEmail: "",
};

const accessPill = () => "bg-[#dbeafe] text-[#155dfc]";

const MaskIcon = ({
  src,
  className = "h-[16px] w-[16px]",
}: {
  src: string;
  className?: string;
}) => (
  <span
    aria-hidden="true"
    className={`inline-block shrink-0 bg-current ${className}`}
    style={{
      WebkitMaskImage: `url(${src})`,
      maskImage: `url(${src})`,
      WebkitMaskRepeat: "no-repeat",
      maskRepeat: "no-repeat",
      WebkitMaskPosition: "center",
      maskPosition: "center",
      WebkitMaskSize: "contain",
      maskSize: "contain",
    }}
  />
);

export default function Settingsspon() {
  const [profile, setProfile] = useState<CompanyProfile>(emptyProfile);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    role: "",
    accessLevel: "Full Access" as AccessLevel,
  });

  const loadSettings = () => {
    getSponsorSettings()
      .then(({ profile, members }) => { setProfile(profile); setMembers(members); })
      .catch((e) => setError((e as Error).message));
  };

  useEffect(loadSettings, []);

  useEffect(() => {
    if (!showRemoveModal) return;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = old;
    };
  }, [showRemoveModal]);

  const canAdd = useMemo(() => newMember.name && newMember.email && newMember.role, [newMember]);

  const onSaveProfile = async () => {
    if (saving) return;
    setSaving(true);
    setError("");
    const res = await updateSponsorCompanyProfile(profile);
    setSaving(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setNotice("Profile saved successfully.");
    setTimeout(() => setNotice(""), 1800);
  };

  const onAddMember = async () => {
    if (!canAdd) return;
    const res = await addSponsorTeamMember(newMember);
    if (res.error) {
      setError(res.error);
      return;
    }
    setNewMember({ name: "", email: "", role: "", accessLevel: "Full Access" });
    setShowAdd(false);
    loadSettings();
  };

  const askRemove = (member: TeamMember) => {
    if (!member.canRemove) return;
    setSelectedMember(member);
    setShowRemoveModal(true);
  };

  const confirmRemove = async () => {
    if (!selectedMember) return;
    const id = selectedMember.id;
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setShowRemoveModal(false);
    setSelectedMember(null);
    const res = await removeSponsorTeamMember(id);
    if (res.error) { setError(res.error); loadSettings(); }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f5] px-[24px] pb-[40px] pt-[28px] font-['Poppins']">
      <div className="w-full space-y-[16px]">
        <div>
          <h1 className="text-[28px] font-semibold leading-[36px] text-[#111111]">Settings</h1>
          <p className="mt-[4px] text-[15px] font-normal leading-[24px] text-[#666666]">
            Manage your company profile and team access.
          </p>
        </div>

        {notice && (
          <div className="rounded-[8px] border border-[#b7efc9] bg-[#eafaf0] px-[16px] py-[10px] text-[14px] font-medium text-[#00a63e]">
            {notice}
          </div>
        )}
        {error && (
          <div className="flex items-start justify-between gap-4 rounded-[8px] border border-red-200 bg-red-50 px-[16px] py-[10px] text-[14px] font-medium text-red-700">
            <span className="break-all">{error}</span>
            <button type="button" onClick={() => setError("")} className="shrink-0 text-[13px] underline">Dismiss</button>
          </div>
        )}

        <section className="overflow-hidden rounded-[8px] border border-[#d9d9d9] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.12)]">
          <div className="flex min-h-[88px] items-center justify-between border-b border-[#d9d9d9] px-[24px] py-[16px]">
            <div>
              <h2 className="text-[22px] font-semibold leading-[28px] text-[#1f2937]">Company Profile</h2>
              <p className="text-[15px] font-normal leading-[22px] text-[#667085]">
                Update your organization's information
              </p>
            </div>
            <button
              onClick={onSaveProfile}
              disabled={saving}
              className="flex h-[56px] w-[192px] items-center justify-center gap-[10px] rounded-[8px] bg-[#f9a618] text-[15px] font-semibold text-white transition-colors hover:bg-[#e99a10] disabled:opacity-60"
            >
              <img src="/images/settings-save-icon.svg" alt="" aria-hidden="true" className="h-[16px] w-[16px]" />
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-x-[24px] gap-y-[24px] p-[24px] md:grid-cols-2 lg:grid-cols-12">
            <Field label="Company Name" className="lg:col-span-6">
              <Input value={profile.companyName} onChange={(value) => setProfile((p) => ({ ...p, companyName: value }))} />
            </Field>
            <Field label="Website" className="lg:col-span-6">
              <Input value={profile.website} onChange={(value) => setProfile((p) => ({ ...p, website: value }))} />
            </Field>
            <Field label="Industry" className="lg:col-span-6">
              <Input value={profile.industry} onChange={(value) => setProfile((p) => ({ ...p, industry: value }))} />
            </Field>
            <Field label="Company Size" className="lg:col-span-6">
              <Input value={profile.companySize} onChange={(value) => setProfile((p) => ({ ...p, companySize: value }))} />
            </Field>
            <Field label="Address" className="md:col-span-2 lg:col-span-12">
              <Input value={profile.address} onChange={(value) => setProfile((p) => ({ ...p, address: value }))} />
            </Field>
            <Field label="City" className="lg:col-span-6">
              <Input value={profile.city} onChange={(value) => setProfile((p) => ({ ...p, city: value }))} />
            </Field>
            <Field label="State" className="lg:col-span-3">
              <Input value={profile.state} onChange={(value) => setProfile((p) => ({ ...p, state: value }))} />
            </Field>
            <Field label="ZIP Code" className="lg:col-span-3">
              <Input value={profile.zipCode} onChange={(value) => setProfile((p) => ({ ...p, zipCode: value }))} />
            </Field>
            <Field label="Phone" className="lg:col-span-6">
              <Input value={profile.phone} onChange={(value) => setProfile((p) => ({ ...p, phone: value }))} />
            </Field>
            <Field label="Primary Contact Name" className="lg:col-span-6">
              <Input
                value={profile.primaryContactName}
                onChange={(value) => setProfile((p) => ({ ...p, primaryContactName: value }))}
              />
            </Field>
            <Field label="Primary Contact Email" className="lg:col-span-6">
              <Input
                value={profile.primaryContactEmail}
                onChange={(value) => setProfile((p) => ({ ...p, primaryContactEmail: value }))}
              />
            </Field>
          </div>
        </section>

        <section className="overflow-hidden rounded-[8px] border border-[#d9d9d9] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.12)]">
          <div className="flex min-h-[88px] items-center justify-between border-b border-[#d9d9d9] px-[24px] py-[16px]">
            <div>
              <h2 className="text-[22px] font-semibold leading-[28px] text-[#1f2937]">Team Members</h2>
              <p className="text-[15px] font-normal leading-[22px] text-[#667085]">
                Manage team member access to the sponsor portal
              </p>
            </div>
            <button
              onClick={() => setShowAdd((v) => !v)}
              className="flex h-[56px] w-[164px] items-center justify-center gap-[10px] rounded-[8px] bg-[#f9a618] text-[15px] font-semibold text-white transition-colors hover:bg-[#e99a10]"
            >
              <span className="text-[22px] font-light leading-none">+</span>
              Add Member
            </button>
          </div>

          {showAdd && (
            <div className="border-b border-[#d9d9d9] bg-[#f9fafb] px-[24px] py-[24px]">
              <h3 className="text-[17px] font-semibold leading-[24px] text-[#1f2937]">Add New Team Member</h3>
              <div className="mt-[16px] grid grid-cols-1 gap-x-[24px] gap-y-[22px] md:grid-cols-2">
                <Field label="Name">
                  <Input value={newMember.name} onChange={(value) => setNewMember((m) => ({ ...m, name: value }))} />
                </Field>
                <Field label="Email">
                  <Input value={newMember.email} onChange={(value) => setNewMember((m) => ({ ...m, email: value }))} />
                </Field>
                <Field label="Role">
                  <Input value={newMember.role} onChange={(value) => setNewMember((m) => ({ ...m, role: value }))} />
                </Field>
                <Field label="Access Level">
                  <select
                    value={newMember.accessLevel}
                    onChange={(e) => setNewMember((m) => ({ ...m, accessLevel: e.target.value as AccessLevel }))}
                    className="h-[54px] w-full rounded-[8px] border border-[#d9d9d9] bg-white px-[16px] text-[15px] font-normal text-[#1f2937] outline-none transition focus:border-[#f9a618] focus:ring-2 focus:ring-[#f9a618]/20"
                  >
                    <option>Full Access</option>
                    <option>Payments Only</option>
                    <option>Reports & Resources</option>
                  </select>
                </Field>
              </div>
              <div className="mt-[16px] flex items-center gap-[24px]">
                <button
                  onClick={onAddMember}
                  disabled={!canAdd}
                  className="flex h-[56px] w-[164px] items-center justify-center gap-[10px] rounded-[8px] bg-[#f9a618] text-[15px] font-semibold text-white transition-colors hover:bg-[#e99a10] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="text-[22px] font-light leading-none">+</span>
                  Add Member
                </button>
                <button
                  onClick={() => setShowAdd(false)}
                  className="h-[56px] w-[114px] rounded-[8px] border border-[#d9d9d9] bg-white text-[15px] font-semibold text-[#1f2937]"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left">
              <thead className="bg-[#f9fafb] text-[14px] font-semibold leading-none text-[#667085]">
                <tr>
                  <th className="px-[24px] py-[22px]">Name</th>
                  <th className="px-[24px] py-[22px]">Email</th>
                  <th className="px-[24px] py-[22px]">Role</th>
                  <th className="px-[24px] py-[22px]">Access Level</th>
                  <th className="px-[24px] py-[22px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e7eb] text-[15px] font-normal text-[#1f2937]">
                {members.length === 0 && (
                  <tr><td colSpan={5} className="px-[24px] py-[28px] text-center text-[14px] text-[#667085]">No team members yet. Add one to grant portal access.</td></tr>
                )}
                {members.map((member) => (
                  <tr key={member.id} className="h-[88px]">
                    <td className="px-[24px] py-[20px]">{member.name}</td>
                    <td className="px-[24px] py-[20px]">{member.email}</td>
                    <td className="px-[24px] py-[20px]">{member.role}</td>
                    <td className="px-[24px] py-[20px]">
                      <span className={`inline-flex h-[39px] items-center rounded-full px-[16px] text-[14px] font-normal ${accessPill()}`}>
                        {member.accessLevel}
                      </span>
                    </td>
                    <td className="px-[24px] py-[20px]">
                      {member.canRemove ? (
                        <button
                          onClick={() => askRemove(member)}
                          className="inline-flex items-center gap-[2px] whitespace-nowrap text-[15px] font-medium leading-none text-[#ff0000]"
                        >
                          <MaskIcon src="/images/roles-icon-delete.svg" className="h-[15px] w-[15px]" />
                          Remove
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-[2px] whitespace-nowrap text-[15px] font-medium leading-none text-[#ff0000]">
                          <MaskIcon src="/images/roles-icon-delete.svg" className="h-[15px] w-[15px]" />
                          Cannot Remove
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {showRemoveModal && selectedMember && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-[20px] backdrop-blur-sm">
          <div className="w-full max-w-[480px] overflow-hidden rounded-[12px] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
            <div className="flex h-[88px] items-center justify-between border-b border-[#d9d9d9] px-[24px]">
              <div className="flex items-center gap-[14px]">
                <div className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-[#fff1f1]">
                  <img src="/images/settings-remove-member-icon.svg" alt="" aria-hidden="true" className="h-[20px] w-[20px]" />
                </div>
                <h3 className="text-[22px] font-semibold leading-none text-[#1f2937]">Remove Team Member</h3>
              </div>
              <button
                onClick={() => setShowRemoveModal(false)}
                className="flex h-[32px] w-[32px] items-center justify-center text-[30px] font-light leading-none text-[#667085]"
                aria-label="Close"
              >
                x
              </button>
            </div>

            <div className="px-[24px] py-[24px]">
              <p className="text-[15px] font-normal leading-[24px] text-[#1f2937]">
                Are you sure you want to remove this team member from the sponsor portal?
              </p>

              <div className="mt-[16px] rounded-[8px] border border-[#d9d9d9] bg-[#f7f7f8] px-[16px] py-[14px]">
                <Info label="Name" value={selectedMember.name} />
                <Info label="Email" value={selectedMember.email} />
                <Info label="Role" value={selectedMember.role} />
              </div>

              <div className="mt-[16px] rounded-[8px] border border-[#ffb4b4] bg-[#fff1f1] px-[16px] py-[14px]">
                <div className="flex items-start gap-[12px]">
                  <span className="mt-[1px] text-[16px] font-semibold leading-none text-[#ff4040]">△</span>
                  <div>
                    <p className="text-[14px] font-semibold leading-[20px] text-[#ff4040]">
                      This action cannot be undone
                    </p>
                    <p className="mt-[8px] max-w-[350px] text-[13px] font-normal leading-[20px] text-[#ff4040]">
                      The team member will immediately lose access to the sponsor portal and all associated permissions.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex h-[92px] items-center justify-end gap-[12px] border-t border-[#d9d9d9] px-[24px]">
              <button
                onClick={() => setShowRemoveModal(false)}
                className="h-[44px] w-[84px] rounded-[8px] border border-[#d9d9d9] bg-white text-[15px] font-semibold text-[#667085]"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemove}
                className="flex h-[44px] w-[178px] items-center justify-center gap-[2px] rounded-[8px] bg-[#f04444] text-[15px] font-semibold text-white transition-colors hover:bg-[#dc2626]"
              >
                <MaskIcon src="/images/settings-remove-member-icon.svg" className="h-[16px] w-[16px]" />
                Remove Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={className}>
      <span className="text-[14px] font-semibold leading-none text-[#1f2937]">{label}</span>
      <div className="mt-[9px]">{children}</div>
    </label>
  );
}

function Input({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-[54px] w-full rounded-[8px] border border-[#d9d9d9] bg-white px-[24px] text-[15px] font-normal text-[#1f2937] outline-none transition focus:border-[#f9a618] focus:ring-2 focus:ring-[#f9a618]/20"
    />
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-[12px] last:mb-0">
      <p className="text-[13px] font-normal leading-[18px] text-[#667085]">{label}</p>
      <p className="mt-[2px] text-[15px] font-semibold leading-[22px] text-[#1f2937]">{value}</p>
    </div>
  );
}
