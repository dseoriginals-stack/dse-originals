"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingBag, X } from "lucide-react"
import { api } from "@/lib/api"
import Image from "next/image"

// Cities/Locations for mock data
const LOCATIONS = ["Manila", "Cebu City", "Davao", "Quezon City", "Makati", "Baguio", "Iloilo"]

export default function RecentPurchasePopup() {
  const [products, setProducts] = useState<any[]>([])
  const [current, setCurrent] = useState<any | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Fetch some products to rotate
    const fetchProducts = async () => {
      try {
        const res = await api.get("/products?limit=10")
        if (res && Array.isArray(res)) {
          setProducts(res)
        }
      } catch (e) {
        console.error("Popup fetch failed", e)
      }
    }
    fetchProducts()
  }, [])

  useEffect(() => {
    if (products.length === 0) return

    const triggerPopup = () => {
      const randomProduct = products[Math.floor(Math.random() * products.length)]
      const randomLocation = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)]
      const randomTime = Math.floor(Math.random() * 58) + 1

      setCurrent({
        ...randomProduct,
        location: randomLocation,
        timeAgo: `${randomTime} min ago`
      })
      
      setIsVisible(true)

      // Auto-hide after 6 seconds
      setTimeout(() => setIsVisible(false), 6000)
    }

    // Initial delay + Periodic interval (15-25s)
    const initialTimer = setTimeout(triggerPopup, 10000)
    const interval = setInterval(triggerPopup, 20000 + Math.random() * 5000)

    return () => {
      clearTimeout(initialTimer)
      clearInterval(interval)
    }
  }, [products])

  return (
    <AnimatePresence>
      {isVisible && current && (
        <motion.div
          initial={{ opacity: 0, x: -50, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
          className="fixed bottom-24 left-4 md:bottom-10 md:left-10 z-[8000] flex items-center gap-4 bg-white/80 backdrop-blur-2xl border border-white/40 p-3 md:p-4 rounded-[1.5rem] md:rounded-[2rem] shadow-2xl shadow-slate-200/50 max-w-[280px] md:max-w-sm"
        >
          {/* Product Thumbnail */}
          <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
            {current.images?.[0]?.url ? (
              <Image 
                src={current.images[0].url} 
                alt={current.name} 
                fill 
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300">
                <ShoppingBag size={20} />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pr-4">
            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#274C77] mb-0.5 md:mb-1">
              Recent Purchase<span className="text-emerald-400">.</span>
            </p>
            <h4 className="text-[11px] md:text-sm font-bold text-slate-800 line-clamp-1 leading-tight">
              {current.name}
            </h4>
            <p className="text-[9px] md:text-[11px] font-medium text-slate-500">
              Someone in <span className="text-slate-700 font-bold">{current.location}</span> bought this {current.timeAgo}
            </p>
          </div>

          {/* Close Button */}
          <button 
            onClick={() => setIsVisible(false)}
            className="absolute top-2 right-2 p-1 text-slate-300 hover:text-slate-600 transition-colors"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
