"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { api } from "@/lib/api"
import toast from "react-hot-toast"

type User = {
  id: string
  email: string
  role: string
  luckyPoints?: number
  lifetimePoints?: number
  tier?: "Faith" | "Hope" | "Love"
  createdAt?: string
  name?: string
  phone?: string
}

type AuthResult = {
  success: boolean
  message?: string
  unverified?: boolean
}

type AuthContextType = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<AuthResult>
  register: (name: string, email: string, password: string) => Promise<AuthResult>
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
  REFRESH USER
  -----------------------------
  */
  const refresh = async () => {
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
  INITIAL LOAD
  -----------------------------
  */
  useEffect(() => {
    refresh()
  }, [])

  /*
  -----------------------------
  LOGIN
  -----------------------------
  */
  const login = async (
    email: string,
    password: string
  ): Promise<AuthResult> => {
    try {
      const res = await api.post<{ user: User }>("/auth/login", {
        email,
        password,
      })

      setUser(res.user)
      await refresh()

      toast.success("Logged in successfully!")
      return { success: true }
    } catch (err: any) {
      const message = err?.message || "Invalid email or password."
      setUser(null)
      return { success: false, message }
    }
  }

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<AuthResult> => {
    try {
      const res = await api.post<{ user: User }>("/auth/register", {
        name,
        email: email.trim().toLowerCase(),
        password: password.trim(),
      })

      setUser(res.user)
      await refresh()

      toast.success("Welcome! Account created successfully.")
      return { success: true }
    } catch (err: any) {
      const message = err?.message || "Registration failed. Please try again."
      return { success: false, message }
    }
  }

  /*
  -----------------------------
  LOGOUT
  -----------------------------
  */
  const logout = async () => {
    try {
      await api.post("/auth/logout")
    } catch {
      console.warn("Logout request failed")
    } finally {
      setUser(null)
      toast.success("Logged out")
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