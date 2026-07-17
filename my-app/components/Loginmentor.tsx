"use client";

import React, { useState } from "react";
import { ArrowLeft, ArrowRight, Mail, X } from "lucide-react";
import { signIn, sendPasswordReset } from "@/lib/auth/actions";

const LOGIN_FIELDS = [
  {
    id: "email",
    name: "email",
    label: "Email Address",
    type: "email",
    placeholder: "mentor@example.com",
    icon: "/images/mentor-auth-mail.svg",
  },
  {
    id: "password",
    name: "password",
    label: "Password",
    type: "password",
    placeholder: "Enter your password",
    icon: "/images/mentor-auth-lock.svg",
  },
];

const FORGOT_FIELDS = [
  {
    id: "email",
    name: "email",
    label: "Email Address",
    type: "email",
    placeholder: "mentor@example.com",
    icon: "/images/mentor-auth-mail.svg",
  },
];

type AuthView = "login" | "forgot" | "success";

type AuthField = {
  id: string;
  name: string;
  label: string;
  type: string;
  placeholder: string;
  icon: string;
};

const Logo = () => (
  <div className="flex h-[78px] w-full max-w-[500px] items-center justify-center rounded-[18px] bg-[#f9a313] sm:h-[96px]">
    <img
      src="/images/mentor-auth-logo.svg"
      alt="100 Black Men of Orange County"
      className="h-[64px] w-auto object-contain sm:h-[78px]"
    />
  </div>
);

