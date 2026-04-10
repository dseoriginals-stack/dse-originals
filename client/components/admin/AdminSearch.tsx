"use client"

import { useState, useEffect, useRef } from "react"
import { Search, Package, ShoppingCart, Users, X, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

type SearchResult = {
  id: string
  type: "product" | "order" | "user"
  title: string
  subtitle: string
  link: string
}

export default function AdminSearch() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }

    // Mock search logic - in real app, call a global search API
    const items: SearchResult[] = [
      { id: "p1", type: "product", title: "Maritime Polo Shirt", subtitle: "Cat: Shirts · SKU: MP-001", link: "/admin/products" },
      { id: "o1", type: "order", title: "Order #88A21", subtitle: "Customer: Juan Dela Cruz · ₱2,450", link: "/admin/orders" },
      { id: "u1", type: "user", title: "Juan Dela Cruz", subtitle: "juan.dc@example.com · Regular Buyer", link: "/admin/users" }
    ]

    setResults(items.filter(i => i.title.toLowerCase().includes(query.toLowerCase()) || i.subtitle.toLowerCase().includes(query.toLowerCase())))
  }, [query])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="w-full max-w-md relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--brand-primary)] transition-colors">
        <Search size={16} strokeWidth={2.5} />
      </div>
      <input
        placeholder="Search orders, SKU, or user..."
        value={query}
        onFocus={() => setIsOpen(true)}
        onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
        className="
          w-full pl-11 pr-10 py-3 rounded-2xl border border-[var(--border-light)]
          bg-[var(--bg-surface)] focus:bg-white focus:outline-none focus:ring-2
          focus:ring-[var(--brand-accent)]/30 focus:border-[var(--brand-primary)] 
          transition-all duration-300 placeholder:text-gray-400 text-sm font-bold
          shadow-inner drop-shadow-sm
        "
      />
      {query && (
        <button 
          onClick={() => setQuery("")}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition"
        >
          <X size={14} />
        </button>
      )}

      {isOpen && query.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-[var(--border-light)] overflow-hidden z-[110] animate-fade-in">
          <div className="p-4 bg-[var(--bg-surface)] border-b border-[var(--border-light)] flex justify-between items-center">
             <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Search Results for "{query}"</span>
             <span className="text-[9px] font-black uppercase tracking-widest text-[var(--brand-primary)]">{results.length} matched</span>
          </div>
          
          <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
            {results.length === 0 ? (
              <div className="p-10 text-center text-[var(--text-muted)] italic text-xs font-bold">No records matched your query</div>
            ) : (
              results.map(r => (
                <div 
                  key={r.id}
                  onClick={() => { router.push(r.link); setQuery(""); setIsOpen(false); }}
                  className="p-4 flex items-center gap-4 hover:bg-gray-50 transition cursor-pointer group/item"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-[var(--brand-primary)] group-hover/item:bg-[var(--brand-primary)] group-hover/item:text-white transition">
                    {r.type === 'product' && <Package size={18}/>}
                    {r.type === 'order' && <ShoppingCart size={18}/>}
                    {r.type === 'user' && <Users size={18}/>}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-[var(--text-heading)] leading-tight">{r.title}</p>
                    <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-0.5">{r.subtitle}</p>
                  </div>
                  <ArrowRight size={14} className="text-gray-300 group-hover/item:text-[var(--brand-primary)] group-hover/item:translate-x-1 transition-all" />
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
