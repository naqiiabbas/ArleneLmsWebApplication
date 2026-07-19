// UI-facing types for the admin Settings module.
export interface GeneralData {
  siteName: string
  siteEmail: string
  timezone: string
  language: string
  allowRegistrations: boolean
  requireApproval: boolean
}

export interface NotificationData {
  emailNotifications: boolean
  pushNotifications: boolean
  weeklyReports: boolean
  monthlyReports: boolean
}

export interface SecurityData {
  twoFactorEnabled: boolean
  sessionTimeout: string
}

export interface ProfileData {
  firstName: string
  lastName: string
  email: string
  phone: string
  bio: string
  avatarUrl: string
}

export interface SettingsData {
  general: GeneralData
  notifications: NotificationData
  security: SecurityData
  profile: ProfileData
}
