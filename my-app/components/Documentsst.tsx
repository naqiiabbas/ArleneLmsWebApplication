"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Poppins } from 'next/font/google';
import {
  FileText,
  Upload,
  Search,
  X,
  Clock3,
  Download,
  Eye,
  Funnel,
} from 'lucide-react';
import {
  getStudentDocuments,
  uploadStudentDocument,
  getStudentDocumentUrl,
} from '@/lib/data/student';
import type { StudentDocument } from '@/lib/data/student.types';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

const ApprovedStatusIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <g clipPath="url(#clip0_15_1965)">
      <path
        d="M14.5238 6.66192C14.828 8.15507 14.6112 9.70739 13.9095 11.06C13.2077 12.4126 12.0634 13.4838 10.6675 14.0949C9.27158 14.706 7.70834 14.82 6.2385 14.418C4.76865 14.016 3.48104 13.1223 2.59039 11.8859C1.69974 10.6494 1.25989 9.145 1.34419 7.6235C1.42849 6.10201 2.03185 4.6554 3.05364 3.52492C4.07544 2.39443 5.4539 1.64841 6.95917 1.41126C8.46443 1.17411 10.0055 1.46016 11.3254 2.22172"
        stroke="currentColor"
        strokeWidth="1.33239"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.99561 7.32793L7.9942 9.32652L14.6562 2.66455"
        stroke="currentColor"
        strokeWidth="1.33239"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_15_1965">
        <rect width="15.9887" height="15.9887" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

// --- Sub-Components ---

