"use client"

import { useEffect, useState, useMemo } from "react"
import { useSearchParams } from "next/navigation"

import ProductCard from "@/components/ProductCard"
import CategoryFilter from "@/components/CategoryFilter"
import PriceFilter from "@/components/PriceFilter"

import { api } from "@/lib/api"
import { transformProductToCard } from "@/lib/transformProduct"
import { ProductFull } from "@/types/product"

type Props = {
  initialProducts: ProductFull[]
}

export default function ProductsClient({ initialProducts }: Props) {
  const searchParams = useSearchParams()

  const searchQuery = searchParams.get("search") || ""
  const categoryQuery = searchParams.get("category") || ""
  const minPrice = searchParams.get("minPrice") || ""
  const maxPrice = searchParams.get("maxPrice") || ""

  const [products, setProducts] = useState<ProductFull[]>(initialProducts || [])
  const [loading, setLoading] = useState(false)
  const [sort, setSort] = useState("latest")
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    async function fetchProducts() {
      try {
        // ✅ Avoid refetch if no filters AND we already have SSR data
        if (
          !categoryQuery &&
          !minPrice &&
          !maxPrice &&
          !searchQuery &&
          initialProducts?.length
        ) {
          return
        }

        setLoading(true)

        const query = new URLSearchParams()

        if (categoryQuery) query.append("category", categoryQuery)
        if (minPrice) query.append("minPrice", minPrice)
        if (maxPrice) query.append("maxPrice", maxPrice)
        if (searchQuery) query.append("search", searchQuery)

        // ✅ Move sorting to backend
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
    <div className="max-w-[1400px] mx-auto py-12 px-4 md:px-8">

      {/* HEADER */}
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
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

        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters(true)}
            className="md:hidden px-4 py-2 border rounded-xl text-sm hover:bg-gray-50 transition"
          >
            Filters
          </button>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border rounded-xl px-4 py-2 text-sm bg-white hover:border-black transition"
          >
            <option value="latest">Latest</option>
            <option value="price_low">Price ↑</option>
            <option value="price_high">Price ↓</option>
          </select>
        </div>
      </div>

      <div className="flex gap-12">

        {/* SIDEBAR */}
        <aside className="hidden md:block w-64 space-y-8 sticky top-24 h-fit">
          <CategoryFilter />
          <PriceFilter />
        </aside>

        {/* PRODUCTS */}
        <div className="flex-1">

          {/* ✅ Skeleton (no flicker) */}
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

          {/* ✅ Products */}
          {uiProducts.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {uiProducts.map((product) => (
                <div
                  key={product.id}
                  className="transition-all duration-300 hover:-translate-y-1"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}

          {/* ✅ Empty */}
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

      {/* MOBILE FILTER */}
      {showFilters && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm">
          <div className="absolute right-0 top-0 h-full w-80 bg-white p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-lg">Filters</h3>
              <button onClick={() => setShowFilters(false)}>✕</button>
            </div>

            <div className="space-y-8">
              <CategoryFilter />
              <PriceFilter />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}