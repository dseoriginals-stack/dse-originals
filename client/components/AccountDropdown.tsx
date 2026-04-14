"use client"

import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export default function AccountDropdown({ close }: any) {
  const { user, logout } = useAuth()
  const router = useRouter()

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className="
        w-64
        rounded-2xl
        bg-white/95 backdrop-blur-xl
        border border-white/30
        shadow-[0_20px_60px_rgba(0,0,0,0.25)]
        overflow-hidden
      "
    >

      {/* TOP ACCENT */}
      <div className="h-1 bg-gradient-to-r from-primary to-accent" />

      {!user && (
        <div className="p-4 space-y-2">
          <button
            onClick={() => { close(); router.push("/account") }}
            className="w-full py-2.5 px-4 rounded-xl bg-[#274C77] text-white text-sm font-semibold hover:bg-[#1B3B60] transition"
          >
            Access Portal
          </button>
        </div>
      )}

      {user && (
        <>
          {/* USER */}
          <div className="px-6 py-5 flex items-center gap-3 bg-gradient-to-br from-blue-50 to-white">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center font-semibold">
              {user.name?.charAt(0) || user.email.charAt(0)}
            </div>

            <div>
              <p className="text-sm font-semibold">
                {user.name || user.email}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user.role}
              </p>
            </div>
          </div>

          {/* MENU */}
          <div className="py-2">
            <Item label="My Account" onClick={() => router.push("/account")} />
            <Item label="Orders" onClick={() => router.push("/account?tab=orders")} />

            {(user.role === "admin" || user.role === "staff") && (
              <Item
                label={user.role === "admin" ? "Admin Panel" : "Staff Panel"}
                highlight
                onClick={() => {
                  close()

                  // ✅ Force hard navigation (bypass Next.js client routing issues)
                  window.location.href = "/admin"
                }}
              />
              
            )}
          </div>

          {/* LOGOUT */}
          <div className="border-t">
            <Item
              label="Logout"
              danger
              onClick={async () => {
                await logout()
                close()
                router.refresh()
              }}
            />
          </div>
        </>
      )}
    </motion.div>
  )
}

function Item({ label, onClick, danger, highlight }: any) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left px-6 py-3 text-sm flex justify-between
        ${danger ? "text-red-500 hover:bg-red-50" : ""}
        ${highlight ? "text-primary hover:bg-blue-50" : ""}
        ${!danger && !highlight ? "hover:bg-gray-50" : ""}
      `}
    >
      {label}
      <span className="opacity-40">→</span>
    </button>
  )
}