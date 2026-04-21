"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Menu, ShoppingCart } from "lucide-react"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"

import { useCart } from "@/context/CartContext"
import UserMenu from "@/components/layout/UserMenu"
import MobileNav from "@/components/layout/MobileNav"

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const { cartCount } = useCart()

  const navItems = [
    { name: "products", label: "Products" },
    { name: "stories", label: "Stories" },
    { name: "about", label: "About" },
    { name: "donate", label: "Donate" },
  ]

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#274C77]/80 backdrop-blur-2xl border-b border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.1)] transition-all duration-300">

        {/* PROMO BAND */}
        <div className="bg-[#1B3B60] text-white py-1.5 overflow-hidden relative border-b border-white/5">
          <motion.div
            animate={{ x: ["100%", "-100%"] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="whitespace-nowrap flex gap-12 text-[10px] font-black uppercase tracking-[0.3em] opacity-80"
          >
            <span>• Get Discounts from Loyalty Points</span>
            <span>• Premium Faith-Inspired Collective</span>
            <span>• Official DSEoriginals Store</span>
            <span>• Shipping Available</span>
            <span>• Hope • Faith • Love </span>
          </motion.div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex h-16 items-center justify-between">

            {/* MOBILE TOGGLE */}
            <div className="md:hidden">
              <button
                onClick={() => setMenuOpen(true)}
                className="text-white p-2 hover:bg-white/10 rounded-xl transition-all"
              >
                <Menu size={24} />
              </button>
            </div>

            {/* LOGO */}
            <div className="flex-shrink-0">
              <Link href="/" className="hover:opacity-80 transition-opacity">
                <Image src="/DSE.png" alt="DSE" width={100} height={34} className="filter brightness-0 invert" />
              </Link>
            </div>

            {/* DESKTOP NAV */}
            <nav className="hidden md:flex gap-8 text-sm font-black uppercase tracking-widest">
              {navItems.map((item) => {
                const active = pathname === `/${item.name}`
                return (
                  <Link
                    key={item.name}
                    href={`/${item.name}`}
                    className={`relative py-2 transition-all ${active ? 'text-white' : 'text-white/60 hover:text-white'}`}
                  >
                    {item.label}
                    {active && (
                      <motion.div
                        layoutId="nav_underline"
                        className="absolute bottom-0 left-0 w-full h-1 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                      />
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* UTILITY ICONS */}
            <div className="flex items-center gap-6">

              {/* CART */}
              <Link href="/cart" id="cart-icon" className="relative group text-white">
                <ShoppingCart size={22} className="group-hover:scale-110 transition-transform" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-accent to-primary text-white text-[10px] font-black px-[6px] py-[2px] rounded-full shadow-lg">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* USER */}
              <UserMenu />

            </div>
          </div>
        </div>
      </header>

      {/* MOBILE OVERLAY */}
      <MobileNav open={menuOpen} close={() => setMenuOpen(false)} />
    </>
  )
}