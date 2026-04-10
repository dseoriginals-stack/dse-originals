"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/lib/api"

import { Suspense } from "react"

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)]">
        <Loader2 className="animate-spin text-[var(--brand-primary)]" size={36} />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, user, loading: authLoading } = useAuth()

  const [form, setForm] = useState({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const redirectTo = searchParams.get("redirect") || "/"
  const justRegistered = searchParams.get("registered") === "1"

  // If already logged in, redirect
  useEffect(() => {
    if (!authLoading && user) {
      router.replace(redirectTo)
    }
  }, [user, authLoading])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    if (error) setError(null)
  }

  const [unverified, setUnverified] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendMessage, setResendMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setUnverified(false)
    setResendMessage(null)

    const emailTrimmed = form.email.trim().toLowerCase()
    const passwordTrimmed = form.password

    if (!emailTrimmed || !passwordTrimmed) {
      setError("Please enter your email and password.")
      return
    }

    setLoading(true)

    try {
      const result = await login(emailTrimmed, passwordTrimmed)

      if (!result.success) {
        setError(result.message || "Invalid email or password.")
        if (result.unverified) setUnverified(true)
        setLoading(false)
        return
      }

      router.replace(redirectTo)
    } catch {
      setError("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!form.email) return
    setResending(true)
    setError(null)
    try {
      const res = await api.post("/auth/resend-verification", { email: form.email.trim().toLowerCase() })
      setResendMessage(res.message || "Verification email sent!")
    } catch (err: any) {
      setError(err.message || "Failed to resend email.")
    } finally {
      setResending(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)]">
        <Loader2 className="animate-spin text-[var(--brand-primary)]" size={36} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex flex-col md:flex-row">

      {/* =========== LEFT PANEL (BRAND) =========== */}
      <div className="hidden md:flex md:w-[45%] bg-[#274C77] flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-[-80px] left-[-80px] w-96 h-96 bg-[#6096BA]/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-60px] right-[-60px] w-80 h-80 bg-[#A3CEF1]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center max-w-sm">
          <Image
            src="/DSE.png"
            alt="DSE Originals"
            width={140}
            height={50}
            className="brightness-0 invert mx-auto mb-10"
          />

          <h1 className="text-3xl font-extrabold text-white tracking-tight leading-snug mb-4">
            Welcome back to<br />DSE Originals
          </h1>
          <p className="text-white/60 text-sm leading-relaxed">
            Your premium destination for exclusive collections crafted for remarkable people.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-4 text-white/80">
            {[
              { label: "Products", value: "50+" },
              { label: "Orders", value: "1K+" },
              { label: "Members", value: "500+" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 rounded-2xl p-4 text-center backdrop-blur-sm border border-white/10">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-[10px] uppercase tracking-widest mt-1 text-white/50">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =========== RIGHT PANEL (FORM) =========== */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 md:py-0">

        {/* Mobile Logo */}
        <div className="md:hidden mb-8">
          <Image src="/DSEoriginals.png" alt="DSE" width={120} height={40} className="mx-auto" />
        </div>

        <div className="w-full max-w-md">

          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-[var(--text-heading)] tracking-tight">
              Sign in
            </h2>
            <p className="text-[var(--text-muted)] text-sm mt-1">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-[var(--brand-primary)] font-bold hover:underline underline-offset-2"
              >
                Create one here
              </Link>
            </p>
          </div>

          {/* Success Banner (from redirect after register) */}
          {justRegistered && (
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 mb-5 text-sm font-medium">
              <CheckCircle size={18} className="flex-shrink-0" />
              Account created successfully! Sign in below.
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex flex-col gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-5 text-sm font-medium">
              <div className="flex items-center gap-3">
                <AlertCircle size={18} className="flex-shrink-0" />
                {error}
              </div>
              {unverified && (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="text-[var(--brand-primary)] hover:underline text-left ml-7 font-bold disabled:opacity-50"
                >
                  {resending ? "Sending..." : "Resend verification email"}
                </button>
              )}
            </div>
          )}

          {/* Resend Success */}
          {resendMessage && (
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 mb-5 text-sm font-medium">
              <CheckCircle size={18} className="flex-shrink-0" />
              {resendMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold uppercase tracking-widest text-[var(--text-heading)] mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-4 py-3.5 rounded-xl border-2 border-[var(--border-light)] bg-white focus:outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/10 text-[var(--text-heading)] placeholder-[var(--text-muted)] font-medium transition-all disabled:opacity-60"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold uppercase tracking-widest text-[var(--text-heading)]"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-[var(--brand-primary)] hover:underline font-semibold"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Your password"
                  value={form.password}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-3.5 pr-12 rounded-xl border-2 border-[var(--border-light)] bg-white focus:outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/10 text-[var(--text-heading)] placeholder-[var(--text-muted)] font-medium transition-all disabled:opacity-60"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--brand-primary)] transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-premium w-full !py-4 !rounded-xl text-base !font-bold shadow-lg mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign Into My Account"
              )}
            </button>

          </form>

          <p className="mt-8 text-center text-xs text-[var(--text-muted)]">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="text-[var(--brand-primary)] hover:underline">Terms</Link>
            {" "}and{" "}
            <Link href="/privacy" className="text-[var(--brand-primary)] hover:underline">Privacy Policy</Link>.
          </p>

        </div>
      </div>
    </div>
  )
}
