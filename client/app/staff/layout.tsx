"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

export default function StaffLayout({ children }: any) {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push("/account?error=staff_required")
      return
    }

    if (user.role !== "staff" && user.role !== "admin") {
      router.push("/")
    }
  }, [user, loading, router])

  if (loading) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-light p-8">
      <h1 className="text-2xl font-bold mb-6">Staff Portal</h1>
      {children}
    </div>
  )
}