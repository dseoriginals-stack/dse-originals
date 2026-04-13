"use client"

export const dynamic = "force-dynamic"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { Menu, ShoppingCart, User, ArrowRight, Heart } from "lucide-react"
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
      <header className="sticky top-0 z-50 bg-[#274C77]/80 backdrop-blur-2xl border-b border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.1)] transition-all duration-300">

        {/* TOP ANNOUNCEMENT BAR */}
        <div className="bg-[#1B3B60] text-white py-1.5 overflow-hidden relative border-b border-white/5">
          <motion.div
            animate={{ x: ["100%", "-100%"] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="whitespace-nowrap flex gap-12 text-[10px] font-black uppercase tracking-[0.3em] opacity-80"
          >
            <span>• Get Discounts from Loyalty Points</span>
            <span>• Premium Faith-Inspired Collective</span>
            <span>• Official DSE Originals Store</span>
            <span>• Shipping Available</span>
            <span>• Hope • Faith • Love </span>
          </motion.div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8">

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

      {/* ================= MOBILE MENU (FLOATING DROPDOWN) ================= */}
      <AnimatePresence>
        {menuOpen && (
          <div className="fixed inset-0 z-[100] md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="absolute inset-0 bg-black/20 backdrop-blur-md"
            />

            {/* Floating Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              ref={menuRef}
              className="absolute top-16 left-4 w-72 bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-[var(--border-light)] overflow-hidden"
            >
              <div className="p-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--brand-primary)]/40 mb-6 px-1">
                  DSE Originals
                </p>

                <div className="flex flex-col">
                  <MobileMenuItem
                    icon={<div className="text-[var(--brand-primary)]"><Menu size={18} /></div>}
                    label="Products"
                    href="/products"
                    onClick={() => setMenuOpen(false)}
                  />
                  <MobileMenuItem
                    icon={<div className="text-[var(--brand-primary)]"><ImageItem size={18} /></div>}
                    label="Stories"
                    href="/stories"
                    onClick={() => setMenuOpen(false)}
                  />
                  <MobileMenuItem
                    icon={<div className="text-[var(--brand-primary)]"><Heart size={18} /></div>}
                    label="Donate"
                    href="/donate"
                    onClick={() => setMenuOpen(false)}
                  />

                  {user?.role === "admin" && (
                    <MobileMenuItem
                      icon={<div className="text-[var(--brand-primary)]"><ShieldCheck size={18} /></div>}
                      label="Admin Panel"
                      href="/admin"
                      onClick={() => setMenuOpen(false)}
                    />
                  )}

                  <div className="h-[1px] bg-gray-50 my-2"></div>

                  <MobileMenuItem
                    icon={<div className="text-[var(--brand-primary)]"><User size={18} /></div>}
                    label="My Account"
                    href="/account"
                    onClick={() => setMenuOpen(false)}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

function ImageItem({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  )
}

function MobileMenuItem({ icon, label, href, onClick }: any) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-4 px-2 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors group"
    >
      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all duration-300">
        {icon}
      </div>
      <span className="text-sm font-black text-[#274C77] tracking-tight">{label}</span>
      <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
        <ArrowRight size={14} className="text-[var(--brand-primary)]" />
      </span>
    </Link>
  )
}