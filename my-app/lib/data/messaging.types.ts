// UI-facing types for the Messaging module.
export type UIMessage = {
  id: string
  senderId: string
  text: string
  time: string
}

/** Someone the current user can start a chat with. */
export type UIContact = {
  id: string
  name: string
  role: string
  /** Only sent to admin-panel users, to tell apart people with the same name. */
  email?: string
}

export type UIConversation = {
  id: string
  name: string
  role: string
  avatar: string
  status: "online" | "offline"
  lastMessage: string
  time: string
  unreadCount: number
  messages: UIMessage[]
}
