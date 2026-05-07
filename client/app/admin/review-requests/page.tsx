"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { motion } from "framer-motion"
import { Star, Send, Search, Clock, Mail } from "lucide-react"
import toast from "react-hot-toast"
import { formatDistanceToNow } from "date-fns"

export default function AdminReviewRequestsPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [search, setSearch] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const fetchRequests = async () => {
    try {
      const res = await api.get("/admin/review-requests")
      setRequests(res || [])
    } catch (err) {
      toast.error("Failed to load review requests")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const handleSendEmails = async () => {
    if (selectedIds.size === 0) return toast.error("Select at least one order")

    setSending(true)
    try {
      const res = await api.post("/admin/review-requests/send", {
        orderIds: Array.from(selectedIds)
      })
      toast.success(`Successfully dispatched ${res.count} review requests!`)
      setSelectedIds(new Set())
      fetchRequests()
    } catch (err) {
      toast.error("Failed to send review requests")
    } finally {
      setSending(false)
    }
  }

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const toggleAll = () => {
    if (selectedIds.size === filteredRequests.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(filteredRequests.map(r => r.orderId)))
  }

  const filteredRequests = requests.filter(r => {
    if (search) {
      const s = search.toLowerCase()
      return (
        r.email.toLowerCase().includes(s) ||
        r.name.toLowerCase().includes(s) ||
        r.orderId.toLowerCase().includes(s)
      )
    }
    return true
  })

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-heading)] tracking-tight">Review Requests</h1>
          <p className="text-sm text-[var(--text-muted)] font-medium mt-1">Prompt customers to leave reviews for recently delivered orders</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={handleSendEmails}
            disabled={selectedIds.size === 0 || sending}
            className="h-12 px-6 rounded-xl font-bold bg-[var(--brand-primary)] text-white flex items-center gap-2 hover:bg-[var(--brand-primary)]/90 disabled:opacity-50 transition-all shadow-md"
          >
            <Send size={18} />
            {sending ? "Dispatching..." : `Send Requests (${selectedIds.size})`}
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input 
          type="text"
          placeholder="Search by customer name, email, or order ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 font-semibold focus:border-[var(--brand-primary)] outline-none transition-all shadow-sm"
        />
      </div>

      {/* LIST */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 font-bold">Loading eligible orders...</div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <Star size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-bold">No eligible orders found</p>
            <p className="text-sm mt-1">Orders appear here 5 days after delivery if unreviewed.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="p-5 w-12">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.size === filteredRequests.length && filteredRequests.length > 0}
                    onChange={toggleAll}
                    className="w-5 h-5 rounded text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
                  />
                </th>
                <th className="p-5 text-xs font-black uppercase tracking-widest text-slate-400 bg-slate-50">Customer</th>
                <th className="p-5 text-xs font-black uppercase tracking-widest text-slate-400 bg-slate-50">Unreviewed Products</th>
                <th className="p-5 text-xs font-black uppercase tracking-widest text-slate-400 bg-slate-50">Delivered</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map(r => (
                <tr key={r.orderId} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="p-5">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.has(r.orderId)}
                      onChange={() => toggleSelect(r.orderId)}
                      className="w-5 h-5 rounded text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
                    />
                  </td>
                  <td className="p-5">
                    <div className="font-bold text-slate-800">{r.name}</div>
                    <div className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-1">
                      <Mail size={12} /> {r.email}
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex flex-wrap gap-2">
                      {r.unreviewedItems.map((i: any) => (
                        <span key={i.productId} className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 border border-amber-100 px-2 py-1 rounded-md text-xs font-bold">
                          <Star size={10} /> {i.productName}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                      <Clock size={14} /> {formatDistanceToNow(new Date(r.deliveredAt))} ago
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">
                      Order: {r.orderId.substring(0, 8)}...
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
