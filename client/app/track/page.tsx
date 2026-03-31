"use client"

import { useState } from "react"
import { api } from "@/lib/api"

const steps = ["pending", "paid", "shipped", "delivered"]

export default function TrackOrderPage() {

  const [orderId, setOrderId] = useState("")
  const [order, setOrder] = useState<any>(null)
  const [error, setError] = useState("")

  async function handleTrack() {

    try {

      const res = await api.get(`/orders/${orderId}`)

      setOrder(res)
      setError("")

    } catch {
      setError("Order not found")
      setOrder(null)
    }

  }

  const currentStepIndex = order
    ? steps.indexOf(order.status)
    : -1

  return (

    <div className="container py-20 max-w-xl mx-auto space-y-8">

      <h1 className="text-3xl font-bold">
        Track Your Order
      </h1>

      {/* INPUT */}

      <div className="flex gap-2">

        <input
          placeholder="Enter Order ID"
          value={orderId}
          onChange={(e)=>setOrderId(e.target.value)}
          className="flex-1 p-3 border rounded"
        />

        <button
          onClick={handleTrack}
          className="bg-black text-white px-6 rounded"
        >
          Track
        </button>

      </div>

      {error && (
        <p className="text-red-500">{error}</p>
      )}

      {order && (

        <div className="space-y-6">

          {/* STATUS */}

          <div className="p-6 border rounded-xl bg-white">

            <p className="text-sm text-gray-500">
              Order ID
            </p>

            <p className="font-semibold mb-3">
              {order.id}
            </p>

            <p className="text-sm text-gray-500">
              Status
            </p>

            <p className="text-lg font-semibold capitalize">
              {order.status}
            </p>

            {order.trackingNo && (
              <p className="mt-2 text-sm">
                Tracking #: {order.trackingNo}
              </p>
            )}

          </div>

          {/* 🔥 TIMELINE */}

          <div className="bg-white p-6 rounded-xl border">

            <h2 className="font-semibold mb-6">
              Order Progress
            </h2>

            <div className="relative">

              {/* LINE */}
              <div className="absolute left-4 top-0 bottom-0 w-[2px] bg-gray-200" />

              {steps.map((step, index) => {

                const active = index <= currentStepIndex

                return (

                  <div key={step} className="flex items-start gap-4 mb-6">

                    {/* DOT */}
                    <div
                      className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold
                        ${active ? "bg-black text-white" : "bg-gray-200"}
                      `}
                    >
                      {active ? "✓" : ""}
                    </div>

                    {/* CONTENT */}
                    <div>

                      <p className={`font-medium capitalize ${active ? "" : "text-gray-400"}`}>
                        {step}
                      </p>

                      <p className="text-sm text-gray-500">
                        {step === "pending" && "Order placed"}
                        {step === "paid" && "Payment confirmed"}
                        {step === "shipped" && "Package is on the way"}
                        {step === "delivered" && "Delivered to customer"}
                      </p>

                    </div>

                  </div>

                )

              })}

            </div>

          </div>

          {/* TOTAL */}

          <div className="text-right font-semibold text-lg">
            Total: ₱{Number(order.total).toLocaleString()}
          </div>

        </div>

      )}

    </div>

  )
}