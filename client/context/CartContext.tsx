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
  cartKey?: string
  variantId: string
  productId: string
  name: string
  price: number
  quantity: number
  category?: string
  image?: string
  attributes?: { name: string, value: string }[]
}

type CartContextType = {
  cart: CartItem[]

  addToCart: (item: CartItem) => void
  updateQuantity: (variantId: string, quantity: number) => void
  removeFromCart: (variantId: string) => void
  removeSelectedItems: () => Promise<void>
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
    const currentUserId = user?.id || null
    const previousUserId = initializedUserId.current

    if (previousUserId !== undefined && previousUserId === currentUserId) return
    initializedUserId.current = currentUserId

    if (currentUserId) {
      // LOGGED-IN: fetch server cart & merge
      setCart([])
      setSelectedItems([])

      const guestCartKey = getGuestCartKey(guestId || "")
      let guestItems: CartItem[] = []
      try {
        const raw = localStorage.getItem(guestCartKey)
        if (raw) guestItems = JSON.parse(raw) as CartItem[]
      } catch { guestItems = [] }

      const loadAndMerge = async () => {
        try {
          if (guestItems.length > 0) {
            // Post items from oldest to newest so they appear in correct order when reversed by server
            const itemsToMerge = [...guestItems].reverse()
            for (const item of itemsToMerge) {
              try {
                await api.post("/cart", {
                  variantId: item.variantId,
                  productId: item.productId,
                  quantity: item.quantity,
                })
              } catch {}
            }
            localStorage.removeItem(guestCartKey)
            const freshGuestId = uuidv4()
            localStorage.setItem(GUEST_STORAGE_KEY, freshGuestId)
            setGuestId(freshGuestId)
          }

          const res = await api.get<{ items: CartItem[] }>("/cart")
          const items = res.items || []
          setCart(items)
          setSelectedItems(prev => prev.length > 0 ? prev : items.map(i => i.variantId))
        } catch {
          setCart([])
        }
      }
      loadAndMerge()
    } else {
      // GUEST: load from localStorage
      if (!guestId) return
      try {
        const guestCartKey = getGuestCartKey(guestId)
        const raw = localStorage.getItem(guestCartKey)
        if (raw) {
          const items = JSON.parse(raw)
          setCart(items)
          setSelectedItems(prev => prev.length > 0 ? prev : items.map((i: any) => i.variantId))
        } else {
          setCart([])
          setSelectedItems([])
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

    const cartKey = item.cartKey || `${item.variantId}-${(item.attributes || []).map(a => `${a.name}:${a.value}`).join('|')}`
    const finalItem = { ...item, cartKey }

    if (user) {
      try {
        await api.post("/cart", {
          variantId: finalItem.variantId,
          productId: finalItem.productId,
          quantity: finalItem.quantity,
          attributes: finalItem.attributes // Note: Backend needs to support this
        })
        const res = await api.get<{ items: CartItem[] }>("/cart")
        
        // Ensure items from server have cartKeys
        const itemsWithKeys = (res.items || []).map(i => ({
          ...i,
          cartKey: i.cartKey || `${i.variantId}-${(i.attributes || []).map(a => `${a.name}:${a.value}`).join('|')}`
        }))
        
        setCart(itemsWithKeys)
        setSelectedItems(prev => prev.includes(cartKey) ? prev : [...prev, cartKey])
        setIsCartOpen(true)
        toast.success(`"${finalItem.name}" added to cart`)
      } catch (err) {
        console.error("Cart API error", err)
        toast.error("Failed to add item to cart")
      }
    } else {
      setCart(prev => {
        const existing = prev.find(p => p.cartKey === cartKey)
        if (existing) {
          return prev.map(p =>
            p.cartKey === cartKey
              ? { ...p, quantity: Math.min(p.quantity + finalItem.quantity, MAX_QTY) }
              : p
          )
        }
        return [finalItem, ...prev]
      })
      setSelectedItems(prev => prev.includes(cartKey) ? prev : [...prev, cartKey])
      setIsCartOpen(true)
      toast.success(`"${finalItem.name}" added to cart`)
    }

    setSelectedItems([cartKey])
    setLastAddedVariantId(cartKey)
    triggerCartAnimation()
  }, [user])

  const clearLastAdded = useCallback(() => {
    setLastAddedVariantId(null)
  }, [])

  /* ========================= */

  const updateQuantity = useCallback(
    async (cartKey: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(cartKey)
        return
      }

      setCart(prev =>
        prev.map(item =>
          item.cartKey === cartKey
            ? { ...item, quantity: Math.min(quantity, MAX_QTY) }
            : item
        )
      )

      if (user) {
        const item = cart.find(i => i.cartKey === cartKey)
        if (!item) return

        try {
          await api.patch("/cart/qty", { 
            variantId: item.variantId, 
            quantity: Math.min(quantity, MAX_QTY),
            attributes: item.attributes
          })
        } catch (err) {
          console.error("Failed to update quantity on server", err)
        }
      }
    },
    [user, cart]
  )

  const removeFromCart = useCallback(
    async (cartKey: string) => {
      const item = cart.find(i => i.cartKey === cartKey)
      setCart(prev => prev.filter(i => i.cartKey !== cartKey))
      setSelectedItems(prev => prev.filter(id => id !== cartKey))

      if (user && item) {
        try {
          await api.delete(`/cart/item/${item.variantId}`, {
             headers: { 'x-cart-attributes': JSON.stringify(item.attributes) }
          } as any)
          toast.success("Item removed from cart")
        } catch (err) {
          console.error("Failed to remove item from server cart", err)
          toast.error("Failed to remove item")
        }
      } else {
        toast.success("Item removed")
      }
    },
    [user, cart]
  )

  const removeSelectedItems = useCallback(async () => {
    if (selectedItems.length === 0) return

    const itemsToRemove = [...selectedItems]

    // Update local state first for instant UI feedback
    setCart(prev => prev.filter(item => !itemsToRemove.includes(item.variantId)))
    setSelectedItems([])

    if (user) {
      try {
        // Run all deletions in parallel
        await Promise.all(
          itemsToRemove.map(id => api.delete(`/cart/item/${id}`))
        )
        toast.success(`${itemsToRemove.length} items removed`)
      } catch (err) {
        console.error("Failed to remove items from server", err)
        toast.error("Failed to remove some items")
      }
    } else {
      toast.success("Items removed")
    }
  }, [user, selectedItems])

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

  const toggleSelection = useCallback((cartKey: string) => {
    setSelectedItems(prev =>
      prev.includes(cartKey)
        ? prev.filter(id => id !== cartKey)
        : [...prev, cartKey]
    )
  }, [])

  const toggleAllSelection = useCallback(() => {
    if (selectedItems.length === cart.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(cart.map(i => i.cartKey!))
    }
  }, [cart, selectedItems])

  const selectedSubtotal = useMemo(() => {
    return cart
      .filter(item => selectedItems.includes(item.cartKey!))
      .reduce((acc, item) => acc + item.price * item.quantity, 0)
  }, [cart, selectedItems])
 
  const selectedCount = useMemo(() => {
    return cart
      .filter(item => selectedItems.includes(item.cartKey!))
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
        removeSelectedItems,
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