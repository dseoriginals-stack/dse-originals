"use client"

import { useCart } from "@/context/CartContext"
import Link from "next/link"

const FREE_SHIPPING_THRESHOLD = 3000

export default function CartPage() {
  const { 
    cart, 
    removeFromCart, 
    updateQuantity, 
    subtotal, 
    selectedItems, 
    toggleSelection, 
    toggleAllSelection, 
    selectedSubtotal, 
    selectedCount 
  } = useCart()

  const progress = Math.min(
    (selectedSubtotal / FREE_SHIPPING_THRESHOLD) * 100,
    100
  )

  const totalItems = cart.reduce(
    (acc, item) => acc + item.quantity,
    0
  )

  /* ---------------- EMPTY ---------------- */

  if (!cart || cart.length === 0) {
    return (
      <div className="container py-24 text-center px-4 max-w-2xl mx-auto flex flex-col items-center">
        <div className="w-32 h-32 bg-[var(--brand-soft)]/20 rounded-full flex items-center justify-center mb-8 drop-shadow-sm">
          <span className="text-5xl">🛒</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-bold text-[var(--text-heading)] tracking-tight">
          Your Cart is Empty
        </h1>

        <p className="mt-6 text-lg text-[var(--text-muted)]">
          Looks like you haven’t added anything yet. Discover our premium collection and find something you love.
        </p>

        <Link
          href="/products"
          className="btn-premium mt-10 !px-10 !py-4 text-lg shadow-lg"
        >
          Explore Collection
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto py-8 md:py-16 px-4 md:px-8">

      {/* HEADER */}
      <div className="mb-6 md:mb-10 text-center md:text-left">
        <h1 className="text-2xl md:text-4xl font-extrabold text-[var(--text-heading)] tracking-tight">
          Shopping Cart
        </h1>

        <div className="flex items-center justify-between mt-3">
          <Link
            href="/products"
            className="text-xs font-bold tracking-widest text-[var(--text-muted)] hover:text-[var(--brand-primary)] transition uppercase"
          >
            ← Continue Shopping
          </Link>

          {selectedItems.length > 0 && (
            <button
              onClick={() => toggleAllSelection()}
              className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-red-500 transition"
            >
              ✕ Deselect
            </button>
          )}
        </div>
      </div>

      {/* FREE SHIPPING */}
      <div className="bg-[var(--brand-soft)]/20 border border-[var(--brand-accent)]/20 rounded-2xl p-4 md:p-6 mb-8 shadow-sm">
        {selectedSubtotal < FREE_SHIPPING_THRESHOLD ? (
          <p className="text-xs md:text-sm font-semibold text-[var(--brand-primary)] mb-4">
            Add <span className="font-bold underline underline-offset-2">₱{(FREE_SHIPPING_THRESHOLD - selectedSubtotal).toLocaleString()}</span> more to
            unlock <span className="font-bold underline underline-offset-2">Free Shipping</span> 🚚
          </p>
        ) : (
          <p className="text-xs md:text-sm font-bold text-emerald-600 mb-4 bg-emerald-50 w-fit px-3 py-1 rounded-full border border-emerald-100 shadow-sm">
            🎉 Free shipping unlocked!
          </p>
        )}

        <div className="w-full bg-[var(--brand-soft)]/40 h-2 md:h-2.5 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-[var(--brand-primary)] rounded-full transition-all duration-1000 ease-out relative"
            style={{ width: `${progress}%` }}
          >
             <div className="absolute top-0 right-0 bottom-0 w-8 bg-white/20 animate-[pulse_2s_ease-in-out_infinite]"></div>
          </div>
        </div>
      </div>

      {/* GRID */}
      <div className="grid lg:grid-cols-3 gap-6 md:gap-8">

        {/* CART ITEMS */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {[...cart].reverse().map((item) => {
            const price = Number(item.price) || 0
            const quantity = Number(item.quantity) || 1

            return (
              <div
                key={item.variantId}
                className={`
                  bg-[var(--bg-card)]
                  border ${selectedItems.includes(item.variantId) ? 'border-[var(--brand-primary)] ring-2 ring-[var(--brand-accent)]/20' : 'border-[var(--border-light)]'}
                  rounded-2xl md:rounded-3xl
                  p-4 md:p-5
                  flex flex-col sm:flex-row gap-4 md:gap-6 
                  shadow-sm hover:shadow-md hover:border-[var(--brand-accent)]/30
                  transition-all duration-300 relative
                `}
              >
                {/* CHECKBOX */}
                <div className="absolute xs:static top-4 left-4 sm:flex items-center">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-[var(--border-light)] text-[var(--brand-primary)] focus:ring-[var(--brand-accent)] cursor-pointer"
                    checked={selectedItems.includes(item.variantId)}
                    onChange={() => toggleSelection(item.variantId)}
                  />
                </div>

                {/* IMAGE */}
                <div 
                  className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-xl md:rounded-2xl overflow-hidden shadow-inner border border-gray-50 flex-shrink-0 cursor-pointer transition ${!selectedItems.includes(item.variantId) && 'opacity-60 grayscale-[50%]'}`}
                  onClick={() => toggleSelection(item.variantId)}
                >
                  <img
                    src={item.image || "/placeholder.png"}
                    alt={item.name || "Product"}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* INFO */}
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <h3 className="text-base md:text-lg font-bold text-[var(--text-heading)] leading-tight">
                      {item.name || "Unnamed Product"}
                    </h3>

                    <p className="text-xs md:text-sm font-semibold text-[var(--text-muted)] mt-1 tracking-wide">
                      ₱{price.toLocaleString()}
                    </p>
                  </div>

                  {/* CONTROLS */}
                  <div className="flex items-center justify-between mt-4 md:mt-6">

                    {/* QUANTITY */}
                    <div className="flex items-center bg-white border border-[var(--border-light)] rounded-xl overflow-hidden h-9 shadow-sm w-fit">
                      <button
                        onClick={() =>
                          quantity > 1 &&
                          updateQuantity(item.variantId, quantity - 1)
                        }
                        className="w-9 h-full flex items-center justify-center text-[var(--text-main)] hover:bg-gray-50 transition active:scale-95 text-lg font-medium"
                      >
                        −
                      </button>

                      <span className="px-3 text-sm font-bold text-[var(--text-heading)] border-x border-[var(--border-light)] h-full flex items-center">
                        {quantity}
                      </span>

                      <button
                        onClick={() =>
                          updateQuantity(item.variantId, quantity + 1)
                        }
                        className="w-9 h-full flex items-center justify-center text-[var(--text-main)] hover:bg-gray-50 transition active:scale-95 text-lg font-medium"
                      >
                        +
                      </button>
                    </div>

                    {/* REMOVE */}
                    <button
                      onClick={() => removeFromCart(item.variantId)}
                      className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-red-500/80 hover:text-red-600 transition hover:bg-red-50 px-2 py-1.5 rounded-lg"
                    >
                      Remove
                    </button>

                  </div>
                </div>

                {/* PRICE */}
                <div className="text-right font-extrabold text-lg md:text-xl text-[var(--brand-primary)] sm:pt-1">
                  ₱{(price * quantity).toLocaleString()}
                </div>
              </div>
            )
          })}
        </div>

        {/* SUMMARY */}
        <div className="lg:sticky lg:top-24 h-fit bg-[var(--bg-card)] border border-[var(--border-light)] rounded-3xl p-5 md:p-6 space-y-5 shadow-md drop-shadow-sm">
          <h2 className="text-xl md:text-2xl font-bold text-[var(--text-heading)]">
            Order Summary
          </h2>

          <div className="space-y-3 text-[var(--text-main)] font-semibold text-sm">
            <div className="flex justify-between items-center bg-[var(--bg-surface)] p-3 rounded-xl border border-[var(--border-light)]">
              <span>Subtotal ({selectedCount} items)</span>
              <span className="text-base font-bold">₱{selectedSubtotal.toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center bg-[var(--bg-surface)] p-3 rounded-xl border border-[var(--border-light)]">
              <span>Shipping</span>
              <span className="text-xs text-[var(--text-muted)]">Calculated Next</span>
            </div>
          </div>

          <div className="border-t border-[var(--border-light)] pt-5 flex justify-between items-end font-extrabold text-[var(--brand-primary)]">
            <span className="uppercase tracking-widest text-[10px] text-[var(--text-heading)] mb-1">Estimated Total</span>
            <span className="text-2xl md:text-3xl">₱{selectedSubtotal.toLocaleString()}</span>
          </div>

          <Link
            href={selectedCount > 0 ? "/checkout" : "#"}
            className={`btn-premium block w-full text-center mt-2 !py-3 text-sm md:text-base ${selectedCount === 0 && 'opacity-50 pointer-events-none cursor-not-allowed grayscale'}`}
          >
            {selectedCount > 0 ? "Proceed to Secure Checkout" : "Select an item to Checkout"}
          </Link>

          <div className="pt-4 space-y-2 font-semibold text-[10px] md:text-xs text-[var(--text-muted)] grid grid-cols-1 gap-1.5">
            <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--brand-accent)]"></div> Secure encrypted transaction</div>
            <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--brand-accent)]"></div> Multiple premium payment options</div>
            <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--brand-accent)]"></div> Fast, reliable nationwide shipping</div>
          </div>
        </div>

      </div>



    </div>
  )
}