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
  Download,
  MessageSquarePlus
} from 'lucide-react';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
});

// --- Constants ---
const AVATAR_MAP: Record<string, string> = {
  m1: "/images/avatar.png",
  m2: "/images/avatar1.png",
  m3: "/images/avatar2.png",
  m4: "/images/avatar3.png",
  m5: "/images/mentor1.png",
};

const RECIPIENTS_LIST = [
  { id: 'm1', name: "Dr. Sarah Mitchell", role: "Senior Career Counselor", avatar: AVATAR_MAP.m1 },
  { id: 'm2', name: "Prof. James Wilson", role: "Academic Advisor", avatar: AVATAR_MAP.m2 },
  { id: 'm3', name: "Mentorship & Scholarship Group", role: "83 Member", avatar: AVATAR_MAP.m3 },
  { id: 'm4', name: "Admin Office", role: "Administration", avatar: AVATAR_MAP.m4 },
  { id: 'm5', name: "Student Support", role: "Support Team", avatar: AVATAR_MAP.m5 },
];

const INITIAL_CONVERSATIONS = [
  { 
    id: 'm1', 
    name: "Dr. Sarah Mitchell", 
    role: "Senior Career Counselor", 
    avatar: AVATAR_MAP.m1, 
    lastMsg: "Looking forward to our...", 
    time: "10m ago", 
    unread: 2,
    messages: [
      { id: 1, text: "Hi Alex! I hope you're doing well. I wanted to remind you about our session today at 2 PM.", time: "10:30 AM", isMe: false },
      { id: 2, text: "Thank you Dr. Mitchell! I'll be there. Should I bring anything special?", time: "10:35 AM", isMe: true },
      { id: 3, text: "Yes, please bring your progress report and any questions you might have about your career goals.", time: "10:40 AM", isMe: false },
      { id: 4, text: "Perfect! I have my report ready and a few questions about internship opportunities.", time: "10:45 AM", isMe: true },
      { id: 5, text: "Excellent! Looking forward to discussing those opportunities with you. See you soon!", time: "10:50 AM", isMe: false },
    ]
  },
  { 
    id: 'm2', 
    name: "Prof. James Wilson", 
    role: "Academic Advisor", 
    avatar: AVATAR_MAP.m2, 
    lastMsg: "Great work on your last...", 
    time: "1h ago", 
    unread: 0,
    messages: [{ id: 1, text: "Great work on your last assignment!", time: "11:00 AM", isMe: false }]
  },
  {
    id: 'm3',
    name: "Mentorship & Scholarship Group",
    role: "83 Member",
    avatar: AVATAR_MAP.m3,
    lastMsg: "Great work on your last...",
    time: "1h ago",
    unread: 0,
    messages: [{ id: 1, text: "Great work on your last milestone, everyone.", time: "9:15 AM", isMe: false }]
  },
  {
    id: 'm4',
    name: "Admin Office",
    role: "Administration",
    avatar: AVATAR_MAP.m4,
    lastMsg: "Reminder: Monthly attend...",
    time: "2h ago",
    unread: 1,
    messages: [{ id: 1, text: "Reminder: Monthly attendance verification is due soon.", time: "8:30 AM", isMe: false }]
  },
  {
    id: 'm5',
    name: "Student Support",
    role: "Support Team",
    avatar: AVATAR_MAP.m5,
    lastMsg: "How can we help you today?",
    time: "Yesterday",
    unread: 0,
    messages: [{ id: 1, text: "How can we help you today?", time: "Yesterday", isMe: false }]
  }
];

const STORAGE_KEY = 'student_messages_v2';

const avatarFor = (conversation: any) => AVATAR_MAP[conversation?.id] || conversation?.avatar || "/images/avatar.png";

const normalizeConversations = (items: any[]) =>
  items.map((item) => ({
    ...item,
    avatar: avatarFor(item),
  }));

