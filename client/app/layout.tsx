import "./globals.css"
import RootClientLayout from "@/components/RootClientLayout"
import { Outfit } from "next/font/google"

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
})

export const metadata = {
  title: "DSEoriginals",
  description: "Elevated, faith-inspired apparel and essentials.",
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
    <html lang="en" className={outfit.variable}>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body suppressHydrationWarning className="premium-theme-body">
        <RootClientLayout>{children}</RootClientLayout>
      </body>
    </html>
  )
}