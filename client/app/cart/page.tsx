"use client"

import { useCart } from "@/context/CartContext"
import Link from "next/link"

const FREE_SHIPPING_THRESHOLD = 3000

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, subtotal } = useCart()

  const progress = Math.min(
    (subtotal / FREE_SHIPPING_THRESHOLD) * 100,
    100
  )

  /* ---------------- EMPTY ---------------- */

  if (!cart || cart.length === 0) {
    return (
      <div className="container py-24 text-center px-4">
        <div className="text-5xl mb-6">🛒</div>

        <h1 className="text-2xl md:text-3xl font-bold text-[#274C77]">
          Your Cart is Empty
        </h1>

        <p className="mt-4 text-slate-500">
          Looks like you haven’t added anything yet.
        </p>

        <Link
          href="/products"
          className="inline-block mt-8 bg-[#274C77] text-white px-8 py-3 rounded-xl hover:bg-[#356EA3] transition shadow-md"
        >
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="container py-12 md:py-20 px-4">
      {/* TITLE */}
      <h1 className="text-3xl md:text-4xl font-bold text-[#274C77] mb-8 md:mb-10">
        Shopping Cart
      </h1>

      {/* FREE SHIPPING */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 md:p-6 mb-10">
        {subtotal < FREE_SHIPPING_THRESHOLD ? (
          <p className="text-sm text-[#274C77] mb-3">
            Add ₱{(FREE_SHIPPING_THRESHOLD - subtotal).toLocaleString()} more to
            unlock free shipping 🚚
          </p>
        ) : (
          <p className="text-sm text-green-600 mb-3">
            🎉 You unlocked free shipping!
          </p>
        )}

        <div className="w-full bg-blue-100 h-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#274C77] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* GRID */}
      <div className="grid lg:grid-cols-3 gap-10">
        {/* CART ITEMS */}
        <div className="lg:col-span-2 space-y-6">
          {cart.map((item) => {
            const price = Number(item.price) || 0
            const quantity = Number(item.quantity) || 1

            return (
              <div
                key={item.variantId}
                className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 flex flex-col sm:flex-row gap-6 shadow-sm"
              >
                {/* IMAGE */}
                <div className="w-full sm:w-28 h-28 bg-[#F1F6FA] rounded-xl overflow-hidden">
                  <img
                    alt={item.name || "Product"}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* INFO */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-[#274C77]">
                      {item.name || "Unnamed Product"}
                    </h3>

                    <p className="text-sm text-slate-500 mt-1">
                      ₱{price.toLocaleString()}
                    </p>
                  </div>

                  {/* CONTROLS */}
                  <div className="flex items-center justify-between mt-4">
                    {/* QUANTITY */}
                    <div className="flex items-center border border-slate-300 rounded-full overflow-hidden">
                      <button
                        onClick={() =>
                          quantity > 1 &&
                          updateQuantity(item.variantId, quantity - 1)
                        }
                        className="px-4 py-2 hover:bg-slate-100"
                      >
                        −
                      </button>

                      <span className="px-4 text-sm font-medium">
                        {quantity}
                      </span>

                      <button
                        onClick={() =>
                          updateQuantity(item.variantId, quantity + 1)
                        }
                        className="px-4 py-2 hover:bg-slate-100"
                      >
                        +
                      </button>
                    </div>

                    {/* REMOVE */}
                    <button
                      onClick={() => removeFromCart(item.variantId)}
                      className="text-sm text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {/* PRICE */}
                <div className="text-right font-semibold text-[#274C77]">
                  ₱{(price * quantity).toLocaleString()}
                </div>
              </div>
            )
          })}
        </div>

        {/* SUMMARY */}
        <div className="lg:sticky lg:top-28 h-fit bg-white border border-slate-200 rounded-2xl p-6 md:p-8 space-y-6 shadow-md">
          <h2 className="text-xl font-semibold text-[#274C77]">
            Order Summary
          </h2>

          <div className="space-y-3 text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₱{subtotal.toLocaleString()}</span>
            </div>

            <div className="flex justify-between">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
          </div>

          <div className="border-t pt-4 flex justify-between font-semibold text-lg text-[#274C77]">
            <span>Total</span>
            <span>₱{subtotal.toLocaleString()}</span>
          </div>

          <Link
            href="/checkout"
            className="block w-full text-center bg-[#274C77] text-white py-3 md:py-4 rounded-xl hover:bg-[#356EA3] transition shadow-lg"
          >
            Proceed to Checkout
          </Link>

          <div className="pt-4 space-y-2 text-sm text-slate-500">
            <div>🔒 Secure encrypted checkout</div>
            <div>💳 Multiple payment options</div>
            <div>🚚 Reliable nationwide shipping</div>
          </div>
        </div>
      </div>

      {/* MOBILE STICKY CHECKOUT */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 md:hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="font-semibold text-[#274C77]">
            ₱{subtotal.toLocaleString()}
          </span>

          <span className="text-xs text-slate-500">
            {cart.length} items
          </span>
        </div>

        <Link
          href="/checkout"
          className="block text-center bg-[#274C77] text-white py-3 rounded-xl"
        >
          Checkout
        </Link>
      </div>
    </div>
  )
}