"use client"

import Link from "next/link"
import { useCart } from "@/context/CartContext"
import { useState } from "react"
import { ProductCardType } from "@/types/product"
import { Heart, Check } from "lucide-react"
import Image from "next/image"
import { getImageUrl } from "@/lib/image"

export default function ProductCard({
  product,
  priority = false,
}: {
  product: ProductCardType
  priority?: boolean
}) {
  const { addToCart } = useCart()

  const [loading, setLoading] = useState(false)
  const [added, setAdded] = useState(false)

  // ✅ safer image fallback
  const imageUrl =
  product.image && product.image.startsWith("http")
    ? product.image
    : "/placeholder.png"

  // ✅ prevent broken navigation
  if (!product.slug) return null

  const handleAdd = async (e: any) => {
    e.preventDefault()
    e.stopPropagation()

    if (loading) return

    setLoading(true)

    try {
      await addToCart({
        variantId: product.variantId,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: imageUrl,
      })

      setAdded(true)

      setTimeout(() => {
        setAdded(false)
      }, 1200)

    } finally {
      setLoading(false)
    }
  }

  return (
    <Link href={`/product/${product.slug}`} className="group block">

      <div
        className="
          relative rounded-2xl bg-white overflow-hidden
          border border-gray-100
          transition-all duration-300
          hover:shadow-xl hover:-translate-y-1
        "
      >

        {/* BADGE */}
        <div className="absolute top-3 left-3 z-10 text-[10px] tracking-wide bg-[var(--brand-primary)] text-white px-3 py-1 rounded-full shadow-sm">
          NEW
        </div>

        {/* WISHLIST */}
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          className="absolute top-3 right-3 z-10 bg-white/80 backdrop-blur rounded-full p-2 hover:bg-white transition shadow-sm"
        >
          <Heart size={16} className="text-[var(--brand-primary)]" />
        </button>

        {/* IMAGE */}
        <div className="relative aspect-square bg-gray-50 overflow-hidden">

          <Image
            src={imageUrl}
            alt={product.name}
            fill
            priority={priority}
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="
              object-cover
              transition-transform duration-500 ease-out
              group-hover:scale-105
            "
          />

          {/* subtle overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/[0.04] transition duration-300" />

          {/* DESKTOP CTA */}
          <div
            className="
              absolute bottom-4 left-1/2 -translate-x-1/2
              opacity-0 translate-y-2
              group-hover:opacity-100 group-hover:translate-y-0
              transition-all duration-300 hidden md:block
            "
          >
            <button
              onClick={handleAdd}
              disabled={loading}
              className="
                bg-[var(--brand-primary)] text-white text-sm px-5 py-2 rounded-full 
                shadow-md hover:opacity-90 transition
                disabled:opacity-50
                flex items-center gap-2
              "
            >
              {added ? (
                <>
                  <Check size={14} /> Added
                </>
              ) : loading ? (
                "Adding..."
              ) : (
                "Add to Cart"
              )}
            </button>
          </div>

        </div>

        {/* CONTENT */}
        <div className="p-4 space-y-2">

          <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
            {product.name}
          </h3>

          <div className="flex items-center justify-between">

            <span className="text-base font-semibold text-[var(--brand-primary)]">
              ₱{Number(product.price || 0).toLocaleString()}
            </span>

            {/* MOBILE CTA */}
            <button
              onClick={handleAdd}
              disabled={loading}
              className="
                md:hidden text-xs 
                bg-[var(--brand-primary)] text-white 
                px-3 py-1 rounded-full 
                transition 
                disabled:opacity-50
                flex items-center gap-1
              "
            >
              {added ? <Check size={12} /> : null}
              {loading ? "..." : added ? "Added" : "Add"}
            </button>

          </div>

        </div>

      </div>
    </Link>
  )
}