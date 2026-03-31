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
    <div className="min-h-screen bg-[#d7ecff] px-4 py-10 md:px-10">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-4">

            {/* AVATAR */}
            <div className="
              w-12 h-12 rounded-full
              bg-gradient-to-br from-primary to-accent
              text-white flex items-center justify-center
              font-semibold shadow-md
            ">
              {(user?.name?.charAt(0) || user?.email?.charAt(0) || "?").toUpperCase()}
            </div>

            <div>
              <h1 className="text-2xl font-semibold text-primary">
                {user ? `Hi, ${user.name || "User"}` : "Your Account"}
              </h1>
              <p className="text-gray-500 text-sm">
                {user ? user.email : "Login to access your account"}
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
          <div className="bg-white rounded-2xl shadow-lg p-10 text-center">
            <h2 className="text-xl font-semibold mb-2">
              Welcome to DSEoriginals
            </h2>
            <p className="text-gray-500 mb-6">
              Login to manage orders and your profile
            </p>
            <button
              onClick={() => setOpen(true)}
              className="px-6 py-3 rounded-xl bg-primary text-white hover:bg-accent transition"
            >
              Login / Register
            </button>
          </div>
        )}

        {/* DASHBOARD */}
        {user && (
          <div className="grid md:grid-cols-[240px_1fr] gap-6">

            {/* SIDEBAR */}
            <div className="bg-white rounded-2xl shadow-md p-4">
              <SidebarItem icon={<User size={18} />} label="Dashboard" active={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")} />
              <SidebarItem icon={<Package size={18} />} label="Orders" active={activeTab === "orders"} onClick={() => setActiveTab("orders")} />
              <SidebarItem icon={<Heart size={18} />} label="Wishlist" active={activeTab === "wishlist"} onClick={() => setActiveTab("wishlist")} />
              <SidebarItem icon={<Settings size={18} />} label="Account" active={activeTab === "settings"} onClick={() => setActiveTab("settings")} />
            </div>

            {/* CONTENT */}
            <div className="bg-white rounded-2xl shadow-md p-8">

              {/* DASHBOARD */}
              {activeTab === "dashboard" && (
                <div>
                  <h3 className="text-xl font-semibold mb-6">Overview</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <StatCard title="Orders" value={orders.length} />
                    <StatCard title="Wishlist" value="0" />
                    <StatCard title="Lucky Points" value={user.luckyPoints || 0} />
                  </div>
                </div>
              )}

              {/* ORDERS */}
              {activeTab === "orders" && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Order History</h3>

                  {ordersLoading ? (
                    <p className="text-gray-500">Loading orders...</p>
                  ) : orders.length === 0 ? (
                    <EmptyState text="You don’t have any orders yet." />
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="p-4 border rounded-xl flex justify-between items-center hover:shadow-md transition">
                          <div>
                            <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-400 capitalize">{order.status}</p>
                          </div>

                          <div className="text-right">
                            <p className="font-semibold">₱{Number(order.total).toFixed(2)}</p>
                            <button
                              onClick={() => handleViewOrder(order)}
                              className="text-sm text-primary hover:underline"
                            >
                              View Details
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
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm w-full transition ${
        active ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

function StatCard({ title, value }: any) {
  return (
    <div className="p-5 rounded-xl border shadow-sm hover:shadow-md transition">
      <p className="text-gray-500 text-sm">{title}</p>
      <h4 className="text-2xl font-semibold mt-1">{value}</h4>
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
        <div className="flex gap-3">
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${order.id}/invoice`}
            target="_blank"
            className="flex-1 text-center py-2 rounded-xl bg-primary text-white"
          >
            Download Invoice
          </a>

          <button
            onClick={onClose}
            className="flex-1 border rounded-xl py-2"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  )
}