"use client";

import React, { useState, useMemo, useRef, ChangeEvent, FormEvent } from "react";
import { 
  Search, 
  Plus, 
  Paperclip, 
  Send, 
  X, 
  FileText,
  ChevronDown
} from "lucide-react";

/**
 * TYPES & INTERFACES
 */
interface Message {
  id: number;
  sender: string;
  text: string;
  time: string;
  type: string;
  file?: { name: string; size: number } | null;
}

interface Student {
  id: number;
  name: string;
  lastMessage: string;
  time: string;
  avatar: string;
  grade: string;
  school: string;
  unreadCount: number;
}

interface Conversations {
  [key: number]: Message[];
}

// Students available to add via Modal
const AVAILABLE_FOR_CHAT: Student[] = [
  { id: 10, name: "Matthew Jackson", lastMessage: "", time: "", avatar: "/images/avatar1.png", grade: "10th Grade", school: "Roosevelt High", unreadCount: 0 },
  { id: 11, name: "Sarah Ahmed", lastMessage: "", time: "", avatar: "/images/avatar2.png", grade: "9th Grade", school: "City School", unreadCount: 0 },
  { id: 12, name: "Zainab Malik", lastMessage: "", time: "", avatar: "/images/avatar3.png", grade: "11th Grade", school: "LGS", unreadCount: 0 },
];

const INITIAL_STUDENTS: Student[] = [
  {
    id: 1,
    name: "Marcus Johnson",
    lastMessage: "Thank you for the study",
    time: "10:30 AM",
    avatar: "/images/avatar1.png",
    grade: "9th Grade",
    school: "Lincoln High",
    unreadCount: 0,
  },
  {
    id: 2,
    name: "David Williams",
    lastMessage: "When is our next session?",
    time: "Yesterday",
    avatar: "/images/avatar2.png",
    grade: "10th Grade",
    school: "Central High",
    unreadCount: 2,
  },
  {
    id: 3,
    name: "James Brown",
    lastMessage: "I'm having trouble with the",
    time: "2 days ago",
    avatar: "/images/avatar3.png",
    grade: "8th Grade",
    school: "Washington Middle",
    unreadCount: 1,
  },
  {
    id: 4,
    name: "Michael Davis",
    lastMessage: "Got an A on my test!",
    time: "3 days ago",
    avatar: "/images/avatar.png",
    grade: "11th Grade",
    school: "Lincoln High",
    unreadCount: 0,
  },
];

