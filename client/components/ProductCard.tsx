"use client"

import { useCart } from "@/context/CartContext"
import { useState } from "react"
import { ProductCardType } from "@/types/product"
import { Heart, Check, ShoppingBag } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getImageUrl } from "@/lib/image"

export default function ProductCard({
  product,
  priority = false,
  onQuickView,
}: {
  product: ProductCardType
  priority?: boolean
  onQuickView?: (product: ProductCardType) => void
}) {
  const router = useRouter()
  const { addToCart } = useCart()

  const [loading, setLoading] = useState(false)
  const [added, setAdded] = useState(false)

  const imageUrl = product.image
    ? getImageUrl(product.image)
    : "/placeholder.png"

  // prevent broken data
  if (!product.slug) return null

  const handleAdd = async (e: any) => {
    e.preventDefault()
    e.stopPropagation()

    if (loading) return

    setLoading(true)

    try {
      await addToCart({
        productId: product.id,
        variantId: product.variantId,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: imageUrl,
      })

      setAdded(true)
      setTimeout(() => {
        setAdded(false)
        router.push("/cart")
      }, 600)

    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      onClick={(e) => {
        if (onQuickView) {
          e.preventDefault()
          onQuickView(product)
        } else {
          router.push(`/products/${product.slug}`)
        }
      }}
      className="group block cursor-pointer h-full"
    >
      <div className="glass-card h-full flex flex-col relative overflow-hidden group-hover:border-[var(--border-focus)] transition-all bg-[var(--bg-card)]">

        {/* SHINE EFFECT (Removed for flatter design) */}

        {/* BADGE */}
        {["Heaven's Embrace", "Incensum", "Sacred Serenity", "Eterna Lume"].includes(product.name) && (
          <div className="absolute top-4 left-4 z-10 text-[10px] tracking-[0.2em] font-black bg-[var(--brand-accent)] text-white px-3 py-1.5 rounded-full shadow-md uppercase animate-pulse-subtle">
            POPULAR
          </div>
        )}

        {/* WISHLIST */}
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          className="absolute top-4 right-4 z-10 bg-white/60 backdrop-blur-md rounded-full p-2 hover:bg-[var(--brand-accent)] hover:text-white text-[var(--brand-primary)] transition-all duration-300 shadow-md border border-[var(--border-light)] group/heart"
        >
          <Heart size={16} className="group-hover/heart:scale-110 transition-transform" />
        </button>

        {/* IMAGE */}
        <div className="relative aspect-square image-zoom-container bg-[#E7ECEF]/50 w-full">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            priority={priority}
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover"
          />

          {/* DESKTOP CTA */}
          <div className="absolute bottom-6 w-full px-6 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 hidden md:block z-20 object-center text-center">
            <button
              onClick={handleAdd}
              disabled={loading}
              className="btn-premium w-full !text-sm !py-3 shadow-[0_8px_25px_rgba(39,76,119,0.3)]"
            >
              {added ? (
                <>
                  <Check size={16} /> Added to Cart
                </>
              ) : loading ? (
                "Adding..."
              ) : (
                <>
                  <ShoppingBag size={16} /> Add to Cart
                </>
              )}
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-3 md:p-5 flex-1 flex flex-col justify-between bg-transparent relative z-10">
          <div>
            <p className="text-[10px] md:text-xs text-[var(--brand-accent)] uppercase tracking-wider font-semibold mb-1">Collection</p>
            <h3 className="text-sm md:text-base font-bold text-[var(--text-heading)] line-clamp-2 leading-snug group-hover:text-[var(--brand-accent)] transition-colors">
              {product.name}
            </h3>
          </div>

          <div className="flex items-end justify-between mt-3 md:mt-4">
            <span className="text-base md:text-xl font-bold text-[var(--brand-primary)]">
              ₱{Number(product.price || 0).toLocaleString()}
            </span>

            {/* MOBILE CTA */}
            <button
              onClick={handleAdd}
              disabled={loading}
              className="md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-[var(--brand-primary)] text-white shadow-sm disabled:opacity-50 active:scale-95 transition-all hover:bg-[#1B3B60]"
            >
              {added ? <Check size={14} /> : <ShoppingBag size={14} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}