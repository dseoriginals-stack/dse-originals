"use client"

import { useAuth } from "@/context/AuthContext"
import { api } from "@/lib/api"
import toast from "react-hot-toast"

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

const GUEST_STORAGE_KEY = "dse_guest_id"
// Namespaced per guest so carts don't bleed between guests
const getGuestCartKey = (guestId: string) => `dse_cart_guest_${guestId}`

const MAX_QTY = 99

// Track the last userId we loaded cart for — prevents stale merges
const LAST_CART_USER_KEY = "dse_last_cart_user"

/* ========================= */

export function CartProvider({
  children
}: {
  children: React.ReactNode
}) {

  const { user } = useAuth()

  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [guestId, setGuestId] = useState<string | null>(null)
  const [lastAddedVariantId, setLastAddedVariantId] = useState<string | null>(null)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [animateCart, setAnimateCart] = useState(false)

  const animationTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const storageDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Track which userId we've already initialized for — prevents double-merge
  const initializedUserId = useRef<string | null | undefined>(undefined)

  const setCartItems = useCallback((items: CartItem[]) => {
    setCart(items)
  }, [])

  const openCart = () => setIsCartOpen(true)
  const closeCart = () => setIsCartOpen(false)

  /* =========================
     INIT GUEST ID
     Only runs once on mount.
     Guest ID is stable per browser session.
  ========================= */

  useEffect(() => {
    try {
      const stored = localStorage.getItem(GUEST_STORAGE_KEY)
      if (stored) {
        setGuestId(stored)
      } else {
        const newId = uuidv4()
        localStorage.setItem(GUEST_STORAGE_KEY, newId)
        setGuestId(newId)
      }
    } catch {
      setGuestId(null)
    }
  }, [])

  /* =========================
     CART LOAD + MERGE (AUTHORITATIVE)

     This single effect handles ALL cart initialization:
     - Logged-in user → fetch from server
     - Guest → load from localStorage
     - Login event → clear state first, then optionally merge guest cart

     Key rule: we track `initializedUserId` so we only merge once
     per distinct login event. If the same user is already loaded,
     we skip.
  ========================= */

  useEffect(() => {
    // Don't run until guestId is resolved
    if (guestId === null) return

    const currentUserId = user?.id ?? null
    const previousUserId = initializedUserId.current

    // Skip if nothing has changed (prevents redundant re-fetches)
    if (previousUserId !== undefined && previousUserId === currentUserId) return

    // Mark as initialized for this userId
    initializedUserId.current = currentUserId

    if (currentUserId) {
      // ============================
      // LOGGED-IN: fetch server cart
      // ============================

      // Clear local cart immediately so old/guest items don't flash
      setCart([])
      setSelectedItems([])

      // Check if there's a guest cart to merge
      const guestCartKey = getGuestCartKey(guestId)
      let guestItems: CartItem[] = []
      try {
        const raw = localStorage.getItem(guestCartKey)
        if (raw) {
          guestItems = JSON.parse(raw) as CartItem[]
        }
      } catch {
        guestItems = []
      }

      const loadAndMerge = async () => {
        try {
          // First merge guest items into the server cart (if any)
          if (guestItems.length > 0) {
            for (const item of guestItems) {
              try {
                await api.post("/cart", {
                  variantId: item.variantId,
                  productId: item.productId,
                  quantity: item.quantity,
                })
              } catch {
                // Skip failed items silently
              }
            }
            // Clear guest cart from localStorage after merge
            localStorage.removeItem(guestCartKey)
            // Generate a fresh guest ID so next logout gets a clean slate
            const freshGuestId = uuidv4()
            localStorage.setItem(GUEST_STORAGE_KEY, freshGuestId)
            setGuestId(freshGuestId)
          }

          // Now fetch the authoritative server cart
          const res = await api.get<{ items: CartItem[] }>("/cart")
          setCart(res.items || [])
        } catch {
          setCart([])
        }
      }

      loadAndMerge()

    } else if (previousUserId !== undefined && previousUserId !== null) {
      // ============================
      // LOGOUT EVENT: clear everything
      // ============================
      setCart([])
      setSelectedItems([])

      // Generate fresh guest ID so the logged-out session is isolated
      const freshGuestId = uuidv4()
      try {
        localStorage.setItem(GUEST_STORAGE_KEY, freshGuestId)
      } catch {}
      setGuestId(freshGuestId)

    } else if (!currentUserId) {
      // ============================
      // GUEST: load from localStorage
      // ============================
      try {
        const guestCartKey = getGuestCartKey(guestId)
        const raw = localStorage.getItem(guestCartKey)
        if (raw) {
          setCart(JSON.parse(raw))
        } else {
          setCart([])
        }
      } catch {
        setCart([])
      }
    }
  }, [user, guestId])

  /* =========================
     PERSIST GUEST CART
     Only saves when not logged in.
  ========================= */

  useEffect(() => {
    if (user) return
    if (!guestId) return

    if (storageDebounce.current) clearTimeout(storageDebounce.current)

    storageDebounce.current = setTimeout(() => {
      try {
        const key = getGuestCartKey(guestId)
        localStorage.setItem(key, JSON.stringify(cart))
      } catch {}
    }, 200)
  }, [cart, guestId, user])

  /* =========================
     CLEANUP
  ========================= */

  useEffect(() => {
    return () => {
      if (animationTimeout.current) clearTimeout(animationTimeout.current)
      if (storageDebounce.current) clearTimeout(storageDebounce.current)
    }
  }, [])

  /* =========================
     ANIMATION
  ========================= */

  const triggerCartAnimation = () => {
    setAnimateCart(true)
    if (animationTimeout.current) clearTimeout(animationTimeout.current)
    animationTimeout.current = setTimeout(() => setAnimateCart(false), 300)
  }

  /* =========================
     ADD TO CART
  ========================= */

  const addToCart = useCallback(async (item: CartItem) => {
    if (!item.variantId) {
      toast.error("Please select a variant")
      return
    }

    if (user) {
      try {
        await api.post("/cart", {
          variantId: item.variantId,
          productId: item.productId,
          quantity: item.quantity,
        })
        const res = await api.get<{ items: CartItem[] }>("/cart")
        setCart(res.items || [])
        setSelectedItems(prev => prev.includes(item.variantId) ? prev : [...prev, item.variantId])
        setIsCartOpen(true)
        toast.success(`"${item.name}" added to cart`)
      } catch (err) {
        console.error("Cart API error", err)
        toast.error("Failed to add item to cart")
      }
    } else {
      setCart(prev => {
        const existing = prev.find(
          p => p.variantId === item.variantId && p.productId === item.productId
        )
        if (existing) {
          return prev.map(p =>
            p.variantId === item.variantId
              ? { ...p, quantity: Math.min(p.quantity + item.quantity, MAX_QTY) }
              : p
          )
        }
        return [...prev, item]
      })
      setSelectedItems(prev => prev.includes(item.variantId) ? prev : [...prev, item.variantId])
      setIsCartOpen(true)
      toast.success(`"${item.name}" added to cart`)
    }

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
            ? { ...item, quantity: Math.min(quantity, MAX_QTY) }
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
      setCart(prev => prev.filter(item => item.variantId !== variantId))
      setSelectedItems(prev => prev.filter(id => id !== variantId))

      if (user) {
        try {
          await api.delete(`/cart/item/${variantId}`)
          toast.success("Item removed from cart")
        } catch (err) {
          console.error("Failed to remove item from server cart", err)
          toast.error("Failed to remove item")
        }
      } else {
        toast.success("Item removed")
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

  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart])
  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + item.price * item.quantity, 0), [cart])
  const total = subtotal
  const isEmpty = cart.length === 0

  const toggleSelection = useCallback((variantId: string) => {
    setSelectedItems(prev =>
      prev.includes(variantId)
        ? prev.filter(id => id !== variantId)
        : [...prev, variantId]
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
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

/* ========================= */

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}