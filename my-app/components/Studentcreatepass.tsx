'use client'

import React, { useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Eye, Lock } from 'lucide-react'
import { updatePassword } from '@/lib/auth/actions'

interface CreateNewPasswordProps {
  logoSrc?: string
  onBack?: () => void
  onSubmit?: (password: string) => void
}

const requirements = [
  { id: 'length', label: 'At least 8 characters', test: (value: string) => value.length >= 8 },
  { id: 'upper', label: 'One uppercase letter', test: (value: string) => /[A-Z]/.test(value) },
  { id: 'lower', label: 'One lowercase letter', test: (value: string) => /[a-z]/.test(value) },
  { id: 'number', label: 'One number', test: (value: string) => /\d/.test(value) },
]

const inputClass =
  'h-[52px] w-full rounded-[10px] border border-[#d9d9d9] bg-white pl-12 pr-12 text-[15px] text-[#242424] outline-none transition focus:border-[#f4a11d] focus:ring-4 focus:ring-[#f4a11d]/15 placeholder:text-[#8a8a8a]'

export default function CreateNewPassword({
  logoSrc = '/images/student-sidebar-logo.svg',
  onBack,
  onSubmit,
}: CreateNewPasswordProps) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const isValid = useMemo(
    () => requirements.every((requirement) => requirement.test(password)) && password === confirmPassword && confirmPassword.length > 0,
    [password, confirmPassword],
  )

  const handleBack = () => {
    onBack?.()
    router.push('/studentpanel/studentverify')
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isValid || isLoading) return
    setError('')
    setIsLoading(true)
    const res = await updatePassword(password)
    setIsLoading(false)
    if (res.error) {
      setError(res.error)
      return
    }
    onSubmit?.(password)
    sessionStorage.removeItem('reset_email')
    router.push('/studentpanel/passsuccessful')
  }

  return (
    <section className="h-dvh overflow-hidden bg-[#f4f4f4] px-4 py-3 font-sans text-[#242424] sm:px-6 sm:py-4 lg:px-8">
      <div className="mx-auto flex h-full w-full max-w-[520px] flex-col justify-center">
        <button
          type="button"
          onClick={handleBack}
          className="mb-4 inline-flex w-fit items-center gap-2 text-[15px] font-medium text-[#666666] transition hover:text-[#242424]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="mb-3 flex h-[80px] w-full items-center justify-center rounded-[16px] bg-[#f9a514] px-8 shadow-sm sm:h-[96px]">
          <div className="relative h-[58px] w-[174px]">
            <Image src={logoSrc} alt="100 Black Men of Orange County" fill priority className="object-contain" />
          </div>
        </div>

        <div className="mb-4 text-center">
          <h1 className="text-[24px] font-semibold leading-tight text-[#242424] sm:text-[28px]">Create New Password</h1>
          <p className="mx-auto mt-2 max-w-[360px] text-[14px] leading-5 text-[#666666] sm:text-[15px]">
            Your new password must be different from previously used passwords
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full rounded-[14px] border border-[#d9d9d9] bg-white px-5 py-4 shadow-sm sm:px-6">
          <div>
            <label className="mb-2 block text-[14px] font-medium text-[#555555]">New Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6f6f6f]" />
              <input
                className={inputClass}
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
              />
              <Eye className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6f6f6f]" />
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-[14px] font-medium text-[#555555]">Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6f6f6f]" />
              <input
                className={inputClass}
                type="password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
              />
              <Eye className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6f6f6f]" />
            </div>
          </div>

          <div className="mt-4 rounded-[10px] bg-[#f1f1f1] px-4 py-3">
            <p className="mb-2 text-[13px] font-medium text-[#666666]">Password must contain:</p>
            <ul className="space-y-1.5 text-[13px] text-[#666666]">
              {requirements.map((requirement) => (
                <li key={requirement.id} className="flex items-center gap-3">
                  <span className={`h-1.5 w-1.5 rounded-full ${requirement.test(password) ? 'bg-[#10b981]' : 'bg-[#d9d9d9]'}`} />
                  {requirement.label}
                </li>
              ))}
            </ul>
          </div>

          {error && (
            <p className="mt-3 text-[13px] font-medium text-[#ef4444]">{error}</p>
          )}

          <button
            type="submit"
            disabled={!isValid || isLoading}
            className={`mt-4 h-[50px] w-full rounded-[9px] text-[16px] font-medium text-white transition focus:outline-none focus:ring-4 focus:ring-[#f4a11d]/25 ${
              isValid && !isLoading ? 'bg-[#f9a514] hover:bg-[#e69412]' : 'cursor-not-allowed bg-[#d4d4d4]'
            }`}
          >
            {isLoading ? 'Saving...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </section>
  )
}
