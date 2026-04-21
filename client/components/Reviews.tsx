"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Star, User, Calendar } from "lucide-react"

/* =========================
   TYPES
 ========================= */

type Review = {
  id: string
  rating: number
  comment: string
  images: string[]
  createdAt: string
  user: {
    name: string
  }
}

type ReviewData = {
  total: number
  average: number
  breakdown: Record<number, number>
  reviews: Review[]
}

/* =========================
   COMPONENT
 ========================= */

export default function Reviews({ productId }: { productId: string }) {

  const [data, setData] = useState<ReviewData>({
    total: 0,
    average: 0,
    breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    reviews: []
  })

  const [loading, setLoading] = useState(true)

  const fetchReviews = async () => {
    try {
      const res = await api.get<ReviewData>(`/reviews/${productId}`)
      setData(res)
    } catch (err) {
      console.error("Failed to fetch reviews:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [productId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-gray-100 rounded-full" />
          <div className="h-4 w-32 bg-gray-100 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="mt-24 space-y-12">
      {/* HEADER SECTION */}
      <div className="grid md:grid-cols-[1fr_300px] gap-12 items-start">
        <div className="space-y-4">
          <div className="flex items-baseline gap-3">
            <h3 className="text-4xl font-black text-[var(--text-heading)] tracking-tighter">Community Feedback</h3>
            <span className="text-[var(--brand-primary)] font-black text-lg opacity-40">/ {data.total}</span>
          </div>
          <div className="flex items-center gap-4">
        <div className="flex text-amber-400">
          {[1, 2, 3, 4, 5].map(n => (
            <Star key={n} size={20} fill={n <= Math.round(data.average) ? "currentColor" : "none"} />
          ))}
        </div>
            <span className="text-xl font-bold text-[var(--text-heading)]">{data.average.toFixed(1)}</span>
            <span className="text-sm font-black uppercase tracking-widest text-[var(--text-muted)] opacity-60">Average Rating</span>
          </div>
        </div>

        {/* BREAKDOWN BARS */}
        <div className="space-y-3 bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = data.breakdown?.[star] ?? 0
            const percent = data.total === 0 ? 0 : (count / data.total) * 100
            return (
              <div key={star} className="flex items-center gap-4">
                <span className="text-[10px] font-black text-gray-400 w-4">{star}</span>
                <div className="flex-1 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[var(--brand-primary)] h-full rounded-full transition-all duration-1000" style={{ width: `${percent}%` }} />
                </div>
                <span className="text-[10px] font-black text-gray-400 w-6 text-right">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* REVIEWS LIST */}
      <div className="grid gap-8">
        {data.reviews.length === 0 ? (
          <div className="py-20 text-center bg-gray-50/30 rounded-[3rem] border-2 border-dashed border-gray-100">
            <p className="text-[var(--text-muted)] font-black uppercase tracking-widest text-xs">No entries in the log yet.</p>
          </div>
        ) : (
          data.reviews.map((r) => (
            <div key={r.id} className="bg-white border border-[var(--border-light)] rounded-[2.5rem] p-8 md:p-10 hover:shadow-xl hover:border-[var(--brand-primary)]/20 transition-all duration-500 group">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[var(--brand-soft)]/20 rounded-2xl flex items-center justify-center text-[var(--brand-primary)]">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="font-black text-[var(--text-heading)] leading-none">{r.user?.name || "Anonymous Witness"}</p>
                    <div className="flex items-center gap-2 mt-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                      <Calendar size={12} />
                      {new Date(r.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex text-amber-500 bg-amber-50 px-4 py-2 rounded-xl">
                  {[1, 2, 3, 4, 5].map(n => (
                    <Star key={n} size={14} fill={n <= r.rating ? "currentColor" : "none"} />
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <p className="text-lg font-medium text-[var(--text-heading)] leading-relaxed italic">
                  "{r.comment}"
                </p>

                {/* REVIEW PHOTOS */}
                {r.images && r.images.length > 0 && (
                  <div className="flex flex-wrap gap-3 pt-2">
                    {r.images.map((img, i) => (
                      <div key={i} className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden border-2 border-gray-50 shadow-sm cursor-zoom-in hover:scale-105 transition-transform">
                        <img src={img} alt="Evidence" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}