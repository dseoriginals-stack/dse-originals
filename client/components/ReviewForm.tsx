"use client"

import { useState } from "react"
import { api } from "@/lib/api"

export default function ReviewForm({
  productId,
  onSuccess
}: {
  productId: string
  onSuccess?: () => void
}) {

  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)

  const submit = async () => {

    try {

      setLoading(true)

      await api.post("/reviews", {
        productId,
        rating,
        comment
      })

      setComment("")
      setRating(5)

      onSuccess?.()

    } catch (err: any) {

      alert(err.message)

    } finally {

      setLoading(false)

    }

  }

  return (

    <div className="mt-10 border rounded-xl p-4">

      <h4 className="font-semibold mb-3">
        Write a Review
      </h4>

      <select
        value={rating}
        onChange={e => setRating(Number(e.target.value))}
        className="border p-2 rounded"
      >
        {[5,4,3,2,1].map(n => (
          <option key={n}>{n}</option>
        ))}
      </select>

      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Share your experience..."
        className="w-full border p-2 rounded mt-3"
      />

      <button
        onClick={submit}
        disabled={loading}
        className="mt-3 bg-black text-white px-4 py-2 rounded"
      >
        {loading ? "Submitting..." : "Submit Review"}
      </button>

    </div>

  )

}