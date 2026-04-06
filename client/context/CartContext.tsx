"use client"

import { useAuth } from "@/context/AuthContext"
import { api } from "@/lib/api"

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef
} from "react"

import { v4 as uuidv4 } from "uuid"

/* =========================
   TYPES
========================= */

export type CartItem = {
  variantId: string
  name: string
  price: number
  quantity: number
  image?: string
}

type CartContextType = {
  cart: CartItem[]

  addToCart: (item: CartItem) => void
  updateQuantity: (variantId: string, quantity: number) => void
  removeFromCart: (variantId: string) => void
  clearCart: () => void

  setCartItems: (items: CartItem[]) => void

  cartCount: number
  subtotal: number
  total: number
  isEmpty: boolean

  guestId: string | null

  animateCart: boolean

  isCartOpen: boolean
  openCart: () => void
  closeCart: () => void
}

/* ========================= */

const CartContext = createContext<CartContextType | null>(null)

/* ========================= */

const getCartKey = (guestId: string | null) =>
  guestId ? `dse_cart_${guestId}` : "dse_cart"

const GUEST_STORAGE_KEY = "dse_guest_id"
const MAX_QTY = 99

/* ========================= */

export function CartProvider({
  children
}: {
  children: React.ReactNode
}) {

  // ✅ FIX: moved inside component
  const { user } = useAuth()

  const [cart, setCart] = useState<CartItem[]>([])
  const [guestId, setGuestId] = useState<string | null>(null)

  const setCartItems = useCallback((items: CartItem[]) => {
    setCart(items)
  }, [])

  const [animateCart, setAnimateCart] = useState(false)

  const animationTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const storageDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [isCartOpen, setIsCartOpen] = useState(false)

  const openCart = () => setIsCartOpen(true)
  const closeCart = () => setIsCartOpen(false)

  /* =========================
     INIT GUEST
  ========================= */

  useEffect(() => {
    try {
      const storedGuest = localStorage.getItem(GUEST_STORAGE_KEY)

      if (storedGuest) {
        setGuestId(storedGuest)
      } else {
        const newGuest = uuidv4()
        localStorage.setItem(GUEST_STORAGE_KEY, newGuest)
        setGuestId(newGuest)
      }
    } catch {
      setGuestId(null)
    }
  }, [])

  /* =========================
     LOAD CART
  ========================= */

  useEffect(() => {
    if (user) {
      api.get<{ items: CartItem[] }>("/cart")
        .then(res => {
          setCart(res.items || [])
        })
        .catch(() => setCart([]))
    } else if (guestId) {
      try {
        const key = getCartKey(guestId)
        const stored = localStorage.getItem(key)

        if (!stored) return

        const parsed = JSON.parse(stored)
        setCart(parsed)
      } catch {
        setCart([])
      }
    }
  }, [user, guestId])

  /* =========================
     MERGE GUEST CART
  ========================= */

  useEffect(() => {
    if (!user || !guestId) return

    const key = getCartKey(guestId)
    const guestCart = localStorage.getItem(key)

    if (!guestCart) return

    const parsed = JSON.parse(guestCart)

    const merge = async () => {
      for (const item of parsed) {
        await api.post("/cart", {
          variantId: item.variantId,
          quantity: item.quantity
        })
      }

      localStorage.removeItem(key)

      const res = await api.get<{ items: CartItem[] }>("/cart")
      setCart(res.items || [])
    }

    merge()
  }, [user, guestId])

  /* =========================
     SAVE CART
  ========================= */

  useEffect(() => {
    if (user) return
    if (!guestId) return

    if (storageDebounce.current) {
      clearTimeout(storageDebounce.current)
    }

    storageDebounce.current = setTimeout(() => {
      try {
        const key = getCartKey(guestId)
        localStorage.setItem(key, JSON.stringify(cart))
      } catch {}
    }, 200)
  }, [cart, guestId, user])

  /* =========================
     CLEANUP
  ========================= */

  useEffect(() => {
    return () => {
      if (animationTimeout.current) {
        clearTimeout(animationTimeout.current)
      }
      if (storageDebounce.current) {
        clearTimeout(storageDebounce.current)
      }
    }
  }, [])

  /* =========================
     ANIMATION
  ========================= */

  const triggerCartAnimation = () => {
    setAnimateCart(true)

    if (animationTimeout.current) {
      clearTimeout(animationTimeout.current)
    }

    animationTimeout.current = setTimeout(() => {
      setAnimateCart(false)
    }, 300)
  }

  /* =========================
     ADD TO CART
  ========================= */

  const addToCart = useCallback(async (item: CartItem) => {
    if (user) {
      try {
        await api.post("/cart", {
          variantId: item.variantId,
          quantity: item.quantity
        })

        const res = await api.get<{ items: CartItem[] }>("/cart")
        setCart(res.items || [])
      } catch (err) {
        console.error("Cart API error", err)
      }
    } else {
      setCart(prev => {
        const existing = prev.find(p => p.variantId === item.variantId)

        if (existing) {
          return prev.map(p =>
            p.variantId === item.variantId
              ? {
                  ...p,
                  quantity: Math.min(p.quantity + item.quantity, MAX_QTY)
                }
              : p
          )
        }

        return [...prev, item]
      })
    }

    triggerCartAnimation()
  }, [user])

  /* ========================= */

  const updateQuantity = useCallback(
    (variantId: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(variantId)
        return
      }

      setCart(prev =>
        prev.map(item =>
          item.variantId === variantId
            ? {
                ...item,
                quantity: Math.min(quantity, MAX_QTY)
              }
            : item
        )
      )
    },
    []
  )

  const removeFromCart = useCallback(
    (variantId: string) => {
      setCart(prev =>
        prev.filter(item => item.variantId !== variantId)
      )
    },
    []
  )

  const clearCart = useCallback(() => {
    setCart([])
  }, [])

  /* ========================= */

  const cartCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0)
  }, [cart])

  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
  }, [cart])

  const total = subtotal
  const isEmpty = cart.length === 0

  /* ========================= */

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        setCartItems,
        cartCount,
        subtotal,
        total,
        isEmpty,
        guestId,
        animateCart,
        isCartOpen,
        openCart,
        closeCart
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

/* ========================= */

export const useCart = () => {
  const ctx = useContext(CartContext)

  if (!ctx) {
    throw new Error("useCart must be used within CartProvider")
  }

  return ctx
}