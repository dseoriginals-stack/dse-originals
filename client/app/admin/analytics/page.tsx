"use client"
export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

import { useEffect, useState } from "react"
import dynamicImport from "next/dynamic"
import { api } from "@/lib/api"

/* =========================
   RECHARTS
========================= */

const LineChart = dynamicImport(() => import("recharts").then(m => m.LineChart), { ssr: false })
const Line = dynamicImport(() => import("recharts").then(m => m.Line), { ssr: false })
const XAxis = dynamicImport(() => import("recharts").then(m => m.XAxis), { ssr: false })
const YAxis = dynamicImport(() => import("recharts").then(m => m.YAxis), { ssr: false })
const Tooltip = dynamicImport(() => import("recharts").then(m => m.Tooltip), { ssr: false })
const ResponsiveContainer = dynamicImport(() => import("recharts").then(m => m.ResponsiveContainer), { ssr: false })
const BarChart = dynamicImport(() => import("recharts").then(m => m.BarChart), { ssr: false })
const Bar = dynamicImport(() => import("recharts").then(m => m.Bar), { ssr: false })

/* =========================
   TYPES
========================= */

type Analytics = {
  revenueChart: { date: string; revenue: number }[]
  orderChart: { date: string; revenue: number }[]
  topProducts: { name: string; sales: number }[]
  recentOrders: { id: string; total: number; status: string }[]
  revenueTotal: number
  ordersTotal: number
  productsTotal: number
}

/* =========================
   COMPONENT
========================= */

export default function AdminAnalytics() {

  const [data, setData] = useState<Analytics | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get<any>("/analytics")

        const formatted: Analytics = {
          revenueChart: (res.sales || []).map((s: any) => ({
            date: s.date,
            revenue: s.total,
          })),

          orderChart: (res.sales || []).map((s: any) => ({
            date: s.date,
            revenue: s.total,
          })),

          topProducts: (res.topProducts || []).map((p: any) => ({
            name: p.productName,
            sales: p._sum?.quantity || 0,
          })),

          recentOrders: [],

          revenueTotal: res.revenue || 0,
          ordersTotal: res.orders || 0,
          productsTotal: res.products || 0,
        }

        setData(formatted)

      } catch (err) {
        console.error(err)
        setError("Failed to load analytics")
      }
    }

    load()
  }, [])

  if (error) return <p className="p-6 text-red-500">{error}</p>
  if (!data) return <p className="p-6">Loading analytics...</p>

  return (
    <div className="space-y-8">

      <h1 className="text-3xl font-semibold">Analytics</h1>

      {/* ================= KPI CARDS ================= */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <div className="bg-white p-5 rounded-xl shadow-sm border">
          <p className="text-gray-500 text-sm">Total Revenue</p>
          <p className="text-2xl font-semibold mt-1">
            ₱{data.revenueTotal.toLocaleString()}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border">
          <p className="text-gray-500 text-sm">Orders</p>
          <p className="text-2xl font-semibold mt-1">
            {data.ordersTotal}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border">
          <p className="text-gray-500 text-sm">Products</p>
          <p className="text-2xl font-semibold mt-1">
            {data.productsTotal}
          </p>
        </div>

      </div>

      {/* ================= CHARTS ================= */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* REVENUE */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="font-semibold mb-4">Revenue</h2>

          {(data.revenueChart?.length ?? 0) === 0 ? (
            <p className="text-gray-500">No revenue data</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.revenueChart}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2d4c7c"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* ORDERS */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="font-semibold mb-4">Orders</h2>

          {(data.orderChart?.length ?? 0) === 0 ? (
            <p className="text-gray-500">No order data</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.orderChart}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#4f7db3" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>

      {/* ================= LOWER SECTION ================= */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* TOP PRODUCTS */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="font-semibold mb-4">Top Products</h2>

          {(data.topProducts?.length ?? 0) === 0 ? (
            <p className="text-gray-500">No products yet</p>
          ) : (
            <ul className="space-y-2">
              {data.topProducts.map((p, i) => (
                <li key={i} className="flex justify-between text-sm">
                  <span>{p.name}</span>
                  <span className="font-medium">{p.sales} sold</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* RECENT ORDERS */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="font-semibold mb-4">Recent Orders</h2>

          <p className="text-gray-500">Coming soon</p>
        </div>

      </div>

    </div>
  )
}