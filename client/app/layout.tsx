import "./globals.css"
import RootClientLayout from "@/components/RootClientLayout"

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
        <RootClientLayout>{children}</RootClientLayout>
      </body>
    </html>
  )
}