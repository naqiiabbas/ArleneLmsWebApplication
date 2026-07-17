"use client";

import React, { ChangeEvent, ReactNode, useMemo, useState } from "react";
import {
  ChevronDown,
  Clock,
  Download,
  Eye,
  FileText,
  Filter,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";

interface DocumentItem {
  id: string;
  name: string;
  category: string;
  student: string;
  uploadDate: string;
  size: string;
  numericSize: number;
  type?: string;
  status: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: string;
  icon?: ReactNode;
}

const initialDocuments: DocumentItem[] = [
  {
    id: "1",
    name: "Math Study Guide.pdf",
    category: "Academic Resources",
    student: "Marcus Johnson",
    uploadDate: "2024-11-25",
    size: "2.4 MB",
    numericSize: 2.4,
    type: "pdf",
    status: "approved",
  },
  {
    id: "2",
    name: "College Application Checklist.docx",
    category: "Career Planning",
    student: "David Williams",
    uploadDate: "2024-11-22",
    size: "156 KB",
    numericSize: 0.15,
    type: "docx",
    status: "approved",
  },
  {
    id: "3",
    name: "Progress Report - Q1.pdf",
    category: "Reports",
    student: "James Brown",
    uploadDate: "2024-11-20",
    size: "890 KB",
    numericSize: 0.89,
    type: "pdf",
    status: "approved",
  },
  {
    id: "4",
    name: "SAT Prep Resources.zip",
    category: "Academic Resources",
    student: "All Students",
    uploadDate: "2024-11-18",
    size: "15.2 MB",
    numericSize: 15.2,
    type: "zip",
    status: "approved",
  },
  {
    id: "5",
    name: "Meeting Notes Template.docx",
    category: "Templates",
    student: "Personal",
    uploadDate: "2024-11-15",
    size: "45 KB",
    numericSize: 0.04,
    type: "docx",
    status: "approved",
  },
];

const categories = ["All Categories", "Academic Resources", "Career Planning", "Reports", "Templates"];

const Modal = ({ isOpen, onClose, title, children, width = "max-w-[448px]", icon }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/35 p-4 font-poppins text-left">
      <div className={`w-full ${width} overflow-hidden rounded-[8px] bg-white shadow-[0_24px_70px_rgba(0,0,0,0.24)]`}>
        <div className="flex h-[85px] items-center justify-between border-b border-[#d8dde3] px-[24px]">
          <div className="flex items-center gap-[12px]">
            {icon}
            <h3 className="text-[21px] font-semibold leading-none text-[#2b3b4d]">{title}</h3>
          </div>
          <button type="button" onClick={onClose} className="flex h-[30px] w-[30px] items-center justify-center rounded-full text-[#2b3b4d] hover:bg-[#f3f4f6]">
            <X size={20} strokeWidth={2} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

const fileIconClass = (type?: string) => {
  if (type === "zip") return "text-[#ff9f0f]";
  if (type === "docx") return "text-[#1769ff]";
  return "text-[#ff2f3d]";
};

const getFileIcon = (type?: string, size = 22) => {
  if (type === "zip") {
    return <img src="/images/mentor-doc-folder.svg" alt="" aria-hidden="true" style={{ width: size, height: size }} className="shrink-0" />;
  }
  return <FileText size={size} strokeWidth={2} className={fileIconClass(type)} />;
};

const ModalSvgIcon = ({ src, size = 20 }: { src: string; size?: number }) => (
  <img src={src} alt="" aria-hidden="true" style={{ width: size, height: size }} className="shrink-0" />
);

export default function DocumentManagement() {
  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [pendingUpload, setPendingUpload] = useState<DocumentItem | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeDoc, setActiveDoc] = useState<DocumentItem | null>(null);

  const totalLimitMB = 1024;
  const currentUsedMB = useMemo(() => documents.reduce((acc, doc) => acc + doc.numericSize, 0), [documents]);
  const storagePercentage = (currentUsedMB / totalLimitMB) * 100;

  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      if (doc.status === "pending") return false;
      const matchesSearch =
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "All Categories" || doc.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, documents]);

  const pendingDocs = useMemo(() => documents.filter((doc) => doc.status === "pending"), [documents]);

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const sizeMB = file.size / (1024 * 1024);
    setPendingUpload({
      id: Math.random().toString(36).slice(2, 11),
      name: file.name,
      category: "Academic Resources",
      student: "All Students",
      uploadDate: new Date().toISOString().split("T")[0],
      size: sizeMB < 1 ? `${(file.size / 1024).toFixed(0)} KB` : `${sizeMB.toFixed(1)} MB`,
      numericSize: sizeMB,
      type: file.name.split(".").pop(),
      status: "pending",
    });
  };

  const confirmUpload = () => {
    if (!pendingUpload) return;
    setDocuments((previous) => [pendingUpload, ...previous]);
    setPendingUpload(null);
    setIsUploadModalOpen(false);
    setIsSuccessModalOpen(true);
  };

  const deleteDocument = () => {
    if (!activeDoc) return;
    setDocuments((previous) => previous.filter((document) => document.id !== activeDoc.id));
    setIsDeleteModalOpen(false);
    setActiveDoc(null);
  };

  const downloadFile = (doc: DocumentItem | null) => {
    if (!doc) return;
    console.log(`Downloading: ${doc.name}`);
    setIsDownloadModalOpen(false);
    setIsViewModalOpen(false);
  };

  const openDocModal = (doc: DocumentItem, modal: "view" | "download" | "delete") => {
    setActiveDoc(doc);
    if (modal === "view") setIsViewModalOpen(true);
    if (modal === "download") setIsDownloadModalOpen(true);
    if (modal === "delete") setIsDeleteModalOpen(true);
  };

  return (
    <section className="min-h-screen w-full bg-[#f3f3f3] px-[24px] py-[28px] font-poppins text-left">
      <div className="mb-[28px] flex items-start justify-between gap-4">
        <div>
          <h1 className="mb-[8px] text-[32px] font-bold leading-none text-[#111111]">Documents</h1>
          <p className="text-[15px] font-normal leading-none text-[#666666]">Manage and share files with students</p>
        </div>
        <button
          type="button"
          onClick={() => setIsUploadModalOpen(true)}
          className="mt-[5px] inline-flex h-[42px] items-center gap-[10px] rounded-[9px] bg-[#ffa313] px-[18px] text-[14px] font-semibold text-white transition hover:bg-[#f09500]"
        >
          <Upload size={17} strokeWidth={2.4} />
          Upload Document
        </button>
      </div>

      <div className="mb-[24px] rounded-[8px] border border-[#d8dde3] bg-white p-[16px]">
        <div className="flex flex-col gap-[18px] lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-[15px] top-1/2 -translate-y-1/2 text-[#687586]" size={21} strokeWidth={2} />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search Documents"
              className="h-[48px] w-full rounded-[8px] border border-[#d8dde3] bg-white pl-[44px] pr-[16px] text-[16px] font-normal text-[#2b3b4d] outline-none placeholder:text-[#9aa4b2]"
            />
          </div>
          <Filter className="hidden shrink-0 text-[#687586] lg:block" size={21} strokeWidth={2} />
          <div className="relative h-[48px] w-full lg:w-[183px]">
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="h-full w-full appearance-none rounded-[8px] border border-[#d8dde3] bg-white px-[16px] pr-[42px] text-[14px] font-normal text-[#666666] outline-none"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-[16px] top-1/2 -translate-y-1/2 text-[#666666]" size={20} />
          </div>
        </div>
      </div>

      {pendingDocs.length > 0 && (
        <div className="mb-[25px] overflow-hidden rounded-[8px] border border-[#ffdc29] bg-[#fffbc0] p-[9px]">
          <div className="flex h-[67px] items-center gap-[15px] px-[24px] text-[#895000]">
            <Clock size={20} strokeWidth={2} />
            <div>
              <h2 className="text-[20px] font-semibold leading-none">Pending Approval</h2>
              <p className="mt-[5px] max-w-[245px] text-[15px] font-normal leading-[20px]">
                {pendingDocs.length} document waiting for admin approval
              </p>
            </div>
          </div>
          {pendingDocs.map((doc) => (
            <div key={doc.id} className="flex min-h-[76px] items-center justify-between rounded-[8px] border border-[#ffdc29] bg-white px-[24px]">
              <div className="flex items-center gap-[15px]">
                <FileText size={23} className="text-[#687586]" />
                <div>
                  <p className="mb-[5px] text-[15px] font-semibold leading-none text-[#2b3b4d]">{doc.name}</p>
                  <p className="text-[14px] font-normal leading-none text-[#687586]">
                    {doc.category} <span className="mx-[9px]">•</span> {doc.size} <span className="mx-[9px]">•</span> {doc.uploadDate}
                  </p>
                </div>
              </div>
              <span className="inline-flex h-[43px] items-center gap-[9px] rounded-[8px] bg-[#fff2c6] px-[16px] text-[15px] font-normal text-[#895000]">
                <Clock size={15} />
                Pending
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="overflow-hidden rounded-[8px] border border-[#d8dde3] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left">
            <thead>
              <tr className="h-[57px] bg-[#f7f7f8] text-[16px] font-semibold text-[#666666]">
                <th className="w-[32%] px-[16px]">Document</th>
                <th className="w-[18%] px-[16px]">Category</th>
                <th className="w-[16%] px-[16px]">Student</th>
                <th className="w-[13%] px-[16px]">Upload Date</th>
                <th className="w-[9%] px-[16px]">Size</th>
                <th className="w-[12%] px-[16px] text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e7e7e7]">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="h-[65px] text-[16px] font-normal text-[#666666]">
                  <td className="px-[16px]">
                    <div className="flex items-center gap-[14px]">
                      {getFileIcon(doc.type, 23)}
                      <span className="font-medium text-[#111111]">{doc.name}</span>
                    </div>
                  </td>
                  <td className="px-[16px]">{doc.category}</td>
                  <td className="px-[16px]">{doc.student}</td>
                  <td className="px-[16px]">{doc.uploadDate}</td>
                  <td className="px-[16px]">{doc.size}</td>
                  <td className="px-[16px]">
                    <div className="flex items-center justify-center gap-[20px]">
                      <button type="button" onClick={() => openDocModal(doc, "view")} className="text-[#666666] hover:text-[#ffa313]" aria-label="View document">
                        <Eye size={16} strokeWidth={2} />
                      </button>
                      <button type="button" onClick={() => openDocModal(doc, "download")} className="text-[#666666] hover:text-[#ffa313]" aria-label="Download document">
                        <Download size={16} strokeWidth={2} />
                      </button>
                      <button type="button" onClick={() => openDocModal(doc, "delete")} className="text-[#ff2f3d] hover:text-[#d10010]" aria-label="Delete document">
                        <Trash2 size={16} strokeWidth={2} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-[25px] rounded-[8px] border border-[#d8dde3] bg-white px-[24px] py-[22px]">
        <div className="mb-[12px] flex items-center justify-between">
          <h2 className="text-[19px] font-semibold leading-none text-[#111111]">Storage Usage</h2>
          <p className="text-[16px] font-normal leading-none text-[#666666]">{currentUsedMB.toFixed(1)} MB / 1 GB</p>
        </div>
        <div className="h-[8px] overflow-hidden rounded-full bg-[#e1e4e8]">
          <div className="h-full rounded-full bg-[#ffa313]" style={{ width: `${Math.min(storagePercentage, 100)}%` }} />
        </div>
      </div>

      <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Upload Document" width="max-w-[670px]">
        <div className="px-[24px] pb-[18px] pt-[24px]">
          <label className="flex min-h-[207px] cursor-pointer flex-col items-center justify-center rounded-[8px] border border-[#d8dde3] bg-white text-center">
            <Upload className="mb-[18px] text-[#6c757d]" size={42} strokeWidth={1.8} />
            <p className="text-[15px] font-normal leading-none text-[#2b3b4d]">{pendingUpload ? pendingUpload.name : "Drop files here or click to browse"}</p>
            <p className="mt-[12px] text-[12px] font-normal leading-none text-[#6c757d]">Maximum file size: 50MB</p>
            <input type="file" className="hidden" onChange={handleFileUpload} />
          </label>
          <div className="mt-[20px]">
            <label className="mb-[9px] block text-[16px] font-normal leading-none text-[#6c757d]">Category</label>
            <div className="flex h-[43px] w-full items-center rounded-[8px] border border-[#d8dde3] bg-white px-[10px] text-[16px] font-normal text-[#6c757d]">
              Academic Resources
            </div>
          </div>
          <div className="mt-[16px]">
            <label className="mb-[9px] block text-[16px] font-normal leading-none text-[#6c757d]">Share with (optional)</label>
            <div className="flex h-[43px] w-full items-center rounded-[8px] border border-[#d8dde3] bg-white px-[10px] text-[16px] font-normal text-[#6c757d]">
              All Students
            </div>
          </div>
        </div>
        <ModalFooter>
          <button type="button" onClick={() => setIsUploadModalOpen(false)} className="h-[39px] rounded-[8px] border border-[#d8dde3] bg-white px-[18px] text-[15px] font-medium text-[#2b3b4d]">
            Cancel
          </button>
          <button
            type="button"
            onClick={confirmUpload}
            disabled={!pendingUpload}
            className={`h-[39px] rounded-[8px] px-[20px] text-[15px] font-medium text-white ${pendingUpload ? "bg-[#ffa313]" : "bg-[#ffd28a]"}`}
          >
            Upload
          </button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Document Submitted for Approval"
        icon={
          <span className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-[#fff2a8] text-[#ffa313]">
            <Clock size={20} />
          </span>
        }
      >
        <div className="px-[24px] py-[24px]">
          <div className="mb-[16px] flex h-[56px] items-center gap-[16px] rounded-[8px] bg-[#f8f9fb] px-[18px]">
            <FileText className="text-[#687586]" size={22} />
            <span className="text-[14px] font-normal text-[#687586]">{pendingUpload?.size || "1.2 MB"}</span>
          </div>
          <div className="mb-[17px] rounded-[8px] border border-[#ffdc29] bg-[#fffce6] px-[17px] py-[15px] text-[#a95c00]">
            <div className="flex gap-[12px]">
              <span className="mt-[8px] h-[6px] w-[6px] shrink-0 rounded-full border border-[#ffa313]" />
              <div>
                <h4 className="mb-[7px] text-[15px] font-semibold leading-none">Pending Admin Approval</h4>
                <p className="text-[15px] font-normal leading-[20px]">
                  Your document has been uploaded successfully and is now waiting for administrator approval. You'll be notified once it's been reviewed and approved.
                </p>
              </div>
            </div>
          </div>
          <div className="mb-[25px] text-[15px] leading-[25px] text-[#687586]">
            <p className="font-semibold">Upload Details:</p>
            <p className="pl-[16px]">Category: Academic Resources</p>
            <p className="pl-[16px]">Shared with: All Students</p>
            <p className="pl-[16px]">Upload date: {new Date().toISOString().split("T")[0]}</p>
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={() => setIsSuccessModalOpen(false)} className="h-[38px] rounded-[8px] bg-[#ffa313] px-[24px] text-[14px] font-semibold text-white">
              OK, Got It
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Document Details" width="max-w-[672px]">
        <div className="px-[24px] py-[24px]">
          <DocumentSummary doc={activeDoc} />
          <div className="mb-[21px] grid grid-cols-2 gap-x-[82px] gap-y-[17px]">
            <DetailItem icon={<ModalSvgIcon src="/images/mentor-doc-detail-category.svg" />} label="Category" value={activeDoc?.category} />
            <DetailItem icon={<ModalSvgIcon src="/images/mentor-doc-detail-date.svg" />} label="Upload Date" value={activeDoc?.uploadDate} />
            <DetailItem icon={<ModalSvgIcon src="/images/mentor-doc-detail-user.svg" />} label="Shared With" value={activeDoc?.student} />
            <DetailItem icon={<ModalSvgIcon src="/images/mentor-doc-detail-size.svg" />} label="File Size" value={activeDoc?.size} />
          </div>
          <div className="mb-[26px] rounded-[8px] border border-[#9cccff] bg-[#eef6ff] px-[17px] py-[15px] text-[15px] font-normal text-[#0b47d9]">
            This is a preview of the document information. Click "Download" to access the full file.
          </div>
        </div>
        <ModalFooter>
          <button type="button" onClick={() => setIsViewModalOpen(false)} className="h-[38px] rounded-[8px] border border-[#d8dde3] bg-white px-[33px] text-[15px] font-medium text-[#2b3b4d]">
            Close
          </button>
          <button type="button" onClick={() => downloadFile(activeDoc)} className="inline-flex h-[38px] items-center gap-[7px] rounded-[8px] bg-[#ffa313] px-[24px] text-[15px] font-medium text-white">
            <Download size={17} />
            Download
          </button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={isDownloadModalOpen} onClose={() => setIsDownloadModalOpen(false)} title="Download Document">
        <div className="px-[24px] py-[24px]">
          <DocumentSummary doc={activeDoc} />
          <p className="text-[15px] font-normal text-[#687586]">This file will be downloaded to your default Downloads folder.</p>
        </div>
        <ModalFooter>
          <button type="button" onClick={() => setIsDownloadModalOpen(false)} className="h-[38px] rounded-[8px] border border-[#d8dde3] bg-white px-[24px] text-[15px] font-medium text-[#2b3b4d]">
            Cancel
          </button>
          <button type="button" onClick={() => downloadFile(activeDoc)} className="inline-flex h-[38px] items-center gap-[7px] rounded-[8px] bg-[#ffa313] px-[24px] text-[15px] font-medium text-white">
            <Download size={17} />
            Download
          </button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Document">
        <div className="px-[24px] py-[24px]">
          <div className="mb-[16px] rounded-[8px] border border-[#ffa9ae] bg-[#fff0f1]">
            <DocumentSummary doc={activeDoc} compact />
          </div>
          <div className="rounded-[8px] border border-[#ffa9ae] bg-[#fff0f1] px-[17px] py-[17px] text-[#d10010]">
            <p className="text-[15px] font-bold leading-none">Warning:</p>
            <p className="mt-[5px] text-[15px] font-normal leading-[20px]">
              This action cannot be undone. The document will be permanently deleted from the system.
            </p>
          </div>
        </div>
        <ModalFooter>
          <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="h-[38px] rounded-[8px] border border-[#d8dde3] bg-white px-[23px] text-[15px] font-medium text-[#2b3b4d]">
            Cancel
          </button>
          <button type="button" onClick={deleteDocument} className="inline-flex h-[38px] items-center gap-[9px] rounded-[8px] bg-[#ff2f3d] px-[18px] text-[15px] font-medium text-white">
            <Trash2 size={17} />
            Delete Document
          </button>
        </ModalFooter>
      </Modal>
    </section>
  );
}

const DocumentSummary = ({ doc, compact = false }: { doc: DocumentItem | null; compact?: boolean }) => (
  <div className={`flex items-center gap-[17px] rounded-[8px] ${compact ? "bg-transparent px-[18px] py-[17px]" : "mb-[18px] bg-[#f8f9fb] px-[18px] py-[16px]"}`}>
    {getFileIcon(doc?.type, 23)}
    <div>
      <p className="mb-[6px] text-[14px] font-semibold leading-none text-[#2b3b4d]">{doc?.name}</p>
      <p className="text-[14px] font-normal leading-none text-[#687586]">{doc?.size}</p>
    </div>
  </div>
);

const DetailItem = ({ icon, label, value }: { icon: ReactNode; label: string; value?: string }) => (
  <div className="flex items-start gap-[14px] text-[#687586]">
    <span className="mt-[2px]">{icon}</span>
    <div>
      <p className="text-[13px] font-normal leading-none text-[#687586]">{label}</p>
      <p className="mt-[5px] text-[15px] font-medium leading-none text-[#2b3b4d]">{value}</p>
    </div>
  </div>
);

const ModalFooter = ({ children }: { children: ReactNode }) => (
  <div className="flex h-[88px] items-center justify-end gap-[12px] border-t border-[#d8dde3] px-[24px]">{children}</div>
);
