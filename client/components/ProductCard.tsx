"use client"

import { useCart } from "@/context/CartContext"
import { useWishlist } from "@/context/WishlistContext"
import { useState } from "react"
import { ProductCardType } from "@/types/product"
import { Heart, Check, ShoppingBag } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getImageUrl } from "@/lib/image"
import { getCloudinaryBlurUrl } from "@/lib/imageUtils"

export default function ProductCard({
  product,
  priority = false,
}: {
  product: ProductCardType
  priority?: boolean
}) {
  const router = useRouter()
  const { addToCart } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()

  const isWishlisted = isInWishlist(product.id)
  const [loading, setLoading] = useState(false)
  const [added, setAdded] = useState(false)

  // Find default variant or first variant
  const defaultVariant = product.variants?.find(v => v.id === product.variantId) || product.variants?.[0]
  const [activeVariant, setActiveVariant] = useState(defaultVariant)

  const getDisplayPrice = (variant: any) => {
    if (!variant) return product.price
    const attrs = (variant.attributes || []).map((a: any) => (a.value || "").toLowerCase())
    if (attrs.some((a: string) => a.includes("55ml"))) return 349
    if (attrs.some((a: string) => a.includes("30ml"))) return 249
    return Number(variant.price)
  }

  const currentPrice = getDisplayPrice(activeVariant)

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
        variantId: activeVariant?.id || product.variantId,
        name: product.name,
        price: currentPrice,
        quantity: 1,
        category: product.category,
        image: imageUrl,
        attributes: activeVariant?.attributes?.map(a => ({ name: a.name, value: a.value })) || []
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
      onClick={() => router.push(`/products/${product.slug}`)}
      className="group block cursor-pointer h-full"
    >
      <div className="h-full flex flex-col relative overflow-hidden rounded-2xl md:rounded-3xl bg-white/60 backdrop-blur-md transition-all duration-300 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]">

        {/* SHINE EFFECT (Removed for flatter design) */}

        {/* BADGE: BEST SELLER (Priority) */}
        {product.isBestseller && (
          <div className="absolute top-4 left-4 z-10 text-[10px] tracking-[0.2em] font-black bg-[var(--brand-primary)] text-white px-3 py-1.5 rounded-full shadow-md uppercase animate-pulse-subtle">
            BEST SELLER
          </div>
        )}

        {/* BADGE: POPULAR (Secondary) */}
        {(product.isPopular || ["Heaven's Embrace", "Incensum", "Sacred Serenity", "Eterna Lume"].includes(product.name)) && !product.isBestseller && (
          <div className="absolute top-4 left-4 z-10 text-[10px] tracking-[0.2em] font-black bg-[var(--brand-accent)] text-white px-3 py-1.5 rounded-full shadow-md uppercase animate-pulse-subtle">
            POPULAR
          </div>
        )}

        {/* WISHLIST */}
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            toggleWishlist(product.id)
          }}
          className={`absolute top-4 right-4 z-10 rounded-full p-2 backdrop-blur-md transition-all duration-300 shadow-md border group/heart ${isWishlisted
            ? 'bg-[var(--brand-primary)] border-transparent text-white'
            : 'bg-white/60 border-[var(--border-light)] text-[var(--brand-primary)] hover:bg-[var(--brand-accent)] hover:text-white'
            }`}
        >
          <motion.div
            whileTap={{ scale: 1.5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Heart
              size={16}
              fill={isWishlisted ? "currentColor" : "none"}
              className={`${isWishlisted ? 'animate-heart-beat' : 'group-hover/heart:scale-110'} transition-all`}
            />
          </motion.div>
        </button>

        {/* IMAGE */}
        <div className="relative aspect-[4/5] w-full overflow-hidden">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            priority={priority}
            placeholder="blur"
            blurDataURL={getCloudinaryBlurUrl(imageUrl)}
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
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
        <div className="px-4 pt-4 pb-5 md:px-5 md:pt-5 md:pb-6 flex-1 flex flex-col justify-between">
          <div>
            <p className="text-[10px] tracking-[0.18em] text-[var(--text-muted)] uppercase font-semibold mb-1">Collection</p>
            <h3 className="text-sm md:text-base font-semibold text-[var(--text-heading)] leading-snug line-clamp-2 tracking-tight">
              {product.name}
            </h3>
          </div>

          <div className="flex flex-col gap-2 mt-3 md:mt-4">
            {/* VARIANT PICKER */}
            {product.variants && product.variants.length > 1 && (
              <div className="flex flex-wrap gap-1 mb-1">
                {(() => {
                  const seen = new Set()
                  return [...product.variants]
                    .filter(v => {
                      const val = v.attributes?.find((at: any) => at.name.toLowerCase() === "size" || at.name.toLowerCase() === "volume")?.value || v.attributes?.[0]?.value || ""
                      if (seen.has(val)) return false
                      seen.add(val)
                      return true
                    })
                    .sort((a, b) => {
                      const sizeOrder = ["XS", "S", "M", "L", "XL", "2XL", "3XL"]
                      const volOrder = ["55ml", "30ml"]

                      const getVal = (v: any) => v.attributes?.find((at: any) => at.name.toLowerCase() === "size" || at.name.toLowerCase() === "volume")?.value || v.attributes?.[0]?.value || ""
                      const valA = getVal(a)
                      const valB = getVal(b)

                      if (sizeOrder.includes(valA) && sizeOrder.includes(valB)) return sizeOrder.indexOf(valA) - sizeOrder.indexOf(valB)
                      if (volOrder.includes(valA) && volOrder.includes(valB)) return volOrder.indexOf(valA) - volOrder.indexOf(valB)
                      return 0
                    })
                    .map((v) => {
                      const size = v.attributes?.find(a => a.name.toLowerCase() === "size" || a.name.toLowerCase() === "volume")?.value ||
                        v.attributes?.[0]?.value || ""
                      if (!size) return null

                      const isActive = activeVariant?.id === v.id
                      return (
                        <button
                          key={v.id}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setActiveVariant(v)
                          }}
                          className={`text-[8px] font-black px-1.5 py-0.5 rounded-md border transition-all ${isActive
                            ? 'bg-[var(--brand-primary)] border-[var(--brand-primary)] text-white shadow-sm'
                            : 'bg-white/50 border-[var(--border-light)] text-[var(--text-muted)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]'
                            }`}
                        >
                          {size}
                        </button>
                      )
                    })
                })()}
              </div>
            )}

            <div className="flex items-end justify-between">
              <div className="flex flex-col">
                <span className="text-base md:text-lg font-bold text-[var(--text-heading)]">
                  {currentPrice > 0 ? `₱${currentPrice.toLocaleString()}` : "Price on Request"}
                </span>
                {(activeVariant?.stock || product.stock) > 0 ? (
                  <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mt-1">In Stock</span>
                ) : (
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Exclusive Series</span>
                )}
              </div>

              {/* MOBILE CTA */}
              <button
                onClick={handleAdd}
                disabled={loading || (activeVariant?.stock || product.stock) === 0}
                className="md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-[var(--brand-primary)] text-white shadow-sm disabled:opacity-30 active:scale-95 transition-all"
              >
                {added ? <Check size={14} /> : <ShoppingBag size={14} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}