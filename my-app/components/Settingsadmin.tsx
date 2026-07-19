"use client";

import React, { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import {
  getSettings,
  saveGeneral,
  saveNotifications,
  saveSecurity,
  saveProfile,
} from "@/lib/data/settings";
import type {
  GeneralData,
  NotificationData,
  SecurityData,
  ProfileData,
  SettingsData,
} from "@/lib/data/settings.types";

type TabId = "general" | "notifications" | "security" | "profile";

const INITIAL_SETTINGS_DATA: SettingsData = {
  general: {
    siteName: "Mentorship Admin Portal",
    siteEmail: "admin@mentorship.com",
    timezone: "UTC-5 (Eastern)",
    language: "English",
    allowRegistrations: false,
    requireApproval: false,
  },
  notifications: {
    emailNotifications: false,
    pushNotifications: false,
    weeklyReports: false,
    monthlyReports: false,
  },
  security: {
    twoFactorEnabled: false,
    sessionTimeout: "30",
  },
  profile: {
    firstName: "Admin",
    lastName: "User",
    email: "admin@mentorship.com",
    phone: "+1 234-567-8900",
    bio: "",
    avatarUrl: "",
  },
};

const SETTINGS_ICONS = {
  header: "/images/admin-settings-header.svg",
  general: "/images/admin-settings-general.svg",
  notifications: "/images/admin-settings-bell.svg",
  security: "/images/admin-settings-lock.svg",
  profile: "/images/admin-settings-user.svg",
  globe: "/images/admin-settings-globe.svg",
};

const NAV_ITEMS: { id: TabId; label: string; icon: string }[] = [
  { id: "general", label: "General", icon: SETTINGS_ICONS.general },
  { id: "notifications", label: "Notifications", icon: SETTINGS_ICONS.notifications },
  { id: "security", label: "Security", icon: SETTINGS_ICONS.security },
  { id: "profile", label: "Profile", icon: SETTINGS_ICONS.profile },
];

export default function Settingsadmin() {
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [formData, setFormData] = useState<SettingsData>(INITIAL_SETTINGS_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [notice, setNotice] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    getSettings()
      .then(setFormData)
      .catch((e) => setNotice({ type: "error", msg: (e as Error).message }));
  }, []);

  const handleUpdate = <K extends keyof SettingsData>(
    section: K,
    field: keyof SettingsData[K],
    value: SettingsData[K][keyof SettingsData[K]]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    let res: { error?: string } = {};
    if (activeTab === "general") res = await saveGeneral(formData.general);
    else if (activeTab === "notifications") res = await saveNotifications(formData.notifications);
    else if (activeTab === "security") res = await saveSecurity(formData.security);
    else if (activeTab === "profile") {
      const fd = new FormData();
      fd.set("firstName", formData.profile.firstName);
      fd.set("lastName", formData.profile.lastName);
      fd.set("email", formData.profile.email);
      fd.set("phone", formData.profile.phone);
      fd.set("bio", formData.profile.bio);
      if (avatarFile) fd.set("avatar", avatarFile);
      else if (formData.profile.avatarUrl === "") fd.set("removeAvatar", "true");
      res = await saveProfile(fd);
    }
    setIsLoading(false);
    if (res.error) {
      setNotice({ type: "error", msg: res.error });
      return;
    }
    setNotice({ type: "success", msg: `${labelForTab(activeTab)} updated successfully.` });
    if (activeTab === "profile") {
      setAvatarFile(null);
      getSettings().then(setFormData).catch(() => {});
    }
  };

  return (
    <section className="min-h-full bg-[#f3f3f3] px-6 py-6 font-poppins text-[#111111] md:px-8">
      <header className="mb-6 flex items-center gap-3">
        <IconBox src={SETTINGS_ICONS.header} size="lg" />
        <div>
          <h1 className="text-[24px] font-semibold leading-tight text-[#111111]">Settings</h1>
          <p className="text-[15px] leading-5 text-[#666666]">Manage your application preferences</p>
        </div>
      </header>

      {notice && (
        <div
          className={`mb-5 flex items-start justify-between gap-4 rounded-[8px] border px-4 py-3 text-[14px] font-semibold ${
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

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[270px_minmax(0,1fr)]">
        <aside className="min-h-[690px] rounded-[8px] border border-[#d8d8d8] bg-white p-4">
          <nav className="space-y-3">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex h-[58px] w-full items-center gap-3 rounded-[8px] border px-4 text-left text-[17px] transition-colors ${
                  activeTab === item.id
                    ? "border-[#f9a313] bg-[#f9a313] text-white"
                    : "border-[#d4d4d4] bg-white text-[#666666] hover:border-[#f9a313]/60"
                }`}
              >
                <img
                  src={item.icon}
                  alt=""
                  className={`h-5 w-5 shrink-0 ${activeTab === item.id ? "[filter:brightness(0)_invert(1)]" : ""}`}
                />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="min-h-[690px] rounded-[8px] border border-[#d8d8d8] bg-white">
          <form onSubmit={handleSave} className="h-full">
            {activeTab === "general" && (
              <GeneralSettings
                data={formData.general}
                onChange={(field, value) => handleUpdate("general", field, value)}
                isLoading={isLoading}
              />
            )}
            {activeTab === "notifications" && (
              <NotificationSettings
                data={formData.notifications}
                onChange={(field, value) => handleUpdate("notifications", field, value)}
                isLoading={isLoading}
              />
            )}
            {activeTab === "security" && (
              <SecuritySettings
                data={formData.security}
                onChange={(field, value) => handleUpdate("security", field, value)}
                isLoading={isLoading}
              />
            )}
            {activeTab === "profile" && (
              <ProfileSettings
                data={formData.profile}
                onChange={(field, value) => handleUpdate("profile", field, value)}
                onAvatarFile={setAvatarFile}
                isLoading={isLoading}
              />
            )}
          </form>
        </main>
      </div>
    </section>
  );
}

function GeneralSettings({
  data,
  onChange,
  isLoading,
}: {
  data: GeneralData;
  onChange: (field: keyof GeneralData, value: GeneralData[keyof GeneralData]) => void;
  isLoading: boolean;
}) {
  return (
    <SettingsPanel title="General Settings" icon={SETTINGS_ICONS.globe}>
      <Field label="Site Name" value={data.siteName} onChange={(value) => onChange("siteName", value)} />
      <Field label="Site Email" value={data.siteEmail} onChange={(value) => onChange("siteEmail", value)} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Timezone" value={data.timezone} onChange={(value) => onChange("timezone", value)} />
        <Field label="Language" value={data.language} onChange={(value) => onChange("language", value)} />
      </div>
      <Divider />
      <div>
        <p className="mb-3 text-[16px] text-[#666666]">Registration Settings</p>
        <CheckboxRow
          label="Allow new registrations"
          checked={data.allowRegistrations}
          onChange={(value) => onChange("allowRegistrations", value)}
        />
        <CheckboxRow
          label="Require admin approval for new accounts"
          checked={data.requireApproval}
          onChange={(value) => onChange("requireApproval", value)}
        />
      </div>
      <Divider />
      <Actions isLoading={isLoading} />
    </SettingsPanel>
  );
}

function NotificationSettings({
  data,
  onChange,
  isLoading,
}: {
  data: NotificationData;
  onChange: (field: keyof NotificationData, value: boolean) => void;
  isLoading: boolean;
}) {
  return (
    <SettingsPanel title="Notification Preferences" icon={SETTINGS_ICONS.notifications}>
      <div>
        <p className="mb-4 text-[16px] text-[#111111]">Alert Types</p>
        <CheckboxRow
          label="Email Notifications"
          description="Receive notifications via email"
          checked={data.emailNotifications}
          onChange={(value) => onChange("emailNotifications", value)}
        />
        <CheckboxRow
          label="Push Notifications"
          description="Receive push notifications in browser"
          checked={data.pushNotifications}
          onChange={(value) => onChange("pushNotifications", value)}
        />
      </div>
      <Divider />
      <div>
        <p className="mb-4 text-[16px] text-[#111111]">Report Frequency</p>
        <CheckboxRow
          label="Weekly Reports"
          description="Receive weekly summary every Monday"
          checked={data.weeklyReports}
          onChange={(value) => onChange("weeklyReports", value)}
        />
        <CheckboxRow
          label="Monthly Reports"
          description="Receive monthly analytics on 1st of each month"
          checked={data.monthlyReports}
          onChange={(value) => onChange("monthlyReports", value)}
        />
      </div>
      <Divider />
      <Actions isLoading={isLoading} />
    </SettingsPanel>
  );
}

function SecuritySettings({
  data,
  onChange,
  isLoading,
}: {
  data: SecurityData;
  onChange: (field: keyof SecurityData, value: SecurityData[keyof SecurityData]) => void;
  isLoading: boolean;
}) {
  return (
    <SettingsPanel title="Security Settings" icon={SETTINGS_ICONS.security}>
      <CheckboxRow
        label="Two-Factor Authentication"
        description="Add an extra layer of security to your account"
        checked={data.twoFactorEnabled}
        onChange={(value) => onChange("twoFactorEnabled", value)}
      />
      <Divider />
      <Field
        label="Session Timeout (minutes)"
        value={data.sessionTimeout}
        onChange={(value) => onChange("sessionTimeout", value)}
      />
      <p className="-mt-2 text-[13px] text-[#777777]">Auto logout after inactivity</p>
      <Divider />
      <button
        type="button"
        className="h-[43px] rounded-[8px] border border-[#f9a313] bg-white px-4 text-[16px] text-[#f9a313]"
      >
        Change Password
      </button>
      <Divider />
      <Actions isLoading={isLoading} />
    </SettingsPanel>
  );
}

function ProfileSettings({
  data,
  onChange,
  onAvatarFile,
  isLoading,
}: {
  data: ProfileData;
  onChange: (field: keyof ProfileData, value: string) => void;
  onAvatarFile: (file: File | null) => void;
  isLoading: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onChange("avatarUrl", URL.createObjectURL(file));
      onAvatarFile(file);
    }
  };

  return (
    <SettingsPanel title="Profile Information" icon={SETTINGS_ICONS.profile}>
      <div className="flex flex-wrap items-center gap-3">
        {data.avatarUrl ? (
          <img src={data.avatarUrl} alt="Profile" className="h-20 w-20 rounded-full object-cover" />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#f9a313] text-[24px] text-white">
            AD
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="h-[38px] rounded-[8px] border border-[#f9a313] bg-white px-4 text-[15px] text-[#f9a313]"
        >
          Upload New Photo
        </button>
        <button
          type="button"
          onClick={() => {
            onChange("avatarUrl", "");
            onAvatarFile(null);
          }}
          className="h-[38px] rounded-[8px] border border-[#d8d8d8] bg-white px-4 text-[15px] text-[#666666]"
        >
          Remove
        </button>
      </div>
      <Divider />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="First Name" value={data.firstName} onChange={(value) => onChange("firstName", value)} />
        <Field label="Last Name" value={data.lastName} onChange={(value) => onChange("lastName", value)} />
      </div>
      <Field label="Email Address" value={data.email} onChange={(value) => onChange("email", value)} />
      <Field label="Phone Number" value={data.phone} onChange={(value) => onChange("phone", value)} />
      <TextArea label="Bio" value={data.bio} onChange={(value) => onChange("bio", value)} />
      <Divider />
      <Actions isLoading={isLoading} />
    </SettingsPanel>
  );
}

function SettingsPanel({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-6 py-6 md:px-7">
      <div className="mb-7 flex items-center gap-2 text-[18px] text-[#666666]">
        <img src={icon} alt="" className="h-5 w-5 shrink-0" />
        <h2 className="font-normal">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function IconBox({ src, size = "md" }: { src: string; size?: "md" | "lg" }) {
  const boxSize = size === "lg" ? "h-12 w-12" : "h-10 w-10";
  return (
    <div className={`flex ${boxSize} shrink-0 items-center justify-center rounded-[10px] bg-[#fff6e9]`}>
      <img src={src} alt="" className="h-6 w-6" />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[15px] leading-5 text-[#666666]">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-[48px] w-full rounded-[8px] border border-[#d8d8d8] bg-white px-4 text-[16px] text-[#666666] outline-none transition focus:border-[#f9a313]"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[15px] leading-5 text-[#666666]">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-[116px] w-full resize-none rounded-[8px] border border-[#d8d8d8] bg-white px-4 py-3 text-[16px] text-[#666666] outline-none transition focus:border-[#f9a313]"
      />
    </label>
  );
}

function CheckboxRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="mb-4 flex cursor-pointer items-start gap-3 text-[#111111]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-[2px] h-4 w-4 rounded border-[#d8d8d8] accent-[#f9a313]"
      />
      <span>
        <span className="block text-[15px] leading-5">{label}</span>
        {description ? <span className="block text-[13px] leading-4 text-[#666666]">{description}</span> : null}
      </span>
    </label>
  );
}

function Divider() {
  return <div className="h-px w-full bg-[#e6e6e6]" />;
}

function Actions({ isLoading }: { isLoading: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <button
        type="submit"
        disabled={isLoading}
        className="h-[43px] rounded-[8px] bg-[#f9a313] px-5 text-[16px] text-white transition hover:bg-[#ed9807] disabled:opacity-70"
      >
        {isLoading ? "Saving..." : "Save Changes"}
      </button>
      <button
        type="button"
        className="h-[43px] rounded-[8px] border border-[#d8d8d8] bg-white px-6 text-[16px] text-[#666666] transition hover:bg-[#fafafa]"
      >
        Cancel
      </button>
    </div>
  );
}

function labelForTab(tab: TabId) {
  const item = NAV_ITEMS.find((navItem) => navItem.id === tab);
  return item?.label ?? "Settings";
}
