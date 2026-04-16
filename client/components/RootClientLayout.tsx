"use client"

import Providers from "@/components/Providers"
import Header from "@/components/Header"
import { AuthProvider } from "@/context/AuthContext"
import { Toaster } from "react-hot-toast"
import AnimatedBackground from "@/components/AnimatedBackground"
import { CartProvider } from "@/context/CartContext"
import Footer from "@/components/Footer"
import FloatingChat from "@/components/FloatingChat"
import RecentPurchasePopup from "@/components/RecentPurchasePopup"
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
            {!isAdmin && <FloatingChat />}
            {!isAdmin && <RecentPurchasePopup />}
          </div>

          <Toaster 
            position="top-right"
            containerStyle={{
              top: 100,
              right: 20,
              zIndex: 99999
            }}
            gutter={12}
            toastOptions={{
              duration: 3000,
              style: {
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                color: '#274C77',
                borderRadius: '20px',
                padding: '16px 24px',
                boxShadow: '0 20px 40px rgba(39, 76, 119, 0.12)',
                fontWeight: '700',
                border: '1px solid rgba(255,255,255,0.5)',
                fontSize: '14px'
              },
            }}
          />

        </Providers>
      </CartProvider>
    </AuthProvider>
  )
}