"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  listConversations,
  getMessages,
  sendMessage,
  markConversationRead,
  createDirectConversation,
} from "@/lib/data/messaging";
import type { UIConversation, UIMessage } from "@/lib/data/messaging.types";

type Message = UIMessage;
type Conversation = UIConversation;

const ROLES = ["Student", "Mentor", "Admin"];

export default function Messagesadmin() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [myId, setMyId] = useState<string>("");
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [newContactName, setNewContactName] = useState("");
  const [newContactRole, setNewContactRole] = useState("Student");
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeChat = useMemo(
    () => conversations.find((conversation) => conversation.id === activeChatId) ?? null,
    [conversations, activeChatId]
  );

  const filteredConversations = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return conversations.filter(
      (conversation) =>
        conversation.name.toLowerCase().includes(query) || conversation.role.toLowerCase().includes(query)
    );
  }, [conversations, searchQuery]);

  const loadConversations = async () => {
    try {
      const data = await listConversations();
      setConversations(data);
      setActiveChatId((prev) => prev ?? data[0]?.id ?? null);
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setLoadingConvos(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    const res = await getMessages(conversationId);
    if (res.error) {
      setNotice(res.error);
      return;
    }
    setMyId(res.myId);
    setMessages(res.messages);
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (!activeChatId) {
      setMessages([]);
      return;
    }
    loadMessages(activeChatId);
    markConversationRead(activeChatId).then(() =>
      setConversations((prev) => prev.map((c) => (c.id === activeChatId ? { ...c, unreadCount: 0 } : c)))
    );
  }, [activeChatId]);

  // Light polling for near-real-time updates.
  useEffect(() => {
    const timer = setInterval(() => {
      loadConversations();
      if (activeChatId) loadMessages(activeChatId);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeChatId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (event?: React.FormEvent) => {
    event?.preventDefault();
    const text = newMessage.trim();
    if (!text || !activeChatId) return;
    setSending(true);
    const res = await sendMessage(activeChatId, text);
    setSending(false);
    if (res.error) {
      setNotice(res.error);
      return;
    }
    setNewMessage("");
    await loadMessages(activeChatId);
    await loadConversations();
  };

  const handleCreateChat = async () => {
    const name = newContactName.trim();
    if (!name) return;
    const res = await createDirectConversation(name);
    if (res.error) {
      setNotice(res.error);
      return;
    }
    setIsModalOpen(false);
    setNewContactName("");
    setNewContactRole("Student");
    await loadConversations();
    if (res.id) setActiveChatId(res.id);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setNewMessage(`Document Attached: ${file.name}`);
  };

  return (
    <div className="min-h-full bg-[#f4f4f4] px-6 py-6 font-[Poppins]">
      <div className="mb-[25px] flex items-center justify-between gap-4">
        <div className="flex items-center gap-[12px]">
          <div className="flex h-[48px] w-[48px] items-center justify-center rounded-[8px] bg-[#fff7e8]">
            <img src="/images/admin-message-icon.svg" alt="" className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-[24px] font-semibold leading-none text-[#111111]">Messaging System</h1>
            <p className="mt-[8px] text-[16px] font-normal leading-none text-[#666666]">
              Communicate with students and mentors
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex h-[42px] items-center gap-[10px] rounded-[8px] bg-[#ffa313] px-[22px] text-[16px] font-normal text-white transition-colors hover:bg-[#ef970d]"
        >
          <span className="text-[22px] leading-none">+</span>
          Add New Chat
        </button>
      </div>

      {notice && (
        <div className="mb-4 flex items-start justify-between gap-4 rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-semibold text-red-700">
          <span className="break-all">{notice}</span>
          <button type="button" onClick={() => setNotice(null)} className="shrink-0 text-[13px] underline">
            Dismiss
          </button>
        </div>
      )}

      <div className="grid h-[1100px] grid-cols-[363px_minmax(0,1fr)] gap-[16px]">
        <aside className="overflow-hidden rounded-[8px] border border-[#d6d6d6] bg-white">
          <div className="border-b border-[#d6d6d6] px-[16px] py-[17px]">
            <div className="flex h-[42px] items-center rounded-[8px] border border-[#d6d6d6] bg-white px-[13px]">
              <SearchIcon />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search conversations..."
                className="ml-[12px] h-full min-w-0 flex-1 bg-transparent text-[18px] font-normal text-[#111111] outline-none placeholder:text-[#777777]"
              />
            </div>
          </div>

          <div className="h-[calc(100%-77px)] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {loadingConvos && (
              <p className="px-[16px] py-[20px] text-[14px] text-[#666666]">Loading conversations...</p>
            )}
            {!loadingConvos && filteredConversations.length === 0 && (
              <p className="px-[16px] py-[20px] text-[14px] text-[#666666]">
                No conversations yet. Start one with "Add New Chat".
              </p>
            )}
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setActiveChatId(conversation.id)}
                className={`grid w-full grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-[12px] border-b border-[#e2e2e2] px-[16px] py-[16px] text-left transition-colors ${
                  activeChatId === conversation.id ? "bg-[#fff8eb]" : "bg-white hover:bg-[#fafafa]"
                }`}
              >
                <Avatar conversation={conversation} size="large" />
                <div className="min-w-0">
                  <h2 className="truncate text-[16px] font-normal leading-none text-[#111111]">{conversation.name}</h2>
                  <p className="mt-[8px] text-[13px] font-normal leading-none text-[#666666]">{conversation.role}</p>
                  <p className="mt-[7px] truncate text-[13px] font-normal leading-none text-[#666666]">
                    {conversation.lastMessage}
                  </p>
                </div>
                <div className="flex h-full flex-col items-end justify-start gap-[14px]">
                  <span className="whitespace-nowrap text-[13px] font-normal leading-none text-[#666666]">{conversation.time}</span>
                  {conversation.unreadCount > 0 && (
                    <span className="flex h-[24px] min-w-[24px] items-center justify-center rounded-full bg-[#ffa313] px-[7px] text-[12px] font-normal text-white">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </aside>

        <section className="flex min-w-0 flex-col overflow-hidden rounded-[8px] border border-[#d6d6d6] bg-white">
          {!activeChat ? (
            <div className="flex flex-1 items-center justify-center text-[15px] text-[#666666]">
              {loadingConvos ? "Loading..." : "Select or start a conversation."}
            </div>
          ) : (
            <>
              <div className="flex h-[73px] items-center border-b border-[#d6d6d6] px-[16px]">
                <Avatar conversation={activeChat} size="small" />
                <div className="ml-[12px]">
                  <h2 className="text-[16px] font-normal leading-none text-[#111111]">{activeChat.name}</h2>
                  <div className="mt-[7px] flex items-center gap-[8px] text-[13px] font-normal leading-none text-[#666666]">
                    <span>{capitalize(activeChat.status)}</span>
                    <span>{activeChat.role}</span>
                  </div>
                </div>
              </div>

              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-[16px] py-[16px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              >
                {messages.length === 0 && (
                  <p className="mt-[8px] text-center text-[14px] text-[#999999]">No messages yet. Say hello!</p>
                )}
                {messages.map((message) => {
                  const isMe = message.senderId === myId;
                  return (
                    <div key={message.id} className={`mb-[16px] flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[337px] rounded-[8px] px-[12px] py-[13px] ${
                          isMe ? "bg-[#ffa313] text-white" : "bg-[#f1f1f1] text-[#111111]"
                        }`}
                      >
                        <p className="break-words text-[15px] font-normal leading-[1.35]">{message.text}</p>
                        <p className={`mt-[10px] text-[12px] font-normal leading-none ${isMe ? "text-white" : "text-[#666666]"}`}>
                          {message.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={handleSendMessage} className="flex h-[77px] items-center gap-[10px] border-t border-[#d6d6d6] px-[16px]">
                <label className="relative flex h-[34px] w-[34px] cursor-pointer items-center justify-center text-[#666666]">
                  <PaperclipIcon />
                  <input type="file" className="hidden" onChange={handleFileUpload} />
                </label>
                <input
                  value={newMessage}
                  onChange={(event) => setNewMessage(event.target.value)}
                  placeholder="Type a message..."
                  className="h-[42px] min-w-0 flex-1 rounded-[8px] border border-[#d6d6d6] bg-white px-[14px] text-[16px] font-normal text-[#111111] outline-none placeholder:text-[#888888]"
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="flex h-[42px] items-center gap-[8px] rounded-[8px] bg-[#ffa313] px-[17px] text-[16px] font-normal text-white transition-colors hover:bg-[#ef970d] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <img src="/images/admin-message-send.svg" alt="" className="h-5 w-5" />
                  {sending ? "Sending..." : "Send"}
                </button>
              </form>
            </>
          )}
        </section>
      </div>

      {isModalOpen && (
        <NewChatModal
          contactName={newContactName}
          role={newContactRole}
          onContactNameChange={setNewContactName}
          onRoleChange={setNewContactRole}
          onCancel={() => setIsModalOpen(false)}
          onSubmit={handleCreateChat}
        />
      )}
    </div>
  );
}

function NewChatModal({
  contactName,
  role,
  onContactNameChange,
  onRoleChange,
  onCancel,
  onSubmit,
}: {
  contactName: string;
  role: string;
  onContactNameChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/40 p-4 font-[Poppins] backdrop-blur-sm">
      <div className="w-full max-w-[447px] rounded-[8px] bg-white px-[24px] py-[31px] shadow-2xl">
        <div className="mb-[28px] flex items-center justify-between">
          <h2 className="text-[18px] font-normal leading-none text-[#111111]">New Chat</h2>
          <button
            onClick={onCancel}
            className="relative h-[24px] w-[24px]"
            aria-label="Close"
          >
            <span className="absolute left-1/2 top-1/2 h-[2px] w-[18px] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[#666666]" />
            <span className="absolute left-1/2 top-1/2 h-[2px] w-[18px] -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-[#666666]" />
          </button>
        </div>

        <label className="mb-[11px] block text-[15px] font-normal leading-none text-[#666666]">Contact Name *</label>
        <input
          value={contactName}
          onChange={(event) => onContactNameChange(event.target.value)}
          placeholder="Enter contact name"
          className="mb-[19px] h-[42px] w-full rounded-[8px] border border-[#d6d6d6] bg-white px-[15px] text-[16px] font-normal text-[#111111] outline-none placeholder:text-[#777777]"
        />

        <label className="mb-[11px] block text-[15px] font-normal leading-none text-[#666666]">Role *</label>
        <div className="relative mb-[28px]">
          <select
            value={role}
            onChange={(event) => onRoleChange(event.target.value)}
            className="h-[42px] w-full appearance-none rounded-[8px] border border-[#d6d6d6] bg-white px-[10px] pr-[44px] text-[16px] font-normal text-[#666666] outline-none"
          >
            {ROLES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-[15px] top-1/2 h-[14px] w-[14px] -translate-y-[65%] rotate-45 border-b-2 border-r-2 border-[#666666]" />
        </div>

        <div className="grid grid-cols-[1fr_95px] gap-[13px]">
          <button
            onClick={onSubmit}
            className="h-[42px] rounded-[8px] bg-[#ffa313] text-[16px] font-normal text-white transition-colors hover:bg-[#ef970d]"
          >
            Start Chat
          </button>
          <button
            onClick={onCancel}
            className="h-[42px] rounded-[8px] border border-[#d6d6d6] bg-white text-[16px] font-normal text-[#666666] transition-colors hover:bg-[#f7f7f7]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

const Avatar = ({ conversation, size }: { conversation: Conversation; size: "small" | "large" }) => {
  const dimensions = size === "large" ? "h-[48px] w-[48px] text-[17px]" : "h-[42px] w-[42px] text-[16px]";
  return (
    <div className="relative shrink-0">
      <div className={`flex ${dimensions} items-center justify-center rounded-full bg-[#ffa313] font-normal text-white`}>
        {conversation.avatar}
      </div>
      {conversation.status === "online" && (
        <span className="absolute bottom-[2px] right-[1px] h-[11px] w-[11px] rounded-full border-2 border-white bg-[#00c875]" />
      )}
    </div>
  );
};

const SearchIcon = () => (
  <span className="relative block h-[18px] w-[18px] shrink-0 rounded-full border-2 border-[#666666] after:absolute after:bottom-[-5px] after:right-[-3px] after:h-[7px] after:w-[2px] after:-rotate-45 after:bg-[#666666]" />
);

const PaperclipIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
    <path
      d="M18.33 10.08L10.17 18.24C8.29 20.12 5.25 20.12 3.37 18.24C1.49 16.36 1.49 13.32 3.37 11.44L12.28 2.53C13.53 1.28 15.57 1.28 16.82 2.53C18.08 3.78 18.08 5.82 16.82 7.07L7.89 16C7.27 16.63 6.25 16.63 5.62 16C5 15.37 5 14.35 5.62 13.73L13.78 5.57"
      stroke="#666666"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const initialsFromName = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 3);

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
