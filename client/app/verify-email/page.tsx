"use client"

import { useEffect, useState, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { CheckCircle, AlertCircle, Loader2, Mail } from "lucide-react"
import { api } from "@/lib/api"
import toast from "react-hot-toast"

import { Suspense } from "react"

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
       <div className="min-h-screen bg-[var(--bg-main)] flex flex-col items-center justify-center p-4">
         <Loader2 className="animate-spin text-[var(--brand-primary)]" size={48} />
       </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")
  
  const [status, setStatus] = useState<"loading" | "success" | "error" | "no-token">("loading")
  const [message, setMessage] = useState("")
  const verifiedRef = useRef(false)

  useEffect(() => {
    if (verifiedRef.current) return
    
    if (!token) {
      setStatus("no-token")
      return
    }

    const verify = async () => {
      try {
        const res = await api.get(`/auth/verify-email?token=${token}`)
        setStatus("success")
        setMessage(res.message || "Email verified successfully!")
        toast.success(res.message || "Email verified!")
        verifiedRef.current = true
      } catch (err: any) {
        setStatus("error")
        const msg = err.message || "Verification failed. The link may be invalid or expired."
        setMessage(msg)
        toast.error(msg)
      }
    };

    verify()
  }, [token])

  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-[2rem] border border-[var(--border-light)] shadow-2xl p-8 md:p-10 text-center">
        
        {status === "loading" && (
          <>
            <Loader2 className="animate-spin text-[var(--brand-primary)] mx-auto mb-6" size={48} />
            <h2 className="text-2xl font-extrabold text-[var(--text-heading)] mb-4">Verifying your email</h2>
            <p className="text-[var(--text-muted)]">Please wait while we activate your account...</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <CheckCircle size={40} />
            </div>
            <h2 className="text-3xl font-extrabold text-[var(--text-heading)] mb-4 tracking-tight">Email Verified!</h2>
            <p className="text-[var(--text-muted)] mb-8 leading-relaxed">
              {message}
            </p>
            <Link href="/login" className="btn-premium w-full !py-4 shadow-lg !rounded-xl text-base !font-bold">
              Sign In Now
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <AlertCircle size={40} />
            </div>
            <h2 className="text-3xl font-extrabold text-[var(--text-heading)] mb-4 tracking-tight">Verification Failed</h2>
            <p className="text-[var(--text-muted)] mb-8 leading-relaxed">
              {message}
            </p>
            <div className="space-y-4">
              <Link href="/login" className="btn-premium w-full !py-4 shadow-lg !rounded-xl text-base !font-bold">
                Go to Login
              </Link>
              <p className="text-sm text-[var(--text-muted)]">
                If you think this is a mistake, you can try logging in to resend the verification email.
              </p>
            </div>
          </>
        )}

        {status === "no-token" && (
          <>
            <div className="w-20 h-20 bg-gray-50 text-gray-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Mail size={40} />
            </div>
            <h2 className="text-2xl font-extrabold text-[var(--text-heading)] mb-4">Invalid Link</h2>
            <p className="text-[var(--text-muted)] mb-8">
              No verification token found. Please check your email for the correct link.
            </p>
            <Link href="/" className="btn-premium w-full !py-4 shadow-lg !rounded-xl text-base !font-bold">
              Back to Home
            </Link>
          </>
        )}

      </div>
    </div>
  )
}
