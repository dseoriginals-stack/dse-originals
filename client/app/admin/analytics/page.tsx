"use client"
export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

import { useEffect, useState } from "react"
import dynamicImport from "next/dynamic"
import { api } from "@/lib/api"

/* =========================
   RECHARTS
========================= */

const LineChart = dynamicImport(() => import("recharts").then(m => m.LineChart), { ssr: false })
const Line = dynamicImport(() => import("recharts").then(m => m.Line), { ssr: false })
const XAxis = dynamicImport(() => import("recharts").then(m => m.XAxis), { ssr: false })
const YAxis = dynamicImport(() => import("recharts").then(m => m.YAxis), { ssr: false })
const Tooltip = dynamicImport(() => import("recharts").then(m => m.Tooltip), { ssr: false })
const ResponsiveContainer = dynamicImport(() => import("recharts").then(m => m.ResponsiveContainer), { ssr: false })
const BarChart = dynamicImport(() => import("recharts").then(m => m.BarChart), { ssr: false })
const Bar = dynamicImport(() => import("recharts").then(m => m.Bar), { ssr: false })

/* =========================
   TYPES
========================= */

type Analytics = {
  revenueChart: { date: string; revenue: number }[]
  orderChart: { date: string; revenue: number }[]
  topProducts: { name: string; sales: number }[]
  recentOrders: { id: string; total: number; status: string }[]
  revenueTotal: number
  ordersTotal: number
  productsTotal: number
}

/* =========================
   COMPONENT
========================= */

export default function AdminAnalytics() {

  const [data, setData] = useState<Analytics | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get<any>("/analytics")

        const formatted: Analytics = {
          revenueChart: (res.sales || []).map((s: any) => ({
            date: s.date,
            revenue: s.total,
          })),

          orderChart: (res.sales || []).map((s: any) => ({
            date: s.date,
            revenue: s.total,
          })),

          topProducts: (res.topProducts || []).map((p: any) => ({
            name: p.productName,
            sales: p._sum?.quantity || 0,
          })),

          recentOrders: [],

          revenueTotal: res.revenue || 0,
          ordersTotal: res.orders || 0,
          productsTotal: res.products || 0,
        }

        setData(formatted)

      } catch (err) {
        console.error(err)
        setError("Failed to load analytics")
      }
    }

    load()
  }, [])

  if (error) {
    return <div className="text-red-500 font-medium bg-red-50 p-4 rounded-xl border border-red-100 mt-6 lg:mt-0">{error}</div>
  }

  if (!data) {
    return (
      <div className="py-20 flex justify-center items-center gap-3 text-[var(--text-muted)] font-medium">
         <svg className="animate-spin h-6 w-6 text-[var(--brand-primary)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
         Compiling analytics...
      </div>
    )
  }

  return (
    <div className="space-y-8">

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-[var(--text-heading)] tracking-tight">Analytics Studio</h1>
        <p className="text-[var(--text-muted)] font-medium">Monitor store performance, sales velocity, and revenue metrics.</p>
      </div>

      {/* ================= KPI CARDS ================= */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 transform">

        <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-[var(--border-light)] shadow-sm hover:shadow-lg transition-all duration-300 group">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-3">Total Revenue</p>
          <p className="text-4xl font-black text-[var(--brand-primary)] drop-shadow-sm group-hover:scale-105 transform origin-left transition-transform">
            ₱{data.revenueTotal.toLocaleString()}
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-[var(--border-light)] shadow-sm hover:shadow-lg transition-all duration-300 group">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-3">Total Orders</p>
          <p className="text-4xl font-black text-[var(--brand-primary)] drop-shadow-sm group-hover:scale-105 transform origin-left transition-transform">
            {data.ordersTotal}
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-[var(--border-light)] shadow-sm hover:shadow-lg transition-all duration-300 group">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-3">Total Products</p>
          <p className="text-4xl font-black text-[var(--brand-primary)] drop-shadow-sm group-hover:scale-105 transform origin-left transition-transform">
            {data.productsTotal}
          </p>
        </div>

      </div>

      {/* ================= CHARTS ================= */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* REVENUE */}
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-[var(--border-light)] shadow-sm">
          <h2 className="text-xl font-bold text-[var(--text-heading)] mb-6">Revenue Trajectory</h2>

          {(data.revenueChart?.length ?? 0) === 0 ? (
             <div className="h-[300px] flex items-center justify-center text-[var(--text-muted)] italic font-medium bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-light)]">No revenue data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.revenueChart}>
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₱${v}`} />
                <Tooltip cursor={{ fill: 'var(--bg-surface)' }} contentStyle={{ borderRadius: '1rem', border: '1px solid var(--border-light)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--brand-primary)"
                  strokeWidth={4}
                  dot={{ r: 4, fill: "var(--brand-accent)", strokeWidth: 2, stroke: "white" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* ORDERS */}
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-[var(--border-light)] shadow-sm">
          <h2 className="text-xl font-bold text-[var(--text-heading)] mb-6">Order Volume</h2>

          {(data.orderChart?.length ?? 0) === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-[var(--text-muted)] italic font-medium bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-light)]">No order data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.orderChart}>
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'var(--bg-surface)' }} contentStyle={{ borderRadius: '1rem', border: '1px solid var(--border-light)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="revenue" fill="url(#colorRevenue)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--brand-accent)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>

      {/* ================= LOWER SECTION ================= */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* TOP PRODUCTS */}
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-[var(--border-light)] shadow-sm">
          <h2 className="text-xl font-bold text-[var(--text-heading)] mb-6">Top Performing Products</h2>

          {(data.topProducts?.length ?? 0) === 0 ? (
            <div className="py-10 text-center text-[var(--text-muted)] italic font-medium bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-light)]">No products recorded yet</div>
          ) : (
            <ul className="space-y-3">
              {data.topProducts.map((p, i) => (
                <li key={i} className="flex justify-between items-center text-sm p-4 rounded-xl border border-[var(--border-light)] hover:border-[var(--brand-accent)] transition-colors bg-[var(--bg-card)]">
                  <span className="font-bold text-[var(--text-heading)] flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex justify-center items-center font-black text-xs">{i + 1}</span>
                    {p.name}
                  </span>
                  <span className="font-bold text-[var(--brand-primary)] bg-[var(--brand-soft)]/20 px-3 py-1 rounded-full">{p.sales} Sold</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* RECENT ORDERS */}
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-[var(--border-light)] shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--brand-primary)]/10 flex items-center justify-center text-[var(--brand-primary)] mb-4">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          </div>
          <h2 className="text-xl font-bold text-[var(--text-heading)] mb-2">Live Activity</h2>
          <p className="text-[var(--text-muted)] font-medium max-w-sm">Data streaming module is currently being provisioned. This feature will deploy soon.</p>
        </div>

      </div>

    </div>
  )
}