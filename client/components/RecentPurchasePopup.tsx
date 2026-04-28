"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ShoppingBag } from "lucide-react"
import { api } from "@/lib/api"
import Image from "next/image"
import { getImageUrl } from "@/lib/image"
import { useRouter } from "next/navigation"

// Cities/Locations for mock data
const LOCATIONS = ["Manila", "Cebu City", "Davao", "Quezon City", "Makati", "Baguio", "Iloilo"]

export default function RecentPurchasePopup() {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [current, setCurrent] = useState<any | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Fetch some products to rotate
    const fetchProducts = async () => {
      try {
        const res = await api.get("/products?limit=10")
        const productList = res?.data || res
        if (Array.isArray(productList)) {
          setProducts(productList)
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
      
      // Randomly decide if it's a "Purchase" or a "Suggestion" (60/40 split)
      const type = Math.random() > 0.4 ? 'purchase' : 'suggestion'

      setCurrent({
        ...randomProduct,
        type,
        location: randomLocation,
        timeAgo: `${randomTime} min ago`,
        suggestionText: "Elevate your mission with this essential piece."
      })
      
      setIsVisible(true)

      // Auto-hide after 6.5 seconds
      setTimeout(() => setIsVisible(false), 6500)
    }

    // Initial delay (4s) + Periodic interval (18-25s)
    const initialTimer = setTimeout(triggerPopup, 4000)
    const interval = setInterval(triggerPopup, 18000 + Math.random() * 7000)

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
          onClick={() => {
            if (current.slug) {
              router.push(`/products/${current.slug}`)
              setIsVisible(false)
            }
          }}
          className="fixed bottom-24 left-4 md:bottom-10 md:left-10 z-[8000] flex items-center gap-4 bg-white/80 border-white/40 p-3 md:p-4 rounded-[1.5rem] md:rounded-[2rem] shadow-2xl backdrop-blur-3xl border shadow-slate-200/50 max-w-[280px] md:max-w-sm cursor-pointer group hover:bg-white transition-all active:scale-[0.98]"
        >
          {/* Product Thumbnail */}
          <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 ring-4 ring-white/20">
            <Image 
              src={getImageUrl(current.images?.[0]?.url || current.image || current.variants?.find((v: any) => v.image)?.image || "/placeholder.png")} 
              alt={current.name} 
              fill 
              className="object-cover transition-transform group-hover:scale-110 duration-700"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pr-4">
            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-0.5 md:mb-1">
              {current.type === 'purchase' ? (
                <span className="text-[#274C77]">Recent Purchase<span className="text-emerald-400">.</span></span>
              ) : (
                <span className="text-[var(--brand-primary)]">DSE Recommends<span className="text-indigo-400 font-black">!</span></span>
              )}
            </p>
            <h4 className="text-[11px] md:text-sm font-bold text-slate-800 line-clamp-1 leading-tight group-hover:text-[var(--brand-primary)] transition-colors">
              {current.name}
            </h4>
            <p className="text-[9px] md:text-[11px] font-medium text-slate-500">
              {current.type === 'purchase' ? (
                <>Someone in <span className="text-slate-700 font-bold">{current.location}</span> bought this {current.timeAgo}</>
              ) : (
                <span className="italic opacity-80">{current.suggestionText}</span>
              )}
            </p>
          </div>

          {/* Close Button */}
          <button 
            onClick={(e) => {
              e.stopPropagation()
              setIsVisible(false)
            }}
            className="absolute top-2 right-2 p-1 text-slate-300 hover:text-slate-600 transition-colors"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
