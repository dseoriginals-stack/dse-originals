"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { api } from "@/lib/api"

type Order = {
  id: string
  status: string
  total: number
  trackingNo?: string
  shippingAddr?: string
  address?: {
    fullName: string
    street: string
    barangay: string
    city: string
    province: string
  }
  items: {
    id: string
    productName: string
    quantity: number
    price: number
  }[]
}

export default function OrderDetailsPage() {
  const params = useParams()
  const orderId = params?.id as string | undefined

  const [order, setOrder] = useState<Order | null>(null)
  const [tracking, setTracking] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!orderId) return
    fetchOrder()
  }, [orderId])

  const fetchOrder = async () => {
    try {
      const [orderRes, trackingRes] = await Promise.all([
        api.get(`/orders/${orderId}`),
        api.get(`/orders/${orderId}/tracking`)
      ])

      setOrder(orderRes.data) // ✅ FIX
      setTracking(trackingRes.data?.events || []) // ✅ FIX
    } catch (err) {
      console.error("Order fetch failed", err)
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-20 text-center">
        Loading order...
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container py-20 text-center">
        Order not found
      </div>
    )
  }

  return (
    <section className="max-w-5xl mx-auto px-6 py-20 space-y-10">
      <h1 className="text-3xl font-semibold">Order Details</h1>

      {/* ORDER META */}
      <div className="bg-white border border-border rounded-xl p-6">
        <p className="text-sm text-slate-500">Order ID</p>

        <p className="font-semibold mb-3">{order.id}</p>

        <span
          className={`inline-block text-xs px-3 py-1 rounded-full ${
            order.status === "paid"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {order.status}
        </span>
      </div>

      {/* ITEMS */}
      <div className="bg-white border border-border rounded-xl p-6 space-y-6">
        <h2 className="text-xl font-semibold">Items</h2>

        {(order.items || []).map(item => (
          <div key={item.id} className="flex justify-between border-b pb-4">
            <div>
              <p className="font-medium">{item.productName}</p>
              <p className="text-sm text-slate-500">
                Quantity: {item.quantity}
              </p>
            </div>

            <p className="font-medium">
              ₱{Number(item.price).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* TOTAL */}
      <div className="bg-white border border-border rounded-xl p-6">
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>₱{Number(order.total).toLocaleString()}</span>
        </div>
      </div>

      {/* ADDRESS */}
      <div className="bg-white border border-border rounded-xl p-6 space-y-2">
        <h2 className="text-lg font-semibold">Shipping Address</h2>

        {order.address ? (
          <>
            <p>{order.address.fullName}</p>
            <p className="text-sm text-slate-600">
              {order.address.street}, {order.address.barangay}
            </p>
            <p className="text-sm text-slate-600">
              {order.address.city}, {order.address.province}
            </p>
          </>
        ) : (
          <p className="text-slate-500">{order.shippingAddr}</p>
        )}

        {order.trackingNo && (
          <p className="text-sm text-slate-500 mt-2">
            Tracking: {order.trackingNo}
          </p>
        )}
      </div>

      {/* INVOICE */}
      <div>
        <a
          href={`${process.env.NEXT_PUBLIC_API_URL}/orders/${order.id}/invoice`}
          className="inline-block bg-primary text-white px-6 py-3 rounded-xl"
        >
          Download Invoice
        </a>
      </div>
    </section>
  )
}