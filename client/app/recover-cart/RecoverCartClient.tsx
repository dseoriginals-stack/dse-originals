"use client"

import { useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { useCart } from "@/context/CartContext"

export default function RecoverCartClient() {
  const params = useSearchParams()
  const router = useRouter()
  const { setCartItems } = useCart()

  useEffect(() => {
    const token = params.get("token")

    if (!token) {
      router.replace("/") // better UX than doing nothing
      return
    }

    const restore = async () => {
      try {
        const { data } = await api.get(`/cart/restore?token=${token}`)

        // ✅ safer fallback
        setCartItems(data?.items || [])

        router.replace("/cart")
      } catch (err) {
        console.error("Cart recovery failed:", err)

        alert("Recovery failed or expired")
        router.replace("/")
      }
    }

    restore()
  }, [params, router, setCartItems])

  return (
    <div className="container py-20 text-center text-white">
      Restoring your cart...
    </div>
  )
}