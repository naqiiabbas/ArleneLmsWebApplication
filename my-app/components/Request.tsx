"use client";

import React, { useMemo, useState } from "react";

type ReqStatus = "Approved" | "Under review" | "Pending";
type Tier = "Platinum" | "Gold" | "Silver" | "Bronze";

type RequestItem = {
  id: string;
  programName: string;
  tier: Tier;
  amount: number;
  status: ReqStatus;
  submitted: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  durationMonths: number;
  startDate: string;
  benefits: string[];
};

type View = "list" | "form" | "detail" | "success";

const benefitOptions = [
  "Logo placement on website",
  "Social media recognition",
  "Event sponsorship opportunities",
  "Quarterly impact reports",
  "Annual gala recognition",
  "Press release mentions",
];

const initialRequests: RequestItem[] = [
  {
    id: "REQ-001",
    programName: "AI Development Program",
    tier: "Gold",
    amount: 35000,
    status: "Approved",
    submitted: "Jan 15, 2025",
    companyName: "TechCorp Inc.",
    contactName: "John Doe",
    email: "john@techcorp.com",
    phone: "+1 (555) 123-4567",
    durationMonths: 12,
    startDate: "2025-02-01",
    benefits: ["Logo on website", "Social media recognition", "Newsletter mention"],
  },
  {
    id: "REQ-002",
    programName: "Data Science Mentorship",
    tier: "Platinum",
    amount: 55000,
    status: "Under review",
    submitted: "Jan 20, 2025",
    companyName: "DataNova",
    contactName: "Sarah Khan",
    email: "hello@datanova.com",
    phone: "+1 (555) 222-8899",
    durationMonths: 6,
    startDate: "2025-03-01",
    benefits: ["Event sponsorship opportunities", "Quarterly impact reports"],
  },
];

const tierPrice: Record<Tier, string> = {
  Platinum: "$50,000+",
  Gold: "$30,000+",
  Silver: "$15,000+",
  Bronze: "$5,000+",
};

const tierDesc: Record<Tier, string> = {
  Platinum: "Premium sponsorship benefits including exclusive events",
  Gold: "Enhanced visibility and recognition opportunities",
  Silver: "Standard sponsorship package with good exposure",
  Bronze: "Entry-level sponsorship with basic benefits",
};

const money = (v: number) => `$${v.toLocaleString()}`;

const statusBadge = (status: ReqStatus) => {
  if (status === "Approved") return "border-[#6ee7b7] bg-[#dcfce7] text-[#00a63e]";
  if (status === "Under review") return "border-[#fcd34d] bg-[#fef3c7] text-[#ff9f0f]";
  return "border-[#93c5fd] bg-[#dbeafe] text-[#2f80ff]";
};

const statusIcon = (status: ReqStatus) => {
  if (status === "Approved") return "/images/request-icon-3.svg";
  if (status === "Under review") return "/images/request-icon-4.svg";
  return "/images/request-icon-5.svg";
};

const statCards = [
  { key: "total", label: "Total Requests", icon: "/images/request-icon-2.svg", color: "text-[#F9A618]" },
  { key: "approved", label: "Approved", icon: "/images/request-icon-3.svg", color: "text-[#00a63e]" },
  { key: "underReview", label: "Under Review", icon: "/images/request-icon-4.svg", color: "text-[#ff9f0f]" },
  { key: "pending", label: "Pending", icon: "/images/request-icon-5.svg", color: "text-[#2f80ff]" },
] as const;

