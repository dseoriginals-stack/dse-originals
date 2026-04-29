"use client"

import { useEffect, useState } from "react"
import { X, Check, ShoppingBag, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { getImageUrl } from "@/lib/image"
import { ProductCardType, ProductVariant } from "@/types/product"
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

  // ✅ Group attributes for separated selection
  const groupedAttributes: Record<string, string[]> = {}
  product.variants?.forEach((v) => {
    v.attributes.forEach((attr) => {
      if (!groupedAttributes[attr.name]) groupedAttributes[attr.name] = []
      if (!groupedAttributes[attr.name].includes(attr.value)) {
        groupedAttributes[attr.name].push(attr.value)
      }
    })
  })

  // ✅ Track selections by attribute name
  const [selections, setSelections] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    const first = product.variants?.[0]
    first?.attributes.forEach(a => {
      initial[a.name] = a.value
    })
    return initial
  })

  // ✅ Computed selected variant
  const selectedVariant = product.variants?.find(v =>
    v.attributes.every(a => selections[a.name] === a.value)
  ) || product.variants?.[0] || null

  const handleAttributeClick = (name: string, value: string) => {
    const nextSelections = { ...selections, [name]: value }

    // Try to find exact match
    const match = product.variants?.find(v =>
      v.attributes.every(a => nextSelections[a.name] === a.value)
    )

    if (match) {
      setSelections(nextSelections)
    } else {
      // Falling back to first variant matching the new selection
      const fallback = product.variants?.find(v =>
        v.attributes.some(a => a.name === name && a.value === value)
      )
      if (fallback) {
        const reset: Record<string, string> = {}
        fallback.attributes.forEach(a => { reset[a.name] = a.value })
        setSelections(reset)
      }
    }
  }

  const fallbackImage = product.image || product.variants?.find(v => v.image)?.image || "/placeholder.png"
  const imageUrl = selectedVariant?.image
    ? getImageUrl(selectedVariant.image)
    : getImageUrl(fallbackImage)

  // ✅ Lock scroll
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [])

  const handleAdd = async () => {
    if (loading || !selectedVariant) return

    setLoading(true)

    try {
      await addToCart({
        productId: product.id,
        variantId: selectedVariant.id,
        name: product.name,
        price: Number(selectedVariant.price),
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
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden relative
          animate-in zoom-in-95 duration-300
          flex flex-col md:grid md:grid-cols-2 max-h-[90vh] md:max-h-none overflow-y-auto
          border border-white/20
        "
      >

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 z-10 bg-white/90 hover:bg-white text-gray-500 hover:text-black rounded-full p-2.5 transition-all shadow-lg backdrop-blur-sm"
        >
          <X size={20} strokeWidth={2.5} />
        </button>

        {/* IMAGE */}
        <div className="relative h-[250px] sm:h-[350px] md:h-auto min-h-[450px] bg-[var(--bg-surface)] flex-shrink-0 group overflow-hidden">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          {product.isBestseller && (
            <div className="absolute top-6 left-6 bg-amber-400 text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
              Best Seller
            </div>
          )}
        </div>

        {/* CONTENT */}
        <div className="p-8 md:p-12 flex flex-col gap-6 bg-white overflow-y-auto">

          {/* TITLE & PRICE */}
          <div className="space-y-2">
            <h2 className="text-3xl font-[1000] text-[var(--text-heading)] tracking-tighter leading-tight">
              {product.name}
            </h2>
            <div className="text-3xl font-black text-[var(--brand-primary)]">
              ₱{Number(selectedVariant?.price || product.price).toLocaleString()}
            </div>
          </div>

          <div className="h-px w-full bg-[var(--border-light)]"></div>

          {/* DESCRIPTION */}
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)]">Composition & Care</p>
            <p className="text-sm text-[var(--text-muted)] font-medium leading-relaxed">
              {product.description || "Premium handcrafted piece from our latest collection, featuring superior fabrics and a tailored silhouette designed for timeless elegance."}
            </p>
          </div>

          {/* SEPARATED VARIANTS */}
          {Object.entries(groupedAttributes).length > 0 && (
            <div className="space-y-6">
              {Object.entries(groupedAttributes).map(([name, values]) => {
                // Sort sizes logically if the attribute name is "size"
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
                  <div key={name} className="space-y-3">
                    <p className="text-[10px] font-black font-brand uppercase tracking-[0.2em] text-gray-400">
                      Select {name}
                    </p>
                    <div className="flex gap-2.5 flex-wrap">
                      {displayValues.map((val) => {
                        const isActive = selections[name] === val
                        
                        // Check if this specific attribute value is available in ANY variant
                        const isUnavailable = !product.variants?.some(v => 
                          v.attributes.some(a => a.name === name && a.value === val) && v.stock > 0
                        )

                        return (
                          <button
                            key={val}
                            disabled={isUnavailable}
                            onClick={() => handleAttributeClick(name, val)}
                            className={`
                              px-7 py-4 md:px-6 md:py-3 rounded-2xl text-[12px] md:text-[11px] font-bold transition-all duration-300 border-2
                              ${isUnavailable 
                                ? "opacity-20 cursor-not-allowed line-through bg-gray-50 border-gray-100" 
                                : isActive
                                  ? "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)] shadow-[0_8px_20px_rgba(39,76,119,0.25)] scale-[1.05]"
                                  : "bg-white border-[var(--border-light)] text-gray-600 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] hover:shadow-md"
                              }
                            `}
                          >
                            {val}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* QUANTITY */}
          <div>
            <p className="text-sm text-gray-500 mb-2">Quantity</p>

            <div className="flex items-center border rounded-xl w-fit">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-4 py-2 hover:bg-gray-100 transition-colors"
              >
                −
              </button>

              <span className="px-5 font-bold">{qty}</span>

              <button
                onClick={() => setQty((q) => q + 1)}
                className="px-4 py-2 hover:bg-gray-100 transition-colors"
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
          <div className="flex flex-col sm:flex-row gap-3 mt-auto pt-4 border-t border-[var(--border-light)] pb-2">
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
              className="btn-outline flex-1 flex justify-center items-center gap-2 !py-3.5 !rounded-xl !border-[var(--brand-primary)] !text-[var(--brand-primary)] hover:!bg-[var(--brand-primary)] hover:!text-white shadow-sm transition-all"
            >
              View Full Details <ArrowRight size={16} />
            </Link>
          </div>

        </div>
      </div>
    </div>

  )
}