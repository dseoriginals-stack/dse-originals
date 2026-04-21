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
    <div className="space-y-6">
      
      {/* TITLE */}
      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 px-1">
        Price Range
      </h3>

      <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-50 shadow-sm space-y-6">
        
        {/* INPUTS */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300">₱</span>
            <input
              type="number"
              placeholder="Min"
              value={min}
              onChange={(e) => setMin(e.target.value)}
              className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-[var(--brand-primary)] rounded-2xl pl-8 pr-4 py-3 text-[10px] md:text-xs font-bold outline-none transition-all placeholder:text-slate-300"
            />
          </div>

          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300">₱</span>
            <input
              type="number"
              placeholder="Max"
              value={max}
              onChange={(e) => setMax(e.target.value)}
              className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-[var(--brand-primary)] rounded-2xl pl-8 pr-4 py-3 text-[10px] md:text-xs font-bold outline-none transition-all placeholder:text-slate-300"
            />
          </div>
        </div>

        {/* QUICK PRESETS */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Under ₱500", min: "", max: "500" },
            { label: "₱500–₱1000", min: "500", max: "1000" },
            { label: "₱1000+", min: "1000", max: "" }
          ].map((p, i) => (
            <button
              key={i}
              onClick={() => { setMin(p.min); setMax(p.max); }}
              className={`
                px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border-2
                ${(min === p.min && max === p.max)
                  ? "bg-slate-900 border-slate-900 text-white"
                  : "bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100"}
              `}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* ACTIONS */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={apply}
            className="flex-1 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/90 text-white py-4 rounded-2xl text-[10px] font-[1000] uppercase tracking-widest transition shadow-lg shadow-[var(--brand-primary)]/10 active:scale-95"
          >
            Apply
          </button>

          <button
            onClick={clear}
            className="flex-1 border-2 border-slate-50 hover:bg-slate-100 text-slate-400 py-4 rounded-2xl text-[10px] font-[1000] uppercase tracking-widest transition active:scale-95"
          >
            Clear
          </button>
        </div>

      </div>
    </div>
  )
}