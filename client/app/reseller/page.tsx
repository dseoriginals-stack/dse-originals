"use client"

import { useState, useEffect } from "react"
import {
  CheckCircle2,
  Plus,
  Minus,
  TrendingUp,
  ShieldCheck,
  MessageSquare,
  LayoutDashboard,
  UserPlus,
  LogIn,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Send,
  ArrowRight
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import toast from "react-hot-toast"

export default function ResellerPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null)

  const faqs = [
    { q: "Is there a minimum order requirement?", a: "Yes, you must order at least 12 pieces to qualify for reseller pricing." },
    { q: "How much can I earn?", a: "Resellers enjoy high margins, giving you great income potential with ₱299 (55ml) and ₱199 (30ml) wholesale rates." },
    { q: "How do I pay?", a: "Payments are processed via GCash. After settling, just provide your reference number in the portal." },
    { q: "Do you ship nationwide?", a: "Yes! We ship across the Philippines through J&T Express." }
  ]

  return (
    <div className="min-h-screen bg-[var(--bg-main)]">

      {/* HERO SECTION */}
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
                  onClick={() => document.getElementById('apply-form')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full py-5 bg-[var(--brand-primary)] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[var(--brand-primary)]/20 hover:scale-105 transition-all flex items-center justify-center gap-3"
                >
                  <ArrowRight size={18} /> Order in Bulk Now
                </button>

                <div className="flex items-center gap-3 py-4">
                  <div className="h-px bg-gray-100 flex-1"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">or</span>
                  <div className="h-px bg-gray-100 flex-1"></div>
                </div>

                <Link href="/login" className="w-full py-5 bg-white border-2 border-gray-50 text-[var(--text-muted)] rounded-2xl font-black text-xs uppercase tracking-widest hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-all flex items-center justify-center gap-3">
                  <LogIn size={18} /> Login to Account
                </Link>
              </div>
            </div>

            {/* WHY & HOW COLUMNS */}
            <div className="lg:col-span-8 flex flex-col gap-8">
              <div className="bg-white rounded-[2.5rem] p-10 md:p-12 border border-[var(--border-light)] shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                  <TrendingUp className="text-[var(--brand-primary)]" size={32} />
                  <div>
                    <h2 className="text-2xl font-black text-[var(--text-heading)]">Why Become a Reseller?</h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Wholesale benefits unlocked.</p>
                  </div>
                </div>
                <div className="space-y-5">
                  {[
                    "Fixed Reseller Pricing – ₱299 for 55ml, ₱199 for 30ml.",
                    "Low Minimum Requirement – Only 12 items to start.",
                    "High Profit Margins – Earn significant income per bottle.",
                    "Full Marketing Support – Ready-to-use product photos.",
                    "Fast Nationwide Shipping – Reliable delivery via J&T Express."
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                      <p className="text-sm font-bold text-[var(--text-main)] italic">{benefit}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BULK ORDERING SECTION */}
      <section id="apply-form" className="pb-32 px-4 md:px-0">
        <div className="container max-w-7xl mx-auto">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-14 border border-[var(--border-light)] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--brand-soft)]/5 rounded-full blur-3xl -mr-40 -mt-40"></div>

            <div className="relative z-10">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--brand-soft)]/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)] mb-4">
                  Partner Dispatch Portal
                </div>
                <h2 className="text-4xl font-[1000] text-[var(--text-heading)] tracking-tighter">Bulk Order Perfumes</h2>
                <p className="text-sm font-bold text-[var(--text-muted)] mt-2">Mix and match any scent. Min 12 pcs required.</p>
              </div>

              <BulkOrderShop />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
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
                  <button onClick={() => setActiveFaq(activeFaq === i ? null : i)} className="p-6 flex items-center justify-between gap-4 text-left">
                    <span className="text-sm md:text-base font-black text-[var(--text-heading)]">{faq.q}</span>
                    {activeFaq === i ? <ChevronUp size={20} className="text-[var(--brand-primary)]" /> : <ChevronDown size={20} className="text-gray-300" />}
                  </button>
                  <AnimatePresence>
                    {activeFaq === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-6 pb-6">
                        <p className="text-sm font-bold text-[var(--text-muted)] leading-relaxed">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
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
  const [cart, setCart] = useState<any>({})
  const [step, setStep] = useState<"shop" | "payment">("shop")
  const [submitting, setSubmitting] = useState(false)

  const [paymentInfo, setPaymentInfo] = useState({
    name: "",
    email: "",
    phone: "",
    reference: ""
  })

  const MIN_QTY = 12

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/products/all`)
        const data = await res.json()
        setProducts(data?.filter((p: any) => p.category?.name?.toLowerCase().includes("perfume")) || [])
      } catch (err) {
        toast.error("Connecting to server...")
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const updateQty = (vid: string, delta: number, stock: number) => {
    const current = cart[vid] || 0
    const next = Math.max(0, current + delta)
    if (next > stock && delta > 0) {
      toast.error("Stock limit reached")
      return
    }
    setCart({ ...cart, [vid]: next })
  }

  const totals = products.reduce((acc, p) => {
    p.variants.forEach((v: any) => {
      const qty = cart[v.id] || 0
      if (qty > 0) {
        const is55ml = v.attributes?.some((a: any) => a.value.includes("55"))
        const price = is55ml ? 299 : 199
        acc.amount += qty * price
        acc.count += qty
        acc.srpAmount += qty * Number(v.price)
      }
    })
    return acc
  }, { amount: 0, count: 0, srpAmount: 0 })

  const handleProcessOrder = async () => {
    if (!paymentInfo.name || !paymentInfo.reference) {
      toast.error("Name and Reference required")
      return
    }
    setSubmitting(true)
    try {
      const orderItems = []
      for (const pid in cart) {
        if (cart[pid] > 0) {
          const product = products.find(p => p.variants.some((v: any) => v.id === pid))
          const variant = product?.variants.find((v: any) => v.id === pid)
          if (!variant) continue
          const is55ml = variant.attributes?.some((a: any) => a.value.includes("55"))
          orderItems.push({
            variantId: variant.id,
            quantity: cart[pid],
            price: is55ml ? 299 : 199,
          })
        }
      }

      await (await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/orders/manual`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: orderItems,
          guestName: paymentInfo.name,
          paymentMethod: "gcash",
          status: "pending",
          isManual: true,
          trackingNo: `REB-${Date.now().toString().slice(-6)}`
        })
      })).json()

      toast.success("Order submitted! Verification in progress.")
      setCart({}); setStep("shop"); setPaymentInfo({ name: "", email: "", phone: "", reference: "" })
    } catch (err) {
      toast.error("Sync error. Try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="py-20 text-center font-black text-[var(--brand-primary)] animate-pulse uppercase tracking-widest text-xs">Syncing Partner Catalog...</div>

  if (step === "payment") {
    return (
      <div className="max-w-xl mx-auto space-y-8 animate-fade-in py-10">
        <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[2rem] text-center">
          <h3 className="text-xl font-black text-emerald-700">Payment Verification</h3>
          <p className="text-sm font-bold text-emerald-600/70 mt-2">Send ₱{totals.amount.toLocaleString()} to finalize bulk order.</p>
        </div>
        <div className="bg-[var(--bg-surface)] p-8 rounded-[2rem] border border-[var(--border-light)]">
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-4">Official Payment Details</p>
          <p className="text-lg font-black text-[var(--text-heading)]">GCASH: <span className="text-[var(--brand-primary)]">0917-888-2895</span></p>
          <p className="text-sm font-bold text-gray-400">Account: DSE Originals Shop</p>
        </div>
        <div className="grid gap-4">
          <input value={paymentInfo.name} onChange={e => setPaymentInfo({ ...paymentInfo, name: e.target.value })} className="w-full px-6 py-4 rounded-xl border bg-white font-bold" placeholder="Full Name" />
          <input value={paymentInfo.reference} onChange={e => setPaymentInfo({ ...paymentInfo, reference: e.target.value })} className="w-full px-6 py-4 rounded-xl border bg-white font-bold" placeholder="Reference No." />
        </div>
        <div className="flex gap-4">
          <button onClick={() => setStep("shop")} className="flex-1 py-5 rounded-2xl bg-gray-50 text-gray-400 font-black text-xs uppercase tracking-widest">Back</button>
          <button onClick={handleProcessOrder} disabled={submitting} className="flex-[2] py-5 rounded-2xl bg-[var(--brand-primary)] text-white font-black text-xs uppercase tracking-[0.2em]">
            {submitting ? "Verifying..." : "Confirm & Submit"}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-12 animate-fade-in">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <div key={product.id} className="bg-[var(--bg-surface)] p-6 rounded-3xl border border-gray-50 flex flex-col gap-6 shadow-sm">
            <div className="flex gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0 border border-gray-100">
                <img src={product.images?.[0]?.url?.includes('http') ? product.images[0].url : `https://res.cloudinary.com/dm67pbgon/image/upload/v1/${product.images?.[0]?.url}`} className="w-full h-full object-cover" />
              </div>
              <h4 className="font-black text-[var(--text-heading)] leading-tight">{product.name}</h4>
            </div>
            <div className="space-y-4">
              {product.variants.map((v: any) => {
                const qty = cart[v.id] || 0
                const is55ml = v.attributes?.some((a: any) => a.value.includes("55"))
                return (
                  <div key={v.id} className={`p-4 rounded-2xl transition-all border ${qty > 0 ? "bg-white border-[var(--brand-primary)] shadow-md" : "bg-white/40 border-transparent"}`}>
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-[10px] font-black uppercase text-gray-400">{v.attributes?.map((a: any) => a.value).join("/")}</p>
                      <span className="text-sm font-black text-[var(--brand-primary)]">₱{is55ml ? 299 : 199}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <button onClick={() => updateQty(v.id, -1, v.stock)} className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center"><Minus size={16} /></button>
                      <span className="font-black text-sm w-8 text-center">{qty}</span>
                      <button onClick={() => updateQty(v.id, 1, v.stock)} className="w-10 h-10 rounded-xl bg-[var(--brand-primary)] text-white flex items-center justify-center"><Plus size={16} /></button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="sticky bottom-0 bg-white/80 backdrop-blur-xl -mx-4 md:-mx-14 p-6 md:px-14 border-t flex items-center justify-between gap-6 z-40 shadow-2xl md:rounded-t-[2rem]">
        <div className="flex gap-12">
          <div><p className="text-[10px] font-black uppercase text-gray-400 mb-1">Items</p><p className="text-2xl font-[1000]">{totals.count} pcs</p></div>
          <div><p className="text-[10px] font-black uppercase text-gray-400 mb-1">Total</p><p className="text-2xl font-[1000] text-[var(--brand-primary)]">₱{totals.amount.toLocaleString()}</p></div>
        </div>
        <div className="flex flex-col items-end gap-3">
          {totals.count < MIN_QTY && <p className="text-[10px] font-black uppercase text-amber-500 bg-amber-50 px-3 py-1 rounded-lg">Add {MIN_QTY - totals.count} more to meet 12pcs</p>}
          <button onClick={() => setStep("payment")} disabled={totals.count < MIN_QTY} className={`px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all ${totals.count >= MIN_QTY ? "bg-[var(--brand-primary)] text-white shadow-xl hover:scale-105" : "bg-gray-100 text-gray-300 pointer-events-none"}`}>Checkout</button>
        </div>
      </div>
    </div>
  )
}
