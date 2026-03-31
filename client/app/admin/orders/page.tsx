"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"

/* =========================
   TYPES
========================= */

type Order = {
  id: string
  total: number
  status: string
  trackingNo?: string
  user?: {
    email: string
  }
  guestEmail?: string
}

/* =========================
   COMPONENT
========================= */

export default function AdminOrders() {

  // ✅ Prevent any server-side execution
  if (typeof window === "undefined") return null

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({})

  /* =========================
     FETCH ORDERS
  ========================= */

  useEffect(() => {

    if (typeof window === "undefined") return

    fetchOrders()

  }, [])

  async function fetchOrders() {
    try {
      const data = await api.get<Order[]>("/orders")

      // ✅ Defensive fallback
      setOrders(data || [])

    } catch (err) {
      console.error("Failed to load orders", err)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  /* =========================
     UPDATE STATUS
  ========================= */

  async function updateStatus(id: string, status: string) {
    try {
      await api.put(`/orders/${id}/status`, {
        status,
        trackingNo: trackingInputs[id] || undefined
      })

      fetchOrders()

    } catch (err) {
      console.error("Status update failed", err)
    }
  }

  /* =========================
     LOADING STATE
  ========================= */

  if (loading) {
    return (
      <div className="py-20 text-center">
        Loading orders...
      </div>
    )
  }

  /* =========================
     UI
  ========================= */

  return (

    <div className="space-y-8">

      <h1 className="text-3xl font-bold">
        Orders
      </h1>

      <div className="overflow-x-auto">
        <table className="w-full border border-slate-800 rounded-xl overflow-hidden">

          <thead className="bg-slate-900 border-b border-slate-800">
            <tr>
              <th className="p-3 text-left">Order</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Total</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Tracking</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>

            {orders.map(order => (

              <tr
                key={order.id}
                className="border-b border-slate-800 hover:bg-slate-900"
              >

                <td className="p-3 text-sm text-slate-300">
                  {order.id}
                </td>

                <td className="p-3 text-sm text-slate-300">
                  {order.user?.email || order.guestEmail || "Guest"}
                </td>

                <td className="p-3 text-sm text-slate-300">
                  ₱{Number(order.total).toLocaleString()}
                </td>

                <td className="p-3 text-sm text-slate-300">
                  {order.status}
                </td>

                <td className="p-3">
                  <input
                    placeholder="Tracking #"
                    value={trackingInputs[order.id] ?? order.trackingNo ?? ""}
                    onChange={(e) =>
                      setTrackingInputs(prev => ({
                        ...prev,
                        [order.id]: e.target.value
                      }))
                    }
                    className="p-2 bg-slate-800 text-white text-sm rounded w-40"
                  />
                </td>

                <td className="p-3 flex gap-2 flex-wrap">

                  <button
                    onClick={() => updateStatus(order.id, "shipped")}
                    className="text-blue-400 hover:underline"
                  >
                    Ship
                  </button>

                  <button
                    onClick={() => updateStatus(order.id, "delivered")}
                    className="text-green-400 hover:underline"
                  >
                    Deliver
                  </button>

                  <button
                    onClick={() => updateStatus(order.id, "cancelled")}
                    className="text-red-400 hover:underline"
                  >
                    Cancel
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>
      </div>

    </div>

  )

}