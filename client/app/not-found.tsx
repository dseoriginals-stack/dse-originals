"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Home, ArrowLeft, Search } from "lucide-react"
import Button from "@/components/ui/Button"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Animated Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="relative w-32 h-32 mx-auto"
        >
          <div className="absolute inset-0 bg-[var(--brand-primary)]/10 rounded-full animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center text-[var(--brand-primary)]">
            <Search size={64} strokeWidth={1.5} />
          </div>
        </motion.div>

        {/* Text Content */}
        <div className="space-y-3">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-black text-[var(--text-heading)] tracking-tighter"
          >
            Lost in the <span className="text-[var(--brand-primary)]">DSE</span> Universe?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-[var(--text-muted)] font-medium leading-relaxed"
          >
            The page you are looking for has vanished or never existed. Let's get you back on track.
          </motion.p>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/">
            <Button variant="primary" className="w-full sm:w-auto flex items-center gap-2">
              <Home size={18} />
              Return Home
            </Button>
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-400 hover:text-[var(--brand-primary)] transition-colors px-6 py-3"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </motion.div>

        {/* Subtle Brand Watermark */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.6 }}
          className="pt-12 text-[10px] font-black uppercase tracking-[0.3em] text-slate-300"
        >
          DSE Originals • Est. 2024
        </motion.div>
      </div>
    </div>
  )
}
