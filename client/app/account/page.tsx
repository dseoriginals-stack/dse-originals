"use client"

import { useState, useEffect } from "react"
import { 
  User, 
  Package, 
  Heart, 
  Settings, 
  LogOut, 
  ChevronRight, 
  TrendingUp, 
  CreditCard, 
  Truck,
  Clock,
  ArrowRight
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/lib/api"
import Link from "next/link"

export default function AccountPage() {
  const { user, loading, logout } = useAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedOrder, setSelectedOrder] = useState<any>(null)

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  async function fetchOrders() {
    try {
      setLoadingOrders(true)
      const data = await api.get("/orders/my-orders") 
      setOrders(data || [])
    } catch (err) {
      console.error("Failed to load orders")
    } finally {
      setLoadingOrders(false)
    }
  }

  if (loading) return <div className="h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin"/></div>

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex flex-col items-center justify-center p-6">
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-[var(--border-light)] text-center max-w-lg w-full">
           <div className="w-20 h-20 bg-[var(--bg-surface)] rounded-3xl flex items-center justify-center text-[var(--brand-primary)] mx-auto mb-6">
             <User size={40} />
           </div>
           <h1 className="text-3xl font-[1000] text-[var(--text-heading)] mb-4 tracking-tighter">Your DSE Journey</h1>
           <p className="text-[var(--text-muted)] font-bold mb-10 leading-relaxed">Sign in to unlock your order history, manage your shipments, and track your lucky points.</p>
           <Link href="/login" className="btn-premium flex items-center justify-center !py-4 !px-10 shadow-xl w-full text-sm font-black uppercase tracking-widest">
             Sign In to Dashboard
           </Link>
           <div className="mt-6 flex flex-col gap-3">
              <Link href="/register" className="text-xs font-black uppercase text-[var(--brand-primary)] tracking-widest hover:underline">
                Create new account
              </Link>
              <div className="h-px bg-gray-100 w-1/2 mx-auto my-2" />
              <Link href="/track" className="text-xs font-bold text-[var(--text-muted)] hover:text-[var(--brand-primary)] flex items-center justify-center gap-1 transition">
                 <Package size={14} /> Track Guest Order
              </Link>
           </div>
        </div>
      </div>
    )
  }

  const luckyPoints = user.luckyPoints || 0
  const totalSpent = orders.reduce((acc, o) => acc + Number(o.total || 0), 0)

  return (
    <div className="min-h-screen bg-[var(--bg-main)] pb-20">
      
      {/* HERO SECTION */}
      <div className="bg-[var(--brand-primary)] pt-20 pb-40 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] bg-white p-1 shadow-2xl border-4 border-white/20">
               <div className="w-full h-full rounded-[1.8rem] bg-gradient-to-tr from-gray-100 to-white flex items-center justify-center text-[var(--brand-primary)] text-4xl font-[1000]">
                  {user.name?.charAt(0) || user.email?.charAt(0)}
               </div>
            </div>
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3">
                <h1 className="text-4xl md:text-5xl font-[1000] text-white tracking-tighter">Hello, {user.name?.split(' ')[0]}</h1>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase text-white tracking-widest border border-white/10">Member</span>
              </div>
              <p className="text-white/70 font-bold mt-2 text-sm md:text-base">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 -mt-24 relative z-20">
        <div className="grid lg:grid-cols-[1fr_350px] gap-8">
          
          <div className="space-y-8">
            {/* TABS NAVIGATION */}
            <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-full p-2 flex gap-1 shadow-sm overflow-x-auto no-scrollbar">
              {[
                { id: 'overview', label: 'Dashboard', icon: <TrendingUp size={16}/> },
                { id: 'orders', label: 'My Orders', icon: <Package size={16}/> },
                { id: 'settings', label: 'Profile Settings', icon: <Settings size={16}/> }
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs font-[1000] uppercase tracking-widest transition-all whitespace-nowrap ${
                    activeTab === tab.id ? 'bg-[var(--brand-primary)] text-white shadow-lg' : 'text-gray-400 hover:text-[var(--brand-primary)]'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* CONTENT VIEWS */}
            <div className="bg-white rounded-[2.5rem] border border-[var(--border-light)] shadow-sm p-8 md:p-12 min-h-[500px]">
               {activeTab === 'overview' && (
                 <div className="animate-fade-in space-y-12">
                   <div className="grid md:grid-cols-3 gap-6">
                      <ProfileStat label="Total Expenditures" value={`₱${totalSpent.toLocaleString()}`} icon={<CreditCard size={20}/>} color="bg-blue-50 text-blue-500" />
                      <ProfileStat label="Lucky Points" value={luckyPoints} icon={<Heart size={20}/>} color="bg-rose-50 text-rose-500" />
                      <ProfileStat label="Active Shipments" value={orders.filter(o => o.status === 'shipped').length} icon={<Truck size={20}/>} color="bg-emerald-50 text-emerald-500" />
                   </div>

                   <div>
                      <h3 className="text-xl font-black text-[var(--text-heading)] mb-6">Recent Activity</h3>
                      {orders.length === 0 ? (
                        <div className="p-10 bg-[var(--bg-surface)] rounded-[2rem] text-center italic text-gray-400 font-bold text-sm">No recent transactions found</div>
                      ) : (
                        <div className="space-y-4">
                           {orders.slice(0, 3).map(o => (
                             <OrderSummaryCard key={o.id} order={o} onClick={() => { setSelectedOrder(o); setActiveTab('orders'); }} />
                           ))}
                        </div>
                      )}
                   </div>
                 </div>
               )}

               {activeTab === 'orders' && (
                 <div className="animate-fade-in">
                   <h3 className="text-2xl font-[1000] text-[var(--text-heading)] mb-8 tracking-tighter">Order History</h3>
                   {loadingOrders ? (
                     <div className="space-y-4">{Array(3).fill(0).map((_,i) => <div key={i} className="h-24 bg-gray-50 rounded-2xl animate-pulse" />)}</div>
                   ) : orders.length === 0 ? (
                     <div className="text-center py-20">
                        <Package size={48} className="mx-auto text-gray-100 mb-4" />
                        <p className="text-gray-400 font-bold italic">Your closet is currently empty. Start shopping now!</p>
                     </div>
                   ) : (
                     <div className="space-y-6">
                        {orders.map(o => (
                           <OrderDetailedCard key={o.id} order={o} isSelected={selectedOrder?.id === o.id} onSelect={() => setSelectedOrder(o)} />
                        ))}
                     </div>
                   )}
                 </div>
               )}

               {activeTab === 'settings' && (
                 <div className="animate-fade-in max-w-xl">
                   <h3 className="text-2xl font-[1000] text-[var(--text-heading)] mb-8 tracking-tighter">Profile Integrity</h3>
                   <div className="space-y-8">
                      <div className="grid gap-6">
                        <SettingsInput label="Full Full Name" value={user.name} disabled />
                        <SettingsInput label="Email Verified Account" value={user.email} disabled />
                        <SettingsInput label="Phone Connection" value={user.phone || "Not linked"} disabled />
                      </div>
                      <div className="pt-6 border-t border-gray-100">
                         <p className="text-xs font-bold text-gray-400 mb-6 leading-relaxed uppercase tracking-widest text-center">To update your secure profile information, please contact our support desk for identity verification.</p>
                         <button onClick={logout} className="w-full py-4 rounded-2xl bg-red-50 text-red-500 font-black uppercase text-xs tracking-widest hover:bg-red-500 hover:text-white transition shadow-sm border border-red-100">Sign Out of Session</button>
                      </div>
                   </div>
                 </div>
               )}
            </div>
          </div>

          {/* SIDEBAR WIDGETS */}
          <div className="space-y-8">
            {/* TRACKING WIDGET */}
            {selectedOrder ? (
              <div className="bg-white rounded-[2.5rem] border border-[var(--border-light)] p-8 shadow-sm animate-fade-in animate-slide-up">
                 <div className="flex justify-between items-start mb-6">
                   <div>
                     <h4 className="text-sm font-black text-[var(--text-heading)] uppercase tracking-widest">Tracking Info</h4>
                     <p className="text-[10px] font-black text-[var(--brand-primary)] mt-1">ORDER #{selectedOrder.id.slice(0,8).toUpperCase()}</p>
                   </div>
                   <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-full transition"><X size={14}/></button>
                 </div>

                 <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-[var(--bg-surface)] rounded-2xl border border-gray-100">
                       <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[var(--brand-primary)] shadow-sm"><Truck size={20}/></div>
                       <div>
                         <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Status</p>
                         <p className="text-xs font-black text-[var(--text-heading)] uppercase">{selectedOrder.status} Flow</p>
                       </div>
                    </div>

                    {selectedOrder.trackingNo && (
                      <div className="space-y-4">
                         <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                            <p className="text-[10px] font-black uppercase text-red-400 tracking-widest mb-1">J&T Waybill ID</p>
                            <p className="text-sm font-black text-red-600">{selectedOrder.trackingNo}</p>
                         </div>
                         <a 
                           href={`https://www.jtexpress.ph/index/query/gzquery.html?bills=${selectedOrder.trackingNo}`} 
                           target="_blank"
                           className="w-full py-4 rounded-2xl bg-[var(--brand-primary)] text-white font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 shadow-lg hover:bg-[var(--brand-accent)] transition"
                         >
                           Open J&T Tracking <ArrowRight size={14}/>
                         </a>
                      </div>
                    )}

                    {!selectedOrder.trackingNo && (
                      <div className="p-6 bg-gray-50 rounded-2xl text-center border border-dashed border-gray-200">
                         <Clock size={20} className="mx-auto text-gray-300 mb-2" />
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Awaiting Logistics Sync</p>
                         <p className="text-[9px] text-gray-400 mt-1 font-bold">Waybill will generate once the order is accepted by the warehouse.</p>
                      </div>
                    )}
                 </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-accent)] rounded-[2.5rem] p-10 text-white shadow-xl">
                 <h4 className="text-xl font-[1000] mb-4 leading-tight">Elite Customer Loyalty</h4>
                 <p className="text-white/70 text-sm font-bold leading-relaxed mb-10">Every peso spent brings you closer to exclusive maritime rewards and seasonal discounts.</p>
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center"><Heart size={24}/></div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Balance</p>
                      <p className="text-2xl font-[1000] text-white">{luckyPoints} Pts</p>
                    </div>
                 </div>
              </div>
            )}

            <div className="bg-white rounded-[2.5rem] border border-[var(--border-light)] p-8 shadow-sm">
                <h4 className="text-sm font-black text-[var(--text-heading)] uppercase tracking-widest mb-6 border-b border-gray-50 pb-4">Internal Support</h4>
                <div className="space-y-4">
                  <SupportLink label="Logistics Inquiries" />
                  <SupportLink label="Payment Verification" />
                  <SupportLink label="Data Privacy Policy" />
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProfileStat({ label, value, icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition ${color}`}>
        {icon}
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">{label}</p>
      <h3 className="text-xl font-[1000] text-[var(--text-heading)]">{value}</h3>
    </div>
  )
}

function OrderSummaryCard({ order, onClick }: any) {
  return (
    <div onClick={onClick} className="flex items-center justify-between p-5 bg-[var(--bg-surface)] hover:bg-white border border-transparent hover:border-gray-100 rounded-2xl transition cursor-pointer group">
       <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-white border border-gray-50 flex items-center justify-center text-[var(--brand-primary)] shadow-sm font-black text-[10px]">
            {order.status.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-xs font-black text-[var(--text-heading)]">Reference #{order.id.slice(0,8).toUpperCase()}</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
       </div>
       <div className="text-right">
          <p className="text-xs font-black text-[var(--brand-primary)]">₱{Number(order.total).toLocaleString()}</p>
          <div className="flex items-center justify-end gap-1 mt-0.5">
             <div className="w-1 h-1 rounded-full bg-emerald-500" />
             <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">{order.status}</span>
          </div>
       </div>
    </div>
  )
}

function OrderDetailedCard({ order, isSelected, onSelect }: any) {
  const statusColors: any = {
    pending: 'bg-amber-100 text-amber-600',
    accepted: 'bg-violet-100 text-violet-600',
    shipped: 'bg-blue-100 text-blue-600',
    delivered: 'bg-emerald-100 text-emerald-600'
  }

  return (
    <div className={`p-6 rounded-[2rem] border transition-all ${isSelected ? 'bg-white border-[var(--brand-primary)] shadow-xl ring-4 ring-[var(--brand-primary)]/5' : 'bg-white border-gray-100 hover:border-gray-300'}`}>
       <div className="flex flex-col md:flex-row justify-between gap-6">
          <div className="flex-1">
             <div className="flex items-center gap-3 mb-4">
                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${statusColors[order.status] || 'bg-gray-100 text-gray-500'}`}>
                  {order.status}
                </span>
                <span className="text-[10px] font-bold text-gray-400">Placed on {new Date(order.createdAt).toLocaleString()}</span>
             </div>
             <h4 className="text-lg font-black text-[var(--text-heading)] mb-2">Order Reference: {order.id.toUpperCase()}</h4>
             <div className="flex items-center gap-2 mt-4">
                <div className="flex -space-x-2">
                   <div className="w-8 h-8 rounded-full bg-gray-50 border-2 border-white flex items-center justify-center text-[10px] font-black text-gray-400">{order.items?.length || 0}</div>
                </div>
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Products in parcel</span>
             </div>
          </div>
          <div className="flex flex-col items-start md:items-end justify-between">
             <div className="text-left md:text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Value</p>
                <p className="text-2xl font-[1000] text-[var(--brand-primary)] tracking-tighter">₱{Number(order.total).toLocaleString()}</p>
             </div>
             <button 
               onClick={onSelect}
               className={`mt-6 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isSelected ? 'bg-[var(--brand-primary)] text-white shadow-lg' : 'bg-gray-50 text-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-white'}`}
             >
                {isSelected ? 'Viewing Flow' : 'Trace Shipment'}
             </button>
          </div>
       </div>
    </div>
  )
}

function SettingsInput({ label, value, disabled }: any) {
  return (
    <div className="space-y-2">
       <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{label}</label>
       <div className={`px-5 py-4 rounded-xl border text-sm font-bold ${disabled ? 'bg-gray-50 border-gray-100 text-gray-500' : 'bg-white border-gray-200 text-[var(--text-heading)]'}`}>
         {value}
       </div>
    </div>
  )
}

function SupportLink({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between text-xs font-bold text-[var(--text-muted)] hover:text-[var(--brand-primary)] cursor-pointer group py-1">
      <span>{label}</span>
      <ChevronRight size={14} className="text-gray-200 group-hover:text-[var(--brand-primary)] transition" />
    </div>
  )
}

function X({ size }: { size: number }) { return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> }