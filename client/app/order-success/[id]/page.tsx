"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { CheckCircle2, Package, Truck, Mail, ArrowRight, ShoppingBag } from "lucide-react"

export default function SuccessPage() {
  const { id } = useParams()

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)] px-6 py-12 relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--brand-primary)]/5 rounded-full blur-[100px] -z-10" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white max-w-xl w-full p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-[var(--brand-primary)]/5 border border-[var(--border-light)] text-center space-y-8"
      >
        {/* SUCCESS ICON */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
          className="w-20 h-20 mx-auto bg-[var(--brand-soft)]/20 rounded-2xl flex items-center justify-center text-[var(--brand-primary)]"
        >
          <CheckCircle2 size={40} strokeWidth={1.5} />
        </motion.div>

        {/* TITLE */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-[1000] text-[var(--text-heading)] tracking-tighter">
            Order Confirmed!
          </h1>
          <p className="text-[var(--text-muted)] text-sm font-bold uppercase tracking-widest">
            Order ID: <span className="text-[var(--brand-primary)]">{String(id).substring(0, 13)}...</span>
          </p>
        </div>

        {/* MESSAGE */}
        <p className="text-[var(--text-muted)] font-medium leading-relaxed">
          Thank you for choosing DSE Originals. Your journey with us has begun, and we're preparing your premium pieces with the utmost care.
        </p>

        {/* WHAT HAPPENS NEXT */}
        <div className="bg-[var(--bg-surface)] rounded-3xl p-6 text-sm text-[var(--text-main)] text-left space-y-4 border border-[var(--border-light)]">
          <p className="font-black text-[10px] uppercase tracking-[0.2em] text-[var(--brand-primary)] mb-2">Next Steps</p>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-white border border-[var(--border-light)] flex items-center justify-center text-[var(--brand-primary)] shadow-sm">
              <Package size={16} />
            </div>
            <span className="font-bold">Processing your premium order</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-white border border-[var(--border-light)] flex items-center justify-center text-[var(--brand-primary)] shadow-sm">
              <Truck size={16} />
            </div>
            <span className="font-bold">Preparing shipment via J&T Express</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-white border border-[var(--border-light)] flex items-center justify-center text-[var(--brand-primary)] shadow-sm">
              <Mail size={16} />
            </div>
            <span className="font-bold">Updates will be sent to your email</span>
          </div>
        </div>

        {/* TRUST */}
        <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <div className="w-1 h-1 rounded-full bg-emerald-500" />
          Securely Processed via Xendit
        </div>

        {/* ACTIONS */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Link
            href="/products"
            className="flex-1 btn-premium !py-4 rounded-2xl text-sm shadow-lg flex items-center justify-center gap-2 group"
          >
            <ShoppingBag size={18} />
            Continue Shopping
          </Link>

          <Link
            href={`/track?id=${id}`}
            className="flex-1 px-8 py-4 bg-white border-2 border-[var(--border-light)] rounded-2xl font-bold text-[var(--text-heading)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-all flex justify-center items-center gap-2 text-sm"
          >
            Track Order <ArrowRight size={18} />
          </Link>
        </div>
      </motion.div>
    </div>
  )
}