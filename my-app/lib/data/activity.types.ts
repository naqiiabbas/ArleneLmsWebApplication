// UI-facing types for the admin Activity Logs module.
export type ActivityStatus = "Success" | "Failed"

export type UIActivityLog = {
  id: string
  time: string
  user: string
  role: string
  action: string
  actionIcon: string
  target: string
  ip: string
  status: ActivityStatus
}
