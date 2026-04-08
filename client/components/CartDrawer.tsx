"use client"

import { useCart } from "@/context/CartContext"
import Image from "next/image"
import Link from "next/link"
import { X, Minus, Plus, Trash2 } from "lucide-react"

export default function CartDrawer() {

  const {
    cart,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity
  } = useCart()

  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  )

  const getImage = (url?: string) => {
    return `${url}`
  }

  return (
    <>
      {/* OVERLAY */}
      {isCartOpen && (
        <div
          onClick={closeCart}
          className="fixed inset-0 bg-[#274C77]/20 backdrop-blur-sm z-[100] transition-opacity animate-fadeIn"
        />
      )}

      {/* DRAWER */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-[400px] bg-[var(--bg-card)] backdrop-blur-xl border border-[var(--border-light)] !rounded-none !border-r-0 !border-t-0 !border-b-0 z-[101] transform transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${
          isCartOpen ? "translate-x-0 shadow-[-10px_0_40px_rgba(39,76,119,0.2)]" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full relative">

          {/* BACKGROUND GLOW */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[var(--brand-soft)]/40 to-transparent rounded-full blur-3xl -z-10 pointer-events-none"></div>

          {/* HEADER */}
          <div className="flex items-center justify-between p-6 border-b border-[var(--border-light)] bg-transparent shrink-0">
            <h2 className="text-xl font-bold tracking-tight text-[var(--text-heading)] flex items-center gap-3">
               Shopping Cart
               <span className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-accent)] text-white text-xs px-2 py-0.5 rounded-full shadow-[0_2px_8px_rgba(39,76,119,0.2)]">
                 {cart.length}
               </span>
            </h2>

            <button
              onClick={closeCart}
              className="p-2 rounded-full hover:bg-[var(--brand-soft)] text-[var(--text-muted)] hover:text-[var(--brand-primary)] transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* ITEMS */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide shrink-0">

            {cart.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-70">
                <div className="w-20 h-20 rounded-full bg-[var(--brand-primary)]/5 flex items-center justify-center">
                   <Trash2 size={32} className="text-[var(--brand-primary)] opacity-60" />
                </div>
                <p className="text-[var(--text-main)] text-base font-medium">
                  Your cart is empty <br />
                  <span className="text-sm font-light text-[var(--text-muted)]">Explore our curated collection.</span>
                </p>
                <button onClick={closeCart} className="text-[var(--brand-primary)] hover:underline text-sm font-medium pt-2">
                   Continue Shopping
                </button>
              </div>
            )}

            {cart.map(item => {

              const imageUrl = getImage(item.image)

              return (
                <div
                  key={item.variantId}
                  className="flex gap-5 group animate-fade-up relative"
                >
                  {/* IMAGE */}
                  <div className="relative w-[85px] h-[85px] rounded-2xl overflow-hidden bg-[var(--bg-main)] shrink-0 border border-[var(--border-light)] shadow-sm">
                    <img
                      src={imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 mix-blend-multiply"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between py-1">

                    <div>
                       <p className="text-base font-semibold text-[var(--text-heading)] leading-tight line-clamp-2 pr-6">
                         {item.name}
                       </p>
                       <p className="text-sm font-bold text-[var(--brand-primary)] mt-1">
                         ₱{Number(item.price).toLocaleString()}
                       </p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                       {/* QUANTITY */}
                       <div className="flex items-center bg-[var(--bg-main)] border border-[var(--border-light)] rounded-full p-1">
                         <button
                           onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                           className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] transition-colors"
                         >
                           <Minus size={14} />
                         </button>

                         <span className="w-8 text-center text-sm font-medium text-[var(--text-heading)]">{item.quantity}</span>

                         <button
                           onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                           className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] transition-colors"
                         >
                           <Plus size={14} />
                         </button>
                       </div>

                       <button
                         onClick={() => removeFromCart(item.variantId)}
                         className="p-2 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                       >
                         <Trash2 size={16} />
                       </button>
                    </div>

                  </div>

                </div>
              )
            })}

          </div>

          {/* FOOTER */}
          <div className="border-t border-[var(--border-light)] p-6 bg-[var(--bg-main)]/50 backdrop-blur-md shrink-0">

            <div className="flex flex-col gap-3 mb-6">
               <div className="flex justify-between text-sm text-[var(--text-muted)]">
                 <span>Shipping</span>
                 <span>Calculated at checkout</span>
               </div>
               <div className="h-[1px] bg-[var(--border-light)] w-full"></div>
               <div className="flex justify-between font-bold text-lg text-[var(--text-heading)] items-end">
                 <span>Subtotal</span>
                 <span className="text-xl text-[var(--brand-primary)]">₱{subtotal.toLocaleString()}</span>
               </div>
            </div>

            <Link
              href="/checkout"
              className="btn-premium w-full !py-4 shadow-[0_8px_30px_rgba(39,76,119,0.2)] hover:shadow-[0_12px_40px_rgba(39,76,119,0.3)]"
              onClick={closeCart}
            >
              Secure Checkout
            </Link>

          </div>

        </div>
      </div>
    </>
  )
}