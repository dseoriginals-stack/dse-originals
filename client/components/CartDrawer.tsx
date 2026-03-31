"use client"

import { useCart } from "@/context/CartContext"
import Image from "next/image"
import Link from "next/link"

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

  /* =========================
     IMAGE FIX (CRITICAL)
  ========================= */

  const getImage = (url?: string) => {
    
    return `${url}`
  }

  return (
    <>
      {/* OVERLAY */}
      {isCartOpen && (
        <div
          onClick={closeCart}
          className="fixed inset-0 bg-black/40 z-40"
        />
      )}

      {/* DRAWER */}
      <div
        className={`fixed top-0 right-0 h-full w-[380px] bg-white shadow-xl z-50 transform transition-transform duration-300 ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">

          {/* HEADER */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-lg font-semibold">Your Cart</h2>

            <button
              onClick={closeCart}
              className="text-xl"
            >
              ×
            </button>
          </div>

          {/* ITEMS */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">

            {cart.length === 0 && (
              <p className="text-sm text-slate-500">
                Your cart is empty
              </p>
            )}

            {cart.map(item => {

              const imageUrl = getImage(item.image)

              return (
                <div
                  key={item.variantId} // ✅ FIX
                  className="flex gap-4"
                >

                  {/* IMAGE FIX */}
                  <img
                    src={imageUrl}
                    alt={item.name}
                    className="w-[70px] h-[70px] rounded-lg object-cover"
                  />

                  <div className="flex-1">

                    <p className="text-sm font-medium">
                      {item.name}
                    </p>

                    <p className="text-sm text-slate-500">
                      ₱{item.price}
                    </p>

                    {/* QUANTITY */}
                    <div className="flex items-center gap-2 mt-2">

                      <button
                        onClick={() =>
                          updateQuantity(
                            item.variantId, // ✅ FIX
                            item.quantity - 1
                          )
                        }
                        className="px-2 border rounded"
                      >
                        −
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        onClick={() =>
                          updateQuantity(
                            item.variantId, // ✅ FIX
                            item.quantity + 1
                          )
                        }
                        className="px-2 border rounded"
                      >
                        +
                      </button>

                    </div>

                  </div>

                  <button
                    onClick={() =>
                      removeFromCart(item.variantId) // ✅ FIX
                    }
                    className="text-sm text-red-500"
                  >
                    Remove
                  </button>

                </div>
              )
            })}

          </div>

          {/* FOOTER */}
          <div className="border-t p-6 space-y-4">

            <div className="flex justify-between font-semibold">
              <span>Subtotal</span>
              <span>₱{subtotal.toLocaleString()}</span>
            </div>

            <Link
              href="/checkout"
              className="block w-full text-center bg-[#274C77] text-white py-3 rounded-xl"
              onClick={closeCart}
            >
              Checkout
            </Link>

          </div>

        </div>
      </div>
    </>
  )
}