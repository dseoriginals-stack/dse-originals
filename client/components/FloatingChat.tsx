"use client"

import { MessageCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"

export default function FloatingChat() {
  const [isHovered, setIsHovered] = useState(false)

  // OFFICIAL FB PAGE LINK
  const FB_PAGE_URL = "https://www.facebook.com/DSEoriginals"

  return (
    <div className="fixed bottom-8 right-8 z-[9999]">
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.8 }}
            className="absolute bottom-full right-0 mb-4 bg-white/90 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-2xl shadow-2xl shadow-blue-500/10 pointer-events-none"
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">
              Contact us on FB<span className="text-[var(--brand-primary)]">.</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.a
        href={FB_PAGE_URL}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        whileHover={{ 
          scale: 1.1, 
          y: -5,
          rotate: [0, -5, 5, 0],
          transition: { duration: 0.3 }
        }}
        whileTap={{ scale: 0.9 }}
        className="
          flex h-16 w-16 items-center justify-center rounded-[1.75rem]
          bg-gradient-to-tr from-[#006AFF] to-[#00B2FF]
          text-white shadow-[0_12px_24px_rgba(0,106,255,0.3)]
          ring-4 ring-white/20
        "
      >
        <MessageCircle size={32} strokeWidth={2.5} />
        
        {/* Pulsing notification dot */}
        <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-emerald-400 border-2 border-white animate-pulse" />
      </motion.a>
    </div>
  )
}
