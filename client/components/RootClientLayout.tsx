"use client"

import Providers from "@/components/Providers"
import Header from "@/components/Header"
import { AuthProvider } from "@/context/AuthContext"
import { Toaster } from "react-hot-toast"
import AnimatedBackground from "@/components/AnimatedBackground"
import { CartProvider } from "@/context/CartContext"
import Footer from "@/components/Footer"
import { usePathname } from "next/navigation"

export default function RootClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith("/admin")

  return (
    <AuthProvider>
      <CartProvider>
        <Providers>

          <div className="fixed inset-0 -z-10">
            <AnimatedBackground />
          </div>

          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">{children}</main>
            {!isAdmin && <Footer />}
          </div>

          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#fff',
                color: '#274C77',
                borderRadius: '16px',
                padding: '16px 24px',
                boxShadow: '0 10px 30px rgba(39, 76, 119, 0.15)',
                fontWeight: '600',
              },
            }}
          />

        </Providers>
      </CartProvider>
    </AuthProvider>
  )
}