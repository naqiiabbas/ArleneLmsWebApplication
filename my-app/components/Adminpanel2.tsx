"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, FileText, AlertCircle, XCircle, Download, X, ChevronRight, ClipboardList } from "lucide-react";
import { listDocuments, setDocumentStatus, getDocumentDownloadUrl } from "@/lib/data/documents";
import type { UIDocument } from "@/lib/data/documents.types";
import type { AdminDashboard, DashboardAlert } from "@/lib/data/dashboard.types";

const RECENT_DOCS = 5;

const ALERT_STYLE: Record<DashboardAlert["kind"], { icon: React.ElementType; color: string; bg: string }> = {
  documents: { icon: FileText, color: "text-[#F9A618]", bg: "bg-orange-50" },
  absences: { icon: FileText, color: "text-[#F9A618]", bg: "bg-orange-50" },
  notes: { icon: ClipboardList, color: "text-[#F9A618]", bg: "bg-orange-50" },
  attendance: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-50" },
};

/** Round a chart's max up to a tidy value so axis ticks are whole numbers. */
const niceMax = (n: number) => {
  if (n <= 4) return 4;
  const step = Math.pow(10, Math.floor(Math.log10(n)));
  return Math.ceil(n / step) * step;
};

const ModalWrapper = ({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-[670px] overflow-hidden rounded-[8px] bg-white shadow-2xl">{children}</div>
    </div>
  );
};

