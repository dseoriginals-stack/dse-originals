"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import { Package, DollarSign, ShoppingCart, Users } from "lucide-react"

type Stats = {
  totalOrders: number
  revenue: number
  totalProducts: number
  totalCustomers?: number
}

export default function AdminDashboard() {
  const { user, loading } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    if (!user || user.role !== "admin") return

    async function load() {
      try {
        const data = await api.get<Stats>("/admin/stats")
        setStats(data)
      } catch (err) {
        console.error("Failed to load admin stats", err)
      }
    }

    load()
  }, [user])

  if (loading) {
    return <p className="text-gray-500">Checking authentication...</p>
  }

  if (!user) {
    return <p className="text-gray-500">Not authenticated</p>
  }

  if (user.role !== "admin") {
    return <p className="text-gray-500">Access denied</p>
  }

  if (!stats) {
    return <p className="text-gray-500">Loading dashboard...</p>
  }

  return (
    <div className="p-6 space-y-8 bg-[#f5f7fb] min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-[#1a2a44]">
            Welcome back, {user.name}
          </h1>
          <p className="text-gray-500 text-sm">
            Here's what's happening with your store today
          </p>
        </div>
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-4 gap-6">

        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={<ShoppingCart size={18} />}
        />

        <StatCard
          title="Revenue"
          value={`₱${Number(stats.revenue).toLocaleString()}`}
          icon={<DollarSign size={18} />}
        />

        <StatCard
          title="Products"
          value={stats.totalProducts}
          icon={<Package size={18} />}
        />

        <StatCard
          title="Customers"
          value={stats.totalCustomers || 0}
          icon={<Users size={18} />}
        />

      </div>

      {/* MAIN GRID */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* RECENT ORDERS */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between mb-4">
            <h2 className="font-semibold text-lg">Recent Orders</h2>
            <button className="text-sm text-primary hover:underline">
              View All
            </button>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-500 border-b pb-2">
              <span>Order</span>
              <span>Status</span>
            </div>

            {/* STATIC FOR NOW — CONNECT NEXT */}
            <div className="flex justify-between">
              <span>#1234</span>
              <span className="text-yellow-500">Pending</span>
            </div>

            <div className="flex justify-between">
              <span>#1233</span>
              <span className="text-green-500">Completed</span>
            </div>

          </div>
        </div>

        {/* SIDE PANEL */}
        <div className="space-y-6">

          {/* QUICK ACTIONS */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold mb-4">Quick Actions</h3>

            <div className="space-y-2">
              <button className="w-full text-left p-3 rounded-xl hover:bg-gray-100">
                + Add Product
              </button>
              <button className="w-full text-left p-3 rounded-xl hover:bg-gray-100">
                View Orders
              </button>
              <button className="w-full text-left p-3 rounded-xl hover:bg-gray-100">
                Manage Users
              </button>
            </div>
          </div>

          {/* MINI STATS */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold mb-2">Performance</h3>
            <p className="text-sm text-gray-500">
              Revenue is growing this month 🚀
            </p>
          </div>

        </div>

      </div>

    </div>
  )
}

/* STAT CARD */

function StatCard({ title, value, icon }: any) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition">

      <div className="flex justify-between items-center mb-2">
        <p className="text-sm text-gray-500">{title}</p>
        <div className="text-primary">{icon}</div>
      </div>

      <h3 className="text-2xl font-semibold text-[#1a2a44]">
        {value}
      </h3>

    </div>
  )
}