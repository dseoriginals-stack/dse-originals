"use client"

import { useState, useEffect, Suspense } from "react"
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
  CheckCircle2,
  MapPin,
  Plus,
  Trash2,
  Edit,
  Home,
  Briefcase
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/lib/api"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { regions, provinces, cities } from "philippines"
import toast from "react-hot-toast"
import { useSearchParams } from "next/navigation"

export default function AccountPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AccountContent />
    </Suspense>
  )
}

function AccountContent() {
  const { user, loading, logout, login, updateUser } = useAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedOrder, setSelectedOrder] = useState<any>(null)

  const [addresses, setAddresses] = useState<any[]>([])
  const [loadingAddresses, setLoadingAddresses] = useState(false)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [editingAddress, setEditingAddress] = useState<any>(null)
  const [profileForm, setProfileForm] = useState({ name: "", phone: "" })
  const [savingProfile, setSavingProfile] = useState(false)
  const searchParams = useSearchParams()
  const [oauthError, setOauthError] = useState<string | null>(null)

  useEffect(() => {
    const error = searchParams.get("error")
    if (error === "no_account") {
      setOauthError("Account access denied. Please use the Google login button.")
    } else if (error === "oauth_failed") {
      setOauthError("Social authentication failed. Please try again.")
    }
  }, [searchParams])

  useEffect(() => {
    if (user) {
      fetchOrders()
      fetchAddresses()
      setProfileForm({ name: user.name || "", phone: user.phone || "" })
    }
  }, [user])

  async function fetchAddresses() {
    try {
      setLoadingAddresses(true)
      const data = await api.get("/user/me/addresses")
      setAddresses(data || [])
    } catch (err) {
      console.error("Failed to load addresses")
    } finally {
      setLoadingAddresses(false)
    }
  }

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

  async function updateProfile() {
    try {
      setSavingProfile(true)
      const updated = await api.patch("/user/me", profileForm)
      updateUser(updated)
      toast.success("Profile updated successfully")
    } catch (err) {
      toast.error("Failed to update profile")
    } finally {
      setSavingProfile(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!user) {
    return <GuestPortal login={login} oauthError={oauthError} />
  }

  const totalSpent = orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0)
  const luckyPoints = user.luckyPoints || 0
  const lifetimePoints = user.lifetimePoints || 0
  const userTier = user.tier || "Faith"

  return (
    <div className="min-h-screen bg-[var(--bg-main)] pb-24">
      {/* HEADER SECTION */}
      <div className="bg-white border-b border-[var(--border-light)] pt-8 md:pt-12 pb-10 md:pb-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-[var(--brand-soft)]/5 skew-x-12 translate-x-32" />
        <div className="container max-w-7xl mx-auto px-4 md:px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-4 md:gap-6 text-center sm:text-left">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-[var(--brand-primary)] rounded-3xl md:rounded-[2rem] flex items-center justify-center text-white text-2xl md:text-3xl font-black shadow-xl md:shadow-2xl shadow-[var(--brand-primary)]/20 shrink-0">
                {user.name?.[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-[var(--brand-primary)] opacity-60">DSEoriginals Elite</span>
                  <ShieldCheck size={14} className="text-[var(--brand-primary)]" />
                </div>
                <h1 className="text-3xl md:text-4xl font-[1000] text-[var(--text-heading)] tracking-tighter leading-tight md:leading-none truncate max-w-[280px] sm:max-w-none">
                  Hello, {user.name?.split(' ')[0]}
                </h1>
                <p className="text-[var(--text-muted)] text-sm font-bold mt-1 md:mt-2 flex items-center justify-center sm:justify-start gap-2">
                  <Mail size={14} className="shrink-0" /> <span className="truncate">{user.email}</span>
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white border-2 border-slate-100 text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-400 hover:text-red-500 hover:border-red-50 transition-all shadow-sm w-full md:w-auto mt-4 md:mt-0"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* SIDEBAR NAVIGATION */}
          <div className="lg:col-span-1 flex flex-row lg:flex-col overflow-x-auto pb-4 lg:pb-0 custom-scrollbar gap-2 sticky top-[72px] lg:top-24 z-20 bg-[var(--bg-main)]/80 backdrop-blur-md lg:bg-transparent -mx-4 px-4 sm:mx-0 sm:px-0">
            {[
              { id: 'overview', label: 'Dashboard', icon: <TrendingUp size={16} /> },
              { id: 'orders', label: 'My Orders', icon: <Package size={16} /> },
              { id: 'settings', label: 'Settings', icon: <Settings size={16} /> }
            ].map((tab: any) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] md:text-xs font-[1000] uppercase tracking-widest transition-all whitespace-nowrap active:scale-95 ${activeTab === tab.id
                  ? 'bg-[var(--brand-primary)] text-white shadow-lg'
                  : 'bg-white/50 text-gray-400 hover:text-[var(--brand-primary)]'
                  }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* CONTENT VIEWS */}
          <div className="lg:col-span-3 bg-white rounded-3xl md:rounded-[2.5rem] border border-[var(--border-light)] shadow-sm p-6 sm:p-10 md:p-12 min-h-[500px]">
            {activeTab === 'overview' && (
              <div className="animate-fade-in space-y-12">
                <div className="grid md:grid-cols-3 gap-6">
                  <ProfileStat label="Total Expenditures" value={`₱${totalSpent.toLocaleString()}`} icon={<CreditCard size={20} />} color="bg-blue-50 text-blue-500" />
                  <ProfileStat label="Reward Points" value={luckyPoints.toLocaleString()} icon={<Star size={20} />} color="bg-amber-50 text-amber-500" />
                  <ProfileStat label="Loyalty Tier" value={userTier} icon={<Heart size={20} />} color={userTier === "Love" ? "bg-rose-50 text-rose-500" : userTier === "Hope" ? "bg-amber-50 text-amber-500" : "bg-blue-50 text-blue-500"} />
                </div>

                {/* LOYALTY PROGRESSION CARD */}
                <div className="bg-[var(--bg-surface)] rounded-3xl md:rounded-[2.5rem] border border-[var(--border-light)] p-6 md:p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 md:p-12 opacity-[0.03] scale-[2] md:scale-[3] pointer-events-none">
                    {userTier === "Love" ? <Heart size={64} fill="currentColor" /> : <Star size={64} fill="currentColor" />}
                  </div>
                  <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                      <div>
                        <h3 className="text-lg md:text-xl font-black text-[var(--text-heading)] flex items-center gap-2">
                          Loyalty Rank: <span className={userTier === "Love" ? "text-rose-500" : userTier === "Hope" ? "text-amber-500" : "text-blue-500"}>{userTier}</span>
                        </h3>
                        <p className="text-[10px] font-bold text-[var(--text-muted)] mt-1 uppercase tracking-widest leading-relaxed">
                          Lifetime Accumulation: {lifetimePoints.toLocaleString()} Points
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {["Faith", "Hope", "Love"].map((t) => (
                          <div key={t} className={`px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest border-2 transition-all ${userTier === t
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
              <div className="animate-fade-in space-y-12">
                <div className="max-w-xl">
                  <h3 className="text-2xl font-[1000] text-[var(--text-heading)] mb-2 tracking-tighter">Account Integrity</h3>
                  <p className="text-[var(--text-muted)] text-sm font-bold mb-10 uppercase tracking-wider">Maintain your profile credentials</p>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-[1000] uppercase tracking-widest text-gray-400 ml-1">Full Identity</label>
                      <input
                        value={profileForm.name}
                        onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                        placeholder="Your full name"
                        className="w-full px-6 py-4 bg-[var(--bg-surface)] border-2 border-transparent focus:border-[var(--brand-primary)] rounded-2xl font-bold outline-none transition-all text-[var(--text-heading)]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-[1000] uppercase tracking-widest text-gray-400 ml-1">Phone Connection</label>
                      <input
                        value={profileForm.phone}
                        onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                        placeholder="e.g. 0912 345 6789"
                        className="w-full px-6 py-4 bg-[var(--bg-surface)] border-2 border-transparent focus:border-[var(--brand-primary)] rounded-2xl font-bold outline-none transition-all text-[var(--text-heading)]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-[1000] uppercase tracking-widest text-gray-400 ml-1">Verified Email</label>
                      <input value={user.email} disabled className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl font-bold text-gray-400 cursor-not-allowed text-[var(--text-heading)]/50" />
                    </div>

                    <button
                      onClick={updateProfile}
                      disabled={savingProfile}
                      className="btn-premium !py-4 !px-10 shadow-lg flex items-center gap-3 disabled:opacity-50"
                    >
                      {savingProfile ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                      {savingProfile ? "Saving..." : "Save Profile Changes"}
                    </button>
                  </div>
                </div>

                <div className="pt-8 border-t border-[var(--border-light)]">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-2xl font-[1000] text-[var(--text-heading)] mb-1 tracking-tighter">Address Book</h3>
                      <p className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-wider">Saved locations for faster checkout</p>
                    </div>
                    <button
                      onClick={() => { setEditingAddress(null); setShowAddressModal(true); }}
                      className="flex items-center gap-2 px-6 py-3 bg-[var(--brand-primary)] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:shadow-lg transition-all"
                    >
                      <Plus size={14} /> Add New
                    </button>
                  </div>

                  {loadingAddresses ? (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {Array(2).fill(0).map((_, i) => <div key={i} className="h-40 bg-gray-50 rounded-3xl animate-pulse" />)}
                    </div>
                  ) : addresses.length === 0 ? (
                    <div className="p-12 bg-[var(--bg-surface)] rounded-[2.5rem] text-center border-2 border-dashed border-gray-100">
                      <MapPin size={40} className="mx-auto text-gray-200 mb-4" />
                      <p className="text-gray-400 font-bold italic text-sm">No saved addresses found.</p>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {addresses.map((addr) => (
                        <div key={addr.id} className={`group p-6 rounded-[2rem] border-2 transition-all relative ${addr.isDefault ? 'border-[var(--brand-primary)] bg-[var(--brand-soft)]/5' : 'border-gray-50 bg-white hover:border-gray-200'}`}>
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`p-2.5 rounded-xl ${addr.isDefault ? 'bg-[var(--brand-primary)] text-white' : 'bg-gray-100 text-gray-400'}`}>
                                {addr.label?.toLowerCase() === 'work' ? <Briefcase size={16} /> : <Home size={16} />}
                              </div>
                              <div>
                                <h4 className="font-black text-[var(--text-heading)] text-sm">{addr.label || 'Home'}</h4>
                                {addr.isDefault && <span className="text-[8px] font-black uppercase tracking-tighter text-[var(--brand-primary)] bg-white px-1.5 py-0.5 rounded-full border border-[var(--brand-primary)]/20">Default</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => { setEditingAddress(addr); setShowAddressModal(true); }}
                                className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-[var(--brand-primary)] transition"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={async () => {
                                  if (confirm("Delete this address?")) {
                                    await api.delete(`/user/me/addresses/${addr.id}`)
                                    fetchAddresses()
                                    toast.success("Address removed")
                                  }
                                }}
                                className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-red-500 transition"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <p className="text-xs font-bold text-[var(--text-heading)]">{addr.fullName}</p>
                            <p className="text-[10px] font-bold text-[var(--text-muted)]">{addr.phone}</p>
                            <p className="text-[10px] font-medium text-[var(--text-muted)] line-clamp-2 mt-2 leading-relaxed">
                              {addr.street}, {addr.barangay}, {addr.city}, {addr.province}, {addr.region}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <AnimatePresence>
                  {showAddressModal && (
                    <AddressModal
                      isOpen={showAddressModal}
                      onClose={() => setShowAddressModal(false)}
                      onSuccess={() => { setShowAddressModal(false); fetchAddresses(); }}
                      initialData={editingAddress}
                    />
                  )}
                </AnimatePresence>
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

function GuestPortal({ login, oauthError }: any) {
  const [tab, setTab] = useState<"login" | "track">("login")

  useEffect(() => {
    if (oauthError) {
      setTab('login')
    }
  }, [oauthError])

  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center p-0 sm:p-4 md:p-6 py-0 md:py-20">
      <div className="w-full max-w-5xl grid md:grid-cols-12 bg-white rounded-none sm:rounded-3xl md:rounded-[3.5rem] shadow-2xl overflow-hidden border-0 sm:border border-[var(--border-light)] relative min-h-screen sm:min-h-0">

        {/* LEFT DECORATIVE PANEL */}
        <div className="hidden lg:flex md:col-span-5 bg-[#274C77] p-12 text-white flex-col justify-between relative overflow-hidden">
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
        <div className="col-span-12 lg:col-span-7 flex flex-col p-6 sm:p-10 md:p-16 justify-center">
          <div className="flex bg-[var(--bg-surface)] p-1.5 md:p-2 rounded-2xl mb-8 md:mb-12 gap-1 overflow-x-auto scrollbar-hide shrink-0">
            {[
              { id: "login", label: "Sign In", icon: <Lock size={14} /> },
              { id: "track", label: "Track", icon: <Truck size={14} /> }
            ].map((t: any) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center justify-center gap-2 px-4 md:px-10 py-2.5 md:py-3 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex-1 ${tab === t.id ? 'bg-white text-[var(--brand-primary)] shadow-md translate-y-[-1px]' : 'text-slate-500 hover:bg-white/50 hover:text-[var(--brand-primary)]'
                  }`}
              >
                {t.icon} <span className="inline">{t.label}</span>
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
              {tab === 'login' && <AccountLoginForm login={login} oauthError={oauthError} />}
              {tab === 'track' && <AccountGuestTrack />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

/* LOGIN FORM */
function AccountLoginForm({ login, oauthError }: any) {
  const [form, setForm] = useState({ email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(oauthError || null)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await login(form.email, form.password)
      if (res.success) {
        window.location.href = "/"
      } else {
        setError(res.message)
      }
    } catch {
      setError("Network or server error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col pt-4 md:pt-0">
      <h3 className="text-2xl md:text-3xl font-[1000] text-[var(--text-heading)] mb-2 tracking-tighter leading-none">Access DSE Originals</h3>
      <p className="text-[var(--text-muted)] text-[10px] md:text-sm font-bold uppercase tracking-wider mb-6 md:mb-10">Continue with social or login below</p>
      {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold mb-6 flex items-center gap-2 border border-red-100 animate-shake">
        <AlertCircle size={16} /> {error}
      </div>}

      <div className="mb-6">
        <button
          onClick={() => {
            window.location.href = `${process.env.NEXT_PUBLIC_API_URL || "https://dse-originals.onrender.com"}/api/auth/google`
          }}
          className="w-full flex items-center justify-center gap-3 px-4 py-4 md:py-5 rounded-3xl bg-[var(--brand-primary)] hover:bg-[#1B3B60] text-white shadow-xl shadow-[#274C77]/20 transition-all font-[900] text-sm md:text-base uppercase tracking-widest group"
        >
          <div className="bg-white p-2 rounded-xl group-hover:scale-110 transition-transform">
            <Image src="/google-icon.svg" alt="Google" width={20} height={20} />
          </div>
          Continue with Google
        </button>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--border-light)]"></div>
        </div>
        <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em]">
          <span className="bg-white px-6 text-slate-300">Staff & Partner Access</span>
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
          {loading ? <Loader2 className="animate-spin" size={18} /> : <>Login <ArrowRight size={18} /></>}
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
      className="p-4 md:p-5 bg-[var(--bg-surface)] rounded-[1.5rem] border border-[var(--border-light)] flex items-center justify-between hover:bg-white hover:shadow-lg hover:border-[var(--brand-primary)] cursor-pointer transition-all duration-300 gap-4"
    >
      <div className="flex items-center gap-3 md:gap-4 min-w-0">
        <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center shrink-0 ${statusColors[order.status] || 'bg-gray-100 text-gray-400'}`}>
          <Package className="w-[18px] h-[18px] md:w-5 md:h-5" />
        </div>
        <div className="min-w-0">
          <h4 className="font-black text-xs md:text-sm text-[var(--text-heading)] truncate">Order #{order.id.slice(-6).toUpperCase()}</h4>
          <p className="text-[9px] md:text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider truncate">
            {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} items
          </p>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="font-black text-xs md:text-sm text-[var(--brand-primary)] mb-1">₱{order.totalAmount.toLocaleString()}</p>
        <span className={`text-[7px] md:text-[8px] font-black uppercase tracking-widest px-1.5 md:px-2 py-0.5 md:py-1 rounded-md ${statusColors[order.status] || 'bg-gray-100 text-gray-400'}`}>
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
          <div className="w-12 h-12 md:w-14 md:h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 shrink-0">
            <Package className="w-6 h-6 md:w-7 md:h-7" />
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
        <div className="flex items-center justify-between md:justify-end gap-6 mt-2 md:mt-0">
          <div className="text-left md:text-right hidden sm:block">
            <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Logistics Reference</p>
            <p className="font-mono font-bold text-xs md:text-sm text-[var(--text-heading)] bg-gray-50 px-3 py-1 rounded-lg">{order.trackingNo || 'Pending Fulfillment'}</p>
          </div>
          <div className="text-right ml-auto md:ml-0">
            <p className="text-lg md:text-xl font-[1000] text-[var(--brand-primary)] tabular-nums leading-tight">₱{order.totalAmount.toLocaleString()}</p>
            <button className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[var(--brand-accent)] flex items-center gap-1 hover:underline ml-auto">
              Details <ChevronRight size={10} />
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
            className="border-t border-[var(--border-light)] bg-[var(--bg-surface)] p-6 md:p-8"
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
                    <span className="text-[10px] md:text-xs font-black uppercase text-gray-400">Total Transaction</span>
                    <span className="text-base md:text-lg font-black text-[var(--text-heading)]">₱{order.totalAmount.toLocaleString()}</span>
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

/* ============================
ADDRESS MODAL
============================ */

function AddressModal({ isOpen, onClose, onSuccess, initialData }: any) {
  const [form, setForm] = useState({
    label: initialData?.label || "Home",
    fullName: initialData?.fullName || "",
    phone: initialData?.phone || "",
    street: initialData?.street || "",
    barangay: initialData?.barangay || "",
    city: initialData?.city || "",
    province: initialData?.province || "",
    region: initialData?.region || "",
    isDefault: initialData?.isDefault || false
  })

  const [selectedRegion, setSelectedRegion] = useState("")
  const [selectedProvince, setSelectedProvince] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (initialData) {
      // Find keys for phil library
      const r = (regions as any[]).find((x: any) => x.name === initialData.region)
      if (r) setSelectedRegion(r.key)
      const p = (provinces as any[]).find((x: any) => x.name === initialData.province)
      if (p) setSelectedProvince(p.key)
    }
  }, [initialData])

  const filteredProvinces = (provinces as any[]).filter((p: any) => String(p.region) === String(selectedRegion))
  const filteredCities = (cities as any[]).filter((c: any) => String(c.province) === String(selectedProvince))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (initialData) {
        await api.patch(`/user/me/addresses/${initialData.id}`, form)
        toast.success("Address updated")
      } else {
        await api.post("/user/me/addresses", form)
        toast.success("Address added")
      }
      onSuccess()
    } catch {
      toast.error("Failed to save address")
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-8 md:p-10 overflow-y-auto custom-scrollbar flex-1">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-2xl font-[1000] text-[var(--text-heading)] mb-1 tracking-tighter">{initialData ? 'Update Location' : 'New Identity Point'}</h3>
              <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest">Configure shipping destination</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2 mb-6">
              {['Home', 'Work'].map(l => (
                <button
                  key={l} type="button"
                  onClick={() => setForm({ ...form, label: l })}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${form.label === l ? 'bg-[var(--brand-primary)] border-[var(--brand-primary)] text-white shadow-lg' : 'bg-white border-gray-100 text-gray-400'}`}
                >
                  {l === 'Work' ? <Briefcase size={12} className="inline mr-2" /> : <Home size={12} className="inline mr-2" />}
                  {l}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Full Name</label>
                <input required value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} className="w-full px-6 py-3.5 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-[var(--brand-primary)] rounded-2xl font-bold outline-none transition-all text-[var(--text-heading)]" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Phone Number</label>
                <input required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-6 py-3.5 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-[var(--brand-primary)] rounded-2xl font-bold outline-none transition-all text-[var(--text-heading)]" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Street Address</label>
              <input required value={form.street} onChange={e => setForm({ ...form, street: e.target.value })} className="w-full px-6 py-3.5 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-[var(--brand-primary)] rounded-2xl font-bold outline-none transition-all text-[var(--text-heading)]" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <select
                required
                value={selectedRegion}
                onChange={e => {
                  const key = e.target.value
                  setSelectedRegion(key)
                  setForm({ ...form, region: (regions as any[]).find((x: any) => x.key === key)?.name || "", province: "", city: "" })
                }}
                className="w-full px-6 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl font-bold outline-none text-[var(--text-heading)]"
              >
                <option value="">Region</option>
                {(regions as any[]).map((r: any) => <option key={r.key} value={r.key}>{r.name}</option>)}
              </select>

              <select
                required
                disabled={!selectedRegion}
                value={selectedProvince}
                onChange={e => {
                  const key = e.target.value
                  setSelectedProvince(key)
                  setForm({ ...form, province: (provinces as any[]).find((x: any) => x.key === key)?.name || "", city: "" })
                }}
                className="w-full px-6 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl font-bold outline-none disabled:opacity-50 text-[var(--text-heading)]"
              >
                <option value="">Province</option>
                {filteredProvinces.map((p: any) => <option key={p.key} value={p.key}>{p.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <select
                required
                disabled={!selectedProvince}
                value={form.city}
                onChange={e => setForm({ ...form, city: e.target.value })}
                className="w-full px-6 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl font-bold outline-none disabled:opacity-50 text-[var(--text-heading)]"
              >
                <option value="">City</option>
                {filteredCities.map((c: any) => <option key={c.key} value={c.name}>{c.name}</option>)}
              </select>

              <input placeholder="Barangay" required value={form.barangay} onChange={e => setForm({ ...form, barangay: e.target.value })} className="w-full px-6 py-3.5 bg-gray-50 border-2 border-transparent focus:border-[var(--brand-primary)] rounded-2xl font-bold outline-none text-[var(--text-heading)]" />
            </div>

            <button
              type="button"
              onClick={() => setForm({ ...form, isDefault: !form.isDefault })}
              className="flex items-center gap-3 py-2 group"
            >
              <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${form.isDefault ? 'bg-[var(--brand-primary)] border-[var(--brand-primary)]' : 'border-gray-200'}`}>
                {form.isDefault && <CheckCircle2 size={12} className="text-white" />}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-[var(--brand-primary)] transition">Set as default location</span>
            </button>

            <div className="flex gap-4 pt-6">
              <button type="button" onClick={onClose} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[var(--text-heading)] transition">Cancel</button>
              <button disabled={loading} className="flex-[2] btn-premium !py-4 !rounded-2xl shadow-xl shadow-[var(--brand-primary)]/20 uppercase tracking-widest font-black">
                {loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : (initialData ? 'Update Destination' : 'Activate Location')}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  )
}