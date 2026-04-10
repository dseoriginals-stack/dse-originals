"use client"

export const dynamic = "force-dynamic"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { Menu, ShoppingCart, User } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"

import { useCart } from "@/context/CartContext"
import { useAuth } from "@/context/AuthContext"
import AccountDropdown from "@/components/AccountDropdown"

export default function Header() {
  const menuItems = [
    { name: "products", label: "Products" },
    { name: "stories", label: "Stories" },
    { name: "donate", label: "Donate" },
  ]

  const menuRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const mobileDropdownRef = useRef<HTMLDivElement>(null)

  const { cartCount, openCart } = useCart()
  const { user } = useAuth()

  const pathname = usePathname()
  const router = useRouter()

  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false)

  /* CLOSE MOBILE MENU */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  /* CLOSE DESKTOP DROPDOWN */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  /* CLOSE MOBILE DROPDOWN */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        mobileDropdownRef.current &&
        !mobileDropdownRef.current.contains(e.target as Node)
      ) {
        setMobileDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : ""
  }, [menuOpen])

  return (
    <>
      {/* TOP ANNOUNCEMENT BAR */}
      <div className="bg-[#1B3B60] text-white py-1.5 overflow-hidden border-b border-white/5 relative z-[60]">
        <div className="container mx-auto px-4 flex justify-center items-center gap-10 whitespace-nowrap animate-slide-left">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
            <span className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse" />
            Get Discounts From Loyalty Points
          </span>
          <span className="hidden md:flex text-[10px] font-black uppercase tracking-[0.3em] items-center gap-2 opacity-50">
            •
          </span>
          <span className="hidden md:flex text-[10px] font-black uppercase tracking-[0.3em] items-center gap-2">
            Premium Faith-Inspired Collective
          </span>
          <span className="hidden md:flex text-[10px] font-black uppercase tracking-[0.3em] items-center gap-2 opacity-50">
            •
          </span>
          <span className="hidden md:flex text-[10px] font-black uppercase tracking-[0.3em] items-center gap-2">
            Official DSE Originals Store
          </span>
        </div>
      </div>

      <header className="sticky top-0 z-50 bg-[#274C77]/80 backdrop-blur-2xl border-b border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.1)] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6">

          {/* ================= MOBILE ================= */}
          <div className="grid grid-cols-3 h-12 items-center md:hidden">

            {/* MENU */}
            <button onClick={() => setMenuOpen(true)} className="text-white hover:text-white/80 transition-colors">
              <Menu size={24} />
            </button>

            {/* LOGO */}
            <div className="flex justify-center">
              <Link href="/">
                <Image src="/DSE.png" alt="DSE" width={80} height={30} className="filter drop-shadow-sm brightness-0 invert hover:scale-105 transition-transform" />
              </Link>
            </div>

            {/* RIGHT */}
            <div className="flex justify-end gap-4 items-center">

              {/* CART */}
              <Link href="/cart" className="relative text-white hover:text-white/80 transition-colors">
                <ShoppingCart size={20} />

                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-[var(--brand-accent)] to-[var(--brand-soft)] text-[#274C77] text-[10px] font-bold px-[6px] py-[2px] rounded-full shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* ACCOUNT */}
              <div className="relative" ref={mobileDropdownRef}>
                {user ? (
                  <button
                    onClick={() => setMobileDropdownOpen((prev) => !prev)}
                    className="text-white hover:text-white/80 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-white text-[#274C77] flex items-center justify-center text-sm font-semibold shadow-[0_4px_10px_rgba(255,255,255,0.2)] font-black">
                      {user.name?.charAt(0) || user.email.charAt(0)}
                    </div>
                  </button>
                ) : (
                  <Link href="/account" className="text-white hover:text-white/80 transition-colors">
                    <User size={20} />
                  </Link>
                )}

                <AnimatePresence>
                  {user && mobileDropdownOpen && (
                    <div className="absolute right-0 mt-3 z-50 animate-fade-up">
                      <AccountDropdown close={() => setMobileDropdownOpen(false)} />
                    </div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>

          {/* ================= DESKTOP ================= */}
          <div className="hidden md:flex h-16 items-center">

            {/* LOGO */}
            <div className="flex-1">
              <Link href="/">
                <Image src="/DSE.png" alt="DSE" width={100} height={34} className="filter drop-shadow-sm brightness-0 invert hover:scale-105 transition-transform" />
              </Link>
            </div>

            {/* NAV */}
            <nav className="flex-1 flex justify-center gap-8 text-sm font-medium">
              {menuItems.map((item) => {
                const active = pathname === `/${item.name}`

                return (
                  <Link
                    key={item.name}
                    href={`/${item.name}`}
                    className={`relative transition-all duration-300 py-2 ${active ? "text-white" : "text-white/70 hover:text-white"
                      }`}
                  >
                    {item.label}
                    {active && (
                      <span className="absolute left-0 bottom-0 w-full h-[2px] bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)]"></span>
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* RIGHT */}
            <div className="flex-1 flex justify-end gap-6 items-center">

              {/* CART */}
              <Link href="/cart" className="relative group text-white hover:text-white/80 transition-colors">
                <ShoppingCart size={20} className="group-hover:scale-110 transition-transform" />

                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-[var(--brand-accent)] to-[var(--brand-soft)] text-[#274C77] text-[10px] font-bold px-[6px] py-[2px] rounded-full shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* ACCOUNT */}
              <div className="relative" ref={dropdownRef}>
                {user ? (
                  <button
                    onClick={() => setDropdownOpen((prev) => !prev)}
                    className="text-white transition hover:text-white/80 active:scale-95 group"
                  >
                    <div className="w-9 h-9 rounded-full bg-white text-[#274C77] flex items-center justify-center text-sm font-semibold shadow-[0_4px_15px_rgba(255,255,255,0.3)] group-hover:scale-110 transition-transform font-black">
                      {user.name?.charAt(0) || user.email.charAt(0)}
                    </div>
                  </button>
                ) : (
                  <Link href="/account" className="text-white transition hover:text-white/80 active:scale-95 group">
                    <User size={20} className="group-hover:scale-110 transition-transform" />
                  </Link>
                )}

                <AnimatePresence>
                  {user && dropdownOpen && (
                    <div className="absolute right-0 mt-4 z-50 animate-fade-up">
                      <AccountDropdown close={() => setDropdownOpen(false)} />
                    </div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>
        </div>
      </header>

      {/* ================= MOBILE MENU (SIDEBAR) ================= */}
      <AnimatePresence>
        {menuOpen && (
          <div className="fixed inset-0 z-[100] md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Sidebar Content */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              ref={menuRef}
              className="absolute top-0 left-0 bottom-0 w-[80%] max-w-[320px] bg-white shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="p-6 bg-[#274C77] text-white">
                <div className="flex justify-between items-center mb-4">
                   <Image src="/DSE.png" alt="DSE" width={80} height={28} className="brightness-0 invert" />
                   <button onClick={() => setMenuOpen(false)} className="bg-white/10 p-2 rounded-full hover:bg-white/20">
                     <span className="text-xl">✕</span>
                   </button>
                </div>
                <p className="text-[10px] font-bold opacity-70 uppercase tracking-[0.2em]">Menu Navigation</p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                {menuItems.map((item) => {
                  const active = pathname === `/${item.name}`
                  return (
                    <Link
                      key={item.name}
                      href={`/${item.name}`}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-base font-bold transition-all ${
                        active 
                          ? "bg-[var(--brand-primary)] text-white shadow-lg translate-x-1" 
                          : "text-[var(--text-heading)] hover:bg-gray-50 hover:translate-x-1"
                      }`}
                    >
                      {item.label}
                    </Link>
                  )
                })}

                <div className="h-[1px] bg-gray-100 my-4 mx-2"></div>

                <Link
                  href="/account"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-5 py-4 rounded-2xl text-base font-bold text-[var(--brand-primary)] bg-[var(--brand-soft)]/10 hover:bg-[var(--brand-soft)]/20 transition-all active:scale-95"
                >
                  <User size={20} />
                  My Account
                </Link>
              </div>
              
              <div className="p-6 bg-gray-50 border-t border-gray-100">
                <p className="text-[10px] text-center text-[var(--text-muted)] font-bold uppercase tracking-widest">
                  © 2026 DSE Originals
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}