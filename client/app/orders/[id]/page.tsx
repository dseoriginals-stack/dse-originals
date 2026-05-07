"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { API_URL } from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, CreditCard, Truck, CheckCircle2, ShoppingBag, Download, ArrowLeft, Clock } from "lucide-react"

const steps = [
  { status: "pending", label: "Order Placed", icon: Calendar, color: "bg-amber-500", desc: "We've received your request" },
  { status: "paid", label: "Payment Confirmed", icon: CreditCard, color: "bg-emerald-500", desc: "Payment processed successfully" },
  { status: "shipped", label: "Out for Delivery", icon: Truck, color: "bg-blue-500", desc: "Your package is on its way" },
  { status: "delivered", label: "Delivered", icon: CheckCircle2, color: "bg-slate-900", desc: "Parcel has arrived at destination" }
]

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

        {/* TIMELINE TRACKER */}

        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 overflow-hidden relative shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
                Live Progress
              </span>
            </div>
          </div>

          <div className="relative space-y-10 pl-4">
            {/* Connecting Line */}
            <div className="absolute left-[2.35rem] top-2 bottom-2 w-0.5 bg-slate-100" />

            {steps.map((step, index) => {
              const currentStepIndex = steps.findIndex(s => s.status === order.status)
              const isCompleted = index < currentStepIndex
              const isCurrent = index === currentStepIndex || (order.status === 'completed' && index === steps.length - 1)
              const isUpcoming = index > currentStepIndex
              const Icon = step.icon

              return (
                <div key={step.status} className="relative flex gap-6">
                  <div className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-md ${isUpcoming ? 'bg-white border border-slate-100 text-slate-300' : `${step.color} text-white`
                    } ${isCurrent ? 'ring-4 ring-offset-2 ring-slate-100 scale-110' : ''}`}>
                    {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className={`font-bold transition-colors ${isUpcoming ? 'text-slate-400' : 'text-slate-900'}`}>
                      {step.label}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">{step.desc}</p>
                    {isCurrent && (
                      <motion.div
                        layoutId="activeStep"
                        className="mt-3 inline-flex items-center gap-2 text-[10px] font-black text-slate-900 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 uppercase tracking-widest"
                      >
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        CURRENT STAGE
                      </motion.div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
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

        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8 border-t border-gray-100">
          <Link
            href="/products"
            className="px-8 py-3.5 rounded-xl border-2 border-[var(--brand-primary)] text-[var(--brand-primary)] text-sm font-black uppercase tracking-widest hover:bg-[var(--brand-primary)]/10 transition text-center"
          >
            Continue Shopping
          </Link>
          
          <a
            href={`${API_URL}/orders/${order.id}/receipt`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3.5 rounded-xl bg-[var(--brand-primary)] text-white text-sm font-black uppercase tracking-widest shadow-lg hover:opacity-90 transition text-center"
          >
            Download Receipt
          </a>
        </div>


      </div>

    </div>

  )

}