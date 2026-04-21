"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"

import { api } from "@/lib/api"
import { useCart } from "@/context/CartContext"
import ProductCard from "@/components/ProductCard"
import { flyToCart } from "@/lib/flyToCart"

import { ProductFull, ProductVariant } from "@/types/product"
import { transformProductToCard } from "@/lib/transformProduct"

import Reviews from "@/components/Reviews"
import ReviewForm from "@/components/ReviewForm"

import { getImageUrl } from "@/lib/image"
import { Check, ArrowRight } from "lucide-react"

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
  const price = variant?.price || 0

  /* =========================
     UI
  ========================= */

  return (
    <div className="max-w-[1440px] mx-auto py-8 md:py-16 px-6 md:px-12 pb-32">
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-12 lg:gap-20">

        {/* --- LEFT: VISUALS --- */}
        <div className="lg:col-span-7 space-y-6">
          <div className="relative bg-white rounded-[3rem] border border-[var(--border-light)] shadow-2xl w-full aspect-square md:aspect-[4/5] overflow-hidden group">
            <Image
              id="product-main-image"
              src={getImageUrl(activeImage || "/placeholder.png")}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 60vw"
              className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
              priority
            />
            {product.isBestseller && (
              <div className="absolute top-8 left-8 z-10 bg-black text-white px-5 py-2 rounded-full text-[10px] font-[1000] uppercase tracking-[0.2em] shadow-2xl backdrop-blur-md bg-black/80">
                Flagship Choice
              </div>
            )}
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 px-2 scrollbar-hide">
            {product.images.map((img, i) => {
              const isActive = activeImage === img.url
              return (
                <button
                  key={i}
                  onClick={() => setActiveImage(img.url)}
                  className={`relative overflow-hidden rounded-2xl w-20 h-20 md:w-24 md:h-24 flex-shrink-0 transition-all duration-300 ${isActive
                    ? "ring-2 ring-[var(--brand-primary)] ring-offset-4 opacity-100 scale-95 shadow-lg"
                    : "border border-[var(--border-light)] opacity-40 hover:opacity-100 hover:scale-105"
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

        {/* --- RIGHT: INTELLIGENCE --- */}
        <div className="lg:col-span-5 flex flex-col pt-4 lg:pt-0">
          <div className="sticky top-24 space-y-10">
            
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-[var(--brand-primary)]"></span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--brand-primary)]">
                  Originals Series • 2026
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-[1000] text-[var(--text-heading)] leading-[0.95] tracking-tighter">
                {product.name}
              </h1>
              <div className="flex items-center gap-6 pt-2">
                <div className="text-3xl md:text-4xl font-black text-[var(--brand-primary)]">
                  ₱{Number(price).toLocaleString()}
                </div>
                {product.isPopular && (
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[9px] font-black uppercase tracking-widest rounded-lg border border-amber-200">
                    Popular
                  </span>
                )}
              </div>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-[var(--border-light)] to-transparent"></div>

            {/* Config & Variants */}
            <div className="space-y-10">
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
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                      Choose {name}
                    </p>
                    <div className="flex gap-2.5 flex-wrap">
                      {values.map((val) => {
                        const isActive = selections[name] === val
                        const isOut = !product.variants.some(v => 
                          v.attributes.some(a => a.name === name && a.value === val) && v.stock > 0
                        )

                        return (
                          <button
                            key={val}
                            disabled={isOut}
                            onClick={() => handleAttrClick(name, val)}
                            className={`
                              px-8 py-4 rounded-2xl text-[11px] font-black tracking-widest uppercase transition-all duration-500 border-2
                              ${isOut 
                                ? "opacity-20 cursor-not-allowed line-through bg-gray-50 border-gray-100" 
                                : isActive
                                  ? "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)] shadow-2xl scale-[1.02]"
                                  : "bg-white border-[var(--border-light)] text-gray-500 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] hover:shadow-lg"
                              }
                            `}
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

            {/* Description */}
            <div className="space-y-3 pt-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--brand-primary)]">Architecture & Care</p>
              <p className="text-sm md:text-base text-[var(--text-muted)] font-medium leading-relaxed max-w-md">
                {product.description || "Every stitch and scent profile is engineered for those who demand excellence in the everyday. A synthesis of tradition and modern innovation."}
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-6 pt-6 ">
              <div className="flex flex-col sm:flex-row gap-4 items-stretch">
                {/* QTY */}
                <div className="flex items-center justify-between border-2 border-[var(--border-light)] bg-white rounded-2xl w-full sm:w-44 overflow-hidden h-16 shadow-sm">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="w-14 h-full flex items-center justify-center text-[var(--text-main)] hover:bg-gray-50 transition-colors active:scale-90 text-xl font-bold"
                  >
                    −
                  </button>
                  <span className="flex-1 text-center font-black text-lg text-[var(--text-heading)]">{qty}</span>
                  <button
                    onClick={() => setQty((q) => Math.min(stock, q + 1))}
                    className="w-14 h-full flex items-center justify-center text-[var(--text-main)] hover:bg-gray-50 transition-colors active:scale-90 text-xl font-bold"
                  >
                    +
                  </button>
                </div>

                {/* ADD */}
                <button
                  onClick={handleAdd}
                  disabled={stock === 0 || adding}
                  className="btn-premium flex-1 !h-16 !rounded-2xl !text-[11px] !font-black !tracking-[0.2em] !uppercase shadow-2xl shadow-[var(--brand-primary)]/20 group"
                >
                  {added ? <Check size={24} className="animate-in zoom-in" /> : adding ? "Preparing Order..." : (
                    <span className="flex items-center justify-center gap-3">
                      Add to Collection <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </button>
              </div>

              {/* Status */}
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${stock > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-[10px] font-[1000] uppercase tracking-[0.2em] text-gray-400">
                  {stock > 0 ? `Inventory Ready (${stock} pieces)` : 'Waitlist Exclusive'}
                </span>
              </div>
            </div>

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

      {/* RELATED */}
      {related.length > 0 && (
        <div className="mt-14">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-[2px] w-8 bg-[var(--brand-primary)]"></div>
            <h2 className="text-xl md:text-2xl font-bold tracking-[0.1em] text-[var(--brand-primary)] uppercase">
              You May Also Like
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((p) => (
              <ProductCard
                key={p.id}
                product={transformProductToCard(p)}
              />
            ))}
          </div>
        </div>
      )}

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