"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, X, Package, MessageSquare, ArrowRight, Loader2 } from "lucide-react"
import useSWR from "swr"
import { fetcher } from "@/lib/fetcher"
import Link from "next/link"
import Image from "next/image"
import { getCloudinaryBlurUrl } from "@/lib/imageUtils"

export default function SearchOverlay({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(timer)
  }, [query])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
      setQuery("")
    }
  }, [isOpen])

  const { data, error, isLoading } = useSWR(
    debouncedQuery.length >= 2 ? `/api/search?q=${debouncedQuery}` : null,
    fetcher
  )

  const results = data || { products: [], stories: [] }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-xl flex flex-col"
        >
          {/* Header */}
          <div className="container mx-auto px-6 py-8 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center gap-4 flex-1 max-w-2xl">
              <Search className="text-[var(--brand-primary)]" size={24} />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search products or stories..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-2xl font-bold text-[var(--text-heading)] placeholder:text-gray-300"
              />
            </div>
            <button
              onClick={onClose}
              className="p-3 rounded-full bg-gray-100 text-gray-500 hover:bg-[var(--brand-primary)] hover:text-white transition-all"
            >
              <X size={24} />
            </button>
          </div>

          {/* Results Area */}
          <div className="flex-1 overflow-y-auto scrollbar-hide py-12">
            <div className="container mx-auto px-6">
              {!debouncedQuery || debouncedQuery.length < 2 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                    <Search size={40} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[var(--text-heading)]">Start Typing...</h3>
                    <p className="text-[var(--text-muted)] mt-1">Search for perfumes, apparel, or community stories.</p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 max-w-xs">
                    {["Perfume", "Apparel", "Heaven's Embrace", "Community"].map(tag => (
                      <button 
                        key={tag}
                        onClick={() => setQuery(tag)}
                        className="px-4 py-2 bg-gray-50 hover:bg-[var(--brand-soft)]/20 rounded-full text-xs font-bold text-[var(--text-muted)] hover:text-[var(--brand-primary)] transition-all"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              ) : isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
                  <Loader2 className="w-8 h-8 text-[var(--brand-primary)] animate-spin" />
                  <p className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-widest">Searching the DSE Universe...</p>
                </div>
              ) : (results.products.length === 0 && results.stories.length === 0) ? (
                <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
                  <p className="text-xl font-bold text-[var(--text-heading)]">No results found for "{debouncedQuery}"</p>
                  <p className="text-[var(--text-muted)]">Try adjusting your search terms or keywords.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                  {/* Products Column */}
                  <div className="space-y-8">
                    <div className="flex items-center gap-3 border-b pb-4">
                      <Package className="text-[var(--brand-primary)]" size={20} />
                      <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[var(--text-heading)]">Products</h3>
                      <span className="ml-auto text-xs font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{results.products.length}</span>
                    </div>
                    <div className="space-y-6">
                      {results.products.map((p: any) => (
                        <Link 
                          key={p.id} 
                          href={`/products/${p.slug}`}
                          onClick={onClose}
                          className="group flex gap-4 p-4 rounded-3xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100"
                        >
                          <div className="w-20 h-20 relative rounded-2xl overflow-hidden flex-shrink-0 bg-gray-100">
                            <Image 
                              src={p.image || "/placeholder.png"} 
                              alt={p.name} 
                              fill 
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                              placeholder="blur"
                              blurDataURL={getCloudinaryBlurUrl(p.image)}
                            />
                          </div>
                          <div className="flex-1 min-w-0 py-1">
                            <h4 className="font-bold text-[var(--text-heading)] group-hover:text-[var(--brand-primary)] transition-colors line-clamp-1">{p.name}</h4>
                            <p className="text-sm font-black text-[var(--brand-primary)] mt-1">₱{p.price.toLocaleString()}</p>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 mt-2 uppercase tracking-widest">
                               Available Now
                            </div>
                          </div>
                          <div className="self-center p-2 opacity-0 group-hover:opacity-100 transition-all">
                             <ArrowRight size={18} className="text-[var(--brand-primary)]" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Stories Column */}
                  <div className="space-y-8">
                    <div className="flex items-center gap-3 border-b pb-4">
                      <MessageSquare className="text-[var(--brand-primary)]" size={20} />
                      <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[var(--text-heading)]">Stories</h3>
                      <span className="ml-auto text-xs font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{results.stories.length}</span>
                    </div>
                    <div className="space-y-6">
                      {results.stories.map((s: any) => (
                        <Link 
                          key={s.id} 
                          href={`/stories?id=${s.id}`}
                          onClick={onClose}
                          className="group flex gap-4 p-4 rounded-3xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100"
                        >
                          <div className="w-20 h-20 relative rounded-2xl overflow-hidden flex-shrink-0 bg-gray-100">
                            <Image 
                              src={s.image || "/placeholder.png"} 
                              alt={s.title} 
                              fill 
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                              placeholder="blur"
                              blurDataURL={getCloudinaryBlurUrl(s.image)}
                            />
                          </div>
                          <div className="flex-1 min-w-0 py-1 flex flex-col justify-center">
                            <h4 className="font-bold text-[var(--text-heading)] group-hover:text-[var(--brand-primary)] transition-colors line-clamp-2">{s.title}</h4>
                            <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">Community Journal</p>
                          </div>
                          <div className="self-center p-2 opacity-0 group-hover:opacity-100 transition-all">
                             <ArrowRight size={18} className="text-[var(--brand-primary)]" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Footer branding */}
          <div className="py-8 border-t border-gray-50 text-center">
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">DSE Originals Instant Discovery</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
