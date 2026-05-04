"use client"

import { useState, useRef, useEffect } from "react"
import { useCart } from "@/context/CartContext"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/lib/api"
import { regions, provinces, cities } from "philippines"
import { Truck, Store, CreditCard, Check, Package, MapPin, ChevronDown, Home, Briefcase, Gift, Coins } from "lucide-react"
import { getShippingRate, calculateWeight, calculateShippingTotal, ShippingZone } from "@/lib/shipping"
import PaymentModal from "@/components/PaymentModal"
import toast from "react-hot-toast"
import { motion, AnimatePresence } from "framer-motion"

import CheckoutSkeleton from "@/components/ui/CheckoutSkeleton"

/* ============================ TYPES ============================ */

type Step = 1 | 2 | 3
type DeliveryMethod = "delivery" | "pickup"
type Option = { value: string; label: string }
type InputProps = { label: string; value: string; onChange: (v: string) => void; type?: string }
type SelectProps = { value: string; onChange: (v: string, o?: Option) => void; options: Option[]; placeholder: string; disabled?: boolean }

const STORE_ADDRESS = "Chancery Compound, Rizal St, Tagum, 8100 Davao del Norte"
const STORE_HOURS = "Mon–Sat, 9 AM – 6 PM"

/* ============================ PAGE ============================ */

