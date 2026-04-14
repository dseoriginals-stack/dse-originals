"use client"

import { motion, AnimatePresence } from "framer-motion"
import { User } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import AccountDropdown from "@/components/AccountDropdown"

export default function UserMenu() {
  const { user } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
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
        <Link href="/account" className="text-white transition hover:text-white/80 active:scale-95 group flex items-center justify-center">
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all">
            <User size={20} className="group-hover:scale-110 transition-transform" />
          </div>
        </Link>
      )}

      <AnimatePresence mode="wait">
        {dropdownOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-4 z-50"
          >
            <AccountDropdown close={() => setDropdownOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