export default function Adminpanel2({ data }: { data: AdminDashboard | null }) {
  const router = useRouter();
  const weekly = data?.weekly ?? ["Mon", "Tue", "Wed", "Thu", "Fri"].map((day) => ({ day, date: "", present: 0, absent: 0, late: 0 }));
  const totals = weekly.reduce(
    (acc, d) => ({ present: acc.present + d.present, absent: acc.absent + d.absent, late: acc.late + d.late }),
    { present: 0, absent: 0, late: 0 }
  );
  const alerts = data?.alerts ?? [];

  // Overview chart: attended (present + late) vs absent.
  const overviewMax = niceMax(Math.max(1, ...weekly.map((d) => Math.max(d.present + d.late, d.absent))));
  const overviewTicks = [4, 3, 2, 1, 0].map((i) => Math.round((overviewMax / 4) * i));
  const monitorMax = niceMax(Math.max(1, ...weekly.map((d) => Math.max(d.present, d.absent, d.late))));

  const [docs, setDocs] = useState<UIDocument[]>([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [docsError, setDocsError] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<UIDocument | null>(null);
  const [modalType, setModalType] = useState<"view" | "approve" | "reject" | null>(null);
  const [busy, setBusy] = useState(false);
  const [modalError, setModalError] = useState("");

  const loadDocs = async () => {
    setDocsLoading(true);
    setDocsError("");
    try {
      setDocs((await listDocuments()).slice(0, RECENT_DOCS));
    } catch (e) {
      setDocsError((e as Error).message);
    } finally {
      setDocsLoading(false);
    }
  };

  useEffect(() => {
    loadDocs();
  }, []);

  const openModal = (type: "view" | "approve" | "reject", doc: UIDocument) => {
    setModalError("");
    setSelectedDoc(doc);
    setModalType(type);
  };

  const closeModal = () => {
    if (busy) return;
    setModalType(null);
    setSelectedDoc(null);
  };

  // Approve / Reject now persist (they only changed local state before).
  const updateStatus = async (status: "Approved" | "Rejected") => {
    if (!selectedDoc || busy) return;
    setBusy(true);
    setModalError("");
    try {
      const res = await setDocumentStatus(selectedDoc.id, status);
      if (res.error) {
        setModalError(res.error);
        return;
      }
      setModalType(null);
      setSelectedDoc(null);
      await loadDocs();
      router.refresh(); // pending-approval stat + alerts
    } catch (e) {
      setModalError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  // Downloads the real file (it used to save a text file containing "Data: <name>").
  const download = async () => {
    if (!selectedDoc || busy) return;
    setBusy(true);
    setModalError("");
    try {
      const res = await getDocumentDownloadUrl(selectedDoc.id);
      if (res.error || !res.url) {
        setModalError(res.error ?? "Could not get a download link.");
        return;
      }
      window.open(res.url, "_blank", "noopener,noreferrer");
    } catch (e) {
      setModalError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5 bg-[#f4f4f4] px-4 pb-0 pt-5 font-[Poppins] md:px-6">
      {/* 1. Weekly attendance overview */}
      <div className="rounded-[8px] border border-[#dddddd] bg-white px-6 py-6">
        <div className="mb-[24px] flex items-baseline justify-between gap-3">
          <h3 className="text-[21px] font-normal leading-none text-[#242424]">Weekly Attendance Overview</h3>
          <span className="text-[12px] text-[#999999]">This week (Mon–Fri)</span>
        </div>
        <div className="relative h-[265px] pr-[10px]">
          <div className="absolute bottom-[32px] left-0 top-0 flex w-[32px] flex-col justify-between text-right text-[12px] leading-none text-[#777777]">
            {overviewTicks.map((tick, i) => (
              <span key={i}>{tick}</span>
            ))}
          </div>
          <div className="absolute bottom-[32px] left-[42px] right-[8px] top-0 border-b border-l border-[#9b9b9b]">
            {[0, 1, 2, 3].map((line) => (
              <div key={line} className="absolute left-0 right-0 border-t border-dashed border-[#d6d6d6]" style={{ top: `${line * 25}%` }} />
            ))}
            <div className="absolute inset-x-[18px] bottom-0 top-0 flex items-end justify-between">
              {weekly.map((item) => (
                <div key={item.day} className="flex h-full w-[18%] items-end justify-center gap-[2px]" title={`${item.day}: ${item.present + item.late} attended, ${item.absent} absent`}>
                  <div className="w-[48%] bg-[#F9A618]" style={{ height: `${((item.present + item.late) / overviewMax) * 100}%` }} />
                  <div className="w-[48%] bg-[#ef493d]" style={{ height: `${(item.absent / overviewMax) * 100}%` }} />
                </div>
              ))}
            </div>
          </div>
          <div className="absolute bottom-0 left-[42px] right-[8px] flex justify-around text-[12px] leading-none text-[#777777]">
            {weekly.map((item) => (
              <span key={item.day}>{item.day}</span>
            ))}
          </div>
        </div>
        <div className="mt-[13px] flex justify-center gap-[14px] text-[16px] font-normal leading-none">
          <div className="flex items-center gap-[4px] text-[#F9A618]"><span className="h-[12px] w-[12px] bg-[#F9A618]" />Present</div>
          <div className="flex items-center gap-[4px] text-[#ef493d]"><span className="h-[12px] w-[12px] bg-[#ef493d]" />Absent</div>
        </div>
        {totals.present + totals.late + totals.absent === 0 && (
          <p className="mt-3 text-center text-[12px] text-[#999999]">No attendance recorded this week yet.</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* 2. Attendance monitoring */}
        <div className="overflow-hidden rounded-[8px] border border-[#dddddd] bg-white lg:col-span-2">
          <div className="border-b border-[#eeeeee] px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[8px] bg-[#fff7e8]">
                <img src="/images/admin-icon-20.svg" alt="" className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-[17px] font-semibold text-[#242424]">Attendance Monitoring</h3>
                <p className="text-[11px] text-[#777777]">This Week&apos;s Overview</p>
              </div>
            </div>
          </div>
          <div className="bg-[#fff7e8] px-5 py-4">
            <div className="flex h-40 items-end justify-between border-b border-dashed border-gray-100 px-2">
              {weekly.map((item) => (
                <div key={item.day} className="flex flex-1 flex-col items-center">
                  <div className="flex h-32 items-end gap-1">
                    <div className="w-5 rounded-t-sm bg-[#EE4D4D]" style={{ height: `${(item.absent / monitorMax) * 100}%` }} title={`Absent: ${item.absent}`} />
                    <div className="w-5 rounded-t-sm bg-[#F9A618]" style={{ height: `${(item.present / monitorMax) * 100}%` }} title={`Present: ${item.present}`} />
                    <div className="w-5 rounded-t-sm bg-[#EAB308] opacity-40" style={{ height: `${(item.late / monitorMax) * 100}%` }} title={`Late: ${item.late}`} />
                  </div>
                  <span className="mt-2 text-[10px] text-gray-400">{item.day}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#F9A618]" /><span className="text-[10px] text-gray-500">Present: {totals.present}</span></div>
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#EE4D4D]" /><span className="text-[10px] text-gray-500">Absent: {totals.absent}</span></div>
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#EAB308]" /><span className="text-[10px] text-gray-500">Late: {totals.late}</span></div>
            </div>
            <Link href="/adminpanel/attencont" className="flex items-center gap-1 text-[11px] font-bold text-[#F9A618]">
              Full Report <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        {/* 3. Alerts */}
        <div className="relative flex flex-col rounded-[8px] border border-[#dddddd] bg-white p-5">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="text-[#F9A618]" size={20} />
              <h3 className="text-[17px] font-semibold text-[#242424]">Alerts &amp; Notifications</h3>
            </div>
            {alerts.length > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F9A618] text-[10px] font-bold text-white">{alerts.length}</span>
            )}
          </div>
          <div className="space-y-6">
            {alerts.length === 0 && <p className="py-6 text-center text-[12px] text-[#999999]">All caught up — nothing needs attention.</p>}
            {alerts.map((alert) => {
              const style = ALERT_STYLE[alert.kind];
              const Icon = style.icon;
              return (
                <Link key={alert.id} href={alert.href} className="relative flex gap-3 rounded-lg transition-colors hover:bg-gray-50">
                  <div className={`${style.bg} h-fit rounded-xl p-2.5`}><Icon className={style.color} size={18} /></div>
                  <div className="flex-1">
                    <h4 className="text-[12px] font-bold text-gray-800">{alert.title}</h4>
                    <p className="text-[10px] leading-relaxed text-gray-500">{alert.desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>
          <Link href="/adminpanel/notification" className="mt-auto block w-full pt-8 text-center text-[11px] font-bold text-[#F9A618] hover:underline">
            View All Notifications
          </Link>
        </div>
      </div>

      {/* 4. Recent documents */}
      <div className="overflow-hidden rounded-[8px] border border-[#dddddd] bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-[#eeeeee] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[8px] bg-[#fff7e8]">
              <img src="/images/admin-icon-20.svg" alt="" className="h-5 w-5" />
            </div>
            <h3 className="text-[17px] font-semibold text-[#242424]">Recent Documents</h3>
          </div>
          <Link href="/adminpanel/documents" className="flex items-center gap-1 text-[11px] font-bold text-[#F9A618]">
            All Documents <ChevronRight size={14} />
          </Link>
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
              {docsLoading && <tr><td colSpan={6} className="py-10 text-center text-[12px] text-gray-400">Loading documents...</td></tr>}
              {!docsLoading && docsError && <tr><td colSpan={6} className="py-10 text-center text-[12px] text-red-500">{docsError}</td></tr>}
              {!docsLoading && !docsError && docs.length === 0 && (
                <tr><td colSpan={6} className="py-10 text-center text-[12px] text-gray-400">No documents uploaded yet.</td></tr>
              )}
              {!docsLoading &&
                docs.map((doc) => (
                  <tr key={doc.id} className="transition-colors hover:bg-gray-50/50">
                    <td className="px-6 py-4 text-[12px] font-semibold text-[#444444]">{doc.name}</td>
                    <td className="px-6 py-4 text-xs text-gray-500">{doc.uploader}</td>
                    <td className="px-6 py-4 text-xs text-gray-500">{doc.category}</td>
                    <td className="px-6 py-4 text-xs text-gray-500">{doc.date}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-bold ${
                          doc.status === "Approved" ? "bg-green-50 text-[#00A348]" : doc.status === "Rejected" ? "bg-red-50 text-[#E10000]" : "bg-orange-50 text-[#F9A618]"
                        }`}
                      >
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-4">
                        <button type="button" onClick={() => openModal("view", doc)} aria-label="View document">
                          <img src="/images/admin-icon-22.svg" alt="" className="h-4 w-4" />
                        </button>
                        {doc.status === "Pending" && (
                          <>
                            <button type="button" onClick={() => openModal("approve", doc)} aria-label="Approve document">
                              <img src="/images/admin-icon-40.svg" alt="" aria-hidden="true" className="h-4 w-4" />
                            </button>
                            <button type="button" onClick={() => openModal("reject", doc)} aria-label="Reject document">
                              <XCircle size={16} className="text-[#E10000]" />
                            </button>
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

      {/* View */}
      <ModalWrapper isOpen={modalType === "view"}>
        <div className="px-6 pb-6 pt-[30px] font-[Poppins]">
          <div className="mb-[28px] flex items-center justify-between">
            <h2 className="text-[21px] font-semibold leading-none text-[#242424]">Document Details</h2>
            <button type="button" onClick={closeModal} className="text-[#777777] hover:text-[#242424]" aria-label="Close"><X size={22} /></button>
          </div>
          {modalError && <p className="mb-4 rounded-[8px] border border-red-200 bg-red-50 px-3 py-2 text-[14px] font-medium text-red-700">{modalError}</p>}
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
                <DetailItem label="Uploaded By" value={selectedDoc.uploader} />
                <DetailItem label="Upload Date" value={selectedDoc.date} />
                <DetailItem label="File Type" value={selectedDoc.type} />
                <DetailItem label="File Size" value={selectedDoc.size} />
              </div>
              <div className="flex gap-[12px] border-t border-[#dddddd] pt-[17px]">
                <button type="button" disabled={busy} onClick={download} className="flex h-[40px] flex-1 items-center justify-center gap-2 rounded-[8px] bg-[#dcb957] text-[16px] font-semibold text-white disabled:opacity-60">
                  <Download size={18} /> Download
                </button>
                {selectedDoc.status === "Pending" && (
                  <>
                    <button type="button" disabled={busy} onClick={() => updateStatus("Approved")} className="flex h-[40px] flex-1 items-center justify-center gap-2 rounded-[8px] bg-[#00a63e] text-[16px] font-semibold text-white disabled:opacity-60">
                      <img src="/images/admin-icon-31.svg" alt="" aria-hidden="true" className="h-4 w-4" /> Approve
                    </button>
                    <button type="button" disabled={busy} onClick={() => updateStatus("Rejected")} className="flex h-[40px] flex-1 items-center justify-center gap-2 rounded-[8px] bg-[#e7000b] text-[16px] font-semibold text-white disabled:opacity-60">
                      <XCircle size={18} /> Reject
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </ModalWrapper>

      {/* Approve / reject confirm */}
      <ModalWrapper isOpen={modalType === "approve" || modalType === "reject"}>
        <div className="p-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">{modalType === "approve" ? "Approve" : "Reject"} Document</h2>
            <button type="button" onClick={closeModal} aria-label="Close"><X size={20} className="text-gray-400" /></button>
          </div>
          {modalError && <p className="mb-4 rounded-[8px] border border-red-200 bg-red-50 px-3 py-2 text-[14px] font-medium text-red-700">{modalError}</p>}
          <p className="mb-10 font-medium leading-relaxed text-gray-500">
            Are you sure you want to {modalType} the document <br />
            <span className="font-bold text-gray-800">&quot;{selectedDoc?.name}&quot;</span>?
          </p>
          <div className="flex gap-4">
            <button
              type="button"
              disabled={busy}
              onClick={() => updateStatus(modalType === "approve" ? "Approved" : "Rejected")}
              className={`flex-1 ${modalType === "approve" ? "bg-[#00A348]" : "bg-[#E10000]"} rounded-xl py-4 font-bold text-white shadow-lg disabled:opacity-60`}
            >
              {busy ? "Saving..." : modalType === "approve" ? "Approve" : "Reject"}
            </button>
            <button type="button" disabled={busy} onClick={closeModal} className="flex-1 rounded-xl border border-gray-200 py-4 font-bold text-gray-500 hover:bg-gray-50 disabled:opacity-60">
              Cancel
            </button>
          </div>
        </div>
      </ModalWrapper>
    </div>
  );
}

const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="mb-[8px] text-[14px] font-semibold leading-none text-[#777777]">{label}</p>
    <p className="text-[14px] font-semibold leading-none text-[#242424]">{value || "—"}</p>
  </div>
);
