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
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  if (!token) {
    setUser(null)
    setLoading(false)
    return
  }

  try {
    const data = await api.get<{ user: User }>("/auth/me")
    setUser(data.user)
  } catch {
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
    const res = await api.post<{ user: User; token: string }>("/auth/login", {
      email,
      password,
    })

    // ✅ STORE TOKEN (CRITICAL FIX)
    if (res.token) {
      localStorage.setItem("token", res.token)
    }

    setUser(res.user)

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
    const res = await api.post<{ user: User; token: string }>("/auth/register", {
      name,
      email: email.trim().toLowerCase(),
      password: password.trim(),
    })

    // ✅ STORE TOKEN
    if (res.token) {
      localStorage.setItem("token", res.token)
    }

    setUser(res.user)

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
    await api.post("/auth/logout")
  } catch {
    console.warn("Logout request failed")
  } finally {
    // ✅ REMOVE TOKEN
    localStorage.removeItem("token")
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