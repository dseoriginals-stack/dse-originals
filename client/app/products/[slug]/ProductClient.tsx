"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"

import { api } from "@/lib/api"
import { useCart } from "@/context/CartContext"
import { useAuth } from "@/context/AuthContext"
import ProductCard from "@/components/ProductCard"
import RecommendationStrip from "@/components/product/RecommendationStrip"
import { flyToCart } from "@/lib/flyToCart"

import { ProductFull, ProductVariant } from "@/types/product"
import { transformProductToCard } from "@/lib/transformProduct"

import Reviews from "@/components/Reviews"
import ReviewForm from "@/components/ReviewForm"
import ProductQA from "@/components/ProductQA"
import CinematicLookbook from "@/components/product/CinematicLookbook"

import { getImageUrl } from "@/lib/image"
import { getCloudinaryBlurUrl } from "@/lib/imageUtils"
import { Check, Share2, Facebook, ArrowLeft } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"

export default function ProductClient({ initialProduct }: { initialProduct: ProductFull | null }) {
  const params = useParams()
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug
  const router = useRouter()

  const { addToCart } = useCart()
  const { user } = useAuth() as any

  // HELPER FOR VARIANT SORTING (55ml -> 30ml -> Others)
  const sortVariants = (vars: ProductVariant[]) => {
    return [...vars].sort((a, b) => {
      const getVal = (v: ProductVariant) => 
        v.attributes?.find(at => {
          const name = String(at.name || "").toLowerCase()
          return name === "volume" || name === "size" || name === "variant"
        })?.value?.toLowerCase() || ""
      
      const aVal = getVal(a)
      const bVal = getVal(b)
      
      if (aVal.includes("55ml") && !bVal.includes("55ml")) return -1
      if (!aVal.includes("55ml") && bVal.includes("55ml")) return 1
      if (aVal.includes("30ml") && !bVal.includes("30ml")) return -1
      if (!aVal.includes("30ml") && bVal.includes("30ml")) return 1
      return 0
    })
  }

  // Pre-sort initial variants if they exist
  if (initialProduct?.variants) {
    initialProduct.variants = sortVariants(initialProduct.variants)
  }

  const [product, setProduct] = useState<ProductFull | null>(initialProduct)
  const [related, setRelated] = useState<ProductFull[]>([])
  
  // Define initial variant (Prioritize 55ml which is now first after sort)
  const initialVariant = product?.variants?.find(v => v.stock > 0) || product?.variants?.[0] || null
  const [variant, setVariant] = useState<ProductVariant | null>(initialVariant)

  // ✅ Track selections independently
  const [selections, setSelections] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    initialVariant?.attributes?.forEach(a => {
      if (a.name === "Sizes") {
         const parsedSizes = (a.value || "").split(",").map(s => s.trim()).filter(Boolean)
         if (parsedSizes.length > 0) initial["Size"] = parsedSizes[0]
      } else {
         initial[a.name] = a.value
      }
    })
    return initial
  })

  // ✅ Keep variant in sync with selections
  useEffect(() => {
    if (!product) return
    const match = product.variants?.find(v =>
      Object.entries(selections).every(([name, value]) => {
        if (name === "Size" && v.attributes?.some(a => a.name === "Sizes")) {
          return v.attributes.find(a => a.name === "Sizes")?.value.split(",").map(s => s.trim()).includes(value)
        }
        return v.attributes?.some(a => a.name === name && a.value === value)
      })
    )
    if (match && match.id !== variant?.id) {
      setVariant(match)
      if (match.image) setActiveImage(match.image)
    }
  }, [selections, product])

  const [qty, setQty] = useState(1)
  
  // Determine initial image with multiple fallbacks
  const getInitialImage = () => {
    if (initialVariant?.image) return initialVariant.image
    if (product?.images?.[0]?.url) return product.images[0].url
    // Fallback to ANY variant image if primary is missing
    const anyVarImg = product?.variants?.find(v => v.image)?.image
    if (anyVarImg) return anyVarImg
    return "/placeholder.png"
  }
  
  const [activeImage, setActiveImage] = useState(getInitialImage())
  const [loading, setLoading] = useState(!initialProduct)

  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)

  const [refreshReviews, setRefreshReviews] = useState(0)

  /* =========================
     FETCH (FIXED)
  ========================= */

  useEffect(() => {
    if (!slug) return
    if (product && product.slug === slug) {
       // Just fetch related if needed
       async function fetchRelated() {
         try {
           const rel = await api.get<ProductFull[]>(`/products/${product!.id}/related`)
           setRelated(rel)
         } catch {}
       }
       fetchRelated()
       return
    }
    async function fetchData() {
      try {
        // ✅ CORRECT ENDPOINT
        const res = await api.get<ProductFull>(`/products/slug/${slug}`)

        if (!res) throw new Error("Product not found")

        // Sort variants so 55ml comes before 30ml
        if (res.variants) {
          res.variants = sortVariants(res.variants)
        }

        setProduct(res)

        // Initial Selections
        const firstAvailable =
          res.variants.find(v => v.stock > 0) || res.variants[0]

        setVariant(firstAvailable)
        
        const initialSel: Record<string, string> = {}
        firstAvailable?.attributes?.forEach(a => {
          if (a.name === "Sizes") {
             const parsedSizes = (a.value || "").split(",").map(s => s.trim()).filter(Boolean)
             if (parsedSizes.length > 0) initialSel["Size"] = parsedSizes[0]
          } else {
             initialSel[a.name] = a.value
          }
        })
        setSelections(initialSel)

        const fallbackImg = res.images?.[0]?.url || res.variants.find(v => v.image)?.image || "/placeholder.png"
        setActiveImage(firstAvailable?.image || fallbackImg)

        // OPTIONAL: related (only if you have this route)
        try {
          const rel = await api.get<ProductFull[]>(
            `/products/${res.id}/related`
          )
          setRelated(rel)
        } catch {
          setRelated([])
        }

      } catch (err) {
        console.error("❌ Product fetch error:", err)
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [slug])

  // ✅ CUSTOM PRICE LOGIC (Standardized for Perfumes)
  const getDisplayPrice = () => {
    if (!variant) return 0
    const attrValues = (variant.attributes || []).map((a) => String(a.value || "").toLowerCase())
    
    if (attrValues.some(v => v.includes("55ml"))) return 349
    if (attrValues.some(v => v.includes("30ml"))) return 249
    
    return Number(variant.price)
  }

  const price = getDisplayPrice()

  /* =========================
     ADD TO CART
  ========================= */

  const handleAdd = async () => {
    if (!product || !variant || variant.stock === 0 || adding) return

    setAdding(true)

    const img = document.querySelector(
      "#product-main-image"
    ) as HTMLImageElement
    const cart = document.getElementById("cart-icon")

    if (img && cart) {
      flyToCart(img, cart)
    }

    await addToCart({
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      price: price,
      quantity: qty,
      category: product.category,
      image: getImageUrl(activeImage),
      attributes: Object.entries(selections).map(([name, value]) => ({ name, value }))
    })

    setAdded(true)
    setTimeout(() => {
      setAdded(false)
      setAdding(false)
      router.push("/cart")
    }, 600)
  }

  const handleShare = async () => {
    if (typeof window === "undefined") return
    const url = window.location.href
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name || "DSE Originals",
          text: product?.description || "Check out this product from DSE Originals!",
          url: url,
        })
      } catch (err) {
        // User cancelled or error
        if ((err as Error).name !== 'AbortError') {
          navigator.clipboard.writeText(url)
          toast.success("Link copied to clipboard!")
        }
      }
    } else {
      navigator.clipboard.writeText(url)
      toast.success("Link copied to clipboard!")
    }
  }

  const handleFBShare = () => {
    if (typeof window === "undefined") return
    const url = window.location.href
    const quote = `Check out ${product?.name} at DSE Originals! 🔥`
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(quote)}`, '_blank')
  }

  const handleThumbnailClick = (imgUrl: string) => {
    setActiveImage(imgUrl)

    if (!product?.variants) return

    // Find all variants that use this image
    const matchingVariants = product.variants.filter(v => v.image === imgUrl)
    if (matchingVariants.length === 0) return

    // Try to find a variant that matches current selections (to preserve Size if possible)
    const bestMatch = matchingVariants.find(v =>
      Object.entries(selections).every(([name, value]) => {
        if (name === "Size" && v.attributes?.some(a => a.name === "Sizes")) {
          return v.attributes.find(a => a.name === "Sizes")?.value.split(",").map(s => s.trim()).includes(value)
        }
        return v.attributes?.some(a => a.name === name && a.value === value)
      })
    ) || matchingVariants[0]

    // Update selections based on bestMatch
    const nextSelections = { ...selections }
    bestMatch.attributes?.forEach(a => {
      if (a.name === "Sizes") {
        const vals = (a.value || "").split(",").map(s => s.trim()).filter(Boolean)
        // If current size is not in the new variant's sizes, pick the first one
        if (vals.length > 0 && (!selections["Size"] || !vals.includes(selections["Size"]))) {
          nextSelections["Size"] = vals[0]
        }
      } else {
        nextSelections[a.name] = a.value
      }
    })
    setSelections(nextSelections)
  }

  /* =========================
     STATES (REMOVED LOADING)
  ========================= */

  if (!product) {
    return (
      <div className="container py-20 text-center">
        Product not found
      </div>
    )
  }

  const stock = variant?.stock || 0
  


  /* =========================
     UI
  ========================= */

  return (
    <div className="max-w-[1300px] mx-auto py-6 md:py-10 px-4 md:px-8 pb-28">
      {/* BACK BUTTON */}
      <div className="mb-6">
        <Link 
          href="/products"
          className="group flex items-center gap-2 text-xs font-black text-[var(--text-muted)] hover:text-[var(--brand-primary)] transition-all uppercase tracking-[0.2em]"
        >
          <div className="w-8 h-8 rounded-full bg-white border border-[var(--border-light)] flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:-translate-x-1 transition-all">
            <ArrowLeft size={16} />
          </div>
          Back to Products
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 md:gap-10">

        {/* IMAGE */}
        <div>
          <div className="relative bg-[var(--bg-surface)] rounded-2xl md:rounded-3xl border border-[var(--border-light)] shadow-xl w-full aspect-square md:aspect-[4/5] max-h-[400px] md:max-h-[650px] overflow-hidden group">
            <Image
              id="product-main-image"
              src={getImageUrl(activeImage || "/placeholder.png")}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
              className="object-cover transition-transform duration-700 ease-out md:group-hover:scale-105"
              priority
              placeholder="blur"
              blurDataURL={getCloudinaryBlurUrl(activeImage)}
            />
            {/* Optional subtle gradient overlay for premium feel */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none"></div>
          </div>

          <div className="flex gap-3 mt-4 overflow-x-auto px-1 py-2 custom-scrollbar">
            {(() => {
              const allImages = [...(product.images || [])]
              product.variants?.forEach(v => {
                if (v.image && !allImages.some(img => img.url === v.image)) {
                  allImages.push({ url: v.image, isPrimary: false })
                }
              })

              return allImages.map((img, i) => {
                const isActive = activeImage === img.url

                return (
                  <button
                    key={i}
                    onClick={() => handleThumbnailClick(img.url)}
                    className={`relative overflow-hidden rounded-xl w-16 h-16 md:w-20 md:h-20 flex-shrink-0 transition-all duration-300 ${isActive
                      ? "ring-2 ring-[var(--brand-primary)] ring-offset-4 opacity-100 shadow-md scale-95"
                      : "border border-[var(--border-light)] opacity-50 hover:opacity-100 hover:scale-105"
                      }`}
                  >
                    <Image
                      src={getImageUrl(img.url)}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 64px, 80px"
                      className="object-cover"
                    />
                  </button>
                )
              })
            })()}
          </div>
        </div>

        {/* INFO */}
        <div className="bg-[var(--bg-card)] rounded-2xl md:rounded-3xl border border-[var(--border-light)] shadow-lg p-5 md:p-8 space-y-4 md:space-y-6 flex flex-col justify-center">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-block px-2.5 py-0.5 bg-[var(--brand-soft)]/20 text-[var(--brand-primary)] text-[9px] font-bold uppercase tracking-widest rounded-full">
                DSE Premium Collection
              </span>
              {product.isBestseller && (
                <span className="inline-block px-2.5 py-0.5 bg-amber-400 text-[#274C77] text-[9px] font-black uppercase tracking-widest rounded-full shadow-sm animate-pulse-subtle">
                  ★ BEST SELLER
                </span>
              )}
              {product.isPopular && !product.isBestseller && (
                <span className="inline-block px-2.5 py-0.5 bg-[var(--brand-accent)] text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-sm animate-pulse-subtle">
                  POPULAR
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-[var(--text-heading)] leading-tight tracking-tight">{product.name}</h1>
          </div>

          <div className="text-2xl md:text-3xl font-black text-[var(--brand-primary)]">
            ₱{Number(price).toLocaleString()}
          </div>

          <p className="text-[var(--text-muted)] text-sm md:text-base leading-relaxed font-medium">{product.description || "Premium product meticulously crafted for a refined and luxurious experience."}</p>

          {/* CINEMATIC LOOKBOOK TRIGGER */}
          {(product.videoUrl || product.storyHtml) && (
            <div className="pt-2">
              <CinematicLookbook product={product as any} />
            </div>
          )}

          <div className="h-px w-full bg-[var(--border-light)]"></div>

          {/* SEPARATED VARIANTS */}
          <div className="space-y-6">
            {(() => {
              const grouped: Record<string, string[]> = {}
              product.variants?.forEach((v) => {
                v.attributes?.forEach((attr) => {
                  if (attr.name === "Sizes") {
                    (attr.value || "").split(",").forEach(val => {
                      const trimmed = val.trim()
                      if (!trimmed) return
                      if (!grouped["Size"]) grouped["Size"] = []
                      if (!grouped["Size"].includes(trimmed)) {
                        grouped["Size"].push(trimmed)
                      }
                    })
                  } else {
                    if (!grouped[attr.name]) grouped[attr.name] = []
                    if (!grouped[attr.name].includes(attr.value)) {
                      grouped[attr.name].push(attr.value)
                    }
                  }
                })
              })

              const handleAttrClick = (name: string, value: string) => {
                setSelections(prev => {
                  const next = { ...prev, [name]: value }
                  
                  const match = product.variants?.find(v =>
                    Object.entries(next).every(([n, val]) => {
                      if (n === "Size" && v.attributes?.some(a => a.name === "Sizes")) {
                         return v.attributes.find(a => a.name === "Sizes")?.value.split(",").map(s => s.trim()).includes(val)
                      }
                      return v.attributes?.some(a => a.name === n && a.value === val)
                    })
                  )

                  if (!match) {
                    const fallback = product.variants?.find(v => {
                      if (name === "Size" && v.attributes?.some(a => a.name === "Sizes")) {
                        return v.attributes.find(a => a.name === "Sizes")?.value.split(",").map(s => s.trim()).includes(value)
                      }
                      return v.attributes?.some(a => a.name === name && a.value === value)
                    })
                    if (fallback) {
                      const reset: Record<string, string> = {}
                      fallback.attributes?.forEach(a => { 
                         if (a.name === "Sizes") {
                            reset["Size"] = value 
                         } else {
                            reset[a.name] = a.value 
                         }
                      })
                      return reset
                    }
                  }
                  return next
                })
              }

              // Sort attributes to show Size first, then Color
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
                // Sort sizes logically
                const sizeOrder = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];
                const displayValues = name.toLowerCase() === "size"
                  ? [...values].sort((a, b) => {
                      const indexA = sizeOrder.indexOf(a.toUpperCase());
                      const indexB = sizeOrder.indexOf(b.toUpperCase());
                      if (indexA === -1 && indexB === -1) return a.localeCompare(b);
                      if (indexA === -1) return 1;
                      if (indexB === -1) return -1;
                      return indexA - indexB;
                    })
                  : values;

                return (
                  <div key={name} className="space-y-4">
                    <h3 className="text-[10px] font-bold text-[var(--text-heading)] uppercase tracking-[0.2em]">Select {name}</h3>
                    <div className="flex gap-3 flex-wrap">
                      {displayValues.map((val) => {
                        const isSelected = selections[name] === val
                        
                        const checkMatch = (v: any, attrName: string, attrVal: string) => {
                          if (attrName === "Size") {
                            return v.attributes?.some((a: any) => 
                              (a.name === "Size" && a.value === attrVal) ||
                              (a.name === "Sizes" && a.value.split(",").map((s: any) => s.trim()).includes(attrVal))
                            )
                          }
                          return v.attributes?.some((a: any) => a.name === attrName && a.value === attrVal)
                        }

                        // Check if this specific attribute value is available at all
                        const exists = product.variants?.some(v => checkMatch(v, name, val))

                        // Check if it's available with current OTHER selections
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
                            onClick={() => handleAttrClick(name, val)}
                            className={`px-6 py-3.5 md:px-5 md:py-2 rounded-2xl text-[11px] md:text-[10px] font-black tracking-widest uppercase transition-all duration-300 border-2 ${!exists 
                              ? "opacity-20 cursor-not-allowed line-through"
                              : isSelected
                                ? "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)] shadow-[0_8px_20px_rgba(39,76,119,0.25)] scale-[1.05]"
                                : !isAvailable
                                  ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed opacity-60"
                                  : "bg-white border-[var(--border-light)] text-[var(--text-muted)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
                              }`}
                          >
                            {val}
                            {!isAvailable && exists && <span className="ml-2 opacity-50 text-[8px]">Out</span>}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })
            })()}

          </div>

          {/* STOCK */}
          <div className="text-sm font-bold tracking-widest uppercase">
            {stock > 0 ? (
              <span className="text-emerald-700 bg-emerald-100/50 border border-emerald-200 px-4 py-2 rounded-full flex items-center w-fit shadow-sm"><span className="mr-2 shadow-sm rounded-full bg-emerald-500 w-2.5 h-2.5 inline-block animate-pulse"></span>In stock, ready to ship</span>
            ) : (
              <span className="text-red-700 bg-red-100/50 border border-red-200 px-4 py-2 rounded-full flex items-center w-fit shadow-sm"><span className="mr-2 shadow-sm rounded-full bg-red-500 w-2.5 h-2.5 inline-block"></span>Currently Out of Stock</span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-stretch pt-3 border-t border-[var(--border-light)]">
            {/* QTY */}
            <div className="flex items-center justify-between border-2 border-[var(--border-light)] bg-[var(--bg-surface)] rounded-xl w-full sm:w-36 overflow-hidden h-12 shadow-inner">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-10 h-full flex items-center justify-center text-[var(--text-main)] hover:bg-[var(--border-light)] transition-colors active:scale-95 text-lg font-bold"
              >
                −
              </button>

              <span className="flex-1 text-center font-black text-base text-[var(--text-heading)]">{qty}</span>

              <button
                onClick={() => setQty((q) => Math.min(stock, q + 1))}
                className="w-10 h-full flex items-center justify-center text-[var(--text-main)] hover:bg-[var(--border-light)] transition-colors active:scale-95 text-lg font-bold"
              >
                +
              </button>
            </div>

            {/* ADD */}
            <button
              onClick={handleAdd}
              disabled={stock === 0 || adding}
              className="btn-premium flex-1 !h-12 !rounded-xl !text-sm shadow-lg"
            >
              {added && <Check size={24} />}
              {adding ? "Preparing Order..." : added ? "Successfully Added" : "Buy Now"}
            </button>
            <button
              onClick={handleShare}
              className="w-12 h-12 flex items-center justify-center rounded-xl border-2 border-[var(--border-light)] text-[var(--text-muted)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-all active:scale-90 shadow-sm"
              title="Share Product"
            >
              <Share2 size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* REVIEWS */}
      <div className="mt-10">
        {user ? (
          <ReviewForm
            productId={product.id}
            onSuccess={() => setRefreshReviews((p) => p + 1)}
          />
        ) : (
          <div className="bg-gray-50/50 rounded-[2.5rem] p-10 text-center border-2 border-dashed border-gray-200 mb-12">
            <h4 className="text-lg font-black text-[var(--text-heading)] mb-2">Want to leave a review?</h4>
            <p className="text-[var(--text-muted)] text-sm mb-6 font-medium">Please log in to share your experience with the community.</p>
            <Link href="/account" className="btn-premium px-8 !py-4 rounded-xl text-xs inline-flex shadow-sm">Login to Review</Link>
          </div>
        )}

        <Reviews key={refreshReviews} productId={product.id} />
      </div>

      {/* Q&A SECTION */}
      <div className="mt-6 mb-16">
        <ProductQA productId={product.id} />
      </div>

      {/* DYNAMIC RECOMMENDATIONS */}
      <div className="space-y-10">
        <RecommendationStrip 
          type="together" 
          productId={product.id} 
          title="Frequently Bought Together" 
          subtitle="Customer favorites" 
        />
        <RecommendationStrip 
          type="related" 
          productId={product.id} 
          title="More from this collection" 
          subtitle="Similar styles" 
        />
      </div>

      {/* MOBILE BAR (CLEANED) */}
      <div className="fixed bottom-0 left-0 right-0 glass-header border-t p-4 md:hidden pb-safe">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleAdd}
            disabled={stock === 0 || adding}
            className="btn-premium w-full !py-4 shadow-xl flex items-center justify-center text-sm font-black uppercase tracking-[0.2em]"
          >
            {adding ? "Processing..." : "Buy Now"}
          </button>
        </div>
      </div>
    </div>
  )
}