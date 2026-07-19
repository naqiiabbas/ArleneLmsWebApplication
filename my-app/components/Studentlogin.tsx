'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, Lock, LogIn, Mail, UserCircle } from 'lucide-react'
import { signIn, startResetByStudentId } from '@/lib/auth/actions'

interface AuthTab {
  id: 'email' | 'student'
  label: string
}

interface LoginFormProps {
  logoSrc?: string
  supportEmail?: string
}

const tabs: AuthTab[] = [
  { id: 'email', label: 'Email & Password' },
  { id: 'student', label: 'Student ID' },
]

const authShell =
  'h-dvh overflow-hidden bg-[#f4f4f4] px-4 py-3 font-sans text-[#242424] sm:px-6 sm:py-4 lg:px-8'
const inputClass =
  'h-[52px] w-full rounded-[10px] border border-[#d9d9d9] bg-white pl-12 pr-4 text-[15px] text-[#242424] outline-none transition focus:border-[#f4a11d] focus:ring-4 focus:ring-[#f4a11d]/15 placeholder:text-[#8a8a8a]'

export default function LoginForm({
  logoSrc = '/images/student-sidebar-logo.svg',
  supportEmail = 'support@university.edu',
}: LoginFormProps) {
  const [activeTab, setActiveTab] = useState<AuthTab['id']>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [studentId, setStudentId] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    // Student ID tab: resolve the ID to an email and send a verification code.
    if (activeTab === 'student') {
      if (!studentId.trim()) {
        setError('Please enter your Student ID.')
        return
      }
      setIsLoading(true)
      const res = await startResetByStudentId(studentId)
      setIsLoading(false)
      if (res.error || !res.email) {
        setError(res.error ?? 'Could not start verification.')
        return
      }
      sessionStorage.setItem('reset_email', res.email)
      router.push('/studentpanel/studentverify')
      return
    }

    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }
    setIsLoading(true)
    const res = await signIn('student', email, password)
    setIsLoading(false)
    // On success the server action redirects; only errors return here.
    if (res?.error) setError(res.error)
  }

  return (
    <section className={authShell}>
      <div className="mx-auto flex h-full w-full max-w-[520px] flex-col items-center justify-center">
        <div className="mb-3 flex h-[84px] w-full items-center justify-center rounded-[16px] bg-[#f9a514] px-8 shadow-sm sm:h-[100px]">
          <div className="relative h-[62px] w-[178px]">
            <Image src={logoSrc} alt="100 Black Men of Orange County" fill priority className="object-contain" />
          </div>
        </div>

        <div className="mb-4 text-center">
          <h1 className="text-[24px] font-semibold leading-tight text-[#242424] sm:text-[28px]">Welcome Back</h1>
          <p className="mt-2 text-[14px] text-[#707070] sm:text-[15px]">Sign in to access your portal</p>
        </div>

        <form onSubmit={handleSubmit} className="w-full rounded-[14px] border border-[#d9d9d9] bg-white px-5 py-4 shadow-sm sm:px-6">
          <div className="mb-4 grid rounded-[10px] bg-[#f2f2f2] p-1">
            <div className="grid grid-cols-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                className={`h-[42px] rounded-[9px] text-[14px] font-medium transition ${
                    activeTab === tab.id
                      ? 'bg-white text-[#f4a11d] shadow-[0_2px_8px_rgba(0,0,0,0.13)]'
                      : 'text-[#666666] hover:text-[#f4a11d]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'email' ? (
            <div className="space-y-3">
              <div>
                <label className="mb-2 block text-[14px] font-medium text-[#555555]">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6f6f6f]" />
                  <input className={inputClass} type="email" placeholder="Enter your email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[14px] font-medium text-[#555555]">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6f6f6f]" />
                  <input className={`${inputClass} pr-12`} type="password" placeholder="Enter your password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
                  <Eye className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6f6f6f]" />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-[14px] text-[#666666]">
                  <input type="checkbox" className="h-4 w-4 rounded border-[#cfcfcf] accent-[#f4a11d]" />
                  Remember me
                </label>
                <Link href="/studentpanel/forgetpassword" className="text-[14px] font-medium text-[#f4a11d] hover:underline">
                  Forgot Password?
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <label className="mb-2 block text-[14px] font-medium text-[#555555]">Student ID</label>
              <div className="relative">
                <UserCircle className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6f6f6f]" />
                <input className={inputClass} type="text" placeholder="Enter your student ID (e.g., STU001)" autoComplete="username" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
              </div>
              <p className="mt-2 text-[12px] text-[#666666]">Your student ID can be found on your student card</p>
            </div>
          )}

          {error && (
            <p className="mt-3 text-center text-[13px] font-medium text-[#ef4444]">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 flex h-[46px] w-full items-center justify-center gap-2 rounded-[9px] bg-[#f9a514] text-[16px] font-medium text-white transition hover:bg-[#e69412] focus:outline-none focus:ring-4 focus:ring-[#f4a11d]/25 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <LogIn className="h-5 w-5" />
            {isLoading ? 'Please wait...' : activeTab === 'student' ? 'Send Verification Code' : 'Sign In'}
          </button>

          <div className="mt-4 border-t border-[#e3e3e3] pt-4 text-center text-[13px] text-[#666666]">
            Need help? Contact{' '}
            <a href={`mailto:${supportEmail}`} className="font-medium text-[#f4a11d] hover:underline">
              {supportEmail}
            </a>
          </div>
        </form>

        <p className="mt-4 text-center text-[12px] leading-5 text-[#666666] sm:text-[13px]">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </section>
  )
}
