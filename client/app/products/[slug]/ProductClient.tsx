"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
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

export default function ProductClient() {
  const params = useParams()
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug

  const { addToCart } = useCart()

  const [product, setProduct] = useState<ProductFull | null>(null)
  const [related, setRelated] = useState<ProductFull[]>([])
  const [variant, setVariant] = useState<ProductVariant | null>(null)

  const [qty, setQty] = useState(1)
  const [activeImage, setActiveImage] = useState("")
  const [loading, setLoading] = useState(true)
  const [added, setAdded] = useState(false)

  const [refreshReviews, setRefreshReviews] = useState(0)

  /* =========================
     FETCH
  ========================= */

  useEffect(() => {
    if (!slug) return

    async function fetchData() {
      try {
        const data = await api.get<ProductFull[]>("/products")

        const res = data.find((p: ProductFull) => p.slug === slug)

        if (!res) throw new Error("Product not found")

        setProduct(res)

        const firstAvailable =
          res.variants.find(v => v.stock > 0) || res.variants[0]

        setVariant(firstAvailable)

        setActiveImage(res.images?.[0]?.url ?? "/placeholder.png")

        const rel = await api.get<ProductFull[]>(
          `/products/${res.id}/related`
        )

        setRelated(rel)
      } catch (err) {
        console.error("❌ Product fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [slug])

  /* =========================
     ADD TO CART
  ========================= */

  const handleAdd = () => {
    if (!product || !variant || variant.stock === 0) return

    const img = document.querySelector(
      "#product-main-image"
    ) as HTMLImageElement
    const cart = document.getElementById("cart-icon")

    if (img && cart) {
      flyToCart(img, cart)
    }

    addToCart({
      variantId: variant.id,
      name: product.name,
      price: Number(variant.price),
      quantity: qty,
      image: getImageUrl(activeImage),
    })

    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  /* =========================
     STATES
  ========================= */

  if (loading) {
    return <div className="container py-20 text-center">Loading...</div>
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
    <div className="container py-6 md:py-12 pb-28">
      <div className="grid lg:grid-cols-2 gap-8 md:gap-14">
        
        {/* IMAGE */}
        <div>
          <div className="relative bg-white rounded-2xl border border-slate-100 shadow-sm h-[320px] md:h-[520px] overflow-hidden">
            <Image
              id="product-main-image"
              src={getImageUrl(activeImage || "/placeholder.png")}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain"
              priority
            />
          </div>

          <div className="flex gap-3 mt-4 overflow-x-auto px-1">
            {product.images.map((img, i) => {
              const isActive = activeImage === img.url

              return (
                <button
                  key={i}
                  onClick={() => setActiveImage(img.url)}
                  className={`border rounded-lg p-1 ${
                    isActive
                      ? "border-[#274C77] ring-1 ring-[#274C77]"
                      : "border-gray-200"
                  }`}
                >
                  <Image
                    src={getImageUrl(img.url)}
                    alt={product.name}
                    width={64}
                    height={64}
                    className="object-cover rounded-md"
                    unoptimized
                  />
                </button>
              )
            })}
          </div>
        </div>

        {/* INFO */}
        <div className="space-y-6">
          <h1 className="text-3xl font-semibold">{product.name}</h1>

          <div className="text-3xl font-bold">
            ₱{Number(price).toLocaleString()}
          </div>

          <p className="text-gray-600">{product.description}</p>

          {/* VARIANTS */}
          <div className="flex gap-2 overflow-x-auto">
            {product.variants.map((v) => {
              const isOut = v.stock === 0
              const isActive = variant?.id === v.id

              return (
                <button
                  key={v.id}
                  disabled={isOut}
                  onClick={() => setVariant(v)}
                  className={`px-4 py-2 border rounded-full text-sm ${
                    isOut
                      ? "opacity-40 line-through"
                      : isActive
                      ? "bg-[#274C77] text-white"
                      : "bg-white"
                  }`}
                >
                  {v.attributes?.length
                    ? v.attributes.map((a: any) => a.value).join(" / ")
                    : "Default"}
                </button>
              )
            })}
          </div>

          {/* STOCK */}
          <div className="text-sm">
            {stock > 0 ? (
              <span className="text-green-600">In stock ({stock})</span>
            ) : (
              <span className="text-red-500">Out of stock</span>
            )}
          </div>

          {/* QTY */}
          <div className="flex items-center border rounded-xl w-fit">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="px-4 py-2"
            >
              −
            </button>

            <span className="px-5">{qty}</span>

            <button
              onClick={() => setQty((q) => Math.min(stock, q + 1))}
              className="px-4 py-2"
            >
              +
            </button>
          </div>

          {/* ADD */}
          <button
            onClick={handleAdd}
            disabled={stock === 0}
            className="w-full bg-[#274C77] text-white py-4 rounded-xl"
          >
            {added ? "✓ Added to Cart" : "Add to Cart"}
          </button>
        </div>
      </div>

      {/* REVIEWS */}
      <div className="mt-16">
        <ReviewForm
          productId={product.id}
          onSuccess={() => setRefreshReviews((p) => p + 1)}
        />

        <Reviews key={refreshReviews} productId={product.id} />
      </div>

      {/* RELATED */}
      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="text-2xl font-semibold mb-6">
            You may also like
          </h2>

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
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 md:hidden">
        <div className="flex gap-3">
          <div className="flex-1">
            ₱{Number(price).toLocaleString()}
          </div>

          <button
            onClick={handleAdd}
            disabled={stock === 0}
            className="bg-[#274C77] text-white px-6 py-3 rounded-xl"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}