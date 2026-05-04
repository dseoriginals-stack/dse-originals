"use client"

export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import {
  Package,
  PhilippinePeso,
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
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  ResponsiveContainer
} from 'recharts'
import Image from "next/image"
import Link from "next/link"
import toast from "react-hot-toast"
import { AlertCircle, ChevronRight, GraduationCap } from "lucide-react"

type Stats = {
  totalOrders: number
  revenue: number
  totalProducts: number
  totalCustomers: number
  revenueChart: { date: string; amount: number }[]
  topProducts: { id: string; name: string; sold: number; image?: string }[]
  recentOrders: { id: string; total: number; status: string; createdAt: string; user: { name: string } }[]
  categoryBreakdown: { name: string; value: number }[]
  inventoryAlerts: { id: string; sku: string; name: string; stock: number }[]
  customerTiers: { name: string; count: number }[]
}

const CATEGORY_COLORS = ['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4']
const TIER_COLORS: Record<string, string> = {
  Faith: '#94a3b8',
  Devoted: '#6366f1',
  Disciple: '#f59e0b',
  Prophet: '#f43f5e',
  Saint: '#10b981'
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || (user.role !== "admin" && user.role !== "staff")) return

    async function load() {
      try {
        setLoading(true)
        const data = await api.get<Stats>(`/admin/stats?cb=${Date.now()}`)
        setStats(data)
      } catch (err) {
        console.error("Failed to load dashboard stats", err)
      } finally {
        setLoading(false)
      }
    }

    load()
    const syncInterval = setInterval(load, 60000)
    return () => clearInterval(syncInterval)
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

  if (!user || (user.role !== "admin" && user.role !== "staff")) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center p-6 text-gray-500">
        Checking authentication...
      </div>
    )
  }

  const isStaff = user.role === 'staff'
  const isStatsLoading = loading && !stats

  return (
    <div className="space-y-8 min-h-full pb-10 max-w-[1600px] mx-auto">

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-[900] text-[var(--text-heading)] tracking-tight">
            {isStaff ? 'Staff Portal' : 'System Overview'}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <div className={`w-2 h-2 rounded-full ${isStaff ? 'bg-blue-500' : 'bg-emerald-500'} animate-pulse`} />
            <span className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-widest">
              {isStaff ? 'Operations Management' : 'Live Store Analytics'} · {new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[var(--border-light)] rounded-xl text-xs font-bold text-[var(--text-heading)] hover:bg-gray-50 transition shadow-sm">
            <Calendar size={14} />
            Today
          </button>
          {!isStaff && (
            <button
              onClick={handleExport}
              disabled={!stats}
              className="btn-premium !py-3 !px-6 text-sm shadow-xl font-bold rounded-xl flex items-center gap-2 disabled:opacity-50"
            >
              <TrendingUp size={16} />
              Export Data
            </button>
          )}
        </div>
      </div>

      {/* PRIMARY STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isStatsLoading ? (
          Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard
              title={isStaff ? "Active Sessions" : "Gross Revenue"}
              value={isStaff ? stats?.totalCustomers : `₱${(Number(stats?.revenue) || 0).toLocaleString()}`}
              icon={isStaff ? <Activity size={20} /> : <PhilippinePeso size={20} />}
              trend={isStaff ? "Live" : "+12.5%"}
              positive={isStaff ? null : true}
            />
            <StatCard
              title={isStaff ? "Pending Fulfillment" : "Total Orders"}
              value={stats?.totalOrders || 0}
              icon={<ShoppingCart size={20} />}
              trend="+8.2%"
              positive={true}
            />
            <StatCard
              title={isStaff ? "Customer Base" : "Total Customers"}
              value={stats?.totalCustomers || 0}
              icon={<Users size={20} />}
              trend="+4.1%"
              positive={true}
            />
            <StatCard
              title={isStaff ? "Stock Variety" : "Active Products"}
              value={stats?.totalProducts || 0}
              icon={<Package size={20} />}
              trend="Stable"
              positive={null}
            />
          </>
        )}
      </div>

      {/* ANALYTICS CHARTS SECTION */}
      <div className={`grid ${isStaff ? 'grid-cols-1' : 'lg:grid-cols-3'} gap-8`}>

        {/* REVENUE CHART */}
        {!isStaff && (
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
        )}

        {/* TOP SELLING PRODUCTS */}
        <div className={`${isStaff ? 'w-full' : ''} bg-white rounded-[2rem] border border-[var(--border-light)] p-8 shadow-sm`}>
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

      {/* SECONDARY ANALYTICS & INVENTORY SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* INVENTORY ALERTS */}
        <div className="bg-white rounded-[2.5rem] border border-[var(--border-light)] p-8 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-black text-[var(--text-heading)]">Restock Alerts</h2>
              <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-1">Inventory below threshold</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
              <AlertCircle size={20} />
            </div>
          </div>

          <div className="flex-1 space-y-4">
            {isStatsLoading ? (
               Array(4).fill(0).map((_, i) => <div key={i} className="h-12 bg-gray-50 rounded-2xl animate-pulse" />)
            ) : (
              <>
                {stats?.inventoryAlerts?.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100 group hover:border-rose-200 transition">
                    <div className="min-w-0">
                      <p className="text-xs font-black text-[var(--text-heading)] line-clamp-1">{item.name}</p>
                      <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider mt-0.5">SKU: {item.sku}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-black text-rose-600">{item.stock}</span>
                      <span className="text-[8px] font-black uppercase text-rose-300">Left</span>
                    </div>
                  </div>
                ))}
                {(!stats?.inventoryAlerts || stats.inventoryAlerts.length === 0) && (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                      <Package size={24} />
                    </div>
                    <p className="text-xs font-black text-[var(--text-heading)] uppercase">Stock Levels Healthy</p>
                    <p className="text-[10px] text-[var(--text-muted)] font-bold mt-1">No products require urgent restocking</p>
                  </div>
                )}
              </>
            )}
          </div>
          
          <Link href="/admin/products" className="mt-8 py-4 border-2 border-dashed border-gray-100 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)] transition">
            Manage All Inventory <ChevronRight size={14} />
          </Link>
        </div>

        {/* REVENUE BY CATEGORY */}
        <div className="bg-white rounded-[2.5rem] border border-[var(--border-light)] p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-black text-[var(--text-heading)]">Category Split</h2>
              <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-1">Revenue by product type</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-500 flex items-center justify-center">
              <Activity size={20} />
            </div>
          </div>

          <div className="h-[280px] w-full">
            {isStatsLoading ? (
              <div className="w-full h-full bg-gray-50 rounded-full animate-pulse mx-auto max-w-[200px]" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.categoryBreakdown}
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {stats?.categoryBreakdown?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                    formatter={(val) => `₱${Number(val).toLocaleString()}`}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    align="center"
                    iconType="circle"
                    formatter={(val) => <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* CUSTOMER TIERS */}
        <div className="bg-white rounded-[2.5rem] border border-[var(--border-light)] p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-black text-[var(--text-heading)]">Faithful Rewards</h2>
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">User Loyalty Distribution</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
              <GraduationCap size={20} />
            </div>
          </div>

          <div className="h-[280px] w-full">
            {isStatsLoading ? (
              <div className="w-full h-full bg-gray-50 rounded-3xl animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.customerTiers} layout="vertical" margin={{ left: -10, right: 30 }}>
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 9, fontWeight: 900, fill: '#64748b' }}
                    width={80}
                  />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                  />
                  <Bar 
                    dataKey="count" 
                    radius={[0, 10, 10, 0]} 
                    barSize={20}
                  >
                    {stats?.customerTiers?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={TIER_COLORS[entry.name] || '#6366f1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
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