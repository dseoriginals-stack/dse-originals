"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"

/* =========================
   TYPES
========================= */

type Review = {
  id: string
  rating: number
  comment: string
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
    breakdown: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    },
    reviews: []
  })

  const [loading, setLoading] = useState(true)

  /* =========================
     FETCH
  ========================= */

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

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return <div>Loading reviews...</div>
  }

  /* =========================
     UI
  ========================= */

  return (

    <div className="mt-16">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

        <div>

          <h3 className="text-2xl font-semibold">
            Reviews ({data.total})
          </h3>

          <div className="flex items-center gap-2 mt-1">

            <div className="text-yellow-500 text-lg">
              {"★".repeat(Math.round(data.average))}
            </div>

            <span className="text-sm text-gray-600">
              {data.average.toFixed(1)} out of 5
            </span>

          </div>

        </div>

        {/* BREAKDOWN */}
        <div className="w-full md:w-64 space-y-2">

          {[5, 4, 3, 2, 1].map((star) => {

            const count = data.breakdown?.[star] ?? 0

            const percent =
              data.total === 0
                ? 0
                : (count / data.total) * 100

            return (

              <div key={star} className="flex items-center gap-2">

                <span className="text-sm w-6">
                  {star}★
                </span>

                <div className="flex-1 bg-gray-200 h-2 rounded">

                  <div
                    className="bg-yellow-500 h-2 rounded"
                    style={{ width: `${percent}%` }}
                  />

                </div>

                <span className="text-xs text-gray-500 w-8">
                  {count}
                </span>

              </div>

            )

          })}

        </div>

      </div>

      {/* REVIEWS LIST */}
      <div className="mt-8 space-y-6">

        {data.reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet.</p>
        ) : (
          data.reviews.map((r) => (

            <div key={r.id} className="border rounded-xl p-4">

              <div className="flex justify-between items-center">

                <span className="font-medium">
                  {r.user?.name || "Anonymous"}
                </span>

                <span className="text-yellow-500">
                  {"★".repeat(r.rating)}
                </span>

              </div>

              <p className="text-sm text-gray-600 mt-2">
                {r.comment}
              </p>

            </div>

          ))
        )}

      </div>

    </div>

  )
}