"use client"

import { useParams } from "next/navigation"
import Link from "next/link"

export default function SuccessPage() {

  const { id } = useParams()

  return (

    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">

      <div className="bg-white max-w-xl w-full p-8 md:p-10 rounded-2xl shadow-md text-center space-y-6">

        {/* SUCCESS ICON */}

        <div className="text-5xl">
          🎉
        </div>

        {/* TITLE */}

        <h1 className="text-2xl md:text-3xl font-bold">
          Order Confirmed!
        </h1>

        {/* ORDER ID */}

        <p className="text-gray-500 text-sm">
          Order ID: <span className="font-medium text-black">{id}</span>
        </p>

        {/* MESSAGE */}

        <div className="text-gray-600 text-sm space-y-2">

          <p>Thank you for your purchase.</p>

          <p>
            We’ve received your order and it is now being processed.
          </p>

        </div>

        {/* WHAT HAPPENS NEXT */}

        <div className="bg-slate-50 rounded-xl p-4 text-sm text-gray-600 text-left space-y-2">

          <p>📦 Processing your order</p>
          <p>🚚 Preparing shipment</p>
          <p>📩 You will receive updates via email</p>

        </div>

        {/* TRUST */}

        <div className="text-xs text-gray-500">
          🔒 Secure payment processed via Xendit
        </div>

        {/* ACTIONS */}

        <div className="flex flex-col md:flex-row gap-3 justify-center pt-4">

          <Link
            href="/products"
            className="bg-black text-white px-6 py-3 rounded-xl"
          >
            Continue Shopping
          </Link>

          <Link
            href={`/orders/${id}`}
            className="border px-6 py-3 rounded-xl"
          >
            View Order
          </Link>

        </div>

      </div>

    </div>

  )

}