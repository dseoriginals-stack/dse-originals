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
  description: "DSEoriginals offers premium, faith-inspired clothing and essentials designed with a modern aesthetic.",
  manifest: "/manifest.json",
  themeColor: "#274C77",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/DSEoriginals.png",
    other: [
      {
        rel: "apple-touch-icon-precomposed",
        url: "/DSEoriginals.png",
      },
    ],
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