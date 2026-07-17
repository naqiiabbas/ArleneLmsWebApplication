"use client";

import React, { useState } from "react";
import { 
  Bell, 
  FileText, 
  AlertCircle, 
  Eye, 
  XCircle, 
  Download, 
  X,
  Plus,
  ChevronRight,
  Link
} from "lucide-react";

// --- TYPES & INTERFACES ---
interface DocumentType {
  id: string;
  name: string;
  author: string;
  category: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  type: string;
  size: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

// --- DATA ---
const WEEKLY_ATTENDANCE = [
  { day: "Mon", present: 12, absent: 2 },
  { day: "Tue", present: 14, absent: 0 },
  { day: "Wed", present: 11, absent: 3 },
  { day: "Thu", present: 13, absent: 1 },
  { day: "Fri", present: 12, absent: 2 },
];

const MONITORING_DATA = [
  { day: "Mon", present: 42, absent: 3, late: 1 },
  { day: "Tue", present: 45, absent: 1, late: 1 },
  { day: "Wed", present: 43, absent: 2, late: 1 },
  { day: "Thu", present: 46, absent: 1, late: 0 },
  { day: "Fri", present: 43, absent: 2, late: 1 },
];

const ALERTS = [
  { id: 1, title: "Document Approval", desc: "3 documents pending review", time: "10 min ago", icon: FileText, color: "text-[#F9A618]", bg: "bg-orange-50" },
  { id: 2, title: "Low Attendance Alert", desc: "Student Alex M. - 3 consecutive absences", time: "1 hour ago", icon: AlertCircle, color: "text-red-500", bg: "bg-red-50" },
  { id: 3, title: "Attendance Request", desc: "2 late arrival requests pending", time: "4 hours ago", icon: FileText, color: "text-[#F9A618]", bg: "bg-orange-50" },
];

const DOCUMENTS_DATA: DocumentType[] = [
  { id: "1", name: "Student Progress Report - Q4", author: "Dr. Sarah Johnson", category: "Reports", date: "2025-11-25", status: "Pending", type: "PDF", size: "2.4 MB" },
  { id: "2", name: "Attendance Summary Nov 2025", author: "Admin System", category: "Attendance", date: "2025-11-26", status: "Approved", type: "Excel", size: "1.8 MB" },
  { id: "3", name: "Mentor Feedback Form", author: "Prof. Michael Chen", category: "Feedback", date: "2025-11-26", status: "Pending", type: "PDF", size: "1.2 MB" },
  { id: "4", name: "Student Enrollment Form", author: "Emma Williams", category: "Enrollment", date: "2025-11-27", status: "Pending", type: "PDF", size: "3.1 MB" },
  { id: "5", name: "Session Notes - Python", author: "Dr. Lisa Anderson", category: "Session Notes", date: "2025-11-27", status: "Approved", type: "Docx", size: "0.9 MB" },
];

// --- MODAL WRAPPER ---
const ModalWrapper: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-[670px] overflow-hidden rounded-[8px] bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
        {children}
      </div>
    </div>
  );
};

