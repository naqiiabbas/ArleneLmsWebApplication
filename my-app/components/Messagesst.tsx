"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Poppins } from 'next/font/google';
import {
  Search,
  Plus,
  Send,
  Paperclip,
  X,
  Filter,
  ChevronDown,
  FileIcon,
  MessageSquarePlus
} from 'lucide-react';
import {
  listConversations,
  getMessages,
  sendMessage,
  markConversationRead,
  createDirectConversation,
} from '@/lib/data/messaging';
import { getStudentContacts } from '@/lib/data/student';
import type { UIConversation, UIMessage } from '@/lib/data/messaging.types';
import type { StudentContact } from '@/lib/data/student.types';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
});

export default function MessagingSection() {
  const [conversations, setConversations] = useState<UIConversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [myId, setMyId] = useState('');
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [msgInput, setMsgInput] = useState("");
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  // File Upload State (UI-only — messaging has no attachment storage yet)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Modal state
  const [contacts, setContacts] = useState<StudentContact[]>([]);
  const [selectedRecipientId, setSelectedRecipientId] = useState("");
  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState("Normal");
  const [newMsgText, setNewMsgText] = useState("");
  const [starting, setStarting] = useState(false);

  const loadConversations = async () => {
    try {
      const data = await listConversations();
      setConversations(data);
      setActiveId((prev) => prev ?? data[0]?.id ?? null);
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setLoading(false);
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
    if (!activeId) {
      setMessages([]);
      return;
    }
    loadMessages(activeId);
    markConversationRead(activeId).then(() =>
      setConversations((prev) => prev.map((c) => (c.id === activeId ? { ...c, unreadCount: 0 } : c)))
    );
  }, [activeId]);

  useEffect(() => {
    const timer = setInterval(() => {
      loadConversations();
      if (activeId) loadMessages(activeId);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      const matchesSearch = conv.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesUnread = showUnreadOnly ? conv.unreadCount > 0 : true;
      return matchesSearch && matchesUnread;
    });
  }, [conversations, searchQuery, showUnreadOnly]);

  const activeConv = conversations.find((c) => c.id === activeId) ?? null;

  const handleSend = async () => {
    const text = msgInput.trim();
    if (!text || !activeId || sending) return;
    setSending(true);
    const res = await sendMessage(activeId, text);
    setSending(false);
    if (res.error) {
      setNotice(res.error);
      return;
    }
    setMsgInput("");
    setSelectedFile(null);
    await loadMessages(activeId);
    await loadConversations();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);
  };

  const openModal = async () => {
    setSelectedRecipientId("");
    setSubject("");
    setNewMsgText("");
    setIsModalOpen(true);
    try {
      const c = await getStudentContacts();
      setContacts(c);
      if (c[0]) setSelectedRecipientId(c[0].id);
    } catch (e) {
      setNotice((e as Error).message);
    }
  };

  const handleStartConversation = async () => {
    const recipient = contacts.find((c) => c.id === selectedRecipientId);
    if (!recipient || !newMsgText.trim() || !subject.trim() || starting) return;
    setStarting(true);
    const conv = await createDirectConversation(recipient.name);
    if (conv.error || !conv.id) {
      setStarting(false);
      setNotice(conv.error ?? "Could not start the conversation.");
      return;
    }
    const body = `[${subject.trim()}] ${newMsgText.trim()}`;
    const sent = await sendMessage(conv.id, body);
    setStarting(false);
    if (sent.error) {
      setNotice(sent.error);
      return;
    }
    setIsModalOpen(false);
    setNewMsgText("");
    setSubject("");
    await loadConversations();
    setActiveId(conv.id);
  };

  return (
    <section className={`${poppins.variable} min-h-full w-full overflow-x-hidden bg-[#f5f5f5] px-4 pb-6 pt-6 font-sans md:px-6 md:pt-7`}>
      {/* Header */}
      <div className="mb-[26px] flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-[24px] font-semibold leading-none text-[#111111]">Messages</h1>
          <p className="mt-[14px] text-[16px] font-normal leading-none text-[#666666]">Connect with your mentors and support team</p>
        </div>
        <button
          onClick={openModal}
          className="flex h-[48px] w-full items-center justify-center gap-[10px] rounded-[10px] bg-[#ffa313] px-[27px] text-[16px] font-normal text-white transition hover:bg-[#f59a0d] md:w-auto"
        >
          <Plus size={19} strokeWidth={2.2} /> New Conversation
        </button>
      </div>

      {notice && (
        <div className="mb-4 flex items-start justify-between gap-4 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-semibold text-red-700">
          <span className="break-all">{notice}</span>
          <button type="button" onClick={() => setNotice(null)} className="shrink-0 text-[13px] underline">Dismiss</button>
        </div>
      )}

      <div className="flex min-h-[642px] flex-col overflow-hidden rounded-[12px] border border-[#dddddd] bg-white lg:h-[642px] lg:flex-row">
        {/* Sidebar */}
        <div className="w-full border-b border-[#dddddd] lg:w-[320px] lg:border-b-0 lg:border-r">
          <div className="border-b border-[#dddddd] px-[16px] py-[16px]">
            <div className="relative mb-[12px]">
              <Search className="absolute left-[12px] top-1/2 -translate-y-1/2 text-[#777777]" size={20} strokeWidth={1.8} />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-[37px] w-full rounded-[9px] bg-[#f1f1f1] pl-[40px] pr-4 text-[14px] font-normal text-[#111111] outline-none placeholder:text-[#8a8a8a]"
              />
            </div>
            <button
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              className={`flex h-[36px] w-full items-center justify-center gap-[6px] rounded-[8px] text-[14px] font-normal transition-all ${showUnreadOnly ? 'bg-[#ffa313] text-white' : 'bg-[#f1f1f1] text-[#666666]'}`}
            >
              <Filter size={16} strokeWidth={1.8} /> {showUnreadOnly ? 'Showing Unread' : 'Unread Only'}
            </button>
          </div>
          <div className="max-h-[420px] overflow-y-auto lg:max-h-none">
            {loading && (
              <p className="px-[16px] py-[20px] text-[14px] text-[#777777]">Loading conversations…</p>
            )}
            {!loading && filteredConversations.length === 0 && (
              <p className="px-[16px] py-[20px] text-[14px] text-[#777777]">No conversations yet.</p>
            )}
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setActiveId(conv.id)}
                className={`flex h-[98px] cursor-pointer items-center gap-[11px] border-b border-[#e5e5e5] px-[16px] transition ${activeId === conv.id ? 'bg-[#fff8ef]' : 'hover:bg-[#fafafa]'}`}
              >
                <span className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full bg-[#ffa313] text-[16px] font-semibold text-white">
                  {conv.avatar}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="mb-[6px] flex items-start justify-between gap-2">
                    <h4 className="truncate text-[15px] font-semibold leading-none text-[#111111]">{conv.name}</h4>
                    <div className="flex shrink-0 items-center gap-[7px]">
                      <span className="text-[12px] font-normal leading-none text-[#666666]">{conv.time}</span>
                      {conv.unreadCount > 0 && (
                        <span className="flex h-[20px] min-w-[20px] items-center justify-center rounded-full bg-[#ff666c] px-[6px] text-[11px] font-semibold leading-none text-white">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="truncate text-[13px] font-normal leading-none text-[#666666]">{conv.role}</p>
                  <p className="mt-[8px] truncate text-[14px] font-normal leading-none text-[#666666]">{conv.lastMessage}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex min-w-0 flex-1 flex-col bg-white">
          {activeConv ? (
            <>
              <div className="flex h-[73px] items-center border-b border-[#dddddd] px-[20px]">
                <div className="flex items-center gap-[13px]">
                  <span className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[#ffa313] text-[15px] font-semibold text-white">
                    {activeConv.avatar}
                  </span>
                  <div>
                    <h3 className="text-[15px] font-semibold leading-none text-[#111111]">{activeConv.name}</h3>
                    <p className="mt-[7px] text-[12px] font-normal leading-none text-[#666666]">{activeConv.role}</p>
                  </div>
                </div>
              </div>

              <div ref={scrollRef} className="flex-1 space-y-[16px] overflow-y-auto px-[24px] py-[24px]">
                {messages.length === 0 && (
                  <p className="mt-[8px] text-center text-[14px] text-[#999999]">No messages yet. Say hello!</p>
                )}
                {messages.map((m) => {
                  const isMe = m.senderId === myId;
                  return (
                    <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[90%] whitespace-pre-wrap break-words rounded-[14px] px-[16px] py-[12px] text-[14px] font-normal leading-[1.35] md:max-w-[65%] ${isMe ? 'bg-[#ffa313] text-white' : 'bg-[#f1f1f1] text-[#111111]'}`}>
                        {m.text}
                      </div>
                      <span className="mt-[6px] text-[11px] font-normal leading-none text-[#666666]">{m.time}</span>
                    </div>
                  );
                })}
              </div>

              {/* Input Area */}
              <div className="border-t border-[#dddddd] px-[24px] py-[16px]">
                {selectedFile && (
                  <div className="mb-3 flex items-center gap-3 bg-gray-50 p-2 rounded-xl border border-dashed border-gray-200 w-fit">
                    <div className="bg-white p-2 rounded-lg text-[#F9A618]"><FileIcon size={16} /></div>
                    <span className="text-[12px] font-bold text-gray-600">{selectedFile.name}</span>
                    <button onClick={() => setSelectedFile(null)} className="text-red-500 hover:bg-red-50 p-1 rounded-full">
                      <X size={14} />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-[14px]">
                  <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-[36px] w-[28px] shrink-0 items-center justify-center rounded-full text-[#666666] transition-colors hover:bg-gray-100"
                  >
                    <Paperclip size={22} strokeWidth={2} />
                  </button>
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={msgInput}
                    onChange={(e) => setMsgInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    className="h-[44px] min-w-0 flex-1 rounded-[9px] bg-[#f1f1f1] px-[16px] text-[14px] font-normal text-[#111111] outline-none placeholder:text-[#8a8a8a]"
                  />
                  <button
                    onClick={handleSend}
                    disabled={sending}
                    className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[9px] bg-[#ffa313] text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-60"
                  >
                    <Send size={22} strokeWidth={2} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-[15px] text-[#777777]">
              {loading ? "Loading…" : "Select or start a conversation."}
            </div>
          )}
        </div>
      </div>

      {/* New Conversation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center overflow-hidden bg-black/40 p-4">
          <div className="flex max-h-[calc(100vh-32px)] w-full max-w-[670px] flex-col overflow-hidden rounded-[10px] bg-white shadow-2xl">
            <div className="shrink-0 px-[40px] pt-[34px]">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-[12px]">
                  <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[10px] bg-[#ffa313] text-white">
                    <MessageSquarePlus size={20} strokeWidth={2.2} />
                  </div>
                  <h3 className="text-[22px] font-normal leading-none text-[#111111]">Start New Conversation</h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="mt-[12px] text-[#666666] transition hover:text-[#111111]" aria-label="Close new conversation modal">
                  <X size={20} strokeWidth={2} />
                </button>
              </div>
              <p className="mt-[26px] max-w-[590px] text-[15px] font-normal leading-[1.35] text-[#666666]">
                Send a message to your mentor. All fields marked with * are required.
              </p>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-[40px] pb-[20px] pt-[24px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <div>
                <label className="mb-[10px] block text-[15px] font-normal leading-none text-[#666666]">To (Recipient) <span className="text-[#ff5f64]">*</span></label>
                <div className="relative">
                  <select
                    value={selectedRecipientId}
                    onChange={(e) => setSelectedRecipientId(e.target.value)}
                    className="h-[56px] w-full appearance-none rounded-[9px] border border-[#dddddd] bg-white px-[10px] pr-[40px] text-[16px] font-normal text-[#666666] outline-none transition focus:border-[#ffa313] max-[760px]:h-[48px]"
                  >
                    {contacts.length === 0 && <option value="">No mentors assigned</option>}
                    {contacts.map(r => <option key={r.id} value={r.id}>{r.name} — {r.role}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-[13px] top-1/2 -translate-y-1/2 text-[#666666]" size={20} strokeWidth={1.8} />
                </div>
              </div>

              <div className="mt-[20px]">
                <label className="mb-[10px] block text-[15px] font-normal leading-none text-[#666666]">Subject<span className="text-[#ff5f64]">*</span></label>
                <textarea
                  placeholder="Brief description of your message..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="h-[118px] w-full resize-none rounded-[9px] border border-[#dddddd] bg-white px-[15px] py-[14px] text-[16px] font-normal text-[#111111] outline-none transition placeholder:text-[#8a8a8a] focus:border-[#ffa313] max-[760px]:h-[78px]"
                />
              </div>

              <div className="mt-[20px]">
                <label className="mb-[11px] block text-[15px] font-normal leading-none text-[#666666]">Priority</label>
                <div className="grid grid-cols-2 gap-[12px] sm:grid-cols-4">
                  {['Low', 'Normal', 'High', 'Urgent'].map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setPriority(p)}
                      className={`h-[36px] rounded-[9px] text-[14px] font-normal transition-all ${priority === p ? 'bg-[#ffa313] text-white' : 'bg-[#f1f1f1] text-[#666666]'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-[20px]">
                <label className="mb-[10px] block text-[15px] font-normal leading-none text-[#666666]">Message<span className="text-[#ff5f64]">*</span></label>
                <textarea
                  placeholder="Type your message here..."
                  value={newMsgText}
                  onChange={(e) => setNewMsgText(e.target.value)}
                  className="h-[170px] w-full resize-none rounded-[9px] border border-[#dddddd] bg-white px-[15px] py-[14px] text-[16px] font-normal text-[#111111] outline-none transition placeholder:text-[#8a8a8a] focus:border-[#ffa313] max-[760px]:h-[104px]"
                />
                <p className="mt-[7px] text-[12px] font-normal leading-[1.15] text-[#666666]">{newMsgText.length}/1000 characters</p>
              </div>

              <div className="mt-[20px] rounded-[9px] bg-[#fff8ef] px-[16px] py-[17px] max-[760px]:py-[12px]">
                <p className="text-[15px] font-normal leading-[1.35] text-[#ff9f0f]">
                  <span className="font-semibold">Tip:</span>
                  <br />
                  <span>Your mentor will be notified in their inbox. The subject is added to the start of your message.</span>
                </p>
              </div>
            </div>

            <div className="grid shrink-0 grid-cols-1 gap-[12px] rounded-b-[10px] bg-white px-[40px] pb-[32px] sm:grid-cols-2 max-[760px]:pb-[20px]">
              <button onClick={() => setIsModalOpen(false)} className="h-[50px] rounded-[9px] border border-[#dddddd] bg-white px-4 text-[16px] font-normal text-[#666666] transition hover:bg-[#fafafa]">Cancel</button>
              <button
                onClick={handleStartConversation}
                disabled={!selectedRecipientId || !newMsgText.trim() || !subject.trim() || starting}
                className="h-[50px] rounded-[9px] bg-[#ffa313] px-4 text-[16px] font-normal text-white transition disabled:bg-[#dddddd] disabled:text-[#999999]"
              >
                {starting ? "Sending…" : "Send Message"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
