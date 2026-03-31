"use client"

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

/* =========================
   CONTEXT
========================= */

const CartContext = createContext<CartContextType | null>(null)

/* =========================
   STORAGE KEYS
========================= */

const CART_STORAGE_KEY = "dse_cart"
const GUEST_STORAGE_KEY = "dse_guest_id"
const MAX_QTY = 99

/* =========================
   PROVIDER
========================= */

export function CartProvider({
  children
}: {
  children: React.ReactNode
}) {

  const [cart, setCart] = useState<CartItem[]>([])
  const [guestId, setGuestId] = useState<string | null>(null)

  // ✅ FIXED: defined after setCart
  const setCartItems = useCallback((items: CartItem[]) => {
    setCart(items)
  }, [])

  const [animateCart, setAnimateCart] = useState(false)

  // ✅ FIXED timeout typing
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
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      if (!stored) return

      const parsed = JSON.parse(stored)

      if (
        Array.isArray(parsed) &&
        parsed.every(
          (i) =>
            typeof i.variantId === "string" &&
            typeof i.quantity === "number"
        )
      ) {
        setCart(parsed)
      }
    } catch {
      setCart([])
    }
  }, [])

  /* =========================
     SAVE CART (DEBOUNCED)
  ========================= */

  useEffect(() => {
    if (storageDebounce.current) {
      clearTimeout(storageDebounce.current)
    }

    storageDebounce.current = setTimeout(() => {
      try {
        localStorage.setItem(
          CART_STORAGE_KEY,
          JSON.stringify(cart)
        )
      } catch {}
    }, 200)
  }, [cart])

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

  const addToCart = useCallback((item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(
        p => p.variantId === item.variantId
      )

      if (existing) {
        const newQty = Math.min(
          existing.quantity + item.quantity,
          MAX_QTY
        )

        return prev.map(p =>
          p.variantId === item.variantId
            ? { ...p, quantity: newQty }
            : p
        )
      }

      return [
        ...prev,
        {
          ...item,
          quantity: Math.min(item.quantity, MAX_QTY)
        }
      ]
    })

    triggerCartAnimation()
    openCart()
  }, [])

  /* =========================
     UPDATE QTY
  ========================= */

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

  /* =========================
     REMOVE
  ========================= */

  const removeFromCart = useCallback(
    (variantId: string) => {
      setCart(prev =>
        prev.filter(
          item => item.variantId !== variantId
        )
      )
    },
    []
  )

  /* =========================
     CLEAR
  ========================= */

  const clearCart = useCallback(() => {
    setCart([])
  }, [])

  /* =========================
     DERIVED
  ========================= */

  const cartCount = useMemo(() => {
    return cart.reduce(
      (acc, item) => acc + item.quantity,
      0
    )
  }, [cart])

  const subtotal = useMemo(() => {
    return cart.reduce(
      (acc, item) =>
        acc + item.price * item.quantity,
      0
    )
  }, [cart])

  const total = subtotal
  const isEmpty = cart.length === 0

  /* =========================
     PROVIDER
  ========================= */

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

/* =========================
   HOOK
========================= */

export const useCart = () => {
  const ctx = useContext(CartContext)

  if (!ctx) {
    throw new Error(
      "useCart must be used within CartProvider"
    )
  }

  return ctx
}