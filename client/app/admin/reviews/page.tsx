"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Trash2, Star } from "lucide-react"

type Review = {
  id: string
  rating: number
  comment: string
  createdAt: string
  user: {
    name: string
    email: string
  }
  product: {
    name: string
  }
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const data = await api.get<Review[]>("/admin/reviews")
      setReviews(data)
    } catch (err: any) {
      setError(err.message || "Failed to load reviews.")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return

    try {
      await api.delete(`/admin/reviews/${id}`)
      setReviews((prev) => prev.filter((r) => r.id !== id))
    } catch (err: any) {
      alert("Failed to delete review: " + err.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-[var(--text-heading)] tracking-tight">Manage Reviews</h1>
        <div className="px-4 py-2 bg-[var(--brand-soft)]/20 text-[var(--brand-primary)] rounded-full text-sm font-bold tracking-widest shadow-sm">
          {reviews.length} TOTAL REVIEWS
        </div>
      </div>

      <p className="text-[var(--text-muted)] mt-1 font-medium pb-4 border-b border-[var(--border-light)]">
        Review customer feedback across all premium products. Monitor satisfaction and manage abusive comments.
      </p>

      {loading ? (
        <div className="text-[var(--text-muted)] font-medium flex items-center gap-3">
           <svg className="animate-spin h-5 w-5 text-[var(--brand-primary)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
           Loading database...
        </div>
      ) : error ? (
        <div className="text-red-500 font-medium bg-red-50 p-4 rounded-xl border border-red-100">{error}</div>
      ) : reviews.length === 0 ? (
        <div className="text-[var(--text-muted)] italic">No reviews found.</div>
      ) : (
        <div className="grid gap-6">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white/80 backdrop-blur-md rounded-2xl border border-[var(--border-light)] p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6 justify-between items-start">
              
              <div className="space-y-4 flex-1">
                {/* Header */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[var(--text-heading)]">{r.user.name}</span>
                    <span className="text-[var(--text-muted)]">({r.user.email})</span>
                  </div>
                  <span className="text-xs text-[var(--text-muted)]">
                    {new Date(r.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>

                {/* Rating & Product */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-md border border-yellow-100">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < r.rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[var(--brand-primary)] bg-[var(--brand-soft)]/10 px-3 py-1 rounded-full">
                    {r.product.name}
                  </span>
                </div>

                {/* Comment */}
                <p className="text-[var(--text-main)] leading-relaxed bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border-light)] text-sm">
                  &quot;{r.comment}&quot;
                </p>
              </div>

              {/* Actions */}
              <button
                onClick={() => handleDelete(r.id)}
                className="self-end md:self-center bg-red-50 hover:bg-red-500 text-red-500 hover:text-white p-3 rounded-xl transition-colors shadow-sm focus:ring-2 focus:ring-red-200 outline-none"
                title="Delete Review"
              >
                <Trash2 size={18} />
              </button>

            </div>
          ))}
        </div>
      )}
    </div>
  )
}
