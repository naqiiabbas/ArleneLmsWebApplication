// What a panel header shows about the signed-in user (see lib/data/me.ts).
export type HeaderInfo = {
  name: string
  email: string
  role: string
  avatarUrl: string
  unreadNotifications: number
}
