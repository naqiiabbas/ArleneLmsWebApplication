"use client";

import React, { useEffect, useMemo, useRef, useState, ChangeEvent, FormEvent } from "react";
import {
  Search,
  Plus,
  Paperclip,
  Send,
  X,
  FileText,
  ChevronDown,
} from "lucide-react";
import {
  listConversations,
  getMessages,
  sendMessage,
  markConversationRead,
  createDirectConversation,
} from "@/lib/data/messaging";
import { getAssignedStudentOptions } from "@/lib/data/mentor";
import type { UIConversation, UIMessage } from "@/lib/data/messaging.types";
import type { MentorStudentOption } from "@/lib/data/mentor.types";

type Conversation = UIConversation;
type Message = UIMessage;

/**
 * SUB-COMPONENTS
 */
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4 font-poppins">
      <div className="w-full max-w-[450px] overflow-hidden rounded-[8px] bg-white shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex h-[85px] items-center justify-between border-b border-[#dddddd] px-[24px]">
          <h3 className="text-[20px] font-semibold leading-none text-[#2d3b4f]">{title}</h3>
          <button onClick={onClose} className="text-[#2d3b4f] transition-colors hover:text-[#111111]" aria-label="Close modal">
            <X size={22} strokeWidth={1.8} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

const InitialsAvatar = ({ text, size = 40 }: { text: string; size?: number }) => (
  <div
    className="flex shrink-0 items-center justify-center rounded-full bg-[#ffa313] font-semibold text-white"
    style={{ height: size, width: size, fontSize: size <= 40 ? 15 : 17 }}
  >
    {text}
  </div>
);

interface FilePreviewProps {
  file: File;
  onRemove: () => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, onRemove }) => (
  <div className="absolute bottom-24 left-4 right-4 bg-white border border-gray-100 rounded-xl p-3 flex items-center justify-between shadow-lg animate-in slide-in-from-bottom-4">
    <div className="flex items-center gap-3">
      <div className="bg-red-50 p-2.5 rounded-lg">
        <FileText className="text-red-500" size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-gray-700 truncate max-w-[180px]">{file.name}</p>
        <p className="text-[11px] text-gray-400">{(file.size / (1024 * 1024)).toFixed(1)} MB</p>
      </div>
    </div>
    <button onClick={onRemove} className="text-gray-400 hover:bg-gray-50 p-1.5 rounded-full border border-gray-100">
      <X size={14} />
    </button>
  </div>
);

/**
 * MAIN COMPONENT
 */
