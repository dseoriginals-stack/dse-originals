"use client"

import { useState, useEffect } from "react"
import { Bell, Package, AlertTriangle, CheckCircle, Info, X } from "lucide-react"
import { api } from "@/lib/api"
import { useRouter } from "next/navigation"

type AdminNotification = {
  id: string
  type: string
  message: string
  isRead: boolean
  createdAt: string
  metadata?: any
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
      const res = await api.get<{ notifications: AdminNotification[], unreadCount: number }>("/admin/notifications")
      setNotifications(res?.notifications || [])
    } catch (err) {
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  const markAllRead = async () => {
    try {
      await api.patch("/admin/notifications/read-all", {})
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch (err) {
      console.error("Failed to mark all read:", err)
    }
  }

  const handleNotificationClick = async (n: AdminNotification) => {
    try {
      if (!n.isRead) {
        await api.patch(`/admin/notifications/${n.id}/read`, {})
      }
      
      let link = ""
      if (n.type === "NEW_ORDER") link = "/admin/orders"
      if (n.type === "NEW_REVIEW") link = "/admin/reviews"
      if (n.type === "NEW_STORY") link = "/admin/stories"

      if (link) router.push(link)
      onClose()
    } catch (err) {
      console.error("Action failed:", err)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "NEW_ORDER": return <Package size={24} />
      case "NEW_REVIEW": return <CheckCircle size={24} />
      case "NEW_STORY": return <Info size={24} />
      case "LOW_STOCK": return <AlertTriangle size={24} />
      default: return <Bell size={24} />
    }
  }

  const getColorClass = (type: string) => {
    switch (type) {
      case "NEW_ORDER": return "bg-blue-50 text-blue-600"
      case "NEW_REVIEW": return "bg-emerald-50 text-emerald-600"
      case "NEW_STORY": return "bg-purple-50 text-purple-600"
      case "LOW_STOCK": return "bg-amber-50 text-amber-600"
      default: return "bg-gray-50 text-gray-400"
    }
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
                onClick={() => handleNotificationClick(n)}
                className={`p-6 flex gap-5 hover:bg-gray-50 transition cursor-pointer relative group ${!n.isRead ? 'bg-blue-50/10' : ''}`}
              >
                {!n.isRead && <div className="absolute top-8 left-3 w-1.5 h-1.5 rounded-full bg-[#1B3B60] shadow-[0_0_10px_rgba(27,59,96,0.5)]" />}
                
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${getColorClass(n.type)}`}>
                  {getIcon(n.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-black text-[var(--text-heading)] leading-tight mb-1 group-hover:text-[var(--brand-primary)] transition">
                    {n.type.replace(/_/g, ' ')}
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
