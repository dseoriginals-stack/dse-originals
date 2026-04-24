"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import ProductCard from "../ProductCard"
import { Sparkles } from "lucide-react"
import { motion } from "framer-motion"

interface RecommendationStripProps {
  type: "related" | "trending" | "together" | "personalized"
  productId?: string
  title?: string
  subtitle?: string
}

export default function RecommendationStrip({ 
  type, 
  productId, 
  title, 
  subtitle 
}: RecommendationStripProps) {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        setLoading(true)
        let endpoint = ""
        
        switch (type) {
          case "related": endpoint = `/recommendations/related/${productId}`; break;
          case "trending": endpoint = `/recommendations/trending`; break;
          case "together": endpoint = `/recommendations/together/${productId}`; break;
          case "personalized": endpoint = `/recommendations/personalized`; break;
        }

        const data = await api.get(endpoint)
        // Normalize data (some SQL raw queries return slightly different structures)
        const normalized = (data || []).map((p: any) => ({
          ...p,
          images: p.images || (p.image ? [{ url: p.image, isPrimary: true }] : [])
        }))
        
        setProducts(normalized)
      } catch (err) {
        console.error("Failed to load recommendations", err)
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [type, productId])

  if (!loading && products.length === 0) return null

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="container max-w-7xl mx-auto px-6">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[var(--brand-soft)] rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-[var(--brand-primary)]">
              <Sparkles size={14} /> {subtitle || "Curated for you"}
            </div>
            <h2 className="text-3xl md:text-5xl font-[1000] text-[var(--text-heading)] tracking-tighter leading-none">
              {title || "You might also love"}
            </h2>
          </div>
          
          <div className="flex gap-2">
            <div className="w-12 h-1 px-1 bg-gray-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ x: "-100%" }}
                animate={{ x: "0%" }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-full h-full bg-[var(--brand-primary)]"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-gray-50 rounded-[2rem] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {products.slice(0, 4).map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
