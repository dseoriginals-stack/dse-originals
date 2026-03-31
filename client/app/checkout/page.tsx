"use client"

import { useState, useEffect } from "react"
import { useCart } from "@/context/CartContext"
import { API_URL } from "@/lib/api"
import Link from "next/link"

/* ============================
TYPES
============================ */

type Address = {
  id: string
  fullName: string
  phone: string
  street: string
  barangay: string
  city: string
  province: string
  region: string
  postalCode?: string | null
  isDefault: boolean
}

type FormState = {
  name: string
  email: string
  phone: string
  street: string
  barangay: string
  city: string
  province: string
  region: string
  postalCode: string
}

/* ============================
PAGE
============================ */

export default function CheckoutPage() {

  const { cart, clearCart } = useCart()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [savedAddresses, setSavedAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    street: "",
    barangay: "",
    city: "",
    province: "",
    region: "",
    postalCode: ""
  })

  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  )

  /* ============================
  LOAD USER + ADDRESSES
  ============================ */

  useEffect(() => {

    const token = localStorage.getItem("token")
    if (!token) return

    const headers = {
      Authorization: `Bearer ${token}`
    }

    // USER
    fetch(`${API_URL}/me`, { headers })
      .then(res => res.json())
      .then(user => {
        setForm(prev => ({
          ...prev,
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || ""
        }))
      })
      .catch(() => {})

    // ADDRESSES
    fetch(`${API_URL}/me/addresses`, { headers })
      .then(res => res.json())
      .then((data: Address[]) => {

        setSavedAddresses(data)

        const defaultAddr = data.find(a => a.isDefault)

        if (defaultAddr) {
          selectAddress(defaultAddr)
        }

      })
      .catch(() => {})

  }, [])

  /* ============================
  SELECT ADDRESS
  ============================ */

  const selectAddress = (addr: Address) => {

    setSelectedAddressId(addr.id)

    setForm(prev => ({
      ...prev,
      name: addr.fullName,
      phone: addr.phone,
      street: addr.street,
      barangay: addr.barangay,
      city: addr.city,
      province: addr.province,
      region: addr.region,
      postalCode: addr.postalCode || ""
    }))

  }

  /* ============================
  VALIDATION
  ============================ */

  const isValid =
    form.name &&
    form.phone &&
    form.street &&
    form.barangay &&
    form.city &&
    form.province &&
    cart.length > 0

  /* ============================
  CHECKOUT
  ============================ */

  const handleCheckout = async () => {

    if (!isValid || loading) return

    setError(null)
    setLoading(true)

    try {

      const token = localStorage.getItem("token")

      const items = cart.map(item => ({
        variantId: item.variantId, // ✅ FIXED
        quantity: item.quantity
      }))

      const shippingAddr = `
${form.name}
${form.phone}
${form.street}, ${form.barangay}
${form.city}, ${form.province}
`.trim()

      const clientOrderId = crypto.randomUUID()

      /*
      ---------------------------
      SAVE EMAIL (RECOVERY SYSTEM)
      ---------------------------
      */

      if (form.email) {
        await fetch(`${API_URL}/cart/save-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` })
          },
          body: JSON.stringify({
            email: form.email
          })
        })
      }

      /*
      ---------------------------
      CREATE ORDER
      ---------------------------
      */

      const res = await fetch(`${API_URL}/orders/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({
          items,
          shippingAddr,
          address: {
            fullName: form.name,
            phone: form.phone,
            street: form.street,
            barangay: form.barangay,
            city: form.city,
            province: form.province,
            region: form.region || "Region XI",
            postalCode: form.postalCode || null
          },
          guestEmail: token ? null : form.email,
          guestName: token ? null : form.name,
          clientOrderId
        })
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.message)

      clearCart()

      if (data.invoiceUrl) {
        window.location.href = data.invoiceUrl
      } else {
        window.location.href = `/order-success/${data.orderId}`
      }

    } catch (err: any) {

      setError(err.message || "Checkout failed.")

    } finally {

      setLoading(false)

    }

  }

  /* ============================
  UI
  ============================ */

  return (
  <div className="bg-slate-50 min-h-screen py-20 pb-32">

    <div className="max-w-5xl mx-auto px-6 space-y-10">

      <div className="text-sm text-slate-500">
        <Link href="/">Home</Link> / Checkout
      </div>

      <div className="grid lg:grid-cols-2 gap-12">

        {/* FORM */}
        <div className="bg-white p-8 rounded-2xl border space-y-6 shadow-sm">

          <h1 className="text-2xl font-semibold">
            Secure Checkout
          </h1>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded">
              {error}
            </div>
          )}

          {/* SAVED ADDRESSES */}
          {savedAddresses.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-semibold text-sm text-gray-600">
                Saved Addresses
              </h2>

              {savedAddresses.map(addr => (
                <button
                  key={addr.id}
                  onClick={() => selectAddress(addr)}
                  className={`w-full text-left border rounded-xl p-4 transition ${
                    selectedAddressId === addr.id
                      ? "border-black bg-gray-50"
                      : "hover:border-gray-400"
                  }`}
                >
                  <div className="font-medium">
                    {addr.fullName} ({addr.phone})
                  </div>

                  <div className="text-sm text-gray-500">
                    {addr.street}, {addr.barangay}, {addr.city}
                  </div>

                  {addr.isDefault && (
                    <div className="text-xs text-green-600 mt-1">
                      Default
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* INPUTS */}
          <Input placeholder="Full Name" value={form.name} onChange={(v) => {
            setSelectedAddressId(null)
            setForm({ ...form, name: v })
          }} />

          <Input placeholder="Email" value={form.email} onChange={(v) => {
            setSelectedAddressId(null)
            setForm({ ...form, email: v })
          }} />

          <Input placeholder="Phone" value={form.phone} onChange={(v) => {
            setSelectedAddressId(null)
            setForm({ ...form, phone: v })
          }} />

          <Input placeholder="Street" value={form.street} onChange={(v) => {
            setSelectedAddressId(null)
            setForm({ ...form, street: v })
          }} />

          <Input placeholder="Barangay" value={form.barangay} onChange={(v) => {
            setSelectedAddressId(null)
            setForm({ ...form, barangay: v })
          }} />

          <Input placeholder="City" value={form.city} onChange={(v) => {
            setSelectedAddressId(null)
            setForm({ ...form, city: v })
          }} />

          <Input placeholder="Province" value={form.province} onChange={(v) => {
            setSelectedAddressId(null)
            setForm({ ...form, province: v })
          }} />

          {/* DESKTOP CTA */}
          <button
            onClick={handleCheckout}
            disabled={!isValid || loading}
            className="hidden md:block w-full bg-black text-white py-4 rounded-xl font-semibold disabled:opacity-50"
          >
            {loading ? "Processing..." : "Proceed to Payment"}
          </button>

          {/* TRUST */}
          <div className="hidden md:block text-xs text-slate-500 space-y-1 pt-2">
            <div>🔒 Secure encrypted checkout</div>
            <div>💳 Multiple payment options</div>
            <div>🚚 Fast delivery via J&T</div>
          </div>

        </div>

        {/* SUMMARY */}
        <div className="bg-white p-6 rounded-2xl border shadow-md lg:sticky lg:top-24 h-fit">

          <h2 className="text-xl font-semibold mb-6">
            Order Summary
          </h2>

          <div className="space-y-3">
            {cart.map(item => (
              <div key={item.variantId} className="flex justify-between text-sm">
                <span>{item.name} × {item.quantity}</span>
                <span>₱{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 mt-4 font-bold flex justify-between text-lg">
            <span>Total</span>
            <span>₱{subtotal.toLocaleString()}</span>
          </div>

        </div>

      </div>

    </div>

    {/* 🔥 MOBILE STICKY CTA */}
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 md:hidden z-50">

      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold">
          ₱{subtotal.toLocaleString()}
        </span>
      </div>

      <button
        onClick={handleCheckout}
        disabled={!isValid || loading}
        className="w-full bg-black text-white py-3 rounded-xl font-semibold disabled:opacity-50"
      >
        {loading ? "Processing..." : "Proceed to Payment"}
      </button>

    </div>

  </div>
)
}

/* ============================
INPUT
============================ */

function Input({
  placeholder,
  value,
  onChange
}: {
  placeholder: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <input
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border rounded-xl p-4"
    />
  )
}