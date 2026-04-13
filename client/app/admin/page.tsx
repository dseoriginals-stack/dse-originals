"use client"

export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import {
  Package,
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  ArrowUpRight,
  Calendar,
  MoreVertical,
  Activity,
  Box
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import Image from "next/image"
import Link from "next/link"
import toast from "react-hot-toast"

type Stats = {
  totalOrders: number
  revenue: number
  totalProducts: number
  totalCustomers: number
  revenueChart: { date: string; amount: number }[]
  topProducts: { id: string; name: string; sold: number; image?: string }[]
  recentOrders: { id: string; total: number; status: string; createdAt: string; user: { name: string } }[]
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || user.role !== "admin") return

    async function load() {
      try {
        setLoading(true)
        const data = await api.get<Stats>("/admin/stats")
        setStats(data)
      } catch (err) {
        console.error("Failed to load admin stats", err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [user])

  const handleExport = () => {
    if (!stats) return

    try {
      const headers = ["Order ID", "Customer", "Total", "Status", "Date"]
      const rows = stats.recentOrders.map(o => [
        o.id,
        o.user?.name || "Guest",
        o.total,
        o.status,
        new Date(o.createdAt).toLocaleDateString()
      ])

      const csvContent = [
        headers.join(","),
        ...rows.map(e => e.join(","))
      ].join("\n")

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `dse_analytics_export_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success("Recent orders exported to CSV")
    } catch (err) {
      toast.error("Failed to export data")
    }
  }

  if (authLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Activity className="animate-spin text-[var(--brand-primary)]" size={48} />
      </div>
    )
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center p-6 text-gray-500">
        Checking authentication...
      </div>
    )
  }

  const isStatsLoading = loading && !stats

  return (
    <div className="space-y-8 min-h-full pb-10 max-w-[1600px] mx-auto">

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-[900] text-[var(--text-heading)] tracking-tight">
            System Overview
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-widest">
              Live Store Analytics · {new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[var(--border-light)] rounded-xl text-xs font-bold text-[var(--text-heading)] hover:bg-gray-50 transition shadow-sm">
            <Calendar size={14} />
            Last 30 Days
          </button>
          <button
            onClick={handleExport}
            disabled={!stats}
            className="btn-premium !py-3 !px-6 text-sm shadow-xl font-bold rounded-xl flex items-center gap-2 disabled:opacity-50"
          >
            <TrendingUp size={16} />
            Export Data
          </button>
        </div>
      </div>

      {/* PRIMARY STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isStatsLoading ? (
          Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard
              title="Gross Revenue"
              value={`₱${Number(stats?.revenue).toLocaleString()}`}
              icon={<DollarSign size={20} />}
              trend="+12.5%"
              positive={true}
            />
            <StatCard
              title="Total Orders"
              value={stats?.totalOrders || 0}
              icon={<ShoppingCart size={20} />}
              trend="+8.2%"
              positive={true}
            />
            <StatCard
              title="Total Customers"
              value={stats?.totalCustomers || 0}
              icon={<Users size={20} />}
              trend="+4.1%"
              positive={true}
            />
            <StatCard
              title="Active Products"
              value={stats?.totalProducts || 0}
              icon={<Package size={20} />}
              trend="Stable"
              positive={null}
            />
          </>
        )}
      </div>

      {/* ANALYTICS CHARTS SECTION */}
      <div className="grid lg:grid-cols-3 gap-8">

        {/* REVENUE CHART */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-[var(--border-light)] p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-extrabold text-[var(--text-heading)]">Revenue Growth</h2>
              <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mt-1">Cash Inflow performance</p>
            </div>
          </div>

          <div className="h-[350px] w-full">
            {isStatsLoading ? (
              <div className="w-full h-full bg-gray-50 rounded-3xl animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.revenueChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                    dy={10}
                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                    tickFormatter={(val) => `₱${val >= 1000 ? val / 1000 + 'k' : val}`}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '12px 16px' }}
                  />
                  <Area type="monotone" dataKey="amount" stroke="var(--brand-primary)" strokeWidth={4} fillOpacity={1} fill="url(#colorAmount)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* TOP SELLING PRODUCTS */}
        <div className="bg-white rounded-[2rem] border border-[var(--border-light)] p-8 shadow-sm">
          <h2 className="text-xl font-extrabold text-[var(--text-heading)] mb-6">Top Sellers</h2>

          <div className="space-y-6">
            {isStatsLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <div className="w-14 h-14 bg-gray-100 rounded-2xl animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-100 rounded-lg w-3/4 animate-pulse" />
                    <div className="h-2 bg-gray-50 rounded-lg w-1/2 animate-pulse" />
                  </div>
                </div>
              ))
            ) : (
              stats?.topProducts?.map((product, i) => (
                <div key={product.id || i} className="flex items-center gap-4 group cursor-pointer">
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0 relative">
                    {product.image ? (
                      <Image src={product.image} alt={product.name} fill className="object-cover group-hover:scale-110 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300"><Box size={24} /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-[var(--text-heading)] line-clamp-1 group-hover:text-[var(--brand-primary)] transition">{product.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[var(--text-muted)] text-[10px] uppercase font-black">{product.sold} Units Sold</span>
                    </div>
                  </div>
                  <div className="text-xs font-black text-[var(--brand-primary)]">#{i + 1}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* RECENT ORDERS TABLE SECTION */}
      <div className="bg-white rounded-[2rem] border border-[var(--border-light)] overflow-hidden shadow-sm">
        <div className="p-8 border-b border-[var(--border-light)] flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-[var(--text-heading)] leading-none">Recent Orders</h2>
          </div>
          <Link href="/admin/orders" className="btn-outline !py-3 !px-6 text-xs !font-black uppercase tracking-widest">
            Manage All
          </Link>
        </div>

        <div className="overflow-x-auto">
          {isStatsLoading ? (
            <div className="p-8 space-y-4">
              {Array(5).fill(0).map((_, i) => <div key={i} className="h-10 bg-gray-50 rounded-xl animate-pulse w-full" />)}
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-[var(--bg-surface)]">
                <tr className="text-left text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">
                  <th className="px-8 py-4">Order ID</th>
                  <th className="px-8 py-4">Customer</th>
                  <th className="px-8 py-4">Value</th>
                  <th className="px-8 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)]">
                {stats?.recentOrders?.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-8 py-6 font-black text-sm text-[var(--brand-primary)]">#{order.id.slice(0, 8).toUpperCase()}</td>
                    <td className="px-8 py-6 font-bold text-[var(--text-heading)] text-sm">{order.user?.name || "Guest"}</td>
                    <td className="px-8 py-6 font-black text-sm text-[var(--text-heading)]">₱{Number(order.total).toLocaleString()}</td>
                    <td className="px-8 py-6">
                      <span className="px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest bg-gray-50 text-gray-500 border border-gray-100 uppercase">{order.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  )
}

function StatCard({ title, value, icon, trend, positive }: any) {
  return (
    <div className="bg-white p-7 rounded-3xl border border-[var(--border-light)] shadow-sm hover:shadow-xl transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-2xl bg-[var(--bg-surface)] flex items-center justify-center text-[var(--brand-primary)] border border-gray-100 group-hover:scale-110 transition">{icon}</div>
        {trend && (
          <div className={`text-[10px] font-black px-2 py-1 rounded-lg ${positive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50'}`}>{trend}</div>
        )}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--text-muted)] mb-1">{title}</p>
        <h3 className="text-3xl font-[1000] text-[var(--text-heading)] tracking-tighter">{value}</h3>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return <div className="bg-white p-7 rounded-3xl border border-gray-100 shadow-sm animate-pulse h-[140px]" />
}