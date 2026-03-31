import "./globals.css"
import Providers from "@/components/Providers"
import Header from "@/components/Header"
import { AuthProvider } from "@/context/AuthContext"
import { ToastProvider } from "@/context/ToastContext"
import AnimatedBackground from "@/components/AnimatedBackground"
import { CartProvider } from "@/context/CartContext"

export const metadata = {
  title: "DSEoriginals",
  description:
    "Faith-inspired apparel and essentials for students, organizations, and communities.",
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className="min-h-screen bg-white">

        {/* ✅ AUTH MUST BE FIRST */}
        <AuthProvider>

          <CartProvider>
            <ToastProvider>
              <Providers>

                {/* BACKGROUND */}
                <div className="fixed inset-0 -z-10">
                  <AnimatedBackground />
                </div>

                <div className="flex flex-col min-h-screen">

                  <Header />

                  <main className="flex-1">
                    {children}
                  </main>

                </div>

              </Providers>
            </ToastProvider>
          </CartProvider>

        </AuthProvider>

      </body>
    </html>
  )
}