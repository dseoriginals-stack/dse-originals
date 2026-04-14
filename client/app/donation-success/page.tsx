"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Heart, ArrowRight, Share2 } from "lucide-react"

export default function DonationSuccessPage() {
  const searchParams = useSearchParams()
  const id = searchParams.get("id")

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 py-20">
      
      {/* Background Decorators */}
      <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[var(--brand-primary)]/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

      <div className="max-w-xl w-full text-center space-y-8">
        
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="w-24 h-24 mx-auto bg-gradient-to-tr from-[var(--brand-primary)] to-[var(--brand-accent)] rounded-full flex items-center justify-center text-white shadow-2xl shadow-[var(--brand-primary)]/30 mb-8"
        >
          <Heart size={48} className="fill-white/20" />
        </motion.div>

        {/* Text Content */}
        <motion.div
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ delay: 0.2 }}
           className="space-y-4"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--text-heading)] tracking-tight">
            Thank You for Your Generosity!
          </h1>
          <p className="text-lg text-[var(--text-muted)] font-medium leading-relaxed">
            Your support moves us forward. We've received your contribution and it will be used to empower our community missions and creative journals.
          </p>
          {id && (
            <div className="inline-block px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-full text-xs font-bold text-[var(--brand-primary)] tracking-widest uppercase mt-4">
              Receipt Reference: {id.substring(0, 8)}...
            </div>
          )}
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 pt-10"
        >
          <Link 
            href="/stories"
            className="flex-1 btn-premium !py-4 flex justify-center items-center gap-2 group shadow-[0_10px_30px_rgba(39,76,119,0.15)]"
          >
            Read Community Stories <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </Link>
          <Link 
            href="/products"
            className="flex-1 px-8 py-4 bg-white border-2 border-[var(--border-light)] rounded-2xl font-bold text-[var(--text-heading)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-all flex justify-center items-center gap-2"
          >
            Visit Shop
          </Link>
        </motion.div>

        {/* Share Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="pt-12 flex flex-col items-center gap-4"
        >
           <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">Inspire Others</p>
           <div className="flex gap-4">
              <button className="w-10 h-10 rounded-full bg-[var(--bg-surface)] border border-[var(--border-light)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)] transition-all">
                <Share2 size={18} />
              </button>
           </div>
        </motion.div>

      </div>
    </div>
  )
}
