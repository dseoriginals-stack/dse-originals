"use client"

import { useState } from "react"
import { useCart } from "@/context/CartContext"
import { useAuth } from "@/context/AuthContext"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  Minus,
  Plus,
  Trash2,
  Check,
  ChevronRight,
  ArrowLeft,
  ShoppingBag,
  ShieldCheck,
  Truck,
  Star,
  Gift,
  Coins
} from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"
import { getImageUrl } from "@/lib/image"

const FREE_SHIPPING_THRESHOLD = 3000

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    selectedItems,
    toggleSelection,
    toggleAllSelection,
    selectedSubtotal,
    selectedCount
  } = useCart()

  const { user } = useAuth() as any
  const points = user?.luckyPoints || 0
  const REWARD_THRESHOLD = 50
  const canRedeem = points >= REWARD_THRESHOLD
  
  // Logic: 1 point = ₱1.00 discount
  const [usePoints, setUsePoints] = useState(false)
  const pointsDiscount = usePoints ? Math.min(points, selectedSubtotal) : 0
  const finalTotal = selectedSubtotal - pointsDiscount

  const isAllSelected = cart.length > 0 && selectedItems.length === cart.length
  const hasSelection = selectedItems.length > 0

  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-[var(--bg-surface)] rounded-full flex items-center justify-center mb-6 text-[var(--brand-soft)]">
          <ShoppingBag size={48} />
        </div>
        <h1 className="text-2xl font-black text-[var(--text-heading)]">Your cart is empty</h1>
        <p className="text-[var(--text-muted)] mt-2 max-w-sm">Explore our collection and find something beautiful to add to your cart.</p>
        <Link
          href="/products"
          className="mt-8 bg-[var(--brand-primary)] text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-[var(--brand-primary)]/10 hover:brightness-110 transition-all"
        >
          Start Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-[var(--bg-main)] min-h-screen pb-32">
      {/* HEADER BAR (DESKTOP) */}
      <div className="bg-[var(--bg-card)] border-b border-[var(--border-light)] sticky top-0 z-30">
        <div className="container max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <h1 className="text-2xl font-black text-[var(--text-heading)] flex items-center gap-3">
            Shopping Cart
            <span className="text-xs font-bold bg-[var(--brand-soft)]/20 px-3 py-1 rounded-full text-[var(--brand-primary)]">{cart.length} items</span>
          </h1>
          <Link href="/products" className="hidden md:flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--brand-primary)] transition-colors uppercase tracking-widest">
            <ArrowLeft size={16} /> Continue Shopping
          </Link>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-10">

          {/* LEFT: ITEMS LIST */}
          <div className="lg:col-span-2 space-y-4">

            {/* LOYALTY POINTS DASHBOARD */}
            <div className="bg-[var(--brand-primary)] rounded-[2.5rem] p-6 text-white shadow-2xl shadow-[var(--brand-primary)]/20 relative overflow-hidden mb-8 group">
               {/* Background Glow */}
               <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-white/10 transition-colors duration-700"></div>

               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                  <div className="flex items-center gap-5">
                     <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
                        <Coins className="w-8 h-8 text-[var(--brand-soft)] animate-pulse" />
                     </div>
                     <div>
                        <h2 className="text-xl font-black tracking-tight">{!user ? "Join the Circle" : canRedeem ? "Reward Unlocked" : "Lucky Points"}</h2>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
                          {!user 
                            ? "Register to start earning Lucky Points" 
                            : canRedeem 
                              ? `You have ${points.toLocaleString()} points ready to use!` 
                              : `${points.toLocaleString()} / 50 points earned so far`}
                        </p>
                     </div>
                  </div>

                  {!user ? (
                    <Link 
                      href="/login?redirect=/cart"
                      className="px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-[var(--brand-soft)] text-[var(--brand-primary)] hover:bg-white transition-all shadow-lg hover:scale-105"
                    >
                      Login to Earn
                    </Link>
                  ) : canRedeem ? (
                    <button 
                      onClick={() => setUsePoints(!usePoints)}
                      className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-500 shadow-lg ${
                        usePoints 
                        ? "bg-white text-[var(--brand-primary)] shadow-white/20 scale-[0.98]" 
                        : "bg-[var(--brand-soft)] text-[var(--brand-primary)] hover:bg-white hover:scale-105"
                      }`}
                    >
                      {usePoints ? "Reward Applied" : "Redeem ₱" + points.toLocaleString()}
                    </button>
                  ) : (
                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 px-6 py-4 rounded-2xl text-center">
                       <p className="text-[9px] font-black uppercase tracking-widest opacity-80 mb-2">Reach 50 to unlock</p>
                       <div className="h-1.5 w-32 bg-white/20 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(points/50)*100}%` }}
                            className="h-full bg-[var(--brand-soft)] shadow-[0_0_10px_#A9D6E5]"
                          />
                       </div>
                    </div>
                  )}
               </div>

               <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4 border-t border-white/10 pt-6">
                  <div className="space-y-1">
                     <p className="text-[8px] font-black uppercase tracking-widest opacity-50">Points Value</p>
                     <p className="text-sm font-black text-[var(--brand-soft)]">{!user ? "Exclusive" : `₱${points.toLocaleString()}.00`}</p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[8px] font-black uppercase tracking-widest opacity-50">Points in Use</p>
                     <p className="text-sm font-black text-emerald-400">-{usePoints ? `₱${pointsDiscount.toLocaleString()}` : "₱0"}</p>
                  </div>
                  <div className="space-y-1 hidden md:block">
                     <p className="text-[8px] font-black uppercase tracking-widest opacity-50">Tier Status</p>
                     <p className="text-sm font-black text-white">{!user ? "Member Only" : `${user?.tier || "Faith"} Member`}</p>
                  </div>
               </div>
            </div>

            {/* SELECT ALL */}
            <div className="bg-[var(--bg-card)] rounded-2xl px-6 py-4 border border-[var(--border-light)] shadow-sm flex items-center justify-between">
              <button
                onClick={toggleAllSelection}
                className="flex items-center gap-3 group"
              >
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isAllSelected ? "bg-[var(--brand-primary)] border-[var(--brand-primary)] shadow-md shadow-[var(--brand-primary)]/20" : "bg-white border-gray-200 group-hover:border-[var(--brand-soft)]"
                  }`}>
                  {isAllSelected && <Check size={16} className="text-white font-black" />}
                </div>
                <span className="text-sm font-black text-[var(--text-main)] uppercase tracking-widest leading-none">Select all ({cart.length})</span>
              </button>

              {hasSelection && (
                <button className="flex items-center gap-2 text-xs font-black text-[var(--brand-soft)] hover:text-red-500 transition-colors uppercase tracking-widest">
                  <Trash2 size={14} /> Remove Selected
                </button>
              )}
            </div>

            {/* PRODUCT CARDS */}
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.variantId}
                  onClick={() => toggleSelection(item.variantId)}
                  className={`bg-[var(--bg-card)] cursor-pointer rounded-[2rem] p-5 flex flex-col md:flex-row gap-6 border-2 transition-all relative group ${selectedItems.includes(item.variantId) ? 'border-[var(--brand-primary)] shadow-xl shadow-[var(--brand-primary)]/5' : 'border-transparent hover:border-[var(--border-light)] shadow-sm'
                    }`}
                >
                  <div className="flex gap-4 md:gap-6 flex-1">
                    {/* CHECKBOX */}
                    <div className="flex items-center">
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${selectedItems.includes(item.variantId) ? "bg-[var(--brand-primary)] border-[var(--brand-primary)] shadow-md shadow-[var(--brand-primary)]/10" : "bg-[var(--bg-surface)] border-gray-200"
                        }`}>
                        {selectedItems.includes(item.variantId) && <Check size={16} className="text-white font-black" />}
                      </div>
                    </div>

                    {/* IMAGE */}
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl overflow-hidden bg-[var(--bg-surface)] border border-[var(--border-light)] shadow-inner flex-shrink-0 relative">
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>

                    {/* INFO */}
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <h3 className="text-base md:text-xl font-black text-[var(--text-heading)] line-clamp-1 leading-tight">{item.name}</h3>
                        <p className="text-[10px] md:text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1">Authentic / Edition</p>

                        <div className="mt-3 flex items-center gap-3">
                          <span className="text-lg md:text-2xl font-black text-[var(--brand-primary)]">₱{item.price.toLocaleString()}</span>
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">In Stock</span>
                        </div>
                      </div>

                      <div className="hidden md:flex items-center gap-6 mt-4">
                        <button
                          onClick={(e) => { e.stopPropagation(); removeFromCart(item.variantId) }}
                          className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-red-500 transition-colors"
                        >
                          Remove Item
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* CONTROLS (RIGHT) */}
                  <div className="relative z-10 flex items-center justify-between md:flex-col md:justify-center md:items-end gap-4 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-8 border-[var(--border-light)]">
                    <div className="flex items-center bg-[var(--bg-surface)] border-2 border-[var(--border-light)] rounded-full p-1 shadow-inner md:scale-110">
                      <button
                        onClick={(e) => { e.stopPropagation(); updateQuantity(item.variantId, item.quantity - 1) }}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-[var(--border-light)] shadow-sm text-[var(--text-muted)] hover:text-red-500 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 text-center text-sm font-black text-[var(--text-heading)]">{item.quantity}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); updateQuantity(item.variantId, item.quantity + 1) }}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-[var(--border-light)] shadow-sm text-[var(--text-muted)] hover:bg-[var(--brand-primary)] hover:text-white transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Item Total</span>
                      <span className="text-lg font-black text-[var(--text-heading)]">₱{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: SUMMARY CARD */}
          <div className="relative">
            <div className="lg:sticky lg:top-24 space-y-6">
              <div className="bg-[var(--bg-card)] rounded-[2.5rem] p-8 border border-[var(--border-light)] shadow-xl shadow-[var(--brand-primary)]/5 overflow-hidden relative">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--bg-main)] rounded-full -mr-16 -mt-16 flex items-center justify-center pt-8 pr-8">
                  <ShoppingBag className="w-12 h-12 text-[var(--brand-soft)]/20" />
                </div>

                <h2 className="text-2xl font-black text-[var(--text-heading)] mb-8">Summary</h2>

                <div className="space-y-6">
                  <div className="flex justify-between items-center group">
                    <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest group-hover:text-[var(--brand-accent)] transition-colors">Subtotal ({selectedCount} items)</span>
                    <span className="text-lg font-black text-[var(--text-heading)] font-mono">₱{selectedSubtotal.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center group">
                    <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest group-hover:text-[var(--brand-accent)] transition-colors">Voucher / Discount</span>
                    <span className="text-xs font-bold text-emerald-500 italic">No Voucher Active</span>
                  </div>

                  {usePoints && (
                    <div className="flex justify-between items-center py-2 px-3 bg-emerald-50 rounded-xl border border-emerald-100">
                      <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest flex items-center gap-1">
                        <Gift size={12} /> Points Reward
                      </span>
                      <span className="text-sm font-black text-emerald-700">-₱{pointsDiscount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="pt-6 border-t border-dashed border-[var(--border-light)]">
                    <div className="flex justify-between items-end">
                      <div>
                        <span className="text-[10px] font-black text-[var(--text-heading)] uppercase tracking-[0.2em]">Estimated Total</span>
                        <div className="h-1 w-8 bg-[var(--brand-accent)] rounded-full mt-1"></div>
                      </div>
                      <span className="text-3xl font-black text-[var(--brand-primary)]">₱{finalTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <Link
                  href={hasSelection ? "/checkout" : "#"}
                  onClick={(e) => {
                    if (!hasSelection) {
                      e.preventDefault()
                      toast.error("Please select items to proceed")
                    }
                  }}
                  className={`mt-10 w-full group flex items-center justify-center gap-3 py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest transition-all duration-300 ${hasSelection
                    ? "bg-[var(--brand-primary)] text-white shadow-2xl shadow-[var(--brand-primary)]/20 hover:brightness-110 active:scale-[0.98]"
                    : "bg-[var(--bg-main)] text-[var(--brand-soft)] cursor-not-allowed"
                    }`}
                >
                  Checkout Selected
                  <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${hasSelection ? "group-hover:translate-x-1" : ""}`} />
                </Link>

                <div className="mt-8 pt-8 border-t border-[var(--border-light)] space-y-4">
                  <div className="flex items-center gap-3 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Secure Checkout via Xendit
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    <Check className="w-4 h-4 text-[var(--brand-accent)]" />
                    In-stock & Ready for Ship
                  </div>
                </div>
              </div>

              {/* HELP SECTION */}
              <div className="bg-[var(--brand-primary)] rounded-[2rem] p-6 text-white text-center shadow-lg">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Need Assistance?</p>
                <p className="text-sm font-bold mt-2">support@dseoriginals.com</p>
                <button className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] bg-white/10 hover:bg-white/20 py-2 px-6 rounded-full transition-colors">
                  Live Chat
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}