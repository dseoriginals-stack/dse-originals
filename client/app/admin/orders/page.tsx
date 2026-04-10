"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState, useMemo } from "react"
import { api } from "@/lib/api"
import { 
  Search, 
  Filter, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Clock, 
  CreditCard,
  FileText,
  ExternalLink,
  ChevronDown,
  User,
  Mail,
  Phone
} from "lucide-react"
import toast from "react-hot-toast"

type OrderItem = {
  id: string
  productName: string
  quantity: number
  price: number
  variantName?: string
}

type Order = {
  id: string
  total: number
  status: string
  trackingNo?: string
  createdAt: string
  user?: {
    name: string
    email: string
  }
  guestEmail?: string
  deliveryMethod: string
  shippingFee: number
  address?: any
  items: OrderItem[]
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({})
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    try {
      setLoading(true)
      const data = await api.get<Order[]>("/admin/orders")
      setOrders(data || [])
    } catch (err) {
      console.error("Failed to load orders", err)
      toast.error("Failed to sync orders")
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      await api.put(`/admin/orders/${id}/status`, {
        status,
        trackingNo: trackingInputs[id] || undefined
      })
      toast.success(`Order marked as ${status}`)
      fetchOrders()
    } catch (err: any) {
      toast.error(err.message || "Status update failed")
    }
  }

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = 
        o.id.toLowerCase().includes(search.toLowerCase()) || 
        o.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
        o.guestEmail?.toLowerCase().includes(search.toLowerCase())
      
      const matchesFilter = filter === "all" || o.status.toLowerCase() === filter.toLowerCase()
      
      return matchesSearch && matchesFilter
    })
  }, [orders, search, filter])

  const isInitialLoading = loading && orders.length === 0

  return (
    <div className="space-y-8 pb-20">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-[1000] text-[var(--text-heading)] tracking-tighter">Order Ledger</h1>
          <p className="text-[var(--text-muted)] text-sm font-bold uppercase tracking-wider mt-1">Full transaction & fulfillment history</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              placeholder="Order ID / Email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 pr-4 py-3 bg-white border border-[var(--border-light)] rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[var(--brand-primary)] focus:outline-none w-64 shadow-sm"
            />
          </div>
          <div className="flex bg-white border border-[var(--border-light)] rounded-2xl p-1 shadow-sm">
            {["all", "paid", "shipped", "delivered"].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  filter === f ? "bg-[var(--brand-primary)] text-white shadow-md" : "text-gray-400 hover:text-[var(--brand-primary)]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-[var(--border-light)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full text-left">
            <thead className="bg-[var(--bg-surface)] border-b border-[var(--border-light)]">
              <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">
                <th className="px-8 py-5">Order Reference</th>
                <th className="px-8 py-5">Customer Profile</th>
                <th className="px-8 py-5">Value</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Fulfillment</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light)]">
              {isInitialLoading ? (
                Array(6).fill(0).map((_, i) => <SkeletonOrderRow key={i} />)
              ) : (
                <>
                  {filteredOrders.map(order => (
                    <OrderRow 
                      key={order.id} 
                      order={order} 
                      expanded={expandedOrder === order.id}
                      onExpand={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                      trackingValue={trackingInputs[order.id] ?? order.trackingNo ?? ""}
                      onTrackingChange={(val) => setTrackingInputs(p => ({ ...p, [order.id]: val }))}
                      onUpdateStatus={updateStatus}
                    />
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-20 text-center text-[var(--text-muted)] italic font-bold">
                        No matching records found
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function OrderRow({ order, expanded, onExpand, trackingValue, onTrackingChange, onUpdateStatus }: any) {
  const statusStyles: any = {
    pending: "bg-amber-50 text-amber-600 border-amber-100",
    accepted: "bg-violet-50 text-violet-600 border-violet-100",
    paid: "bg-emerald-50 text-emerald-600 border-emerald-100",
    processing: "bg-amber-50 text-amber-600 border-amber-100",
    shipped: "bg-blue-50 text-blue-600 border-blue-100",
    delivered: "bg-indigo-50 text-indigo-600 border-indigo-100",
    cancelled: "bg-red-50 text-red-600 border-red-100",
  }

  const generateJT = () => {
    const num = "JT" + Math.random().toString(36).substring(2, 10).toUpperCase()
    onTrackingChange(num)
    toast.success("J&T Tracking Generated: " + num)
  }

  return (
    <>
      <tr className={`group transition-all ${expanded ? 'bg-[var(--brand-soft)]/5' : 'hover:bg-gray-50/50'}`}>
        <td className="px-8 py-6">
          <div className="flex flex-col">
            <span className="font-black text-sm text-[var(--brand-primary)]">#{order.id.slice(0, 8).toUpperCase()}</span>
            <span className="text-[10px] text-[var(--text-muted)] font-bold mt-1 uppercase flex items-center gap-1">
              <Clock size={10} /> {new Date(order.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
          </div>
        </td>
        <td className="px-8 py-6">
          <div className="flex flex-col">
            <span className="font-bold text-sm text-[var(--text-heading)]">{order.user?.name || "Guest Customer"}</span>
            <span className="text-[10px] text-[var(--text-muted)] font-bold mt-1 truncate max-w-[150px]">{order.user?.email || order.guestEmail}</span>
          </div>
        </td>
        <td className="px-8 py-6">
          <div className="flex flex-col">
            <span className="font-black text-sm text-[var(--text-heading)]">₱{Number(order.total).toLocaleString()}</span>
            <span className="text-[9px] text-emerald-600 font-black uppercase tracking-widest mt-1">Fully Paid</span>
          </div>
        </td>
        <td className="px-8 py-6">
          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-inner ${statusStyles[order.status.toLowerCase()] || 'bg-gray-50 text-gray-500'}`}>
            {order.status}
          </span>
        </td>
        <td className="px-8 py-6">
          <div className="relative group/input">
            <Truck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-[var(--brand-primary)]" size={12} />
            <input 
              placeholder="Track No." 
              value={trackingValue}
              onChange={(e) => onTrackingChange(e.target.value)}
              className="pl-8 pr-3 py-2 bg-white border border-[var(--border-light)] rounded-xl text-[10px] font-bold focus:ring-2 focus:ring-[var(--brand-primary)] focus:outline-none w-32 shadow-sm transition-all"
            />
          </div>
        </td>
        <td className="px-8 py-6 text-right">
          <div className="flex items-center justify-end gap-2">
            <button 
              onClick={onExpand}
              className={`p-2 rounded-xl border border-[var(--border-light)] hover:bg-white hover:shadow-md transition-all ${expanded ? 'rotate-180 bg-white' : 'bg-gray-50'}`}
            >
              <ChevronDown size={16} className="text-gray-400" />
            </button>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {order.status === 'pending' && (
                <button 
                  onClick={() => onUpdateStatus(order.id, "accepted")}
                  className="px-3 py-2 bg-violet-50 text-violet-600 hover:bg-violet-600 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-tighter transition shadow-sm"
                >
                  Approve
                </button>
              )}
              {order.status === 'accepted' && (
                <button 
                  onClick={generateJT}
                  className="px-3 py-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-tighter transition shadow-sm"
                >
                  J&T Sync
                </button>
              )}
              <button 
                onClick={() => onUpdateStatus(order.id, "shipped")}
                className="px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-tighter transition shadow-sm"
              >
                Ship
              </button>
              <button 
                onClick={() => onUpdateStatus(order.id, "delivered")}
                className="px-3 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-tighter transition shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </td>
      </tr>
      
      {/* EXPANDED DETAILS */}
      {expanded && (
        <tr className="bg-[var(--brand-soft)]/5">
          <td colSpan={6} className="px-8 py-10">
            <div className="grid md:grid-cols-2 gap-12 animate-fade-in">
              <div className="space-y-6">
                <h4 className="text-xs font-[1000] uppercase tracking-[0.2em] text-[var(--brand-primary)] border-b border-[var(--border-light)] pb-4">Order Composition</h4>
                <div className="space-y-4">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center bg-white p-4 rounded-2xl border border-[var(--border-light)] shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--bg-surface)] flex items-center justify-center text-[var(--brand-primary)] border border-gray-100 font-black text-[10px]">
                          {item.quantity}×
                        </div>
                        <div>
                          <p className="font-bold text-sm text-[var(--text-heading)]">{item.productName}</p>
                          <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase">{item.variantName || "Standard Unit"}</p>
                        </div>
                      </div>
                      <p className="font-black text-sm text-[var(--text-heading)]">₱{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-white p-6 rounded-2xl border border-[var(--border-light)] shadow-sm space-y-2">
                   <div className="flex justify-between text-xs font-bold text-[var(--text-muted)]">
                     <span>Shipping Mode: {order.deliveryMethod === 'pickup' ? 'Store Pickup' : 'J&T Delivery'}</span>
                     <span>₱{order.shippingFee.toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between text-base font-[1000] text-[var(--brand-primary)] pt-2 border-t border-dashed border-gray-100">
                     <span>Final Total</span>
                     <span>₱{order.total.toLocaleString()}</span>
                   </div>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-xs font-[1000] uppercase tracking-[0.2em] text-[var(--brand-primary)] border-b border-[var(--border-light)] pb-4">Logistics & Profile</h4>
                <div className="grid grid-cols-2 gap-4">
                  <DetailBox icon={<User size={14}/>} label="Customer" value={order.user?.name || "Guest Customer"} />
                  <DetailBox icon={<Mail size={14}/>} label="Contact" value={order.user?.email || order.guestEmail} />
                  <DetailBox icon={<Phone size={14}/>} label="Phone" value={order.address?.phone || "N/A"} />
                  <DetailBox icon={<CreditCard size={14}/>} label="Payment Method" value="GCash/Maya (via Xendit)" />
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-[var(--border-light)] shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                    <Truck size={12} /> Delivery Destination
                  </p>
                  <p className="font-bold text-[var(--text-heading)] text-sm leading-relaxed">
                    {order.address?.street}, {order.address?.barangay}<br /> {order.address?.city}, {order.address?.province}<br /> {order.address?.region}
                  </p>
                  <div className="flex gap-3 mt-6">
                    <button className="flex-1 btn-outline !py-3 !px-4 text-[10px] !font-black uppercase tracking-widest flex items-center justify-center gap-2"><FileText size={14} /> View Invoice</button>
                    <button className="flex-1 btn-premium !py-3 !px-4 text-[10px] !font-black uppercase tracking-widest flex items-center justify-center gap-2"><ExternalLink size={14} /> Track Parcel</button>
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

function DetailBox({ icon, label, value }: any) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-[var(--border-light)] shadow-sm">
      <div className="flex items-center gap-2 text-gray-400 mb-1">
        {icon}
        <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <p className="font-bold text-xs text-[var(--text-heading)] truncate">{value}</p>
    </div>
  )
}

function SkeletonOrderRow() {
  return (
    <tr>
      <td colSpan={6} className="px-8 py-6">
        <div className="h-10 bg-gray-50 rounded-xl animate-pulse w-full" />
      </td>
    </tr>
  )
}