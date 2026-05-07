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
  Phone,
  Trash2,
  X
} from "lucide-react"
import toast from "react-hot-toast"
import { useAuth } from "@/context/AuthContext"

type OrderItem = {
  id: string
  productName: string
  quantity: number
  price: number
  variantName?: string
}

type Order = {
  id: string
  totalAmount: number
  pointsDiscount: number
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

import { useSearchParams } from "next/navigation"

export default function AdminOrders() {
  const searchParams = useSearchParams()
  const initialFilter = searchParams.get("status") || "paid"

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState(initialFilter)
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({})
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    const status = searchParams.get("status")
    if (status) setFilter(status)
  }, [searchParams])

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

  async function cancelOrder(id: string) {
    if (!confirm("Are you sure you want to cancel this order? This will release the reserved stock.")) return
    try {
      await api.put(`/orders/${id}/cancel`)
      toast.success("Order cancelled")
      fetchOrders()
    } catch (err: any) {
      toast.error(err.message || "Cancellation failed")
    }
  }

  async function deleteOrder(id: string) {
    if (!confirm("⚠️ PERMANENT DELETE: Are you sure you want to delete this order entirely from the database? This cannot be undone.")) return
    try {
      await api.delete(`/admin/orders/${id}`)
      toast.success("Order deleted permanently")
      fetchOrders()
    } catch (err: any) {
      toast.error(err.message || "Delete failed")
    }
  }

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = 
        o.id.toLowerCase().includes(search.toLowerCase()) || 
        o.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
        o.guestEmail?.toLowerCase().includes(search.toLowerCase())
      
      const orderStatus = o.status.toLowerCase()
      const matchesFilter = filter === "all" || orderStatus === filter.toLowerCase()
      
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
            {["all", "pending", "paid", "shipped", "delivered", "cancelled"].map(f => (
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
                      onOpen={() => setSelectedOrder(order)}
                      trackingValue={trackingInputs[order.id] ?? order.trackingNo ?? ""}
                      onTrackingChange={(val: string) => setTrackingInputs(p => ({ ...p, [order.id]: val }))}
                      onUpdateStatus={updateStatus}
                      onCancel={cancelOrder}
                      onDelete={deleteOrder}
                      canDelete={isAdmin}
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

      {selectedOrder && (
        <OrderModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
          onUpdateStatus={(status: string) => {
            updateStatus(selectedOrder.id, status)
            setSelectedOrder(null)
          }} 
        />
      )}
    </div>
  )
}

function OrderRow({ order, onOpen, trackingValue, onTrackingChange, onUpdateStatus, onCancel, onDelete, canDelete }: any) {
  const statusStyles: any = {
    pending: "bg-amber-50 text-amber-600 border-amber-100",
    initialized: "bg-gray-50 text-gray-400 border-gray-200",
    accepted: "bg-violet-50 text-violet-600 border-violet-100",
    paid: "bg-emerald-50 text-emerald-600 border-emerald-100",
    processing: "bg-amber-50 text-amber-600 border-amber-100",
    shipped: "bg-blue-50 text-blue-600 border-blue-100",
    delivered: "bg-indigo-50 text-indigo-600 border-indigo-100",
    cancelled: "bg-red-50 text-red-600 border-red-100",
  }

  const generateJT = (e: any) => {
    e.stopPropagation()
    const num = "JT" + Math.random().toString(36).substring(2, 10).toUpperCase()
    onTrackingChange(num)
    toast.success("J&T Tracking Generated: " + num)
  }

  return (
    <tr 
      onClick={onOpen}
      className="group hover:bg-gray-50/50 transition-all cursor-pointer border-b border-[var(--border-light)]"
    >
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
          <span className="font-bold text-sm text-[var(--text-heading)]">{order.user?.name || order.guestName || "Guest Customer"}</span>
          <span className="text-[10px] text-[var(--text-muted)] font-bold mt-1 truncate max-w-[150px]">{order.user?.email || order.guestEmail}</span>
        </div>
      </td>
      <td className="px-8 py-6">
        <div className="flex flex-col">
          <span className="font-black text-sm text-[var(--text-heading)]">₱{Number(order.totalAmount).toLocaleString()}</span>
          <span className={`text-[9px] font-black uppercase tracking-widest mt-1 ${
            order.status.toLowerCase() === 'paid' ? 'text-emerald-600' : 'text-amber-500'
          }`}>
            {order.status.toLowerCase() === 'paid' ? 'Fully Paid' : 'Awaiting Payment'}
          </span>
        </div>
      </td>
      <td className="px-8 py-6">
        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-inner ${statusStyles[order.status.toLowerCase()] || 'bg-gray-50 text-gray-500'}`}>
          {order.status}
        </span>
      </td>
      <td className="px-8 py-6">
        <div className="relative group/input" onClick={e => e.stopPropagation()}>
          <Truck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-[var(--brand-primary)]" size={12} />
          <input 
            placeholder="Track No." 
            value={trackingValue}
            onChange={(e) => onTrackingChange(e.target.value)}
            className="pl-8 pr-3 py-2 bg-white border border-[var(--border-light)] rounded-xl text-[10px] font-bold focus:ring-2 focus:ring-[var(--brand-primary)] focus:outline-none w-32 shadow-sm transition-all"
          />
        </div>
      </td>
      <td className="px-8 py-6 text-right" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-2">
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
            {['pending', 'paid', 'accepted'].includes(order.status.toLowerCase()) && (
              <button 
                onClick={() => onCancel(order.id)}
                className="px-3 py-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-tighter transition shadow-sm"
              >
                Cancel
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
            {canDelete && (
              <button 
                onClick={() => onDelete(order.id)}
                className="p-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition shadow-sm ml-2"
                title="Permanent Delete"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
          <div className="p-2 bg-gray-50 rounded-xl border border-[var(--border-light)] text-[10px] font-black uppercase text-gray-400">
            Details
          </div>
        </div>
      </td>
    </tr>
  )
}

function OrderModal({ order, onClose, onUpdateStatus }: any) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        {/* HEADER */}
        <div className="px-8 py-6 bg-[var(--bg-surface)] border-b border-[var(--border-light)] flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-[1000] text-[var(--text-heading)] tracking-tighter">Order #{order.id.slice(0,8).toUpperCase()}</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--brand-primary)] bg-[var(--brand-soft)] px-3 py-1 rounded-full">
                {order.status}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">
                {new Date(order.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 bg-white border border-[var(--border-light)] rounded-2xl text-gray-400 hover:text-[var(--text-heading)] hover:shadow-md transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="grid md:grid-cols-2 gap-12">
            {/* LEFT: COMPOSITION */}
            <div className="space-y-8">
              <section>
                <h4 className="text-xs font-[1000] uppercase tracking-[0.2em] text-[var(--brand-primary)] mb-6">Order Composition</h4>
                <div className="space-y-4">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--border-light)]">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[var(--brand-primary)] border border-gray-100 font-black text-xs shadow-sm">
                          {item.quantity}×
                        </div>
                        <div>
                          <p className="font-bold text-base text-[var(--text-heading)]">{item.productName}</p>
                          <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest">{item.variantName || "Standard Unit"}</p>
                        </div>
                      </div>
                      <p className="font-black text-base text-[var(--text-heading)]">₱{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </section>

              <div className="bg-[var(--brand-primary)] p-8 rounded-3xl text-white shadow-xl shadow-[var(--brand-primary)]/20">
                <div className="flex justify-between text-xs font-bold opacity-80 uppercase tracking-widest mb-2">
                  <span>Subtotal + Shipping</span>
                  <span>₱{order.shippingFee.toLocaleString()} Fee</span>
                </div>
                {order.pointsDiscount > 0 && (
                  <div className="flex justify-between text-xs font-bold opacity-80 uppercase tracking-widest mb-2 text-emerald-200">
                    <span>Points Discount</span>
                    <span>-₱{order.pointsDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-end pt-4 mt-2 border-t border-white/20">
                  <span className="text-sm font-black uppercase tracking-[0.2em]">Final Total</span>
                  <span className="text-3xl font-[1000]">₱{order.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* RIGHT: LOGISTICS */}
            <div className="space-y-8">
              <section>
                <h4 className="text-xs font-[1000] uppercase tracking-[0.2em] text-[var(--brand-primary)] mb-6">Customer Profile</h4>
                <div className="grid grid-cols-2 gap-4">
                  <DetailBox icon={<User size={14}/>} label="Full Name" value={order.user?.name || "Guest Customer"} />
                  <DetailBox icon={<Mail size={14}/>} label="Email Address" value={order.user?.email || order.guestEmail} />
                  <DetailBox icon={<Phone size={14}/>} label="Mobile Number" value={order.address?.phone || "N/A"} />
                  <DetailBox icon={<CreditCard size={14}/>} label="Payment" value="Online Transaction" />
                </div>
              </section>

              <section className="bg-[var(--bg-surface)] p-8 rounded-3xl border border-[var(--border-light)]">
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)] mb-4 flex items-center gap-2">
                  <Truck size={14} /> Shipping Information
                </p>
                <p className="font-bold text-[var(--text-heading)] text-base leading-relaxed mb-6">
                  {order.address?.street}, {order.address?.barangay}<br /> 
                  {order.address?.city}, {order.address?.province}<br /> 
                  {order.address?.region}
                </p>
                <div className="flex gap-3">
                  <button className="flex-1 bg-white border border-[var(--border-light)] py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:shadow-md transition-all"><FileText size={16} /> Invoice</button>
                  <button className="flex-1 bg-white border border-[var(--border-light)] py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:shadow-md transition-all"><ExternalLink size={16} /> Tracking</button>
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="px-8 py-6 bg-[var(--bg-surface)] border-t border-[var(--border-light)] flex items-center justify-end gap-3">
           <button 
             onClick={onClose}
             className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-heading)] transition-all"
           >
             Close Window
           </button>
           <button 
             onClick={() => onUpdateStatus("shipped")}
             className="px-8 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:scale-105 transition-all active:scale-95"
           >
             Mark as Shipped
           </button>
           <button 
             onClick={() => onUpdateStatus("delivered")}
             className="px-8 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 hover:scale-105 transition-all active:scale-95"
           >
             Mark as Delivered
           </button>
        </div>
      </div>
    </div>
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