"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock, Eye, Search, X, XCircle } from "lucide-react";
import { listSponsorshipRequests, reviewSponsorshipRequest } from "@/lib/data/sponsorship-requests";
import type {
  AdminSponsorshipRequest,
  RequestDecision,
  RequestStatus,
  SponsorshipRequestsData,
} from "@/lib/data/sponsorship-requests.types";

type Request = AdminSponsorshipRequest;
type Filter = RequestStatus | "all";

const STATUS_LABEL: Record<RequestStatus, string> = {
  pending: "Pending",
  under_review: "Under review",
  approved: "Approved",
  rejected: "Rejected",
};

const statusBadgeClass: Record<RequestStatus, string> = {
  pending: "bg-[#dbeafe] text-[#2f80ff]",
  under_review: "bg-[#fef3c7] text-[#c77700]",
  approved: "bg-[#d9f8e6] text-[#009a3d]",
  rejected: "bg-[#ffe1e1] text-[#c90000]",
};

const tierClass: Record<string, string> = {
  Platinum: "bg-[#eef0f3] text-[#4b5563]",
  Gold: "bg-[#fff4d6] text-[#b7791f]",
  Silver: "bg-[#f1f5f9] text-[#64748b]",
  Bronze: "bg-[#fbe9dd] text-[#a0522d]",
};

const money = (v: number) => `$${v.toLocaleString("en-US")}`;
const isOpen = (s: RequestStatus) => s === "pending" || s === "under_review";

const StatusBadge = ({ status }: { status: RequestStatus }) => (
  <span className={`inline-flex h-[24px] shrink-0 items-center rounded-full px-[12px] text-[13px] font-medium leading-none ${statusBadgeClass[status]}`}>
    {STATUS_LABEL[status]}
  </span>
);

