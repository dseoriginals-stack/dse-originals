"use client"

import { useEffect, useState, useMemo } from "react"
import { useSearchParams } from "next/navigation"

import ProductCard from "@/components/ProductCard"

import CategoryFilter from "@/components/CategoryFilter"
import PriceFilter from "@/components/PriceFilter"

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
    <div className="max-w-[1300px] mx-auto py-7 px-4 md:px-8">

      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
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

      <div className="flex flex-col md:flex-row gap-6 md:gap-8">

        {/* SIDEBAR */}
        <aside className="w-full md:w-64 space-y-6 md:space-y-8 md:sticky md:top-24 h-fit border-b md:border-0 border-[var(--border-light)] pb-6 md:pb-0">
          <CategoryFilter />
          <PriceFilter />
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