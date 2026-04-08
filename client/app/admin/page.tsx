"use client"

export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import { Package, DollarSign, ShoppingCart, Users } from "lucide-react"

type Stats = {
  totalOrders: number
  revenue: number
  totalProducts: number
  totalCustomers?: number
}

export default function AdminDashboard() {
  const { user, loading } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    if (!user || user.role !== "admin") return

    async function load() {
      try {
        const data = await api.get<Stats>("/admin/stats")
        setStats(data)
      } catch (err) {
        console.error("Failed to load admin stats", err)
      }
    }

    load()
  }, [user])

  if (loading) {
    return <p className="text-gray-500">Checking authentication...</p>
  }

  if (!user) {
    return <p className="text-gray-500">Not authenticated</p>
  }

  if (user.role !== "admin") {
    return <p className="text-gray-500">Access denied</p>
  }

  if (!stats) {
    return <p className="text-gray-500">Loading dashboard...</p>
  }

  return (
    <div className="space-y-8 min-h-full pb-10">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--border-light)] pb-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-[var(--text-heading)] tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-[var(--brand-accent)] font-semibold mt-2 tracking-wide uppercase text-xs">
            Welcome back, Administrator {user.name.split(" ")[0]}
          </p>
        </div>
        <button className="btn-premium !py-3 !px-6 text-sm shadow-md md:self-end">
          Generate Full Report
        </button>
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-4 gap-6">

        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={<ShoppingCart size={18} />}
        />

        <StatCard
          title="Revenue"
          value={`₱${Number(stats.revenue).toLocaleString()}`}
          icon={<DollarSign size={18} />}
        />

        <StatCard
          title="Products"
          value={stats.totalProducts}
          icon={<Package size={18} />}
        />

        <StatCard
          title="Customers"
          value={stats.totalCustomers || 0}
          icon={<Users size={18} />}
        />

      </div>

      {/* MAIN GRID */}
      <div className="grid lg:grid-cols-3 gap-6 md:gap-8">

        {/* RECENT ORDERS */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-md rounded-3xl border border-[var(--border-light)] p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-xl text-[var(--text-heading)]">Recent Activity</h2>
            <button className="text-xs font-bold uppercase tracking-widest text-[var(--brand-primary)] hover:text-[var(--brand-accent)] transition">
              View All
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] border-b border-[var(--border-light)] pb-3">
              <span>Order ID</span>
              <span>Status</span>
            </div>

            {/* STATIC FOR NOW — CONNECT NEXT */}
            <div className="flex justify-between items-center bg-[var(--bg-surface)] p-3 rounded-xl border border-[var(--border-light)]">
              <span className="font-semibold text-sm">#DSE-1234</span>
              <span className="text-xs font-bold text-yellow-600 bg-yellow-100/50 border border-yellow-200 px-3 py-1 rounded-full uppercase tracking-wider shadow-inner">Processing</span>
            </div>

            <div className="flex justify-between items-center bg-[var(--bg-surface)] p-3 rounded-xl border border-[var(--border-light)]">
              <span className="font-semibold text-sm">#DSE-1233</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-100/50 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider shadow-inner">Completed</span>
            </div>

          </div>
        </div>

        {/* SIDE PANEL */}
        <div className="space-y-6 md:space-y-8">

          {/* QUICK ACTIONS */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-[var(--border-light)] p-8 shadow-sm">
            <h3 className="font-bold text-xl text-[var(--text-heading)] mb-6">Quick Actions</h3>

            <div className="space-y-3">
              <button className="w-full text-left p-4 rounded-xl border border-[var(--border-light)] bg-transparent hover:bg-[var(--brand-soft)]/20 hover:border-[var(--brand-primary)] transition-all font-semibold text-sm flex items-center justify-between group">
                Add New Product
                <span className="text-[var(--brand-primary)] opacity-50 group-hover:opacity-100 transition-opacity">→</span>
              </button>
              <button className="w-full text-left p-4 rounded-xl border border-[var(--border-light)] bg-transparent hover:bg-[var(--brand-soft)]/20 hover:border-[var(--brand-primary)] transition-all font-semibold text-sm flex items-center justify-between group">
                Review Active Orders
                <span className="text-[var(--brand-primary)] opacity-50 group-hover:opacity-100 transition-opacity">→</span>
              </button>
              <button className="w-full text-left p-4 rounded-xl border border-[var(--border-light)] bg-transparent hover:bg-[var(--brand-soft)]/20 hover:border-[var(--brand-primary)] transition-all font-semibold text-sm flex items-center justify-between group">
                Customer Management
                <span className="text-[var(--brand-primary)] opacity-50 group-hover:opacity-100 transition-opacity">→</span>
              </button>
            </div>
          </div>

          {/* MINI STATS */}
          <div className="bg-gradient-to-tr from-[var(--brand-primary)] to-[var(--brand-accent)] rounded-3xl text-white p-8 shadow-lg relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-x-10 -translate-y-10"></div>
            <h3 className="font-bold text-xl mb-2 relative z-10">Performance Goal</h3>
            <p className="text-white/80 text-sm font-medium relative z-10 leading-relaxed">
              Revenue is growing 15% faster this month. You're on track to hit the quarterly target! 🚀
            </p>
          </div>

        </div>

      </div>

    </div>
  )
}

/* STAT CARD */

function StatCard({ title, value, icon }: any) {
  return (
    <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-[var(--border-light)] shadow-sm hover:shadow-lg transition-all duration-300 group">

      <div className="flex justify-between items-center mb-4">
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">{title}</p>
        <div className="w-10 h-10 rounded-2xl bg-[var(--bg-surface)] flex items-center justify-center text-[var(--brand-primary)] border border-gray-100 shadow-inner group-hover:scale-110 transition-transform">{icon}</div>
      </div>

      <h3 className="text-3xl font-black text-[var(--brand-primary)] drop-shadow-sm">
        {value}
      </h3>

    </div>
  )
}