"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase-browser"
import { api } from "@/lib/api"

export default function StaffOrders() {
  const [orders, setOrders] = useState<any[]>([])

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    const session = await supabase.auth.getSession()
    const token = session.data.session?.access_token

    const data = await api.get("/orders")
    setOrders(data)
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