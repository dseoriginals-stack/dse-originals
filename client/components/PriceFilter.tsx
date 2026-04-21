"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

export default function PriceFilter() {
  const router = useRouter()
  const params = useSearchParams()

  const [min, setMin] = useState(params.get("minPrice") || "")
  const [max, setMax] = useState(params.get("maxPrice") || "")

  const apply = () => {
    const query = new URLSearchParams(params.toString())

    if (min) query.set("minPrice", min)
    else query.delete("minPrice")

    if (max) query.set("maxPrice", max)
    else query.delete("maxPrice")

    router.push(`/products?${query.toString()}`)
  }

  const clear = () => {
    const query = new URLSearchParams(params.toString())
    query.delete("minPrice")
    query.delete("maxPrice")
    setMin("")
    setMax("")
    router.push(`/products?${query.toString()}`)
  }

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">

      {/* TITLE */}
      <h3 className="text-sm font-semibold mb-4 tracking-tight">
        Price Range
      </h3>

      {/* INPUTS */}
      <div className="flex gap-2 mb-4">

        <input
          type="number"
          placeholder="₱ Min"
          value={min}
          onChange={(e) => setMin(e.target.value)}
          className="w-full border border-slate-200 focus:border-[#274C77] focus:ring-1 focus:ring-[#274C77] rounded-lg px-3 py-2 text-sm outline-none transition"
        />

        <input
          type="number"
          placeholder="₱ Max"
          value={max}
          onChange={(e) => setMax(e.target.value)}
          className="w-full border border-slate-200 focus:border-[#274C77] focus:ring-1 focus:ring-[#274C77] rounded-lg px-3 py-2 text-sm outline-none transition"
        />

      </div>

      {/* QUICK PRESETS (🔥 UX BOOST) */}
      <div className="flex flex-wrap gap-2 mb-4">

        {[
          { label: "Under ₱500", min: "", max: "500" },
          { label: "₱500–₱1000", min: "500", max: "1000" },
          { label: "₱1000+", min: "1000", max: "" }
        ].map((p, i) => (

          <button
            key={i}
            onClick={() => {
              setMin(p.min)
              setMax(p.max)
            }}
            className="text-xs px-3 py-1 rounded-full border border-slate-200 hover:bg-slate-100 transition"
          >
            {p.label}
          </button>

        ))}

      </div>

      {/* ACTIONS */}
      <div className="flex gap-2">

        <button
          onClick={apply}
          className="flex-1 bg-[#274C77] hover:bg-[#1f3c5c] text-white py-2 rounded-lg text-sm font-medium transition"
        >
          Apply
        </button>

        <button
          onClick={clear}
          className="flex-1 border border-slate-200 hover:bg-slate-100 py-2 rounded-lg text-sm transition"
        >
          Clear
        </button>

      </div>

    </div>
  )
}