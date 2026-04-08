"use client"

export const dynamic = "force-dynamic"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { Menu, ShoppingCart, User } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { AnimatePresence } from "framer-motion"

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
      <header className="sticky top-0 z-50 bg-[#274C77] shadow-lg transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4">

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
                <button
                  onClick={() => setMobileDropdownOpen((prev) => !prev)}
                  className="text-white hover:text-white/80 transition-colors"
                >
                  {user ? (
                    <div className="w-8 h-8 rounded-full bg-white text-[#274C77] flex items-center justify-center text-sm font-semibold shadow-[0_4px_10px_rgba(255,255,255,0.2)]">
                      {user.name?.charAt(0) || user.email.charAt(0)}
                    </div>
                  ) : (
                    <User size={20} />
                  )}
                </button>

                <AnimatePresence>
                  {mobileDropdownOpen && (
                    <div className="absolute right-0 mt-3 z-50 animate-fade-up">
                      <AccountDropdown close={() => setMobileDropdownOpen(false)} />
                    </div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>

          {/* ================= DESKTOP ================= */}
          <div className="hidden md:flex h-14 items-center">

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
                    className={`relative transition-all duration-300 py-2 ${
                      active ? "text-white" : "text-white/70 hover:text-white"
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
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="text-white transition hover:text-white/80 active:scale-95 group"
                >
                  {user ? (
                    <div className="w-9 h-9 rounded-full bg-white text-[#274C77] flex items-center justify-center text-sm font-semibold shadow-[0_4px_15px_rgba(255,255,255,0.3)] group-hover:scale-110 transition-transform">
                      {user.name?.charAt(0) || user.email.charAt(0)}
                    </div>
                  ) : (
                    <User size={20} className="group-hover:scale-110 transition-transform" />
                  )}
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
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

      {/* ================= MOBILE MENU ================= */}
      <AnimatePresence>
      {menuOpen && (
        <div className="fixed inset-0 z-[999]">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
            onClick={() => setMenuOpen(false)}
          />

          <div
            ref={menuRef}
            className="absolute top-12 left-0 right-0 z-[1000] bg-white rounded-b-3xl shadow-[0_20px_40px_rgba(39,76,119,0.2)] animate-fade-down overflow-hidden"
          >
            <div className="bg-gray-50 px-6 py-4 text-[10px] font-bold text-[var(--brand-primary)] tracking-[0.2em] uppercase border-b border-gray-100">
              Menu Navigation
            </div>

            <div className="flex flex-col p-4 gap-1">
              {menuItems.map((item) => {
                 const active = pathname === `/${item.name}`
                 return (
                  <Link
                    key={item.name}
                    href={`/${item.name}`}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-4 rounded-2xl text-base font-semibold transition-all ${
                       active ? "bg-[var(--brand-primary)] text-white shadow-md" : "text-[var(--text-heading)] hover:bg-[var(--bg-main)]"
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
                className="flex items-center gap-3 px-4 py-4 rounded-2xl text-base font-semibold text-[var(--brand-primary)] bg-[var(--brand-soft)]/10 hover:bg-[var(--brand-soft)]/20 transition-all group"
              >
                <User size={20} className="text-[var(--brand-primary)]" />
                My Account
              </Link>
            </div>
          </div>
        </div>
      )}
      </AnimatePresence>
    </>
  )
}