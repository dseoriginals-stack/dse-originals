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
        <div className="flex flex-col h-full bg-[var(--bg-main)]">
          
          {/* HEADER */}
          <div className="bg-[var(--bg-card)] px-6 py-5 flex items-center justify-between border-b shrink-0">
            <div className="flex items-center gap-3">
               <div className="relative">
                 <ShoppingBag className="w-6 h-6 text-[var(--brand-primary)]" />
                 <span className="absolute -top-1.5 -right-1.5 bg-[var(--brand-primary)] text-white text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full">
                   {cart.length}
                 </span>
               </div>
               <h2 className="text-lg font-bold text-[var(--text-heading)]">Cart</h2>
            </div>
            <button 
              onClick={closeCart}
              className="p-2 -mr-2 hover:bg-[var(--bg-main)] rounded-full transition-colors text-[var(--text-muted)]"
            >
              <X size={22} />
            </button>
          </div>

          {/* SELECT ALL BAR */}
          {cart.length > 0 && (
            <div className="bg-[var(--bg-card)] px-6 py-3 border-b flex items-center justify-between shrink-0">
               <button 
                 onClick={toggleAllSelection}
                 className="flex items-center gap-2 group"
               >
                 <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                   isAllSelected ? "bg-[var(--brand-primary)] border-[var(--brand-primary)]" : "bg-white border-gray-200 group-hover:border-[var(--brand-soft)]"
                 }`}>
                   {isAllSelected && <Check size={14} className="text-white font-bold" />}
                 </div>
                 <span className="text-xs font-bold text-[var(--text-main)] uppercase tracking-tight">Select all</span>
               </button>
               
               {hasSelection && (
                 <button className="text-xs font-bold text-[var(--brand-soft)] hover:text-red-500 transition-colors uppercase tracking-widest">
                   Delete ({selectedItems.length})
                 </button>
               )}
            </div>
          )}

          {/* FREE SHIPPING PROGRESS */}
          {cart.length > 0 && (
            <div className="bg-[var(--bg-card)] px-6 pb-4 pt-1 shrink-0">
               <div className="bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                      {selectedSubtotal >= 3000 ? "Free Shipping Unlocked!" : "Free Shipping Goal"}
                    </span>
                    <span className="text-[10px] font-bold text-[var(--brand-primary)]">
                      {selectedSubtotal >= 3000 ? "🎉" : `₱${(3000 - selectedSubtotal).toLocaleString()} away`}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-[var(--bg-main)] rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((selectedSubtotal / 3000) * 100, 100)}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${selectedSubtotal >= 3000 ? 'bg-emerald-500' : 'bg-[var(--brand-primary)]'}`}
                    />
                  </div>
                  <p className="text-[9px] text-[var(--text-muted)] font-medium mt-2">
                    {selectedSubtotal >= 3000 
                      ? "Your entire order qualifies for free delivery! 🚚" 
                      : "Add more items to unlock free nationwide shipping."}
                  </p>
               </div>
            </div>
          )}

          {/* ITEMS LIST */}
          <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-2 space-y-4">
            {cart.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-center p-10">
                  <div className="w-16 h-16 bg-[var(--bg-surface)] rounded-full flex items-center justify-center mb-4 text-[var(--brand-soft)]">
                    <ShoppingCart size={32} />
                  </div>
                  <h3 className="font-bold text-[var(--text-heading)]">Your cart is empty</h3>
                  <p className="text-sm text-[var(--text-muted)] mt-1 max-w-[200px]">Looks like you haven't added anything yet.</p>
                  <button 
                    onClick={closeCart}
                    className="mt-6 font-bold text-xs uppercase tracking-widest bg-[var(--brand-primary)] text-white px-8 py-3 rounded-full shadow-lg"
                  >
                    Start Shopping
                  </button>
               </div>
            ) : (
              cart.map((item) => (
                <div 
                  key={item.variantId}
                  onClick={() => toggleSelection(item.variantId)}
                  className={`bg-[var(--bg-card)] cursor-pointer rounded-2xl p-4 flex gap-4 shadow-sm border border-[var(--border-light)] relative group transition-all ${
                    selectedItems.includes(item.variantId) ? 'border-[var(--brand-primary)]' : 'hover:border-[var(--brand-soft)]/30'
                  }`}
                >
                  {/* CHECKBOX */}
                  <div className="flex items-center self-center">
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                      selectedItems.includes(item.variantId) ? "bg-[var(--brand-primary)] border-[var(--brand-primary)]" : "bg-white border-gray-200"
                    }`}>
                      {selectedItems.includes(item.variantId) && <Check size={14} className="text-white font-bold" />}
                    </div>
                  </div>

                  {/* PRODUCT IMAGE */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-[var(--bg-surface)] border shrink-0">
                    <img 
                      src={item.image || "/placeholder.png"} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* INFO */}
                  <div className="flex-1 flex flex-col justify-between pt-0.5">
                    <div>
                      <h4 className="text-sm font-bold text-[var(--text-heading)] line-clamp-1 leading-tight">{item.name}</h4>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.attributes && item.attributes.length > 0 ? (
                          item.attributes.map((attr, idx) => (
                            <span key={idx} className="text-[9px] font-black uppercase tracking-tighter text-[var(--brand-primary)] bg-[var(--brand-soft)]/10 px-1.5 py-0.5 rounded">
                              {attr.value}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tighter">Authentic / Edition</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-end justify-between">
                       <span className="text-sm font-black text-[var(--brand-primary)]">₱{item.price.toLocaleString()}</span>
                       
                       {/* QUANTITY CONTROLS */}
                       <div className="flex items-center bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-full p-0.5 scale-90 -mr-2 origin-right">
                         <button 
                           onClick={(e) => { e.stopPropagation(); updateQuantity(item.variantId, item.quantity - 1) }}
                           className="w-7 h-7 flex items-center justify-center rounded-full bg-white border border-[var(--border-light)] shadow-sm text-[var(--text-muted)] hover:text-red-500 transition-colors"
                         >
                           <Minus size={12} />
                         </button>
                         <span className="w-8 text-center text-xs font-black text-[var(--text-heading)]">{item.quantity}</span>
                         <button 
                           onClick={(e) => { e.stopPropagation(); updateQuantity(item.variantId, item.quantity + 1) }}
                           className="w-7 h-7 flex items-center justify-center rounded-full bg-white border border-[var(--border-light)] shadow-sm text-[var(--text-muted)] hover:bg-[var(--brand-primary)] hover:text-white transition-colors"
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
            <div className="bg-[var(--bg-card)] px-6 pt-4 pb-8 border-t border-[var(--border-light)] shadow-[0_-10px_40px_rgba(0,0,0,0.03)] flex flex-col gap-4">
               <div className="flex items-center justify-between">
                 <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Total to Pay</span>
                    <div className="flex items-baseline gap-1">
                       <span className="text-xl font-black text-[var(--brand-primary)]">₱{selectedSubtotal.toLocaleString()}</span>
                       {hasSelection && (
                         <span className="text-[10px] font-bold text-[var(--brand-accent)] mb-0.5">({selectedCount} items)</span>
                       )}
                    </div>
                 </div>
                 
                 <div className="text-right">
                    <p className="text-[10px] font-medium text-[var(--text-muted)]">Shipping calculated <br />at final step</p>
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
                     ? "bg-[var(--brand-primary)] text-white shadow-xl shadow-[var(--brand-primary)]/10 hover:brightness-110 active:scale-[0.98]" 
                     : "bg-[var(--bg-main)] text-[var(--brand-soft)] cursor-not-allowed"
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