"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase-browser"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"

export default function StaffLayout({ children }: any) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkStaff = async () => {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.push("/auth/login")
        return
      }

      const session = await supabase.auth.getSession()
      const token = session.data.session?.access_token

      const user = await api.get("/auth/sync")

      if (user.role !== "staff") {
        router.push("/")
      } else {
        setLoading(false)
      }
    }

    checkStaff()
  }, [router])

  if (loading) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-light p-8">
      <h1 className="text-2xl font-bold mb-6">Staff Portal</h1>
      {children}
    </div>
  )
}