const INITIAL_CONVERSATIONS: Conversations = {
  1: [
    { id: 101, sender: "Marcus Johnson", text: "Hi Mr. Mentor, do you have any extra practice problems for quadratic equations?", time: "10:15 AM", type: "text" },
    { id: 102, sender: "Me", text: "Of course! I'll send you a PDF with 20 practice problems covering different difficulty levels.", time: "10:20 AM", type: "text" },
    { id: 103, sender: "Marcus Johnson", text: "Thank you for the study materials!", time: "10:30 AM", type: "text" },
  ],
};

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
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [conversations, setConversations] = useState<Conversations>(INITIAL_CONVERSATIONS);
  const [selectedStudentId, setSelectedStudentId] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal State
  const [selectedNewStudent, setSelectedNewStudent] = useState<Student | null>(null);
  const [initialMsg, setInitialMsg] = useState("");

  const selectedStudent = useMemo(() => 
    students.find(s => s.id === selectedStudentId) || students[0], 
    [selectedStudentId, students]
  );

  const filteredStudents = useMemo(() => 
    students.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())), 
    [students, searchQuery]
  );

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !attachedFile) return;

    const newMessage: Message = {
      id: Date.now(),
      sender: "Me",
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: "text",
      file: attachedFile ? { name: attachedFile.name, size: attachedFile.size } : null
    };

    setConversations(prev => ({
      ...prev,
      [selectedStudentId]: [...(prev[selectedStudentId] || []), newMessage]
    }));

    setInputText("");
    setAttachedFile(null);

    // Auto Response Simulation
    setTimeout(() => {
      const autoResponse: Message = {
        id: Date.now() + 1,
        sender: selectedStudent.name,
        text: "Ji, maine aapka message receive kar liya hai. Shukriya!",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: "text"
      };
      setConversations(prev => ({
        ...prev,
        [selectedStudentId]: [...(prev[selectedStudentId] || []), autoResponse]
      }));
    }, 1500);
  };

  const handleAddStudentChat = () => {
    if (!selectedNewStudent || !initialMsg.trim()) return;
    
    const newId = selectedNewStudent.id;
    
    // Switch to chat if student already exists
    if (students.find(s => s.id === newId)) {
        setIsModalOpen(false);
        setSelectedStudentId(newId);
        return;
    }

    const newEntry: Student = {
      ...selectedNewStudent,
      lastMessage: initialMsg,
      time: "Just now",
    };

    setStudents([newEntry, ...students]);
    setConversations(prev => ({
      ...prev,
      [newId]: [{ id: Date.now(), sender: "Me", text: initialMsg, time: "Just now", type: "text" }]
    }));

    setSelectedNewStudent(null);
    setInitialMsg("");
    setIsModalOpen(false);
    setSelectedStudentId(newId);
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
            onClick={() => {
              setSelectedNewStudent(AVAILABLE_FOR_CHAT[0]);
              setInitialMsg("");
              setIsModalOpen(true);
            }}
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
          {filteredStudents.map((student) => (
            <button
              key={student.id}
              onClick={() => setSelectedStudentId(student.id)}
              className={`flex h-[93px] w-full items-center gap-[12px] border-b border-[#e5e5e5] px-[18px] text-left transition-all ${
                selectedStudentId === student.id ? "bg-[#ffa313] text-white" : "bg-white hover:bg-[#f7f7f7]"
              }`}
            >
              <img src={student.avatar} alt="" className="h-[40px] w-[40px] rounded-full object-cover" />
              <div className="min-w-0 flex-1">
                <div className="mb-[7px] flex items-center justify-between gap-2">
                  <span className="truncate text-[16px] font-normal leading-none">{student.name}</span>
                  {student.unreadCount > 0 && (
                    <span className="flex h-[20px] min-w-[20px] items-center justify-center rounded-full bg-[#ffa313] px-[6px] text-[12px] font-semibold text-white">
                      {student.unreadCount}
                    </span>
                  )}
                </div>
                <p className={`truncate text-[14px] font-normal leading-none ${selectedStudentId === student.id ? "text-white" : "text-[#666666]"}`}>{student.lastMessage}</p>
                <p className={`mt-[8px] text-[12px] font-normal leading-none ${selectedStudentId === student.id ? "text-white" : "text-[#666666]"}`}>{student.time}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-r-[8px] border border-[#dddddd] bg-white">
        {/* Chat Header */}
        <div className="flex h-[72px] shrink-0 items-center gap-[14px] border-b border-[#dddddd] bg-white px-[18px]">
          <img src={selectedStudent.avatar} className="h-[40px] w-[40px] rounded-full object-cover" alt="" />
          <div>
            <h3 className="text-[20px] font-semibold leading-none text-[#111111]">{selectedStudent.name}</h3>
            <p className="mt-[7px] text-[12px] font-normal leading-none text-[#666666]">{selectedStudent.grade.replace(" Grade", "")} Grade &bull; {selectedStudent.school}</p>
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto px-[25px] py-[24px]">
          {(conversations[selectedStudentId] || []).map((msg) => (
            <div key={msg.id} className={`mb-[24px] flex flex-col ${msg.sender === "Me" ? "items-end" : "items-start"}`}>
              {msg.sender !== "Me" && <span className="mb-[7px] text-[13px] font-normal leading-none text-[#666666]">{msg.sender}</span>}
              <div className={`max-w-[56%] rounded-[9px] px-[16px] py-[14px] text-[15px] font-normal leading-[1.35] ${
                msg.sender === "Me" 
                  ? "bg-[#ffa313] text-white" 
                  : "bg-[#f1f1f1] text-[#111111]"
              }`}>
                {msg.text}
                {msg.file && (
                  <div className={`mt-3 p-2.5 rounded-lg flex items-center gap-3 border ${
                    msg.sender === 'Me' ? 'bg-white/10 border-white/20' : 'bg-gray-50 border-gray-100'
                  }`}>
                    <FileText size={18} className={msg.sender === 'Me' ? "text-white" : "text-red-500"} />
                    <span className="text-[12px] font-medium truncate max-w-[200px]">{msg.file.name}</span>
                  </div>
                )}
              </div>
              <span className="mt-[7px] text-[12px] font-normal leading-none text-[#666666]">{msg.time}</span>
            </div>
          ))}
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
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="hidden"
              >
                <Paperclip size={20} />
              </button>
              <input 
                type="text" 
                placeholder="Type a message..."
                className="h-[44px] w-full rounded-[8px] border border-[#dddddd] bg-white px-[16px] text-[16px] font-normal text-[#2d3b4f] outline-none placeholder:text-[#9aa3af] focus:border-[#ffa313]"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileChange}
              />
            </div>
            <button 
              type="submit"
              className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[9px] bg-[#ffa313] text-white transition-all hover:bg-[#f59a0d] active:scale-95"
            >
              <Send size={22} strokeWidth={1.8} />
            </button>
            {attachedFile && (
              <FilePreview file={attachedFile} onRemove={() => setAttachedFile(null)} />
            )}
          </form>
        </div>
      </div>

      {/* Modal - Dropdown Selection to Add Student */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Start New Conversation"
      >
        <div className="px-[24px] pb-[24px] pt-[27px]">
          <div>
            <label className="mb-[10px] block text-[14px] font-normal leading-none text-[#657183]">Select Student <span className="text-[#ff4d4f]">*</span></label>
            <div className="relative">
              <span className="pointer-events-none absolute left-[13px] top-1/2 -translate-y-1/2 text-[#657183]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </span>
              <select 
                className="h-[43px] w-full appearance-none rounded-[8px] border border-[#d6dce3] bg-white pl-[38px] pr-[42px] text-[16px] font-normal text-[#2d3b4f] outline-none focus:border-[#ffa313]"
                value={selectedNewStudent?.id ?? ""}
                onChange={(e) => {
                    const student = AVAILABLE_FOR_CHAT.find(s => s.id === parseInt(e.target.value));
                    setSelectedNewStudent(student || null);
                }}
              >
                <option value="" disabled>Matthew Jackson</option>
                {AVAILABLE_FOR_CHAT.map(s => (
                    <option key={s.id} value={s.id}>{s.name} — {s.school}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-[13px] top-1/2 -translate-y-1/2 text-[#657183]" size={20} strokeWidth={1.8} />
            </div>
          </div>

          <div className="hidden">
          {selectedNewStudent && (
            <div className="flex items-center gap-3 p-3 bg-[#f4a11d]/5 rounded-xl border border-[#f4a11d]/10 animate-in fade-in">
                <img src={selectedNewStudent.avatar} className="w-10 h-10 rounded-full object-cover" alt="" />
                <div>
                    <p className="text-sm font-bold text-gray-800">{selectedNewStudent.name}</p>
                    <p className="text-xs text-gray-500">{selectedNewStudent.grade} • {selectedNewStudent.school}</p>
                </div>
            </div>
          )}
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
              onClick={handleAddStudentChat}
              disabled={!selectedNewStudent || !initialMsg.trim()}
              className="flex h-[40px] w-[181px] items-center justify-center gap-[6px] rounded-[8px] bg-[#ffa313] text-[14px] font-semibold text-white transition hover:bg-[#f59a0d] disabled:opacity-50"
            >
              <Send size={17} strokeWidth={1.8} /> Start Conversation
            </button>
          </div>
      </Modal>
    </div>
  );
}
