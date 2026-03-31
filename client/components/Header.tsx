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
      <header className="sticky top-0 z-50 backdrop-blur-md bg-primary">
        <div className="max-w-7xl mx-auto px-4">

          {/* ================= MOBILE ================= */}
          <div className="grid grid-cols-3 h-16 items-center md:hidden">

            {/* MENU */}
            <button onClick={() => setMenuOpen(true)} className="text-white">
              <Menu size={24} />
            </button>

            {/* LOGO */}
            <div className="flex justify-center">
              <Link href="/">
                <Image src="/DSE.png" alt="DSE" width={95} height={36} />
              </Link>
            </div>

            {/* RIGHT */}
            <div className="flex justify-end gap-4 items-center">

              {/* CART */}
              <button onClick={openCart} className="relative text-white">
                <ShoppingCart size={20} />

                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-white text-black text-xs px-2 rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* ACCOUNT */}
              <div className="relative" ref={mobileDropdownRef}>
                <button
                  onClick={() => setMobileDropdownOpen((prev) => !prev)}
                  className="text-white"
                >
                  {user ? (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center text-sm font-semibold">
                      {user.name?.charAt(0) || user.email.charAt(0)}
                    </div>
                  ) : (
                    <User size={20} />
                  )}
                </button>

                <AnimatePresence>
                  {mobileDropdownOpen && (
                    <div className="absolute right-0 mt-3 z-50">
                      <AccountDropdown close={() => setMobileDropdownOpen(false)} />
                    </div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>

          {/* ================= DESKTOP ================= */}
          <div className="hidden md:flex h-20 items-center">

            {/* LOGO */}
            <div className="flex-1">
              <Link href="/">
                <Image src="/DSE.png" alt="DSE" width={120} height={40} />
              </Link>
            </div>

            {/* NAV */}
            <nav className="flex-1 flex justify-center gap-10 text-sm">
              {menuItems.map((item) => {
                const active = pathname === `/${item.name}`

                return (
                  <Link
                    key={item.name}
                    href={`/${item.name}`}
                    className={`transition ${
                      active ? "text-white" : "text-white/70"
                    } hover:text-white`}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            {/* RIGHT */}
            <div className="flex-1 flex justify-end gap-6 items-center">

              {/* CART */}
              <button onClick={openCart} className="relative text-white">
                <ShoppingCart size={20} />

                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-white text-black text-xs px-2 rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* ACCOUNT */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="text-white transition hover:opacity-80 active:scale-95"
                >
                  {user ? (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center text-sm font-semibold">
                      {user.name?.charAt(0) || user.email.charAt(0)}
                    </div>
                  ) : (
                    <User size={20} />
                  )}
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-4 z-50">
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
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-[999] bg-black/20 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />

          <div
            ref={menuRef}
            className="fixed top-16 left-4 z-[1000] w-[260px] rounded-2xl shadow-xl overflow-hidden border bg-white"
          >
            <div className="px-5 py-4 text-xs font-semibold text-gray-400">
              NAVIGATION
            </div>

            <div className="divide-y">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={`/${item.name}`}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-5 py-3 text-sm hover:bg-gray-50"
                >
                  {item.label}
                </Link>
              ))}

              <Link
                href="/account"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-5 py-3 text-primary hover:bg-gray-50"
              >
                <User size={18} />
                My Account
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  )
}