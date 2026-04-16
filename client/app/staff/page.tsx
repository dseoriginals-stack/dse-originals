"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"

export default function StaffOrders() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const data = await api.get("/orders/my-orders") // Using my-orders for now
      setOrders(data || [])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {orders.map(order => (
        <div key={order.id} className="bg-white p-4 rounded shadow">
          <p><strong>ID:</strong> {order.id}</p>
          <p>Status: {order.status}</p>
          <p>Total: ₱{order.total}</p>
        </div>
      ))}
    </div>
  )
}