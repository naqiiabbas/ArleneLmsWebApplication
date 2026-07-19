'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { verifyRecoveryCode, sendPasswordReset } from '@/lib/auth/actions'

interface VerificationCodeProps {
  onVerify?: (code: string) => void
  onResend?: () => void
  onBack?: () => void
  logoSrc?: string
}

export default function VerificationCodeSection({
  onVerify,
  onResend,
  onBack,
  logoSrc = '/images/student-sidebar-logo.svg',
}: VerificationCodeProps) {
  const [code, setCode] = useState(Array(6).fill(''))
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [resent, setResent] = useState(false)
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])
  const router = useRouter()
  const value = useMemo(() => code.join(''), [code])

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? sessionStorage.getItem('reset_email') : ''
    if (stored) setEmail(stored)
    else router.replace('/studentpanel/forgetpassword')
  }, [router])

  const handleBack = () => {
    onBack?.()
    router.push('/studentpanel/forgetpassword')
  }

  const handleChange = (index: number, nextValue: string) => {
    const digit = nextValue.replace(/\D/g, '').slice(-1)
    const nextCode = [...code]
    nextCode[index] = digit
    setCode(nextCode)
    if (digit && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (value.length < 6 || isLoading) return
    setError('')
    setIsLoading(true)
    const res = await verifyRecoveryCode(email, value)
    setIsLoading(false)
    if (res.error) {
      setError(res.error)
      return
    }
    onVerify?.(value)
    router.push('/studentpanel/createpass')
  }

  const handleResend = async () => {
    onResend?.()
    if (!email) return
    setError('')
    const res = await sendPasswordReset(email)
    if (res.error) setError(res.error)
    else {
      setResent(true)
      window.setTimeout(() => setResent(false), 4000)
    }
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

        <div className="mb-3 flex h-[84px] w-full items-center justify-center rounded-[16px] bg-[#f9a514] px-8 shadow-sm sm:h-[100px]">
          <div className="relative h-[62px] w-[178px]">
            <Image src={logoSrc} alt="100 Black Men of Orange County" fill priority className="object-contain" />
          </div>
        </div>

        <div className="mb-4 text-center">
          <h1 className="text-[24px] font-semibold leading-tight text-[#242424] sm:text-[28px]">Enter Verification Code</h1>
          <p className="mt-2 text-[14px] text-[#666666] sm:text-[15px]">We've sent a 6-digit code to</p>
          <p className="mt-2 text-[15px] font-medium text-[#242424]">{email}</p>
        </div>

        <form onSubmit={handleVerify} className="w-full rounded-[14px] border border-[#d9d9d9] bg-white px-5 py-4 text-center shadow-sm sm:px-6">
          <label className="mb-4 block text-[14px] font-medium text-[#666666]">Verification Code</label>

          <div className="mx-auto mb-5 grid max-w-[330px] grid-cols-6 gap-2 sm:gap-3">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(node) => {
                  inputRefs.current[index] = node
                }}
                value={digit}
                onChange={(event) => handleChange(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                inputMode="numeric"
                maxLength={1}
                className="h-[48px] min-w-0 rounded-[9px] border border-[#d9d9d9] bg-white text-center text-[20px] font-semibold text-[#242424] outline-none transition focus:border-[#f4a11d] focus:ring-4 focus:ring-[#f4a11d]/15 sm:h-[52px]"
              />
            ))}
          </div>

          {error && (
            <p className="mb-3 text-[13px] font-medium text-[#ef4444]">{error}</p>
          )}
          {resent && (
            <p className="mb-3 text-[13px] font-medium text-[#16a34a]">A new code has been sent.</p>
          )}

          <button
            type="submit"
            disabled={value.length < 6 || isLoading}
            className={`h-[46px] w-full rounded-[9px] text-[16px] font-medium text-white transition focus:outline-none focus:ring-4 focus:ring-[#f4a11d]/25 ${
              value.length === 6 && !isLoading ? 'bg-[#f9a514] hover:bg-[#e69412]' : 'cursor-not-allowed bg-[#c7c7c7]'
            }`}
          >
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </button>

          <div className="mt-5 text-[14px] text-[#666666]">
            Didn't receive the code?{' '}
            <button type="button" onClick={handleResend} className="font-semibold text-[#006ee6] hover:underline">
              Resend
            </button>
          </div>
        </form>

        <p className="mt-4 text-center text-[13px] text-[#666666]">Verification codes are valid for 10 minutes</p>
      </div>
    </section>
  )
}
