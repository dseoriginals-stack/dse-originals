"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { API_URL } from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, CreditCard, Truck, CheckCircle2, ShoppingBag, Download, ArrowLeft, Clock, Star, Lock, UserPlus, Mail } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/lib/api"
import toast from "react-hot-toast"

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
  userId: string | null
  guestEmail: string | null
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
  const { user: authUser, refresh: refreshAuth } = useAuth()

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [password, setPassword] = useState("")
  const [converting, setConverting] = useState(false)
  const [converted, setConverted] = useState(false)

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

        {/* GUEST CONVERSION CARD */}
        {!authUser && !order.userId && !converted && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden"
          >
            {/* Background Accent */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/20 blur-[100px] rounded-full" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full" />

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400 text-black text-[10px] font-black uppercase tracking-widest rounded-full">
                  <Star size={12} fill="currentColor" /> Limited Offer
                </div>
                <h2 className="text-3xl font-black leading-tight tracking-tight">
                  Claim your <span className="text-amber-400">50 Lucky Points</span> Rewards!
                </h2>
                <p className="text-slate-400 font-medium">
                  You just earned points for this order. Set a password now to create your account and unlock your lifetime rewards.
                </p>
                
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={16} className="text-emerald-400" /> Save Order History
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={16} className="text-emerald-400" /> Priority Support
                  </div>
                </div>
              </div>

              <div className="w-full md:w-80 bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Mail size={12} /> Email Address
                  </label>
                  <div className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-300">
                    {order.guestEmail}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Lock size={12} /> Create Password
                  </label>
                  <input 
                    type="password"
                    placeholder="Enter secure password..."
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-400 outline-none transition"
                  />
                </div>

                <button 
                  onClick={async () => {
                    if (!password || password.length < 6) return toast.error("Password must be at least 6 characters")
                    setConverting(true)
                    try {
                      await api.post("/auth/convert-guest", { orderId: order.id, password })
                      toast.success("Account created! 50 Lucky Points added.")
                      setConverted(true)
                      await refreshAuth()
                    } catch (err: any) {
                      toast.error(err.message || "Conversion failed")
                    } finally {
                      setConverting(false)
                    }
                  }}
                  disabled={converting}
                  className="w-full h-14 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition shadow-xl"
                >
                  <UserPlus size={18} />
                  {converting ? "Processing..." : "Claim My Rewards"}
                </button>

                <p className="text-[10px] text-center text-slate-500 font-medium">
                  By clicking, you agree to our Terms and Privacy Policy.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {converted && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-12 bg-emerald-50 border-2 border-emerald-100 rounded-3xl p-8 text-center"
          >
            <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200">
              <Star size={32} fill="currentColor" />
            </div>
            <h3 className="text-2xl font-black text-emerald-900 tracking-tight">Welcome to the Community!</h3>
            <p className="text-emerald-700 font-medium mt-2">Your account is active and your Lucky Points are safe. Welcome home!</p>
            <Link href="/account" className="mt-6 inline-flex h-12 px-8 bg-emerald-600 text-white font-black uppercase tracking-widest rounded-xl items-center hover:bg-emerald-700 transition">
              View My Profile
            </Link>
          </motion.div>
        )}


      </div>

    </div>

  )

}