const AuthHeader = ({
  view,
  onBack,
}: {
  view: AuthView;
  onBack: () => void;
}) => (
  <div className="w-full max-w-[500px]">
    {view === "login" ? (
      <div className="h-2 sm:h-4" />
    ) : (
      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-2 text-[15px] font-medium text-[#6c757d] transition-colors hover:text-[#222] sm:mb-5"
      >
        <ArrowLeft size={18} strokeWidth={2} />
        {view === "forgot" ? "Back to Sign In" : "Back"}
      </button>
    )}
    <Logo />
    <div className="mt-3 text-center sm:mt-4">
      <h1 className="text-[25px] font-semibold leading-tight text-[#202124] sm:text-[29px]">
        Welcome Back
      </h1>
      <p className="mt-2 text-[14px] leading-none text-[#6c757d] sm:mt-3 sm:text-[15px]">
        {view === "login" ? "Sign in to access your mentor dashboard" : "Mentor Dashboard"}
      </p>
    </div>
  </div>
);

const InputField = ({
  field,
  value,
  onChange,
  error,
  showPass,
  setShowPass,
}: {
  field: AuthField;
  value: string;
  onChange: (name: string, value: string) => void;
  error?: string;
  showPass?: boolean;
  setShowPass?: (value: boolean) => void;
}) => {
  const isPassword = field.type === "password";

  return (
    <div className="w-full text-left">
      <label className="mb-[8px] block text-[15px] font-normal leading-none text-[#6c757d]">
        {field.label}
        <span className="text-[#ef4444]">*</span>
      </label>
      <div className="relative">
        <img
          src={field.icon}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute left-[14px] top-1/2 h-5 w-5 -translate-y-1/2"
        />
        <input
          type={isPassword && showPass ? "text" : field.type}
          name={field.name}
          value={value}
          onChange={(e) => onChange(field.name, e.target.value)}
          placeholder={field.placeholder}
          className={`h-[50px] w-full rounded-[9px] border bg-white pl-[42px] pr-[46px] text-[16px] text-[#243041] outline-none transition placeholder:text-[#9aa3af] focus:border-[#f9a313] focus:ring-4 focus:ring-[#f9a313]/10 ${
            error ? "border-[#ef4444]" : "border-[#d8dde3]"
          }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPass?.(!showPass)}
            className="absolute right-[14px] top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center"
            aria-label={showPass ? "Hide password" : "Show password"}
          >
            <img src="/images/mentor-auth-eye.svg" alt="" aria-hidden="true" className="h-5 w-5" />
          </button>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-[#ef4444]">{error}</p>}
    </div>
  );
};

export default function AuthFlow() {
  const [view, setView] = useState<AuthView>("login");
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = (fields: AuthField[]) => {
    const newErrors: Record<string, string> = {};
    fields.forEach((field) => {
      if (!formData[field.name as keyof typeof formData]) {
        newErrors[field.name] = `${field.label} is required`;
      } else if (field.type === "email" && !/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Invalid email format";
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goToLogin = () => {
    setErrors({});
    setView("login");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate(LOGIN_FIELDS)) return;
    setIsLoading(true);
    const res = await signIn("mentor", formData.email, formData.password);
    setIsLoading(false);
    if (res?.error) setErrors({ password: res.error });
  };

  const handleForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate(FORGOT_FIELDS)) return;
    setIsLoading(true);
    const res = await sendPasswordReset(formData.email);
    setIsLoading(false);
    if (res?.error) {
      setErrors({ email: res.error });
      return;
    }
    setView("success");
  };

  return (
    <div className="h-dvh overflow-hidden bg-[#f4f4f4] px-4 py-3 font-['Poppins',_sans-serif] text-[#202124] sm:px-5 sm:py-4">
      <div className="mx-auto flex h-full w-full max-w-[500px] flex-col items-center justify-center">
        <AuthHeader view={view} onBack={goToLogin} />

        {view === "login" && (
          <>
            <form
              onSubmit={handleLogin}
              className="mt-4 w-full overflow-hidden rounded-[10px] border border-[#d8dde3] bg-white shadow-[0_8px_18px_rgba(16,24,40,0.08)] sm:mt-6"
            >
              <div className="px-5 pb-5 pt-5 sm:px-6">
                <p className="mb-3 text-left text-[14px] leading-none text-[#667085] sm:text-[15px]">
                  Sign in to access your mentor dashboard
                </p>
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

                <div className="mt-4 flex items-center justify-between gap-4">
                  <label className="flex cursor-pointer items-center gap-2 text-[14px] text-[#6c757d]">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-[#cfd4dc] accent-[#f9a313]"
                    />
                    Remember me
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setErrors({});
                      setView("forgot");
                    }}
                    className="text-[14px] font-medium text-[#f9a313] hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-4 flex h-[44px] w-full items-center justify-center gap-2 rounded-[9px] bg-[#f9a313] text-[16px] font-medium text-white transition hover:bg-[#ee980f] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                  <ArrowRight size={18} strokeWidth={2} />
                </button>
              </div>

              <div className="border-t border-[#e5e7eb] bg-[#f8f9fa] px-5 py-3 text-center text-[13px] text-[#667085] sm:py-4">
                Need help? Contact your program administrator
              </div>
            </form>

            <p className="mt-4 text-center text-[13px] text-[#6c757d] sm:mt-5 sm:text-[14px]">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </>
        )}

        {view === "forgot" && (
          <form
            onSubmit={handleForgotRequest}
            className="mt-5 w-full overflow-hidden rounded-[8px] bg-white"
          >
            <div className="flex h-[64px] items-center justify-between border-b border-[#e5e7eb] px-5 sm:h-[72px] sm:px-6">
              <h2 className="text-[20px] font-semibold text-[#243041]">Reset Password</h2>
              <button
                type="button"
                onClick={goToLogin}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#243041] hover:bg-[#f4f4f4]"
                aria-label="Close reset password"
              >
                <X size={20} strokeWidth={2} />
              </button>
            </div>

            <div className="px-5 pb-5 pt-5 sm:px-6">
              <p className="mb-4 max-w-[420px] text-[14px] leading-[1.45] text-[#667085] sm:text-[15px]">
                Enter your email address and we'll send you instructions to reset your password.
              </p>
              {FORGOT_FIELDS.map((field) => (
                <InputField
                  key={field.id}
                  field={field}
                  value={formData.email}
                  onChange={handleInputChange}
                  error={errors.email}
                />
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-[#e5e7eb] px-5 py-4 sm:px-6">
              <button
                type="button"
                onClick={goToLogin}
                className="h-[42px] rounded-[9px] border border-[#d8dde3] px-[25px] text-[14px] font-semibold text-[#243041] transition hover:bg-[#f8f9fa]"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex h-[42px] items-center justify-center gap-2 rounded-[9px] bg-[#f9a313] px-[25px] text-[14px] font-semibold text-white transition hover:bg-[#ee980f] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Mail size={17} strokeWidth={2} />
                {isLoading ? "Sending..." : "Send Reset Link"}
              </button>
            </div>
          </form>
        )}

        {view === "success" && (
          <div className="mt-5 w-full overflow-hidden rounded-[8px] bg-white">
            <div className="flex h-[64px] items-center border-b border-[#e5e7eb] px-5 sm:h-[72px] sm:px-6">
              <h2 className="text-[20px] font-semibold text-[#243041]">Reset Password</h2>
            </div>

            <div className="flex flex-col items-center px-6 pb-6 pt-7 text-center sm:px-8 sm:pt-9">
              <img
                src="/images/mentor-auth-success.svg"
                alt=""
                aria-hidden="true"
                className="mb-4 h-12 w-12 sm:h-14 sm:w-14"
              />
              <h2 className="text-[20px] font-semibold text-[#243041]">Check Your Email</h2>
              <p className="mt-3 text-[14px] text-[#667085]">
                We've sent password reset instructions to:
              </p>
              <p className="mt-3 text-[14px] font-semibold text-[#243041]">
                {formData.email || "newmail@gmail.com"}
              </p>
              <p className="mt-4 text-[14px] leading-[1.45] text-[#667085]">
                Didn't receive the email? Check your spam folder or try again.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
