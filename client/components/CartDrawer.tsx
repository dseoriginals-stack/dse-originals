"use client"

import { useCart } from "@/context/CartContext"
import { motion, AnimatePresence } from "framer-motion"
import { 
  X, 
  Minus, 
  Plus, 
  ShoppingBag, 
  Trash2, 
  Check,
  ChevronRight,
  ShoppingCart
} from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    closeCart,
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

  return (
    <>
      {/* OVERLAY */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[100]"
          />
        )}
      </AnimatePresence>

      {/* DRAWER */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-[420px] bg-white z-[101] shadow-2xl transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full bg-[#f8fafc]">
          
          {/* HEADER */}
          <div className="bg-white px-6 py-5 flex items-center justify-between border-b shrink-0">
            <div className="flex items-center gap-3">
               <div className="relative">
                 <ShoppingBag className="w-6 h-6 text-slate-900" />
                 <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full">
                   {cart.length}
                 </span>
               </div>
               <h2 className="text-lg font-bold text-slate-900">Cart</h2>
            </div>
            <button 
              onClick={closeCart}
              className="p-2 -mr-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
            >
              <X size={22} />
            </button>
          </div>

          {/* SELECT ALL BAR */}
          {cart.length > 0 && (
            <div className="bg-white px-6 py-3 border-b flex items-center justify-between shrink-0">
               <button 
                 onClick={toggleAllSelection}
                 className="flex items-center gap-2 group"
               >
                 <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                   isAllSelected ? "bg-red-500 border-red-500" : "bg-white border-slate-200 group-hover:border-slate-300"
                 }`}>
                   {isAllSelected && <Check size={14} className="text-white font-bold" />}
                 </div>
                 <span className="text-xs font-bold text-slate-600">Select all</span>
               </button>
               
               {hasSelection && (
                 <button className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest">
                   Delete ({selectedItems.length})
                 </button>
               )}
            </div>
          )}

          {/* FREE SHIPPING PROGRESS */}
          {cart.length > 0 && (
            <div className="bg-white px-6 pb-4 pt-1 shrink-0">
               <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {selectedSubtotal >= 3000 ? "Free Shipping Unlocked!" : "Free Shipping Goal"}
                    </span>
                    <span className="text-[10px] font-bold text-slate-900">
                      {selectedSubtotal >= 3000 ? "🎉" : `₱${(3000 - selectedSubtotal).toLocaleString()} away`}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((selectedSubtotal / 3000) * 100, 100)}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${selectedSubtotal >= 3000 ? 'bg-emerald-500' : 'bg-slate-900'}`}
                    />
                  </div>
                  <p className="text-[9px] text-slate-400 font-medium mt-2">
                    {selectedSubtotal >= 3000 
                      ? "Your entire order qualifies for free delivery! 🚚" 
                      : "Add more items to unlock free nationwide shipping."}
                  </p>
               </div>
            </div>
          )}

          {/* ITEMS LIST */}
          <div className="flex-1 overflow-y-auto px-6 py-2 space-y-4">
            {cart.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-center p-10">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
                    <ShoppingCart size={32} />
                  </div>
                  <h3 className="font-bold text-slate-900">Your cart is empty</h3>
                  <p className="text-sm text-slate-400 mt-1 max-w-[200px]">Looks like you haven't added anything yet.</p>
                  <button 
                    onClick={closeCart}
                    className="mt-6 font-bold text-xs uppercase tracking-widest bg-slate-900 text-white px-8 py-3 rounded-full shadow-lg"
                  >
                    Start Shopping
                  </button>
               </div>
            ) : (
              cart.map((item) => (
                <div 
                  key={item.variantId}
                  className="bg-white rounded-2xl p-4 flex gap-4 shadow-sm border border-slate-100 relative group transition-all hover:border-slate-200"
                >
                  {/* SELECTION OVERLAY-CLICKABLE */}
                  <button 
                    onClick={() => toggleSelection(item.variantId)}
                    className="absolute inset-0 z-0"
                  />

                  {/* CHECKBOX */}
                  <div className="relative z-10 flex items-center self-center">
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                      selectedItems.includes(item.variantId) ? "bg-red-500 border-red-500" : "bg-white border-slate-200"
                    }`}>
                      {selectedItems.includes(item.variantId) && <Check size={14} className="text-white font-bold" />}
                    </div>
                  </div>

                  {/* PRODUCT IMAGE */}
                  <div className="relative z-10 w-20 h-20 rounded-xl overflow-hidden bg-slate-50 border shrink-0">
                    <img 
                      src={item.image || "/placeholder.png"} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* INFO */}
                  <div className="relative z-10 flex-1 flex flex-col justify-between pt-0.5">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 line-clamp-1 leading-tight">{item.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Variant: Standard</span>
                      </div>
                    </div>

                    <div className="flex items-end justify-between">
                       <span className="text-sm font-black text-slate-900">₱{item.price.toLocaleString()}</span>
                       
                       {/* QUANTITY CONTROLS */}
                       <div className="flex items-center bg-slate-50 border rounded-full p-0.5 scale-90 -mr-2 origin-right">
                         <button 
                           onClick={(e) => { e.stopPropagation(); updateQuantity(item.variantId, item.quantity - 1) }}
                           className="w-7 h-7 flex items-center justify-center rounded-full bg-white border border-slate-100 shadow-sm text-slate-500 hover:text-red-500 transition-colors"
                         >
                           <Minus size={12} />
                         </button>
                         <span className="w-8 text-center text-xs font-black text-slate-900">{item.quantity}</span>
                         <button 
                           onClick={(e) => { e.stopPropagation(); updateQuantity(item.variantId, item.quantity + 1) }}
                           className="w-7 h-7 flex items-center justify-center rounded-full bg-white border border-slate-100 shadow-sm text-slate-500 hover:bg-slate-900 hover:text-white transition-colors"
                         >
                           <Plus size={12} />
                         </button>
                       </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* FOOTER BAR (TIKTOK STYLE) */}
          {cart.length > 0 && (
            <div className="bg-white px-6 pt-4 pb-8 border-t shadow-[0_-10px_40px_rgba(0,0,0,0.03)] flex flex-col gap-4">
               <div className="flex items-center justify-between">
                 <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total to Pay</span>
                    <div className="flex items-baseline gap-1">
                       <span className="text-xl font-black text-slate-900">₱{selectedSubtotal.toLocaleString()}</span>
                       {hasSelection && (
                         <span className="text-[10px] font-bold text-red-500 mb-0.5">({selectedCount} items)</span>
                       )}
                    </div>
                 </div>
                 
                 <div className="text-right">
                    <p className="text-[10px] font-medium text-slate-400">Shipping calculated <br />at final step</p>
                 </div>
               </div>

               <Link
                 href={hasSelection ? "/checkout" : "#"}
                 onClick={(e) => {
                   if (!hasSelection) {
                     e.preventDefault()
                     toast.error("Please select items to checkout")
                   } else {
                     closeCart()
                   }
                 }}
                 className={`group flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 ${
                   hasSelection 
                     ? "bg-slate-900 text-white shadow-xl shadow-slate-900/10 hover:bg-black active:scale-[0.98]" 
                     : "bg-slate-100 text-slate-300 cursor-not-allowed"
                 }`}
               >
                 Checkout Selected
                 <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${hasSelection ? "group-hover:translate-x-1" : ""}`} />
               </Link>
            </div>
          )}

        </div>
      </div>
    </>
  )
}