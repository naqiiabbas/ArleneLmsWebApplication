"use client";

import React, { ChangeEvent, FormEvent, useRef, useState } from "react";
import {
  Bell,
  Building2,
  Camera,
  Globe2,
  Lock,
  Mail,
  MapPin,
  Phone,
  Save,
  User,
} from "lucide-react";

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  organization: string;
  memberSince: string;
  areasOfExpertise: string;
  availability: string;
  bio: string;
  avatarUrl: string;
}

interface NotificationData {
  newMessages: boolean;
  sessionReminders: boolean;
  studentAlerts: boolean;
}

interface SecurityData {
  twoFactorEnabled: boolean;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PreferenceData {
  language: string;
  timezone: string;
  dateFormat: string;
}

interface SettingsData {
  profile: ProfileData;
  notifications: NotificationData;
  security: SecurityData;
  preferences: PreferenceData;
}

type TabId = "profile" | "notifications" | "security" | "preferences";

const INITIAL_SETTINGS_DATA: SettingsData = {
  profile: {
    firstName: "John",
    lastName: "Mentor",
    email: "john.mentor@100blackmen.org",
    phone: "(555) 123-4567",
    address: "123 Main Street, Orange County, CA 92868",
    organization: "100 Black Men of Orange County",
    memberSince: "2020-01-15",
    areasOfExpertise: "Math, Career Planning, Technology",
    availability: "Weekdays 4PM-8PM, Weekends 9AM-2PM",
    bio: "",
    avatarUrl: "",
  },
  notifications: {
    newMessages: true,
    sessionReminders: true,
    studentAlerts: true,
  },
  security: {
    twoFactorEnabled: false,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  },
  preferences: {
    language: "English",
    timezone: "Pacific Time (PT)",
    dateFormat: "MM/DD/YYYY",
  },
};

const NAVIGATION_ITEMS: Array<{
  id: TabId;
  label: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
}> = [
  { id: "profile", label: "Profile", Icon: User },
  { id: "notifications", label: "Notifications", Icon: Bell },
  { id: "security", label: "Security", Icon: Lock },
  { id: "preferences", label: "Preferences", Icon: Globe2 },
];

export default function SettingsSection() {
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [formData, setFormData] = useState<SettingsData>(INITIAL_SETTINGS_DATA);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    console.log("Saved Data:", formData[activeTab]);
    alert(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} updated successfully!`);
    setIsLoading(false);
  };

  return (
    <section className="min-h-full bg-[#f4f4f4] px-4 pb-6 pt-7 font-poppins text-[#101010] md:px-6">
      <div className="mx-auto max-w-[1132px]">
        <header className="mb-[24px]">
          <h1 className="text-[30px] font-bold leading-[1.12] tracking-[-0.02em] text-[#111111]">
            Settings
          </h1>
          <p className="mt-1 text-[15px] leading-5 text-[#666666]">Manage your account preferences</p>
        </header>

        <div className="grid gap-4 lg:grid-cols-[267px_minmax(0,1fr)]">
          <aside className="rounded-lg border border-[#dddddd] bg-white px-[15px] py-[9px] lg:min-h-[805px]">
            <nav className="space-y-[10px]">
              {NAVIGATION_ITEMS.map(({ id, label, Icon }) => {
                const active = activeTab === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTab(id)}
                    className={`flex h-[55px] w-full items-center gap-[10px] rounded-lg border px-[17px] text-left text-[15px] font-medium transition-colors ${
                      active
                        ? "border-[#ffa313] bg-[#ffa313] text-white"
                        : "border-[#d3d3d3] bg-white text-[#666666] hover:border-[#ffa313] hover:text-[#ffa313]"
                    }`}
                  >
                    <Icon size={17} className="shrink-0" />
                    <span>{label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          <main className="min-h-[805px] overflow-hidden rounded-lg border border-[#dddddd] bg-white">
            <form onSubmit={handleSave} className="min-h-[805px]">
              {activeTab === "profile" && (
                <ProfileForm
                  data={formData.profile}
                  isLoading={isLoading}
                  onChange={(field, value) => handleUpdate("profile", field, value)}
                />
              )}
              {activeTab === "notifications" && (
                <NotificationForm
                  data={formData.notifications}
                  isLoading={isLoading}
                  onChange={(field, value) => handleUpdate("notifications", field, value)}
                />
              )}
              {activeTab === "security" && (
                <SecurityForm
                  data={formData.security}
                  isLoading={isLoading}
                  onChange={(field, value) => handleUpdate("security", field, value)}
                />
              )}
              {activeTab === "preferences" && (
                <PreferencesForm
                  data={formData.preferences}
                  isLoading={isLoading}
                  onChange={(field, value) => handleUpdate("preferences", field, value)}
                />
              )}
            </form>
          </main>
        </div>
      </div>
    </section>
  );
}

interface FormProps<T> {
  data: T;
  isLoading: boolean;
  onChange: (field: keyof T, value: T[keyof T]) => void;
}

function ProfileForm({ data, isLoading, onChange }: FormProps<ProfileData>) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onChange("avatarUrl", URL.createObjectURL(file));
  };

  return (
    <div className="flex min-h-[805px] flex-col">
      <div className="flex h-[54px] items-end border-b border-[#dddddd]">
        <div className="ml-6 flex h-full min-w-[168px] items-center border-b-2 border-[#ffa313] text-[15px] font-medium text-[#ff9900]">
          <User size={16} className="mr-2" />
          Profile Information
        </div>
      </div>

      <div className="flex-1 px-6 pb-8 pt-[28px]">
        <div className="flex flex-col gap-5 border-b border-[#dddddd] pb-6 sm:flex-row sm:items-center">
          <div className="relative h-[100px] w-[100px] shrink-0">
            {data.avatarUrl ? (
              <img src={data.avatarUrl} alt="Profile" className="h-full w-full rounded-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full bg-[#ffa313] text-[28px] font-medium text-white">
                JM
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-[2px] right-[3px] flex h-[31px] w-[31px] items-center justify-center rounded-full border border-[#d8dde3] bg-white text-[#6f7882] shadow-sm"
              aria-label="Change profile photo"
            >
              <Camera size={14} />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </div>
          <div>
            <h2 className="text-[21px] font-semibold leading-7 text-[#2c3e50]">Profile Photo</h2>
            <p className="mt-1 text-[13px] text-[#687583]">Upload a new profile photo (JPG, PNG, max 5MB)</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-[14px] h-[40px] rounded-lg border border-[#d8dde3] bg-white px-[14px] text-[15px] font-medium text-[#2c3e50]"
            >
              Change Photo
            </button>
          </div>
        </div>

        <FormSectionTitle>Personal Information</FormSectionTitle>
        <div className="grid gap-3 md:grid-cols-2">
          <InputField label="First Name" value={data.firstName} onChange={(value) => onChange("firstName", value)} />
          <InputField label="Last Name" value={data.lastName} onChange={(value) => onChange("lastName", value)} />
        </div>

        <FormSectionTitle>Contact Information</FormSectionTitle>
        <IconInput
          icon={<Mail size={19} />}
          label="Email Address"
          type="email"
          value={data.email}
          onChange={(value) => onChange("email", value)}
        />
        <IconInput
          icon={<Phone size={19} />}
          label="Phone Number"
          value={data.phone}
          onChange={(value) => onChange("phone", value)}
        />
        <IconInput
          icon={<MapPin size={19} />}
          label="Address"
          value={data.address}
          onChange={(value) => onChange("address", value)}
        />

        <FormSectionTitle>Professional Information</FormSectionTitle>
        <IconInput
          icon={<Building2 size={19} />}
          label="Organization"
          value={data.organization}
          onChange={(value) => onChange("organization", value)}
          readOnly
        />
        <IconInput
          icon={<CalendarGlyph />}
          label="Member Since"
          value={data.memberSince}
          onChange={(value) => onChange("memberSince", value)}
          readOnly
        />
        <InputField
          label="Areas of Expertise"
          value={data.areasOfExpertise}
          onChange={(value) => onChange("areasOfExpertise", value)}
        />
        <InputField label="Availability" value={data.availability} onChange={(value) => onChange("availability", value)} />
        <TextareaField label="Bio" value={data.bio} onChange={(value) => onChange("bio", value)} />
      </div>

      <div className="flex justify-end gap-3 border-t border-[#dddddd] px-6 py-[14px]">
        <button
          type="button"
          className="h-[40px] min-w-[114px] rounded-lg border border-[#d8dde3] bg-white px-5 text-[14px] font-medium text-[#2c3e50]"
        >
          Cancel
        </button>
        <PrimaryButton label={isLoading ? "Saving..." : "Save Changes"} />
      </div>
    </div>
  );
}

function NotificationForm({ data, isLoading, onChange }: FormProps<NotificationData>) {
  const items = [
    {
      id: "newMessages" as const,
      title: "New Messages",
      description: "Get notified when students send you messages",
    },
    {
      id: "sessionReminders" as const,
      title: "Session Reminders",
      description: "Receive reminders for upcoming sessions",
    },
    {
      id: "studentAlerts" as const,
      title: "Student Alerts",
      description: "Get alerts for attendance issues or risks",
    },
  ];

  return (
    <div className="p-6">
      <h2 className="text-[21px] font-semibold leading-7 text-[#111111]">Notification Preferences</h2>
      <p className="mt-[8px] text-[15px] leading-5 text-[#666666]">Choose how you want to receive notifications</p>
      <h3 className="mt-[27px] text-[18px] font-semibold leading-6 text-[#111111]">Email Notifications</h3>

      <div className="mt-[17px] space-y-4">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id, !data[item.id])}
            className="flex min-h-[70px] w-full items-center justify-between rounded-lg border border-[#dddddd] bg-white px-4 text-left transition-colors hover:border-[#ffa313]"
          >
            <span>
              <span className="block text-[15px] font-medium leading-5 text-[#111111]">{item.title}</span>
              <span className="mt-[2px] block text-[13px] leading-[18px] text-[#666666]">{item.description}</span>
            </span>
            <span
              className={`h-[18px] w-[18px] rounded border ${
                data[item.id] ? "border-[#ffa313] bg-[#ffa313]" : "border-[#cfcfcf] bg-white"
              }`}
              aria-hidden="true"
            />
          </button>
        ))}
      </div>

      <div className="mt-6">
        <PrimaryButton label={isLoading ? "Saving..." : "Save Preferences"} />
      </div>
    </div>
  );
}

function SecurityForm({ data, isLoading, onChange }: FormProps<SecurityData>) {
  return (
    <div className="p-6">
      <h2 className="text-[21px] font-semibold leading-7 text-[#111111]">Security Settings</h2>
      <p className="mt-[8px] text-[15px] leading-5 text-[#666666]">Manage your password and account security</p>

      <div className="mt-[27px] space-y-5">
        <InputField
          label="Current Password"
          type="password"
          placeholder="Enter current password"
          value={data.currentPassword}
          onChange={(value) => onChange("currentPassword", value)}
        />
        <InputField
          label="New Password"
          type="password"
          placeholder="Enter new password"
          value={data.newPassword}
          onChange={(value) => onChange("newPassword", value)}
        />
        <InputField
          label="Confirm New Password"
          type="password"
          placeholder="Confirm new password"
          value={data.confirmPassword}
          onChange={(value) => onChange("confirmPassword", value)}
        />
      </div>

      <div className="my-6 border-t border-[#dddddd]" />

      <h3 className="text-[18px] font-semibold leading-6 text-[#111111]">Two-Factor Authentication</h3>
      <button
        type="button"
        onClick={() => onChange("twoFactorEnabled", !data.twoFactorEnabled)}
        className="mt-[17px] flex min-h-[70px] w-full items-center justify-between rounded-lg border border-[#dddddd] bg-white px-4 text-left"
      >
        <span>
          <span className="block text-[15px] font-medium leading-5 text-[#111111]">Enable 2FA</span>
          <span className="mt-[2px] block text-[13px] leading-[18px] text-[#666666]">
            Add an extra layer of security to your account
          </span>
        </span>
        <span
          className={`h-[20px] w-[20px] rounded border ${
            data.twoFactorEnabled ? "border-[#ffa313] bg-[#ffa313]" : "border-[#d0d0d0] bg-white"
          }`}
          aria-hidden="true"
        />
      </button>

      <div className="mt-12">
        <PrimaryButton label={isLoading ? "Saving..." : "Update Security"} />
      </div>
    </div>
  );
}

function PreferencesForm({ data, isLoading, onChange }: FormProps<PreferenceData>) {
  return (
    <div className="p-6">
      <h2 className="text-[21px] font-semibold leading-7 text-[#111111]">General Preferences</h2>
      <p className="mt-[8px] text-[15px] leading-5 text-[#666666]">Customize your dashboard experience</p>

      <div className="mt-[27px] space-y-5">
        <SelectField
          label="Language"
          value={data.language}
          options={["English", "Urdu", "Spanish"]}
          onChange={(value) => onChange("language", value)}
        />
        <SelectField
          label="Timezone"
          value={data.timezone}
          options={["Pacific Time (PT)", "GMT+5", "UTC"]}
          onChange={(value) => onChange("timezone", value)}
        />
        <SelectField
          label="Date Format"
          value={data.dateFormat}
          options={["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]}
          onChange={(value) => onChange("dateFormat", value)}
        />
      </div>

      <div className="mt-6">
        <PrimaryButton label={isLoading ? "Saving..." : "Save Preferences"} />
      </div>
    </div>
  );
}

function FormSectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-[14px] mt-6 text-[21px] font-semibold leading-7 text-[#2c3e50]">{children}</h3>;
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  readOnly,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  readOnly?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-[9px] block text-[15px] leading-5 text-[#666666]">{label}</span>
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`h-[44px] w-full rounded-lg border border-[#d8dde3] px-4 text-[15px] font-normal text-[#2c3e50] outline-none transition focus:border-[#ffa313] ${
          readOnly ? "bg-[#f9fafb] text-[#687583]" : "bg-white"
        } placeholder:text-[#98a4b1]`}
      />
    </label>
  );
}

function IconInput({
  icon,
  label,
  value,
  onChange,
  type = "text",
  readOnly,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  readOnly?: boolean;
}) {
  return (
    <div className="mb-3 grid grid-cols-[22px_minmax(0,1fr)] gap-[10px] text-[#6f7882]">
      <div className="pt-[31px]">{icon}</div>
      <InputField label={label} value={value} onChange={onChange} type={type} readOnly={readOnly} />
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-[11px] block text-[15px] leading-5 text-[#666666]">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-[48px] w-full appearance-none rounded-lg border border-[#dddddd] bg-white px-3 text-[16px] text-[#111111] outline-none transition focus:border-[#ffa313]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextareaField({
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
      <span className="mb-[9px] block text-[15px] leading-5 text-[#666666]">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Tell students about yourself..."
        className="min-h-[112px] w-full resize-none rounded-lg border border-[#d8dde3] px-4 py-3 text-[15px] text-[#2c3e50] outline-none transition placeholder:text-[#98a4b1] focus:border-[#ffa313]"
      />
    </label>
  );
}

function PrimaryButton({ label }: { label: string }) {
  return (
    <button
      type="submit"
      className="inline-flex h-[45px] items-center justify-center gap-[9px] rounded-lg bg-[#ffa313] px-[22px] text-[15px] font-medium text-white transition hover:bg-[#f59a00]"
    >
      <Save size={16} />
      {label}
    </button>
  );
}

function CalendarGlyph() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 3v3M17 3v3M4 8h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
