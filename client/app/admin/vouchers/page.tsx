"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { motion } from "framer-motion"
import { Plus, Tag, Trash2, Power, Percent, DollarSign, Calendar, RefreshCcw } from "lucide-react"
import toast from "react-hot-toast"
import { format } from "date-fns"

type Voucher = {
  id: string
  code: string
  discount: number
  minSpend: number
  isActive: boolean
  usageLimit: number | null
  usedCount: number
  expiresAt: string | null
  createdAt: string
}

export default function AdminVouchers() {
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    code: "",
    discount: "",
    minSpend: "0",
    usageLimit: "",
    expiresAt: ""
  })

  const fetchVouchers = async () => {
    setLoading(true)
    try {
      const res = await api.get("/vouchers")
      setVouchers(res.vouchers || [])
    } catch (err) {
      toast.error("Failed to fetch vouchers")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVouchers()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.code || !form.discount) {
      return toast.error("Code and discount are required")
    }

    setSubmitting(true)
    try {
      await api.post("/vouchers", {
        code: form.code,
        discount: Number(form.discount),
        minSpend: Number(form.minSpend),
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
        isActive: true
      })
      toast.success("Voucher created successfully!")
      setShowModal(false)
      setForm({ code: "", discount: "", minSpend: "0", usageLimit: "", expiresAt: "" })
      fetchVouchers()
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create voucher")
    } finally {
      setSubmitting(false)
    }
  }

  const toggleStatus = async (id: string) => {
    try {
      await api.put(`/vouchers/${id}/toggle`, {})
      toast.success("Status updated")
      fetchVouchers()
    } catch (err) {
      toast.error("Failed to update status")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this voucher?")) return
    try {
      await api.delete(`/vouchers/${id}`)
      toast.success("Voucher deleted")
      fetchVouchers()
    } catch (err) {
      toast.error("Failed to delete voucher")
    }
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-heading)] tracking-tight">Promo Vouchers</h1>
          <p className="text-sm text-[var(--text-muted)] font-medium mt-1">Manage discount codes and promotions</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchVouchers} className="w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-black hover:border-black transition-all">
            <RefreshCcw size={18} />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="h-12 px-6 bg-slate-900 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-all"
          >
            <Plus size={18} /> Create Voucher
          </button>
        </div>
      </div>

      {/* LIST */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 font-bold">Loading vouchers...</div>
        ) : vouchers.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <Tag size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-bold">No vouchers found</p>
            <p className="text-sm mt-1">Create one to start running promotions.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="p-5 text-xs font-black uppercase tracking-widest text-slate-400 bg-slate-50">Code</th>
                <th className="p-5 text-xs font-black uppercase tracking-widest text-slate-400 bg-slate-50">Discount</th>
                <th className="p-5 text-xs font-black uppercase tracking-widest text-slate-400 bg-slate-50">Min Spend</th>
                <th className="p-5 text-xs font-black uppercase tracking-widest text-slate-400 bg-slate-50">Usage</th>
                <th className="p-5 text-xs font-black uppercase tracking-widest text-slate-400 bg-slate-50">Status</th>
                <th className="p-5 text-xs font-black uppercase tracking-widest text-slate-400 bg-slate-50 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map(v => (
                <tr key={v.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="p-5">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 font-black uppercase tracking-wider text-sm border border-emerald-100">
                      <Tag size={14} /> {v.code}
                    </span>
                  </td>
                  <td className="p-5 font-bold text-slate-700">
                    ₱{v.discount.toLocaleString()}
                  </td>
                  <td className="p-5 font-bold text-slate-500">
                    {v.minSpend > 0 ? `₱${v.minSpend.toLocaleString()}` : 'No minimum'}
                  </td>
                  <td className="p-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-700">{v.usedCount} {v.usageLimit ? `/ ${v.usageLimit}` : 'used'}</span>
                      {v.expiresAt && (
                        <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                          Exp: {format(new Date(v.expiresAt), "MMM d, yyyy")}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${v.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${v.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                      {v.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => toggleStatus(v.id)}
                        className={`p-2 rounded-xl border ${v.isActive ? 'text-amber-500 border-amber-100 hover:bg-amber-50' : 'text-emerald-500 border-emerald-100 hover:bg-emerald-50'} transition-all`}
                        title={v.isActive ? "Deactivate" : "Activate"}
                      >
                        <Power size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(v.id)}
                        className="p-2 rounded-xl text-red-500 border border-red-100 hover:bg-red-50 transition-all"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-900">Create Voucher</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-black">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Voucher Code</label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. SUMMER2024"
                    value={form.code}
                    onChange={e => setForm({...form, code: e.target.value.toUpperCase()})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 font-bold uppercase focus:border-black outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Discount (₱)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="Amount"
                      value={form.discount}
                      onChange={e => setForm({...form, discount: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 font-bold focus:border-black outline-none transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Min Spend (₱)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={form.minSpend}
                      onChange={e => setForm({...form, minSpend: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 font-bold focus:border-black outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Usage Limit</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Optional"
                    value={form.usageLimit}
                    onChange={e => setForm({...form, usageLimit: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 font-bold focus:border-black outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Expires At</label>
                  <input
                    type="datetime-local"
                    value={form.expiresAt}
                    onChange={e => setForm({...form, expiresAt: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 font-bold text-xs focus:border-black outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50">
                  {submitting ? "Creating..." : "Save Voucher"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
