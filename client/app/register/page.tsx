"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle, User, Mail, Lock } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/lib/api"

type FieldError = {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
}

function validateForm(
  name: string,
  email: string,
  password: string,
  confirmPassword: string
): FieldError {
  const errors: FieldError = {}

  if (!name.trim() || name.trim().length < 2) {
    errors.name = "Full name must be at least 2 characters."
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email.trim() || !emailRegex.test(email)) {
    errors.email = "Please enter a valid email address."
  }

  if (password.length < 6) {
    errors.password = "Password must be at least 6 characters."
  }

  if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match."
  }

  return errors
}

export default function RegisterPage() {
  const router = useRouter()
  const { register, user, loading: authLoading } = useAuth()

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldError>({})
  const [success, setSuccess] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/")
    }
  }, [user, authLoading])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    // Clear specific field error on change
    if (fieldErrors[name as keyof FieldError]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
    }
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmedName = form.name.trim()
    const trimmedEmail = form.email.trim().toLowerCase()

    // Client-side validation
    const errors = validateForm(trimmedName, trimmedEmail, form.password, form.confirmPassword)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setFieldErrors({})
    setLoading(true)

    try {
      const result = await register(trimmedName, trimmedEmail, form.password)

      if (!result.success) {
        setError(result.message || "Registration failed. Please try again.")
        setLoading(false)
        return
      }

      setSuccess(true)
    } catch {
      setError("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)]">
        <Loader2 className="animate-spin text-[var(--brand-primary)]" size={36} />
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-[2rem] border border-[var(--border-light)] shadow-2xl p-8 md:p-10 text-center">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Mail size={40} />
          </div>
          <h2 className="text-3xl font-extrabold text-[var(--text-heading)] mb-4 tracking-tight">Verify your email</h2>
          <p className="text-[var(--text-muted)] mb-8 leading-relaxed">
            We&apos;ve sent a verification link to <span className="font-bold text-[var(--text-heading)]">{form.email}</span>. Please check your inbox and click the link to activate your account.
          </p>
          <div className="space-y-4">
             <Link href="/login" className="btn-premium w-full !py-4 shadow-lg !rounded-xl text-base !font-bold">
               Back to Login
             </Link>
             <p className="text-xs text-[var(--text-muted)]">
               Didn&apos;t receive it? Check your spam folder or contact support.
             </p>
          </div>
        </div>
      </div>
    )
  }

  const passwordStrength = (() => {
    const p = form.password
    if (!p) return null
    if (p.length < 6) return { label: "Too short", color: "bg-red-400", width: "33%" }
    if (p.length < 10) return { label: "Fair", color: "bg-yellow-400", width: "66%" }
    return { label: "Strong", color: "bg-emerald-500", width: "100%" }
  })()

  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex flex-col md:flex-row">

      {/* =========== LEFT PANEL (BRAND) =========== */}
      <div className="hidden md:flex md:w-[45%] bg-[#274C77] flex-col items-center justify-center p-12 relative overflow-hidden">
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
            Join DSE Originals
          </h1>
          <p className="text-white/60 text-sm leading-relaxed">
            Create your account and unlock exclusive access to our premium collections and member benefits.
          </p>

          <div className="mt-10 space-y-3 text-left">
            {[
              "Exclusive member-only deals",
              "Easy order tracking",
              "Saved addresses for fast checkout",
              "Lucky Points rewards program",
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3 backdrop-blur-sm border border-white/10">
                <CheckCircle size={16} className="text-[#A3CEF1] flex-shrink-0" />
                <span className="text-white/80 text-sm font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =========== RIGHT PANEL (FORM) =========== */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 md:py-8">

        {/* Mobile Logo */}
        <div className="md:hidden mb-8">
          <Image src="/DSEoriginals.png" alt="DSE" width={120} height={40} className="mx-auto" />
        </div>

        <div className="w-full max-w-md">

          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-[var(--text-heading)] tracking-tight">
              Create your account
            </h2>
            <p className="text-[var(--text-muted)] text-sm mt-1">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[var(--brand-primary)] font-bold hover:underline underline-offset-2"
              >
                Sign in here
              </Link>
            </p>
          </div>

          {/* Global Error */}
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-5 text-sm font-medium">
              <AlertCircle size={18} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {/* Full Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-bold uppercase tracking-widest text-[var(--text-heading)] mb-2"
              >
                Full Name
              </label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full pl-10 pr-4 py-3.5 rounded-xl border-2 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/10 text-[var(--text-heading)] placeholder-[var(--text-muted)] font-medium transition-all disabled:opacity-60 ${
                    fieldErrors.name
                      ? "border-red-400 focus:border-red-400"
                      : "border-[var(--border-light)] focus:border-[var(--brand-primary)]"
                  }`}
                />
              </div>
              {fieldErrors.name && (
                <p className="text-red-500 text-xs mt-1.5 font-medium">{fieldErrors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold uppercase tracking-widest text-[var(--text-heading)] mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full pl-10 pr-4 py-3.5 rounded-xl border-2 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/10 text-[var(--text-heading)] placeholder-[var(--text-muted)] font-medium transition-all disabled:opacity-60 ${
                    fieldErrors.email
                      ? "border-red-400 focus:border-red-400"
                      : "border-[var(--border-light)] focus:border-[var(--brand-primary)]"
                  }`}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-red-500 text-xs mt-1.5 font-medium">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-widest text-[var(--text-heading)] mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full pl-10 pr-12 py-3.5 rounded-xl border-2 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/10 text-[var(--text-heading)] placeholder-[var(--text-muted)] font-medium transition-all disabled:opacity-60 ${
                    fieldErrors.password
                      ? "border-red-400 focus:border-red-400"
                      : "border-[var(--border-light)] focus:border-[var(--brand-primary)]"
                  }`}
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

              {/* Password Strength Meter */}
              {form.password && passwordStrength && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${passwordStrength.color}`}
                        style={{ width: passwordStrength.width }}
                      />
                    </div>
                    <span className={`text-xs font-semibold ${
                      passwordStrength.label === "Strong" ? "text-emerald-600" :
                      passwordStrength.label === "Fair" ? "text-yellow-600" : "text-red-500"
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                </div>
              )}

              {fieldErrors.password && (
                <p className="text-red-500 text-xs mt-1.5 font-medium">{fieldErrors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-bold uppercase tracking-widest text-[var(--text-heading)] mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Re-enter password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full pl-10 pr-12 py-3.5 rounded-xl border-2 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/10 text-[var(--text-heading)] placeholder-[var(--text-muted)] font-medium transition-all disabled:opacity-60 ${
                    fieldErrors.confirmPassword
                      ? "border-red-400 focus:border-red-400"
                      : form.confirmPassword && form.confirmPassword === form.password
                      ? "border-emerald-400 focus:border-emerald-400"
                      : "border-[var(--border-light)] focus:border-[var(--brand-primary)]"
                  }`}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirmPassword((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--brand-primary)] transition"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1.5 font-medium">{fieldErrors.confirmPassword}</p>
              )}
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
                  Creating Account...
                </span>
              ) : (
                "Create My Account"
              )}
            </button>

          </form>

          <p className="mt-8 text-center text-xs text-[var(--text-muted)]">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="text-[var(--brand-primary)] hover:underline">Terms of Service</Link>
            {" "}and{" "}
            <Link href="/privacy" className="text-[var(--brand-primary)] hover:underline">Privacy Policy</Link>.
          </p>

        </div>
      </div>
    </div>
  )
}
