"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import { MessageSquare, User, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react"
import toast from "react-hot-toast"
import { format } from "date-fns"

export default function ProductQA({ productId }: { productId: string }) {
  const { user } = useAuth() as any
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newQuestion, setNewQuestion] = useState("")
  const [guestName, setGuestName] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchQuestions()
  }, [productId])

  const fetchQuestions = async () => {
    try {
      const res = await api.get(`/products/${productId}/questions`)
      setQuestions(res || [])
    } catch (err) {
      console.error("Failed to fetch questions", err)
    } finally {
      setLoading(false)
    }
  }

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newQuestion.trim()) return
    
    // If not logged in and didn't provide a guest name, alert them
    if (!user && !guestName.trim()) {
      toast.error("Please provide a name or login to ask a question.")
      return
    }

    setSubmitting(true)
    try {
      await api.post(`/products/${productId}/questions`, {
        question: newQuestion,
        guestName: guestName
      })
      toast.success("Question submitted successfully!")
      setNewQuestion("")
      setGuestName("")
      fetchQuestions()
    } catch (err) {
      toast.error("Failed to submit question.")
    } finally {
      setSubmitting(false)
    }
  }

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="bg-white rounded-3xl p-6 md:p-10 border border-slate-100 shadow-sm">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-[var(--brand-soft)]/10 flex items-center justify-center text-[var(--brand-primary)]">
          <MessageSquare size={20} />
        </div>
        <div>
          <h3 className="text-xl font-[1000] text-[var(--text-heading)] tracking-tighter">Product Q&A</h3>
          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Questions & Answers</p>
        </div>
      </div>

      {/* QUESTION FORM */}
      <form onSubmit={handleAsk} className="mb-10 bg-slate-50 p-6 rounded-2xl border border-slate-100">
        <h4 className="text-sm font-bold text-slate-700 mb-4">Have a question about this product?</h4>
        
        {!user && (
          <input
            type="text"
            placeholder="Your Name (Guest)"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            required
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-[var(--brand-primary)] mb-4 transition-all"
          />
        )}
        
        <div className="flex gap-4 items-start">
          <textarea
            placeholder="E.g., What are the exact dimensions?"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            required
            rows={2}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-[var(--brand-primary)] transition-all resize-none custom-scrollbar"
          />
          <button 
            type="submit" 
            disabled={submitting}
            className="btn-premium !py-3 !px-6 h-auto shadow-md shrink-0 whitespace-nowrap disabled:opacity-50"
          >
            {submitting ? "..." : "Ask"}
          </button>
        </div>
      </form>

      {/* QUESTIONS LIST */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => <div key={i} className="h-20 bg-slate-50 animate-pulse rounded-2xl" />)}
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-2xl">
          <MessageSquare size={32} className="mx-auto text-slate-200 mb-3" />
          <p className="text-slate-400 font-bold text-sm">No questions yet. Be the first to ask!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => {
            const isExpanded = expanded[q.id]
            const hasAnswer = !!q.answer
            
            return (
              <div key={q.id} className="border border-slate-100 rounded-2xl overflow-hidden bg-white hover:border-slate-200 transition-all">
                {/* QUESTION HEADER */}
                <div 
                  className="p-5 cursor-pointer flex gap-4 items-start"
                  onClick={() => toggleExpand(q.id)}
                >
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-400 mt-1">
                    <User size={16} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-slate-900 text-sm">
                        {q.user?.name || q.guestName || "Anonymous"}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {format(new Date(q.createdAt), "MMM d, yyyy")}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 font-medium leading-relaxed">{q.question}</p>
                    
                    {!hasAnswer && (
                      <div className="mt-2 text-[10px] font-black uppercase text-amber-500 tracking-wider">
                        Pending Staff Answer
                      </div>
                    )}
                  </div>
                  <div className="text-slate-300 mt-2">
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>

                {/* ANSWER SECTION */}
                {isExpanded && hasAnswer && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-50 ml-12">
                    <div className="bg-[var(--brand-soft)]/5 rounded-xl p-4 border border-[var(--brand-primary)]/10 relative">
                      <div className="absolute top-4 right-4 text-[var(--brand-primary)]/40">
                        <CheckCircle2 size={18} />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)] mb-2">
                        Official DSE Answer
                      </p>
                      <p className="text-sm text-slate-700 font-medium leading-relaxed">
                        {q.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
