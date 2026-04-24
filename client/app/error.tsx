"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { AlertCircle, RefreshCw, Home } from "lucide-react"
import Button from "@/components/ui/Button"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service like Sentry
    console.error("Application Error:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Animated Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-32 h-32 mx-auto"
        >
          <div className="absolute inset-0 bg-rose-500/10 rounded-full animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center text-rose-500">
            <AlertCircle size={64} strokeWidth={1.5} />
          </div>
        </motion.div>

        {/* Text Content */}
        <div className="space-y-3">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black text-[var(--text-heading)] tracking-tighter"
          >
            Something Went <span className="text-rose-500">Wrong</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[var(--text-muted)] font-medium leading-relaxed"
          >
            An unexpected error occurred while processing your request. Our team has been notified.
          </motion.p>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button 
            variant="rose" 
            onClick={() => reset()}
            className="w-full sm:w-auto flex items-center gap-2"
          >
            <RefreshCw size={18} />
            Try Again
          </Button>
          
          <Link href="/">
            <Button variant="ghost" className="w-full sm:w-auto flex items-center gap-2">
              <Home size={18} />
              Return Home
            </Button>
          </Link>
        </motion.div>

        {/* Error Details (Developer Only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left overflow-auto max-h-40">
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-2">Technical Details</p>
            <p className="text-xs font-mono text-rose-600 leading-relaxed whitespace-pre">
              {error.message}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
