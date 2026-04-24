"use client"

import { useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"
import toast from "react-hot-toast"
import { ShoppingCart, Bell, Package, AlertCircle } from "lucide-react"

let socket: Socket | null = null

export default function RealTimeAdmin() {
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!socket) {
      const apiBase = (process.env.NEXT_PUBLIC_API_URL || "https://dse-backend-g5qf.onrender.com").replace(/\/$/, "")
      socket = io(apiBase, {
        withCredentials: true
      })
    }

    socket.on("connect", () => {
      setIsConnected(true)
      socket?.emit("join-admin")
    })

    socket.on("disconnect", () => {
      setIsConnected(false)
    })

    // 💰 New Order Notification
    socket.on("order:new", (data: any) => {
      // Play Cha-ching sound
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3")
      audio.play().catch(e => console.log("Audio play failed", e))

      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white shadow-2xl rounded-3xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 overflow-hidden border-2 border-[var(--brand-primary)]`}
        >
          <div className="flex-1 w-0 p-5">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <div className="h-12 w-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                   <ShoppingCart size={24} />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-black text-[var(--text-heading)] uppercase tracking-wider">
                  New Order Received!
                </p>
                <p className="mt-1 text-base font-bold text-[var(--brand-primary)]">
                  ₱{data.amount.toLocaleString()} • {data.customer}
                </p>
                <p className="mt-2 text-xs font-medium text-[var(--text-muted)]">
                  Order ID: {data.id.slice(-8).toUpperCase()}
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-100">
            <button
              onClick={() => {
                 toast.dismiss(t.id)
                 window.location.href = `/admin/orders`
              }}
              className="w-full border border-transparent rounded-none rounded-r-3xl p-4 flex items-center justify-center text-sm font-black uppercase tracking-widest text-[var(--brand-primary)] hover:bg-gray-50 focus:outline-none"
            >
              View
            </button>
          </div>
        </div>
      ), { duration: 8000 })
    })

    // 📦 Low Stock Notification
    socket.on("inventory:low", (data: any) => {
        toast.error(`Low Stock Alert: ${data.name} (${data.stock} remaining)`, {
            icon: <AlertCircle size={18} />,
            duration: 6000
        })
    })

    return () => {
      // Don't disconnect here to keep connection alive during page transitions
    }
  }, [])

  // Optional: Connection status indicator for debug
  return null
}
