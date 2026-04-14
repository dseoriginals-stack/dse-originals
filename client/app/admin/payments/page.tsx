"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight, 
  Search, 
  Filter, 
  Download, 
  ExternalLink,
  ShieldCheck,
  Heart,
  ShoppingCart
} from "lucide-react"
import toast from "react-hot-toast"

type Payment = {
  id: string
  type: "Order" | "Donation"
  customer: string
  email: string
  amount: number
  method: string
  reference: string
  createdAt: string
}

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all") // all, order, donation

  useEffect(() => {
    fetchPayments()
  }, [])

  async function fetchPayments() {
    try {
      setLoading(true)
      const data = await api.get<Payment[]>("/admin/payments")
      setPayments(data || [])
    } catch (err) {
      toast.error("Failed to load financial records")
    } finally {
      setLoading(false)
    }
  }

  const filteredPayments = payments.filter(p => {
    const matchesSearch = 
      p.customer.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.reference?.toLowerCase().includes(search.toLowerCase())
    
    const matchesFilter = filter === "all" || p.type.toLowerCase() === filter.toLowerCase()
    
    return matchesSearch && matchesFilter
  })

  // Aggregates
  const totalRevenue = payments.reduce((acc, p) => acc + Number(p.amount), 0)
  const orderTotal = payments.filter(p => p.type === "Order").reduce((acc, p) => acc + Number(p.amount), 0)
  const donationTotal = payments.filter(p => p.type === "Donation").reduce((acc, p) => acc + Number(p.amount), 0)

  return (
    <div className="space-y-8 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-[1000] text-[var(--text-heading)] tracking-tighter">Financial Ledger</h1>
          <p className="text-[var(--text-muted)] text-sm font-bold uppercase tracking-wider mt-1">Unified E-commerce & Cause Revenue</p>
        </div>

        <div className="flex items-center gap-3">
           <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              placeholder="Ref / Name / Customer..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 pr-4 py-3 bg-white border border-[var(--border-light)] rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[var(--brand-primary)] focus:outline-none w-64 shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-5 py-3 bg-white border border-[var(--border-light)] rounded-2xl text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)] transition-all shadow-sm">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard 
           title="Consolidated Net" 
           value={`₱${totalRevenue.toLocaleString()}`} 
           icon={<CreditCard size={40} className="text-white" />} 
           color="bg-gradient-to-tr from-[#274C77] to-[#1B3B60]"
        />
        <KPICard 
           title="Store Revenue" 
           value={`₱${orderTotal.toLocaleString()}`} 
           icon={<ShoppingCart size={40} className="text-[var(--brand-primary)]" />} 
           color="bg-blue-50/50"
           light
        />
        <KPICard 
           title="Cause Donations" 
           value={`₱${donationTotal.toLocaleString()}`} 
           icon={<Heart size={40} className="text-emerald-600" />} 
           color="bg-emerald-50/50"
           light
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[2.5rem] border border-[var(--border-light)] shadow-sm overflow-hidden">
        
        {/* FILTER BAR */}
        <div className="p-6 border-b border-[var(--border-light)] bg-gray-50/30 flex items-center justify-between">
            <div className="flex gap-2">
               {["all", "order", "donation"].map(f => (
                 <button 
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    filter === f ? "bg-white text-[var(--brand-primary)] shadow-sm border border-[var(--border-light)]" : "text-gray-400 hover:text-[var(--brand-primary)]"
                  }`}
                 >
                   {f}s
                 </button>
               ))}
            </div>
            <p className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-gray-400">
              Showing {filteredPayments.length} verified transactions
            </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] border-b border-[var(--border-light)]">
                <th className="px-8 py-5">Transaction Type</th>
                <th className="px-8 py-5">Source / Ref</th>
                <th className="px-8 py-5">Value</th>
                <th className="px-8 py-5">Processing</th>
                <th className="px-8 py-5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light)]">
              {loading ? (
                Array(6).fill(0).map((_, i) => <SkeletonRow key={i} />)
              ) : (
                filteredPayments.map(payment => (
                  <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${payment.type === 'Order' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                          {payment.type === 'Order' ? <ShoppingCart size={18} /> : <Heart size={18} />}
                        </div>
                        <div>
                          <p className="font-[1000] text-sm text-[var(--text-heading)]">{payment.type}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{new Date(payment.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-[var(--text-heading)]">{payment.customer}</span>
                        <span className="text-[10px] text-[var(--brand-primary)] font-black uppercase tracking-tighter mt-1">Ref: {payment.reference?.slice(0, 12)}...</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-1">
                        <ArrowUpRight size={14} className="text-emerald-500" />
                        <span className="font-[1000] text-sm text-[var(--text-heading)]">₱{Number(payment.amount).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1.5 bg-violet-50 text-violet-600 border border-violet-100 rounded-full text-[9px] font-black uppercase tracking-[0.15em] shadow-sm">
                         {payment.method}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="p-2 text-gray-300 hover:text-[var(--brand-primary)] hover:bg-white rounded-xl transition-all hover:shadow-md">
                        <ExternalLink size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
              {!loading && filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center italic text-gray-400 font-bold uppercase tracking-widest text-xs">
                    No verified transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

function KPICard({ title, value, icon, color, light }: any) {
  return (
    <div className={`${color} p-8 rounded-[2.5rem] border border-[var(--border-light)] shadow-sm relative overflow-hidden group hover:scale-[1.02] transition-transform`}>
      <div className="absolute -bottom-2 -right-2 opacity-10 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <p className={`text-[11px] font-[1000] uppercase tracking-[0.2em] mb-2 ${light ? 'text-gray-400' : 'text-white/60'}`}>{title}</p>
      <h3 className={`text-4xl font-[1000] tracking-tighter ${light ? 'text-[var(--text-heading)]' : 'text-white'}`}>{value}</h3>
    </div>
  )
}

function SkeletonRow() {
  return (
    <tr>
      <td colSpan={5} className="px-8 py-6">
        <div className="h-10 bg-gray-50 rounded-xl animate-pulse w-full" />
      </td>
    </tr>
  )
}
