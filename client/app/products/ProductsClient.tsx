"use client"

import { useEffect, useState, useMemo } from "react"
import { useSearchParams } from "next/navigation"

import ProductCard from "@/components/ProductCard"

import CategoryFilter from "@/components/CategoryFilter"

import { api } from "@/lib/api"
import { transformProductToCard } from "@/lib/transformProduct"
import { ProductFull, ProductCardType } from "@/types/product"

type Props = {
  initialProducts: ProductFull[]
}

export default function ProductsClient({ initialProducts }: Props) {
  const searchParams = useSearchParams()

  const searchQuery = searchParams.get("search") || ""
  const categoryQuery = searchParams.get("category") || ""

  const [products, setProducts] = useState<ProductFull[]>(initialProducts || [])
  const [loading, setLoading] = useState(false)
  const [sort, setSort] = useState("latest")
  const [showFilters, setShowFilters] = useState(false)

  // 🚀 INSTANT FILTERING LOGIC
  const filteredProducts = useMemo(() => {
    let result = [...products]

    // 1. Category Filter
    if (categoryQuery) {
      result = result.filter(p => 
        (p.category || "").toLowerCase() === categoryQuery.toLowerCase()
      )
    }

    // 2. Search Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        (p.description || "").toLowerCase().includes(q)
      )
    }

    // 3. Sorting
    if (sort === "price_low") {
      result.sort((a, b) => {
        const pA = a.variants?.[0]?.price || 0
        const pB = b.variants?.[0]?.price || 0
        return pA - pB
      })
    } else if (sort === "price_high") {
      result.sort((a, b) => {
        const pA = a.variants?.[0]?.price || 0
        const pB = b.variants?.[0]?.price || 0
        return pB - pA
      })
    }

    return result
  }, [products, categoryQuery, searchQuery, sort])

  useEffect(() => {
    if (initialProducts?.length > 0) return

    async function fetchProducts() {
      try {
        setLoading(true)
        const data = await api.get<{ data: ProductFull[] }>("/products")
        setProducts(Array.isArray(data?.data) ? data.data : [])
      } catch (err) {
        console.error("❌ Product fetch failed", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [initialProducts])

  const uiProducts = useMemo(() => {
    // 🎨 CUSTOM SORT: Force specific category priority
    const sorted = [...filteredProducts].sort((a, b) => {
      // Only apply this specific category priority when "latest" is selected
      if (sort === "latest") {
        const order = ["perfume", "apparel", "dsecollection"]
        const catA = (a.category || "").toLowerCase()
        const catB = (b.category || "").toLowerCase()

        const indexA = order.indexOf(catA) === -1 ? 999 : order.indexOf(catA)
        const indexB = order.indexOf(catB) === -1 ? 999 : order.indexOf(catB)

        if (indexA !== indexB) {
          return indexA - indexB
        }
      }
      return 0 // Keep original API order otherwise                          
    })

    return sorted.map(transformProductToCard)
  }, [filteredProducts, sort])

  return (
    <div className="max-w-[1300px] mx-auto py-7 px-4 md:px-8">

      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-[var(--text-heading)]">
            Products
          </h1>

          {searchQuery && (
            <p className="text-gray-500 mt-2 text-sm">
              Results for:
              <span className="font-medium ml-1 text-black">
                {searchQuery}
              </span>
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 md:gap-8">

        {/* SIDEBAR */}
        <aside className="w-full md:w-64 space-y-6 md:space-y-8 md:sticky md:top-24 h-fit border-b md:border-0 border-[var(--border-light)] pb-6 md:pb-0">
          <CategoryFilter />
        </aside>

        {/* PRODUCTS */}
        <div className="flex-1">

          {/* LOADING */}
          {loading && products.length === 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 aspect-square rounded-2xl" />
                  <div className="h-4 bg-gray-200 mt-3 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 mt-2 rounded w-1/2" />
                </div>
              ))}
            </div>
          )}

          {/* PRODUCTS */}
          {uiProducts.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {uiProducts.map((product) => (
                <div key={product.id}>
                  <ProductCard
                    product={product}
                  />
                </div>
              ))}
            </div>
          )}

          {/* EMPTY */}
          {!loading && uiProducts.length === 0 && (
            <div className="text-center py-24">
              <h2 className="text-lg font-semibold">No products found</h2>
              <p className="text-gray-500 text-sm mt-2">
                Try adjusting filters
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}