export default function Adminpanel2() {
  const [docs, setDocs] = useState<DocumentType[]>(DOCUMENTS_DATA);
  const [selectedDoc, setSelectedDoc] = useState<DocumentType | null>(null);
  const [modalType, setModalType] = useState<"view" | "approve" | "reject" | null>(null);

  const handleOpenModal = (type: "view" | "approve" | "reject", doc: DocumentType) => {
    setSelectedDoc(doc);
    setModalType(type);
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedDoc(null);
  };

  const handleStatusUpdate = (status: 'Pending' | 'Approved' | 'Rejected') => {
    if (selectedDoc) {
      setDocs(prev => prev.map(d => d.id === selectedDoc.id ? { ...d, status } : d));
      closeModal();
    }
  };

  const handleDownload = () => {
    if (selectedDoc) {
      const blob = new Blob([`Data: ${selectedDoc.name}`], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedDoc.name}.pdf`;
      a.click();
    }
  };

  return (
    <div className="space-y-5 bg-[#f4f4f4] px-4 pb-0 pt-5 font-[Poppins] md:px-6">
      
      {/* 1. Weekly Attendance Overview (Full Width) */}
      <div className="rounded-[8px] border border-[#dddddd] bg-white px-6 py-6">
        <h3 className="mb-[24px] text-[21px] font-normal leading-none text-[#242424]">Weekly Attendance Overview</h3>
        <div className="relative h-[265px] pr-[10px]">
          <div className="absolute bottom-[32px] left-0 top-0 flex w-[32px] flex-col justify-between text-right text-[12px] leading-none text-[#777777]">
            {[16, 12, 8, 4, 0].map((tick) => (
              <span key={tick}>{tick}</span>
            ))}
          </div>
          <div className="absolute bottom-[32px] left-[42px] right-[8px] top-0 border-b border-l border-[#9b9b9b]">
            {[0, 1, 2, 3, 4].map((line) => (
              <div
                key={line}
                className="absolute left-0 right-0 border-t border-dashed border-[#d6d6d6]"
                style={{ top: `${line * 25}%` }}
              />
            ))}
            {[20, 40, 60, 80, 100].map((line) => (
              <div
                key={line}
                className="absolute bottom-0 top-0 border-l border-dashed border-[#d6d6d6]"
                style={{ left: `${line}%` }}
              />
            ))}
            <div className="absolute inset-x-[18px] bottom-0 top-0 flex items-end justify-between">
              {WEEKLY_ATTENDANCE.map((item) => (
                <div key={item.day} className="flex h-full w-[18%] items-end justify-center gap-[2px]">
                  <div className="w-[48%] bg-[#F9A618]" style={{ height: `${(item.present / 16) * 100}%` }} />
                  <div className="w-[48%] bg-[#ef493d]" style={{ height: `${(item.absent / 16) * 100}%` }} />
                </div>
              ))}
            </div>
          </div>
          <div className="absolute bottom-0 left-[42px] right-[8px] flex justify-around text-[12px] leading-none text-[#777777]">
            {WEEKLY_ATTENDANCE.map((item) => (
              <span key={item.day}>{item.day}</span>
            ))}
          </div>
        </div>
        <div className="mt-[13px] flex justify-center gap-[5px] text-[16px] font-normal leading-none">
          <div className="flex items-center gap-[4px] text-[#ef493d]"><span className="h-[12px] w-[12px] bg-[#ef493d]" />Absent</div>
          <div className="flex items-center gap-[4px] text-[#F9A618]"><span className="h-[12px] w-[12px] bg-[#F9A618]" />Present</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* 2. Attendance Monitoring (Left) */}
        <div className="overflow-hidden rounded-[8px] border border-[#dddddd] bg-white lg:col-span-2">
          <div className="border-b border-[#eeeeee] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[8px] bg-[#fff7e8]"><img src="/images/admin-icon-20.svg" alt="" className="h-5 w-5" /></div>
            <div>
              <h3 className="text-[17px] font-semibold text-[#242424]">Attendance Monitoring</h3>
              <p className="text-[11px] text-[#777777]">This Week's Overview</p>
            </div>
          </div>
          </div>
          <div className="bg-[#fff7e8] px-5 py-4">
          <div className="h-40 flex items-end justify-between px-2 border-b border-dashed border-gray-100">
            {MONITORING_DATA.map((item, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className="flex gap-1 items-end h-32">
                  <div className="w-5 bg-[#EE4D4D] rounded-t-sm" style={{ height: `${(item.absent / 60) * 100}%` }}></div>
                  <div className="w-5 bg-[#F9A618] rounded-t-sm" style={{ height: `${(item.present / 60) * 100}%` }}></div>
                  <div className="w-5 bg-[#EAB308] opacity-40 rounded-t-sm" style={{ height: `${(item.late / 60) * 100}%` }}></div>
                </div>
                <span className="text-gray-400 text-[10px] mt-2">{item.day}</span>
              </div>
            ))}
          </div>
          </div>
          <div className="flex items-center justify-between px-5 py-4">
             <div className="flex gap-4">
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 bg-[#F9A618] rounded-full"></span><span className="text-[10px] text-gray-500">Present: 220</span></div>
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 bg-[#EE4D4D] rounded-full"></span><span className="text-[10px] text-gray-500">Absent: 9</span></div>
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 bg-[#EAB308] rounded-full"></span><span className="text-[10px] text-gray-500">Late: 6</span></div>
             </div>
             <button className="text-[#F9A618] text-[11px] font-bold flex items-center gap-1">Full Report <ChevronRight size={14}/></button>
          </div>
        </div>

        {/* 3. Alerts & Notifications (Right) */}
        <div className="relative rounded-[8px] border border-[#dddddd] bg-white p-5">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Bell className="text-[#F9A618]" size={20} />
              <h3 className="text-[17px] font-semibold text-[#242424]">Alerts & Notifications</h3>
            </div>
            <span className="bg-[#F9A618] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">7</span>
          </div>
          <div className="space-y-6">
            {ALERTS.map((alert) => (
              <div key={alert.id} className="flex gap-3 relative">
                <div className={`${alert.bg} p-2.5 rounded-xl h-fit`}><alert.icon className={alert.color} size={18} /></div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="font-bold text-gray-800 text-[12px]">{alert.title}</h4>
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                  </div>
                  <p className="text-[10px] text-gray-400 leading-relaxed">{alert.desc}</p>
                  <span className="text-[9px] text-gray-300 mt-1 block">{alert.time}</span>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full text-center text-[#F9A618] text-[11px] font-bold mt-8 hover:underline">View All Notifications</button>
        </div>
          
      </div>

      {/* 4. Recent Documents Table */}
      <div className="overflow-hidden rounded-[8px] border border-[#dddddd] bg-white">
        <div className="flex items-center gap-3 border-b border-[#eeeeee] p-5">
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[8px] bg-[#fff7e8]"><img src="/images/admin-icon-20.svg" alt="" className="h-5 w-5" /></div>
          <h3 className="text-[17px] font-semibold text-[#242424]">Recent Documents</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#f4f4f4] text-[11px] font-medium text-[#777777]">
              <tr>
                <th className="px-6 py-4">Document Name</th>
                <th className="px-6 py-4">Uploaded By</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {docs.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-[12px] font-semibold text-[#444444]">{doc.name}</td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{doc.author}</td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{doc.category}</td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{doc.date}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                      doc.status === 'Approved' ? 'bg-green-50 text-[#00A348]' : 'bg-orange-50 text-[#F9A618]'
                    }`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-4">
                      <button onClick={() => handleOpenModal('view', doc)}><img src="/images/admin-icon-22.svg" alt="" className="h-4 w-4" /></button>
                      {doc.status === 'Pending' && (
                        <>
                          <button onClick={() => handleOpenModal('approve', doc)}>
                            <img src="/images/admin-icon-40.svg" alt="" aria-hidden="true" className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleOpenModal('reject', doc)}><XCircle size={16} className="text-[#E10000]" /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* VIEW MODAL (Exact design from screenshot) */}
      <ModalWrapper isOpen={modalType === 'view'} onClose={closeModal}>
        <div className="px-6 pb-6 pt-[30px] font-[Poppins]">
          <div className="mb-[28px] flex items-center justify-between">
            <h2 className="text-[21px] font-semibold leading-none text-[#242424]">Document Details</h2>
            <button onClick={closeModal} className="text-[#777777] hover:text-[#242424]"><X size={22}/></button>
          </div>
          {selectedDoc && (
            <>
              <div className="mb-[18px] rounded-[8px] bg-[#f4f4f4] px-4 py-[19px]">
                <h3 className="mb-[12px] text-[19px] font-semibold leading-none text-[#242424]">{selectedDoc.name}</h3>
                <div className="flex gap-2">
                  <span className="rounded-full bg-[#ffead2] px-[12px] py-[5px] text-[12px] font-semibold leading-none text-[#a33d00]">{selectedDoc.status}</span>
                  <span className="rounded-full bg-[#dbeafe] px-[12px] py-[5px] text-[12px] font-semibold leading-none text-[#155dfc]">{selectedDoc.category}</span>
                </div>
              </div>
              <div className="mb-[19px] grid grid-cols-2 gap-x-[78px] gap-y-[19px]">
                <DetailItem label="Uploaded By" value={selectedDoc.author} />
                <DetailItem label="Upload Date" value={selectedDoc.date} />
                <DetailItem label="File Type" value={selectedDoc.type} />
                <DetailItem label="File Size" value={selectedDoc.size} />
              </div>
              <div className="flex gap-[12px] border-t border-[#dddddd] pt-[17px]">
                <button onClick={handleDownload} className="flex h-[40px] flex-1 items-center justify-center gap-2 rounded-[8px] bg-[#dcb957] text-[16px] font-semibold text-white"><Download size={18}/> Download</button>
                {selectedDoc.status === "Pending" && (
                  <>
                    <button onClick={() => handleStatusUpdate('Approved')} className="flex h-[40px] flex-1 items-center justify-center gap-2 rounded-[8px] bg-[#00a63e] text-[16px] font-semibold text-white"><img src="/images/admin-icon-31.svg" alt="" aria-hidden="true" className="h-4 w-4" /> Approve</button>
                    <button onClick={() => handleStatusUpdate('Rejected')} className="flex h-[40px] flex-1 items-center justify-center gap-2 rounded-[8px] bg-[#e7000b] text-[16px] font-semibold text-white"><XCircle size={18}/> Reject</button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </ModalWrapper>

      {/* APPROVE/REJECT MODALS */}
      <ModalWrapper isOpen={modalType === 'approve' || modalType === 'reject'} onClose={closeModal}>
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">{modalType === 'approve' ? 'Approve' : 'Reject'} Document</h2>
            <button onClick={closeModal}><X size={20} className="text-gray-400"/></button>
          </div>
          <p className="text-gray-500 font-medium mb-10 leading-relaxed">
            Are you sure you want to {modalType} the document <br/> 
            <span className="font-bold text-gray-800">"{selectedDoc?.name}"</span>?
          </p>
          <div className="flex gap-4">
            <button 
              onClick={() => handleStatusUpdate(modalType === 'approve' ? 'Approved' : 'Rejected')} 
              className={`flex-1 ${modalType === 'approve' ? 'bg-[#00A348]' : 'bg-[#E10000]'} text-white py-4 rounded-xl font-bold shadow-lg`}
            >
              {modalType === 'approve' ? 'Approve' : 'Reject'}
            </button>
            <button onClick={closeModal} className="flex-1 border border-gray-200 text-gray-500 py-4 rounded-xl font-bold hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      </ModalWrapper>

    </div>
  );
}

const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="mb-[8px] text-[14px] font-semibold leading-none text-[#777777]">{label}</p>
    <p className="text-[14px] font-semibold leading-none text-[#242424]">{value}</p>
  </div>
);
