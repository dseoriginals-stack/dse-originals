"use client"
export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import dynamicImport from "next/dynamic"
import { api } from "@/lib/api"

/* =========================
   FIX: DYNAMIC RECHARTS
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

type RevenuePoint = {
  date: string
  revenue: number
}

type ProductStat = {
  name: string
  sales: number
}

type Order = {
  id: string
  total: number
  status: string
}

type Analytics = {
  revenueChart: RevenuePoint[]
  orderChart: RevenuePoint[]
  topProducts: ProductStat[]
  recentOrders: Order[]
}

/* =========================
   COMPONENT
========================= */

export default function AdminAnalytics() {

  const [data, setData] = useState<Analytics | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get<Analytics>("/analytics")
        setData(res)
      } catch (err) {
        console.error("Analytics fetch failed", err)
      }
    }

    load()
  }, [])

  if (!data) {
    return <p>Loading analytics...</p>
  }

  return (
    <div className="space-y-10">

      <h1 className="text-3xl font-bold">
        Analytics
      </h1>

      {/* REVENUE */}

      <div className="bg-white p-6 rounded shadow">

        <h2 className="font-semibold mb-4">
          Revenue
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.revenueChart}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#2563eb"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>

      </div>

      {/* ORDERS */}

      <div className="bg-white p-6 rounded shadow">

        <h2 className="font-semibold mb-4">
          Orders
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.orderChart}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="revenue" fill="#16a34a" />
          </BarChart>
        </ResponsiveContainer>

      </div>

      {/* TOP PRODUCTS */}

      <div className="bg-white p-6 rounded shadow">

        <h2 className="font-semibold mb-4">
          Top Products
        </h2>

        <ul className="space-y-2">
          {data.topProducts.map((p, i) => (
            <li key={i} className="flex justify-between">
              <span>{p.name}</span>
              <span>{p.sales} sold</span>
            </li>
          ))}
        </ul>

      </div>

      {/* RECENT ORDERS */}

      <div className="bg-white p-6 rounded shadow">

        <h2 className="font-semibold mb-4">
          Recent Orders
        </h2>

        <ul className="space-y-2">
          {data.recentOrders.map(order => (
            <li key={order.id} className="flex justify-between">
              <span>#{order.id}</span>
              <span>₱{order.total}</span>
              <span>{order.status}</span>
            </li>
          ))}
        </ul>

      </div>

    </div>
  )
}