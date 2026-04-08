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
  productId: string
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

  selectedItems: string[]
  toggleSelection: (variantId: string) => void
  toggleAllSelection: () => void
  selectedSubtotal: number
  selectedCount: number

  lastAddedVariantId: string | null
  clearLastAdded: () => void

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
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [guestId, setGuestId] = useState<string | null>(null)
  const [lastAddedVariantId, setLastAddedVariantId] = useState<string | null>(null)

  const setCartItems = useCallback((items: CartItem[]) => {
    setCart(items)
    // Do NOT auto-select — cart starts with nothing selected
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
        // Do NOT auto-select on load — starts unselected
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
          productId: item.productId,
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
          productId: item.productId,
          quantity: item.quantity
        })

        const res = await api.get<{ items: CartItem[] }>("/cart")
        setCart(res.items || [])
      } catch (err) {
        console.error("Cart API error", err)
      }
    } else {
      setCart(prev => {
        const existing = prev.find(
        p =>
          p.variantId === item.variantId &&
          p.productId === item.productId
      )

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

    // Select ONLY this newly added item (deselect others)
    setSelectedItems([item.variantId])
    setLastAddedVariantId(item.variantId)
    triggerCartAnimation()
  }, [user])

  const clearLastAdded = useCallback(() => {
    setLastAddedVariantId(null)
  }, [])

  /* ========================= */

  const updateQuantity = useCallback(
    async (variantId: string, quantity: number) => {
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

      if (user) {
        try {
          await api.patch("/cart/qty", { variantId, quantity: Math.min(quantity, MAX_QTY) })
        } catch (err) {
          console.error("Failed to update quantity on server", err)
        }
      }
    },
    [user]
  )

  const removeFromCart = useCallback(
    async (variantId: string) => {
      setCart(prev =>
        prev.filter(item => item.variantId !== variantId)
      )
      setSelectedItems(prev => prev.filter(id => id !== variantId))

      if (user) {
        try {
          await api.delete(`/cart/item/${variantId}`)
        } catch (err) {
          console.error("Failed to remove item from server cart", err)
        }
      }
    },
    [user]
  )

  const clearCart = useCallback(async () => {
    setCart([])
    setSelectedItems([])
    
    if (user) {
      try {
        await api.delete("/cart")
      } catch (err) {
        console.error("Failed to clear server cart", err)
      }
    }
  }, [user])

  /* ========================= */

  const cartCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0)
  }, [cart])

  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
  }, [cart])

  const total = subtotal
  const isEmpty = cart.length === 0

  const toggleSelection = useCallback((variantId: string) => {
    setSelectedItems(prev =>
      // If already selected → deselect (empty). If not → select ONLY this one.
      prev.includes(variantId) ? [] : [variantId]
    )
  }, [])

  const toggleAllSelection = useCallback(() => {
    if (selectedItems.length === cart.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(cart.map(i => i.variantId))
    }
  }, [cart, selectedItems])

  const selectedSubtotal = useMemo(() => {
    return cart
      .filter(item => selectedItems.includes(item.variantId))
      .reduce((acc, item) => acc + item.price * item.quantity, 0)
  }, [cart, selectedItems])

  const selectedCount = useMemo(() => {
    return cart
      .filter(item => selectedItems.includes(item.variantId))
      .reduce((acc, item) => acc + item.quantity, 0)
  }, [cart, selectedItems])

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
        selectedItems,
        toggleSelection,
        toggleAllSelection,
        selectedSubtotal,
        selectedCount,
        lastAddedVariantId,
        clearLastAdded,
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