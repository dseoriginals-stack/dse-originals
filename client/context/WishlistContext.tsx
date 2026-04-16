"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "./AuthContext"
import { api } from "@/lib/api"
import toast from "react-hot-toast"

type WishlistContextType = {
  wishlist: string[]
  toggleWishlist: (productId: string) => Promise<void>
  isInWishlist: (productId: string) => boolean
  loading: boolean
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth() as any
  const [wishlist, setWishlist] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch wishlist on user login
  useEffect(() => {
    if (user) {
      fetchWishlist()
    } else {
      setWishlist([])
    }
  }, [user])

  const fetchWishlist = async () => {
    try {
      setLoading(true)
      const data = await api.get("/wishlist")
      if (Array.isArray(data)) {
        setWishlist(data)
      }
    } catch (error) {
      console.error("FAILED TO FETCH WISHLIST", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleWishlist = async (productId: string) => {
    if (!user) {
      toast.error("Sign in with Google to save favorites!", {
        icon: '🔒',
        style: {
          borderRadius: '15px',
          background: '#274C77',
          color: '#fff',
        }
      })
      return
    }

    // Optimistic Update
    const isAdding = !wishlist.includes(productId)
    if (isAdding) {
      setWishlist(prev => [...prev, productId])
      toast.success("Added to favorites", { icon: '❤️' })
    } else {
      setWishlist(prev => prev.filter(id => id !== productId))
      toast("Removed from favorites", { icon: '💔' })
    }

    try {
      await api.post("/wishlist/toggle", { productId })
    } catch (error) {
      // Revert if failed
      if (isAdding) {
        setWishlist(prev => prev.filter(id => id !== productId))
      } else {
        setWishlist(prev => [...prev, productId])
      }
      toast.error("Failed to update favorites")
    }
  }

  const isInWishlist = (productId: string) => wishlist.includes(productId)

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist, loading }}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}
