"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { api } from "@/lib/api"

type User = {
  id: string
  email: string
  role: string
  luckyPoints?: number
  createdAt?: string
  name?: string
  phone?: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  refresh: () => Promise<void>
  updateUser: (data: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  /*
  -----------------------------
  UPDATE USER
  -----------------------------
  */
  const updateUser = (data: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : prev))
  }

  /*
  -----------------------------
  REFRESH USER (FIXED)
  -----------------------------
  */
  const refresh = async () => {
    try {
      const data = await api.get<{ user: User }>("/auth/me") // ✅ FIXED ENDPOINT

      setUser(data.user)
    } catch (err) {
      // silent fail (user not logged in)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  /*
  -----------------------------
  INITIAL LOAD (FIXED)
  -----------------------------
  */
  useEffect(() => {
    refresh()
  }, [])

  /*
  -----------------------------
  LOGIN (FIXED)
  -----------------------------
  */
  const login = async (
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      const res = await api.post<{ user: User }>("/auth/login", {
        email,
        password,
      })

      // ✅ immediately update UI
      setUser(res.user)

      // ✅ ensure cookie/session is valid
      await refresh()

      return true
    } catch (err: any) {
      console.error("Login failed:", err.message)
      setUser(null)
      return false
    }
  }

  /*
  -----------------------------
  REGISTER (FIXED)
  -----------------------------
  */
  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      const res = await api.post<{ user: User }>("/auth/register", {
        name,
        email: email.trim().toLowerCase(),
        password: password.trim(),
      })

      setUser(res.user)

      // ✅ optional: sync session
      await refresh()

      return true
    } catch (err: any) {
      console.error("Register failed:", err.message)
      return false
    }
  }

  /*
  -----------------------------
  LOGOUT (FIXED)
  -----------------------------
  */
  const logout = async () => {
    try {
      await api.post("/auth/logout") // ✅ FIXED ENDPOINT
    } catch {
      console.warn("Logout request failed")
    } finally {
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refresh,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("AuthProvider missing")
  return ctx
}