"use client"

import { useState, useEffect, useRef } from "react"
import { Search, Package, ShoppingCart, User, X, Loader2, Command } from "lucide-react"
import { api } from "@/lib/api"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

type SearchResult = {
  id: string
  title: string
  subtitle: string
  type: 'order' | 'product' | 'user'
  link: string
}

type SearchResponse = {
  orders: SearchResult[]
  products: SearchResult[]
  users: SearchResult[]
}

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  // Keyboard shortcut listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === "Escape") {
        setIsOpen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Search logic with debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults(null)
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await api.get<SearchResponse>(`/admin/search?q=${encodeURIComponent(query)}`)
        setResults(data)
        setSelectedIndex(0)
      } catch (err) {
        console.error("Search failed", err)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const allResults = results ? [
    ...results.orders,
    ...results.products,
    ...results.users
  ] : []

  const handleSelect = (result: SearchResult) => {
    router.push(result.link)
    setIsOpen(false)
    setQuery("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex(prev => (prev + 1) % allResults.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex(prev => (prev - 1 + allResults.length) % allResults.length)
    } else if (e.key === "Enter" && allResults[selectedIndex]) {
      handleSelect(allResults[selectedIndex])
    }
  }

  return (
    <>
      {/* TRIGGER BUTTON (Visual Cue) */}
      <button 
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center gap-3 px-4 py-2.5 bg-gray-50 border border-[var(--border-light)] rounded-2xl text-gray-400 hover:border-[var(--brand-primary)] hover:bg-white transition-all w-64 shadow-inner"
      >
        <Search size={16} />
        <span className="text-xs font-bold flex-1 text-left">Search anything...</span>
        <div className="flex items-center gap-1 bg-white border border-gray-100 px-1.5 py-0.5 rounded-lg text-[9px] font-black shadow-sm">
          <Command size={10} /> K
        </div>
      </button>

      {/* OVERLAY MODAL */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[500] flex items-start justify-center pt-[10vh] px-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-[var(--text-heading)]/40 backdrop-blur-sm" 
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="relative bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden border border-white/20"
            >
              {/* SEARCH INPUT AREA */}
              <div className="p-6 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
                <Search className={loading ? "animate-pulse text-[var(--brand-primary)]" : "text-gray-400"} size={22} />
                <input 
                  ref={inputRef}
                  placeholder="Find orders, products, or users..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent border-none outline-none text-lg font-bold text-[var(--text-heading)] placeholder:text-gray-300"
                />
                {loading && <Loader2 className="animate-spin text-[var(--brand-primary)]" size={20} />}
                {!loading && query && (
                  <button onClick={() => setQuery("")} className="p-1 hover:bg-gray-100 rounded-lg transition">
                    <X size={18} className="text-gray-400" />
                  </button>
                )}
              </div>

              {/* RESULTS AREA */}
              <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
                {!query && (
                  <div className="py-12 text-center">
                    <div className="w-16 h-16 bg-[var(--brand-soft)]/20 text-[var(--brand-primary)] rounded-full flex items-center justify-center mx-auto mb-4">
                      <Command size={28} />
                    </div>
                    <p className="text-sm font-black text-[var(--text-heading)] uppercase tracking-widest">Global Search</p>
                    <p className="text-xs text-[var(--text-muted)] font-bold mt-1">Type to search across the entire store database</p>
                  </div>
                )}

                {query && results && allResults.length === 0 && !loading && (
                  <div className="py-12 text-center text-gray-400">
                    <p className="text-sm font-bold italic">No records found for "{query}"</p>
                  </div>
                )}

                {results && (
                  <div className="space-y-6 pb-4">
                    {/* ORDERS */}
                    {results.orders.length > 0 && (
                      <SearchSection title="Orders" icon={<ShoppingCart size={14}/>}>
                        {results.orders.map((res, i) => (
                          <SearchItem 
                            key={res.id} 
                            result={res} 
                            active={allResults.indexOf(res) === selectedIndex}
                            onClick={() => handleSelect(res)} 
                          />
                        ))}
                      </SearchSection>
                    )}

                    {/* PRODUCTS */}
                    {results.products.length > 0 && (
                      <SearchSection title="Products" icon={<Package size={14}/>}>
                        {results.products.map((res, i) => (
                          <SearchItem 
                            key={res.id} 
                            result={res} 
                            active={allResults.indexOf(res) === selectedIndex}
                            onClick={() => handleSelect(res)} 
                          />
                        ))}
                      </SearchSection>
                    )}

                    {/* USERS */}
                    {results.users.length > 0 && (
                      <SearchSection title="Users" icon={<User size={14}/>}>
                        {results.users.map((res, i) => (
                          <SearchItem 
                            key={res.id} 
                            result={res} 
                            active={allResults.indexOf(res) === selectedIndex}
                            onClick={() => handleSelect(res)} 
                          />
                        ))}
                      </SearchSection>
                    )}
                  </div>
                )}
              </div>

              {/* FOOTER HINTS */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                <div className="flex gap-4">
                  <span className="flex items-center gap-1.5"><kbd className="bg-white border border-gray-200 px-1.5 py-0.5 rounded shadow-sm text-gray-600">Enter</kbd> Select</span>
                  <span className="flex items-center gap-1.5"><kbd className="bg-white border border-gray-200 px-1.5 py-0.5 rounded shadow-sm text-gray-600">↑↓</kbd> Navigate</span>
                </div>
                <span>Press <kbd className="bg-white border border-gray-200 px-1.5 py-0.5 rounded shadow-sm text-gray-600">Esc</kbd> to close</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

function SearchSection({ title, icon, children }: any) {
  return (
    <div>
      <div className="px-4 mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--brand-primary)] opacity-60">
        {icon} {title}
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  )
}

function SearchItem({ result, active, onClick }: { result: SearchResult, active: boolean, onClick: () => void }) {
  const IconMap = {
    order: ShoppingCart,
    product: Package,
    user: User
  }
  const Icon = IconMap[result.type]

  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all ${active ? 'bg-[var(--brand-primary)] text-white shadow-lg shadow-[var(--brand-primary)]/20 translate-x-2' : 'hover:bg-gray-50 text-[var(--text-heading)]'}`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'}`}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-black text-sm truncate ${active ? 'text-white' : 'text-[var(--text-heading)]'}`}>{result.title}</p>
        <p className={`text-[10px] font-bold mt-0.5 truncate ${active ? 'text-white/70' : 'text-[var(--text-muted)]'}`}>{result.subtitle}</p>
      </div>
      {active && <div className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-1 rounded-lg">Go →</div>}
    </button>
  )
}
