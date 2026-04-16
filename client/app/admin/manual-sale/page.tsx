"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { getImageUrl } from "@/lib/image"
import { Search, ShoppingCart, CreditCard, Trash2, Plus, Minus, User, PhilippinePeso, Tag, Package, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import toast from "react-hot-toast"
import Image from "next/image"

export default function ManualSalePage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  
  // Cart State
  const [cart, setCart] = useState<any[]>([])
  const [priceMode, setPriceMode] = useState<"srp" | "reseller">("srp")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Customer Info
  const [customerName, setCustomerName] = useState("")

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const data = await api.get("/products/all")
      setProducts(data || [])
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const addToCart = (product: any, variant: any) => {
    if (variant.stock <= 0) {
      toast.error("Item out of stock")
      return
    }

    const existingIndex = cart.findIndex(item => item.variantId === variant.id)
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
        productId: product.id,
        variantId: variant.id,
        name: product.name,
        variantName: variant.attributes?.map((a: any) => a.value).join(" / ") || "Standard",
        srp: Number(variant.price),
        reseller: Number(variant.resellerPrice || variant.price * 0.8), // Fallback if not set
        image: product.images?.[0]?.url,
        quantity: 1,
        stock: variant.stock
      }])
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
          price: priceMode === "srp" ? item.srp : item.reseller
        })),
        guestName: customerName || "Walk-in Customer",
        deliveryMethod: "pickup",
        paymentMethod: "cash",
        status: "paid", // Instantly paid for walk-ins
        isManual: true
      }

      await api.post("/orders/manual", payload)
      
      toast.success("Order Processed Successfully!")
      setCart([])
      setCustomerName("")
      fetchProducts() // Refresh stock
    } catch (err: any) {
      toast.error(err.message || "Checkout failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-screen">
      
      {/* LEFT: PRODUCT CATALOG */}
      <div className="flex-1 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-[var(--text-heading)]">Walk-in Order</h1>
            <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1">Point of Sale System</p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
            <input 
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-[var(--border-light)] bg-white/50 focus:bg-white focus:ring-2 focus:ring-[var(--brand-primary)] outline-none transition-all font-semibold"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full py-20 text-center text-[var(--text-muted)] font-bold">Loading product catalog...</div>
          ) : filteredProducts.map(product => (
            <div key={product.id} className="bg-white rounded-[2rem] p-4 border border-[var(--border-light)] shadow-sm hover:shadow-xl transition-all group">
              <div className="aspect-square rounded-[1.5rem] overflow-hidden bg-[var(--bg-surface)] relative mb-4">
                <Image 
                  src={getImageUrl(product.images?.[0]?.url)} 
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="font-black text-[var(--text-heading)] line-clamp-1">{product.name}</h3>
              
              <div className="mt-4 space-y-2">
                {product.variants.map((v: any) => (
                  <button
                    key={v.id}
                    disabled={v.stock <= 0}
                    onClick={() => addToCart(product, v)}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-[var(--border-light)] hover:border-[var(--brand-primary)] hover:bg-[var(--bg-main)] transition-all group/v"
                  >
                    <div className="text-left">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                        {v.attributes?.map((a: any) => a.value).join("/") || "Standard"}
                      </p>
                      <p className="text-sm font-black text-[var(--brand-primary)]">₱{Number(v.price).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                       <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${v.stock > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
                        {v.stock > 0 ? `${v.stock} in stock` : "Out of stock"}
                       </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: CART SUMMARY */}
      <div className="w-full lg:w-[400px] shrink-0">
        <div className="bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-light)] shadow-2xl overflow-hidden sticky top-24">
          
          <div className="bg-[var(--brand-primary)] p-8 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <ShoppingCart className="text-[var(--brand-soft)]" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black">Sale Cart</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">{cart.length} items ready</p>
              </div>
            </div>

            {/* PRICE MODE TOGGLE */}
            <div className="mt-8 bg-black/10 rounded-2xl p-1 flex">
              <button 
                onClick={() => setPriceMode("srp")}
                className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${priceMode === "srp" ? "bg-white text-[var(--brand-primary)] shadow-md" : "text-white/60 hover:text-white"}`}
              >
                Retail (SRP)
              </button>
              <button 
                onClick={() => setPriceMode("reseller")}
                className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${priceMode === "reseller" ? "bg-[var(--brand-soft)] text-[var(--brand-primary)] shadow-md" : "text-white/60 hover:text-white"}`}
              >
                Reseller
              </button>
            </div>
          </div>

          <div className="p-8 space-y-6">
            
            {/* CUSTOMER INPUT */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Customer Name (Optional)</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                <input 
                  type="text"
                  placeholder="e.g. Juan Dela Cruz"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border-light)] bg-[var(--bg-main)] focus:ring-2 focus:ring-[var(--brand-primary)] outline-none transition-all font-semibold text-sm"
                />
              </div>
            </div>

            <div className="h-px bg-dashed border-t border-[var(--border-light)]"></div>

            {/* CART ITEMS */}
            <div className="max-h-[300px] overflow-y-auto space-y-4 custom-scrollbar pr-2">
              {cart.length === 0 ? (
                <div className="py-10 text-center opacity-40">
                  <Package className="mx-auto mb-2" size={32} />
                  <p className="text-xs font-bold uppercase tracking-widest">Cart is empty</p>
                </div>
              ) : cart.map((item, idx) => (
                <div key={item.variantId} className="flex gap-4 group">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-[var(--bg-surface)] shrink-0 border border-[var(--border-light)]">
                    <img src={getImageUrl(item.image)} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-black text-[var(--text-heading)] truncate">{item.name}</h4>
                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-tighter">{item.variantName}</p>
                    <p className="text-xs font-black text-[var(--brand-primary)] mt-1">₱{(priceMode === "srp" ? item.srp : item.reseller).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(idx, -1)} className="p-1 hover:text-red-500 transition-colors"><Minus size={14} /></button>
                    <span className="text-sm font-black w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQty(idx, 1)} className="p-1 hover:text-[var(--brand-primary)] transition-colors"><Plus size={14} /></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-[var(--border-light)] space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Grand Total</span>
                <span className="text-3xl font-black text-[var(--brand-primary)]">₱{subtotal.toLocaleString()}</span>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={cart.length === 0 || isSubmitting}
                className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all ${cart.length > 0 ? "bg-[var(--brand-primary)] text-white shadow-xl shadow-[var(--brand-primary)]/20 hover:brightness-110 active:scale-[0.98]" : "bg-[var(--bg-surface)] text-[var(--text-muted)] cursor-not-allowed"}`}
              >
                {isSubmitting ? (
                  "Processing Order..."
                ) : (
                  <>
                    <CreditCard size={18} />
                    Complete Cash Sale
                  </>
                )}
              </button>
            </div>

          </div>

        </div>
      </div>

    </div>
  )
}
