"use client";

import React, { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

type AuthView = "login" | "forgot" | "success";

type AuthField = {
  id: string;
  name: "email" | "password";
  label: string;
  type: string;
  placeholder: string;
  icon: string;
};

const LOGIN_FIELDS: AuthField[] = [
  {
    id: "email",
    name: "email",
    label: "Email Address",
    type: "email",
    placeholder: "mail@example.com",
    icon: "/images/admin-auth-mail.svg",
  },
  {
    id: "password",
    name: "password",
    label: "Password",
    type: "password",
    placeholder: "Enter your password",
    icon: "/images/admin-auth-lock.svg",
  },
];

const FORGOT_FIELDS: AuthField[] = [
  {
    id: "email",
    name: "email",
    label: "Email Address",
    type: "email",
    placeholder: "Enter your email",
    icon: "/images/admin-auth-mail.svg",
  },
];

const Logo = () => (
  <div className="flex h-[92px] w-full max-w-[500px] items-center justify-center rounded-[18px] bg-[#f9a313] sm:h-[120px] lg:h-[132px]">
    <img
      src="/images/admin-auth-logo.svg"
      alt="100 Black Men of Orange County"
      className="h-[70px] w-auto object-contain sm:h-[92px] lg:h-[104px]"
    />
  </div>
);

const AuthBack = ({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="mb-4 inline-flex items-center gap-2 text-[15px] font-medium leading-none text-[#6c757d] transition hover:text-[#242424] sm:mb-5"
  >
    <ArrowLeft size={18} strokeWidth={2} />
    {label}
  </button>
);

const InputField = ({
  field,
  value,
  onChange,
  error,
  showPassword,
  onTogglePassword,
}: {
  field: AuthField;
  value: string;
  onChange: (name: AuthField["name"], value: string) => void;
  error?: string;
  showPassword?: boolean;
  onTogglePassword?: () => void;
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
          type={isPassword && showPassword ? "text" : field.type}
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
            onClick={onTogglePassword}
            className="absolute right-[14px] top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <img src="/images/admin-auth-eye.svg" alt="" aria-hidden="true" className="h-5 w-5" />
          </button>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-[#ef4444]">{error}</p>}
    </div>
  );
};

export default function Loginadmin() {
  const [view, setView] = useState<AuthView>("login");
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (name: AuthField["name"], value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = (fields: AuthField[]) => {
    const newErrors: Record<string, string> = {};

    fields.forEach((field) => {
      if (!formData[field.name]) {
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

  const goToForgot = () => {
    setErrors({});
    setView("forgot");
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate(LOGIN_FIELDS)) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert("Login Successful! Navigating to Panel...");
    }, 1500);
  };

  const handleForgotRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate(FORGOT_FIELDS)) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setView("success");
    }, 1500);
  };

  return (
    <div className="h-dvh overflow-hidden bg-[#f4f4f4] px-4 py-3 font-['Poppins',_sans-serif] text-[#242424] sm:px-5 sm:py-4">
      <div className="mx-auto flex h-full w-full max-w-[500px] flex-col items-center justify-center">
        {view === "login" && (
          <LoginView
            formData={formData}
            errors={errors}
            isLoading={isLoading}
            showPassword={showPassword}
            onChange={handleInputChange}
            onTogglePassword={() => setShowPassword((prev) => !prev)}
            onSubmit={handleLogin}
            onForgot={goToForgot}
          />
        )}

        {view === "forgot" && (
          <ForgotView
            email={formData.email}
            error={errors.email}
            isLoading={isLoading}
            onBack={goToLogin}
            onChange={handleInputChange}
            onSubmit={handleForgotRequest}
          />
        )}

        {view === "success" && (
          <SuccessView email={formData.email} onBack={goToForgot} onLogin={goToLogin} />
        )}
      </div>
    </div>
  );
}

function LoginView({
  formData,
  errors,
  isLoading,
  showPassword,
  onChange,
  onTogglePassword,
  onSubmit,
  onForgot,
}: {
  formData: { email: string; password: string };
  errors: Record<string, string>;
  isLoading: boolean;
  showPassword: boolean;
  onChange: (name: AuthField["name"], value: string) => void;
  onTogglePassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onForgot: () => void;
}) {
  return (
    <>
      <Logo />

      <div className="mt-3 text-center sm:mt-4">
        <h1 className="text-[25px] font-normal leading-tight text-[#242424] sm:text-[29px]">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-[14px] leading-none text-[#6c757d] sm:mt-3 sm:text-[15px]">Admin Dashboard</p>
      </div>

      <form
        onSubmit={onSubmit}
        className="mt-4 w-full rounded-[8px] border border-[#d8dde3] bg-white px-5 pb-5 pt-5 shadow-[0_10px_22px_rgba(16,24,40,0.09)] sm:mt-6 sm:px-6"
      >
        <h2 className="mb-4 text-left text-[22px] font-normal leading-none text-[#2c3e50] sm:text-[24px]">
          Welcome Back
        </h2>
        <div className="space-y-4">
          {LOGIN_FIELDS.map((field) => (
            <InputField
              key={field.id}
              field={field}
              value={formData[field.name]}
              onChange={onChange}
              error={errors[field.name]}
              showPassword={showPassword}
              onTogglePassword={onTogglePassword}
            />
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-[14px] text-[#6c757d]">
            <input type="checkbox" className="h-4 w-4 rounded border-[#cfd4dc] accent-[#f9a313]" />
            Remember me
          </label>
          <button
            type="button"
            onClick={onForgot}
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
      </form>

      <p className="mt-4 text-center text-[13px] leading-5 text-[#6c757d] sm:mt-5 sm:text-[14px]">
        By signing in, you agree to our Terms of Service and Privacy Policy
      </p>
    </>
  );
}

function ForgotView({
  email,
  error,
  isLoading,
  onBack,
  onChange,
  onSubmit,
}: {
  email: string;
  error?: string;
  isLoading: boolean;
  onBack: () => void;
  onChange: (name: AuthField["name"], value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div className="w-full">
      <AuthBack label="Back to Sign In" onClick={onBack} />
      <Logo />

      <div className="mt-4 text-center">
        <h1 className="text-[26px] font-normal leading-tight text-[#242424] sm:text-[30px]">
          Forgot Password
        </h1>
        <p className="mt-3 text-[14px] leading-5 text-[#6c757d] sm:text-[15px]">
          Enter your email address and we'll send you a verification code
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="mt-5 w-full rounded-[10px] border border-[#d8dde3] bg-white px-5 py-5 sm:px-6"
      >
        <InputField field={FORGOT_FIELDS[0]} value={email} onChange={onChange} error={error} />

        <button
          type="submit"
          disabled={isLoading}
          className="mt-5 flex h-[45px] w-full items-center justify-center rounded-[9px] bg-[#f9a313] text-[16px] font-medium text-white transition hover:bg-[#ee980f] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? "Sending..." : "Send Verification Code"}
        </button>

        <div className="mt-5 border-t border-[#dddddd]" />

        <div className="mt-5 flex items-center justify-center gap-[24px] text-center text-[14px] leading-[20px]">
          <span className="max-w-[130px] text-[#6c757d]">Remember your password?</span>
          <button type="button" onClick={onBack} className="font-medium text-[#f9a313] hover:underline">
            Sign In
          </button>
        </div>
      </form>

      <p className="mt-4 text-center text-[14px] text-[#6c757d]">
        Verification codes are valid for 10 minutes
      </p>
    </div>
  );
}

function SuccessView({
  email,
  onBack,
  onLogin,
}: {
  email: string;
  onBack: () => void;
  onLogin: () => void;
}) {
  return (
    <div className="w-full">
      <AuthBack label="Back" onClick={onBack} />
      <Logo />

      <div className="mt-5 flex flex-col items-center text-center">
        <img src="/images/admin-auth-success.svg" alt="" aria-hidden="true" className="h-12 w-12 sm:h-14 sm:w-14" />
        <h1 className="mt-4 text-[23px] font-normal leading-tight text-[#242424] sm:text-[25px]">
          Check Your Email
        </h1>
        <p className="mt-3 max-w-[260px] text-[14px] leading-[20px] text-[#6c757d]">
          We've sent a password reset link to
        </p>
        <p className="mt-1.5 text-[14px] font-medium text-[#f9a313]">{email || "newmail@gmail.com"}</p>
      </div>

      <div className="mt-5 rounded-[10px] border border-[#d8dde3] bg-white px-5 pb-4 pt-5 sm:px-6">
        <div className="rounded-[8px] bg-[#fff7e8] px-4 py-4 text-[13px] leading-6 text-[#6c757d] sm:text-[14px]">
          <p className="mb-[2px]">What's next?</p>
          <p>1. Check your email inbox</p>
          <p>2. Click the reset password link</p>
          <p>3. Create a new password</p>
          <p>4. Sign in with your new password</p>
        </div>

        <div className="mt-4 flex items-center justify-center gap-6 text-center text-[14px] leading-[20px]">
          <span className="max-w-[120px] text-[#6c757d]">Didn't receive the email?</span>
          <button type="button" onClick={onBack} className="font-medium text-[#f9a313] hover:underline">
            Try again
          </button>
        </div>

        <button
          type="button"
          onClick={onLogin}
          className="mt-4 flex h-[45px] w-full items-center justify-center rounded-[9px] bg-[#f9a313] text-[16px] font-medium text-white transition hover:bg-[#ee980f]"
        >
          Back to Sign In
        </button>
      </div>
    </div>
  );
}
