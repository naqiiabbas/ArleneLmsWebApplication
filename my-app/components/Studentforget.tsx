'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Mail } from 'lucide-react'
import { sendPasswordReset } from '@/lib/auth/actions'

interface ForgotPasswordProps {
  logoSrc?: string
  onBackToSignIn?: () => void
  onSendCode?: (email: string) => void
}

const inputClass =
  'h-[52px] w-full rounded-[10px] border border-[#d9d9d9] bg-white pl-12 pr-4 text-[15px] text-[#242424] outline-none transition focus:border-[#f4a11d] focus:ring-4 focus:ring-[#f4a11d]/15 placeholder:text-[#8a8a8a]'

export default function ForgotPasswordSection({
  logoSrc = '/images/student-sidebar-logo.svg',
  onBackToSignIn,
  onSendCode,
}: ForgotPasswordProps) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const email = String(new FormData(event.currentTarget).get('email') || '').trim()
    if (!email) {
      setError('Please enter your email address.')
      return
    }
    setError('')
    setIsLoading(true)
    const res = await sendPasswordReset(email)
    setIsLoading(false)
    if (res?.error) {
      setError(res.error)
      return
    }
    onSendCode?.(email)
    // Carry the email into the verify step and continue the OTP flow.
    sessionStorage.setItem('reset_email', email)
    router.push('/studentpanel/studentverify')
  }

  const handleBack = () => {
    onBackToSignIn?.()
    router.push('/studentpanel/loginform')
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
          Back to Sign In
        </button>

        <div className="mb-3 flex h-[84px] w-full items-center justify-center rounded-[16px] bg-[#f9a514] px-8 shadow-sm sm:h-[100px]">
          <div className="relative h-[62px] w-[178px]">
            <Image src={logoSrc} alt="100 Black Men of Orange County" fill priority className="object-contain" />
          </div>
        </div>

        <div className="mb-4 text-center">
          <h1 className="text-[24px] font-semibold leading-tight text-[#242424] sm:text-[28px]">Forgot Password</h1>
          <p className="mt-2 text-[14px] leading-5 text-[#666666] sm:text-[15px]">
            Enter your email address and we'll send you a verification code
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full rounded-[14px] border border-[#d9d9d9] bg-white px-5 py-4 shadow-sm sm:px-6">
          <label className="mb-2 block text-[14px] font-medium text-[#555555]">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6f6f6f]" />
            <input className={inputClass} type="email" name="email" placeholder="Enter your email" autoComplete="email" />
          </div>

          {error && (
            <p className="mt-3 text-[13px] font-medium text-[#ef4444]">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-5 h-[46px] w-full rounded-[9px] bg-[#f9a514] text-[16px] font-medium text-white transition hover:bg-[#e69412] focus:outline-none focus:ring-4 focus:ring-[#f4a11d]/25 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? 'Sending...' : 'Send Verification Code'}
          </button>

          <div className="mt-4 border-t border-[#e3e3e3] pt-4 text-center text-[13px] text-[#666666]">
            Remember your password?{' '}
            <Link href="/studentpanel/loginform" className="font-medium text-[#f4a11d] hover:underline">
              Sign In
            </Link>
          </div>
        </form>

        <p className="mt-4 text-center text-[13px] text-[#666666]">Verification codes are valid for 10 minutes</p>
      </div>
    </section>
  )
}
