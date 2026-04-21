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


  useEffect(() => {
    const controller = new AbortController()

    async function fetchProducts() {
      try {
        if (
          !categoryQuery &&
          !searchQuery &&
          initialProducts?.length
        ) {
          setProducts(initialProducts)
          return
        }

        setLoading(true)

        const query = new URLSearchParams()

        if (categoryQuery) query.append("category", categoryQuery)
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
  }, [categoryQuery, searchQuery, sort])

  const uiProducts = useMemo(() => {
    // 🎨 CUSTOM SORT: Force specific category priority
    const sorted = [...products].sort((a, b) => {
      // Only apply this specific category priority when "latest" is selected
      if (sort === "latest") {
        const catA = (a.category || "").toLowerCase()
        const catB = (b.category || "").toLowerCase()
        const nameA = (a.name || "").toLowerCase()
        const nameB = (b.name || "").toLowerCase()

        // Identification Logic
        const isPerfume = (cat: string, name: string) => {
          const keywords = ["perfume", "scent", "fragrance", "eau", "spray"]
          return cat.includes("perfume") || keywords.some(k => name.includes(k))
        }
        const isApparel = (cat: string, name: string) => {
          const keywords = ["apparel", "clothing", "shirt", "tee", "wear"]
          return cat.includes("apparel") || keywords.some(k => name.includes(k))
        }

        const scoreA = isPerfume(catA, nameA) ? 1 : (isApparel(catA, nameA) ? 2 : (catA.includes("collection") ? 3 : 4))
        const scoreB = isPerfume(catB, nameB) ? 1 : (isApparel(catB, nameB) ? 2 : (catB.includes("collection") ? 3 : 4))

        if (scoreA !== scoreB) {
          return scoreA - scoreB
        }
      }
      return 0 // Keep original API order otherwise
    })

    return sorted.map(transformProductToCard)
  }, [products, sort])

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