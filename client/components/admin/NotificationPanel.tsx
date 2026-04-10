"use client"

import { useState, useEffect } from "react"
import { Bell, Package, AlertTriangle, CheckCircle, Info, X } from "lucide-react"
import { api } from "@/lib/api"
import { useRouter } from "next/navigation"

type AdminNotification = {
  id: string
  type: "order" | "stock" | "payment" | "system"
  title: string
  message: string
  read: boolean
  createdAt: string
  link?: string
}

export default function NotificationPanel({ onClose }: { onClose: () => void }) {
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchNotifications()
  }, [])

  async function fetchNotifications() {
    try {
      setLoading(true)
      // Mocking for now, would be a real API call
      // In a real app, this might be a table in DB
      const mock: AdminNotification[] = [
        {
          id: "1",
          type: "order",
          title: "New Order Received",
          message: "A new order #82A1B has been placed by a guest.",
          read: false,
          createdAt: new Date().toISOString(),
          link: "/admin/orders"
        },
        {
          id: "2",
          type: "stock",
          title: "Low Stock Alert",
          message: "Product 'Marine Shirt' is running low (2 left).",
          read: false,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          link: "/admin/products"
        },
        {
          id: "3",
          type: "payment",
          title: "Payment Approval Required",
          message: "Order #7721A is awaiting manual payment verification.",
          read: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          link: "/admin/orders"
        }
      ]
      setNotifications(mock)
    } finally {
      setLoading(false)
    }
  }

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  return (
    <div className="absolute right-0 top-14 w-96 bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-[var(--border-light)] overflow-hidden z-[100] animate-fade-in">
      <div className="p-6 bg-[var(--bg-surface)] border-b border-[var(--border-light)] flex justify-between items-center">
        <div>
          <h3 className="text-sm font-[1000] text-[var(--text-heading)] tracking-tight">Notification Center</h3>
          <p className="text-[9px] font-black uppercase tracking-widest text-[var(--brand-primary)] mt-0.5">Real-time system alerts</p>
        </div>
        <div className="flex gap-2">
            <button onClick={markAllRead} className="text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-[var(--brand-primary)] transition">Mark all read</button>
            <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition"><X size={14}/></button>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="p-10 text-center"><div className="w-8 h-8 border-4 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin mx-auto"/></div>
        ) : notifications.length === 0 ? (
          <div className="p-10 text-center">
            <Bell size={24} className="mx-auto text-gray-200 mb-2" />
            <p className="text-xs font-bold text-gray-400 italic">No new alerts found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map(n => (
              <div 
                key={n.id} 
                onClick={() => { if(n.link) router.push(n.link); onClose(); }}
                className={`p-5 flex gap-4 hover:bg-gray-50 transition cursor-pointer relative ${!n.read ? 'bg-[var(--brand-soft)]/5' : ''}`}
              >
                {!n.read && <div className="absolute top-6 left-2 w-1.5 h-1.5 rounded-full bg-[var(--brand-primary)]" />}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  n.type === 'order' ? 'bg-blue-50 text-blue-500' :
                  n.type === 'stock' ? 'bg-amber-50 text-amber-500' :
                  n.type === 'payment' ? 'bg-emerald-50 text-emerald-500' :
                  'bg-gray-50 text-gray-400'
                }`}>
                  {n.type === 'order' && <Package size={18}/>}
                  {n.type === 'stock' && <AlertTriangle size={18}/>}
                  {n.type === 'payment' && <CheckCircle size={18}/>}
                  {n.type === 'system' && <Info size={18}/>}
                </div>
                <div>
                  <h4 className="text-xs font-black text-[var(--text-heading)] leading-tight mb-1">{n.title}</h4>
                  <p className="text-[11px] text-[var(--text-muted)] font-medium leading-relaxed line-clamp-2">{n.message}</p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter mt-2">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 bg-[var(--bg-surface)] border-t border-[var(--border-light)]">
        <button className="w-full py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-[var(--brand-primary)] hover:bg-white transition shadow-sm border border-transparent hover:border-gray-200">
          Viewing All History
        </button>
      </div>
    </div>
  )
}
