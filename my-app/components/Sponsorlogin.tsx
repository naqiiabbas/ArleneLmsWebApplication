"use client";

import React, { useState } from "react";

const LOGIN_FIELDS = [
  { id: "email", name: "email", label: "Email Address", type: "email", placeholder: "you@company.com" },
  { id: "password", name: "password", label: "Password", type: "password", placeholder: "Enter your password" },
];

const FORGOT_FIELDS = [
  { id: "email", name: "email", label: "Email Address", type: "email", placeholder: "you@company.com" },
];

const Logo = () => (
  <div className="flex h-[96px] w-full max-w-[500px] items-center justify-center rounded-[16px] bg-[#F9A618] sm:h-[120px]">
    <img src="/images/sponsor-auth-logo.svg" alt="100 Black Men of Orange County" className="h-[76px] w-[154px] object-contain sm:h-[94px] sm:w-[170px]" />
  </div>
);

const BackButton = ({ onClick }: { onClick: () => void }) => (
  <button type="button" onClick={onClick} className="mb-4 flex items-center gap-3 text-[15px] font-normal leading-none text-[#666666] sm:mb-5">
    <img src="/images/sponsor-auth-back-icon.svg" alt="" aria-hidden="true" className="h-[20px] w-[20px]" />
    Back
  </button>
);

const EyeGlyph = () => (
  <span className="relative block h-[16px] w-[20px]" aria-hidden="true">
    <span className="absolute inset-x-0 top-[3px] h-[10px] rounded-full border-[2px] border-[#777f8f]" />
    <span className="absolute left-1/2 top-1/2 h-[5px] w-[5px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#777f8f]" />
  </span>
);

const MailGlyph = () => (
  <span className="relative mt-[2px] block h-[14px] w-[16px] shrink-0 rounded-[2px] border border-[#F9A618]" aria-hidden="true">
    <span className="absolute left-[2px] top-[3px] h-[8px] w-[10px] rotate-45 border-b border-r border-[#F9A618]" />
  </span>
);

const InputField = ({ field, value, onChange, error, showPass, setShowPass }: any) => {
  const isPassword = field.type === "password";

  return (
    <div className="w-full text-left">
      <label className="mb-[10px] block text-[14px] font-semibold leading-none text-[#1f2937]">{field.label}</label>
      <div className="relative">
        <input
          type={isPassword && showPass ? "text" : field.type}
          name={field.name}
          value={value}
          onChange={(e) => onChange(field.name, e.target.value)}
          placeholder={field.placeholder}
          className={`h-[48px] w-full rounded-[6px] border bg-white px-[15px] text-[15px] font-normal text-[#111827] outline-none transition placeholder:text-[#9ca3af] focus:border-[#F9A618] ${
            error ? "border-red-500" : "border-[#d9d9d9]"
          } ${isPassword ? "pr-[48px]" : ""}`}
        />
        {isPassword ? (
          <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-[14px] top-1/2 flex h-[24px] w-[24px] -translate-y-1/2 items-center justify-center" aria-label="Toggle password visibility">
            <EyeGlyph />
          </button>
        ) : null}
      </div>
      {error ? <p className="mt-[6px] text-[12px] font-medium text-red-500">{error}</p> : null}
    </div>
  );
};

const ContactSales = () => (
  <div className="mt-4 flex items-center justify-center gap-8 text-[14px] leading-[20px] sm:mt-5">
    <p className="w-[95px] text-center font-normal text-[#667085]">Don't have an account?</p>
    <button type="button" className="font-normal text-[#F9A618]">Contact Sales</button>
  </div>
);