export default function Request() {
  const [view, setView] = useState<View>("list");
  const [requests, setRequests] = useState<RequestItem[]>(initialRequests);
  const [selectedId, setSelectedId] = useState<string>(initialRequests[0].id);
  const [search] = useState("");
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    tier: "Gold" as Tier,
    programName: "",
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    amount: "",
    durationMonths: "",
    startDate: "",
    benefits: [] as string[],
  });
  const [validationError, setValidationError] = useState("");

  const selected = requests.find((r) => r.id === selectedId) || requests[0];

  const filteredRequests = useMemo(() => {
    if (!search.trim()) return requests;
    const q = search.toLowerCase();
    return requests.filter(
      (r) =>
        r.id.toLowerCase().includes(q) ||
        r.programName.toLowerCase().includes(q) ||
        r.companyName.toLowerCase().includes(q)
    );
  }, [requests, search]);

  const stats = useMemo(() => {
    const total = requests.length;
    const approved = requests.filter((r) => r.status === "Approved").length;
    const underReview = requests.filter((r) => r.status === "Under review").length;
    const pending = requests.filter((r) => r.status === "Pending").length;
    return { total, approved, underReview, pending };
  }, [requests]);

  const goStep = (next: number) => {
    setValidationError("");
    setStep(Math.max(1, Math.min(5, next)));
  };

  const stepIsComplete = (currentStep: number) => {
    if (currentStep === 1) return Boolean(form.tier);
    if (currentStep === 2) {
      return [form.programName, form.companyName, form.contactName, form.email, form.phone].every((value) => value.trim());
    }
    if (currentStep === 3) {
      return [form.amount, form.durationMonths, form.startDate].every((value) => value.trim());
    }
    if (currentStep === 4) return form.benefits.length > 0;
    return true;
  };

  const handleNext = () => {
    if (!stepIsComplete(step)) {
      setValidationError(step === 4 ? "Please select at least one benefit before continuing." : "Please fill all required fields before continuing.");
      return;
    }
    goStep(step + 1);
  };

  const submitRequest = () => {
    const newId = `REQ-${String(requests.length + 1).padStart(3, "0")}`;
    const req: RequestItem = {
      id: newId,
      programName: form.programName || "Community Growth",
      tier: form.tier,
      amount: Number(form.amount || 30000),
      status: "Pending",
      submitted: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      companyName: form.companyName || "New Company",
      contactName: form.contactName || "Primary Contact",
      email: form.email || "new@gmail.com",
      phone: form.phone || "+1 234 654 343",
      durationMonths: Number(form.durationMonths || 3),
      startDate: form.startDate || "Not specified",
      benefits: form.benefits.length ? form.benefits : benefitOptions,
    };
    setRequests((prev) => [req, ...prev]);
    setSelectedId(req.id);
    setView("success");
  };

  const resetForm = () => {
    setForm({
      tier: "Gold",
      programName: "",
      companyName: "",
      contactName: "",
      email: "",
      phone: "",
      amount: "",
      durationMonths: "",
      startDate: "",
      benefits: [],
    });
    setStep(1);
  };

  const startNew = () => {
    resetForm();
    setValidationError("");
    setView("form");
  };

  return (
    <div className="min-h-screen bg-[#F4F4F5] px-[24px] pb-[40px] pt-[28px] font-['Poppins',_sans-serif] text-[#1f2937]">
      {view === "list" && (
        <div>
          <div className="flex items-start justify-between gap-[20px]">
            <div>
              <h1 className="text-[28px] font-semibold leading-none text-[#1f2937]">Request Donate</h1>
              <p className="mt-[16px] text-[15px] font-normal leading-none text-[#667085]">View your submitted sponsorship requests and create new ones.</p>
            </div>
            <button onClick={startNew} className="flex h-[44px] items-center gap-[10px] rounded-[8px] bg-[#F9A618] px-[24px] text-[15px] font-normal text-white">
              <span className="text-[24px] leading-none">+</span>
              Add Donations
            </button>
          </div>

          <div className="mt-[20px] grid grid-cols-1 gap-[24px] sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((card) => (
              <div key={card.key} className="flex h-[96px] items-center justify-between rounded-[8px] border border-[#d9d9d9] bg-white px-[24px] shadow-[0_2px_2px_rgba(0,0,0,0.12)]">
                <div>
                  <p className="text-[14px] font-normal leading-none text-[#667085]">{card.label}</p>
                  <p className={`mt-[12px] text-[14px] font-normal leading-none ${card.color}`}>{stats[card.key]}</p>
                </div>
                <img src={card.icon} alt="" aria-hidden="true" className="h-[24px] w-[24px] object-contain" />
              </div>
            ))}
          </div>

          <div className="mt-[16px] rounded-[8px] border border-[#d9d9d9] bg-white px-[24px] pb-[24px] pt-[28px] shadow-[0_2px_2px_rgba(0,0,0,0.12)]">
            <h2 className="text-[22px] font-semibold leading-none text-[#1f2937]">Submitted Requests</h2>
            <div className="mt-[22px] overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead className="border-b border-[#d9d9d9] text-[#667085]">
                  <tr>
                    {["Request ID", "Program Name", "Tier", "Amount", "Status", "Submitted", "Actions"].map((head) => (
                      <th key={head} className="px-0 py-[14px] pr-[32px] text-[14px] font-semibold leading-none">{head}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d9d9d9]">
                  {filteredRequests.map((r) => (
                    <tr key={r.id} className="h-[58px]">
                      <td className="pr-[32px] text-[14px] font-normal text-[#1f2937]">{r.id}</td>
                      <td className="pr-[32px] text-[14px] font-semibold text-[#1f2937]">{r.programName}</td>
                      <td className="pr-[32px] text-[14px] font-normal text-[#1f2937]">
                        <span className="inline-flex items-center gap-[8px]">
                          <img src="/images/request-icon-6.svg" alt="" aria-hidden="true" className="h-[16px] w-[16px]" />
                          {r.tier}
                        </span>
                      </td>
                      <td className="pr-[32px] text-[14px] font-semibold text-[#00a63e]">{money(r.amount)}</td>
                      <td className="pr-[32px]">
                        <span className={`inline-flex h-[22px] items-center gap-[4px] rounded-full border px-[8px] text-[12px] font-semibold ${statusBadge(r.status)}`}>
                          <img src={statusIcon(r.status)} alt="" aria-hidden="true" className="h-[16px] w-[16px]" />
                          {r.status}
                        </span>
                      </td>
                      <td className="pr-[32px] text-[14px] font-normal text-[#667085]">{r.submitted}</td>
                      <td>
                        <button
                          onClick={() => {
                            setSelectedId(r.id);
                            setView("detail");
                          }}
                          className="flex items-center gap-[3px] text-[14px] font-normal text-[#ff9f0f]"
                        >
                          <img src="/images/sponsor-view-eye.svg" alt="" aria-hidden="true" className="h-[16px] w-[16px]" />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {view === "form" && (
        <div>
          {step > 1 && (
            <button onClick={() => setView("list")} className="mb-[18px] flex items-center gap-[12px] text-[15px] font-normal leading-none text-[#667085]">
              <img src="/images/request-back-icon.svg" alt="" aria-hidden="true" className="h-[20px] w-[20px]" />
              Back
            </button>
          )}
          <h1 className="text-[28px] font-semibold leading-none text-[#1f2937]">Request Sponsorship</h1>
          <p className="mt-[16px] text-[15px] font-normal leading-none text-[#667085]">Complete the form below to submit a sponsorship request.</p>
          <StepBar current={step} />

          <div className="mt-[16px] rounded-[8px] border border-[#d9d9d9] bg-white px-[24px] py-[28px] shadow-[0_2px_2px_rgba(0,0,0,0.12)]">
            {step === 1 && <TierStep formTier={form.tier} setTier={(tier) => setForm((f) => ({ ...f, tier }))} />}
            {step === 2 && <CompanyStep form={form} setForm={setForm} />}
            {step === 3 && <AmountStep form={form} setForm={setForm} />}
            {step === 4 && <BenefitsStep form={form} setForm={setForm} />}
            {step === 5 && <ReviewStep form={form} />}
            {validationError ? <p className="mt-[16px] text-[14px] font-semibold text-red-500">{validationError}</p> : null}

            <div className={`${step === 5 ? "mt-[24px]" : "mt-[18px]"} flex items-center justify-between gap-[20px]`}>
              <button onClick={() => goStep(step - 1)} disabled={step === 1} className="h-[56px] w-[180px] rounded-[8px] border border-[#d9d9d9] bg-white text-[14px] font-semibold text-[#111111] disabled:text-[#9ca3af]">
                Previous
              </button>
              {step < 5 ? (
                <button onClick={handleNext} className="h-[56px] w-[152px] rounded-[8px] bg-[#F9A618] text-[14px] font-semibold text-white">
                  Next
                </button>
              ) : (
                <button onClick={submitRequest} className="h-[56px] w-[152px] rounded-[8px] bg-[#F9A618] text-[14px] font-semibold text-white">
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {view === "success" && (
        <div className="flex min-h-[720px] items-center justify-center">
          <div className="w-full max-w-[670px] rounded-[8px] border border-[#d9d9d9] bg-white px-[56px] py-[48px] text-center shadow-[0_2px_2px_rgba(0,0,0,0.12)]">
            <img src="/images/sponsor-auth-success.svg" alt="" aria-hidden="true" className="mx-auto h-[80px] w-[80px]" />
            <h2 className="mt-[22px] text-[28px] font-semibold leading-none text-[#1f2937]">Sponsorship Request Submitted!</h2>
            <p className="mx-auto mt-[22px] max-w-[560px] text-[15px] font-normal leading-[24px] text-[#667085]">
              Thank you for your sponsorship request. Our team will review it and get back to you within 2-3 business days.
            </p>
            <button
              onClick={() => {
                setView("list");
                resetForm();
              }}
              className="mt-[18px] h-[56px] rounded-[8px] bg-[#F9A618] px-[28px] text-[15px] font-semibold text-white"
            >
              Submit Another Request
            </button>
          </div>
        </div>
      )}

      {view === "detail" && selected && (
        <DetailView selected={selected} setView={setView} />
      )}
    </div>
  );
}

function StepBar({ current }: { current: number }) {
  const labels = ["Select Tier", "Company Info", "Amount & Duration", "Benefits", "Review & Submit"];
  return (
    <div className="mt-[20px] rounded-[8px] border border-[#d9d9d9] bg-white px-[24px] py-[24px] shadow-[0_2px_2px_rgba(0,0,0,0.12)]">
      <div className="flex items-center">
        {labels.map((label, idx) => {
          const i = idx + 1;
          const done = i < current;
          const active = i <= current;
          return (
            <React.Fragment key={label}>
              <div className="flex shrink-0 items-center gap-[8px]">
                <span className={`flex h-[40px] w-[40px] items-center justify-center rounded-full text-[14px] font-normal ${active ? "bg-[#F9A618] text-white" : "bg-[#e5e7eb] text-[#667085]"}`}>
                  {done ? <img src="/images/request-check.svg" alt="" aria-hidden="true" className="h-[14px] w-[14px]" /> : i}
                </span>
                <span className="whitespace-nowrap text-[14px] font-normal text-[#667085]">{label}</span>
              </div>
              {idx < labels.length - 1 && <span className={`mx-[8px] h-[4px] flex-1 ${idx + 1 < current ? "bg-[#F9A618]" : "bg-[#e5e7eb]"}`} />}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function TierStep({ formTier, setTier }: { formTier: Tier; setTier: (tier: Tier) => void }) {
  return (
    <>
      <h2 className="text-[22px] font-semibold leading-none text-[#1f2937]">Select Sponsorship Tier</h2>
      <div className="mt-[22px] grid grid-cols-1 gap-[16px] md:grid-cols-2">
        {(["Platinum", "Gold", "Silver", "Bronze"] as Tier[]).map((tier) => (
          <button
            key={tier}
            onClick={() => setTier(tier)}
            className={`min-h-[118px] rounded-[8px] border px-[24px] py-[24px] text-left ${formTier === tier ? "border-[#F9A618] bg-[#fffaf0]" : "border-[#d9d9d9] bg-white"}`}
          >
            <p className="text-[16px] font-semibold leading-none text-[#1f2937]">{tier}</p>
            <p className="mt-[12px] text-[15px] font-normal leading-none text-[#667085]">{tierDesc[tier]}</p>
            <p className="mt-[12px] text-[14px] font-normal leading-none text-[#ff9f0f]">{tierPrice[tier]}</p>
          </button>
        ))}
      </div>
    </>
  );
}

function CompanyStep({ form, setForm }: { form: any; setForm: React.Dispatch<React.SetStateAction<any>> }) {
  return (
    <>
      <h2 className="text-[22px] font-semibold leading-none text-[#1f2937]">Company Information</h2>
      <div className="mt-[24px] grid grid-cols-1 gap-[20px] md:grid-cols-2">
        <Field className="md:col-span-2" label="Program Name *" value={form.programName} onChange={(value) => setForm((f: any) => ({ ...f, programName: value }))} placeholder="Enter program name" />
        <Field label="Company Name *" value={form.companyName} onChange={(value) => setForm((f: any) => ({ ...f, companyName: value }))} placeholder="Your company name" />
        <Field label="Contact Name *" value={form.contactName} onChange={(value) => setForm((f: any) => ({ ...f, contactName: value }))} placeholder="Primary contact person" />
        <Field label="Email *" value={form.email} onChange={(value) => setForm((f: any) => ({ ...f, email: value }))} placeholder="contact@company.com" />
        <Field label="Phone *" value={form.phone} onChange={(value) => setForm((f: any) => ({ ...f, phone: value }))} placeholder="+1 (555) 000-0000" />
      </div>
    </>
  );
}

function AmountStep({ form, setForm }: { form: any; setForm: React.Dispatch<React.SetStateAction<any>> }) {
  return (
    <>
      <h2 className="text-[22px] font-semibold leading-none text-[#1f2937]">Amount Duration</h2>
      <div className="mt-[24px] grid grid-cols-1 gap-[20px] md:grid-cols-2">
        <Field label="Sponsorship Amount *" value={form.amount} onChange={(value) => setForm((f: any) => ({ ...f, amount: value }))} placeholder="$50,000" />
        <Field label="Duration Months*" value={form.durationMonths} onChange={(value) => setForm((f: any) => ({ ...f, durationMonths: value }))} placeholder="Select Duration" />
        <Field className="md:col-span-2" label="Start Date*" value={form.startDate} onChange={(value) => setForm((f: any) => ({ ...f, startDate: value }))} placeholder="MM/DD/YYYY" />
      </div>
    </>
  );
}

function BenefitsStep({ form, setForm }: { form: any; setForm: React.Dispatch<React.SetStateAction<any>> }) {
  return (
    <>
      <h2 className="text-[22px] font-semibold leading-none text-[#1f2937]">Select Desired Benefits</h2>
      <div className="mt-[20px] space-y-[10px]">
        {benefitOptions.map((b) => {
          const checked = form.benefits.includes(b);
          return (
            <label key={b} className="flex h-[44px] items-center gap-[12px] border border-[#e5e7eb] px-[12px] text-[15px] font-normal text-[#1f2937]">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => {
                  if (e.target.checked) setForm((f: any) => ({ ...f, benefits: [...f.benefits, b] }));
                  else setForm((f: any) => ({ ...f, benefits: f.benefits.filter((x: string) => x !== b) }));
                }}
                className="h-[16px] w-[16px] rounded-[4px] border-[#d9d9d9]"
              />
              {b}
            </label>
          );
        })}
      </div>
    </>
  );
}

function ReviewStep({ form }: { form: any }) {
  const benefits = form.benefits.length ? form.benefits : benefitOptions;
  return (
    <>
      <h2 className="text-[22px] font-semibold leading-none text-[#1f2937]">Review Your Request</h2>
      <p className="mt-[18px] text-[15px] font-normal leading-none text-[#667085]">Please review all details before submitting</p>
      <div className="mt-[16px] rounded-[16px] border border-[#F9A618] bg-[#fffdf0] px-[24px] py-[28px]">
        <div className="flex items-center gap-[16px]">
          <img src="/images/request-container-4.svg" alt="" aria-hidden="true" className="h-[64px] w-[64px]" />
          <div>
            <p className="text-[14px] font-normal leading-none text-[#667085]">Sponsorship Tier</p>
            <p className="mt-[8px] text-[20px] font-semibold leading-none text-[#ff9f0f]">{form.tier}</p>
            <p className="mt-[10px] text-[14px] font-normal leading-none text-[#667085]">Premium Benefits Package</p>
          </div>
        </div>
      </div>

      <div className="mt-[24px] grid grid-cols-1 gap-[16px] md:grid-cols-3">
        <ReviewTile icon="/images/request-icon-8.svg" label="Sponsorship Amount" value={form.amount || "30000"} className="border-[#86efac] bg-[#ecfdf5] text-[#008236]" />
        <ReviewTile icon="/images/request-container-7.svg" label="Duration" value={`${form.durationMonths || "3"}\nmonths`} className="border-[#93c5fd] bg-[#eff6ff] text-[#155dfc]" />
        <ReviewTile icon="/images/request-container-8.svg" label="Start Date" value={form.startDate || "Not specified"} className="border-[#e9d5ff] bg-[#faf5ff] text-[#9810fa]" />
      </div>

      <div className="mt-[24px] rounded-[16px] border border-[#d9d9d9] bg-white px-[24px] py-[28px]">
        <div className="flex items-center gap-[12px]">
          <img src="/images/request-container-9.svg" alt="" aria-hidden="true" className="h-[40px] w-[40px]" />
          <h3 className="text-[18px] font-semibold leading-none text-[#1f2937]">Company Information</h3>
        </div>
        <div className="mt-[22px] grid grid-cols-1 gap-x-[80px] gap-y-[22px] md:grid-cols-2">
          <Info label="Program Name" value={form.programName || "Communication Growth"} />
          <Info label="Company Name" value={form.companyName || "New Company"} />
          <Info label="Contact Person" value={form.contactName || "+1 234 654 343"} />
          <Info label="Email Address" value={form.email || "new@gmail.com"} icon="/images/request-icon-9.svg" />
          <Info label="Phone Number" value={form.phone || "+1 234 654 343"} icon="/images/request-icon-10.svg" />
        </div>
      </div>

      <div className="mt-[24px] rounded-[16px] border border-[#F9A618] bg-[#fffdf0] px-[24px] py-[28px]">
        <div className="flex items-center gap-[12px]">
          <span className="flex h-[40px] w-[40px] items-center justify-center rounded-[8px] bg-[#F9A618]">
            <img src="/images/request-check.svg" alt="" aria-hidden="true" className="h-[14px] w-[14px]" />
          </span>
          <div>
            <h3 className="text-[18px] font-semibold leading-none text-[#1f2937]">Selected Benefits</h3>
            <p className="mt-[8px] max-w-[160px] text-[14px] font-normal leading-[18px] text-[#667085]">{benefits.length} benefits included in your package</p>
          </div>
        </div>
        <div className="mt-[4px] grid max-w-[820px] grid-cols-1 gap-[14px] md:grid-cols-2">
          {benefits.map((b: string) => (
            <div key={b} className="flex h-[58px] items-center gap-[14px] rounded-[8px] border border-[#d9d9d9] bg-white px-[18px] text-[15px] font-normal text-[#1f2937]">
              <img src="/images/request-container-11.svg" alt="" aria-hidden="true" className="h-[24px] w-[24px]" />
              {b}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-[24px] flex items-center justify-between rounded-[8px] border border-[#d9d9d9] bg-[#f9fafb] px-[24px] py-[20px]">
        <div className="flex items-center gap-[14px]">
          <img src="/images/settings-file-icon.svg" alt="" aria-hidden="true" className="h-[20px] w-[20px]" />
          <div>
            <p className="text-[15px] font-normal leading-none text-[#1f2937]">Ready to Submit</p>
            <p className="mt-[8px] text-[14px] font-normal leading-none text-[#667085]">Your request will be reviewed within 2-3 business days</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[14px] font-normal leading-none text-[#667085]">Total Value</p>
          <p className="mt-[8px] text-[14px] font-normal leading-none text-[#ff9f0f]">{form.amount || "30000"}</p>
        </div>
      </div>
    </>
  );
}

function DetailView({ selected, setView }: { selected: RequestItem; setView: (view: View) => void }) {
  return (
    <div>
      <button onClick={() => setView("list")} className="flex items-center gap-[12px] text-[15px] font-normal leading-none text-[#667085]">
        <img src="/images/request-back-icon.svg" alt="" aria-hidden="true" className="h-[20px] w-[20px]" />
        Back to Requests
      </button>
      <h1 className="mt-[18px] text-[28px] font-semibold leading-none text-[#1f2937]">Request Details</h1>
      <p className="mt-[16px] text-[15px] font-normal leading-none text-[#667085]">View your sponsorship request information</p>

      <div className="mt-[22px] flex items-center justify-between rounded-[8px] border border-[#86efac] bg-[#ecfdf5] px-[24px] py-[24px]">
        <div className="flex items-center gap-[18px]">
          <img src="/images/request-icon-3.svg" alt="" aria-hidden="true" className="h-[18px] w-[18px]" />
          <div>
            <p className="text-[14px] font-semibold leading-[22px] text-[#00a63e]">Request<br />{selected.status}</p>
            <p className="mt-[6px] text-[14px] font-normal leading-none text-[#667085]">Your sponsorship request has been approved. You will receive a confirmation email shortly.</p>
          </div>
        </div>
        <span className="rounded-[10px] border border-[#86efac] px-[12px] py-[7px] text-[13px] font-semibold text-[#00a63e]">{selected.id}</span>
      </div>

      <div className="mt-[16px] grid grid-cols-1 gap-[16px] md:grid-cols-2">
        <DetailCard title="Program & Tier">
          <Info label="Program Name" value={selected.programName} />
          <Info label="Sponsorship Tier" value={selected.tier} icon="/images/request-icon-6.svg" valueClass="text-[#ff9f0f]" />
          <Info label="Submitted Date" value={selected.submitted} icon="/images/request-detail-calendar.svg" />
        </DetailCard>
        <DetailCard title="Financial Details">
          <Info label="Sponsorship Amount" value={money(selected.amount)} icon="/images/request-icon-8.svg" valueClass="text-[#00a63e]" />
          <Info label="Duration" value={`${selected.durationMonths} months`} />
          <Info label="Start Date" value="February 1, 2025" />
        </DetailCard>
      </div>

      <DetailCard className="mt-[16px]" title="Contact Information">
        <div className="grid grid-cols-1 gap-[28px] md:grid-cols-4">
          <Info label="Company Name" value={selected.companyName} icon="/images/request-detail-company.svg" />
          <Info label="Contact Person" value={selected.contactName} />
          <Info label="Email" value={selected.email} icon="/images/request-detail-email.svg" />
          <Info label="Phone" value={selected.phone} icon="/images/request-detail-phone.svg" />
        </div>
      </DetailCard>

      <DetailCard className="mt-[16px]" title="Selected Benefits">
        <div className="grid grid-cols-1 gap-[22px] md:grid-cols-3">
          {selected.benefits.map((b) => (
            <div key={b} className="flex items-center gap-[10px] text-[14px] font-normal text-[#1f2937]">
              <img src="/images/request-icon-3.svg" alt="" aria-hidden="true" className="h-[18px] w-[18px]" />
              {b}
            </div>
          ))}
        </div>
      </DetailCard>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, className = "" }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-[14px] font-semibold leading-none text-[#1f2937]">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="mt-[10px] h-[54px] w-full rounded-[8px] border border-[#d9d9d9] bg-white px-[24px] text-[15px] font-normal text-[#1f2937] outline-none placeholder:text-[#9ca3af]" />
    </label>
  );
}

function ReviewTile({ icon, label, value, className }: { icon: string; label: string; value: string; className: string }) {
  return (
    <div className={`min-h-[126px] rounded-[8px] border px-[24px] py-[24px] ${className}`}>
      <div className="flex items-center gap-[14px]">
        <img src={icon} alt="" aria-hidden="true" className="h-[40px] w-[40px]" />
        <p className="text-[14px] font-normal leading-none text-[#667085]">{label}</p>
      </div>
      <p className="mt-[12px] whitespace-pre-line text-[22px] font-semibold leading-[30px]">{value}</p>
    </div>
  );
}

function DetailCard({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[8px] border border-[#d9d9d9] bg-white px-[16px] py-[20px] shadow-[0_1px_2px_rgba(0,0,0,0.08)] ${className}`}>
      <h2 className="text-[17px] font-semibold leading-none text-[#1f2937]">{title}</h2>
      <div className="mt-[20px] space-y-[18px]">{children}</div>
    </div>
  );
}

function Info({ label, value, icon, valueClass = "text-[#1f2937]" }: { label: string; value: string; icon?: string; valueClass?: string }) {
  return (
    <div>
      <p className="text-[14px] font-normal leading-none text-[#667085]">{label}</p>
      <p className={`mt-[10px] flex items-center gap-[8px] text-[14px] font-normal leading-none ${valueClass}`}>
        {icon ? <img src={icon} alt="" aria-hidden="true" className="h-[16px] w-[16px]" /> : null}
        {value}
      </p>
    </div>
  );
}
