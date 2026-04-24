"use client"

import { createContext, useContext, useEffect, useState } from "react"

type Currency = "PHP" | "USD"

interface CurrencyContextType {
  currency: Currency
  rate: number
  setCurrency: (c: Currency) => void
  formatPrice: (price: number) => string
}

const CurrencyContext = createContext<CurrencyContextType | null>(null)

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("PHP")
  const [rate, setRate] = useState(0.018) // 1 PHP = 0.018 USD approx

  useEffect(() => {
    const saved = localStorage.getItem("dse_currency") as Currency
    if (saved && ["PHP", "USD"].includes(saved)) {
      setCurrencyState(saved)
    }
  }, [])

  const setCurrency = (c: Currency) => {
    setCurrencyState(c)
    localStorage.setItem("dse_currency", c)
  }

  const formatPrice = (price: number) => {
    if (currency === "USD") {
      const converted = price * rate
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(converted)
    }

    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0
    }).format(price).replace("PHP", "₱")
  }

  return (
    <CurrencyContext.Provider value={{ currency, rate, setCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error("CurrencyProvider missing")
  return ctx
}
