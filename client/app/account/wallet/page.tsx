"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"

export default function WalletPage() {

  const [points, setPoints] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPoints()
  }, [])

  const fetchPoints = async () => {
    try {
      const data = await api.get<any>("/auth/sync") // ✅ unified API
      setPoints(data?.user?.luckyPoints || 0)
    } catch (err) {
      console.error("Wallet fetch failed", err)
      setPoints(0)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-20 text-center">
        Loading wallet...
      </div>
    )
  }

  return (
    <div className="container py-10 space-y-6">

      <h1 className="text-2xl font-bold">
        Lucky Points
      </h1>

      <div className="bg-white p-6 rounded shadow">

        <p className="text-lg">
          Your Balance:
        </p>

        <p className="text-3xl font-bold text-primary">
          {points} Points
        </p>

      </div>

    </div>
  )
}