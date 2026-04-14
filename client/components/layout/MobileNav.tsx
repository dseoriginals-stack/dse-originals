"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Heart, ShieldCheck, User, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"

export default function MobileNav({ open, close }: { open: boolean, close: () => void }) {
  const { user } = useAuth()

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="absolute inset-0 bg-black/20 backdrop-blur-md"
          />

          {/* Floating Dropdown */}
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
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
                  onClick={close}
                />
                <MobileMenuItem
                  icon={<div className="text-[var(--brand-primary)]"><ImageItem size={18} /></div>}
                  label="Stories"
                  href="/stories"
                  onClick={close}
                />
                <MobileMenuItem
                  icon={<div className="text-[var(--brand-primary)]"><Heart size={18} /></div>}
                  label="Donate"
                  href="/donate"
                  onClick={close}
                />

                {(user?.role === "admin" || user?.role === "staff") && (
                  <MobileMenuItem
                    icon={<div className="text-[var(--brand-primary)]"><ShieldCheck size={18} /></div>}
                    label={user.role === "admin" ? "Admin Panel" : "Staff Panel"}
                    href="/admin"
                    onClick={close}
                  />
                )}

                <div className="h-[1px] bg-gray-50 my-2"></div>

                <MobileMenuItem
                  icon={<div className="text-[var(--brand-primary)]"><User size={18} /></div>}
                  label="My Account"
                  href="/account"
                  onClick={close}
                />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
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
