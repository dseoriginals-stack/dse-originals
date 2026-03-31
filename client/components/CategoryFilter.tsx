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

        // ✅ FIXED ORDER (stable)
        const order = ["perfume", "apparel", "dsecollection"]

        const sorted = [...data].sort(
          (a, b) => order.indexOf(a.slug) - order.indexOf(b.slug)
        )

        setCategories(sorted)

      } catch (err) {
        console.error("❌ Failed to load categories:", err)
      }
    }

    load()
  }, [])

  const handleClick = (slug: string) => {
    const query = new URLSearchParams(params.toString())

    if (activeCategory === slug) {
      query.delete("category")
    } else {
      query.set("category", slug)
    }

    router.push(`/products?${query.toString()}`)
  }

  return (
    <div>

      {/* TITLE */}
      <h3 className="text-sm font-semibold mb-4 tracking-tight text-slate-700">
        Categories
      </h3>

      {/* PILLS */}
      <div className="flex flex-wrap gap-2">

        {categories.map(cat => {

          const isActive = activeCategory === cat.slug

          return (
            <button
              key={cat.id}
              onClick={() => handleClick(cat.slug)}
              className={`
                px-4 py-2 rounded-full text-sm border transition-all duration-200

                ${isActive
                  ? "bg-[#274C77] text-white border-[#274C77] shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"}
              `}
            >
              {cat.name}
            </button>
          )
        })}

      </div>

    </div>
  )
}