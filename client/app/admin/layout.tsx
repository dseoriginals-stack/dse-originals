"use client"

export const dynamic = "force-dynamic"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, BarChart3, Package, ShoppingCart, CreditCard, Users, LogOut, MessageSquare, BookOpen, Bell, Menu, X, Globe, AlertTriangle, History, Tag, HelpCircle, Star } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useEffect, useState } from "react"
import NotificationPanel from "@/components/admin/NotificationPanel"
import GlobalSearch from "@/components/admin/GlobalSearch"
import RealTimeAdmin from "@/components/admin/RealTimeAdmin"

const nav = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Walk-in Order", href: "/admin/manual-sale", icon: CreditCard },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Payments", href: "/admin/payments", icon: CreditCard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Stories", href: "/admin/stories", icon: BookOpen },
  { name: "Reviews", href: "/admin/reviews", icon: MessageSquare },
  { name: "Review Requests", href: "/admin/review-requests", icon: Star },
  { name: "Q&A", href: "/admin/qa", icon: HelpCircle },
  { name: "Issues", href: "/admin/issues", icon: AlertTriangle },
  { name: "Activity Logs", href: "/admin/activity", icon: History },
  { name: "Vouchers", href: "/admin/vouchers", icon: Tag },
  { name: "Abandoned Carts", href: "/admin/abandoned-carts", icon: ShoppingCart },
]

export default function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading, logout } = useAuth()
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (user) {
      const fetchCount = async () => {
        try {
          const { api } = await import("@/lib/api")
          const res = await api.get<{ notifications: any[], unreadCount: number }>("/admin/notifications")
          setUnreadCount(res?.unreadCount || 0)
        } catch (err) {
          console.error("Count fetch failed", err)
        }
      }
      fetchCount()
    }
  }, [user])

  /* =========================
     FIX: ROLE ACCESS (ADMIN & STAFF)
  ========================= */
  useEffect(() => {
    if (loading) return

    if (!user || (user.role !== "admin" && user.role !== "staff")) {
      router.push("/")
      return
    }

    // Staff path protection — Activity Logs is admin-only
    const allowedStaffPaths = ["/admin", "/admin/products", "/admin/orders", "/admin/payments", "/admin/manual-sale", "/admin/analytics"]
    if (user.role === "staff" && pathname !== "/admin" && !allowedStaffPaths.some(p => pathname.startsWith(p))) {
      router.push("/admin")
    }
  }, [user, loading, router, pathname])

  if (loading || !user || (user.role !== "admin" && user.role !== "staff")) {
    return null
  }

  const isStaff = user.role === 'staff'

  return (
    <div className="flex min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-sans selection:bg-[var(--brand-accent)] selection:text-white relative">
      <RealTimeAdmin />

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-white/70 backdrop-blur-xl border-r border-[var(--border-light)] 
        flex flex-col shadow-[4px_0_24px_rgba(39,76,119,0.03)] z-40 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-auto
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>

        {/* LOGO */}
        <div className="px-6 py-8 flex items-center justify-between lg:justify-start gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[var(--brand-primary)] to-[var(--brand-accent)] shadow-md flex items-center justify-center">
              <span className="text-white font-bold text-sm tracking-widest">{isStaff ? 'S' : 'D'}</span>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-[var(--text-heading)]">
              {isStaff ? 'Staff' : 'Admin'}<span className="text-[var(--brand-primary)]">.</span>
            </span>
          </div>

          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-[var(--text-muted)]">
            <X size={20} />
          </button>
        </div>

        {/* NAV */}
        <nav className="px-4 space-y-1.5 flex-1 mt-2">

          {nav.filter(item => {
            if (isStaff) {
              return ["Dashboard", "Products", "Orders", "Payments", "Walk-in Order", "Analytics"].includes(item.name)
            }
            return true
          }).map(item => {
            const active = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300
                  ${active
                    ? "bg-[var(--brand-primary)] text-white shadow-lg shadow-[var(--brand-primary)]/20"
                    : "text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--brand-primary)]"
                  }
                `}
              >
                <Icon size={18} className={active ? "text-white" : "text-[var(--brand-accent)] opacity-70 group-hover:opacity-100 transition-opacity"} />
                {item.name}
              </Link>
            )
          })}

        </nav>

        {/* FOOTER */}
        <div className="p-5 border-t border-[var(--border-light)] space-y-3 bg-white/50">

          <Link
            href="/"
            className="block text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--brand-primary)] transition"
          >
            ← View Storefront
          </Link>

          <button
            onClick={async () => {
              await logout()
              router.push("/")
            }}
            className="flex items-center gap-2 text-sm font-semibold text-red-500/80 hover:text-red-600 transition"
          >
            <LogOut size={16} />
            Secure Logout
          </button>

        </div>

      </aside>

      {/* ================= MAIN ================= */}
      <div className="flex-1 flex flex-col overflow-hidden relative">

        {/* TOPBAR */}
        <header className="bg-white/70 backdrop-blur-md border-b border-[var(--border-light)] px-4 md:px-10 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm surface-light">

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-[var(--border-light)] text-[var(--text-heading)]"
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:block">
              {/* GLOBAL SEARCH */}
              <GlobalSearch />
            </div>
            
            {/* BACK TO WEBSITE */}
            <Link 
              href="/"
              className="hidden lg:flex items-center gap-2 px-4 py-2.5 bg-[var(--brand-soft)]/20 text-[var(--brand-primary)] rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[var(--brand-primary)] hover:text-white transition-all shadow-sm border border-[var(--brand-soft)]/30"
            >
              <Globe size={14} />
              Website
            </Link>
          </div>

          {/* PROFILE */}
          <div className="flex items-center gap-6 ml-6">

            {/* NOTIFICATIONS */}
            <div className="relative">
              <div 
                onClick={() => {
                  setShowNotifications(!showNotifications)
                  setUnreadCount(0)
                }}
                className="relative cursor-pointer w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--bg-surface)] transition-colors border border-transparent hover:border-[var(--border-light)]"
              >
                <Bell size={20} className="text-[var(--text-main)]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </div>
              {showNotifications && <NotificationPanel onClose={() => setShowNotifications(false)} />}
            </div>

            {/* USER */}
            <div className="flex items-center gap-3">

              <div className="
                w-10 h-10 rounded-full
                bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-accent)]
                text-white flex items-center justify-center
                text-xs font-black shadow-lg ring-2 ring-[var(--brand-soft)]/50
                transition-transform hover:scale-110 cursor-pointer
              ">
                {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || "AD"}
              </div>

              <div className="text-sm leading-tight hidden md:block">
                <p className="font-bold text-[var(--text-heading)]">
                  {user?.name || "Member"}
                </p>
                <p className="text-[var(--brand-accent)] font-semibold text-xs capitalize tracking-wide">
                  {user?.role} Access
                </p>
              </div>

            </div>

          </div>

        </header>

        {/* CONTENT */}
        <main className="p-4 md:p-8 lg:p-10 flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

      </div>

    </div>
  )
}