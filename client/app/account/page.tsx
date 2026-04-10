"use client"

import { useState, useEffect } from "react"
import {
  User,
  Package,
  Heart,
  Star,
  Settings,
  LogOut,
  ChevronRight,
  TrendingUp,
  CreditCard,
  Truck,
  Clock,
  ArrowRight,
  ShieldCheck,
  Search,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/lib/api"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"

export default function AccountPage() {
  const { user, loading, logout, login, register } = useAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedOrder, setSelectedOrder] = useState<any>(null)

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  async function fetchOrders() {
    try {
      setLoadingOrders(true)
      const data = await api.get("/orders/my-orders")
      setOrders(data || [])
    } catch (err) {
      console.error("Failed to load orders")
    } finally {
      setLoadingOrders(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!user) {
    return <GuestPortal login={login} register={register} />
  }

  const totalSpent = orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0)
  const luckyPoints = user.luckyPoints || 0
  const lifetimePoints = user.lifetimePoints || 0
  const userTier = user.tier || "Faith"

  return (
    <div className="min-h-screen bg-[var(--bg-main)] pb-24">
      {/* HEADER SECTION */}
      <div className="bg-white border-b border-[var(--border-light)] pt-12 pb-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-[var(--brand-soft)]/5 skew-x-12 translate-x-32" />
        <div className="container max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-[var(--brand-primary)] rounded-[2rem] flex items-center justify-center text-white text-3xl font-black shadow-2xl shadow-[var(--brand-primary)]/20">
                {user.name?.[0].toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--brand-primary)] opacity-60">DSE Originals Elite</span>
                  <ShieldCheck size={14} className="text-[var(--brand-primary)]" />
                </div>
                <h1 className="text-4xl font-[1000] text-[var(--text-heading)] tracking-tighter leading-none">
                  Hello, {user.name?.split(' ')[0]}
                </h1>
                <p className="text-[var(--text-muted)] font-bold mt-2 flex items-center gap-2">
                  <Mail size={14} /> {user.email}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border-2 border-slate-100 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-red-500 hover:border-red-50 transition-all shadow-sm"
            >
              <LogOut size={16} /> Terminate Session
            </button>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-6 -mt-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* SIDEBAR NAVIGATION */}
          <div className="lg:col-span-1 space-y-2 flex flex-row lg:flex-col overflow-x-auto pb-4 lg:pb-0 custom-scrollbar gap-2">
            {[
              { id: 'overview', label: 'Dashboard', icon: <TrendingUp size={16} /> },
              { id: 'orders', label: 'My Orders', icon: <Package size={16} /> },
              { id: 'settings', label: 'Profile Settings', icon: <Settings size={16} /> }
            ].map((tab: any) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs font-[1000] uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-[var(--brand-primary)] text-white shadow-lg' : 'text-gray-400 hover:text-[var(--brand-primary)]'
                  }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* CONTENT VIEWS */}
          <div className="lg:col-span-3 bg-white rounded-[2.5rem] border border-[var(--border-light)] shadow-sm p-8 md:p-12 min-h-[500px]">
            {activeTab === 'overview' && (
              <div className="animate-fade-in space-y-12">
                <div className="grid md:grid-cols-3 gap-6">
                  <ProfileStat label="Total Expenditures" value={`₱${totalSpent.toLocaleString()}`} icon={<CreditCard size={20} />} color="bg-blue-50 text-blue-500" />
                  <ProfileStat label="Reward Points" value={luckyPoints.toLocaleString()} icon={<Star size={20} />} color="bg-amber-50 text-amber-500" />
                  <ProfileStat label="Loyalty Tier" value={userTier} icon={<Heart size={20} />} color={userTier === "Love" ? "bg-rose-50 text-rose-500" : userTier === "Hope" ? "bg-amber-50 text-amber-500" : "bg-blue-50 text-blue-500"} />
                </div>

                {/* LOYALTY PROGRESSION CARD */}
                <div className="bg-[var(--bg-surface)] rounded-[2.5rem] border border-[var(--border-light)] p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-12 opacity-[0.03] scale-[3] pointer-events-none">
                    {userTier === "Love" ? <Heart size={64} fill="currentColor" /> : <Star size={64} fill="currentColor" />}
                  </div>
                  <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                      <div>
                        <h3 className="text-xl font-black text-[var(--text-heading)] flex items-center gap-2">
                          Loyalty Rank: <span className={userTier === "Love" ? "text-rose-500" : userTier === "Hope" ? "text-amber-500" : "text-blue-500"}>{userTier}</span>
                        </h3>
                        <p className="text-xs font-bold text-[var(--text-muted)] mt-1 uppercase tracking-widest">
                          Lifetime Accumulation: {lifetimePoints.toLocaleString()} Points
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {["Faith", "Hope", "Love"].map((t) => (
                          <div key={t} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${userTier === t
                            ? "bg-[var(--brand-primary)] border-[var(--brand-primary)] text-white shadow-lg shadow-[var(--brand-primary)]/20"
                            : "bg-white border-transparent text-gray-300"
                            }`}>
                            {t}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-3">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                        <span>{userTier === "Love" ? "Peak Rank Reached" : "Next Tier Progress"}</span>
                        <span>{userTier === "Faith" ? "500" : userTier === "Hope" ? "1,000" : "Max"}</span>
                      </div>
                      <div className="h-4 bg-white border border-gray-100 rounded-full overflow-hidden shadow-inner p-1">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${userTier === "Love" ? 100 : userTier === "Hope" ? (lifetimePoints / 1000) * 100 : (lifetimePoints / 500) * 100}%` }}
                          className={`h-full rounded-full ${userTier === "Love" ? "bg-rose-500" : userTier === "Hope" ? "bg-amber-500" : "bg-blue-500"}`}
                        />
                      </div>
                      <p className="text-[10px] italic font-bold text-gray-400 text-center">
                        {userTier === "Faith" ? "500 points to unlock Hope" : userTier === "Hope" ? "1,000 points to unlock Love" : "You have reached the highest tier of love."}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-black text-[var(--text-heading)] mb-6">Recent Activity</h3>
                  {orders.length === 0 ? (
                    <div className="p-10 bg-[var(--bg-surface)] rounded-[2rem] text-center italic text-gray-400 font-bold text-sm">No recent transactions found</div>
                  ) : (
                    <div className="space-y-4">
                      {orders.slice(0, 3).map((o: any) => (
                        <OrderSummaryCard key={o.id} order={o} onClick={() => { setSelectedOrder(o); setActiveTab('orders'); }} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="animate-fade-in">
                <h3 className="text-2xl font-[1000] text-[var(--text-heading)] mb-8 tracking-tighter">Order History</h3>
                {loadingOrders ? (
                  <div className="space-y-4">{Array(3).fill(0).map((_, i: number) => <div key={i} className="h-24 bg-gray-50 rounded-2xl animate-pulse" />)}</div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-20">
                    <Package size={48} className="mx-auto text-gray-100 mb-4" />
                    <p className="text-gray-400 font-bold italic">Your closet is currently empty. Start shopping now!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((o: any) => (
                      <OrderDetailedCard key={o.id} order={o} isSelected={selectedOrder?.id === o.id} onSelect={() => setSelectedOrder(o)} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="animate-fade-in max-w-xl">
                <h3 className="text-2xl font-[1000] text-[var(--text-heading)] mb-2 tracking-tighter">Account Integrity</h3>
                <p className="text-[var(--text-muted)] text-sm font-bold mb-10 uppercase tracking-wider">Maintain your profile credentials</p>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-[1000] uppercase tracking-widest text-gray-400 ml-1">Full Identity</label>
                    <input defaultValue={user.name} className="w-full px-6 py-4 bg-[var(--bg-surface)] border-2 border-transparent focus:border-[var(--brand-primary)] rounded-2xl font-bold outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-[1000] uppercase tracking-widest text-gray-400 ml-1">Verified Email</label>
                    <input defaultValue={user.email} disabled className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl font-bold text-gray-400 cursor-not-allowed" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ============================
GUEST PORTAL COMPONENT
============================ */

function GuestPortal({ login, register }: any) {
  const [tab, setTab] = useState<"login" | "register" | "track">("login")

  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center p-4 md:p-6 py-10 md:py-20">
      <div className="w-full max-w-5xl grid md:grid-cols-12 bg-white rounded-3xl md:rounded-[3.5rem] shadow-2xl overflow-hidden border border-[var(--border-light)] relative">

        {/* LEFT DECORATIVE PANEL */}
        <div className="hidden md:flex md:col-span-5 bg-[#274C77] p-12 text-white flex-col justify-between relative overflow-hidden">
          <div className="absolute top-[-50px] left-[-30px] w-64 h-64 bg-white/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-[-30px] right-[-30px] w-48 h-48 bg-[var(--brand-accent)]/20 rounded-full blur-[60px]" />

          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-10 backdrop-blur-md border border-white/20 shadow-xl">
              <User className="text-white" size={32} />
            </div>
            <h2 className="text-4xl font-[1000] tracking-tighter mb-4 leading-none text-white">DSEoriginals</h2>
            <p className="text-white/60 text-sm font-bold leading-relaxed mb-8">Access your exclusive order history, manage premium shipments, and accumulate lucky points on every successful order.</p>

            <div className="space-y-4">
              {[
                { icon: <TrendingUp size={16} />, text: "Automated Profit Analytics" },
                { icon: <Truck size={16} />, text: "Live Logistics Deep-Links" },
                { icon: <Heart size={16} />, text: "Loyalty Appreciation Points" }
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3 text-xs font-bold text-white/80">
                  <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">{f.icon}</div>
                  {f.text}
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 pt-10 border-t border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">

          </div>
        </div>

        {/* RIGHT CONTENT PANEL */}
        <div className="col-span-12 md:col-span-7 flex flex-col p-6 sm:p-10 md:p-16">
          <div className="flex bg-[var(--bg-surface)] p-2 rounded-2xl mb-12 gap-1 overflow-x-auto scrollbar-hide">
            {[
              { id: "login", label: "Sign In", icon: <Lock size={14} /> },
              { id: "register", label: "Create Account", icon: <User size={14} /> },
              { id: "track", label: "Guest Track", icon: <Truck size={14} /> }
            ].map((t: any) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex-1 ${tab === t.id ? 'bg-white text-[var(--brand-primary)] shadow-md translate-y-[-1px]' : 'text-slate-500 hover:bg-white/50 hover:text-[var(--brand-primary)]'
                  }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "circOut" }}
              className="flex-1 flex flex-col"
            >
              {tab === 'login' && <AccountLoginForm login={login} />}
              {tab === 'register' && <AccountRegisterForm register={register} setTab={setTab} />}
              {tab === 'track' && <AccountGuestTrack />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

/* LOGIN FORM */
function AccountLoginForm({ login }: any) {
  const [form, setForm] = useState({ email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await login(form.email, form.password)
      if (!res.success) setError(res.message)
    } catch {
      setError("Network or server error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      <h3 className="text-3xl font-[1000] text-[var(--text-heading)] mb-2 tracking-tighter leading-none">Sign into Dashboard</h3>
      <p className="text-[var(--text-muted)] text-sm font-bold uppercase tracking-wider mb-10">Access your DSE profile</p>
      {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold mb-6 flex items-center gap-2 border border-red-100 animate-shake">
        <AlertCircle size={16} /> {error}
      </div>}

      <div className="mb-6">
        <button
          onClick={() => {
            window.location.href = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000"}/api/auth/google`
          }}
          className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl border-2 border-[var(--border-light)] bg-white hover:bg-gray-50 transition-all font-bold text-[var(--text-heading)]"
        >
          <Image src="/google-icon.svg" alt="Google" width={20} height={20} />
          Login with Google
        </button>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--border-light)]"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-4 text-slate-400 font-bold tracking-widest">Or login with</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Identity (Email)</label>
          <div className="relative">
            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            <input
              type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full pl-14 pr-6 py-4 bg-[var(--bg-surface)] border-2 border-transparent focus:bg-white focus:border-[var(--brand-primary)] rounded-3xl font-bold transition-all outline-none text-[var(--text-main)] placeholder:text-gray-400"
              placeholder="example@gmail.com"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Security Credentials</label>
          <div className="relative">
            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            <input
              type={showPass ? "text" : "password"} required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full pl-14 pr-16 py-4 bg-[var(--bg-surface)] border-2 border-transparent focus:bg-white focus:border-[var(--brand-primary)] rounded-3xl font-bold transition-all outline-none text-[var(--text-main)] placeholder:text-gray-400"
              placeholder="••••••••"
            />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[var(--brand-primary)] transition">
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button disabled={loading} className="btn-premium w-full !py-5 shadow-2xl !rounded-3xl !font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2">
          {loading ? <Loader2 className="animate-spin" size={18} /> : <>Initialize Entry <ArrowRight size={18} /></>}
        </button>
      </form>
    </div>
  )
}

/* REGISTER FORM */
function AccountRegisterForm({ register, setTab }: any) {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirm) return setError("Passwords do not match")
    setLoading(true)
    setError(null)
    try {
      const res = await register(form.name, form.email, form.password)
      if (res.success) {
        setSuccess(true)
        setTimeout(() => setTab('login'), 3000)
      } else {
        setError(res.message)
      }
    } catch {
      setError("Server unreachable")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <CheckCircle2 size={40} />
        </div>
        <h3 className="text-3xl font-[1000] text-[var(--text-heading)] mb-4 tracking-tighter">Identity Verified</h3>
        <p className="text-[var(--text-muted)] font-bold mb-6">Welcome to the elite rank. Redirecting to access terminal...</p>
        <div className="w-10 h-1 border-2 border-emerald-500/20 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 3 }} className="h-full bg-emerald-500" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      <h3 className="text-3xl font-[1000] text-[var(--text-heading)] mb-2 tracking-tighter leading-none">Elite Enrollment</h3>
      <p className="text-[var(--text-muted)] text-sm font-bold uppercase tracking-wider mb-8">Join the DSE Originals collective</p>

      <div className="mb-6 mb-8">
        <button
          type="button"
          onClick={() => {
            window.location.href = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000"}/api/auth/google`
          }}
          className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl border-2 border-[var(--border-light)] bg-white hover:bg-gray-50 transition-all font-bold text-[var(--text-heading)]"
        >
          <Image src="/google-icon.svg" alt="Google" width={20} height={20} />
          Continue with Google
        </button>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--border-light)]"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-4 text-slate-400 font-bold tracking-widest">Or create account with</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-slate-500">Full Name</label>
          <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-5 py-3.5 bg-[var(--bg-surface)] border-2 border-transparent focus:bg-white focus:border-[var(--brand-primary)] rounded-2xl font-bold transition-all outline-none text-sm text-[var(--text-main)]" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-slate-500">Email Address</label>
          <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-5 py-3.5 bg-[var(--bg-surface)] border-2 border-transparent focus:bg-white focus:border-[var(--brand-primary)] rounded-2xl font-bold transition-all outline-none text-sm text-[var(--text-main)]" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-slate-500">Security Password</label>
          <input required type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full px-5 py-3.5 bg-[var(--bg-surface)] border-2 border-transparent focus:bg-white focus:border-[var(--brand-primary)] rounded-2xl font-bold transition-all outline-none text-sm text-[var(--text-main)]" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-slate-500">Verify Password</label>
          <input required type="password" value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} className="w-full px-5 py-3.5 bg-[var(--bg-surface)] border-2 border-transparent focus:bg-white focus:border-[var(--brand-primary)] rounded-2xl font-bold transition-all outline-none text-sm text-[var(--text-main)]" />
        </div>

        {error && <div className="col-span-full py-2 text-[10px] font-black uppercase text-red-500 tracking-widest">{error}</div>}

        <button disabled={loading} className="col-span-full btn-premium !py-4 shadow-xl !rounded-2xl !font-black uppercase tracking-widest mt-4">
          {loading ? "Verifying..." : "Confirm Enrollment"}
        </button>
      </form>
    </div>
  )
}

/* TRACK FORM */
function AccountGuestTrack() {
  const [id, setId] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [order, setOrder] = useState<any>(null)
  const [error, setError] = useState("")

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await api.get(`/orders/track?id=${id}&email=${email}`)
      setOrder(res)
    } catch {
      setError("No record found matching these credentials.")
    } finally {
      setLoading(false)
    }
  }

  if (order) {
    return (
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-[var(--text-heading)]">Shipment: {order.status.toUpperCase()}</h3>
          <button onClick={() => setOrder(null)} className="text-[10px] font-black uppercase text-[var(--brand-primary)]">Close Result</button>
        </div>
        <div className="bg-[var(--bg-surface)] p-6 rounded-3xl border border-[var(--border-light)]">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[var(--brand-primary)] shadow-sm">
              <Truck size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">J&T Logistics Pin</p>
              <p className="font-mono font-black text-[var(--brand-primary)]">{order.trackingNo || 'Preparing Manifest'}</p>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-white">
            {order.trackingNo && (
              <a
                href={`https://www.jtexpress.ph/index/query/gzquery.html?bills=${order.trackingNo}`}
                target="_blank"
                className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 group shadow-sm"
              >
                <span className="text-xs font-black uppercase tracking-widest group-hover:text-[var(--brand-primary)] transition">J&T Live Portal</span>
                <ArrowRight size={14} className="text-gray-300 group-hover:translate-x-1 transition" />
              </a>
            )}
            <Link href={`/track?id=${order.id}&email=${encodeURIComponent(email)}`} className="block text-center text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[var(--brand-primary)] transition">View Full Logistics Map</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      <h3 className="text-3xl font-[1000] text-[var(--text-heading)] mb-2 tracking-tighter leading-none">Guest Retrieval</h3>
      <p className="text-[var(--text-muted)] text-sm font-bold uppercase tracking-wider mb-8">Access logistics without an identity profile</p>

      <form onSubmit={handleTrack} className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Reference ID</label>
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            <input required placeholder="ord-XXXXXX" value={id} onChange={e => setId(e.target.value)} className="w-full pl-14 pr-6 py-4 bg-[var(--bg-surface)] border-2 border-transparent focus:bg-white focus:border-[var(--brand-primary)] rounded-3xl font-bold transition-all outline-none text-sm text-[var(--text-main)]" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Verification Email</label>
          <div className="relative">
            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            <input required type="email" placeholder="email@used.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-14 pr-6 py-4 bg-[var(--bg-surface)] border-2 border-transparent focus:bg-white focus:border-[var(--brand-primary)] rounded-3xl font-bold transition-all outline-none text-sm text-[var(--text-main)]" />
          </div>
        </div>

        {error && <div className="p-4 bg-red-50 text-red-500 rounded-2xl text-[10px] font-black uppercase text-center tracking-widest">{error}</div>}

        <button disabled={loading} className="btn-premium w-full !py-4 shadow-xl !rounded-[2rem] !font-black uppercase tracking-widest mt-4">
          {loading ? "querying..." : "Access Data Hub"}
        </button>
      </form>
    </div>
  )
}

/* SUB-COMPONENTS */

function ProfileStat({ label, value, icon, color }: any) {
  return (
    <div className="p-8 rounded-[2rem] border border-[var(--border-light)] bg-white shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-500">
      <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center mb-6 shadow-md`}>
        {icon}
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1 opacity-60">{label}</p>
      <p className="text-2xl font-[1000] text-[var(--text-heading)] tracking-tighter">{value}</p>
    </div>
  )
}

function OrderSummaryCard({ order, onClick }: { order: any, onClick: () => void }) {
  const statusColors: any = {
    pending: 'bg-amber-50 text-amber-600',
    paid: 'bg-emerald-50 text-emerald-600',
    shipped: 'bg-blue-50 text-blue-600',
    delivered: 'bg-slate-900 text-white'
  }

  return (
    <div
      onClick={onClick}
      className="p-5 bg-[var(--bg-surface)] rounded-[1.5rem] border border-[var(--border-light)] flex items-center justify-between hover:bg-white hover:shadow-lg hover:border-[var(--brand-primary)] cursor-pointer transition-all duration-300"
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${statusColors[order.status] || 'bg-gray-100 text-gray-400'}`}>
          <Package size={20} />
        </div>
        <div>
          <h4 className="font-black text-sm text-[var(--text-heading)]">Order #{order.id.slice(-6).toUpperCase()}</h4>
          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{new Date(order.createdAt).toLocaleDateString()} • {order.items.length} items</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-black text-sm text-[var(--brand-primary)] mb-1">₱{order.totalAmount.toLocaleString()}</p>
        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${statusColors[order.status] || 'bg-gray-100 text-gray-400'}`}>
          {order.status}
        </span>
      </div>
    </div>
  )
}

function OrderDetailedCard({ order, isSelected, onSelect }: { order: any, isSelected: boolean, onSelect: () => void }) {
  const statusColors: any = {
    pending: 'bg-amber-500',
    paid: 'bg-emerald-500',
    shipped: 'bg-blue-500',
    delivered: 'bg-slate-900'
  }

  return (
    <div className={`rounded-3xl border transition-all duration-500 overflow-hidden ${isSelected ? 'border-[var(--brand-primary)] shadow-2xl scale-[1.01]' : 'border-[var(--border-light)] bg-white shadow-sm'}`}>
      <div onClick={onSelect} className="p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300">
            <Package size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-black text-lg text-[var(--text-heading)]">Order #{order.id.slice(-6).toUpperCase()}</span>
              <span className={`w-2 h-2 rounded-full ${statusColors[order.status] || 'bg-gray-400'} animate-pulse`} />
            </div>
            <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
              <Clock size={12} /> {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} items dispatched
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right hidden md:block">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Logistics Reference</p>
            <p className="font-mono font-bold text-sm text-[var(--text-heading)] bg-gray-50 px-3 py-1 rounded-lg">{order.trackingNo || 'Pending Fulfillment'}</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-[1000] text-[var(--brand-primary)] tabular-nums">₱{order.totalAmount.toLocaleString()}</p>
            <button className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-accent)] flex items-center gap-1 hover:underline ml-auto">
              View Breakdown <ChevronRight size={10} />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-[var(--border-light)] bg-[var(--bg-surface)] p-8"
          >
            <div className="grid md:grid-cols-2 gap-10">
              <div>
                <h5 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                  <Truck size={14} /> Logistics Terminal
                </h5>
                <div className="space-y-4">
                  <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5"><Truck size={40} /></div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tracking Pin (J&T Express)</p>
                    <p className="text-lg font-black text-[var(--brand-primary)] font-mono">{order.trackingNo || 'Manifesting Package...'}</p>
                    {order.trackingNo && (
                      <a
                        href={`https://www.jtexpress.ph/index/query/gzquery.html?bills=${order.trackingNo}`}
                        target="_blank"
                        className="mt-4 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline"
                      >
                        J&T Live Tracking Portal <ArrowRight size={12} />
                      </a>
                    )}
                  </div>

                  <Link href={`/track?id=${order.id}`} className="block text-center p-4 rounded-xl border-2 border-dashed border-gray-200 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-all">
                    Access Deep Logistics Map
                  </Link>
                </div>
              </div>

              <div>
                <h5 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                  <Package size={14} /> Itemized Manifest
                </h5>
                <div className="space-y-3">
                  {order.items.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center text-sm font-bold border-b border-gray-100/50 pb-2">
                      <span className="text-[var(--text-heading)]">{item.productName} <span className="text-gray-300 mx-2">×</span> {item.quantity}</span>
                      <span className="text-[var(--brand-primary)]">₱{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs font-black uppercase text-gray-400">Total Transaction</span>
                    <span className="text-lg font-black text-[var(--text-heading)]">₱{order.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}