export default function CheckoutPage() {
  const { cart, selectedItems, removeFromCart } = useCart()
  const { user, loading: authLoading } = useAuth()
  const itemsToCheckout = cart.filter(item => selectedItems.includes(item.cartKey || item.variantId))

  const [step, setStep] = useState<Step>(1)
  const [delivery, setDelivery] = useState<DeliveryMethod>("delivery")
  const [loading, setLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [shipping, setShipping] = useState<ShippingZone | null>(null)
  const [showPayment, setShowPayment] = useState(false)
  const [paymentUrl, setPaymentUrl] = useState("")

  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    street: "", barangay: "", city: "", province: "", region: "",
  })

  const [selectedRegion, setSelectedRegion] = useState("")
  const [selectedProvince, setSelectedProvince] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [regionLabel, setRegionLabel] = useState("")

  const [savedAddresses, setSavedAddresses] = useState<any[]>([])
  const [showAddressBook, setShowAddressBook] = useState(false)

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [step])

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        fetchSavedAddresses()
        setForm(p => ({ ...p, name: user.name || "", email: user.email || "", phone: user.phone || "" }))
      } else {
        setIsInitializing(false)
      }
    }
  }, [user, authLoading])

  async function fetchSavedAddresses() {
    try {
      const data = await api.get("/user/me/addresses")
      setSavedAddresses(data || [])
      
      const def = data?.find((a: any) => a.isDefault)
      if (def) applySavedAddress(def)
    } catch (err) {
      console.error("Failed to load saved addresses")
    } finally {
      setIsInitializing(false)
    }
  }

  function applySavedAddress(addr: any) {
    const r = (regions as any[]).find(x => x.name === addr.region)
    const p = (provinces as any[]).find(x => x.name === addr.province)
    
    setForm({
      name: addr.fullName,
      email: user?.email || "",
      phone: addr.phone,
      street: addr.street,
      barangay: addr.barangay,
      region: addr.region,
      province: addr.province,
      city: addr.city
    })
    
    if (r) {
      setSelectedRegion(r.key)
      setRegionLabel(r.name)
    }
    if (p) setSelectedProvince(p.key)
    setSelectedCity(addr.city)
    setShowAddressBook(false)
  }

  const subtotal = itemsToCheckout.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const baseShippingFee = delivery === "pickup" ? 0 : (shipping?.fee ?? 0)
  const shippingFee = calculateShippingTotal(baseShippingFee, itemsToCheckout)
  const totalWeight = calculateWeight(itemsToCheckout)
  
  // Loyalty Points Logic
  const userPoints = (user as any)?.luckyPoints || 0
  const [usePoints, setUsePoints] = useState(false)
  const pointsDiscount = usePoints ? Math.min(userPoints, subtotal) : 0
  const pointsEarned = Math.floor(subtotal / 100)
  
  const total = subtotal + shippingFee - pointsDiscount

  const isDetailsValid = !!(
    form.name && 
    form.email && 
    form.phone && 
    form.phone.startsWith("09") &&
    form.phone.length === 11 &&
    (delivery === "pickup" || (form.street && form.barangay && selectedRegion && selectedProvince && selectedCity))
  )

  const filteredProvinces = (provinces as any[]).filter(p => String(p.region) === String(selectedRegion))
  const filteredCities = (cities as any[]).filter(c => String(c.province) === String(selectedProvince))

  /* ── Step 2 → 3: Validation & Proceed ── */
  const goToPayment = async () => {
    // Final Phone Check
    if (!form.phone.startsWith("09") || form.phone.length !== 11) {
      return toast.error("Phone number must start with 09 and be exactly 11 digits.")
    }

    // Required Field check for Home Delivery
    if (delivery === "delivery") {
      if (!form.street || !form.barangay || !selectedRegion || !selectedProvince || !selectedCity) {
        return toast.error("Please complete all shipping address fields.")
      }
    }

    if (!form.name || !form.email) {
      return toast.error("Please provide your name and email address.")
    }

    if (delivery === "delivery" && selectedRegion) {
      setShipping(getShippingRate(selectedRegion))
    } else {
      setShipping(null)
    }
    setStep(3)
  }

  /* ============================ SUBMIT ============================ */

  const handlePlaceOrder = async () => {
    if (!isDetailsValid || loading) return
    if (total <= 0) return toast.error("Your cart total must be greater than ₱0 to checkout.")
    setError(null)
    setLoading(true)

    try {
      const data = await api.post("/orders/checkout", {
        items: itemsToCheckout.map(item => ({
          variantId: typeof item.variantId === "string"
            ? item.variantId
            : ((item.variantId as any)?.id || (item.variantId as any)?.variantId || (item.variantId as any)?.[0]?.variantId || (item.variantId as any)?.[0]?.id || ""),
          quantity: item.quantity,
          attributes: item.attributes || [] // ✅ Pass attributes
        })),
        deliveryMethod: delivery,
        shippingFee,
        pointsToUse: usePoints ? Math.floor(pointsDiscount) : 0,
        guestName: form.name,
        address: delivery === "delivery" ? {
          fullName: form.name,
          phone: form.phone,
          region: form.region,
          province: form.province,
          city: form.city,
          barangay: form.barangay,
          street: form.street,
        } : {
          fullName: form.name,
          phone: form.phone,
          // Placeholder for pickup
          region: "Store Pickup",
          province: "Store Pickup",
          city: "Tagum",
          barangay: "Tagum",
          street: "Store Pickup"
        },
      })

      setPaymentUrl(data.invoiceUrl)
      setShowPayment(true)
      toast.success("Order created! Redirecting to payment...")

    } catch (err: any) {
      console.error("Checkout Error:", err)
      const msg = err.message || "Checkout failed. Please try again."
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  /* ============================ STEP INDICATOR ============================ */

  const steps = ["Delivery", "Details", "Payment"]

  if (isInitializing) return <CheckoutSkeleton />

  return (
    <div className="bg-[var(--bg-main)] min-h-screen pb-32">
      <div className="max-w-5xl mx-auto px-4 py-6 md:py-10">

        <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-heading)] tracking-tight mb-6">
          Checkout
        </h1>

        {/* STEP INDICATOR */}
        <div className="flex items-center mb-8 px-2">
          {steps.map((label, i) => {
            const num = (i + 1) as Step
            const done = step > num
            const active = step === num
            return (
              <div key={label} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-[10px] md:text-sm font-bold border-2 transition-all ${done ? "bg-[var(--brand-primary)] border-[var(--brand-primary)] text-white"
                    : active ? "border-[var(--brand-primary)] text-[var(--brand-primary)] bg-white"
                      : "border-gray-200 text-gray-400 bg-white"
                    }`}>
                    {done ? <Check className="w-3 h-3 md:w-[14px] md:h-[14px]" /> : num}
                  </div>
                  <span className={`text-[8px] md:text-[10px] font-black mt-1.5 tracking-wider uppercase ${active ? "text-[var(--brand-primary)]" : "text-[var(--text-muted)]"}`}>
                    {label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-[2px] mx-1 md:mx-2 mb-4 rounded transition-all ${step > num ? "bg-[var(--brand-primary)]" : "bg-gray-200"}`} />
                )}
              </div>
            )
          })}
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-6 md:gap-10">
          <div className="space-y-4">

            {/* ===== STEP 1: DELIVERY METHOD ===== */}
            {step === 1 && (
              <Card title="1. How would you like to receive your order?">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">

                  <button
                    onClick={() => setDelivery("delivery")}
                    className={`p-5 rounded-2xl border-2 text-left transition-all ${delivery === "delivery"
                      ? "border-[var(--brand-primary)] bg-[var(--brand-soft)]/10 shadow-sm"
                      : "border-[var(--border-light)] hover:border-gray-300"
                      }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${delivery === "delivery" ? "bg-[var(--brand-primary)] text-white" : "bg-gray-100 text-gray-500"}`}>
                      <Truck size={20} />
                    </div>
                    <div className="font-bold text-[var(--text-heading)] text-sm">Home Delivery</div>
                    <div className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                      We'll ship via <strong>J&T Express</strong> to your door.<br />
                      <span className="font-semibold text-[var(--brand-primary)]">Shipping fee calculated by region.</span>
                    </div>
                    <RadioDot active={delivery === "delivery"} />
                  </button>

                  <button
                    onClick={() => setDelivery("pickup")}
                    className={`p-5 rounded-2xl border-2 text-left transition-all ${delivery === "pickup"
                      ? "border-[var(--brand-primary)] bg-[var(--brand-soft)]/10 shadow-sm"
                      : "border-[var(--border-light)] hover:border-gray-300"
                      }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${delivery === "pickup" ? "bg-[var(--brand-primary)] text-white" : "bg-gray-100 text-gray-500"}`}>
                      <Store size={20} />
                    </div>
                    <div className="font-bold text-[var(--text-heading)] text-sm">Store Pickup</div>
                    <div className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                      Pick up at our store in Tagum.<br />
                      <span className="font-semibold text-emerald-600">FREE — No shipping fee</span>
                    </div>
                    <RadioDot active={delivery === "pickup"} />
                  </button>
                </div>

                {delivery === "pickup" && (
                  <div className="mt-4 p-4 bg-[var(--brand-soft)]/10 border border-[var(--brand-soft)] rounded-2xl text-sm">
                    <p className="font-bold text-[var(--brand-primary)]">📍 {STORE_ADDRESS}</p>
                    <p className="text-[var(--text-muted)] mt-1 text-xs">Hours: {STORE_HOURS}</p>
                  </div>
                )}

                <button onClick={() => setStep(2)} className="btn-premium w-full !py-3.5 mt-6 shadow-md">
                  Continue to Details →
                </button>
              </Card>
            )}

            {/* ===== STEP 2: CONTACT + ADDRESS ===== */}
            {step === 2 && (
              <Card title={delivery === "delivery" ? "2. Shipping Details" : "2. Contact & Pickup Info"}>
                {error && <ErrorBox message={error} />}

                {/* ADDRESS BOOK SELECTOR */}
                {user && savedAddresses.length > 0 && (
                  <div className="mb-6">
                    <button 
                      onClick={() => setShowAddressBook(!showAddressBook)}
                      className="w-full flex items-center justify-between p-4 bg-white border-2 border-dashed border-gray-200 rounded-2xl hover:border-[var(--brand-primary)] hover:bg-[var(--brand-soft)]/5 transition-all text-left"
                    >
                      <div className="flex items-center gap-3">
                        <MapPin size={20} className="text-[var(--brand-primary)]" />
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)]">Select from Address Book</p>
                          <p className="text-xs font-bold text-gray-500">Pick a saved shipment destination</p>
                        </div>
                      </div>
                      <ChevronDown size={20} className={`text-gray-300 transition-transform ${showAddressBook ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {showAddressBook && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3"
                        >
                          {savedAddresses.map(addr => (
                            <button 
                              key={addr.id}
                              onClick={() => applySavedAddress(addr)}
                              className="p-4 rounded-2xl border-2 border-transparent bg-white hover:border-[var(--brand-primary)] hover:shadow-md transition-all text-left group shadow-sm ring-1 ring-gray-100"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 bg-gray-50 rounded-lg group-hover:bg-[var(--brand-soft)]/20 transition-colors">
                                  {addr.label === 'Work' ? <Briefcase size={14} className="text-gray-400 group-hover:text-[var(--brand-primary)]" /> : <Home size={14} className="text-gray-400 group-hover:text-[var(--brand-primary)]" />}
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-[var(--brand-primary)]">{addr.label || 'Home'}</span>
                              </div>
                              <p className="text-xs font-black text-[var(--text-heading)] line-clamp-1">{addr.fullName}</p>
                              <p className="text-[10px] font-bold text-gray-400 mt-1 line-clamp-1">{addr.street}, {addr.city}</p>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                <Input label="Full Name *" value={form.name} onChange={v => setForm(p => ({ ...p, name: v }))} />
                <Input label="Email Address *" type="email" value={form.email} onChange={v => setForm(p => ({ ...p, email: v }))} />
                <Input 
                  label="Phone (09...) *" 
                  value={form.phone} 
                  onChange={v => {
                      const numeric = v.replace(/\D/g, "").slice(0, 11)
                      setForm(p => ({ ...p, phone: numeric }))
                  }} 
                />

                {delivery === "delivery" && (
                  <>
                    <Input label="Street Address *" value={form.street} onChange={v => setForm(p => ({ ...p, street: v }))} />

                    <SearchableSelect
                      value={selectedRegion}
                      onChange={(v, o) => {
                        setSelectedRegion(String(v))
                        setSelectedProvince("")
                        setSelectedCity("")
                        setRegionLabel(o?.label ?? "")
                        setForm(p => ({ ...p, region: String(v), province: "", city: "" }))
                      }}
                      options={(regions as any[]).map(r => ({ value: String(r.key), label: r.name }))}
                      placeholder="Search Region *"
                    />

                    {/* LIVE SHIPPING PREVIEW after region is selected */}
                    {selectedRegion && (
                      <ShippingPreview zone={getShippingRate(selectedRegion)} regionLabel={regionLabel} />
                    )}

                    <SearchableSelect
                      value={selectedProvince}
                      disabled={!selectedRegion}
                      onChange={v => {
                        setSelectedProvince(String(v))
                        setSelectedCity("")
                        setForm(p => ({ ...p, province: String(v), city: "" }))
                      }}
                      options={filteredProvinces.map(p => ({ value: String(p.key), label: p.name }))}
                      placeholder="Search Province *"
                    />
                    <SearchableSelect
                      value={selectedCity}
                      disabled={!selectedProvince}
                      onChange={(v, o) => {
                        setSelectedCity(String(v))
                        setForm(p => ({ ...p, city: String(v) }))
                      }}
                      options={filteredCities.map((c, i) => ({ value: `${c.key}-${i}`, label: c.name }))}
                      placeholder="Search City/Municipality *"
                    />
                    <Input 
                      label="Barangay *" 
                      value={form.barangay} 
                      onChange={v => setForm(p => ({ ...p, barangay: v }))} 
                    />
                  </>
                )}

                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(1)} className="btn-outline flex-1 !py-3">← Back</button>
                  <button
                    onClick={goToPayment}
                    disabled={!isDetailsValid}
                    className="btn-premium flex-[2] !py-3 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    Continue to Payment →
                  </button>
                </div>
              </Card>
            )}

            {/* ===== STEP 3: PAYMENT + SHIPPING SUMMARY ===== */}
            {step === 3 && (
              <Card title="3. Payment">
                {error && <ErrorBox message={error} />}

                {/* Shipping breakdown card (delivery only) */}
                {delivery === "delivery" && shipping && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-2 text-sm">
                    <div className="flex items-center gap-2 font-bold text-[var(--brand-primary)]">
                      <Package size={16} /> J&T Express Shipping Quote
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs font-semibold mt-2">
                      <span className="text-[var(--text-muted)]">Destination zone</span>
                      <span>Zone {shipping.zone} — {shipping.label}</span>
                      <span className="text-[var(--text-muted)]">Est. transit</span>
                      <span>{shipping.etaDays} business days</span>
                      <span className="text-[var(--text-muted)]">Courier</span>
                      <span>J&T Express Philippines</span>
                      <span className="text-[var(--text-muted)]">Shipping fee</span>
                      <span className="text-[var(--brand-primary)] font-bold text-sm">₱{shipping.fee.toLocaleString()}</span>
                    </div>
                    <p className="text-[9px] text-[var(--text-muted)] pt-1 border-t border-blue-200">
                      * Base rate covers ≤1kg. Your order is est. <strong>{calculateWeight(itemsToCheckout).toFixed(2)}kg</strong>. 
                      Additional ₱45 applies per extra kilo.
                    </p>
                  </div>
                )}

                {delivery === "pickup" && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-sm font-semibold text-emerald-700">
                    🏪 Store Pickup — <strong>No shipping fee.</strong><br />
                    <span className="text-xs font-medium text-emerald-600 mt-1 block">{STORE_ADDRESS}</span>
                  </div>
                )}

                {/* Payment method */}
                <div className="p-5 rounded-2xl border-2 border-[var(--brand-primary)] bg-[var(--brand-soft)]/10 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[var(--brand-primary)] flex items-center justify-center text-white flex-shrink-0">
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-[var(--text-heading)]">GCash / Maya / Card</div>
                      <div className="text-xs text-[var(--text-muted)] mt-0.5">Secure payment via Xendit. Redirect on next step.</div>
                    </div>
                    <RadioDot active={true} />
                  </div>
                </div>

                {/* Loyalty Points Redemption */}
                {user && userPoints > 0 && (
                  <div className={`p-5 rounded-2xl border-2 transition-all ${usePoints ? 'border-emerald-500 bg-emerald-50' : 'border-[var(--border-light)] bg-white'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${usePoints ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                          <Gift size={20} />
                        </div>
                        <div>
                          <div className="font-bold text-[var(--text-heading)] text-sm">Redeem Lucky Points</div>
                          <div className="text-xs text-[var(--text-muted)] mt-0.5">You have ₱{userPoints.toLocaleString()} available</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => setUsePoints(!usePoints)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${usePoints ? 'bg-emerald-500 text-white' : 'bg-[var(--brand-soft)] text-[var(--brand-primary)]'}`}
                      >
                        {usePoints ? 'Applied' : 'Redeem Now'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Order total recap */}
                <div className="p-4 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-light)] space-y-2 text-sm font-semibold text-[var(--text-main)]">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Delivery</span>
                    <span>{delivery === "pickup" ? "🏪 Store Pickup" : "🚚 Home Delivery (J&T)"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Subtotal</span>
                    <span>₱{subtotal.toLocaleString()}</span>
                  </div>
                  {usePoints && (
                    <div className="flex justify-between text-emerald-600">
                      <span className="text-[var(--text-muted)]">Points Discount</span>
                      <span>-₱{pointsDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Shipping</span>
                    <span className={shippingFee === 0 ? "text-emerald-600 font-bold" : "text-[var(--brand-primary)] font-bold"}>
                      {shippingFee === 0 ? "FREE" : `₱${shippingFee.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-[var(--brand-primary)] pt-2 border-t border-[var(--border-light)]">
                    <span>Total</span>
                    <span>₱{total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <button onClick={() => setStep(2)} className="btn-outline flex-1 !py-3">← Back</button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="btn-premium flex-[2] !py-3 shadow-md"
                  >
                    {loading ? "Redirecting to payment..." : `Pay ₱${total.toLocaleString()} Now →`}
                  </button>
                </div>
              </Card>
            )}
          </div>

          {/* ORDER SUMMARY SIDEBAR */}
          <div className="lg:sticky lg:top-24 h-fit space-y-4">
            <Card title="Order Summary">
              <div className="flex flex-col gap-3 max-h-[30vh] overflow-y-auto pr-1">
                {itemsToCheckout.map(item => (
                  <div key={item.variantId} className="flex gap-3 items-center border-b border-[var(--border-light)] pb-3 last:border-0 last:pb-0">
                    <div className="w-14 h-14 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-light)] overflow-hidden flex-shrink-0 relative">
                      <img src={item.image || "/placeholder.png"} alt={item.name} className="object-cover w-full h-full" />
                      <div className="absolute -top-1.5 -right-1.5 bg-[var(--brand-primary)] text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold">{item.quantity}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-[var(--text-heading)] line-clamp-1">{item.name}</h4>
                      {item.attributes && item.attributes.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {item.attributes.map((a: any, i: number) => (
                            <span key={i} className="text-[8px] font-black uppercase tracking-tighter text-[var(--brand-primary)] opacity-60">
                              {a.name}: {a.value}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-[var(--text-muted)] font-semibold mt-0.5">₱{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-[var(--border-light)] mt-3 pt-4 space-y-2 text-sm font-semibold text-[var(--text-main)]">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Subtotal</span>
                  <span>₱{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Shipping</span>
                  <span className={shippingFee === 0 && step === 3 ? "text-emerald-600 font-bold" : "text-[var(--text-muted)]"}>
                    {step < 3
                      ? (delivery === "pickup" ? "FREE (Pickup)" : "Calculated in step 3")
                      : shippingFee === 0 ? "FREE" : `₱${shippingFee.toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between text-base text-[var(--brand-primary)] font-bold pt-2 border-t border-dashed border-[var(--border-light)]">
                  <span>Total</span>
                  <span>{step < 3 && delivery === "delivery" ? `₱${subtotal.toLocaleString()}+` : `₱${total.toLocaleString()}`}</span>
                </div>

                {delivery === "delivery" && (
                  <div className="flex justify-between mt-2 pt-2 border-t border-[var(--border-light)]">
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Est. Weight</span>
                    <span className="text-[10px] font-black text-[var(--text-heading)]">{totalWeight.toFixed(2)} kg</span>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-[var(--border-light)] flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-[var(--brand-soft)]" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Lucky Points Earned</span>
                   </div>
                   <span className="text-xs font-black text-[var(--brand-primary)]">+{pointsEarned}</span>
                </div>
                <p className="text-[8px] text-center text-gray-400 font-bold mt-2 uppercase tracking-tighter">Every ₱100 spent = 1 Lucky Point</p>
              </div>
            </Card>
          </div>
        </div>

        <PaymentModal
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          invoiceUrl={paymentUrl}
          total={total}
        />
      </div>
    </div>
  )
}

/* ============================ SHIPPING PREVIEW ============================ */

function ShippingPreview({ zone, regionLabel }: { zone: ShippingZone; regionLabel: string }) {
  return (
    <div className="flex items-center justify-between bg-[var(--brand-soft)]/10 border border-[var(--brand-soft)] rounded-xl px-4 py-3 text-sm animate-fade-up">
      <div>
        <p className="font-bold text-[var(--brand-primary)] text-xs uppercase tracking-wider">J&T Express Estimate</p>
        <p className="text-[var(--text-muted)] text-xs mt-0.5">{zone.etaDays} business days · Zone {zone.zone}</p>
      </div>
      <div className="text-right">
        <p className="font-extrabold text-[var(--brand-primary)] text-base">₱{zone.fee.toLocaleString()}</p>
        <p className="text-[10px] text-[var(--text-muted)]">shipping fee</p>
      </div>
    </div>
  )
}

/* ============================ SEARCHABLE SELECT ============================ */

function SearchableSelect({ value, onChange, options, placeholder, disabled }: SelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filtered = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
  const selected = options.find(o => String(o.value) === String(value))

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(p => !p)}
        className="w-full px-5 py-3.5 border border-[var(--border-light)] bg-[var(--bg-surface)] hover:bg-[var(--bg-main)] rounded-xl text-left transition-colors font-medium text-[var(--text-heading)] focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent outline-none disabled:opacity-50"
      >
        {selected?.label || placeholder}
      </button>
      {open && (
        <div className="absolute z-50 w-full bg-white border rounded-xl mt-2 shadow-lg max-h-52 overflow-y-auto">
          <input
            autoFocus
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-4 py-3 border-b border-[var(--border-light)] outline-none bg-gray-50 text-[var(--text-heading)] text-sm font-medium sticky top-0"
          />
          {filtered.map(o => (
            <div
              key={`${o.value}-${o.label}`}
              onMouseDown={() => { onChange(String(o.value), o); setOpen(false); setSearch("") }}
              className="px-4 py-3 hover:bg-[var(--bg-main)] cursor-pointer text-sm font-semibold text-[var(--text-main)] transition-colors"
            >
              {o.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ============================ COMPONENTS ============================ */

function Input({ label, value, onChange, type = "text" }: InputProps) {
  return (
    <input
      type={type}
      placeholder={label}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-5 py-3.5 rounded-xl border border-[var(--border-light)] bg-[var(--bg-surface)] hover:border-gray-300 transition-colors font-medium text-[var(--text-heading)] focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent outline-none"
    />
  )
}

function RadioDot({ active }: { active: boolean }) {
  return (
    <div className={`mt-3 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-auto ${active ? "border-[var(--brand-primary)]" : "border-gray-300"}`}>
      {active && <div className="w-2.5 h-2.5 bg-[var(--brand-primary)] rounded-full" />}
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[var(--bg-card)] p-5 md:p-7 rounded-3xl border border-[var(--border-light)] shadow-sm drop-shadow-sm space-y-3">
      <h2 className="text-base font-bold text-[var(--text-heading)] border-b border-[var(--border-light)] pb-3 tracking-wide">{title}</h2>
      <div className="pt-1 space-y-3">{children}</div>
    </div>
  )
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm font-bold shadow-sm flex items-center gap-3">
      <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" /> {message}
    </div>
  )
}