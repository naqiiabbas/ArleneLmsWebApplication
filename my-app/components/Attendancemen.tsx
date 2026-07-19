"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Calendar,
  Download,
  Eye,
  MessageSquare,
  X,
  ChevronDown,
  Send,
  Check,
  BookOpen,
  Clock,
  User
} from "lucide-react";
import html2canvas from "html2canvas";
import { getMentorAttendance, updateMentorAttendance } from "@/lib/data/mentor";
import type { MentorAttendanceRow } from "@/lib/data/mentor.types";

/**
 * MODAL COMPONENT (Exact Design from Screenshots)
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#000000]/50 p-4 font-poppins">
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

export default function AttendanceManagement() {
  const [attendance, setAttendance] = useState<MentorAttendanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState("");
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const [activeModal, setActiveModal] = useState<"edit" | "view" | "message" | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<MentorAttendanceRow | null>(null);

  const [editStatus, setEditStatus] = useState<MentorAttendanceRow["status"]>("Present");
  const [editNotes, setEditNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [messageText, setMessageText] = useState("");

  useEffect(() => {
    getMentorAttendance()
      .then(setAttendance)
      .catch((e) => setNotice((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  const filteredData = useMemo(() => {
    if (!filterDate) return attendance;
    return attendance.filter(item => item.date === filterDate);
  }, [attendance, filterDate]);

  const stats = useMemo(() => ({
    total: filteredData.length,
    present: filteredData.filter(i => i.status === "Present").length,
    absent: filteredData.filter(i => i.status === "Absent").length
  }), [filteredData]);

  // JPG Export Logic - Final Fix
  const handleExportJPG = async () => {
    if (tableContainerRef.current) {
      try {
        const canvas = await html2canvas(tableContainerRef.current, {
          scale: 2,
          backgroundColor: "#F8F9FA",
          useCORS: true,
          logging: false,
          allowTaint: true,
        });
        const link = document.createElement("a");
        link.download = `attendance-report-${new Date().toLocaleDateString()}.jpg`;
        link.href = canvas.toDataURL("image/jpeg", 0.9);
        link.click();
      } catch (err) {
        console.error("Export Error:", err);
      }
    }
  };

  const handleUpdateAttendance = async () => {
    if (!selectedRecord || saving) return;
    setSaving(true);
    const res = await updateMentorAttendance(selectedRecord.id, editStatus, editNotes);
    setSaving(false);
    if (res.error) {
      setNotice(res.error);
      return;
    }
    setAttendance(prev => prev.map(item =>
      item.id === selectedRecord.id ? { ...item, status: editStatus, notes: editNotes } : item
    ));
    setActiveModal(null);
  };

  // Local edit of the inline notes field (persisted on blur).
  const handleInlineNotes = (id: string, notes: string) => {
    setAttendance(prev => prev.map(item => item.id === id ? { ...item, notes } : item));
  };

  const handleInlineNotesSave = async (row: MentorAttendanceRow) => {
    const res = await updateMentorAttendance(row.id, row.status, row.notes);
    if (res.error) setNotice(res.error);
  };

  const handleSendMessage = () => {
    if (!selectedRecord || !messageText.trim()) return;
    const newMessage = {
      id: Date.now(),
      recipientId: selectedRecord.id,
      recipientName: selectedRecord.name,
      avatar: selectedRecord.avatar,
      text: messageText,
      timestamp: new Date().toISOString(),
      type: 'sent'
    };
    const existingChat = JSON.parse(localStorage.getItem("dashboard_chats") || "[]");
    localStorage.setItem("dashboard_chats", JSON.stringify([...existingChat, newMessage]));
    setMessageText("");
    setActiveModal(null);
    alert(`Message sent to ${selectedRecord.name}!`);
  };

  return (
    <div className="min-h-screen w-full bg-[#f4f4f4] px-4 pb-[32px] pt-[28px] font-poppins md:px-6">
      {/* Header Section */}
      <div className="mb-[25px] flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[30px] font-bold leading-none tracking-[-0.02em] text-[#111111]">Attendance Management</h1>
          <p className="mt-[10px] text-[14px] font-normal leading-none text-[#666666]">Track and manage session attendance</p>
        </div>
        <div className="flex flex-col gap-[10px] sm:flex-row">
          <div className="relative h-[41px] w-full sm:w-[149px]">
            <div className="pointer-events-none flex h-full w-full items-center gap-[8px] rounded-[10px] border border-[#d6d6d6] bg-white px-[16px] text-[14px] font-semibold text-[#666666]">
              <img
                src="/images/mentor-attendance-calendar.svg"
                alt=""
                aria-hidden="true"
                className="h-[18px] w-[18px]"
              />
              <span>Filter by Date</span>
            </div>
            <input 
              type="date"
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              aria-label="Filter by Date"
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
          <button 
            onClick={handleExportJPG}
            className="flex h-[41px] w-full items-center justify-center gap-[9px] rounded-[10px] bg-[#ffa313] px-[26px] text-[14px] font-semibold text-white transition-all hover:bg-[#f59a0d] sm:w-[134px]"
          >
            <Download size={16} strokeWidth={2} />
            Export
          </button>
        </div>
      </div>

      {notice && (
        <div className="mb-[20px] rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-semibold text-red-700">
          {notice}
        </div>
      )}

      {/* Table Section */}
      <div ref={tableContainerRef} className="mb-[25px] overflow-hidden rounded-[8px] border border-[#dddddd] bg-white">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[#dddddd] bg-[#fbfbfb]">
              <th className="px-[70px] py-[19px] text-[16px] font-semibold leading-none text-[#666666]">Date</th>
              <th className="px-[20px] py-[19px] text-[16px] font-semibold leading-none text-[#666666]">Student</th>
              <th className="px-[20px] py-[19px] text-[16px] font-semibold leading-none text-[#666666]">Session</th>
              <th className="px-[20px] py-[19px] text-[16px] font-semibold leading-none text-[#666666]">Status</th>
              <th className="px-[20px] py-[19px] text-[16px] font-semibold leading-none text-[#666666]">Notes</th>
              <th className="px-[20px] py-[19px] text-[16px] font-semibold leading-none text-[#666666]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="py-[28px] text-center text-[15px] text-[#666666]">Loading attendance…</td></tr>
            )}
            {!loading && filteredData.length === 0 && (
              <tr><td colSpan={6} className="py-[28px] text-center text-[15px] text-[#666666]">No attendance records for your students yet.</td></tr>
            )}
            {filteredData.map((row) => (
              <tr key={row.id} className="border-b border-[#e5e5e5] last:border-b-0">
                <td className="px-[70px] py-[16px] text-[16px] font-normal leading-none text-[#111111]">{row.date}</td>
                <td className="px-[20px] py-[16px]">
                  <div className="flex items-center gap-[13px]">
                    <img src={row.avatar} alt="" className="h-[32px] w-[32px] rounded-full object-cover" />
                    <span className="text-[16px] font-normal leading-none text-[#111111]">{row.name}</span>
                  </div>
                </td>
                <td className="px-[20px] py-[16px] text-[16px] font-normal leading-none text-[#666666]">{row.session}</td>
                <td className="px-[20px] py-[16px]">
                  <span className={`inline-flex h-[29px] items-center rounded-full px-[13px] text-[16px] font-normal leading-none ${
                    row.status === "Present" ? "bg-[#dff9ea] text-[#009d4c]" :
                    row.status === "Absent" ? "bg-[#ffe3e6] text-[#ff001a]" :
                    row.status === "Late" ? "bg-[#e7f0ff] text-[#0054ff]" : "bg-[#fff4c6] text-[#c98600]"
                  }`}>
                    {row.status}
                  </span>
                </td>
                <td className="px-[20px] py-[16px]">
                  <input
                    value={row.notes}
                    onChange={(e) => handleInlineNotes(row.id, e.target.value)}
                    onBlur={() => handleInlineNotesSave(row)}
                    placeholder="Add notes..."
                    className="h-[35px] w-[200px] rounded-[8px] border border-[#dddddd] bg-white px-[12px] text-[15px] font-normal text-[#111111] outline-none placeholder:text-[#9aa3af] focus:border-[#ffa313]"
                  />
                </td>
                <td className="px-[20px] py-[16px]">
                  <div className="flex items-center gap-[20px]">
                    <button onClick={() => { setSelectedRecord(row); setEditStatus(row.status); setEditNotes(row.notes); setActiveModal("edit"); }} className="flex h-[18px] w-[18px] items-center justify-center transition hover:scale-110" aria-label="Edit attendance">
                      <img src="/images/mentor-attendance-edit.svg" alt="" aria-hidden="true" className="h-[16px] w-[16px]" />
                    </button>
                    <button onClick={() => { setSelectedRecord(row); setActiveModal("view"); }} className="text-[#666666] transition hover:scale-110" aria-label="View attendance"><Eye size={17} strokeWidth={2} /></button>
                    <button onClick={() => { setSelectedRecord(row); setActiveModal("message"); }} className="text-[#00a651] transition hover:scale-110" aria-label="Message student"><MessageSquare size={17} strokeWidth={2} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 gap-[16px] md:grid-cols-3">
        <div className="min-h-[111px] rounded-[8px] border border-[#dddddd] bg-white px-[24px] py-[27px]">
          <p className="text-[14px] font-normal leading-none text-[#666666]">Total Sessions</p>
          <h4 className="mt-[16px] text-[30px] font-normal leading-none text-[#ffa313]">{stats.total}</h4>
        </div>
        <div className="min-h-[111px] rounded-[8px] border border-[#dddddd] bg-white px-[24px] py-[27px]">
          <p className="text-[14px] font-normal leading-none text-[#666666]">Present</p>
          <h4 className="mt-[16px] text-[30px] font-normal leading-none text-[#00a651]">{stats.present}</h4>
        </div>
        <div className="min-h-[111px] rounded-[8px] border border-[#dddddd] bg-white px-[24px] py-[27px]">
          <p className="text-[14px] font-normal leading-none text-[#666666]">Absent</p>
          <h4 className="mt-[16px] text-[30px] font-normal leading-none text-[#ff001a]">{stats.absent}</h4>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={activeModal === "edit"} onClose={() => setActiveModal(null)} title="Edit Attendance">
        {selectedRecord && (
          <>
          <div className="px-[24px] pb-[22px] pt-[25px]">
            <div className="mb-[20px] flex items-center gap-[12px]">
              <img src={selectedRecord.avatar} className="h-[40px] w-[40px] rounded-full object-cover" alt="" />
              <div>
                <h4 className="text-[15px] font-semibold leading-none text-[#2d3b4f]">{selectedRecord.name}</h4>
                <p className="mt-[6px] text-[13px] font-normal leading-none text-[#657183]">{selectedRecord.session}</p>
              </div>
            </div>
            <div className="mb-[19px]">
              <label className="mb-[9px] block text-[14px] font-normal leading-none text-[#657183]">Date</label>
              <div className="flex h-[48px] w-full items-center rounded-[8px] bg-[#f7f8fa] px-[13px] text-[16px] font-normal text-[#2d3b4f]">{selectedRecord.date}</div>
            </div>
            <div className="mb-[20px]">
              <label className="mb-[9px] block text-[14px] font-normal leading-none text-[#657183]">Status <span className="text-[#ff4d4f]">*</span></label>
              <div className="relative">
                <select
                  className="h-[48px] w-full appearance-none rounded-[8px] border border-[#d6d6d6] bg-white px-[13px] pr-[42px] text-[16px] font-normal text-[#2d3b4f] outline-none focus:border-[#ffa313]"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as MentorAttendanceRow["status"])}
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Late">Late</option>
                  <option value="Pending">Pending</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-[13px] top-1/2 -translate-y-1/2 text-[#657183]" size={20} strokeWidth={1.8} />
              </div>
            </div>
            <div>
              <label className="mb-[9px] block text-[14px] font-normal leading-none text-[#657183]">Notes</label>
              <textarea 
                className="h-[120px] w-full resize-none rounded-[8px] border border-[#d6d6d6] bg-white px-[16px] py-[15px] text-[16px] font-normal text-[#2d3b4f] outline-none placeholder:text-[#9aa3af] focus:border-[#ffa313]"
                rows={4}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Add any relevant notes about attendance..."
              />
            </div>
          </div>
          <div className="flex h-[92px] items-center justify-end gap-[10px] border-t border-[#dddddd] px-[24px]">
            <button onClick={() => setActiveModal(null)} className="h-[42px] w-[99px] rounded-[8px] border border-[#d6d6d6] bg-white text-[14px] font-semibold text-[#2d3b4f] transition hover:bg-[#f7f7f7]">Cancel</button>
            <button onClick={handleUpdateAttendance} disabled={saving} className="flex h-[42px] w-[177px] items-center justify-center gap-[8px] rounded-[8px] bg-[#ffa313] text-[14px] font-semibold text-white transition hover:bg-[#f59a0d] disabled:opacity-60">
              <Check size={17} strokeWidth={2} /> {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
          </>
        )}
      </Modal>

      {/* Message Modal */}
      <Modal isOpen={activeModal === "message"} onClose={() => setActiveModal(null)} title="Send Message">
        {selectedRecord && (
          <>
          <div className="px-[24px] pb-[24px] pt-[24px]">
            <div className="mb-[20px] flex min-h-[72px] items-center gap-[12px] rounded-[8px] bg-[#f7f8fa] px-[16px]">
              <img src={selectedRecord.avatar} className="h-[40px] w-[40px] rounded-full object-cover" alt="" />
              <div>
                <h4 className="text-[15px] font-semibold leading-none text-[#2d3b4f]">{selectedRecord.name}</h4>
                <p className="mt-[7px] text-[13px] font-normal leading-none text-[#657183]">{selectedRecord.session} &bull; {selectedRecord.date}</p>
              </div>
            </div>
            <label className="mb-[10px] block text-[14px] font-normal leading-none text-[#657183]">Message <span className="text-[#ff4d4f]">*</span></label>
            <textarea
              className="h-[169px] w-full resize-none rounded-[8px] border border-[#d6d6d6] bg-white px-[16px] py-[16px] text-[16px] font-normal text-[#2d3b4f] outline-none placeholder:text-[#9aa3af] focus:border-[#ffa313]"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type your message regarding attendance..."
            />
          </div>
          <div className="flex h-[66px] items-center justify-end gap-[10px] border-t border-[#dddddd] px-[24px]">
            <button onClick={() => setActiveModal(null)} className="h-[42px] w-[99px] rounded-[8px] border border-[#d6d6d6] bg-white text-[14px] font-semibold text-[#2d3b4f] transition hover:bg-[#f7f7f7]">Cancel</button>
            <button onClick={handleSendMessage} className="flex h-[42px] w-[177px] items-center justify-center gap-[8px] rounded-[8px] bg-[#ffa313] text-[14px] font-semibold text-white transition hover:bg-[#f59a0d]">
              <Send size={18} strokeWidth={1.8} /> Send Message
            </button>
          </div>
          <div className="hidden">
            <div className="flex items-center gap-4 p-4 bg-[#F8FAFC] rounded-2xl border border-[#F1F5F9]">
              <img src={selectedRecord.avatar} className="w-12 h-12 rounded-full object-cover" alt="" />
              <div>
                <h4 className="font-bold text-[#1A202C]">{selectedRecord.name}</h4>
                <p className="text-[12px] text-[#718096]">{selectedRecord.session} • {selectedRecord.date}</p>
              </div>
            </div>
            <textarea 
              className="w-full bg-white border border-[#EDF2F7] rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-[#f4a11d]/10 outline-none resize-none"
              rows={5}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type message..."
            />
            <div className="flex gap-4">
              <button onClick={() => setActiveModal(null)} className="flex-1 py-4 border border-[#EDF2F7] rounded-xl font-bold text-[#718096] hover:bg-gray-50 transition-all">Cancel</button>
              <button onClick={handleSendMessage} className="flex-1 py-4 bg-[#f4a11d] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#e0921a] shadow-lg transition-all">
                <Send size={18} /> Send Message
              </button>
            </div>
          </div>
          </>
        )}
      </Modal>

      {/* View Modal */}
      <Modal isOpen={activeModal === "view"} onClose={() => setActiveModal(null)} title="Attendance Details">
        {selectedRecord && (
          <>
          <div className="px-[24px] pb-[24px] pt-[24px]">
            <div className="space-y-[17px]">
              <div className="flex items-start gap-[13px]">
                <User size={21} strokeWidth={1.8} className="mt-[2px] shrink-0 text-[#657183]" />
                <div>
                  <p className="text-[13px] font-normal leading-none text-[#657183]">Student</p>
                  <p className="mt-[7px] text-[15px] font-semibold leading-none text-[#2d3b4f]">{selectedRecord.name}</p>
                </div>
              </div>
              <div className="flex items-start gap-[13px]">
                <Clock size={21} strokeWidth={1.8} className="mt-[1px] shrink-0 text-[#657183]" />
                <div>
                  <p className="text-[13px] font-normal leading-none text-[#657183]">Date</p>
                  <p className="mt-[7px] text-[15px] font-normal leading-none text-[#2d3b4f]">{selectedRecord.date}</p>
                </div>
              </div>
              <div className="flex items-start gap-[13px]">
                <BookOpen size={21} strokeWidth={1.8} className="mt-[1px] shrink-0 text-[#657183]" />
                <div>
                  <p className="text-[13px] font-normal leading-none text-[#657183]">Session</p>
                  <p className="mt-[7px] text-[15px] font-normal leading-none text-[#2d3b4f]">{selectedRecord.session}</p>
                </div>
              </div>
              <div>
                <p className="mb-[12px] text-[13px] font-normal leading-none text-[#657183]">Status</p>
                <span className={`inline-flex h-[28px] items-center rounded-full px-[13px] text-[17px] font-normal leading-none ${
                  selectedRecord.status === "Present" ? "bg-[#dff9ea] text-[#009d4c]" :
                  selectedRecord.status === "Absent" ? "bg-[#ffe3e6] text-[#ff001a]" :
                  selectedRecord.status === "Late" ? "bg-[#e7f0ff] text-[#0054ff]" : "bg-[#fff4c6] text-[#c98600]"
                }`}>
                  {selectedRecord.status}
                </span>
              </div>
              <div>
                <p className="mb-[12px] text-[13px] font-normal leading-none text-[#657183]">Notes</p>
                <div className="flex min-h-[42px] items-center rounded-[8px] bg-[#f7f8fa] px-[12px] text-[15px] font-normal text-[#2d3b4f]">
                  {selectedRecord.notes || "No notes provided."}
                </div>
              </div>
            </div>
          </div>
          <div className="flex h-[87px] items-center justify-end border-t border-[#dddddd] px-[24px]">
            <button onClick={() => setActiveModal(null)} className="h-[37px] w-[88px] rounded-[8px] bg-[#ffa313] text-[14px] font-semibold text-white transition hover:bg-[#f59a0d]">Close</button>
          </div>
          <div className="hidden">
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-[#F8FAFC] rounded-xl text-[#A0AEC0]"><Eye size={20}/></div>
                <div>
                  <p className="text-[12px] font-bold text-[#A0AEC0] uppercase mb-1">Student</p>
                  <p className="text-[16px] font-bold text-[#2D3748]">{selectedRecord.name}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-[#F8FAFC] rounded-xl text-[#A0AEC0]"><Calendar size={20}/></div>
                <div>
                  <p className="text-[12px] font-bold text-[#A0AEC0] uppercase mb-1">Date</p>
                  <p className="text-[16px] font-bold text-[#2D3748]">{selectedRecord.date}</p>
                </div>
              </div>
              <div>
                <p className="text-[12px] font-bold text-[#A0AEC0] uppercase mb-2">Status</p>
                <span className={`px-4 py-1.5 rounded-full text-[13px] font-bold ${
                  selectedRecord.status === "Present" ? "bg-[#E6FFFA] text-[#38B2AC]" :
                  selectedRecord.status === "Absent" ? "bg-[#FFF5F5] text-[#E53E3E]" : "bg-[#FEF6E7] text-[#D69E2E]"
                }`}>
                  {selectedRecord.status}
                </span>
              </div>
              <div>
                <p className="text-[12px] font-bold text-[#A0AEC0] uppercase mb-2">Notes</p>
                <div className="bg-[#F8FAFC] p-5 rounded-2xl border border-[#F1F5F9] min-h-[100px] text-[14px] text-[#4A5568] leading-relaxed">
                  {selectedRecord.notes || "No notes provided."}
                </div>
              </div>
            </div>
            <button onClick={() => setActiveModal(null)} className="w-full py-4 bg-[#f4a11d] text-white rounded-xl font-bold hover:bg-[#e0921a] shadow-lg transition-all">Close</button>
          </div>
          </>
        )}
      </Modal>
    </div>
  );
}
