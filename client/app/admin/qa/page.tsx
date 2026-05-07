"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, CheckCircle2, Search, X, MessageSquare, AlertCircle } from "lucide-react"
import toast from "react-hot-toast"
import { format } from "date-fns"

export default function AdminQAPage() {
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "pending" | "answered">("pending")
  const [search, setSearch] = useState("")

  const [answeringId, setAnsweringId] = useState<string | null>(null)
  const [answerText, setAnswerText] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const fetchQuestions = async () => {
    try {
      const res = await api.get("/admin/questions")
      setQuestions(res || [])
    } catch (err) {
      toast.error("Failed to load Q&A data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuestions()
  }, [])

  const handleAnswerSubmit = async (e: React.FormEvent, id: string) => {
    e.preventDefault()
    if (!answerText.trim()) return

    setSubmitting(true)
    try {
      // The answer endpoint is PUT /api/products/questions/:questionId/answer
      await api.put(`/products/questions/${id}/answer`, { answer: answerText })
      toast.success("Answer posted successfully!")
      setAnsweringId(null)
      setAnswerText("")
      fetchQuestions()
    } catch (err) {
      toast.error("Failed to post answer")
    } finally {
      setSubmitting(false)
    }
  }

  const filteredQuestions = questions.filter(q => {
    if (filter === "pending" && q.answer) return false
    if (filter === "answered" && !q.answer) return false
    
    if (search) {
      const s = search.toLowerCase()
      return (
        q.question.toLowerCase().includes(s) ||
        (q.product?.name || "").toLowerCase().includes(s) ||
        (q.user?.name || q.guestName || "").toLowerCase().includes(s)
      )
    }
    return true
  })

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-heading)] tracking-tight">Product Q&A Manager</h1>
          <p className="text-sm text-[var(--text-muted)] font-medium mt-1">Answer customer questions directly from the dashboard</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-1 rounded-2xl border border-slate-200">
          <button 
            onClick={() => setFilter("pending")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filter === "pending" ? 'bg-amber-50 text-amber-600' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Pending
          </button>
          <button 
            onClick={() => setFilter("answered")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filter === "answered" ? 'bg-emerald-50 text-emerald-600' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Answered
          </button>
          <button 
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filter === "all" ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            All Questions
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input 
          type="text"
          placeholder="Search by product, customer name, or question..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 font-semibold focus:border-[var(--brand-primary)] outline-none transition-all shadow-sm"
        />
      </div>

      {/* LIST */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-white rounded-3xl animate-pulse" />)}
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm">
          <MessageCircle size={48} className="mx-auto mb-4 opacity-20 text-slate-400" />
          <p className="font-bold text-slate-600 text-lg">No questions found</p>
          <p className="text-sm text-slate-400 mt-1">
            {filter === "pending" ? "You're all caught up! Great job." : "Try adjusting your search or filters."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <AnimatePresence>
            {filteredQuestions.map(q => (
              <motion.div 
                key={q.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`bg-white rounded-3xl p-6 md:p-8 border shadow-sm transition-all ${!q.answer ? 'border-amber-200 shadow-amber-500/5' : 'border-slate-100'}`}
              >
                {/* HEAD */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)] bg-[var(--brand-soft)]/20 px-2 py-1 rounded-md">
                      {q.product?.name || "Unknown Product"}
                    </span>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-bold text-sm text-slate-900">{q.user?.name || q.guestName || "Anonymous Customer"}</span>
                      <span className="text-xs text-slate-400">• {format(new Date(q.createdAt), "MMM d, yyyy")}</span>
                    </div>
                  </div>
                  {!q.answer && (
                    <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-500 bg-amber-50 px-3 py-1.5 rounded-full">
                      <AlertCircle size={14} /> Pending
                    </div>
                  )}
                  {q.answer && (
                    <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-full">
                      <CheckCircle2 size={14} /> Answered
                    </div>
                  )}
                </div>

                {/* QUESTION */}
                <div className="bg-slate-50 p-4 rounded-2xl mb-4">
                  <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                    <span className="font-black text-slate-400 mr-2">Q:</span>
                    {q.question}
                  </p>
                </div>

                {/* ACTION AREA */}
                {q.answer ? (
                  <div className="bg-[var(--brand-soft)]/10 p-4 rounded-2xl border border-[var(--brand-primary)]/10">
                    <p className="text-sm font-medium text-slate-700 leading-relaxed">
                      <span className="font-black text-[var(--brand-primary)] mr-2">A:</span>
                      {q.answer}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase">
                      Answered on {format(new Date(q.answeredAt), "MMM d, yyyy")}
                    </p>
                  </div>
                ) : answeringId === q.id ? (
                  <form onSubmit={(e) => handleAnswerSubmit(e, q.id)} className="space-y-3">
                    <textarea 
                      autoFocus
                      required
                      placeholder="Type your official response..."
                      value={answerText}
                      onChange={e => setAnswerText(e.target.value)}
                      className="w-full bg-white border-2 border-slate-200 rounded-2xl p-4 text-sm font-medium focus:border-[var(--brand-primary)] outline-none resize-none h-24"
                    />
                    <div className="flex gap-2 justify-end">
                      <button 
                        type="button" 
                        onClick={() => { setAnsweringId(null); setAnswerText(""); }}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-all"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-2 rounded-xl text-xs font-bold bg-[var(--brand-primary)] text-white shadow-lg hover:opacity-90 disabled:opacity-50 transition-all"
                      >
                        {submitting ? "Posting..." : "Post Answer"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <button 
                    onClick={() => { setAnsweringId(q.id); setAnswerText(""); }}
                    className="w-full py-3 border-2 border-dashed border-slate-200 text-slate-500 rounded-2xl font-bold text-sm hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] hover:bg-[var(--brand-soft)]/5 transition-all flex items-center justify-center gap-2"
                  >
                    <MessageSquare size={16} /> Click here to answer
                  </button>
                )}

              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
