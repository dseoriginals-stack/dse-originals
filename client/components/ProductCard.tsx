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
  const [selections, setSelections] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    defaultVariant?.attributes?.forEach(a => {
      if (a.name === "Sizes") {
        const parsed = (a.value || "").split(",").map(s => s.trim()).filter(Boolean)
        if (parsed.length > 0) initial["Size"] = parsed[0]
      } else {
        initial[a.name] = a.value
      }
    })
    return initial
  })

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



  const handleAttrClick = (e: any, name: string, value: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    setSelections(prev => {
      const next = { ...prev, [name]: value }
      
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
        return next
      }

      // Fallback
      const fallback = product.variants?.find(v => {
        if (name === "Size" && v.attributes?.some((a: any) => a.name === "Sizes")) {
          return v.attributes.find((a: any) => a.name === "Sizes")?.value.split(",").map((s: any) => s.trim()).includes(value)
        }
        return v.attributes?.some((a: any) => a.name === name && a.value === value)
      })

      if (fallback) {
        setActiveVariant(fallback)
        const reset: Record<string, string> = {}
        fallback.attributes?.forEach((a: any) => {
          if (a.name === "Sizes") {
            reset["Size"] = value
          } else {
            reset[a.name] = a.value
          }
        })
        return reset
      }

      return prev
    })
  }

  // SECONDARY IMAGE FOR HOVER HOOK
  const secondaryImage = product.variants?.find(v => v.image && v.image !== activeVariant?.image)?.image 
    || product.image 
    || "/placeholder.png"
  const secondaryImageUrl = getImageUrl(secondaryImage)

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="h-full"
    >
      <Link
        href={`/products/${product.slug}`}
        className="group block h-full"
      >
        <div className="h-full flex flex-col relative overflow-hidden rounded-2xl md:rounded-[2rem] bg-white border border-gray-100 transition-all duration-500 group-hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)]">

          {/* BADGES */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            {product.isBestseller && (
              <div className="text-[9px] tracking-[0.2em] font-black bg-[var(--brand-primary)] text-white px-3 py-1.5 rounded-lg shadow-lg uppercase">
                BEST SELLER
              </div>
            )}
            {(product.isPopular || ["Heaven's Embrace", "Incensum", "Sacred Serenity", "Eterna Lume"].includes(product.name)) && !product.isBestseller && (
              <div className="text-[9px] tracking-[0.2em] font-black bg-[var(--brand-accent)] text-white px-3 py-1.5 rounded-lg shadow-lg uppercase">
                POPULAR
              </div>
            )}
          </div>

          {/* WISHLIST */}
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              toggleWishlist(product.id)
            }}
            className={`absolute top-4 right-4 z-10 rounded-xl p-2.5 backdrop-blur-md transition-all duration-300 shadow-md border group/heart ${isWishlisted
              ? 'bg-[var(--brand-primary)] border-transparent text-white'
              : 'bg-white/80 border-gray-100 text-[var(--brand-primary)] hover:bg-[var(--brand-accent)] hover:text-white'
              }`}
          >
            <motion.div whileTap={{ scale: 1.4 }}>
              <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
            </motion.div>
          </button>

          {/* IMAGE SECTION WITH HOVER SWAP */}
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-50">
            {/* Main Image */}
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              priority={priority}
              placeholder="blur"
              blurDataURL={getCloudinaryBlurUrl(imageUrl)}
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className="object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:opacity-0"
            />
            
            {/* Hover Image (Ghost Hook) */}
            <Image
              src={secondaryImageUrl}
              alt={product.name}
              fill
              className="object-cover transition-all duration-700 ease-out scale-110 opacity-0 group-hover:opacity-100 group-hover:scale-100"
            />

            {/* QUICK ADD OVERLAY */}
            <div className="absolute inset-x-0 bottom-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out hidden md:block z-20">
              <button 
                onClick={handleAdd} 
                disabled={loading} 
                className="w-full bg-[var(--brand-primary)] text-white py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-[#1B3B60] transition-colors flex items-center justify-center gap-2"
              >
                {added ? <Check size={14} /> : <ShoppingBag size={14} />}
                {added ? "ADDED" : loading ? "ADDING..." : "QUICK ADD"}
              </button>
            </div>
            
            {/* SOFT VIGNETTE */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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
    </motion.div>
  )
}