"use client"

import { useCart } from "@/context/CartContext"
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
  Truck
} from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"

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

  const isAllSelected = cart.length > 0 && selectedItems.length === cart.length
  const hasSelection = selectedItems.length > 0
  const progress = Math.min((selectedSubtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)

  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-300">
          <ShoppingBag size={48} />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Your cart is empty</h1>
        <p className="text-slate-500 mt-2 max-w-sm">Explore our collection and find something beautiful to add to your cart.</p>
        <Link 
          href="/products" 
          className="mt-8 bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-black transition-all"
        >
          Start Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-32">
      {/* HEADER BAR (DESKTOP) */}
      <div className="bg-white border-b sticky top-0 z-30">
        <div className="container max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
              Shopping Cart
              <span className="text-xs font-bold bg-slate-100 px-3 py-1 rounded-full text-slate-500">{cart.length} items</span>
            </h1>
            <Link href="/products" className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest">
              <ArrowLeft size={16} /> Continue Shopping
            </Link>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-10">
          
          {/* LEFT: ITEMS LIST */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* FREE SHIPPING BANNER */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-6">
               <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Truck className={`w-5 h-5 ${selectedSubtotal >= FREE_SHIPPING_THRESHOLD ? 'text-emerald-500' : 'text-slate-900'}`} />
                    <span className="text-sm font-bold text-slate-900">
                      {selectedSubtotal >= FREE_SHIPPING_THRESHOLD ? "Free Shipping Unlocked!" : "Free Shipping Goal"}
                    </span>
                  </div>
                  <span className="text-xs font-black text-slate-400">
                    {selectedSubtotal >= FREE_SHIPPING_THRESHOLD ? "CONGRATS" : `₱${(FREE_SHIPPING_THRESHOLD - selectedSubtotal).toLocaleString()} away`}
                  </span>
               </div>
               <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className={`h-full rounded-full transition-all duration-700 ${selectedSubtotal >= FREE_SHIPPING_THRESHOLD ? 'bg-emerald-500' : 'bg-slate-900'}`}
                  />
               </div>
               <p className="text-xs text-slate-400 mt-3 font-medium">
                  {selectedSubtotal >= FREE_SHIPPING_THRESHOLD 
                    ? "Your entire selection qualifies for free nationwide delivery! 🚚" 
                    : "Add more faith-inspired items to your selection for free shipping."}
               </p>
            </div>

            {/* SELECT ALL */}
            <div className="bg-white rounded-2xl px-6 py-4 border border-slate-100 shadow-sm flex items-center justify-between">
               <button 
                 onClick={toggleAllSelection}
                 className="flex items-center gap-3 group"
               >
                 <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                   isAllSelected ? "bg-red-500 border-red-500 shadow-md shadow-red-500/20" : "bg-white border-slate-200 group-hover:border-slate-400"
                 }`}>
                   {isAllSelected && <Check size={16} className="text-white font-black" />}
                 </div>
                 <span className="text-sm font-black text-slate-700 uppercase tracking-widest leading-none">Select all ({cart.length})</span>
               </button>
               
               {hasSelection && (
                 <button className="flex items-center gap-2 text-xs font-black text-slate-300 hover:text-red-500 transition-colors uppercase tracking-widest">
                   <Trash2 size={14} /> Remove Selected
                 </button>
               )}
            </div>

            {/* PRODUCT CARDS */}
            <div className="space-y-4">
               {cart.map((item) => (
                 <div 
                   key={item.variantId}
                   className={`bg-white rounded-[2rem] p-5 flex flex-col md:flex-row gap-6 border-2 transition-all relative group ${
                     selectedItems.includes(item.variantId) ? 'border-slate-900 shadow-xl shadow-slate-900/5' : 'border-transparent hover:border-slate-100 shadow-sm'
                   }`}
                 >
                    {/* SELECTION OVERLAY */}
                    <button 
                       onClick={() => toggleSelection(item.variantId)}
                       className="absolute inset-0 z-0"
                    />

                    <div className="relative z-10 flex gap-4 md:gap-6 flex-1">
                        {/* CHECKBOX */}
                        <div className="flex items-center">
                          <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                            selectedItems.includes(item.variantId) ? "bg-red-500 border-red-500 shadow-md shadow-red-500/10" : "bg-slate-50 border-slate-200"
                          }`}>
                            {selectedItems.includes(item.variantId) && <Check size={16} className="text-white font-black" />}
                          </div>
                        </div>

                        {/* IMAGE */}
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl overflow-hidden bg-slate-50 border border-slate-100 shadow-inner flex-shrink-0">
                          <img 
                            src={item.image || "/placeholder.png"} 
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                        </div>

                        {/* INFO */}
                        <div className="flex-1 flex flex-col justify-between py-1">
                           <div>
                              <h3 className="text-base md:text-xl font-black text-slate-900 line-clamp-1 leading-tight">{item.name}</h3>
                              <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Standard Edition / Variant</p>
                              
                              <div className="mt-3 flex items-center gap-3">
                                <span className="text-lg md:text-2xl font-black text-slate-900">₱{item.price.toLocaleString()}</span>
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">In Stock</span>
                              </div>
                           </div>

                           <div className="hidden md:flex items-center gap-6 mt-4">
                              <button 
                                onClick={(e) => { e.stopPropagation(); removeFromCart(item.variantId) }}
                                className="text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-red-500 transition-colors"
                              >
                                Remove Item
                              </button>
                           </div>
                        </div>
                    </div>

                    {/* CONTROLS (RIGHT) */}
                    <div className="relative z-10 flex items-center justify-between md:flex-col md:justify-center md:items-end gap-4 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-8 border-slate-100">
                       <div className="flex items-center bg-slate-50 border-2 border-slate-100 rounded-full p-1 shadow-inner md:scale-110">
                          <button 
                             onClick={(e) => { e.stopPropagation(); updateQuantity(item.variantId, item.quantity - 1) }}
                             className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-slate-100 shadow-sm text-slate-500 hover:text-red-500 transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-10 text-center text-sm font-black text-slate-900">{item.quantity}</span>
                          <button 
                             onClick={(e) => { e.stopPropagation(); updateQuantity(item.variantId, item.quantity + 1) }}
                             className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-slate-100 shadow-sm text-slate-500 hover:bg-slate-900 hover:text-white transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                       </div>
                       
                       <div className="text-right flex flex-col items-end">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Item Total</span>
                          <span className="text-lg font-black text-slate-900">₱{(item.price * item.quantity).toLocaleString()}</span>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          </div>

          {/* RIGHT: SUMMARY CARD */}
          <div className="relative">
            <div className="lg:sticky lg:top-24 space-y-6">
               <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-900/5 overflow-hidden relative">
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 flex items-center justify-center pt-8 pr-8">
                     <ShoppingBag className="w-12 h-12 text-slate-100" />
                  </div>

                  <h2 className="text-2xl font-black text-slate-900 mb-8">Summary</h2>
                  
                  <div className="space-y-6">
                    <div className="flex justify-between items-center group">
                       <span className="text-xs font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors">Subtotal ({selectedCount} items)</span>
                       <span className="text-lg font-black text-slate-900 font-mono">₱{selectedSubtotal.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between items-center group">
                       <span className="text-xs font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors">Shipping Fee</span>
                       <span className="text-xs font-bold text-slate-400 italic">Calculated Next</span>
                    </div>

                    <div className="pt-6 border-t border-dashed border-slate-200">
                       <div className="flex justify-between items-end">
                          <div>
                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Estimated Total</span>
                            <div className="h-1 w-8 bg-red-500 rounded-full mt-1"></div>
                          </div>
                          <span className="text-3xl font-black text-slate-900">₱{selectedSubtotal.toLocaleString()}</span>
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
                    className={`mt-10 w-full group flex items-center justify-center gap-3 py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest transition-all duration-300 ${
                      hasSelection 
                        ? "bg-slate-900 text-white shadow-2xl shadow-slate-900/20 hover:bg-black active:scale-[0.98]" 
                        : "bg-slate-100 text-slate-300 cursor-not-allowed"
                    }`}
                  >
                    Checkout Selected
                    <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${hasSelection ? "group-hover:translate-x-1" : ""}`} />
                  </Link>

                  <div className="mt-8 pt-8 border-t border-slate-50 space-y-4">
                     <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        Secure Checkout via Xendit
                     </div>
                     <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <Check className="w-4 h-4 text-blue-500" />
                        In-stock & Ready for Ship
                     </div>
                  </div>
               </div>

               {/* HELP SECTION */}
               <div className="bg-slate-900 rounded-[2rem] p-6 text-white text-center shadow-lg">
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