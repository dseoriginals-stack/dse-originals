"use client"

import { useState } from "react"
import { 
  CheckCircle2, 
  ArrowRight, 
  Package, 
  TrendingUp, 
  ShieldCheck, 
  MessageSquare, 
  Truck, 
  LayoutDashboard,
  UserPlus,
  LogIn,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Send
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import toast from "react-hot-toast"

export default function ResellerPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    package: "basic",
    facebook: "",
    message: ""
  })
  const [submitting, setSubmitting] = useState(false)

  const faqs = [
    { q: "Is there a minimum order requirement?", a: "Yes, minimum orders apply depending on your chosen package." },
    { q: "How much can I earn?", a: "Resellers enjoy high margins, giving you great income potential." },
    { q: "How do I pay?", a: "Payments are processed via GCash for easy and secure transactions." },
    { q: "Do you ship nationwide?", a: "Yes! We ship across the Philippines through J&T Express." }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    // Simulating API call
    setTimeout(() => {
      toast.success("Application submitted! Our team will contact you soon.")
      setSubmitting(false)
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        location: "",
        package: "basic",
        facebook: "",
        message: ""
      })
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)]">
      
      {/* HERO SECTION - REPLICA OF SCREENSHOT 1 */}
      <section className="pt-24 pb-20 px-4 md:px-0">
        <div className="container max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* JOIN CARD */}
            <div className="lg:col-span-4 bg-white rounded-[2.5rem] border border-[var(--border-light)] shadow-2xl overflow-hidden text-center p-10 md:p-12">
               <div className="w-16 h-16 bg-[var(--brand-soft)] rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <UserPlus className="text-[var(--brand-primary)]" size={32} />
               </div>
               <h1 className="text-3xl font-[1000] text-[var(--text-heading)] mb-4 tracking-tighter">Join Our Reseller Family</h1>
               <p className="text-sm font-bold text-[var(--text-muted)] leading-relaxed mb-10 max-w-[280px] mx-auto">
                 Start your entrepreneurial journey with DSE. Low investment, high returns, and a supportive community.
               </p>

               <div className="space-y-4">
                 <button 
                   onClick={() => document.getElementById('apply-form')?.scrollIntoView({behavior: 'smooth'})}
                   className="w-full py-5 bg-[var(--brand-primary)] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[var(--brand-primary)]/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                 >
                   <UserPlus size={18} /> Sign Up to Apply
                 </button>
                 
                 <div className="flex items-center gap-3 py-4">
                    <div className="h-px bg-gray-100 flex-1"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">or</span>
                    <div className="h-px bg-gray-100 flex-1"></div>
                 </div>

                 <Link href="/login" className="w-full py-5 bg-white border-2 border-gray-50 text-[var(--text-muted)] rounded-2xl font-black text-xs uppercase tracking-widest hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-all flex items-center justify-center gap-3">
                   <LogIn size={18} /> Login (Existing Resellers)
                 </Link>
               </div>

               <div className="mt-10 pt-10 border-t border-gray-50 space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Need help getting started?</p>
                  <a href="https://m.me/dseoriginals" target="_blank" className="w-full py-4 bg-white border border-gray-100 rounded-2xl font-bold text-[10px] uppercase tracking-widest text-[var(--brand-primary)] flex items-center justify-center gap-3 hover:bg-[var(--bg-surface)] transition-all">
                    <MessageSquare size={16} /> Ask Questions on Messenger
                  </a>
               </div>
            </div>

            {/* WHY & HOW COLUMNS */}
            <div className="lg:col-span-8 flex flex-col gap-8">
              
              {/* WHY BECOME A RESELLER */}
              <div className="bg-white rounded-[2.5rem] p-10 md:p-12 border border-[var(--border-light)] shadow-sm">
                 <div className="flex items-center gap-4 mb-8">
                    <TrendingUp className="text-[var(--brand-primary)]" size={32} />
                    <div>
                       <h2 className="text-2xl font-black text-[var(--text-heading)]">Why Become a Reseller?</h2>
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">The benefits of joining our team.</p>
                    </div>
                 </div>

                 <div className="space-y-5">
                    {[
                      "Affordable Starter Packages – Begin with a low investment.",
                      "High Profit Margins – Earn more with every sale.",
                      "Exclusive Discounts – Special reseller-only pricing.",
                      "Marketing Support – Ready-to-use materials and product photos.",
                      "Nationwide Shipping – We deliver fast and reliably through J&T Express."
                    ].map((benefit, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                        <p className="text-sm font-bold text-[var(--text-main)]">{benefit}</p>
                      </div>
                    ))}
                 </div>
              </div>

              {/* HOW TO GET STARTED */}
              <div className="bg-white rounded-[2.5rem] p-10 md:p-12 border border-[var(--border-light)] shadow-sm">
                 <div className="flex items-center gap-4 mb-8">
                    <LayoutDashboard className="text-[var(--brand-primary)]" size={32} />
                    <div>
                       <h2 className="text-2xl font-black text-[var(--text-heading)]">How to Get Started</h2>
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Your simple 5-step journey to becoming a DSE partner.</p>
                    </div>
                 </div>

                 <div className="space-y-6">
                    {[
                      "Fill out our Reseller Application Form below.",
                      "Choose your Starter Package that fits your business goals.",
                      "Pay securely via GCash and upload payment proof.",
                      "Wait for confirmation from our team.",
                      "Start selling and earning as an official DSE Reseller!"
                    ].map((step, i) => (
                      <div key={i} className="flex items-center gap-4 group">
                        <div className="w-8 h-8 rounded-full bg-[var(--brand-primary)] text-white text-xs font-black flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          {i + 1}
                        </div>
                        <p className="text-sm font-bold text-[var(--text-main)]">{step}</p>
                      </div>
                    ))}
                 </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION - REPLICA OF SCREENSHOT 2 */}
      <section className="pb-24 px-4 md:px-0">
        <div className="container max-w-4xl mx-auto">
          <div className="bg-white rounded-[2.5rem] p-10 md:p-14 border border-[var(--border-light)] shadow-sm">
            <div className="flex items-center gap-4 mb-10">
               <span className="text-2xl">❓</span>
               <h2 className="text-2xl font-[1000] text-[var(--text-heading)] tracking-tighter">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-4">
               {faqs.map((faq, i) => (
                 <div key={i} className="bg-[var(--bg-surface)] rounded-2xl overflow-hidden border border-gray-50 flex flex-col">
                   <button 
                     onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                     className="p-6 flex items-center justify-between gap-4 text-left"
                   >
                     <span className="text-sm md:text-base font-black text-[var(--text-heading)]">{faq.q}</span>
                     {activeFaq === i ? <ChevronUp size={20} className="text-[var(--brand-primary)]" /> : <ChevronDown size={20} className="text-gray-300" />}
                   </button>
                   <AnimatePresence>
                     {activeFaq === i && (
                       <motion.div 
                         initial={{ height: 0, opacity: 0 }}
                         animate={{ height: "auto", opacity: 1 }}
                         exit={{ height: 0, opacity: 0 }}
                         className="px-6 pb-6"
                       >
                         <p className="text-sm font-bold text-[var(--text-muted)] leading-relaxed">
                           {faq.a}
                         </p>
                       </motion.div>
                     )}
                   </AnimatePresence>
                 </div>
               ))}
            </div>

            <div className="mt-12 text-center">
               <a href="https://m.me/dseoriginals" target="_blank" className="inline-flex items-center gap-3 px-8 py-4 bg-white border border-gray-100 rounded-2xl font-black text-xs uppercase tracking-widest text-[var(--text-heading)] shadow-sm hover:shadow-md transition-all">
                  <MessageSquare size={16} /> Still have questions? Message Us
               </a>
            </div>
          </div>
        </div>
      </section>

      {/* BULK ORDERING SECTION */}
      <section id="apply-form" className="pb-32 px-4 md:px-0">
        <div className="container max-w-7xl mx-auto">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-14 border border-[var(--border-light)] shadow-2xl relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--brand-soft)]/5 rounded-full blur-3xl -mr-40 -mt-40"></div>
            
            <div className="relative z-10">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--brand-soft)]/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)] mb-4">
                  Partner Pricing Enabled
                </div>
                <h2 className="text-4xl font-[1000] text-[var(--text-heading)] tracking-tighter">Bulk Order Dispatch</h2>
                <p className="text-sm font-bold text-[var(--text-muted)] mt-2">Select your inventory at exclusive reseller rates.</p>
              </div>

              {/* DYNAMIC BULK SHOP */}
              <BulkOrderShop />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function BulkOrderShop() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState<any>({}) // variantId -> qty
  const [submitting, setSubmitting] = useState(false)

  const MIN_ORDER = 3000 // ₱3,000 Minimum for Resellers

  useState(() => {
    const fetchProducts = async () => {
      try {
        const data = await (await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/products/all`)).json()
        setProducts(data || [])
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  })

  const updateQty = (vid: string, delta: number, stock: number) => {
    const current = cart[vid] || 0
    const next = Math.max(0, current + delta)
    if (next > stock) {
       toast.error("Stock limit reached")
       return
    }
    setCart({ ...cart, [vid]: next })
  }

  const totals = products.reduce((acc, p) => {
    p.variants.forEach((v: any) => {
      const qty = cart[v.id] || 0
      if (qty > 0) {
        acc.amount += qty * Number(v.resellerPrice || v.price * 0.8)
        acc.count += qty
        acc.srpAmount += qty * Number(v.price)
      }
    })
    return acc
  }, { amount: 0, count: 0, srpAmount: 0 })

  const handleCheckout = async () => {
    if (totals.amount < MIN_ORDER) {
      toast.error(`Minimum reseller order is ₱${MIN_ORDER.toLocaleString()}`)
      return
    }
    setSubmitting(true)
    // Redirect to checkout with special reseller flag
    toast.success("Redirecting to secure bulk checkout...")
    setTimeout(() => {
        // Here we would normally redirect to /checkout?type=reseller and pass the items
        window.location.href = `/cart` // For now, redirect to cart to see items
    }, 1500)
  }

  if (loading) return <div className="py-20 text-center font-bold text-[var(--text-muted)]">Initializing Partner Catalog...</div>

  return (
    <div className="space-y-12">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <div key={product.id} className="bg-[var(--bg-surface)] p-6 rounded-3xl border border-gray-50 flex flex-col gap-6">
            <div className="flex gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0 border border-gray-100">
                <img src={product.images?.[0]?.url?.includes('http') ? product.images[0].url : `https://res.cloudinary.com/dm67pbgon/image/upload/v1/${product.images?.[0]?.url}`} className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="font-black text-[var(--text-heading)] leading-tight">{product.name}</h4>
                <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{product.category?.name}</p>
              </div>
            </div>

            <div className="space-y-3">
              {product.variants.map((v: any) => {
                const qty = cart[v.id] || 0
                const price = Number(v.resellerPrice || v.price * 0.8)
                const srp = Number(v.price)
                
                return (
                  <div key={v.id} className={`p-4 rounded-2xl transition-all ${qty > 0 ? "bg-white border-[var(--brand-primary)] shadow-md" : "bg-white/40 border-transparent opacity-80"}`}>
                    <div className="flex justify-between items-center mb-3">
                       <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                            {v.attributes?.map((a: any) => a.value).join("/") || "Standard"}
                          </p>
                          <div className="flex items-center gap-2">
                             <span className="text-sm font-black text-[var(--brand-primary)]">₱{price.toLocaleString()}</span>
                             <span className="text-[10px] font-bold text-gray-300 line-through">₱{srp.toLocaleString()}</span>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className={`text-[8px] font-bold ${v.stock > 10 ? "text-emerald-500" : "text-amber-500"}`}>{v.stock} pcs</p>
                       </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                       <button onClick={() => updateQty(v.id, -1, v.stock)} className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"><Minus size={14} /></button>
                       <span className="font-black text-xs w-8 text-center">{qty}</span>
                       <button onClick={() => updateQty(v.id, 1, v.stock)} className="w-8 h-8 rounded-lg bg-[var(--brand-primary)] text-white flex items-center justify-center hover:brightness-110 shadow-lg shadow-[var(--brand-primary)]/10 transition-all"><Plus size={14} /></button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* STICKY SUMMARY BAR */}
      <div className="sticky bottom-0 bg-white/80 backdrop-blur-xl -mx-8 md:-mx-14 p-6 md:px-14 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 z-30 shadow-[0_-20px_40px_rgba(0,0,0,0.05)]">
         <div className="flex gap-8">
            <div className="text-center md:text-left">
               <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Items Selected</p>
               <p className="text-xl font-[1000] text-[var(--text-heading)]">{totals.count} pcs</p>
            </div>
            <div className="text-center md:text-left">
               <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Bulk Value</p>
               <p className="text-xl font-[1000] text-[var(--brand-primary)]">₱{totals.amount.toLocaleString()}</p>
            </div>
            <div className="hidden lg:block text-left">
               <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1">You Save</p>
               <p className="text-xl font-[1000] text-emerald-500">₱{(totals.srpAmount - totals.amount).toLocaleString()}</p>
            </div>
         </div>

         <div className="flex flex-col items-center md:items-end gap-3 w-full md:w-auto">
            {totals.amount < MIN_ORDER ? (
              <p className="text-[9px] font-black uppercase tracking-widest text-amber-500">Add ₱{(MIN_ORDER - totals.amount).toLocaleString()} more to unlock reseller pricing</p>
            ) : (
              <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1"><ShieldCheck size={10} /> Wholesale Minimum Met</p>
            )}
            
            <button 
              onClick={handleCheckout}
              disabled={totals.amount < MIN_ORDER || submitting}
              className={`px-12 py-5 rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all ${totals.amount >= MIN_ORDER ? "bg-[var(--brand-primary)] text-white shadow-[var(--brand-primary)]/20 hover:scale-105 active:scale-95" : "bg-gray-100 text-gray-300 cursor-not-allowed"}`}
            >
              Check Out Bulk Order
            </button>
         </div>
      </div>
    </div>
  )
}

function Plus({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
}

function Minus({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
}

    </div>
  )
}
