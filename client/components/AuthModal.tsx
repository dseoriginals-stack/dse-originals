"use client"

import { useState, useEffect } from "react"
import { X, Eye, EyeOff } from "lucide-react"
import { FcGoogle } from "react-icons/fc"
import { useAuth } from "@/context/AuthContext"
import ModalPortal from "@/components/ModalPortal"

export default function AuthModal({ open, onClose }: any) {
  const { login, register, user } = useAuth()

  const [mode, setMode] = useState<"login" | "signup">("login")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  /* CLOSE WHEN LOGGED IN */
  useEffect(() => {
    if (user && open) onClose()
  }, [user])

  /* RESET */
  useEffect(() => {
    if (!open) {
      setForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      })
      setError(null)
      setMode("login")
      setShowPassword(false)
    }
  }, [open])

  /* ESC CLOSE */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (open) window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [open])

  if (!open) return null

  /* SUBMIT */
  const handleSubmit = async () => {
    setError(null)

    if (!form.email || !form.password) {
      setError("Email and password required")
      return
    }

    if (mode === "signup") {
      if (!form.name) {
        setError("Name is required")
        return
      }
      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match")
        return
      }
    }

    try {
      setLoading(true)

      let ok = false

      if (mode === "login") {
        ok = await login(form.email, form.password)
      } else {
        ok = await register(form.name, form.email, form.password)
      }

      if (!ok) {
        setError("Invalid credentials")
        return
      }

      // ✅ clean close (no reload)
      onClose()

    } catch {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalPortal>
      <div className="fixed inset-0 flex items-center justify-center z-50 animate-fadeIn">

        {/* BACKDROP */}
        <div
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* CARD */}
        <div className="relative w-full max-w-md mx-auto transform translate-y-0 transition-transform">

          <div className="bg-[var(--bg-card)] rounded-[2rem] border border-[var(--border-light)] shadow-2xl p-8 md:p-10">

            {/* HEADER (CENTERED LOGO ✅) */}
            <div className="relative mb-6 text-center">
              <img src="/DSEoriginals.png" className="h-10 mx-auto opacity-90" />

              <button
                onClick={onClose}
                className="absolute right-0 top-0 text-gray-400 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* TITLE */}
            <h2 className="text-center text-3xl font-extrabold text-[var(--text-heading)] mb-6 tracking-tight">
              {mode === "login" ? "Login" : "Create Account"}
            </h2>

            {/* ERROR */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-xl mb-4">
                {error}
              </div>
            )}

            {/* FORM */}
            <div className="space-y-4">

              {mode === "signup" && (
                <input
                  className="w-full px-5 py-4 rounded-xl border border-[var(--border-light)] bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent transition-all shadow-inner text-[var(--text-heading)] placeholder-[var(--text-muted)] font-medium"
                  placeholder="Full Name"
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                />
              )}

              <input
                className="w-full px-5 py-4 rounded-xl border border-[var(--border-light)] bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent transition-all shadow-inner text-[var(--text-heading)] placeholder-[var(--text-muted)] font-medium"
                placeholder="Email Address"
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full px-5 py-4 rounded-xl border border-[var(--border-light)] bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent transition-all shadow-inner text-[var(--text-heading)] placeholder-[var(--text-muted)] pr-12 font-medium"
                  placeholder="Password"
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()} // ✅ ENTER FIX
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />

                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 transform text-[var(--text-muted)] hover:text-[var(--brand-primary)] transition"
                >
                  {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                </button>
              </div>

              {mode === "signup" && (
                <input
                  type="password"
                  className="w-full px-5 py-4 rounded-xl border border-[var(--border-light)] bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent transition-all shadow-inner text-[var(--text-heading)] placeholder-[var(--text-muted)] font-medium"
                  placeholder="Confirm Password"
                  onChange={(e) =>
                    setForm({ ...form, confirmPassword: e.target.value })
                  }
                />
              )}
            </div>

            {/* CTA */}
            <button
              onClick={handleSubmit}
              className="btn-premium w-full mt-8 !py-4 text-lg shadow-lg"
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                ? "Sign Into My Account"
                : "Create Premium Account"}
            </button>

            {/* SOCIAL */}
            {mode === "login" && (
              <>
                <div className="flex items-center gap-3 my-6">
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <span className="text-xs text-gray-400">or</span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                {/* <button className="w-full py-3 rounded-xl border flex items-center justify-center gap-2 hover:bg-gray-50 transition">
                  <FcGoogle size={18} />
                  Continue with Google
                </button> */}
              </>
            )}

            {/* SWITCH */}
            <p className="text-center text-sm mt-8 text-[var(--text-muted)] font-medium">
              {mode === "login"
                ? "Don't have an account?"
                : "Already have an account?"}{" "}
              <button
                onClick={() =>
                  setMode(mode === "login" ? "signup" : "login")
                }
                className="text-[var(--brand-primary)] font-bold hover:underline underline-offset-2 ml-1"
              >
                {mode === "login" ? "Create Profile" : "Login instead"}
              </button>
            </p>

          </div>
        </div>
      </div>
    </ModalPortal>
  )
}