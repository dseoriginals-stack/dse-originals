"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { getImageUrl } from "@/lib/image"
import { Search, ShoppingCart, CreditCard, Trash2, Plus, Minus, User, PhilippinePeso, Tag, Package, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import toast from "react-hot-toast"
import Image from "next/image"
import { ProductFull, ProductVariant } from "@/types/product"


export default function ManualSalePage() {
  const [products, setProducts] = useState<ProductFull[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  
  // Cart State
  const [cart, setCart] = useState<any[]>([])
  const [priceMode, setPriceMode] = useState<"srp" | "reseller">("srp")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Customer Info
  const [customerName, setCustomerName] = useState("")
  
  // Checkout Success
  const [lastOrder, setLastOrder] = useState<any>(null)

  // Size Selection for Apparel
  const [selectedVariantForSize, setSelectedVariantForSize] = useState<{product: any, variant: any} | null>(null)

  useEffect(() => {
    fetchProducts()
    const syncInterval = setInterval(fetchProducts, 60000)
    return () => clearInterval(syncInterval)
  }, [])

  const fetchProducts = async () => {
    try {
      const data = await api.get(`/admin/products?cb=${Date.now()}`)
      setProducts(data?.data || data || [])
    } catch (err) {
      console.error("Sync failed:", err)
    } finally {
      setLoading(false)
    }
  }

  const getPOSPrices = (product: ProductFull, variant: ProductVariant) => {
    const cat = (product.category || "").toLowerCase()
    const attrValues = (variant.attributes || []).map((a) => (a.value || "").toLowerCase())

    // 55ml Perfume logic
    if (attrValues.some((v: string) => v.includes("55ml"))) {
      return { srp: 349, reseller: 299 }
    }

    // 30ml Perfume logic
    if (attrValues.some((v: string) => v.includes("30ml"))) {
      return { srp: 249, reseller: 199 }
    }

    // Apparel logic (Category based or size based)
    const isApparel = 
      cat.includes("apparel") || 
      attrValues.some((v: string) => ["small", "medium", "large", "xl", "2xl", "shirt", "tee", "s", "m", "l"].includes(v)) ||
      variant.attributes?.some((a: any) => a.name.toLowerCase().includes("size"))

    if (isApparel) {
      return { srp: 399, reseller: 369 }
    }

    // Fallback to database price
    return {
      srp: Number(variant.price),
      reseller: Number(variant.price * 0.8) // Assuming a default reseller discount if not specified
    }
  }

  const addToCart = (product: any, variant: any, selectedSize?: string) => {
    if (variant.stock <= 0) {
      toast.error("Item out of stock")
      return
    }

    // Check if it's an apparel variant with the new "Sizes" attribute
    const sizesAttr = variant.attributes?.find((a: any) => a.name === "Sizes")
    if (sizesAttr && !selectedSize) {
      setSelectedVariantForSize({ product, variant })
      return
    }

    const prices = getPOSPrices(product, variant)
    
    // If it was an apparel with "Sizes", we construct a clean name
    let variantName = variant.attributes?.filter((a: any) => a.name !== "Sizes").map((a: any) => a.value).join(" / ") || "Standard"
    if (selectedSize) {
      variantName = variantName === "Standard" ? selectedSize : `${variantName} / ${selectedSize}`
    }

    const cartKey = `${variant.id}-${selectedSize || 'none'}`
    const existingIndex = cart.findIndex(item => item.cartKey === cartKey)
    
    if (existingIndex > -1) {
      const newCart = [...cart]
      if (newCart[existingIndex].quantity >= variant.stock) {
        toast.error("Cannot exceed available stock")
        return
      }
      newCart[existingIndex].quantity += 1
      setCart(newCart)
    } else {
      setCart([...cart, {
        cartKey,
        productId: product.id,
        variantId: variant.id,
        name: product.name,
        variantName,
        selectedSize,
        srp: prices.srp,
        reseller: prices.reseller,
        image: variant.image || product.images?.[0]?.url || "/placeholder.png",
        quantity: 1,
        stock: variant.stock
      }])
    }
    
    if (selectedSize) {
      setSelectedVariantForSize(null)
    }
    toast.success("Added to POS cart")
  }

  const updateQty = (index: number, delta: number) => {
    const newCart = [...cart]
    const item = newCart[index]
    const newQty = item.quantity + delta
    
    if (newQty <= 0) {
      newCart.splice(index, 1)
    } else if (newQty > item.stock) {
      toast.error("Stock limit reached")
      return
    } else {
      item.quantity = newQty
    }
    setCart(newCart)
  }

  const subtotal = cart.reduce((acc, item) => {
    const price = priceMode === "srp" ? item.srp : item.reseller
    return acc + (price * item.quantity)
  }, 0)

  const handleCheckout = async () => {
    if (cart.length === 0) return
    setIsSubmitting(true)

    try {
      const payload = {
        items: cart.map(item => ({
          variantId: item.variantId,
          quantity: item.quantity,
          price: priceMode === "srp" ? item.srp : item.reseller,
          productName: `${item.name}${item.variantName !== "Standard" ? ` (${item.variantName})` : ""}`
        })),
        guestName: customerName || "Walk-in Customer",
        deliveryMethod: "pickup",
        paymentMethod: "cash",
        status: "paid",
        isManual: true
      }

      const res = await api.post("/orders/manual", payload)
      
      setLastOrder({ ...res, cartItems: [...cart], subtotal, priceMode, guestName: customerName || "Walk-in Customer" })
      
      toast.success("Order Processed Successfully!")
      setCart([])
      setCustomerName("")
      fetchProducts()
    } catch (err: any) {
      toast.error(err.message || "Checkout failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  const printReceipt = () => {
    window.print()
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-screen">
      
      {/* LEFT: PRODUCT CATALOG */}
      <div className="flex-1 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-[1000] text-[var(--text-heading)] tracking-tighter">Walk-in Order</h1>
            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mt-1">Direct Sale Terminal</p>
          </div>

          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
            <input 
              type="text"
              placeholder="Search scancode or product name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-[var(--border-light)] bg-white/80 focus:bg-white focus:ring-4 focus:ring-[var(--brand-primary)]/10 outline-none transition-all font-bold shadow-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {loading ? (
            <div className="col-span-full py-32 flex flex-col items-center justify-center space-y-4">
               <div className="w-10 h-10 border-4 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin" />
               <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Loading Inventory...</p>
            </div>
          ) : (
            products.flatMap(p => p.variants.map((v) => ({ ...v, parentProduct: p })))
              .filter(v => v.parentProduct.name.toLowerCase().includes(search.toLowerCase()) || 
                          v.attributes?.some((a: any) => a.value.toLowerCase().includes(search.toLowerCase())))
              .map((variant: any) => {
                const prices = getPOSPrices(variant.parentProduct, variant)
                const currentPrice = priceMode === "srp" ? prices.srp : prices.reseller
                const displayImage = variant.image || variant.parentProduct.images?.[0]?.url || "/placeholder.png"

                return (
                  <button
                    key={variant.id}
                    disabled={variant.stock <= 0}
                    onClick={() => addToCart(variant.parentProduct, variant)}
                    className={`relative group bg-white rounded-3xl p-3 border-2 transition-all text-left flex flex-col h-full ${variant.stock <= 0 ? "opacity-50 grayscale cursor-not-allowed border-transparent" : "border-transparent hover:border-[var(--brand-primary)] hover:shadow-2xl hover:shadow-[var(--brand-primary)]/10 active:scale-95"}`}
                  >
                    <div className="aspect-square rounded-2xl overflow-hidden bg-[var(--bg-surface)] relative mb-3">
                      <Image 
                        src={getImageUrl(displayImage)} 
                        alt={variant.parentProduct.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 backdrop-blur-md rounded-lg text-[8px] font-black uppercase tracking-widest text-[var(--brand-primary)] shadow-sm">
                        {variant.stock} in stock
                      </div>
                    </div>
                    
                    <div className="flex-1 flex flex-col min-w-0">
                      <h3 className="text-[11px] font-[1000] text-[var(--text-heading)] leading-tight line-clamp-2">
                        {variant.parentProduct.name}
                      </h3>
                      <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-tight mt-1 truncate">
                        {variant.attributes?.map((a: any) => a.value).join("/") || "Standard"}
                      </p>
                      <div className="mt-auto pt-3 flex items-center justify-between">
                        <span className="text-sm font-black text-[var(--brand-primary)]">
                          ₱{currentPrice.toLocaleString()}
                        </span>
                        <div className="w-6 h-6 rounded-full bg-[var(--brand-soft)] flex items-center justify-center group-hover:bg-[var(--brand-primary)] group-hover:text-white transition-colors">
                          <Plus size={14} />
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })
          )}
        </div>
      </div>

      {/* RIGHT: CART SUMMARY */}
      <div className="w-full lg:w-[420px] shrink-0">
        <div className="bg-white rounded-[2.5rem] border border-[var(--border-light)] shadow-2xl overflow-hidden sticky top-24">
          
          <div className="bg-[#1B3B60] p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                  <ShoppingCart className="text-[var(--brand-soft)]" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-[1000] text-white tracking-tight">Sale Cart</h2>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">{cart.length} items ready</p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                 <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-white/10 rounded-full border border-white/10">Cash Payment</span>
                 {cart.length > 0 && (
                   <button onClick={() => setCart([])} className="text-[10px] text-red-300 hover:text-red-400 font-bold uppercase tracking-widest transition-colors">Clear Cart</button>
                 )}
              </div>
            </div>

            <div className="relative z-10 mt-8 bg-black/20 backdrop-blur-xl rounded-2xl p-1.5 flex border border-white/5">
              <button 
                onClick={() => setPriceMode("srp")}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all duration-300 ${priceMode === "srp" ? "bg-white text-[#1B3B60] shadow-xl" : "text-white/40 hover:text-white hover:bg-white/5"}`}
              >
                Retail (SRP)
              </button>
              <button 
                onClick={() => setPriceMode("reseller")}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all duration-300 ${priceMode === "reseller" ? "bg-[var(--brand-soft)] text-[#1B3B60] shadow-xl" : "text-white/40 hover:text-white hover:bg-white/5"}`}
              >
                Reseller
              </button>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Customer Attribution</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                <input 
                  type="text"
                  placeholder="e.g. Maria Clara (Walk-in)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full pl-10 pr-4 py-4 rounded-xl border border-[var(--border-light)] bg-[var(--bg-main)] focus:bg-white focus:ring-4 focus:ring-[var(--brand-primary)]/10 outline-none transition-all font-bold text-sm shadow-inner"
                />
              </div>
            </div>

            <div className="h-px bg-gray-100"></div>

            <div className="max-h-[350px] overflow-y-auto space-y-3 custom-scrollbar pr-2">
              {cart.length === 0 ? (
                <div className="py-20 text-center opacity-20 flex flex-col items-center">
                  <Package className="mb-4" size={48} strokeWidth={1} />
                  <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Items</p>
                </div>
              ) : (
                <AnimatePresence>
                  {cart.map((item, idx) => (
                    <motion.div 
                      key={item.variantId}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex gap-4 p-3 bg-[var(--bg-surface)] rounded-2xl border border-transparent hover:border-gray-100 transition-all group"
                    >
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-white shrink-0 border border-gray-100 shadow-sm">
                        <img src={getImageUrl(item.image)} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[11px] font-[1000] text-[var(--text-heading)] leading-tight truncate">{item.name}</h4>
                        <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-tight mt-0.5">{item.variantName}</p>
                        <p className="text-sm font-black text-[var(--brand-primary)] mt-1.5">₱{(priceMode === "srp" ? item.srp : item.reseller).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white rounded-xl px-2 py-1.5 shadow-sm border border-gray-50 self-center">
                        <button onClick={() => updateQty(idx, -1)} className="w-6 h-6 rounded-lg hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors"><Minus size={12} /></button>
                        <span className="text-xs font-black min-w-[20px] text-center">{item.quantity}</span>
                        <button onClick={() => updateQty(idx, 1)} className="w-6 h-6 rounded-lg hover:bg-[var(--brand-soft)] hover:text-[var(--brand-primary)] flex items-center justify-center transition-colors"><Plus size={12} /></button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            <div className="pt-6 border-t border-gray-50 space-y-5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Total Transaction</span>
                <span className="text-4xl font-[1000] text-[var(--text-heading)] tracking-tighter">₱{subtotal.toLocaleString()}</span>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={cart.length === 0 || isSubmitting}
                className={`w-full py-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all ${cart.length > 0 ? "bg-[var(--brand-primary)] text-white shadow-2xl shadow-[var(--brand-primary)]/30 hover:brightness-110 active:scale-[0.98]" : "bg-gray-50 text-gray-300 cursor-not-allowed"}`}
              >
                {isSubmitting ? (
                  "Finalizing..."
                ) : (
                  <>
                    <PhilippinePeso size={18} />
                    Complete Cash Sale
                  </>
                )}
              </button>
              <p className="text-[9px] font-bold text-center text-gray-400 uppercase tracking-widest">Inventory will be deducted instantly</p>
            </div>
          </div>
        </div>
      </div>

      {/* SUCCESS / RECEIPT MODAL */}
      <AnimatePresence>
        {lastOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:bg-white print:static print:p-0">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl print:shadow-none print:max-w-none print:w-full print:border-none border border-gray-100 relative"
            >
              <div className="print:hidden absolute top-4 right-4 flex gap-2">
                <button onClick={() => setLastOrder(null)} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition">✕</button>
              </div>

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-[var(--brand-soft)]/20 text-[var(--brand-primary)] rounded-full flex items-center justify-center mx-auto mb-4 print:hidden">
                  <Check size={32} strokeWidth={3} />
                </div>
                <h2 className="text-2xl font-[1000] text-[var(--text-heading)] tracking-tighter">DSE Originals</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Walk-in Receipt</p>
                <div className="text-xs font-bold text-gray-500 mt-2">Order #{lastOrder.id?.slice(-6).toUpperCase()}</div>
                <div className="text-[10px] text-gray-400">{new Date().toLocaleString()}</div>
              </div>

              <div className="border-t border-dashed border-gray-300 py-4 mb-4">
                <div className="text-xs font-bold text-gray-600 mb-2">Customer: {lastOrder.guestName}</div>
                <div className="text-[10px] text-gray-400 mb-4">Pricing: {lastOrder.priceMode === "srp" ? "Retail (SRP)" : "Reseller"}</div>

                <div className="space-y-3">
                  {lastOrder.cartItems.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between text-xs font-bold text-gray-600">
                      <div>
                        <span>{item.quantity}x </span>
                        <span>{item.name} ({item.variantName})</span>
                      </div>
                      <span>₱{(item.quantity * (lastOrder.priceMode === "srp" ? item.srp : item.reseller)).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-300 pt-4 flex justify-between items-center mb-8">
                <span className="font-black text-gray-500 uppercase text-[10px] tracking-widest">Total Paid</span>
                <span className="text-2xl font-[1000] text-[var(--text-heading)]">₱{lastOrder.subtotal.toLocaleString()}</span>
              </div>

              <div className="print:hidden space-y-3">
                <button onClick={printReceipt} className="w-full btn-premium !py-4 rounded-xl text-xs uppercase tracking-widest shadow-xl">
                  Print Receipt
                </button>
                <button onClick={() => setLastOrder(null)} className="w-full py-4 rounded-xl text-xs font-bold uppercase tracking-widest bg-gray-100 text-gray-600 hover:bg-gray-200 transition">
                  New Sale
                </button>
              </div>

              <div className="hidden print:block text-center text-[10px] text-gray-400 mt-8 font-bold uppercase tracking-widest">
                Thank you for your purchase!
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SIZE SELECTION MODAL */}
      <AnimatePresence>
        {selectedVariantForSize && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-gray-100"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-[1000] text-[var(--text-heading)] tracking-tight">Select Size</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                    {selectedVariantForSize.product.name} 
                    {selectedVariantForSize.variant.attributes?.filter((a:any)=>a.name!=="Sizes").length > 0 && 
                      ` (${selectedVariantForSize.variant.attributes.filter((a:any)=>a.name!=="Sizes").map((a:any)=>a.value).join("/")})`}
                  </p>
                </div>
                <button onClick={() => setSelectedVariantForSize(null)} className="p-2 hover:bg-gray-100 rounded-full transition">✕</button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {selectedVariantForSize.variant.attributes
                  ?.find((a: any) => a.name === "Sizes")
                  ?.value.split(",")
                  .map((size: string) => {
                    const trimmedSize = size.trim()
                    return (
                      <button
                        key={trimmedSize}
                        onClick={() => addToCart(selectedVariantForSize.product, selectedVariantForSize.variant, trimmedSize)}
                        className="py-4 rounded-2xl border-2 border-gray-100 hover:border-[var(--brand-primary)] hover:bg-[var(--brand-soft)]/10 text-sm font-black transition-all"
                      >
                        {trimmedSize}
                      </button>
                    )
                  })}
              </div>

              <button 
                onClick={() => setSelectedVariantForSize(null)}
                className="w-full mt-8 py-4 rounded-2xl bg-gray-100 text-gray-500 text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition"
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
