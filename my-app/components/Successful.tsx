'use client'

import React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check } from 'lucide-react'

interface PasswordSuccessProps {
  logoSrc?: string
  supportEmail?: string
  onReturnToSignIn?: () => void
}

export default function PasswordResetSuccess({
  logoSrc = '/images/student-sidebar-logo.svg',
  supportEmail = 'support@university.edu',
  onReturnToSignIn,
}: PasswordSuccessProps) {
  const router = useRouter()

  const returnToSignIn = () => {
    onReturnToSignIn?.()
    router.push('/studentpanel/loginform')
  }

  return (
    <section className="h-dvh overflow-hidden bg-[#f4f4f4] px-4 py-3 font-sans text-[#242424] sm:px-6 sm:py-4 lg:px-8">
      <div className="mx-auto flex h-full w-full max-w-[520px] flex-col justify-center">
        <button
          type="button"
          onClick={() => router.back()}
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

        <div className="mb-4 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-[15px] bg-[#10c79a]">
            <Check className="h-8 w-8 text-white" strokeWidth={3} />
          </div>
          <h1 className="text-[24px] font-semibold leading-tight text-[#242424] sm:text-[28px]">Password Reset Successful!</h1>
          <p className="mt-3 text-[14px] leading-5 text-[#666666] sm:text-[15px]">
            Your password has been successfully reset.
            <br />
            You can now sign in with your new password.
          </p>
        </div>

        <div className="w-full rounded-[14px] border border-[#d9d9d9] bg-white px-5 py-4 shadow-sm sm:px-6">
          <button
            type="button"
            onClick={returnToSignIn}
            className="flex h-[46px] w-full items-center justify-center gap-3 rounded-[9px] bg-[#f9a514] text-[16px] font-medium text-white transition hover:bg-[#e69412] focus:outline-none focus:ring-4 focus:ring-[#f4a11d]/25"
          >
            <ArrowLeft className="h-5 w-5" />
            Return to Sign In
          </button>

          <div className="mt-4 border-t border-[#e3e3e3] pt-4 text-center text-[13px] text-[#666666]">
            Need help? Contact{' '}
            <a href={`mailto:${supportEmail}`} className="font-medium text-[#f4a11d] hover:underline">
              {supportEmail}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
