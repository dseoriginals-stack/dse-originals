"use client"

import { useEffect, useState } from "react"
import { X, Check, ShoppingBag, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { getImageUrl } from "@/lib/image"
import { ProductCardType } from "@/types/product"
import { useCart } from "@/context/CartContext"

export default function ProductModal({
  product,
  onClose,
}: {
  product: ProductCardType
  onClose: () => void
}) {
  const { addToCart } = useCart()

  const [qty, setQty] = useState(1)
  const [loading, setLoading] = useState(false)
  const [added, setAdded] = useState(false)

  const imageUrl = product.image
    ? getImageUrl(product.image)
    : "/placeholder.png"

  // ✅ Lock scroll
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [])

  const handleAdd = async () => {
    if (loading) return

    setLoading(true)

    try {
      await addToCart({
        productId: product.id,
        variantId: product.variantId,
        name: product.name,
        price: product.price,
        quantity: qty,
        image: imageUrl,
      })

      setAdded(true)
      setTimeout(() => setAdded(false), 1200)

    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      onClick={onClose} // ✅ click outside to close
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden relative
          animate-in fade-in zoom-in-95 duration-200
        "
      >

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 bg-white/80 rounded-full p-2 hover:bg-white"
        >
          <X size={18} />
        </button>

        <div className="grid md:grid-cols-2">

          {/* IMAGE */}
          <div className="relative h-[300px] md:h-full bg-gray-50">
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          {/* CONTENT */}
          <div className="p-6 md:p-8 flex flex-col gap-5">

            {/* TITLE */}
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
              {product.name}
            </h2>

            {/* PRICE */}
            <div className="text-xl font-bold text-[var(--brand-primary)]">
              ₱{Number(product.price).toLocaleString()}
            </div>

            {/* DESCRIPTION (placeholder for now) */}
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Experience the highest quality with this premium product, designed exactly with your aesthetic and practical needs in mind.
            </p>

            {/* QUANTITY */}
            <div>
              <p className="text-sm text-gray-500 mb-2">Quantity</p>

              <div className="flex items-center border rounded-xl w-fit">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-4 py-2"
                >
                  −
                </button>

                <span className="px-5">{qty}</span>

                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="px-4 py-2"
                >
                  +
                </button>
              </div>
            </div>

            {/* INFO */}
            <div className="bg-[var(--brand-soft)]/20 text-[var(--brand-primary)] text-sm px-4 py-3 rounded-lg border border-[var(--brand-accent)]/20 font-medium">
              Free shipping available on this item
            </div>

            {/* ACTIONS */}
            <div className="flex flex-col sm:flex-row gap-3 mt-auto pt-4 border-t border-[var(--border-light)]">
              <button
                onClick={handleAdd}
                disabled={loading}
                className="btn-premium flex-1 !py-3.5 !rounded-xl text-base shadow-sm"
              >
                {added ? (
                  <>
                    <Check size={18} /> Added
                  </>
                ) : loading ? (
                  "Adding..."
                ) : (
                  <>
                     <ShoppingBag size={18} /> Add to Cart
                  </>
                )}
              </button>

              <Link
                href={`/products/${product.slug}`}
                onClick={onClose}
                className="btn-outline flex-1 flex justify-center items-center gap-2 !py-3.5 !rounded-xl !border-[var(--brand-primary)] !text-[var(--brand-primary)] hover:!bg-[var(--brand-primary)] hover:!text-white shadow-sm"
              >
                View Full Details <ArrowRight size={16} />
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}