export default function MessagingSection() {
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const [activeId, setActiveId] = useState(INITIAL_CONVERSATIONS[0]?.id);
  const [hasLoadedMessages, setHasLoadedMessages] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [msgInput, setMsgInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  
  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Modal States
  const [selectedRecipientId, setSelectedRecipientId] = useState("");
  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState("Normal");
  const [newMsgText, setNewMsgText] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setConversations(normalizeConversations(parsed));
          setActiveId(parsed[0]?.id);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setHasLoadedMessages(true);
  }, []);

  useEffect(() => {
    if (hasLoadedMessages) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    }
  }, [conversations, hasLoadedMessages]);

  const filteredConversations = useMemo(() => {
    return conversations.filter((conv: any) => {
      const matchesSearch = conv.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesUnread = showUnreadOnly ? conv.unread > 0 : true;
      return matchesSearch && matchesUnread;
    });
  }, [conversations, searchQuery, showUnreadOnly]);

  const activeConv = conversations.find((c: any) => c.id === activeId) || conversations[0];

  const handleSend = (text: string, file?: File | null) => {
    if (!text.trim() && !file) return;

    let fileData = null;
    if (file) {
      // In real app, you'd upload to server. Here we create a preview URL.
      fileData = {
        name: file.name,
        size: (file.size / 1024).toFixed(1) + " KB",
        type: file.type,
        url: URL.createObjectURL(file)
      };
    }

    const newMsg = {
      id: Date.now(),
      text: text.trim(),
      file: fileData,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };

    setConversations((prev: any) => prev.map((c: any) => 
      c.id === activeId ? { 
        ...c, 
        messages: [...c.messages, newMsg], 
        lastMsg: text || (file ? `File: ${file.name}` : ""), 
        time: "Just now" 
      } : c
    ));

    setMsgInput("");
    setSelectedFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleStartConversation = () => {
    if (!selectedRecipientId || !newMsgText.trim()) return;
    const recipient = RECIPIENTS_LIST.find(r => r.id === selectedRecipientId);
    
    const exists = conversations.find((c: any) => c.id === selectedRecipientId);
    if (exists) {
      handleSend(`[${subject}] ${newMsgText}`);
      setActiveId(selectedRecipientId);
    } else if (recipient) {
      const newConv = {
        ...recipient,
        lastMsg: newMsgText,
        time: "Just now",
        unread: 0,
        messages: [{
          id: Date.now(),
          text: `Subject: ${subject}\n\n${newMsgText}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMe: true
        }]
      };
      setConversations([newConv, ...conversations]);
      setActiveId(selectedRecipientId);
    }
    
    setIsModalOpen(false);
    setNewMsgText("");
    setSubject("");
    setSelectedRecipientId("");
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
          onClick={() => setIsModalOpen(true)}
          className="flex h-[48px] w-full items-center justify-center gap-[10px] rounded-[10px] bg-[#ffa313] px-[27px] text-[16px] font-normal text-white transition hover:bg-[#f59a0d] md:w-auto"
        >
          <Plus size={19} strokeWidth={2.2} /> New Conversation
        </button>
      </div>

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
            {filteredConversations.map((conv: any) => (
              <div 
                key={conv.id}
                onClick={() => { setActiveId(conv.id); setConversations((p: any) => p.map((c: any) => c.id === conv.id ? {...c, unread: 0} : c)); }}
                className={`flex h-[98px] cursor-pointer items-center gap-[11px] border-b border-[#e5e5e5] px-[16px] transition ${activeId === conv.id ? 'bg-[#fff8ef]' : 'hover:bg-[#fafafa]'}`}
              >
                <img
                  src={avatarFor(conv)}
                  className="h-[48px] w-[48px] shrink-0 rounded-full bg-[#f1f1f1] object-cover"
                  alt={conv.name}
                />
                <div className="flex-1 min-w-0">
                  <div className="mb-[6px] flex items-start justify-between gap-2">
                    <h4 className="truncate text-[15px] font-semibold leading-none text-[#111111]">{conv.id === 'm1' ? 'Dr. Sarah M' : conv.name}</h4>
                    <div className="flex shrink-0 items-center gap-[7px]">
                      <span className="text-[12px] font-normal leading-none text-[#666666]">{conv.time}</span>
                      {conv.unread > 0 && (
                        <span className="flex h-[20px] min-w-[20px] items-center justify-center rounded-full bg-[#ff666c] px-[6px] text-[11px] font-semibold leading-none text-white">
                          {conv.unread}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="truncate text-[13px] font-normal leading-none text-[#666666]">{conv.role}</p>
                  <p className="mt-[8px] truncate text-[14px] font-normal leading-none text-[#666666]">{conv.lastMsg}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex min-w-0 flex-1 flex-col bg-white">
          {activeConv && (
            <>
              <div className="flex h-[73px] items-center border-b border-[#dddddd] px-[20px]">
                <div className="flex items-center gap-[13px]">
                  <img
                    src={avatarFor(activeConv)}
                    className="h-[42px] w-[42px] rounded-full bg-[#f1f1f1] object-cover"
                    alt={activeConv.name}
                  />
                  <div>
                    <h3 className="text-[15px] font-semibold leading-none text-[#111111]">{activeConv.name}</h3>
                    <p className="mt-[7px] text-[12px] font-normal leading-none text-[#666666]">{activeConv.role}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 space-y-[16px] overflow-y-auto px-[24px] py-[24px]">
                {activeConv.messages.map((m: any) => (
                  <div key={m.id} className={`flex flex-col ${m.isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[90%] rounded-[14px] px-[16px] py-[12px] text-[14px] font-normal leading-[1.35] md:max-w-[65%] ${m.isMe ? 'bg-[#ffa313] text-white' : 'bg-[#f1f1f1] text-[#111111]'}`}>
                      {/* Text content */}
                      {m.text && <p className="whitespace-pre-wrap">{m.text}</p>}
                      
                      {/* File content preview */}
                      {m.file && (
                        <div className={`mt-2 p-3 rounded-xl border flex items-center gap-3 ${m.isMe ? 'bg-orange-600/20 border-orange-400' : 'bg-white border-gray-200'}`}>
                          {m.file.type.startsWith('image/') ? (
                            <img src={m.file.url} className="w-12 h-12 rounded object-cover" alt="attachment" />
                          ) : (
                            <div className="bg-white/20 p-2 rounded"><FileIcon size={20} /></div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-bold truncate">{m.file.name}</p>
                            <p className="text-[10px] opacity-70">{m.file.size}</p>
                          </div>
                          <a href={m.file.url} download={m.file.name} className="p-1.5 hover:bg-black/10 rounded-full transition-colors">
                            <Download size={16} />
                          </a>
                        </div>
                      )}
                    </div>
                    <span className="mt-[6px] text-[11px] font-normal leading-none text-[#666666]">{m.time}</span>
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <div className="border-t border-[#dddddd] px-[24px] py-[16px]">
                {/* Selected File Preview */}
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
                  <input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileChange}
                  />
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
                    onKeyDown={(e) => e.key === 'Enter' && handleSend(msgInput, selectedFile)}
                    className="h-[44px] min-w-0 flex-1 rounded-[9px] bg-[#f1f1f1] px-[16px] text-[14px] font-normal text-[#111111] outline-none placeholder:text-[#8a8a8a]"
                  />
                  <button 
                    onClick={() => handleSend(msgInput, selectedFile)} 
                    className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[9px] bg-[#ffa313] text-white transition-all hover:scale-105 active:scale-95"
                  >
                    <Send size={22} strokeWidth={2} />
                  </button>
                </div>
              </div>
            </>
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
                Send a message to your mentor, advisor, or support team. All fields marked with * are required.
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
                    <option value="">Select recipient...</option>
                    {RECIPIENTS_LIST.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
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
                <p className="mt-[7px] text-[12px] font-normal leading-[1.15] text-[#666666]">{newMsgText.length}/1000<br />characters</p>
              </div>

              <div className="mt-[12px]">
                <p className="mb-[11px] text-[15px] font-normal leading-none text-[#666666]">Quick Templates (Optional)</p>
                <div className="grid grid-cols-1 gap-[8px] sm:grid-cols-2">
                  {['Session Inquiry', 'Progress Update', 'Question', 'Need Help'].map((template) => (
                    <button
                      type="button"
                      key={template}
                      className="h-[36px] rounded-[9px] bg-[#f1f1f1] px-4 text-[14px] font-normal text-[#666666] transition hover:bg-[#ededed]"
                    >
                      {template}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-[20px] rounded-[9px] bg-[#fff8ef] px-[16px] py-[17px] max-[760px]:py-[12px]">
                <p className="text-[15px] font-normal leading-[1.35] text-[#ff9f0f]">
                  <span className="font-semibold">Tip:</span>
                  <br />
                  <span>Your recipient will be notified immediately. For urgent matters, please also consider using the priority flag or contacting through your mentor's direct channel.</span>
                </p>
              </div>
            </div>

            <div className="grid shrink-0 grid-cols-1 gap-[12px] rounded-b-[10px] bg-white px-[40px] pb-[32px] sm:grid-cols-2 max-[760px]:pb-[20px]">
              <button onClick={() => setIsModalOpen(false)} className="h-[50px] rounded-[9px] border border-[#dddddd] bg-white px-4 text-[16px] font-normal text-[#666666] transition hover:bg-[#fafafa]">Cancel</button>
              <button 
                onClick={handleStartConversation}
                disabled={!selectedRecipientId || !newMsgText.trim() || !subject.trim()}
                className="h-[50px] rounded-[9px] bg-[#ffa313] px-4 text-[16px] font-normal text-white transition disabled:bg-[#dddddd] disabled:text-[#999999]"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
