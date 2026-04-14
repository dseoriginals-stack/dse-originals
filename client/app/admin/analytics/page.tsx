"use client"

export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Cell
} from 'recharts'
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  CreditCard,
  ChevronRight,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"

type AnalyticsData = {
  revenueChart: { date: string; amount: number }[]
  topProducts: { name: string; sales: number }[]
  categoryBreakdown: { name: string; sales: number }[]
  revenueTotal: number
  donationRevenue: number
  ordersTotal: number
  productsTotal: number
}

import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

export default function AdminAnalytics() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && user?.role === "staff") {
      router.push("/admin/orders")
      return
    }

    async function load() {
      try {
        setLoading(true)
        const res = await api.get<any>("/admin/stats")
        
        setData({
          revenueChart: res.revenueChart || [],
          topProducts: (res.topProducts || []).map((p: any) => ({
            name: p.name,
            sales: p.sold
          })),
          categoryBreakdown: res.categoryBreakdown || [],
          revenueTotal: res.revenue,
          donationRevenue: res.donationRevenue,
          ordersTotal: res.totalOrders,
          productsTotal: res.totalProducts
        })
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading || !data) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin" />
        <p className="font-bold text-[var(--text-muted)] animate-pulse uppercase tracking-widest text-xs">Generating Report...</p>
      </div>
    )
  }

  const COLORS = ['var(--brand-primary)', '#6096BA', '#A3CEF1', '#274C77', '#8B8C89']

  return (
    <div className="space-y-10 pb-20 max-w-[1400px] mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-[1000] text-[var(--text-heading)] tracking-tighter">Analytics Intelligence</h1>
          <p className="text-[var(--text-muted)] text-sm font-bold uppercase tracking-wider mt-1">Deep dive into store performance & trends</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-[var(--border-light)] rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition shadow-sm">
            <Filter size={14} /> Refine Period
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-[var(--brand-primary)] text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#1a2c47] transition shadow-xl">
            <Download size={14} /> Download PDF
          </button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Commerce Revenue" value={`₱${data.revenueTotal.toLocaleString()}`} icon={<CreditCard size={20}/>} trend="+18%" />
        <KPICard title="Donation Impact" value={`₱${data.donationRevenue.toLocaleString()}`} icon={<TrendingUp size={20}/>} trend="+24%" />
        <KPICard title="Total Transactions" value={data.ordersTotal} icon={<ShoppingBag size={20}/>} trend="+5%" />
        <KPICard title="Product Inventory" value={data.productsTotal} icon={<BarChart size={20}/>} trend="Active" />
      </div>

      {/* CORE ANALYTICS */}
      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* REVENUE OVER TIME */}
        <div className="bg-white rounded-[2.5rem] border border-[var(--border-light)] p-10 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-xl font-[1000] text-[var(--text-heading)] tracking-tight">Revenue Stream</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)] mt-1">Daily trend analysis</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">
              <ArrowUpRight size={12}/> Growth Phase
            </div>
          </div>
          
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.revenueChart}>
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
                  tickFormatter={(val) => `₱${val >= 1000 ? val/1000 + 'k' : val}`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '15px' }}
                  itemStyle={{ fontWeight: 800, color: 'var(--brand-primary)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="var(--brand-primary)" 
                  strokeWidth={5} 
                  dot={{ r: 6, fill: 'white', strokeWidth: 3, stroke: 'var(--brand-primary)' }} 
                  activeDot={{ r: 10, fill: 'var(--brand-primary)', stroke: 'white' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CATEGORY BREAKDOWN */}
        <div className="bg-white rounded-[2.5rem] border border-[var(--border-light)] p-10 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-xl font-[1000] text-[var(--text-heading)] tracking-tight">Category Dominance</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)] mt-1">Niche volume metrics</p>
            </div>
          </div>

          <div className="flex-1 min-h-[400px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={data.categoryBreakdown} layout="vertical" margin={{ left: 40 }}>
                 <XAxis type="number" hide />
                 <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 800, fill: '#1e293b' }} 
                  width={150}
                 />
                 <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}/>
                 <Bar dataKey="sales" radius={[0, 10, 10, 0]} barSize={34}>
                    {data.categoryBreakdown.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Inventory diverse across categories</span>
            <button className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)] flex items-center gap-1 group">
              Inventory Report <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

      </div>

    </div>
  )
}

function KPICard({ title, value, icon, trend }: any) {
  const isPositive = trend.startsWith('+')
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-[var(--border-light)] shadow-sm hover:shadow-2xl transition-all duration-500 group">
      <div className="flex justify-between items-start mb-6">
        <div className="w-12 h-12 rounded-2xl bg-[var(--bg-surface)] flex items-center justify-center text-[var(--brand-primary)] border border-gray-100 shadow-inner group-hover:bg-[var(--brand-primary)] group-hover:text-white transition-colors duration-500">
          {icon}
        </div>
        <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
          {isPositive ? <ArrowUpRight size={10}/> : <ArrowDownRight size={10}/>} {trend}
        </div>
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--text-muted)] mb-1 leading-none">{title}</p>
        <p className="text-3xl font-[1000] text-[var(--text-heading)] tracking-tighter leading-none">{value}</p>
      </div>
    </div>
  )
}