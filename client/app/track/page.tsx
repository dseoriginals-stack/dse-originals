"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { api } from "@/lib/api"
import { 
  Search, 
  Package, 
  CreditCard, 
  Truck, 
  CheckCircle2, 
  Calendar,
  ChevronRight,
  MapPin,
  Clock,
  ArrowLeft,
  ShoppingBag,
  Download
} from "lucide-react"
import Link from "next/link"

const steps = [
  { status: "pending", label: "Order Placed", icon: Calendar, color: "bg-amber-500", desc: "We've received your request" },
  { status: "paid", label: "Payment Confirmed", icon: CreditCard, color: "bg-emerald-500", desc: "Payment processed successfully" },
  { status: "shipped", label: "Out for Delivery", icon: Truck, color: "bg-blue-500", desc: "Your package is on its way" },
  { status: "delivered", label: "Delivered", icon: CheckCircle2, color: "bg-slate-900", desc: "Parcel has arrived at destination" }
]

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TrackOrderContent />
    </Suspense>
  )
}

function TrackOrderContent() {
  const searchParams = useSearchParams()
  const [orderId, setOrderId] = useState(searchParams.get("id") || "")
  const [email, setEmail] = useState("")
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Auto-fill ID if in URL
  useEffect(() => {
    const idFromUrl = searchParams.get("id")
    if (idFromUrl) {
      setOrderId(idFromUrl)
    }
  }, [searchParams])

  async function handleTrack(e?: React.FormEvent) {
    if (e) e.preventDefault()
    if (!orderId || !email) return
    
    setLoading(true)
    setError("")
    
    try {
      const res = await api.get(`/orders/track?id=${orderId}&email=${email}`)
      setOrder(res)
    } catch (err: any) {
      setError(err.response?.data?.message || "Order not found. Please check your ID and Email.")
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }

  const currentStepIndex = order ? steps.findIndex(s => s.status === order.status) : -1

  return (
    <div className="min-h-screen bg-[#f8fafb] pb-24">
      {/* HEADER SECTION */}
      <div className="bg-white border-b pt-12 pb-16">
        <div className="container max-w-4xl mx-auto px-6">
          <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-black mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900">Track Order</h1>
              <p className="mt-2 text-slate-500">Stay updated on your DSE Originals shipment.</p>
            </div>
            {!order && (
              <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold">
                    DSE
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-6 -mt-8">
        <AnimatePresence mode="wait">
          {!order ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 md:p-12 border border-slate-100"
            >
              <form onSubmit={handleTrack} className="space-y-6 max-w-lg mx-auto">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Order ID</label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        placeholder="e.g. ord-12345"
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all outline-none"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      placeholder="Enter the email used for order"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all outline-none"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
                    {error}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 text-white font-semibold py-4 rounded-2xl shadow-lg shadow-slate-900/20 hover:bg-black transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Track Now <ChevronRight className="w-5 h-5" /></>
                  )}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* LEFT: STATUS & TIMELINE */}
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100 overflow-hidden relative">
                  <div className="flex items-center justify-between mb-10">
                    <div>
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
                        Live Progress
                      </span>
                      <h2 className="text-2xl font-bold mt-2">Status: <span className="capitalize">{order.status}</span></h2>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-400">Estimated Arrival</p>
                      <p className="font-bold text-slate-900">3-5 Business Days</p>
                    </div>
                  </div>

                  <div className="relative space-y-12 pl-4">
                    {/* Connecting Line */}
                    <div className="absolute left-[2.35rem] top-2 bottom-2 w-0.5 bg-slate-100" />
                    
                    {steps.map((step, index) => {
                      const isCompleted = index < currentStepIndex
                      const isCurrent = index === currentStepIndex
                      const isUpcoming = index > currentStepIndex
                      const Icon = step.icon

                      return (
                        <div key={step.status} className="relative flex gap-6">
                          <div className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-md ${
                            isUpcoming ? 'bg-white border border-slate-100 text-slate-300' : `${step.color} text-white`
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
                                className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-slate-900 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100"
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

                {/* EVENTS LIST */}
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
                  <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-slate-400" /> History Log
                  </h3>
                  <div className="space-y-6">
                    {order.events?.map((event: any) => (
                      <div key={event.id} className="flex gap-4 pb-6 border-b border-slate-50 last:border-0 last:pb-0">
                        <div className="text-xs text-slate-400 w-24 pt-1">
                          {new Date(event.createdAt).toLocaleDateString()}
                          <br />
                          {new Date(event.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-700 capitalize">{event.type}</p>
                          <p className="text-sm text-slate-500 mt-0.5">{event.message}</p>
                        </div>
                      </div>
                    )) || (
                      <p className="text-slate-400 italic text-center py-4">No logged events yet.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT: ORDER SUMMARY */}
              <div className="space-y-8">
                <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-xl shadow-slate-900/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <ShoppingBag className="w-24 h-24" />
                  </div>
                  <h3 className="text-xl font-bold mb-6">Order Details</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-slate-400 text-xs uppercase tracking-widest font-bold">Order Number</p>
                      <p className="font-medium mt-1 truncate">{order.id}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs uppercase tracking-widest font-bold">Transaction Date</p>
                      <p className="font-medium mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    {order.trackingNo && (
                      <div className="p-4 bg-white/10 rounded-2xl border border-white/10 mt-4">
                        <p className="text-slate-400 text-[10px] uppercase font-bold">Shipping Tracking No.</p>
                        <p className="font-mono text-sm mt-1">{order.trackingNo}</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-8 pt-8 border-t border-white/10">
                    <div className="flex justify-between items-center">
                      <p className="text-slate-400 font-medium">Total Amount paid</p>
                      <p className="text-2xl font-black">₱{Number(order.total).toLocaleString()}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setOrder(null)}
                    className="w-full mt-8 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors"
                  >
                    Track another order
                  </button>
                </div>

                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                  <h4 className="font-bold mb-4">Need Help?</h4>
                  <div className="space-y-4">
                    <a href="mailto:support@dseoriginals.com" className="flex items-center gap-3 text-sm text-slate-600 hover:text-black transition-colors">
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">@</div>
                      Contact Support
                    </a>
                    <Link href={`/orders/${order.id}/invoice`} className="flex items-center gap-3 text-sm text-slate-600 hover:text-black transition-colors">
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">
                        <Download className="w-4 h-4" />
                      </div>
                      Download Invoice
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}