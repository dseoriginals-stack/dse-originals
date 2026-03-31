"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { API_URL } from "@/lib/api"

type Order = {
  id: string
  status: string
  total: number
  items: {
    id: string
    productName: string
    quantity: number
    price: number
  }[]
  createdAt: string
}

export default function OrderPage() {

  const { id } = useParams()

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /*
  ---------------- FETCH ORDER
  */

  useEffect(() => {

    async function fetchOrder() {

      try {

        const token = localStorage.getItem("token")

        const res = await fetch(`${API_URL}/orders/${id}`, {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` })
          }
        })

        const data = await res.json()

        if (!res.ok) throw new Error(data.message)

        setOrder(data)

      } catch (err: any) {

        setError(err.message || "Failed to load order")

      } finally {

        setLoading(false)

      }

    }

    if (id) fetchOrder()

  }, [id])

  /*
  ---------------- STATUS UI
  */

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "text-yellow-500"
      case "paid": return "text-green-600"
      case "shipped": return "text-blue-600"
      case "delivered": return "text-green-700"
      case "cancelled": return "text-red-500"
      default: return "text-gray-500"
    }
  }

  /*
  ---------------- LOADING
  */

  if (loading) {
    return (
      <div className="container py-20 text-center">
        Loading order...
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="container py-20 text-center">
        <p className="text-red-500">{error || "Order not found"}</p>
        <Link href="/products" className="mt-4 inline-block underline">
          Back to shop
        </Link>
      </div>
    )
  }

  return (

    <div className="bg-slate-50 min-h-screen py-16 px-4">

      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-md p-8 space-y-8">

        {/* HEADER */}

        <div className="text-center space-y-2">

          <h1 className="text-2xl font-bold">
            Order #{order.id}
          </h1>

          <p className={`font-semibold ${getStatusColor(order.status)}`}>
            {order.status.toUpperCase()}
          </p>

        </div>

        {/* TIMELINE */}

        <div className="bg-slate-50 rounded-xl p-4 text-sm space-y-2">

          <p>📝 Order placed</p>

          {order.status !== "pending" && (
            <p>💳 Payment confirmed</p>
          )}

          {(order.status === "shipped" || order.status === "delivered") && (
            <p>🚚 Shipped</p>
          )}

          {order.status === "delivered" && (
            <p>📦 Delivered</p>
          )}

        </div>

        {/* ITEMS */}

        <div className="space-y-4">

          {order.items.map(item => (

            <div
              key={item.id}
              className="flex justify-between border-b pb-3"
            >

              <div>
                <p className="font-medium">{item.productName}</p>
                <p className="text-sm text-gray-500">
                  Qty: {item.quantity}
                </p>
              </div>

              <div className="font-medium">
                ₱{(item.price * item.quantity).toLocaleString()}
              </div>

            </div>

          ))}

        </div>

        {/* TOTAL */}

        <div className="flex justify-between text-lg font-semibold pt-4 border-t">

          <span>Total</span>
          <span>₱{Number(order.total).toLocaleString()}</span>

        </div>

        {/* ACTIONS */}

        <div className="flex justify-center gap-4 pt-6">

          <Link
            href="/products"
            className="bg-black text-white px-6 py-3 rounded-xl"
          >
            Continue Shopping
          </Link>

        </div>

      </div>

    </div>

  )

}