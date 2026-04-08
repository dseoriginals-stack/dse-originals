"use client"

import { useState, useEffect } from "react"
import { User, Package, Heart, Settings, LogOut } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import AuthModal from "@/components/AuthModal"
import { orderService } from "@/lib/services/order"

export default function AccountPage() {
  const { user, loading, logout } = useAuth()

  const [orders, setOrders] = useState<any[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)

  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [tracking, setTracking] = useState<any[]>([])
  const [trackingLoading, setTrackingLoading] = useState(false)

  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")

  /* LOAD ORDERS */
  useEffect(() => {
    if (!user) return

    const loadOrders = async () => {
      try {
        setOrdersLoading(true)
        const data = await orderService.getMyOrders()
        setOrders(data)
      } catch {
        console.error("Orders fetch failed")
      } finally {
        setOrdersLoading(false)
      }
    }

    loadOrders()
  }, [user])

  /* AUTO OPEN LOGIN */
  useEffect(() => {
    if (!user && !loading) setOpen(true)
  }, [user, loading])

  /* VIEW ORDER */
  const handleViewOrder = async (order: any) => {
    setSelectedOrder(order)

    try {
      setTrackingLoading(true)
      const res = await orderService.getTracking(order.id)
      setTracking(res.events || [])
    } catch {
      setTracking([])
    } finally {
      setTrackingLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading your account...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] px-4 py-10 md:py-16 md:px-10">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="mb-12 flex items-center justify-between bg-[var(--bg-card)] border border-[var(--border-light)] px-8 py-6 rounded-[2rem] shadow-sm">
          <div className="flex items-center gap-6">

            {/* AVATAR */}
            <div className="
              w-16 h-16 rounded-full
              bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-accent)]
              text-white flex items-center justify-center text-2xl
              font-extrabold shadow-lg border-4 border-white
            ">
              {(user?.name?.charAt(0) || user?.email?.charAt(0) || "?").toUpperCase()}
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-heading)]">
                {user ? `Welcome back, ${user.name || "User"}` : "Your Account"}
              </h1>
              <p className="text-[var(--text-muted)] font-semibold text-sm tracking-wide mt-1">
                {user ? user.email : "Login to access your profile"}
              </p>
            </div>
          </div>

          {user && (
            <button
              onClick={logout}
              className="flex items-center gap-2 text-sm text-red-500 hover:opacity-70"
            >
              <LogOut size={16} />
              Logout
            </button>
          )}
        </div>

        {/* GUEST */}
        {!user && (
          <div className="bg-[var(--bg-card)] rounded-[2rem] border border-[var(--border-light)] shadow-md p-10 md:p-16 text-center max-w-2xl mx-auto mt-16">
            <h2 className="text-3xl font-bold text-[var(--text-heading)] mb-4">
              Welcome to DSEoriginals
            </h2>
            <p className="text-[var(--text-muted)] text-lg mb-10 max-w-sm mx-auto">
              Login to manage your orders, access your wishlist, and configure your exclusive profile.
            </p>
            <button
              onClick={() => setOpen(true)}
              className="btn-premium !py-4 !px-12 text-lg shadow-xl"
            >
              Login / Register
            </button>
          </div>
        )}

        {/* DASHBOARD */}
        {user && (
          <div className="grid md:grid-cols-[260px_1fr] gap-8">

            {/* SIDEBAR */}
            <div className="bg-[var(--bg-card)] rounded-3xl shadow-sm border border-[var(--border-light)] p-5 h-fit sticky top-28 flex flex-col gap-2">
              <SidebarItem icon={<User size={20} />} label="Overview" active={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")} />
              <SidebarItem icon={<Package size={20} />} label="Order History" active={activeTab === "orders"} onClick={() => setActiveTab("orders")} />
              <SidebarItem icon={<Heart size={20} />} label="My Wishlist" active={activeTab === "wishlist"} onClick={() => setActiveTab("wishlist")} />
              <SidebarItem icon={<Settings size={20} />} label="Account Settings" active={activeTab === "settings"} onClick={() => setActiveTab("settings")} />
            </div>

            {/* CONTENT */}
            <div className="bg-[var(--bg-card)] rounded-[2rem] shadow-sm border border-[var(--border-light)] p-8 md:p-10 min-h-[500px]">

              {/* DASHBOARD */}
              {activeTab === "dashboard" && (
                <div className="animate-fade-in">
                  <h3 className="text-2xl font-bold text-[var(--text-heading)] mb-8">Account Overview</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <StatCard title="Orders" value={orders.length} />
                    <StatCard title="Wishlist" value="0" />
                    <StatCard title="Lucky Points" value={user.luckyPoints || 0} />
                  </div>
                </div>
              )}

              {/* ORDERS */}
              {activeTab === "orders" && (
                <div className="animate-fade-in">
                  <h3 className="text-2xl font-bold text-[var(--text-heading)] mb-8">Order History</h3>

                  {ordersLoading ? (
                    <p className="text-[var(--text-muted)] animate-pulse">Loading amazing orders...</p>
                  ) : orders.length === 0 ? (
                    <EmptyState text="You don’t have any orders yet." />
                  ) : (
                    <div className="space-y-5">
                      {orders.map((order) => (
                        <div key={order.id} className="p-6 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center hover:shadow-md transition gap-4">
                          <div>
                            <p className="font-bold text-[var(--text-heading)] tracking-wide">Order #{order.id.slice(0, 8)}</p>
                            <p className="text-sm font-semibold text-[var(--text-muted)] mt-1">
                              {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                            </p>
                            <span className="mt-3 inline-block px-3 py-1 bg-[var(--brand-soft)]/20 text-[var(--brand-primary)] text-[10px] font-bold uppercase tracking-widest rounded-full">
                              {order.status}
                            </span>
                          </div>

                          <div className="text-left md:text-right w-full md:w-auto flex flex-row md:flex-col justify-between items-center md:items-end">
                            <p className="font-extrabold text-xl text-[var(--brand-primary)]">₱{Number(order.total).toLocaleString()}</p>
                            <button
                              onClick={() => handleViewOrder(order)}
                              className="text-sm font-bold text-[var(--brand-primary)] hover:text-white hover:bg-[var(--brand-primary)] transition-colors px-4 py-2 rounded-xl border border-[var(--brand-primary)] md:mt-3"
                            >
                              Track & Details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* WISHLIST */}
              {activeTab === "wishlist" && (
                <EmptyState text="No saved products yet." />
              )}

              {/* SETTINGS */}
              {activeTab === "settings" && (
                <div className="space-y-4">
                  <InfoRow label="Name" value={user.name || "-"} />
                  <InfoRow label="Email" value={user.email} />
                  <InfoRow label="Phone" value={user.phone || "-"} />
                  <InfoRow
                    label="Member Since"
                    value={
                      user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "-"
                    }
                  />
                </div>
              )}

            </div>
          </div>
        )}

      </div>

      {/* MODALS */}
      <AuthModal open={open} onClose={() => setOpen(false)} />

      {selectedOrder && (
        <OrderModal
          order={selectedOrder}
          tracking={tracking}
          loading={trackingLoading}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  )
}

/* COMPONENTS */

function SidebarItem({ icon, label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-base font-semibold w-full transition-all duration-300 ${
        active ? "bg-[var(--brand-primary)] text-white shadow-md drop-shadow-sm translate-x-1" : "text-[var(--text-muted)] hover:bg-[var(--bg-main)] hover:text-[var(--brand-primary)]"
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

function StatCard({ title, value }: any) {
  return (
    <div className="p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-light)] shadow-sm hover:shadow-md transition flex flex-col items-center justify-center text-center">
      <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-[0.2em]">{title}</p>
      <h4 className="text-4xl md:text-5xl font-extrabold text-[var(--brand-primary)] mt-4">{value}</h4>
    </div>
  )
}

function InfoRow({ label, value }: any) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  )
}

function EmptyState({ text }: any) {
  return <div className="text-center py-16 text-gray-500">{text}</div>
}

function OrderModal({ order, tracking, loading, onClose }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl p-6 animate-fadeIn">

        <div className="flex justify-between mb-4">
          <h3 className="font-semibold">Order #{order.id.slice(0, 8)}</h3>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="mb-4 text-sm text-gray-500">
          {new Date(order.createdAt).toLocaleString()}
        </div>

        {/* ITEMS */}
        <div className="space-y-2 mb-4">
          {order.items?.map((item: any) => (
            <div key={item.id} className="flex justify-between">
              <span>{item.productName} × {item.quantity}</span>
              <span>₱{item.price}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-between font-semibold mb-6">
          <span>Total</span>
          <span>₱{Number(order.total).toFixed(2)}</span>
        </div>

        {/* TRACKING */}
        <div className="mb-6">
          <h4 className="font-medium mb-2">Tracking</h4>

          {loading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : tracking.length === 0 ? (
            <p className="text-sm text-gray-500">No tracking updates</p>
          ) : (
            <div className="space-y-3">
              {tracking.map((event: any, i: number) => (
                <div key={i} className="flex gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <div>
                    <p className="text-sm font-medium">{event.description}</p>
                    <p className="text-xs text-gray-500">{event.date}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ACTIONS */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-[var(--border-light)]">
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${order.id}/invoice`}
            target="_blank"
            className="btn-premium flex-1 !p-3.5"
          >
            Download Official Invoice
          </a>

          <button
            onClick={onClose}
            className="btn-outline flex-1 !p-3.5"
          >
            Close Details
          </button>
        </div>

      </div>
    </div>
  )
}