"use client"

import Providers from "@/components/Providers"
import Header from "@/components/Header"
import { AuthProvider } from "@/context/AuthContext"
import { ToastProvider } from "@/context/ToastContext"
import AnimatedBackground from "@/components/AnimatedBackground"
import { CartProvider } from "@/context/CartContext"

export default function RootClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <Providers>

            <div className="fixed inset-0 -z-10">
              <AnimatedBackground />
            </div>

            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-1">{children}</main>
            </div>

          </Providers>
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  )
}