export default function MessagesSection() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [myId, setMyId] = useState<string>("");
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // New-conversation modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentOptions, setStudentOptions] = useState<MentorStudentOption[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [initialMsg, setInitialMsg] = useState("");
  const [starting, setStarting] = useState(false);

  const activeChat = useMemo(
    () => conversations.find((c) => c.id === activeChatId) ?? null,
    [conversations, activeChatId]
  );

  const filteredConversations = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return conversations.filter(
      (c) => c.name.toLowerCase().includes(q) || c.role.toLowerCase().includes(q)
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

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || !activeChatId || sending) return;
    setSending(true);
    const res = await sendMessage(activeChatId, text);
    setSending(false);
    if (res.error) {
      setNotice(res.error);
      return;
    }
    setInputText("");
    setAttachedFile(null);
    await loadMessages(activeChatId);
    await loadConversations();
  };

  const openNewChat = async () => {
    setSelectedStudentId("");
    setInitialMsg("");
    setIsModalOpen(true);
    try {
      const opts = await getAssignedStudentOptions();
      setStudentOptions(opts);
      if (opts[0]) setSelectedStudentId(opts[0].id);
    } catch (e) {
      setNotice((e as Error).message);
    }
  };

  const handleStartConversation = async () => {
    const student = studentOptions.find((s) => s.id === selectedStudentId);
    if (!student || !initialMsg.trim() || starting) return;
    setStarting(true);
    const res = await createDirectConversation(student.name);
    if (res.error || !res.id) {
      setStarting(false);
      setNotice(res.error ?? "Could not start the conversation.");
      return;
    }
    const sent = await sendMessage(res.id, initialMsg.trim());
    setStarting(false);
    if (sent.error) {
      setNotice(sent.error);
      return;
    }
    setIsModalOpen(false);
    setInitialMsg("");
    await loadConversations();
    setActiveChatId(res.id);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedFile(e.target.files[0]);
    }
  };

  return (
    <div className="flex h-[calc(100vh-104px)] min-h-[760px] w-full overflow-hidden bg-[#f4f4f4] p-4 font-poppins text-[#2d3b4f] md:p-6">
      {/* Sidebar - Chat List */}
      <div className="flex w-[320px] shrink-0 flex-col overflow-hidden rounded-l-[8px] border border-[#dddddd] border-r-0 bg-white">
        <div className="flex h-[68px] items-center justify-between border-b border-[#dddddd] px-[16px]">
          <h2 className="text-[18px] font-semibold leading-none text-[#2d3b4f]">Messages</h2>
          <button
            onClick={openNewChat}
            className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-[#ffa313] text-white transition-all hover:bg-[#f59a0d] active:scale-95"
            aria-label="Start new conversation"
          >
            <Plus size={21} strokeWidth={2} />
          </button>
        </div>

        <div className="border-b border-[#dddddd] px-[16px] py-[16px]">
          <div className="relative group">
            <Search className="absolute left-[12px] top-1/2 -translate-y-1/2 text-[#657183]" size={20} strokeWidth={1.8} />
            <input
              type="text"
              placeholder="Search messages..."
              className="h-[42px] w-full rounded-[8px] border border-[#dddddd] bg-white pl-[40px] pr-[12px] text-[16px] font-normal text-[#2d3b4f] outline-none placeholder:text-[#9aa3af] focus:border-[#ffa313]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingConvos && (
            <p className="px-[18px] py-[20px] text-[14px] text-[#666666]">Loading conversations…</p>
          )}
          {!loadingConvos && filteredConversations.length === 0 && (
            <p className="px-[18px] py-[20px] text-[14px] text-[#666666]">
              No conversations yet. Tap + to start one.
            </p>
          )}
          {filteredConversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => setActiveChatId(conversation.id)}
              className={`flex h-[93px] w-full items-center gap-[12px] border-b border-[#e5e5e5] px-[18px] text-left transition-all ${
                activeChatId === conversation.id ? "bg-[#ffa313] text-white" : "bg-white hover:bg-[#f7f7f7]"
              }`}
            >
              <InitialsAvatar text={conversation.avatar} />
              <div className="min-w-0 flex-1">
                <div className="mb-[7px] flex items-center justify-between gap-2">
                  <span className="truncate text-[16px] font-normal leading-none">{conversation.name}</span>
                  {conversation.unreadCount > 0 && (
                    <span className={`flex h-[20px] min-w-[20px] items-center justify-center rounded-full px-[6px] text-[12px] font-semibold ${
                      activeChatId === conversation.id ? "bg-white text-[#ffa313]" : "bg-[#ffa313] text-white"
                    }`}>
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
                <p className={`truncate text-[14px] font-normal leading-none ${activeChatId === conversation.id ? "text-white" : "text-[#666666]"}`}>{conversation.lastMessage}</p>
                <p className={`mt-[8px] text-[12px] font-normal leading-none ${activeChatId === conversation.id ? "text-white" : "text-[#666666]"}`}>{conversation.time}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-r-[8px] border border-[#dddddd] bg-white">
        {!activeChat ? (
          <div className="flex flex-1 items-center justify-center text-[15px] text-[#666666]">
            {loadingConvos ? "Loading…" : "Select or start a conversation."}
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="flex h-[72px] shrink-0 items-center gap-[14px] border-b border-[#dddddd] bg-white px-[18px]">
              <InitialsAvatar text={activeChat.avatar} />
              <div>
                <h3 className="text-[20px] font-semibold leading-none text-[#111111]">{activeChat.name}</h3>
                <p className="mt-[7px] text-[12px] font-normal leading-none text-[#666666]">{activeChat.role || "Direct message"}</p>
              </div>
            </div>

            {/* Messages List */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-[25px] py-[24px]">
              {messages.length === 0 && (
                <p className="mt-[8px] text-center text-[14px] text-[#999999]">No messages yet. Say hello!</p>
              )}
              {messages.map((msg) => {
                const isMe = msg.senderId === myId;
                return (
                  <div key={msg.id} className={`mb-[24px] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                    {!isMe && <span className="mb-[7px] text-[13px] font-normal leading-none text-[#666666]">{activeChat.name}</span>}
                    <div className={`max-w-[56%] break-words rounded-[9px] px-[16px] py-[14px] text-[15px] font-normal leading-[1.35] ${
                      isMe ? "bg-[#ffa313] text-white" : "bg-[#f1f1f1] text-[#111111]"
                    }`}>
                      {msg.text}
                    </div>
                    <span className="mt-[7px] text-[12px] font-normal leading-none text-[#666666]">{msg.time}</span>
                  </div>
                );
              })}
            </div>

            {/* Message Input Area */}
            <div className="border-t border-[#dddddd] bg-white px-[24px] py-[16px]">
              <form onSubmit={handleSendMessage} className="relative flex items-center gap-[12px]">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-[44px] w-[28px] shrink-0 items-center justify-center text-[#657183] transition-colors hover:text-[#ffa313]"
                  aria-label="Attach file"
                >
                  <Paperclip size={23} strokeWidth={1.8} />
                </button>
                <div className="relative flex flex-1 items-center">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="h-[44px] w-full rounded-[8px] border border-[#dddddd] bg-white px-[16px] text-[16px] font-normal text-[#2d3b4f] outline-none placeholder:text-[#9aa3af] focus:border-[#ffa313]"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                  <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                </div>
                <button
                  type="submit"
                  disabled={sending}
                  className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[9px] bg-[#ffa313] text-white transition-all hover:bg-[#f59a0d] active:scale-95 disabled:opacity-60"
                >
                  <Send size={22} strokeWidth={1.8} />
                </button>
                {attachedFile && (
                  <FilePreview file={attachedFile} onRemove={() => setAttachedFile(null)} />
                )}
              </form>
            </div>
          </>
        )}
      </div>

      {/* Modal - Start New Conversation */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Start New Conversation">
        <div className="px-[24px] pb-[24px] pt-[27px]">
          <div>
            <label className="mb-[10px] block text-[14px] font-normal leading-none text-[#657183]">Select Student <span className="text-[#ff4d4f]">*</span></label>
            <div className="relative">
              <span className="pointer-events-none absolute left-[13px] top-1/2 -translate-y-1/2 text-[#657183]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </span>
              <select
                className="h-[43px] w-full appearance-none rounded-[8px] border border-[#d6dce3] bg-white pl-[38px] pr-[42px] text-[16px] font-normal text-[#2d3b4f] outline-none focus:border-[#ffa313]"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
              >
                {studentOptions.length === 0 && <option value="">No assigned students</option>}
                {studentOptions.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-[13px] top-1/2 -translate-y-1/2 text-[#657183]" size={20} strokeWidth={1.8} />
            </div>
          </div>

          <div className="mt-[19px]">
            <label className="mb-[10px] block text-[14px] font-normal leading-none text-[#657183]">Initial Message <span className="text-[#ff4d4f]">*</span></label>
            <textarea
              placeholder="Type your first message to start the conversation"
              className="h-[149px] w-full resize-none rounded-[8px] border border-[#d6dce3] bg-white px-[16px] py-[14px] text-[16px] font-normal text-[#2d3b4f] outline-none placeholder:text-[#9aa3af] focus:border-[#ffa313]"
              value={initialMsg}
              onChange={(e) => setInitialMsg(e.target.value)}
            />
          </div>
        </div>
        <div className="flex h-[64px] items-center justify-end gap-[10px] border-t border-[#dddddd] px-[24px]">
          <button
            onClick={() => setIsModalOpen(false)}
            className="h-[40px] w-[94px] rounded-[8px] border border-[#d6dce3] bg-white text-[14px] font-semibold text-[#2d3b4f] transition hover:bg-[#f7f8fa]"
          >
            Cancel
          </button>
          <button
            onClick={handleStartConversation}
            disabled={!selectedStudentId || !initialMsg.trim() || starting}
            className="flex h-[40px] w-[181px] items-center justify-center gap-[6px] rounded-[8px] bg-[#ffa313] text-[14px] font-semibold text-white transition hover:bg-[#f59a0d] disabled:opacity-50"
          >
            <Send size={17} strokeWidth={1.8} /> {starting ? "Starting…" : "Start Conversation"}
          </button>
        </div>
      </Modal>

      {notice && (
        <div className="fixed bottom-6 left-1/2 z-[10000] flex -translate-x-1/2 items-center gap-4 rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-semibold text-red-700 shadow-lg">
          <span className="break-all">{notice}</span>
          <button type="button" onClick={() => setNotice(null)} className="shrink-0 text-[13px] underline">Dismiss</button>
        </div>
      )}
    </div>
  );
}
