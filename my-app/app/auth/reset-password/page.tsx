"use client"

import { useState } from "react"
import Link from "next/link"
import { updatePassword } from "@/lib/auth/actions"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    if (password !== confirm) {
      setError("Passwords do not match.")
      return
    }
    setIsLoading(true)
    const res = await updatePassword(password)
    setIsLoading(false)
    if (res?.error) {
      setError(res.error)
      return
    }
    setDone(true)
  }

  return (
    <section className="flex min-h-dvh items-center justify-center bg-[#f4f4f4] px-4 py-6 font-sans text-[#242424]">
      <div className="w-full max-w-[440px]">
        <div className="mb-4 flex h-[92px] items-center justify-center rounded-[16px] bg-[#f9a514] px-8">
          <img
            src="/images/student-sidebar-logo.svg"
            alt="100 Black Men of Orange County"
            className="h-[62px] w-auto object-contain"
          />
        </div>

        <div className="rounded-[14px] border border-[#d9d9d9] bg-white px-6 py-6 shadow-sm">
          {done ? (
            <div className="text-center">
              <h1 className="text-[22px] font-semibold">Password updated</h1>
              <p className="mt-2 text-[14px] text-[#666]">
                You can now sign in with your new password.
              </p>
              <Link
                href="/"
                className="mt-5 inline-flex h-[46px] w-full items-center justify-center rounded-[9px] bg-[#f9a514] text-[16px] font-medium text-white transition hover:bg-[#e69412]"
              >
                Go to Home
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h1 className="text-[22px] font-semibold">Set a new password</h1>
              <p className="mt-2 text-[14px] text-[#666]">
                Enter and confirm your new password below.
              </p>

              <label className="mt-5 mb-2 block text-[14px] font-medium text-[#555]">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                className="h-[52px] w-full rounded-[10px] border border-[#d9d9d9] bg-white px-4 text-[15px] outline-none transition focus:border-[#f4a11d] focus:ring-4 focus:ring-[#f4a11d]/15"
              />

              <label className="mt-4 mb-2 block text-[14px] font-medium text-[#555]">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                className="h-[52px] w-full rounded-[10px] border border-[#d9d9d9] bg-white px-4 text-[15px] outline-none transition focus:border-[#f4a11d] focus:ring-4 focus:ring-[#f4a11d]/15"
              />

              {error && (
                <p className="mt-3 text-[13px] font-medium text-[#ef4444]">{error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="mt-5 h-[46px] w-full rounded-[9px] bg-[#f9a514] text-[16px] font-medium text-white transition hover:bg-[#e69412] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? "Updating..." : "Update Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