const UploadModal = ({ isOpen, onClose, onUploadSuccess }: { isOpen: boolean, onClose: () => void, onUploadSuccess: (file: File, name: string) => void }) => {
  const [file, setFile] = useState<File | null>(null);
  const [customName, setCustomName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const validateFile = (selectedFile: File) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
    const maxSize = 5 * 1024 * 1024; // Lowered to 5MB for localStorage stability
    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Invalid file type. (PDF, DOC, DOCX, JPG, PNG only)");
      return false;
    }
    if (selectedFile.size > maxSize) {
      setError("File is too large for browser storage. Max 5MB allowed.");
      return false;
    }
    setError(null);
    return true;
  };

  const handleUpload = () => {
    if (file && customName.trim()) {
      onUploadSuccess(file, customName);
      setFile(null);
      setCustomName("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/40 p-4">
      <div className="my-auto w-full max-w-[670px] rounded-[10px] bg-white px-[40px] pb-[32px] pt-[32px] shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-[12px]">
            <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[10px] bg-[#ffa313] text-white">
              <Upload size={20} strokeWidth={2.2} />
            </div>
            <h3 className="text-[22px] font-normal leading-none text-[#111111]">Upload Document</h3>
          </div>
          <button onClick={onClose} className="mt-[12px] text-[#666666] transition hover:text-[#111111]" aria-label="Close upload document modal">
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        <p className="mt-[27px] max-w-[512px] text-[15px] font-normal leading-[1.35] text-[#666666]">
          Please provide details about the document you're uploading. All fields marked with <span className="text-[#ff5f64]">*</span> are required.
        </p>

        <div className="mt-[27px]">
          <label className="mb-[10px] block text-[15px] font-normal leading-none text-[#666666]">Select File <span className="text-[#ff5f64]">*</span></label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`flex h-[225px] cursor-pointer flex-col items-center justify-center rounded-[9px] border transition-all ${file ? 'border-[#10B981] bg-emerald-50/20' : 'border-[#dddddd] bg-white hover:border-[#ffa313]'}`}
          >
            <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => {
              const f = e.target.files?.[0];
              if(f && validateFile(f)) setFile(f);
            }} accept=".pdf,.doc,.docx,.jpg,.png" />
            <span className={`flex h-[34px] w-[48px] items-center justify-center rounded-[9px] ${file ? 'bg-emerald-50 text-[#10B981]' : 'bg-[#fff8ef] text-[#ffa313]'}`}>
              <Upload size={22} strokeWidth={1.8} />
            </span>
            <p className="mt-[18px] text-center text-[15px] font-normal leading-none text-[#111111]">{file ? file.name : "Click to browse or drag and drop"}</p>
            <p className="mt-[19px] text-center text-[12px] font-normal leading-none text-[#777777]">PDF, DOC, DOCX, JPG, PNG (Max 10MB)</p>
          </div>
          {error && <p className="mt-2 text-xs font-bold text-red-500">{error}</p>}
        </div>

        <div className="mt-[27px]">
          <label className="mb-[10px] block text-[15px] font-normal leading-none text-[#666666]">Documents Name<span className="text-[#ff5f64]">*</span></label>
          <input 
            type="text" 
            placeholder="Enter Name"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            className="h-[56px] w-full rounded-[9px] border border-[#dddddd] bg-white px-[10px] text-[16px] font-normal text-[#111111] outline-none transition placeholder:text-[#777777] focus:border-[#ffa313]"
          />
        </div>

        <div className="mt-[25px] rounded-[9px] bg-[#fff8ef] px-[16px] py-[17px]">
          <p className="text-[15px] font-normal leading-[1.45] text-[#ff9f0f]">
            <span className="font-semibold">Note:</span>
            <br />
            <span className="mt-[12px] block">Your document will be reviewed by your mentor. You'll receive a notification once it's been approved or if any changes are needed.</span>
          </p>
        </div>

        <div className="mt-[24px] grid grid-cols-1 gap-[12px] sm:grid-cols-2">
          <button onClick={onClose} className="h-[50px] rounded-[9px] border border-[#dddddd] bg-white px-4 text-[16px] font-normal text-[#666666] transition hover:bg-[#fafafa]">Cancel</button>
          <button 
            disabled={!file || !customName}
            onClick={handleUpload}
            className="h-[50px] rounded-[9px] bg-[#ffa313] px-4 text-[16px] font-normal text-white transition hover:bg-[#f59a0d] disabled:bg-[#dddddd] disabled:text-[#999999]"
          >
            Upload Document
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---

export default function DocumentSection() {
  const [uploadedDocs, setUploadedDocs] = useState<StudentDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All Status");

  const loadDocs = () => {
    getStudentDocuments()
      .then(setUploadedDocs)
      .catch((e) => setNotice((e as Error).message))
      .finally(() => setLoading(false));
  };

  useEffect(loadDocs, []);

  const filteredDocs = useMemo(() => {
    return uploadedDocs.filter(doc => {
      const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "All Status" || doc.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [uploadedDocs, searchTerm, filterStatus]);

  const handleNewUpload = async (file: File, name: string) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("name", name);
    const res = await uploadStudentDocument(fd);
    if (res.error) {
      setNotice(res.error);
      return;
    }
    loadDocs();
  };

  const openFile = async (id: string) => {
    const res = await getStudentDocumentUrl(id);
    if (res.error || !res.url) {
      setNotice(res.error ?? "Could not open the file.");
      return;
    }
    window.open(res.url, "_blank", "noopener,noreferrer");
  };

  return (
    <section className={`${poppins.variable} min-h-full w-full overflow-x-hidden bg-[#f5f5f5] px-4 pb-6 pt-6 font-sans md:px-6 md:pt-7`}>
      <div className="mb-[28px] flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-[24px] font-semibold leading-none text-[#111111]">Documents</h1>
          <p className="mt-[14px] text-[16px] font-normal leading-none text-[#666666]">Manage your mentorship documents and submissions</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex h-[48px] w-full items-center justify-center gap-[10px] rounded-[10px] bg-[#ffa313] px-[25px] text-[16px] font-semibold text-white transition hover:bg-[#f59a0d] md:w-auto">
          <Upload size={18} strokeWidth={2.4} /> Upload Document
        </button>
      </div>

      {notice && (
        <div className="mb-[16px] flex items-start justify-between gap-4 rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-semibold text-red-700">
          <span className="break-all">{notice}</span>
          <button type="button" onClick={() => setNotice(null)} className="shrink-0 text-[13px] underline">Dismiss</button>
        </div>
      )}

      <div className="overflow-hidden rounded-[12px] border border-[#dddddd] bg-white">
        <div className="px-[22px] pt-[27px]">
          <div className="mb-[22px] flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-[20px] font-normal leading-none text-[#111111]">Uploaded Documents</h2>
            <div className="flex items-center gap-[8px]">
               <Funnel size={16} className="text-[#666666]" strokeWidth={1.8} />
               <span className="text-[14px] font-normal text-[#666666]">Filter:</span>
               <select 
                 value={filterStatus}
                 onChange={(e) => setFilterStatus(e.target.value)}
                 className="h-[32px] w-[136px] cursor-pointer rounded-[9px] border-none bg-[#f1f1f1] px-3 text-[13px] font-normal text-[#666666] outline-none"
               >
                 <option>All Status</option>
                 <option>Approved</option>
                 <option>Under Review</option>
               </select>
            </div>
          </div>

          <div className="relative mb-[24px]">
            <Search className="absolute left-[13px] top-1/2 -translate-y-1/2 text-[#777777]" size={20} strokeWidth={1.8} />
            <input 
              type="text" 
              placeholder="Search documents..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-[37px] w-full rounded-[9px] border-none bg-[#f1f1f1] pl-[40px] pr-4 text-[14px] font-normal text-[#111111] outline-none placeholder:text-[#8a8a8a]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead>
              <tr className="bg-[#f3f3f3]">
                <th className="px-[24px] py-[17px] text-[14px] font-semibold text-[#666666]">Document Name</th>
                <th className="px-[24px] py-[17px] text-[14px] font-semibold text-[#666666]">Upload Date</th>
                <th className="px-[24px] py-[17px] text-[14px] font-semibold text-[#666666]">Size</th>
                <th className="px-[24px] py-[17px] text-[14px] font-semibold text-[#666666]">Status</th>
                <th className="px-[24px] py-[17px] text-[14px] font-semibold text-[#666666]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} className="px-[24px] py-[28px] text-center text-[14px] text-[#666666]">Loading documents…</td></tr>
              )}
              {!loading && filteredDocs.length === 0 && (
                <tr><td colSpan={5} className="px-[24px] py-[28px] text-center text-[14px] text-[#666666]">No documents uploaded yet.</td></tr>
              )}
              {filteredDocs.map(doc => (
                <tr key={doc.id} className="border-b border-[#e9e9e9] transition-colors last:border-b-0 hover:bg-[#fafafa]">
                  <td className="flex items-center gap-[12px] px-[24px] py-[17px]">
                    <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[10px] bg-[#fff8ef] text-[#ff9f0f]"><FileText size={20} strokeWidth={2} /></div>
                    <span className="text-[14px] font-normal text-[#111111]">{doc.title}</span>
                  </td>
                  <td className="px-[24px] py-[17px] text-[14px] font-normal text-[#666666]">{doc.date}</td>
                  <td className="px-[24px] py-[17px] text-[14px] font-normal text-[#666666]">{doc.size}</td>
                  <td className="px-[24px] py-[17px]">
                    <span className={`inline-flex items-center gap-[6px] rounded-[9px] px-[9px] py-[6px] text-[14px] font-normal leading-none ${
                      doc.status === "Approved" ? "bg-[#E7F8EC] text-[#06D6A0]" : "bg-[#FFF1DE] text-[#ff9f0f]"
                    }`}>
                      {doc.status === "Approved" ? <ApprovedStatusIcon className="h-[16px] w-[16px]" /> : <Clock3 size={15} strokeWidth={2.1} />}
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-[24px] py-[17px]">
                    <div className="flex items-center gap-[22px]">
                      <button onClick={() => openFile(doc.id)} className="text-[#ff9f0f] transition-transform hover:scale-110 active:opacity-50" aria-label={`View ${doc.title}`}>
                        <Eye size={17} strokeWidth={2} />
                      </button>
                      <button onClick={() => openFile(doc.id)} className="text-[#ff9f0f] transition-transform hover:scale-110 active:opacity-50" aria-label={`Download ${doc.title}`}>
                        <Download size={17} strokeWidth={2} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <UploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUploadSuccess={handleNewUpload}
      />
    </section>
  );
}
