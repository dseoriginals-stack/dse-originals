"use client"

import { createContext, useContext, useState } from "react"

type ToastType = {
  message: string
  type: "success" | "error"
}

type ToastContextType = {
  showToast: (message: string, type?: "success" | "error") => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: any) {
  const [toast, setToast] = useState<ToastType | null>(null)

  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setToast({ message, type })

    setTimeout(() => {
      setToast(null)
    }, 3000)
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {toast && (
        <div className="fixed top-6 right-6 z-50">
          <div
            className={`px-6 py-4 rounded-xl shadow-lg text-white font-medium transition-all duration-300 ${
              toast.type === "success"
                ? "bg-green-500"
                : "bg-red-500"
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("ToastProvider missing")
  return ctx
}