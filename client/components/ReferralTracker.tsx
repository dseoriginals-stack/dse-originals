"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"

/**
 * 🔗 ReferralTracker
 * Captures ?ref=XXXX from the URL and persists it in localStorage.
 * This ensures that even if the user navigates away and then logs in,
 * we still know who referred them.
 */
export default function ReferralTracker() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const ref = searchParams.get("ref")
    if (ref && ref.startsWith("DSE-")) {
      // Save for 30 days
      localStorage.setItem("dse_referral_code", ref)
      console.log("🔗 Referral captured:", ref)
    }
  }, [searchParams])

  return null
}
