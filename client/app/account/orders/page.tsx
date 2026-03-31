"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import Link from "next/link"

type Order = {
  id: string
  status: string
  total: number
  trackingNo?: string
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth()

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  if (authLoading) {
  return (
    <div className="container py-20 text-center">
      Loading user...
    </div>
  )
}

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    fetchOrders()
  }, [user])

  const fetchOrders = async () => {
    try {
      const res = await api.get("/user/me/orders")
      setOrders(res.data || [])
    } catch (err) {
      console.error("Orders fetch failed", err)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="container py-20 text-center">
        Please login to view your orders.
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container py-20 text-center">
        Loading orders...
      </div>
    )
  }

  return (
    <section className="max-w-5xl mx-auto px-6 py-20 space-y-10">
      <h1 className="text-3xl font-semibold">Your Orders</h1>

      {orders.length === 0 && (
        <div className="bg-white border border-border rounded-xl p-10 text-center">
          <p className="text-slate-500 mb-4">
            You haven't placed any orders yet.
          </p>

          <Link href="/products" className="text-primary font-medium hover:underline">
            Browse products →
          </Link>
        </div>
      )}

      <div className="space-y-6">
        {orders.map(order => (
          <Link
            href={`/account/orders/${order.id}`}
            key={order.id}
            className="block bg-white border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition"
          >
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm text-slate-500">Order</p>
              <StatusBadge status={order.status} />
            </div>

            <p className="font-semibold mb-2">{order.id}</p>

            <p className="text-sm text-slate-600">
              Total: ₱{Number(order.total).toLocaleString()}
            </p>

            <div className="mt-4">
              <OrderTimeline status={order.status} />
            </div>

            {order.trackingNo && (
              <p className="text-sm text-slate-500 mt-3">
                Tracking: {order.trackingNo}
              </p>
            )}
          </Link>
        ))}
      </div>
    </section>
  )
}

/* ---------- Status Badge ---------- */

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    paid: "bg-green-100 text-green-700",
    shipped: "bg-blue-100 text-blue-700",
    delivered: "bg-purple-100 text-purple-700",
    refunded: "bg-red-100 text-red-700",
    cancelled: "bg-slate-200 text-slate-700"
  }

  return (
    <span className={`text-xs px-3 py-1 rounded-full ${styles[status] || "bg-slate-100 text-slate-700"}`}>
      {status}
    </span>
  )
}

/* ---------- Timeline ---------- */

function OrderTimeline({ status }: { status: string }) {
  const steps = ["pending", "paid", "shipped", "delivered"]
  const currentIndex = steps.indexOf(status)

  return (
    <div className="flex items-center gap-3">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${
              index <= currentIndex ? "bg-primary" : "bg-slate-300"
            }`}
          />

          {index !== steps.length - 1 && (
            <div
              className={`w-10 h-[2px] ${
                index < currentIndex ? "bg-primary" : "bg-slate-300"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}