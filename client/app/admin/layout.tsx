"use client"

export const dynamic = "force-dynamic"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, BarChart3, Package, ShoppingCart, Users } from "lucide-react"

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

  return (
    <div className="flex min-h-screen bg-[#f5f7fb] text-primary">

      {/* SIDEBAR */}
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
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition
                ${
                  active
                    ? "bg-primary text-white shadow"
                    : "text-gray-500 hover:bg-gray-100 hover:text-primary"
                }`}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            )
          })}

        </nav>

        {/* FOOTER */}
        <div className="p-4 border-t">
          <Link
            href="/"
            className="block text-sm text-gray-500 hover:text-black"
          >
            ← View Store
          </Link>
        </div>

      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">

        {/* TOPBAR */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">

          {/* SEARCH */}
          <div className="w-full max-w-md">
            <input
              placeholder="Search admin..."
              className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#2d4c7c]"
            />
          </div>

          {/* PROFILE */}
          <div className="flex items-center gap-4 ml-6">

            <div className="relative">
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                3
              </span>
              🔔
            </div>

            <div className="flex items-center gap-3">

              <div className="
                w-9 h-9 rounded-full
                bg-gradient-to-br from-primary to-accent
                text-white flex items-center justify-center text-sm font-semibold
              ">
                A
              </div>

              <div className="text-sm">
                <p className="font-medium">Admin</p>
                <p className="text-gray-400 text-xs">Administrator</p>
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