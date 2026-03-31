"use client"

export const dynamic = "force-dynamic"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { Menu, ShoppingCart, User } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

import { useCart } from "@/context/CartContext"
import { useAuth } from "@/context/AuthContext"

export default function Header() {
  const menuItems = [
    { name: "products", label: "Products" },
    { name: "stories", label: "Stories" },
    { name: "donate", label: "Donate" },
  ]

  const menuRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { cartCount, openCart } = useCart()
  const { user, logout } = useAuth()
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false)
  const mobileDropdownRef = useRef<HTMLDivElement>(null)

  const pathname = usePathname()
  const router = useRouter()

  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

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

  /* CLOSE DROPDOWN */
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

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : ""
  }, [menuOpen])

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
                    <div className="
                      w-8 h-8 rounded-full 
                      bg-gradient-to-br from-primary to-accent
                      text-white flex items-center justify-center text-sm font-semibold
                    ">
                      {user.name?.charAt(0) || user.email.charAt(0)}
                    </div>
                  ) : (
                    <User size={20} />
                  )}
                </button>

                {/* MOBILE DROPDOWN */}
                {mobileDropdownOpen && (
                  <div className="
                    absolute right-0 mt-3 w-52 
                    bg-white rounded-xl shadow-lg border 
                    overflow-hidden z-50
                  ">

                    {!user && (
                      <button
                        onClick={() => {
                          setMobileDropdownOpen(false)
                          window.location.href = "/account"
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50"
                      >
                        Login / Register
                      </button>
                    )}

                    {user && (
                      <>
                        <div className="px-4 py-3 border-b text-sm">
                          <p className="font-medium">
                            {user.name || user.email}
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            window.location.href = "/account"
                          }}
                          className="w-full text-left px-4 py-3 text-primary hover:bg-gray-50"
                        >
                          My Account
                        </button>

                        <button
                          onClick={async () => {
                            await logout()
                            setMobileDropdownOpen(false)
                            window.location.reload()
                          }}
                          className="w-full text-left px-4 py-3 text-red-500 hover:bg-red-50"
                        >
                          Logout
                        </button>
                      </>
                    )}
                  </div>
                )}
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
              <button onClick={openCart} className="text-white">
                <ShoppingCart size={20} />
              </button>

              {/* ACCOUNT DROPDOWN */}
              <div className="relative" ref={dropdownRef}>
                
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="text-white transition hover:opacity-80 active:scale-95"
                >
                  {user ? (
                    <div className="
                      w-9 h-9 rounded-full 
                      bg-gradient-to-br from-primary to-accent
                      text-white 
                      flex items-center justify-center 
                      text-sm font-semibold
                      shadow-md
                      hover:scale-105 active:scale-95
                      transition
                    ">
                      {user.name?.charAt(0) || user.email.charAt(0)}
                    </div>
                  ) : (
                    <User size={20} />
                  )}
                </button>

                {/* DROPDOWN */}
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 12, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 12, scale: 0.96 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="
                        absolute right-0 mt-4 w-64 
                        rounded-2xl 
                        bg-white/95 backdrop-blur-xl 
                        border border-white/30
                        shadow-[0_20px_60px_rgba(0,0,0,0.25)]
                        overflow-hidden z-50
                      "
                    >

                      {/* TOP GRADIENT ACCENT */}
                      <div className="h-1 bg-gradient-to-r from-primary to-accent" />

                      {!user && (
                        <button
                          onClick={() => {
                            router.push("/account")
                            setDropdownOpen(false)
                          }}
                          className="w-full px-6 py-4 text-left text-sm hover:bg-gray-50 transition"
                        >
                          Login / Register
                        </button>
                      )}

                      {user && (
                        <>
                          {/* USER SECTION */}
                          <div className="px-6 py-5 bg-gradient-to-br from-blue-50 to-white">

                            <div className="flex items-center gap-3">
                              <div className="
                                w-10 h-10 rounded-full 
                                bg-gradient-to-br from-primary to-accent 
                                text-white flex items-center justify-center 
                                font-semibold shadow-md
                              ">
                                {user.name?.charAt(0) || user.email.charAt(0)}
                              </div>

                              <div>
                                <p className="text-sm font-semibold text-gray-800">
                                  {user.name || user.email}
                                </p>
                                <p className="text-xs text-gray-500 capitalize">
                                  {user.role}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* MENU */}
                          <div className="py-2">

                            <DropdownItem
                              label="My Account"
                              onClick={() => router.push("/account")}
                            />

                            <DropdownItem
                              label="Orders"
                              onClick={() => router.push("/account?tab=orders")}
                            />

                            {user.role === "admin" && (
                              <DropdownItem
                                label="Admin Panel"
                                highlight
                                onClick={() => router.push("/admin")}
                              />
                            )}

                          </div>

                          {/* LOGOUT */}
                          <div className="border-t">
                            <DropdownItem
                              label="Logout"
                              danger
                              onClick={async () => {
                                await logout()
                                setDropdownOpen(false)
                                router.refresh()
                              }}
                            />
                          </div>
                        </>
                      )}
                    </motion.div>
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

/* ================= DROPDOWN ITEM ================= */

function DropdownItem({ label, onClick, danger, highlight }: any) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left px-6 py-3 text-sm 
        flex items-center justify-between
        transition-all duration-150

        ${danger ? "text-red-500 hover:bg-red-50" : ""}
        ${highlight ? "text-primary hover:bg-blue-50" : ""}
        ${!danger && !highlight ? "hover:bg-gray-50 text-gray-700" : ""}
      `}
    >
      {label}
      <span className="text-xs opacity-40">→</span>
    </button>
  )
}