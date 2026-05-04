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

  const fallbackImage = product.image || product.variants?.find(v => v.image)?.image || "/placeholder.png"
  const imageUrl = activeVariant?.image
    ? getImageUrl(activeVariant.image)
    : getImageUrl(fallbackImage)

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
        attributes: Object.entries(selections).map(([name, value]) => ({ name, value }))
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

  const selections: Record<string, string> = {}
  activeVariant?.attributes?.forEach(a => {
    if (a.name === "Sizes") {
      const parsedSizes = (a.value || "").split(",").map((s: any) => s.trim()).filter(Boolean)
      if (parsedSizes.length > 0) selections["Size"] = parsedSizes[0]
    } else {
      selections[a.name] = a.value
    }
  })

  const handleAttrClick = (e: any, name: string, value: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    const next = { ...selections, [name]: value }
    
    const match = product.variants?.find(v =>
      Object.entries(next).every(([n, val]) => {
        if (n === "Size" && v.attributes?.some((a: any) => a.name === "Sizes")) {
          return v.attributes.find((a: any) => a.name === "Sizes")?.value.split(",").map((s: any) => s.trim()).includes(val)
        }
        return v.attributes?.some((a: any) => a.name === n && a.value === val)
      })
    )

    if (match) {
      setActiveVariant(match)
      return
    }

    // Fallback: find ANY variant with this attribute value
    const fallback = product.variants?.find(v => {
      if (name === "Size" && v.attributes?.some((a: any) => a.name === "Sizes")) {
        return v.attributes.find((a: any) => a.name === "Sizes")?.value.split(",").map((s: any) => s.trim()).includes(value)
      }
      return v.attributes?.some((a: any) => a.name === name && a.value === value)
    })

    if (fallback) {
      setActiveVariant(fallback)
    }
  }

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block h-full"
    >
      <div className="h-full flex flex-col relative overflow-hidden rounded-2xl md:rounded-3xl bg-white/60 backdrop-blur-md transition-all duration-300 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]">

        {/* BADGE: BEST SELLER */}
        {product.isBestseller && (
          <div className="absolute top-4 left-4 z-10 text-[10px] tracking-[0.2em] font-black bg-[var(--brand-primary)] text-white px-3 py-1.5 rounded-full shadow-md uppercase">
            BEST SELLER
          </div>
        )}

        {/* BADGE: POPULAR */}
        {(product.isPopular || ["Heaven's Embrace", "Incensum", "Sacred Serenity", "Eterna Lume"].includes(product.name)) && !product.isBestseller && (
          <div className="absolute top-4 left-4 z-10 text-[10px] tracking-[0.2em] font-black bg-[var(--brand-accent)] text-white px-3 py-1.5 rounded-full shadow-md uppercase">
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
          <motion.div whileTap={{ scale: 1.5 }}>
            <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
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
          <div className="absolute bottom-6 w-full px-6 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 hidden md:block z-20 text-center">
            <button onClick={handleAdd} disabled={loading} className="btn-premium w-full !text-sm !py-3">
              {added ? "Added to Cart" : loading ? "Adding..." : "Add to Cart"}
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
              <div className="flex flex-col gap-2 mb-1">
                {(() => {
                  const grouped: Record<string, string[]> = {}
                  product.variants.forEach(v => {
                    v.attributes?.forEach(a => {
                      if (a.name === "Sizes") {
                        (a.value || "").split(",").forEach((val: string) => {
                          const trimmed = val.trim()
                          if (!trimmed) return
                          if (!grouped["Size"]) grouped["Size"] = []
                          if (!grouped["Size"].includes(trimmed)) grouped["Size"].push(trimmed)
                        })
                      } else {
                        if (!grouped[a.name]) grouped[a.name] = []
                        if (!grouped[a.name].includes(a.value)) grouped[a.name].push(a.value)
                      }
                    })
                  })

                  const sortedGroups = Object.entries(grouped).sort(([nameA], [nameB]) => {
                    const order = ["size", "volume", "color"]
                    const indexA = order.indexOf(nameA.toLowerCase())
                    const indexB = order.indexOf(nameB.toLowerCase())
                    if (indexA !== -1 && indexB !== -1) return indexA - indexB
                    if (indexA !== -1) return -1
                    if (indexB !== -1) return 1
                    return nameA.localeCompare(nameB)
                  })

                  return sortedGroups.map(([name, values]) => {
                    const sizeOrder = ["xs", "s", "m", "l", "xl", "2xl", "3xl"]
                    const sortedValues = name.toLowerCase() === "size" 
                      ? [...values].sort((a, b) => sizeOrder.indexOf(a.toLowerCase()) - sizeOrder.indexOf(b.toLowerCase()))
                      : values

                    return (
                      <div key={name} className="flex flex-wrap gap-1">
                        {sortedValues.map((val) => {
                          const isActive = selections[name] === val
                          
                          const checkMatch = (v: any, attrName: string, attrVal: string) => {
                            if (attrName === "Size") {
                              return v.attributes?.some((a: any) => 
                                (a.name === "Size" && a.value === attrVal) ||
                                (a.name === "Sizes" && a.value.split(",").map((s: any) => s.trim()).includes(attrVal))
                              )
                            }
                            return v.attributes?.some((a: any) => a.name === attrName && a.value === attrVal)
                          }

                          const exists = product.variants?.some(v => checkMatch(v, name, val))
                          const isAvailable = product.variants?.some(v => 
                            checkMatch(v, name, val) &&
                            Object.entries(selections).every(([otherName, otherVal]) => 
                              otherName === name || checkMatch(v, otherName, otherVal)
                            ) &&
                            v.stock > 0
                          )

                          return (
                            <button
                              key={val}
                              disabled={!exists}
                              onClick={(e) => handleAttrClick(e, name, val)}
                              className={`text-[9px] md:text-[8px] font-black px-2.5 py-1.5 md:px-1.5 md:py-0.5 rounded-md border transition-all ${!exists
                                ? "opacity-20 cursor-not-allowed line-through"
                                : isActive
                                  ? 'bg-[var(--brand-primary)] border-[var(--brand-primary)] text-white shadow-sm'
                                  : !isAvailable
                                    ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed opacity-60"
                                    : 'bg-white/50 border-[var(--border-light)] text-[var(--text-muted)] hover:border-[var(--brand-primary)]'
                                }`}
                            >
                              {val}
                            </button>
                          )
                        })}
                      </div>
                    )
                  })
                })()}
              </div>
            )}

            <div className="flex items-end justify-between">
              <div className="flex flex-col">
                <span className="text-base md:text-lg font-bold text-[var(--text-heading)]">
                  ₱{currentPrice.toLocaleString()}
                </span>
                {(activeVariant?.stock || product.stock) > 0 ? (
                  <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mt-1">In Stock</span>
                ) : (
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Exclusive</span>
                )}
              </div>

              <button
                onClick={handleAdd}
                disabled={loading || (activeVariant?.stock || product.stock) === 0}
                className="md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-[var(--brand-primary)] text-white shadow-sm"
              >
                {added ? <Check size={14} /> : <ShoppingBag size={14} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}