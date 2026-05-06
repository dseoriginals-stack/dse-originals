"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Bug, Send, AlertTriangle, MessageSquare, Info } from "lucide-react"
import { api } from "@/lib/api"
import toast from "react-hot-toast"
import { useAuth } from "@/context/AuthContext"

type Props = {
  isOpen: boolean
  onClose: () => void
}

const ISSUE_TYPES = [
  { id: "bug", label: "Bug / Error", icon: <Bug size={16} />, color: "text-red-500" },
  { id: "suggestion", label: "Suggestion", icon: <MessageSquare size={16} />, color: "text-blue-500" },
  { id: "other", label: "Other", icon: <Info size={16} />, color: "text-gray-500" },
]

export default function ReportIssueModal({ isOpen, onClose }: Props) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    type: "bug",
    description: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email || !form.description) {
      return toast.error("Please fill in all required fields")
    }

    setLoading(true)
    try {
      await api.post("/issues", {
        ...form,
        url: window.location.href
      })
      toast.success("Thank you! Your report has been submitted.")
      setForm({ ...form, description: "" })
      onClose()
    } catch (err: any) {
      toast.error(err.message || "Failed to submit report")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[var(--brand-primary)] p-8 text-white relative">
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <AlertTriangle size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight">Report an Issue</h2>
                  <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Help us improve DSEoriginals</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Your Name"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[var(--brand-primary)] outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="Your Email"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[var(--brand-primary)] outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Issue Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {ISSUE_TYPES.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setForm({ ...form, type: type.id })}
                        className={`
                          flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all
                          ${form.type === type.id 
                            ? 'border-[var(--brand-primary)] bg-[var(--brand-soft)]/10' 
                            : 'border-slate-50 bg-slate-50 hover:border-slate-200'}
                        `}
                      >
                        <div className={`${type.color}`}>{type.icon}</div>
                        <span className="text-[10px] font-black uppercase tracking-tighter">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Description *</label>
                  <textarea
                    required
                    rows={4}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe what happened..."
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[var(--brand-primary)] outline-none transition-all resize-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-premium !py-4 flex items-center justify-center gap-3 shadow-xl"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Submit Report <Send size={18} />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
