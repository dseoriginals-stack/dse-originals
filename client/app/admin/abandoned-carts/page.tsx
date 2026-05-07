"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingCart, Send, Search, Clock, Mail } from "lucide-react"
import toast from "react-hot-toast"
import { formatDistanceToNow } from "date-fns"

export default function AdminAbandonedCartsPage() {
  const [carts, setCarts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [search, setSearch] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const fetchCarts = async () => {
    try {
      const res = await api.get("/admin/abandoned-carts")
      setCarts(res || [])
    } catch (err) {
      toast.error("Failed to load abandoned carts")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCarts()
  }, [])

  const handleSendEmails = async () => {
    if (selectedIds.size === 0) return toast.error("Select at least one cart")

    setSending(true)
    try {
      const res = await api.post("/admin/abandoned-carts/send", {
        cartIds: Array.from(selectedIds)
      })
      toast.success(`Successfully sent ${res.count} recovery emails!`)
      setSelectedIds(new Set())
      fetchCarts()
    } catch (err) {
      toast.error("Failed to send recovery emails")
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
    if (selectedIds.size === filteredCarts.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(filteredCarts.map(c => c.id)))
  }

  const filteredCarts = carts.filter(c => {
    if (search) {
      const s = search.toLowerCase()
      return (
        c.email.toLowerCase().includes(s) ||
        c.name.toLowerCase().includes(s)
      )
    }
    return true
  })

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-heading)] tracking-tight">Abandoned Carts</h1>
          <p className="text-sm text-[var(--text-muted)] font-medium mt-1">Recover lost sales by sending targeted reminder emails</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={handleSendEmails}
            disabled={selectedIds.size === 0 || sending}
            className="h-12 px-6 rounded-xl font-bold bg-indigo-600 text-white flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md shadow-indigo-600/20"
          >
            <Send size={18} />
            {sending ? "Sending..." : `Send Reminders (${selectedIds.size})`}
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input 
          type="text"
          placeholder="Search by customer name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 font-semibold focus:border-indigo-600 outline-none transition-all shadow-sm"
        />
      </div>

      {/* LIST */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 font-bold">Loading abandoned carts...</div>
        ) : filteredCarts.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <ShoppingCart size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-bold">No abandoned carts found</p>
            <p className="text-sm mt-1">Great! All your customers are completing their purchases.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="p-5 w-12">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.size === filteredCarts.length && filteredCarts.length > 0}
                    onChange={toggleAll}
                    className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-600"
                  />
                </th>
                <th className="p-5 text-xs font-black uppercase tracking-widest text-slate-400 bg-slate-50">Customer</th>
                <th className="p-5 text-xs font-black uppercase tracking-widest text-slate-400 bg-slate-50">Items Left Behind</th>
                <th className="p-5 text-xs font-black uppercase tracking-widest text-slate-400 bg-slate-50">Cart Value</th>
                <th className="p-5 text-xs font-black uppercase tracking-widest text-slate-400 bg-slate-50">Abandoned</th>
              </tr>
            </thead>
            <tbody>
              {filteredCarts.map(c => (
                <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="p-5">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.has(c.id)}
                      onChange={() => toggleSelect(c.id)}
                      className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-600"
                    />
                  </td>
                  <td className="p-5">
                    <div className="font-bold text-slate-800">{c.name}</div>
                    <div className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-1">
                      <Mail size={12} /> {c.email}
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="font-bold text-slate-700">{c.itemsCount} items</div>
                    <div className="text-xs text-slate-400 mt-1 max-w-[200px] truncate">
                      {c.items.map((i: any) => `${i.quantity}x ${i.name}`).join(', ')}
                    </div>
                  </td>
                  <td className="p-5 font-black text-indigo-600">
                    ₱{c.totalValue.toLocaleString()}
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                      <Clock size={14} /> {formatDistanceToNow(new Date(c.updatedAt))} ago
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
