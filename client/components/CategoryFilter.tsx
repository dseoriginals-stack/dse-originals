"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useRouter, useSearchParams } from "next/navigation"

type Category = {
  id: string
  name: string
  slug: string
}

export default function CategoryFilter() {

  const [categories, setCategories] = useState<Category[]>([])
  const router = useRouter()
  const params = useSearchParams()

  const activeCategory = params.get("category")

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get<Category[]>("/categories")

        // ✅ FIXED ORDER (push unknown slugs to end)
        const order = ["perfume", "apparel", "dsecollection"]

        const sorted = [...data].sort((a, b) => {
          const indexA = order.indexOf(a.slug) === -1 ? 999 : order.indexOf(a.slug)
          const indexB = order.indexOf(b.slug) === -1 ? 999 : order.indexOf(b.slug)
          return indexA - indexB
        })

        setCategories(sorted)

      } catch (err) {
        console.error("❌ Failed to load categories:", err)
      }
    }

    load()
  }, [])

  const handleClick = (slug: string | null) => {
    const query = new URLSearchParams(params.toString())

    if (!slug || activeCategory === slug) {
      query.delete("category")
    } else {
      query.set("category", slug)
    }

    router.push(`/products?${query.toString()}`)
  }

  return (
    <div className="space-y-6">
      
      {/* TITLE */}
      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 px-1">
        Select Category
      </h3>

      {/* PILLS */}
      <div className="flex flex-wrap gap-2 md:gap-3">

        <button
          onClick={() => handleClick(null)}
          className={`
            px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 border-2
            ${!activeCategory
              ? "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)] shadow-lg shadow-[var(--brand-primary)]/20"
              : "bg-slate-50 text-slate-400 border-transparent hover:bg-white hover:border-slate-100"}
          `}
        >
          All Pieces
        </button>

        {categories.map(cat => {
          const isActive = activeCategory === cat.slug
          const displayName = cat.slug === "dsecollection" ? "DSE Collection" : cat.name

          return (
            <button
              key={cat.id}
              onClick={() => handleClick(cat.slug)}
              className={`
                px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 border-2
                ${isActive
                  ? "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)] shadow-lg shadow-[var(--brand-primary)]/20"
                  : "bg-slate-50 text-slate-400 border-transparent hover:bg-white hover:border-slate-100"}
              `}
            >
              {displayName}
            </button>
          )
        })}

      </div>

    </div>
  )
}