export default function AuthFlow() {
  const [view, setView] = useState<"login" | "forgot" | "success">("login");
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<any>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev: any) => ({ ...prev, [name]: "" }));
  };

  const validate = (fields: any[]) => {
    let newErrors: any = {};
    fields.forEach((f) => {
      if (!formData[f.name as keyof typeof formData]) {
        newErrors[f.name] = `${f.label} is required`;
      } else if (f.type === "email" && !/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Invalid email format";
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate(LOGIN_FIELDS)) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        alert("Login Successful! Navigating to Panel...");
      }, 1500);
    }
  };

  const handleForgotRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate(FORGOT_FIELDS)) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setView("success");
      }, 1500);
    }
  };

  return (
    <div className="h-dvh overflow-hidden bg-[#f4f4f4] px-4 py-3 font-['Poppins',_sans-serif] text-[#1f2937] sm:px-5 sm:py-4">
      <div className="mx-auto flex h-full w-full max-w-[500px] flex-col justify-center">
        {view !== "login" ? <BackButton onClick={() => setView("login")} /> : null}

        <Logo />

        {view === "login" ? (
          <>
            <div className="mt-4 text-center">
              <h1 className="text-[26px] font-bold leading-none text-[#1f2937] sm:text-[29px]">Welcome Back</h1>
              <p className="mt-3 text-[14px] font-normal leading-tight text-[#666666] sm:text-[15px]">Sign in to manage your mentorship sponsorships</p>
            </div>

            <form onSubmit={handleLogin} className="mt-5 rounded-[8px] border border-[#d9d9d9] bg-white px-5 py-5 sm:px-6">
              <div className="space-y-4">
                {LOGIN_FIELDS.map((field) => (
                  <InputField
                    key={field.id}
                    field={field}
                    value={formData[field.name as keyof typeof formData]}
                    onChange={handleInputChange}
                    error={errors[field.name]}
                    showPass={showPassword}
                    setShowPass={setShowPassword}
                  />
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between">
                <label className="flex items-center gap-[10px] text-[14px] font-normal text-[#667085]">
                  <input type="checkbox" className="h-[16px] w-[16px] rounded-full border border-[#d9d9d9] accent-[#F9A618]" />
                  Remember me
                </label>
                <button type="button" onClick={() => setView("forgot")} className="text-[14px] font-normal text-[#F9A618]">
                  Forgot password?
                </button>
              </div>

              <button type="submit" disabled={isLoading} className="mt-5 h-[46px] w-full rounded-[6px] bg-[#F9A618] text-[15px] font-normal text-white transition hover:bg-[#f0a018]">
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <ContactSales />
          </>
        ) : null}

        {view === "forgot" ? (
          <>
            <div className="mt-4 text-center">
              <h1 className="text-[26px] font-bold leading-none text-[#1f2937] sm:text-[29px]">Forgot Password?</h1>
              <p className="mx-auto mt-3 max-w-[462px] text-[14px] font-normal leading-5 text-[#667085] sm:text-[15px]">
                No worries! Enter your email address and we'll send you instructions to reset your password.
              </p>
            </div>

            <form onSubmit={handleForgotRequest} className="mt-5 rounded-[8px] border border-[#d9d9d9] bg-white px-5 py-5 sm:px-6">
              <InputField
                field={FORGOT_FIELDS[0]}
                value={formData.email}
                onChange={handleInputChange}
                error={errors.email}
              />
              <button type="submit" disabled={isLoading} className="mt-[24px] h-[48px] w-full rounded-[6px] bg-[#F9A618] text-[15px] font-normal text-white transition hover:bg-[#f0a018]">
                {isLoading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <ContactSales />
          </>
        ) : null}

        {view === "success" ? (
          <>
            <div className="mt-3 flex flex-col items-center text-center">
              <img src="/images/sponsor-auth-success.svg" alt="" aria-hidden="true" className="h-14 w-14" />
              <h1 className="mt-3 text-[26px] font-bold leading-none text-[#1f2937] sm:text-[28px]">Check Your Email</h1>
              <p className="mt-3 text-[14px] font-normal leading-none text-[#667085]">We've sent a password reset link to</p>
              <p className="mt-3 text-[15px] font-bold leading-none text-[#1f2937]">{formData.email || "newmail@gmail.com"}</p>
            </div>

            <div className="mt-5 rounded-[8px] border border-[#d9d9d9] bg-white px-5 py-5 sm:px-6">
              <div className="space-y-4">
                {[
                  ["1", "Check your inbox", "Look for an email from Sponsor Dashboard"],
                  ["2", "Click the reset link", "The link will expire in 24 hours"],
                  ["3", "Create a new password", "Choose a strong, unique password"],
                ].map(([number, title, text]) => (
                  <div key={number} className="flex items-start gap-[12px]">
                    <span className="flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full bg-[#F9A618] text-[12px] font-bold text-white">{number}</span>
                    <span>
                      <span className="block text-[15px] font-semibold leading-none text-[#1f2937]">{title}</span>
                      <span className="mt-2 block text-[13px] font-normal leading-tight text-[#667085]">{text}</span>
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-[6px] border border-[#F9A618] bg-[#fffaf0] px-4 py-4">
                <div className="flex items-start gap-[12px]">
                  <MailGlyph />
                  <div className="text-[14px] leading-[20px]">
                    <p className="font-normal text-[#1f2937]">Didn't receive the email?</p>
                    <p className="mt-[6px] font-normal text-[#667085]">
                      Check your spam folder{" "}
                      <button type="button" onClick={() => setView("forgot")} className="text-[#F9A618] underline">
                        resend the email
                      </button>
                      <br />
                      or
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <ContactSales />
          </>
        ) : null}
      </div>
    </div>
  );
}
