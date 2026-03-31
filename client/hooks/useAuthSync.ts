"use client"

import { useEffect } from "react"
import { supabase } from "@/lib/supabase-browser"
import { api } from "@/lib/api"

export function useAuthSync() {
  useEffect(() => {
    const syncUser = async () => {
      const session = await supabase.auth.getSession()
      const token = session.data.session?.access_token

      if (!token) return

      await api.get("/auth/sync")
    }

    syncUser()

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      syncUser()
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])
}