export default function SponsorshipRequestsAdmin() {
  const [data, setData] = useState<SponsorshipRequestsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modal, setModal] = useState<"approve" | "reject" | null>(null);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = async (preferId?: string | null) => {
    setLoading(true);
    try {
      const d = await listSponsorshipRequests();
      setData(d);
      setSelectedId((prev) => {
        const want = preferId ?? prev;
        if (want && d.requests.some((r) => r.id === want)) return want;
        return d.requests[0]?.id ?? null;
      });
    } catch (e) {
      setNotice({ type: "error", msg: (e as Error).message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // A notification links here as ?id=<request>; open that one first.
    const linked = new URLSearchParams(window.location.search).get("id");
    refresh(linked);
  }, []);

  const requests = data?.requests ?? [];
  const selected = requests.find((r) => r.id === selectedId) ?? null;

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return requests.filter((r) => {
      const matchesStatus = filter === "all" || r.status === filter;
      const matchesSearch =
        !q ||
        [r.ref, r.programName, r.companyName, r.contactName, r.email, r.sponsorName, r.tier]
          .join(" ")
          .toLowerCase()
          .includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [requests, search, filter]);

  const decide = async (decision: RequestDecision) => {
    if (!selected || busy) return;
    if (decision === "reject" && !notes.trim()) {
      setNotice({ type: "error", msg: "Please give a reason so the sponsor knows why it was rejected." });
      return;
    }
    setBusy(true);
    const res = await reviewSponsorshipRequest(selected.id, decision, notes);
    setBusy(false);
    if (res.error) {
      setNotice({ type: "error", msg: res.error });
      return;
    }
    setModal(null);
    setNotes("");
    setNotice({
      type: "success",
      msg:
        decision === "approve"
          ? `${selected.ref} approved — the sponsorship is now active on ${selected.sponsorName}'s dashboard and they've been notified.`
          : decision === "reject"
            ? `${selected.ref} rejected — the sponsor has been notified with your reason.`
            : `${selected.ref} marked as under review — the sponsor has been notified.`,
    });
    await refresh(selected.id);
  };

  const stats = data?.stats ?? { total: 0, pending: 0, underReview: 0, approved: 0, rejected: 0 };
  const filters: { id: Filter; label: string; count: number }[] = [
    { id: "all", label: "All", count: stats.total },
    { id: "pending", label: "Pending", count: stats.pending },
    { id: "under_review", label: "Under review", count: stats.underReview },
    { id: "approved", label: "Approved", count: stats.approved },
    { id: "rejected", label: "Rejected", count: stats.rejected },
  ];

  return (
    <div className="min-h-full bg-[#f4f4f4] px-4 py-6 font-[Poppins] md:px-6">
      <div className="mb-[24px] flex items-center gap-[12px]">
        <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-[8px] bg-[#fff7e8]">
          <span
            aria-hidden="true"
            className="block h-6 w-6 bg-[#F9A618]"
            style={{
              WebkitMaskImage: "url(/images/sponsor-sidebar-sponsorships.svg)",
              maskImage: "url(/images/sponsor-sidebar-sponsorships.svg)",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              maskPosition: "center",
              WebkitMaskSize: "contain",
              maskSize: "contain",
            }}
          />
        </div>
        <div>
          <h1 className="text-[24px] font-semibold leading-none text-[#111111]">Sponsorship Requests</h1>
          <p className="mt-[7px] text-[16px] font-normal leading-tight text-[#666666]">
            Review sponsorship requests and approve or reject them
          </p>
        </div>
      </div>

      {notice && (
        <div
          className={`mb-4 flex items-start justify-between gap-4 rounded-[8px] border px-4 py-3 text-[14px] font-semibold ${
            notice.type === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          <span className="break-words">{notice.msg}</span>
          <button type="button" onClick={() => setNotice(null)} className="shrink-0 text-[13px] underline">
            Dismiss
          </button>
        </div>
      )}

      <div className="mb-[24px] grid grid-cols-2 gap-[14px] sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Total Requests" value={stats.total} color="text-[#F9A618]" />
        <StatCard label="Pending" value={stats.pending} color="text-[#2f80ff]" />
        <StatCard label="Under Review" value={stats.underReview} color="text-[#c77700]" />
        <StatCard label="Approved" value={stats.approved} color="text-[#00a641]" />
        <StatCard label="Rejected" value={stats.rejected} color="text-[#e0342b]" />
      </div>

      <div className="grid grid-cols-1 gap-[24px] xl:grid-cols-[1fr_400px]">
        <section className="overflow-hidden rounded-[8px] border border-[#d6d6d6] bg-white">
          <div className="border-b border-[#d6d6d6] p-[16px] md:p-[24px]">
            <div className="flex h-[48px] items-center gap-[12px] rounded-[8px] border border-[#d6d6d6] bg-white px-[16px]">
              <Search size={18} className="shrink-0 text-[#666666]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by company, program, contact or REQ number..."
                className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-[#111111] outline-none placeholder:text-[#888888]"
              />
            </div>
            <div className="mt-[14px] flex flex-wrap gap-[8px]">
              {filters.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className={`flex h-[36px] items-center gap-[8px] rounded-[8px] border px-[12px] text-[14px] transition-colors ${
                    filter === f.id
                      ? "border-[#F9A618] bg-[#F9A618] text-white"
                      : "border-[#d8dde3] bg-white text-[#243041] hover:border-[#F9A618]"
                  }`}
                >
                  {f.label}
                  <span
                    className={`flex h-[20px] min-w-[20px] items-center justify-center rounded-full px-[6px] text-[12px] font-semibold ${
                      filter === f.id ? "bg-white text-[#667085]" : "bg-[#f1f3f5] text-[#667085]"
                    }`}
                  >
                    {f.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            {loading && !data && <p className="px-[16px] py-[20px] text-[14px] text-[#666666]">Loading requests...</p>}
            {!loading && filtered.length === 0 && (
              <p className="px-[16px] py-[40px] text-center text-[14px] text-[#666666]">
                {requests.length === 0
                  ? "No sponsorship requests yet. They appear here when a sponsor submits one from Request Donate."
                  : "No requests match your search or filter."}
              </p>
            )}
            {filtered.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedId(r.id)}
                className={`grid w-full grid-cols-[1fr_auto] gap-[16px] border-b border-[#e5e5e5] px-[16px] py-[15px] text-left transition-colors last:border-b-0 md:px-[24px] ${
                  selectedId === r.id ? "bg-[#fff8ec]" : "bg-white hover:bg-[#fffbf4]"
                }`}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-[10px] gap-y-[4px]">
                    <h2 className="truncate text-[16px] font-medium leading-tight text-[#111111]">{r.programName}</h2>
                    {r.tier !== "—" && (
                      <span className={`rounded-full px-[10px] py-[2px] text-[12px] font-medium ${tierClass[r.tier] ?? "bg-[#eeeeee] text-[#666666]"}`}>
                        {r.tier}
                      </span>
                    )}
                  </div>
                  <p className="mt-[6px] truncate text-[14px] text-[#444444]">
                    {r.companyName} <span className="text-[#999999]">·</span> {money(r.amount)}
                  </p>
                  <p className="mt-[6px] text-[12px] text-[#777777]">
                    {r.ref} · Submitted {r.submitted}
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </button>
            ))}
          </div>
        </section>

        <aside className="h-fit rounded-[8px] border border-[#d6d6d6] bg-white p-[20px] md:p-[24px] xl:sticky xl:top-0">
          {!selected ? (
            <p className="text-[15px] text-[#666666]">{loading ? "Loading..." : "Select a request to review it."}</p>
          ) : (
            <>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-[#999999]">{selected.ref}</p>
                  <h2 className="mt-[4px] break-words text-[19px] font-semibold leading-tight text-[#111111]">{selected.programName}</h2>
                </div>
                <StatusBadge status={selected.status} />
              </div>

              <PanelBlock label="Sponsorship">
                <Row k="Tier" v={selected.tier} />
                <Row k="Amount" v={money(selected.amount)} strong />
                <Row k="Duration" v={selected.durationMonths ? `${selected.durationMonths} months` : "Not specified"} />
                <Row k="Start date" v={selected.startDate} />
              </PanelBlock>

              <PanelBlock label="Company & contact">
                <Row k="Company" v={selected.companyName} />
                <Row k="Sponsor account" v={selected.sponsorName} />
                <Row k="Contact" v={selected.contactName} />
                <Row k="Email" v={selected.email} />
                <Row k="Phone" v={selected.phone} />
              </PanelBlock>

              <PanelBlock label="Requested benefits">
                {selected.benefits.length === 0 ? (
                  <p className="text-[14px] text-[#666666]">None selected</p>
                ) : (
                  <ul className="space-y-[6px]">
                    {selected.benefits.map((b) => (
                      <li key={b} className="flex items-start gap-[8px] text-[14px] text-[#111111]">
                        <CheckCircle2 size={16} className="mt-[2px] shrink-0 text-[#00a641]" />
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </PanelBlock>

              <PanelBlock label="Submitted">
                <p className="text-[14px] text-[#111111]">{selected.submitted}</p>
              </PanelBlock>

              {!isOpen(selected.status) && (
                <PanelBlock label={selected.status === "approved" ? "Approved" : "Rejected"}>
                  <p className="text-[14px] text-[#111111]">
                    {selected.reviewed}
                    {selected.reviewedBy ? ` by ${selected.reviewedBy}` : ""}
                  </p>
                  {selected.reviewNotes && (
                    <p className="mt-[8px] rounded-[6px] bg-[#f6f6f6] px-[12px] py-[10px] text-[14px] leading-[20px] text-[#333333]">
                      <span className="font-semibold">{selected.status === "rejected" ? "Reason: " : "Note: "}</span>
                      {selected.reviewNotes}
                    </p>
                  )}
                  {selected.status === "approved" && (
                    <p className="mt-[8px] text-[13px] text-[#666666]">
                      This request is now an active sponsorship on the sponsor&apos;s dashboard.
                    </p>
                  )}
                </PanelBlock>
              )}

              {isOpen(selected.status) && (
                <div className="mt-[20px] space-y-[10px]">
                  <button
                    type="button"
                    onClick={() => {
                      setNotes("");
                      setModal("approve");
                    }}
                    className="flex h-[44px] w-full items-center justify-center gap-[8px] rounded-[8px] bg-[#00ab42] text-[16px] font-medium text-white transition-colors hover:bg-[#009438]"
                  >
                    <CheckCircle2 size={18} />
                    Approve Request
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNotes("");
                      setModal("reject");
                    }}
                    className="flex h-[44px] w-full items-center justify-center gap-[8px] rounded-[8px] bg-[#e0342b] text-[16px] font-medium text-white transition-colors hover:bg-[#c92b23]"
                  >
                    <XCircle size={18} />
                    Reject Request
                  </button>
                  {selected.status === "pending" && (
                    <button
                      type="button"
                      onClick={() => decide("under_review")}
                      disabled={busy}
                      className="flex h-[44px] w-full items-center justify-center gap-[8px] rounded-[8px] border border-[#d8dde3] bg-white text-[16px] font-medium text-[#243041] transition-colors hover:border-[#F9A618] disabled:opacity-60"
                    >
                      <Eye size={18} />
                      Mark as Under Review
                    </button>
                  )}
                  <p className="flex items-start gap-[6px] pt-[4px] text-[12px] leading-[17px] text-[#777777]">
                    <Clock size={14} className="mt-[1px] shrink-0" />
                    Approving creates an active sponsorship for this sponsor. Approve and reject are final, and the sponsor is notified either way.
                  </p>
                </div>
              )}
            </>
          )}
        </aside>
      </div>

      {modal && selected && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-[480px] rounded-[10px] bg-white p-[24px] shadow-2xl">
            <div className="mb-[16px] flex items-center justify-between gap-4">
              <h3 className="text-[19px] font-semibold text-[#111111]">
                {modal === "approve" ? "Approve sponsorship request?" : "Reject sponsorship request?"}
              </h3>
              <button type="button" onClick={() => setModal(null)} aria-label="Close" className="text-[#666666] hover:text-[#111111]">
                <X size={20} />
              </button>
            </div>
            <p className="text-[14px] leading-[21px] text-[#555555]">
              <span className="font-semibold text-[#111111]">{selected.programName}</span> from {selected.companyName} —{" "}
              {money(selected.amount)}
              {selected.tier !== "—" ? ` (${selected.tier})` : ""}.
              {modal === "approve"
                ? " This creates an active sponsorship on the sponsor's dashboard."
                : " The sponsor will see your reason on their Request page."}
            </p>
            <label className="mt-[16px] block">
              <span className="mb-[6px] block text-[14px] font-medium text-[#444444]">
                {modal === "approve" ? "Note to the sponsor (optional)" : "Reason for rejection"}
              </span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                maxLength={1000}
                placeholder={modal === "approve" ? "e.g. Welcome aboard — we'll be in touch about next steps." : "e.g. This tier is fully booked for the current season."}
                className="w-full resize-none rounded-[8px] border border-[#d8dde3] px-[12px] py-[10px] text-[14px] text-[#111111] outline-none focus:border-[#F9A618]"
              />
            </label>
            <div className="mt-[18px] grid grid-cols-2 gap-[10px]">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="h-[42px] rounded-[8px] border border-[#d8dde3] bg-white text-[15px] text-[#444444] hover:bg-[#fafafa]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => decide(modal)}
                disabled={busy}
                className={`h-[42px] rounded-[8px] text-[15px] font-medium text-white disabled:opacity-60 ${
                  modal === "approve" ? "bg-[#00ab42] hover:bg-[#009438]" : "bg-[#e0342b] hover:bg-[#c92b23]"
                }`}
              >
                {busy ? "Saving..." : modal === "approve" ? "Approve" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-[8px] border border-[#d6d6d6] bg-white px-[18px] py-[16px]">
      <p className="text-[14px] text-[#666666]">{label}</p>
      <p className={`mt-[8px] text-[26px] font-semibold leading-none ${color}`}>{value}</p>
    </div>
  );
}

function PanelBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-[18px] border-t border-[#ececec] pt-[14px]">
      <p className="mb-[8px] text-[12px] font-semibold uppercase tracking-[0.04em] text-[#999999]">{label}</p>
      {children}
    </div>
  );
}

function Row({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-[3px] text-[14px]">
      <span className="shrink-0 text-[#666666]">{k}</span>
      <span className={`min-w-0 break-words text-right ${strong ? "font-semibold text-[#00a641]" : "text-[#111111]"}`}>{v}</span>
    </div>
  );
}
