"use client"

import { useEffect, useState, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { SlidersHorizontal, ArrowUpDown, ChevronDown, LayoutGrid, X, Filter } from "lucide-react"

import ProductCard from "@/components/ProductCard"
import CategoryFilter from "@/components/CategoryFilter"
import PriceFilter from "@/components/PriceFilter"
import Modal from "@/components/ui/Modal"

import { api } from "@/lib/api"
import { transformProductToCard } from "@/lib/transformProduct"
import { ProductFull, ProductCardType } from "@/types/product"

type Props = {
  initialProducts: ProductFull[]
}

export default function ProductsClient({ initialProducts }: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const searchQuery = searchParams.get("search") || ""
  const categoryQuery = searchParams.get("category") || ""
  const minPrice = searchParams.get("minPrice") || ""
  const maxPrice = searchParams.get("maxPrice") || ""

  const [products, setProducts] = useState<ProductFull[]>(initialProducts || [])
  const [loading, setLoading] = useState(false)
  const [sort, setSort] = useState("latest")
  const [openDrawer, setOpenDrawer] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    async function fetchProducts() {
      try {
        if (
          !categoryQuery &&
          !minPrice &&
          !maxPrice &&
          !searchQuery &&
          initialProducts?.length
        ) {
          setProducts(initialProducts)
          return
        }

        setLoading(true)

        const query = new URLSearchParams()
        if (categoryQuery) query.append("category", categoryQuery)
        if (minPrice) query.append("minPrice", minPrice)
        if (maxPrice) query.append("maxPrice", maxPrice)
        if (searchQuery) query.append("search", searchQuery)

        if (sort === "price_low") query.append("sort", "price_asc")
        if (sort === "price_high") query.append("sort", "price_desc")

        const endpoint = `/products?${query.toString()}`
        const data = await api.get<{ data: ProductFull[] }>(endpoint)
        setProducts(Array.isArray(data?.data) ? data.data : [])
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("❌ Product fetch failed", err)
          setProducts([])
        }
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
    return () => controller.abort()
  }, [categoryQuery, minPrice, maxPrice, searchQuery, sort])

  const uiProducts = useMemo(() => {
    return products.map(transformProductToCard)
  }, [products])

  return (
    <div className="min-h-screen bg-white">
      
      {/* LUXURY HEADER */}
      <div className="bg-slate-50/50 border-b border-slate-100 pt-28 pb-12 md:pt-36 md:pb-20 mb-8 md:mb-12">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-[1000] text-[var(--text-heading)] tracking-tighter mb-4">
               {categoryQuery ? categoryQuery : "Collection"}
            </h1>
            <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] md:text-xs">
              Meticulously crafted / Heavily Inspired
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        
        {/* CONTROLS BAR */}
        <div className="flex items-center justify-between mb-8 md:mb-12 pb-4 border-b border-slate-50">
          <div className="flex items-center gap-4">
             {/* SEARCH INFO */}
             {searchQuery ? (
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Search results for: <span className="text-[var(--brand-primary)]">"{searchQuery}"</span>
                </p>
             ) : (
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                  {products.length} Products Found
                </p>
             )}
          </div>

          <div className="flex items-center gap-3">
            {/* MOBILE FILTER BUTTON */}
            <button 
              onClick={() => setOpenDrawer(true)}
              className="md:hidden flex items-center gap-2 px-5 py-3 bg-[var(--brand-primary)] text-white rounded-full font-black text-[9px] uppercase tracking-widest shadow-xl shadow-[var(--brand-primary)]/20 active:scale-95 transition"
            >
              <Filter size={14} /> Filter
            </button>

            {/* SORT DROPDOWN (STYLIZED) */}
            <div className="relative group">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none bg-slate-50 hover:bg-white border-2 border-transparent hover:border-[var(--brand-primary)] px-6 md:px-8 py-3 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all outline-none cursor-pointer text-slate-600"
              >
                <option value="latest">Sort: Latest Arrivals</option>
                <option value="price_low">Sort: Price Low to High</option>
                <option value="price_high">Sort: Price High to Low</option>
              </select>
              <ChevronDown className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300" size={12} />
            </div>
          </div>
        </div>

        <div className="flex gap-12 lg:gap-20">
          
          {/* DESKTOP SIDEBAR */}
          <aside className="hidden md:block w-72 shrink-0 space-y-12 sticky top-32 h-fit">
            <div className="space-y-8">
              <CategoryFilter />
              <div className="h-px bg-slate-50" />
              <PriceFilter />
            </div>
          </aside>

          {/* MAIN GRID */}
          <main className="flex-1 min-w-0">
             {loading && products.length === 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
                   {[...Array(8)].map((_, i) => (
                      <div key={i} className="space-y-4 animate-pulse">
                         <div className="bg-slate-50 aspect-[4/5] rounded-[2rem]" />
                         <div className="h-3 w-2/3 bg-slate-50 rounded" />
                         <div className="h-3 w-1/3 bg-slate-50 rounded" />
                      </div>
                   ))}
                </div>
             ) : uiProducts.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-12 transition-all">
                  {uiProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
             ) : (
                <div className="py-32 text-center">
                   <LayoutGrid size={48} className="mx-auto text-slate-100 mb-6" />
                   <h2 className="text-xl font-black text-slate-300 uppercase tracking-widest">No Products Found</h2>
                   <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest opacity-60">Adjust your criteria to reveal more inspirations</p>
                </div>
             )}
          </main>

        </div>
      </div>

      {/* MOBILE FILTER DRAWER */}
      <Modal open={openDrawer} onClose={() => setOpenDrawer(false)} maxWidth="max-w-lg">
        <div className="pt-4 px-2">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-[1000] text-[var(--text-heading)] uppercase tracking-tighter">Filter By</h3>
            <button onClick={() => setOpenDrawer(false)} className="p-2 bg-slate-50 rounded-full text-slate-300">
              <X size={20} />
            </button>
          </div>
          
          <div className="space-y-10 pb-10">
             <CategoryFilter />
             <div className="h-px bg-slate-50" />
             <PriceFilter />
             
             <button 
                onClick={() => setOpenDrawer(false)}
                className="w-full btn-premium !py-5 shadow-2xl shadow-[var(--brand-primary)]/20 uppercase tracking-[0.2em] font-black text-[10px]"
             >
                Show {products.length} Products
             </button>
          </div>
        </div>
      </Modal>

    </div>
  )
}