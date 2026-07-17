"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Poppins } from 'next/font/google';
import { 
  FileText, 
  CloudUpload, 
  Upload,
  Search, 
  X,
  AlertCircle,
  Clock3,
  Download,
  Eye,
  Funnel,
  Printer,
  Share2,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

// --- Dynamic Data ---

const INITIAL_PENDING_DOCS = [
  { id: 1, title: "Monthly Progress Report", due: "Nov 27, 2025", priority: "High Priority", priorityColor: "text-red-500 bg-red-50" },
  { id: 2, title: "Attendance Verification Form", due: "Nov 27, 2025", priority: "High Priority", priorityColor: "text-red-500 bg-red-50" },
  { id: 3, title: "Quarterly Self-Assessment", due: "Dec 1, 2025", priority: "Medium Priority", priorityColor: "text-orange-500 bg-orange-50" },
];

const INITIAL_UPLOADED_DOCS = [
  { id: 101, title: "Progress Report - October 2025.pdf", date: "Nov 5, 2025", size: "2.4 MB", status: "Approved", url: null },
  { id: 102, title: "Attendance Record - Q3 2025.pdf", date: "Oct 28, 2025", size: "1.8 MB", status: "Approved", url: null },
  { id: 103, title: "Self Assessment - September.pdf", date: "Oct 15, 2025", size: "3.1 MB", status: "Under Review", url: null },
  { id: 104, title: "Goal Setting Worksheet.pdf", date: "Oct 2, 2025", size: "1.2 MB", status: "Approved", url: null },
  { id: 105, title: "Mid-term Evaluation.pdf", date: "Sep 15, 2025", size: "2.8 MB", status: "Approved", url: null },
];

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

const ViewModal = ({ isOpen, onClose, doc }: { isOpen: boolean, onClose: () => void, doc: any }) => {
  if (!isOpen || !doc) return null;

  const handlePrint = () => {
    const printWindow = window.open(doc.url || '', '_blank');
    if (printWindow) {
      printWindow.onload = () => printWindow.print();
    } else {
      alert("Please upload a real file to print.");
    }
  };

  const handleDownload = () => {
    if (doc.url) {
      const link = document.createElement('a');
      link.href = doc.url;
      link.download = doc.title;
      link.click();
    } else {
      alert("Placeholder document cannot be downloaded.");
    }
  };

  const handleShare = () => {
    if (navigator.share && doc.url) {
      navigator.share({ title: doc.title, url: doc.url });
    } else {
      alert("Sharing is not supported on this browser or no file available.");
    }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-[#f4f4f4]">
      <div className="flex h-screen w-full flex-col overflow-hidden bg-[#f4f4f4]">
        {/* Modal Navbar */}
        <div className="shrink-0 border-b border-[#dddddd] bg-white">
          <div className="flex items-start justify-between gap-4 px-[16px] pb-[12px] pt-[18px]">
            <div className="flex min-w-0 items-start gap-[12px]">
              <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[8px] bg-[#ffa313] text-white">
                <FileText size={20} strokeWidth={1.9} />
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-[18px] font-normal leading-[1.15] text-[#222222]">{doc.title}</h3>
                <p className="mt-[5px] text-[12px] font-normal leading-none text-[#666666]">
                  Uploaded: {doc.date} &bull; Size: {doc.size} &bull; Status: {doc.status}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="mt-[5px] text-[#666666] transition hover:text-[#111111]" aria-label="Close document view">
              <X size={24} strokeWidth={2} />
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-[12px] px-[16px] pb-[14px]">
            <div className="flex flex-wrap items-center gap-[8px]">
              <button className="flex h-[40px] items-center gap-[5px] rounded-[8px] bg-[#e8f4ff] px-[13px] text-[16px] font-normal leading-none text-[#ff9f0f] transition hover:bg-[#dff0ff]">
                <ZoomOut size={16} strokeWidth={2} /> Zoom Out
              </button>
              <div className="flex h-[40px] items-center justify-center rounded-[8px] bg-[#f1f1f1] px-[17px] text-[14px] font-normal text-[#666666]">100%</div>
              <button className="flex h-[40px] items-center gap-[5px] rounded-[8px] bg-[#e8f4ff] px-[13px] text-[16px] font-normal leading-none text-[#ff9f0f] transition hover:bg-[#dff0ff]">
                <ZoomIn size={16} strokeWidth={2} /> Zoom In
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-[8px]">
              <button onClick={handlePrint} className="flex h-[40px] items-center gap-[8px] rounded-[8px] bg-[#f1f1f1] px-[16px] text-[16px] font-normal leading-none text-[#666666] transition hover:bg-[#e8e8e8]">
                <Printer size={17} strokeWidth={2} /> Print
              </button>
              <button onClick={handleShare} className="flex h-[40px] items-center gap-[8px] rounded-[8px] bg-[#f1f1f1] px-[16px] text-[16px] font-normal leading-none text-[#666666] transition hover:bg-[#e8e8e8]">
                <Share2 size={17} strokeWidth={2} /> Share
              </button>
              <button onClick={handleDownload} className="flex h-[40px] items-center gap-[7px] rounded-[8px] bg-[#ffa313] px-[18px] text-[16px] font-normal leading-none text-white transition hover:bg-[#f59a0d]">
                <Download size={17} strokeWidth={2} /> Download
              </button>
            </div>
          </div>
        </div>

        {/* Document Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-[#f4f4f4] px-[16px] py-[25px]">
          <div className="mx-auto w-full max-w-[896px] rounded-[10px] bg-white px-[42px] pb-[38px] pt-[42px] sm:px-[54px]">
            {doc.url ? (
              <div className="flex min-h-[680px] items-center justify-center">
                <img src={doc.url} alt="Document Preview" className="h-auto max-w-full rounded-[8px]" />
              </div>
            ) : (
              <>
                <div className="text-center">
                  <div className="mx-auto flex h-[64px] w-[64px] items-center justify-center rounded-full bg-[#ffa313] text-[20px] font-normal text-white">
                    MP
                  </div>
                  <h2 className="mt-[20px] text-[30px] font-normal leading-none text-[#222222]">Monthly Progress Report</h2>
                  <p className="mt-[14px] text-[16px] font-normal leading-none text-[#666666]">Mentorship Program - Alex Johnson</p>
                  <p className="mt-[9px] text-[14px] font-normal leading-none text-[#666666]">{doc.date}</p>
                </div>

                <div className="mt-[29px] h-px w-full bg-[#ffa313]" />

                <div className="mt-[32px] rounded-[8px] bg-[#f4f4f4] px-[24px] py-[24px]">
                  <h3 className="text-[19px] font-normal leading-none text-[#222222]">Student Information</h3>
                  <div className="mt-[24px] grid grid-cols-1 gap-x-[72px] gap-y-[19px] sm:grid-cols-2">
                    <div>
                      <p className="text-[14px] font-normal leading-none text-[#666666]">Student Name</p>
                      <p className="mt-[12px] text-[16px] font-normal leading-none text-[#222222]">Alex Johnson</p>
                    </div>
                    <div>
                      <p className="text-[14px] font-normal leading-none text-[#666666]">Student ID</p>
                      <p className="mt-[12px] text-[16px] font-normal leading-none text-[#222222]">MP-2024-1337</p>
                    </div>
                    <div>
                      <p className="text-[14px] font-normal leading-none text-[#666666]">Mentor</p>
                      <p className="mt-[12px] text-[16px] font-normal leading-none text-[#222222]">Dr. Sarah Mitchell</p>
                    </div>
                    <div>
                      <p className="text-[14px] font-normal leading-none text-[#666666]">Program</p>
                      <p className="mt-[12px] text-[16px] font-normal leading-none text-[#222222]">Career Development Mentorship</p>
                    </div>
                  </div>
                </div>

                <div className="mt-[27px]">
                  <h3 className="text-[19px] font-normal leading-none text-[#222222]">Progress Summary</h3>
                  <p className="mt-[19px] text-[17px] font-normal leading-[1.55] text-[#666666]">
                    This month has been highly productive with significant achievements across multiple areas. I've successfully completed my software development certification course and have begun applying the learned concepts in real-world projects.
                  </p>
                  <p className="mt-[18px] text-[17px] font-normal leading-[1.55] text-[#666666]">
                    My networking skills have improved substantially through attending three industry events and connecting with professionals in my field of interest. These connections have opened up new opportunities for career growth and mentorship.
                  </p>
                </div>

                <div className="mt-[28px]">
                  <h3 className="text-[19px] font-normal leading-none text-[#222222]">Key Achievements</h3>
                  <div className="mt-[18px] space-y-[12px] text-[16px] font-normal text-[#222222]">
                    <div className="flex items-start gap-[10px]">
                      <ApprovedStatusIcon className="mt-[3px] h-[18px] w-[18px] shrink-0 text-[#06d6a0]" />
                      <span>Completed software development certification course</span>
                    </div>
                    <div className="flex items-start gap-[10px]">
                      <ApprovedStatusIcon className="mt-[3px] h-[18px] w-[18px] shrink-0 text-[#06d6a0]" />
                      <span>Attended three professional networking events</span>
                    </div>
                    <div className="flex items-start gap-[10px]">
                      <ApprovedStatusIcon className="mt-[3px] h-[18px] w-[18px] shrink-0 text-[#06d6a0]" />
                      <span>Built first portfolio project with mentor feedback</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

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
  const [uploadedDocs, setUploadedDocs] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All Status");

  // --- PERSISTENCE LOGIC ---
  useEffect(() => {
    const saved = localStorage.getItem('user_docs_data');
    if (saved) {
      setUploadedDocs(JSON.parse(saved));
    } else {
      setUploadedDocs(INITIAL_UPLOADED_DOCS);
    }
  }, []);

  useEffect(() => {
    if (uploadedDocs.length > 0) {
      localStorage.setItem('user_docs_data', JSON.stringify(uploadedDocs));
    }
  }, [uploadedDocs]);

  const filteredDocs = useMemo(() => {
    return uploadedDocs.filter(doc => {
      const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "All Status" || doc.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [uploadedDocs, searchTerm, filterStatus]);

  const handleNewUpload = (file: File, name: string) => {
    const extension = file.name.split('.').pop();
    const reader = new FileReader();

    reader.onloadend = () => {
      const newDoc = {
        id: Date.now(),
        title: `${name}.${extension}`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        size: (file.size / (1024 * 1024)).toFixed(1) + " MB",
        status: "Under Review",
        url: reader.result // This is now a Base64 string that stays in memory
      };
      setUploadedDocs(prev => [newDoc, ...prev]);
    };
    reader.readAsDataURL(file);
  };

  const handleView = (doc: any) => {
    setSelectedDoc(doc);
    setIsViewModalOpen(true);
  };

  const handleDownload = (url: string | null, title: string) => {
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert("This is a placeholder item. Please upload a real file to download.");
    }
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

      <div className="mb-[24px]">
        <div className="mb-[18px] flex items-center gap-[10px]">
          <AlertCircle className="text-[#ff5a5a]" size={22} strokeWidth={2} />
          <h2 className="text-[19px] font-semibold leading-none text-[#111111]">Pending Submissions</h2>
          <span className="flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-[#ff666c] px-[7px] text-[12px] font-semibold leading-none text-white">3</span>
        </div>
        <div className="space-y-[16px]">
          {INITIAL_PENDING_DOCS.map(doc => (
            <div key={doc.id} className="flex min-h-[130px] flex-col justify-between gap-4 rounded-[12px] border border-[#ff5a5a] bg-white px-[22px] py-[22px] sm:flex-row sm:items-center">
              <div className="flex items-center gap-[16px]">
                <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-[10px] bg-[#fff2db] text-[#ff9f0f]"><FileText size={24} strokeWidth={2} /></div>
                <div>
                  <h3 className="text-[16px] font-semibold leading-none text-[#111111]">{doc.title}</h3>
                  <div className="mt-[13px] flex flex-col gap-[10px] sm:flex-row sm:items-center">
                    <p className="text-[14px] font-normal leading-none text-[#666666]">Due: {doc.due}</p>
                    <span className={`${doc.priorityColor} w-fit rounded-[8px] px-[12px] py-[5px] text-[12px] font-normal leading-none`}>{doc.priority}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(true)} className="flex h-[40px] w-full shrink-0 items-center justify-center whitespace-nowrap rounded-[9px] bg-[#ffa313] px-[24px] text-[16px] font-semibold leading-none text-white transition hover:bg-[#f59a0d] sm:w-[146px]">
                Upload Now
              </button>
            </div>
          ))}
        </div>
      </div>

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
                      <button onClick={() => handleView(doc)} className="text-[#ff9f0f] transition-transform hover:scale-110 active:opacity-50" aria-label={`View ${doc.title}`}>
                        <Eye size={17} strokeWidth={2} />
                      </button>
                      <button onClick={() => handleDownload(doc.url, doc.title)} className="text-[#ff9f0f] transition-transform hover:scale-110 active:opacity-50" aria-label={`Download ${doc.title}`}>
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

      <ViewModal 
        isOpen={isViewModalOpen} 
        onClose={() => setIsViewModalOpen(false)} 
        doc={selectedDoc} 
      />
    </section>
  );
}
