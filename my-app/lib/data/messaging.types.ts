// UI-facing types for the Messaging module.
export type UIMessage = {
  id: string
  senderId: string
  text: string
  time: string
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
