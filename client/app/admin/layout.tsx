"use client"

export const dynamic = "force-dynamic"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, BarChart3, Package, ShoppingCart, Users, LogOut, MessageSquare } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useEffect } from "react"

const nav = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Reviews", href: "/admin/reviews", icon: MessageSquare },
]

export default function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading, logout } = useAuth()

  /* =========================
     FIX: SAFE REDIRECT (NO HYDRATION BUG)
  ========================= */
  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/")
    }
  }, [user, loading, router])

  if (loading || !user || user.role !== "admin") {
    return null
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-sans selection:bg-[var(--brand-accent)] selection:text-white">

      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 bg-white/70 backdrop-blur-xl border-r border-[var(--border-light)] flex flex-col shadow-[4px_0_24px_rgba(39,76,119,0.03)] z-20">

        {/* LOGO */}
        <div className="px-6 py-8 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[var(--brand-primary)] to-[var(--brand-accent)] shadow-md flex items-center justify-center">
            <span className="text-white font-bold text-sm tracking-widest">D</span>
          </div>
          <span className="text-xl font-extrabold tracking-tight text-[var(--text-heading)]">
            Admin<span className="text-[var(--brand-primary)]">.</span>
          </span>
        </div>

        {/* NAV */}
        <nav className="px-4 space-y-1.5 flex-1 mt-2">

          {nav.map(item => {
            const active = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
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
        <header className="bg-white/70 backdrop-blur-md border-b border-[var(--border-light)] px-10 py-5 flex items-center justify-between sticky top-0 z-10 shadow-sm">

          {/* SEARCH */}
          <div className="w-full max-w-md relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--brand-primary)] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
            <input
              placeholder="Search administration..."
              className="
                w-full pl-11 pr-4 py-3 rounded-2xl border border-[var(--border-light)]
                bg-[var(--bg-surface)] focus:bg-white focus:outline-none focus:ring-2
                focus:ring-[var(--brand-accent)]/30 focus:border-[var(--brand-primary)] 
                transition-all duration-300 placeholder:text-gray-400 text-sm font-medium
                shadow-inner drop-shadow-sm
              "
            />
          </div>

          {/* PROFILE */}
          <div className="flex items-center gap-6 ml-6">

            {/* NOTIFICATIONS */}
            <div className="relative cursor-pointer w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--bg-surface)] transition-colors border border-transparent hover:border-[var(--border-light)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-main)]"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              <span className="
                absolute top-1 right-2
                bg-[var(--brand-primary)] text-white text-[9px] font-bold
                w-3.5 h-3.5 flex items-center justify-center
                rounded-full shadow-sm ring-2 ring-white
              ">
                3
              </span>
            </div>

            {/* USER */}
            <div className="flex items-center gap-3">

              <div className="
                w-10 h-10 rounded-full
                bg-gradient-to-tr from-[var(--brand-primary)] to-[var(--brand-secondary)]
                text-white flex items-center justify-center
                text-sm font-bold shadow-md ring-2 ring-[var(--brand-soft)]/30
              ">
                {user?.name?.charAt(0) || "A"}
              </div>

              <div className="text-sm leading-tight hidden md:block">
                <p className="font-bold text-[var(--text-heading)]">
                  {user?.name || "Adminstrator"}
                </p>
                <p className="text-[var(--brand-accent)] font-semibold text-xs capitalize tracking-wide">
                  {user?.role} Access
                </p>
              </div>

            </div>

          </div>

        </header>

        {/* CONTENT */}
        <main className="p-8 lg:p-10 flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

      </div>

    </div>
  )
}