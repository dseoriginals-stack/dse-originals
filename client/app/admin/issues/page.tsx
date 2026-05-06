"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { AlertTriangle, Clock, CheckCircle2, MessageSquare, ExternalLink, User, Mail, Globe, Image as ImageIcon } from "lucide-react"
import toast from "react-hot-toast"

type Issue = {
  id: string
  name: string | null
  email: string
  type: string
  description: string
  url: string | null
  image: string | null
  status: string
  createdAt: string
  user: { name: string; email: string } | null
}

const STATUS_COLORS: any = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  investigating: "bg-blue-100 text-blue-700 border-blue-200",
  resolved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  closed: "bg-slate-100 text-slate-700 border-slate-200",
}

export default function IssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)

  const fetchIssues = async () => {
    try {
      const data = await api.get("/issues")
      setIssues(data)
    } catch (err) {
      toast.error("Failed to fetch issues")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIssues()
  }, [])

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(new Date(dateString))
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/issues/${id}/status`, { status })
      toast.success(`Status updated to ${status}`)
      setIssues(issues.map(iss => iss.id === id ? { ...iss, status } : iss))
    } catch (err) {
      toast.error("Failed to update status")
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[400px]">Loading...</div>

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-[1000] text-[var(--text-heading)] tracking-tighter">Reported Issues</h1>
          <p className="text-slate-500 font-medium">Manage and track user reported bugs and suggestions.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-2">
          <AlertTriangle size={18} className="text-red-500" />
          <span className="font-bold text-slate-700">{issues.length} Total Reports</span>
        </div>
      </div>

      <div className="grid gap-6">
        {issues.map((issue) => (
          <div key={issue.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-8">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${STATUS_COLORS[issue.status]}`}>
                      {issue.status}
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                      <Clock size={12} />
                      {formatDate(issue.createdAt)}
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 font-bold">
                      {issue.type}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-black text-slate-800 leading-tight">{issue.description}</h3>
                    {issue.url && (
                      <a 
                        href={issue.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--brand-primary)] hover:underline"
                      >
                        <Globe size={12} />
                        Reported at: {new URL(issue.url).pathname}
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-6 pt-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <User size={14} className="text-slate-400" />
                      {issue.name || "Anonymous"}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <Mail size={14} className="text-slate-400" />
                      {issue.email}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 lg:items-end">
                  {issue.image && (
                    <a href={issue.image} target="_blank" rel="noopener noreferrer" className="relative w-40 aspect-video rounded-2xl overflow-hidden border border-slate-100 shadow-sm group">
                      <img src={issue.image} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <ImageIcon size={20} className="text-white" />
                      </div>
                    </a>
                  )}

                  <div className="flex items-center gap-2">
                    <select 
                      value={issue.status}
                      onChange={(e) => updateStatus(issue.id, e.target.value)}
                      className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[var(--brand-primary)] outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="investigating">Investigating</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>

              </div>
            </div>
          </div>
        ))}

        {issues.length === 0 && (
          <div className="bg-white rounded-[2rem] p-20 text-center border-2 border-dashed border-slate-100">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="text-slate-300" size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">No issues reported!</h3>
            <p className="text-slate-400 text-sm font-medium">Your users are having a smooth experience.</p>
          </div>
        )}
      </div>
    </div>
  )
}
