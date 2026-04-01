"use client"

export const dynamic = "force-dynamic"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, BarChart3, Package, ShoppingCart, Users, LogOut } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useEffect } from "react"

const nav = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Users", href: "/admin/users", icon: Users },
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
    <div className="flex min-h-screen bg-[#f6f8fc] text-gray-800">

      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">

        {/* LOGO */}
        <div className="px-6 py-6 text-xl font-semibold tracking-tight">
          DSE Admin
        </div>

        {/* NAV */}
        <nav className="px-3 space-y-1 flex-1">

          {nav.map(item => {
            const active = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all
                  ${active
                    ? "bg-[#2d4c7c] text-white shadow-md"
                    : "text-gray-500 hover:bg-gray-100 hover:text-[#2d4c7c]"
                  }
                `}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            )
          })}

        </nav>

        {/* FOOTER */}
        <div className="p-4 border-t space-y-2">

          <Link
            href="/"
            className="block text-sm text-gray-500 hover:text-black transition"
          >
            ← View Store
          </Link>

          <button
            onClick={async () => {
              await logout()
              router.push("/")
            }}
            className="flex items-center gap-2 text-sm text-red-500 hover:underline"
          >
            <LogOut size={16} />
            Logout
          </button>

        </div>

      </aside>

      {/* ================= MAIN ================= */}
      <div className="flex-1 flex flex-col">

        {/* TOPBAR */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">

          {/* SEARCH */}
          <div className="w-full max-w-md">
            <input
              placeholder="Search (products, orders...)"
              className="
                w-full px-4 py-2 rounded-xl border border-gray-200
                bg-gray-50 focus:outline-none focus:ring-2
                focus:ring-[#2d4c7c] transition
              "
            />
          </div>

          {/* PROFILE */}
          <div className="flex items-center gap-5 ml-6">

            {/* NOTIFICATIONS */}
            <div className="relative cursor-pointer text-xl">
              🔔
              <span className="
                absolute -top-1 -right-1
                bg-red-500 text-white text-[10px]
                w-4 h-4 flex items-center justify-center
                rounded-full
              ">
                0
              </span>
            </div>

            {/* USER */}
            <div className="flex items-center gap-3">

              <div className="
                w-9 h-9 rounded-full
                bg-gradient-to-br from-[#2d4c7c] to-[#4f7db3]
                text-white flex items-center justify-center
                text-sm font-semibold
              ">
                {user?.name?.charAt(0) || "A"}
              </div>

              <div className="text-sm leading-tight">
                <p className="font-medium">
                  {user?.name || "Admin"}
                </p>
                <p className="text-gray-400 text-xs capitalize">
                  {user?.role}
                </p>
              </div>

            </div>

          </div>

        </header>

        {/* CONTENT */}
        <main className="p-6">
          {children}
        </main>

      </div>

    </div>
  )
}