"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { format } from "date-fns"
import { History, Package, ShoppingBag, Info, Shield, RefreshCw } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

type ActivityLog = {
  id: string
  userId: string
  action: string
  entity: string | null
  entityId: string | null
  details: string | null
  ip: string | null
  userAgent: string | null
  createdAt: string
  user: {
    name: string
    email: string
    role: string
  }
}

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const data = await api.get<ActivityLog[]>("/admin/activity-logs")
      setLogs(data || [])
      setError(null)
    } catch (err) {
      console.error("Failed to fetch activity logs", err)
      setError("Failed to load logs. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const getActionBadge = (action: string) => {
    if (action.startsWith("CREATE")) return "bg-emerald-100 text-emerald-700 border-emerald-200"
    if (action.startsWith("UPDATE")) return "bg-amber-100 text-amber-700 border-amber-200"
    if (action.startsWith("DELETE") || action.includes("ARCHIVE") || action.includes("CANCEL")) return "bg-rose-100 text-rose-700 border-rose-200"
    if (action.includes("REFUND")) return "bg-purple-100 text-purple-700 border-purple-200"
    return "bg-slate-100 text-slate-700 border-slate-200"
  }

  const getEntityIcon = (entity: string | null) => {
    switch (entity) {
      case "Product": return <Package size={14} />
      case "Order": return <ShoppingBag size={14} />
      default: return <Info size={14} />
    }
  }

  const parseDetails = (details: string | null) => {
    if (!details) return "No additional metadata"
    try {
      const parsed = JSON.parse(details)
      if (typeof parsed === 'object' && parsed !== null) {
        return Object.entries(parsed).map(([k, v]) => `${k}: ${v}`).join(", ")
      }
      return String(details)
    } catch {
      return String(details)
    }
  }

  const formatLogDate = (dateStr: string, pattern: string) => {
    try {
      return format(new Date(dateStr), pattern)
    } catch {
      return "—"
    }
  }

  if (loading && logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-10 h-10 border-4 border-[var(--brand-primary)]/20 border-t-[var(--brand-primary)] rounded-full animate-spin" />
        <p className="text-sm font-semibold text-[var(--text-muted)] animate-pulse uppercase tracking-[0.2em]">Scanning logs...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-10">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shadow-sm">
              <History size={24} />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-[var(--text-heading)] tracking-tight uppercase italic">
              Activity <span className="text-[var(--brand-primary)]">Logs</span>
            </h1>
          </div>
          <p className="text-[var(--text-muted)] text-sm font-medium">
            Monitor all administrative and staff actions in real-time.
          </p>
        </div>

        <button 
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[var(--border-light)] rounded-xl text-sm font-bold text-[var(--text-heading)] hover:bg-slate-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh Feed
        </button>
      </div>

      {error ? (
        <div className="bg-rose-50 border border-rose-100 p-6 rounded-2xl flex items-center gap-4 text-rose-700">
          <Shield size={24} />
          <p className="font-bold">{error}</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white border border-[var(--border-light)] rounded-[2rem] p-20 text-center shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
            <History size={40} />
          </div>
          <h3 className="text-lg font-black text-[var(--text-heading)] uppercase mb-2 tracking-widest">No Activity Yet</h3>
          <p className="text-[var(--text-muted)] max-w-sm mx-auto text-sm">
            Staff and admin actions will appear here as they happen.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[var(--border-light)] rounded-[2rem] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-[var(--border-light)]">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Timestamp</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">User</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Action</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Target</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Details</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] text-right">Origin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)]">
                <AnimatePresence initial={false}>
                  {logs.map((log) => (
                    <motion.tr 
                      key={log.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="hover:bg-slate-50/40 transition-colors group"
                    >
                      {/* TIMESTAMP */}
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-[var(--text-heading)]">
                            {formatLogDate(log.createdAt, "MMM d, yyyy")}
                          </span>
                          <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-tighter">
                            {formatLogDate(log.createdAt, "h:mm a")}
                          </span>
                        </div>
                      </td>

                      {/* USER */}
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs ring-1 ring-slate-200 group-hover:scale-110 transition-transform">
                            {log.user.name[0]}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-extrabold text-[var(--text-heading)]">{log.user.name}</span>
                            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{log.user.role}</span>
                          </div>
                        </div>
                      </td>

                      {/* ACTION */}
                      <td className="px-8 py-5 whitespace-nowrap">
                        <span className={`px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest shadow-sm ${getActionBadge(log.action)}`}>
                          {log.action.replace(/_/g, " ")}
                        </span>
                      </td>

                      {/* TARGET */}
                      <td className="px-8 py-5 whitespace-nowrap">
                        {log.entity ? (
                          <div className="flex items-center gap-2 text-slate-600 font-bold">
                            {getEntityIcon(log.entity)}
                            <span className="text-xs">{log.entity}</span>
                            {log.entityId && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded-md font-mono text-slate-400">
                                {log.entityId.slice(-6)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>

                      {/* DETAILS */}
                      <td className="px-8 py-5 max-w-xs">
                        <p className="text-xs font-medium text-[var(--text-muted)] line-clamp-2 italic">
                          {parseDetails(log.details)}
                        </p>
                      </td>

                      {/* ORIGIN */}
                      <td className="px-8 py-5 text-right whitespace-nowrap">
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] font-mono text-slate-400">{log.ip || "Unknown IP"}</span>
                          <span className="text-[9px] text-slate-300 max-w-[120px] truncate" title={log.userAgent || ""}>
                            {log.userAgent || "Unknown Agent"}
                          </span>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
