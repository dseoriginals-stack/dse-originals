"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"

import { api } from "@/lib/api"
import { useCart } from "@/context/CartContext"
import ProductCard from "@/components/ProductCard"
import RecommendationStrip from "@/components/product/RecommendationStrip"
import { flyToCart } from "@/lib/flyToCart"

import { ProductFull, ProductVariant } from "@/types/product"
import { transformProductToCard } from "@/lib/transformProduct"

import Reviews from "@/components/Reviews"
import ReviewForm from "@/components/ReviewForm"
import CinematicLookbook from "@/components/product/CinematicLookbook"

import { getImageUrl } from "@/lib/image"
import { Check } from "lucide-react"

export default function ProductClient() {
  const params = useParams()
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug
  const router = useRouter()

  const { addToCart } = useCart()

  const [product, setProduct] = useState<ProductFull | null>(null)
  const [related, setRelated] = useState<ProductFull[]>([])
  const [variant, setVariant] = useState<ProductVariant | null>(null)

  const [qty, setQty] = useState(1)
  const [activeImage, setActiveImage] = useState("")
  const [loading, setLoading] = useState(true)

  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)

  const [refreshReviews, setRefreshReviews] = useState(0)

  /* =========================
     FETCH (FIXED)
  ========================= */

  useEffect(() => {
    if (!slug) return

    async function fetchData() {
      try {
        // ✅ CORRECT ENDPOINT
        const res = await api.get<ProductFull>(`/products/slug/${slug}`)

        if (!res) throw new Error("Product not found")

        setProduct(res)

        const firstAvailable =
          res.variants.find(v => v.stock > 0) || res.variants[0]

        setVariant(firstAvailable)

        setActiveImage(res.images?.[0]?.url ?? "/placeholder.png")

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
      price: Number(variant.price),
      quantity: qty,
      image: getImageUrl(activeImage),
    })

    setAdded(true)
    setTimeout(() => {
      setAdded(false)
      setAdding(false)
      router.push("/cart")
    }, 600)
  }

  /* =========================
     STATES
  ========================= */

  if (loading) {
    return (
      <div className="container py-20 text-center">
        Loading...
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container py-20 text-center">
        Product not found
      </div>
    )
  }

  const stock = variant?.stock || 0
  
  // ✅ CUSTOM PRICE LOGIC (Standardized for Perfumes)
  const getDisplayPrice = () => {
    if (!variant) return 0
    const attrValues = (variant.attributes || []).map((a) => (a.value || "").toLowerCase())
    
    if (attrValues.some(v => v.includes("55ml"))) return 349
    if (attrValues.some(v => v.includes("30ml"))) return 249
    
    return Number(variant.price)
  }

  const price = getDisplayPrice()

  /* =========================
     UI
  ========================= */

  return (
    <div className="max-w-[1300px] mx-auto py-6 md:py-10 px-4 md:px-8 pb-28">

      <div className="grid lg:grid-cols-2 gap-6 md:gap-10">

        {/* IMAGE */}
        <div>
          <div className="relative bg-[var(--bg-surface)] rounded-2xl md:rounded-3xl border border-[var(--border-light)] shadow-xl w-full aspect-[4/5] max-h-[500px] md:max-h-[600px] overflow-hidden flex items-center justify-center group">
            <Image
              id="product-main-image"
              src={getImageUrl(activeImage || "/placeholder.png")}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain transition-transform duration-700 ease-out md:group-hover:scale-105 p-4"
              priority
            />
          </div>

          <div className="flex gap-3 mt-4 overflow-x-auto px-1 py-2 custom-scrollbar">
            {product.images.map((img, i) => {
              const isActive = activeImage === img.url

              return (
                <button
                  key={i}
                  onClick={() => setActiveImage(img.url)}
                  className={`relative overflow-hidden rounded-xl w-16 h-16 md:w-20 md:h-20 flex-shrink-0 transition-all duration-300 ${isActive
                    ? "ring-2 ring-[var(--brand-primary)] ring-offset-4 opacity-100 shadow-md scale-95"
                    : "border border-[var(--border-light)] opacity-50 hover:opacity-100 hover:scale-105"
                    }`}
                >
                  <Image
                    src={getImageUrl(img.url)}
                    alt={product.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </button>
              )
            })}
          </div>
        </div>

        {/* INFO */}
        <div className="bg-[var(--bg-card)] rounded-2xl md:rounded-3xl border border-[var(--border-light)] shadow-lg p-5 md:p-8 space-y-4 md:space-y-6 flex flex-col justify-center">
          <div>
            <span className="inline-block px-2.5 py-0.5 bg-[var(--brand-soft)]/20 text-[var(--brand-primary)] text-[9px] font-bold uppercase tracking-widest rounded-full mb-2">
              DSE Premium Collection
            </span>
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
              product.variants.forEach((v) => {
                v.attributes.forEach((attr) => {
                  if (!grouped[attr.name]) grouped[attr.name] = []
                  if (!grouped[attr.name].includes(attr.value)) {
                    grouped[attr.name].push(attr.value)
                  }
                })
              })

              const selections: Record<string, string> = {}
              variant?.attributes.forEach(a => {
                selections[a.name] = a.value
              })

              const handleAttrClick = (name: string, value: string) => {
                const next = { ...selections, [name]: value }
                const match = product.variants.find(v =>
                  v.attributes.every(a => next[a.name] === a.value)
                )

                if (match) {
                  setVariant(match)
                } else {
                  const fallback = product.variants.find(v =>
                    v.attributes.some(a => a.name === name && a.value === value)
                  )
                  if (fallback) setVariant(fallback)
                }
              }

              return Object.entries(grouped).map(([name, values]) => (
                <div key={name} className="space-y-4">
                  <h3 className="text-[10px] font-bold text-[var(--text-heading)] uppercase tracking-[0.2em]">Select {name}</h3>
                  <div className="flex gap-3 flex-wrap">
                    {values.map((val) => {
                      const isActive = selections[name] === val
                      const isOut = !product.variants.some(v => 
                        v.attributes.some(a => a.name === name && a.value === val) && v.stock > 0
                      )

                      // Removed Circle Color Logic as per user request
                      return (
                        <button
                          key={val}
                          disabled={isOut}
                          onClick={() => handleAttrClick(name, val)}
                          className={`px-4 py-2 rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all duration-300 border-2 ${isOut
                            ? "opacity-30 bg-gray-50 border-gray-100 line-through cursor-not-allowed"
                            : isActive
                              ? "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)] shadow-[0_8px_20px_rgba(39,76,119,0.25)] scale-[1.05]"
                              : "bg-white border-[var(--border-light)] text-[var(--text-muted)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
                            }`}
                        >
                          {val}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))
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
              {adding ? "Preparing Order..." : added ? "Successfully Added" : "Add to Cart Now"}
            </button>
          </div>
        </div>
      </div>

      {/* REVIEWS */}
      <div className="mt-10">
        <ReviewForm
          productId={product.id}
          onSuccess={() => setRefreshReviews((p) => p + 1)}
        />

        <Reviews key={refreshReviews} productId={product.id} />
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

      {/* MOBILE BAR */}
      <div className="fixed bottom-0 left-0 right-0 glass-header border-t p-4 md:hidden pb-safe">
        <div className="flex gap-4 items-center max-w-lg mx-auto">
          <div className="flex-1">
            <div className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider">Total</div>
            <div className="font-bold text-base text-[var(--brand-primary)]">₱{Number(price * qty).toLocaleString()}</div>
          </div>

          <button
            onClick={handleAdd}
            disabled={stock === 0 || adding}
            className="btn-premium flex-1 !py-3 px-2 shadow-md flex items-center justify-center"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}