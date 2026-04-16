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
    <div className="absolute right-0 top-16 w-[420px] bg-white rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.15)] border border-[var(--border-light)] overflow-hidden z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
      
      {/* HEADER */}
      <div className="p-8 pb-6 flex justify-between items-center bg-white">
        <div>
          <h3 className="text-xl font-[1000] text-[var(--text-heading)] tracking-tighter">Notification Center</h3>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1B3B60] mt-1">Real-time system alerts</p>
        </div>
        <div className="flex items-center gap-6">
            <button onClick={markAllRead} className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-[var(--brand-primary)] transition-colors">Mark all read</button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-[var(--text-heading)] transition-colors"><X size={20}/></button>
        </div>
      </div>

      <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
             <div className="w-8 h-8 border-4 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin"/>
             <span className="text-[9px] font-black uppercase tracking-widest text-gray-300 italic">Syncing Cloud...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-16 text-center opacity-30">
            <Bell size={40} strokeWidth={1} className="mx-auto mb-4" />
            <p className="text-xs font-black uppercase tracking-widest">Manifest Empty</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map(n => (
              <div 
                key={n.id} 
                onClick={() => { if(n.link) router.push(n.link); onClose(); }}
                className={`p-6 flex gap-5 hover:bg-gray-50 transition cursor-pointer relative group ${!n.read ? 'bg-blue-50/10' : ''}`}
              >
                {!n.read && <div className="absolute top-8 left-3 w-1.5 h-1.5 rounded-full bg-[#1B3B60] shadow-[0_0_10px_rgba(27,59,96,0.5)]" />}
                
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                  n.type === 'order' ? 'bg-blue-50 text-blue-600' :
                  n.type === 'stock' ? 'bg-amber-50 text-amber-600' :
                  n.type === 'payment' ? 'bg-emerald-50 text-emerald-600' :
                  'bg-gray-50 text-gray-400'
                }`}>
                  {n.type === 'order' && <Package size={24} />}
                  {n.type === 'stock' && <AlertTriangle size={24} />}
                  {n.type === 'payment' && <CheckCircle size={24} />}
                  {n.type === 'system' && <Info size={24} />}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-black text-[var(--text-heading)] leading-tight mb-1 group-hover:text-[var(--brand-primary)] transition">
                    {n.title}
                  </h4>
                  <p className="text-xs font-medium text-[var(--text-muted)] leading-relaxed">
                    {n.message}
                  </p>
                  <p className="text-[10px] text-gray-300 font-black uppercase tracking-widest mt-3">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="p-6 bg-white border-t border-gray-100">
        <button className="w-full py-5 rounded-[1.5rem] border border-gray-100 text-[10px] font-black uppercase tracking-[0.3em] text-[#1B3B60] hover:bg-gray-50 transition-all shadow-sm">
          Viewing All History
        </button>
      </div>
    </div>
  )
}
