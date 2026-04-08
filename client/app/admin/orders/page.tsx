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
      <div className="py-20 flex justify-center items-center gap-3 text-[var(--text-muted)] font-medium">
         <svg className="animate-spin h-6 w-6 text-[var(--brand-primary)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
         Synchronizing orders...
      </div>
    )
  }

  /* =========================
     UI
  ========================= */

  return (

    <div className="space-y-8">
      
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-[var(--text-heading)] tracking-tight">Active Orders</h1>
        <p className="text-[var(--text-muted)] font-medium">Manage and fulfillment tracking for all customer purchases.</p>
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-[var(--border-light)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">

            <thead className="bg-[var(--bg-surface)] border-b border-[var(--border-light)] text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Tracking</th>
                <th className="px-6 py-4 text-center">Admin Controls</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--border-light)]">

              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-[var(--text-muted)] font-medium italic">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map(order => (
                  <tr
                    key={order.id}
                    className="hover:bg-[var(--brand-soft)]/5 transition-colors group"
                  >

                    <td className="px-6 py-5">
                      <span className="font-mono text-xs font-bold bg-[var(--bg-card)] px-2 py-1 rounded text-[var(--text-heading)] border border-[var(--border-light)]">
                        {order.id.slice(0, 13).toUpperCase()}
                      </span>
                    </td>

                    <td className="px-6 py-5 text-sm font-semibold text-[var(--text-main)]">
                      {order.user?.email || order.guestEmail || "Guest"}
                    </td>

                    <td className="px-6 py-5 text-sm font-bold text-[var(--brand-primary)]">
                      ₱{Number(order.total).toLocaleString()}
                    </td>

                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        order.status === "pending" || order.status === "processing" ? "bg-yellow-100 text-yellow-700 border-yellow-200" :
                        order.status === "completed" || order.status === "delivered" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                        order.status === "shipped" ? "bg-blue-100 text-blue-700 border-blue-200" :
                        "bg-red-100 text-red-700 border-red-200"
                      } border`}>
                        {order.status}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <input
                        placeholder="Trk No."
                        value={trackingInputs[order.id] ?? order.trackingNo ?? ""}
                        onChange={(e) =>
                          setTrackingInputs(prev => ({
                            ...prev,
                            [order.id]: e.target.value
                          }))
                        }
                        className="px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-light)] text-[var(--text-main)] text-xs font-semibold rounded-lg w-32 focus:ring-2 focus:ring-[var(--brand-accent)] focus:outline-none transition-all placeholder:text-gray-400 focus:bg-white"
                      />
                    </td>

                    <td className="px-6 py-5 text-center">
                      <div className="flex gap-2 justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => updateStatus(order.id, "shipped")}
                          className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition"
                        >
                          Ship
                        </button>
                        <button
                          onClick={() => updateStatus(order.id, "delivered")}
                          className="bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition"
                        >
                          Deliver
                        </button>
                        <button
                          onClick={() => updateStatus(order.id, "cancelled")}
                          className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}

            </tbody>

          </table>
        </div>
      </div>

    </div>

  )

}