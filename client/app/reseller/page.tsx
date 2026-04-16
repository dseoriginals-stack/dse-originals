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

      {/* APPLICATION FORM SECTION */}
      <section id="apply-form" className="pb-32 px-4 md:px-0">
        <div className="container max-w-4xl mx-auto">
          <div className="bg-white rounded-[2.5rem] p-10 md:p-14 border border-[var(--border-light)] shadow-2xl relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--brand-soft)]/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
            
            <div className="relative z-10">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--brand-soft)]/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)] mb-4">
                  Ready to Start?
                </div>
                <h2 className="text-3xl font-[1000] text-[var(--text-heading)] tracking-tighter">Reseller Application Form</h2>
                <p className="text-sm font-bold text-[var(--text-muted)] mt-2">Personalize your journey as a DSE partner.</p>
              </div>

              <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Full Name</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="e.g. Maria Clara"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="w-full px-6 py-4 rounded-2xl border-2 border-[var(--bg-surface)] bg-[var(--bg-surface)] focus:border-[var(--brand-primary)] focus:bg-white outline-none transition-all font-bold text-[var(--text-heading)]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Email Connection</label>
                  <input 
                    required 
                    type="email" 
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-6 py-4 rounded-2xl border-2 border-[var(--bg-surface)] bg-[var(--bg-surface)] focus:border-[var(--brand-primary)] focus:bg-white outline-none transition-all font-bold text-[var(--text-heading)]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Phone Number</label>
                  <input 
                    required 
                    type="tel" 
                    placeholder="09xx xxx xxxx"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-6 py-4 rounded-2xl border-2 border-[var(--bg-surface)] bg-[var(--bg-surface)] focus:border-[var(--brand-primary)] focus:bg-white outline-none transition-all font-bold text-[var(--text-heading)]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Facebook Profile Link</label>
                  <input 
                    required 
                    type="url" 
                    placeholder="facebook.com/username"
                    value={formData.facebook}
                    onChange={(e) => setFormData({...formData, facebook: e.target.value})}
                    className="w-full px-6 py-4 rounded-2xl border-2 border-[var(--bg-surface)] bg-[var(--bg-surface)] focus:border-[var(--brand-primary)] focus:bg-white outline-none transition-all font-bold text-[var(--text-heading)]"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Your Location</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="City, Province"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-6 py-4 rounded-2xl border-2 border-[var(--bg-surface)] bg-[var(--bg-surface)] focus:border-[var(--brand-primary)] focus:bg-white outline-none transition-all font-bold text-[var(--text-heading)]"
                  />
                </div>

                <div className="space-y-4 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Chosen Starter Package</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                     {[
                       { id: 'basic', label: 'Starter Kit', price: '₱3,000' },
                       { id: 'standard', label: 'Business Kit', price: '₱7,500' },
                       { id: 'premium', label: 'Elite Partner', price: '₱15,000' }
                     ].map((pkg) => (
                       <button
                         key={pkg.id}
                         type="button"
                         onClick={() => setFormData({...formData, package: pkg.id})}
                         className={`px-6 py-6 rounded-2xl border-2 text-left transition-all ${formData.package === pkg.id ? 'border-[var(--brand-primary)] bg-[var(--brand-soft)]/10' : 'border-gray-50 bg-[var(--bg-surface)] overflow-hidden'}`}
                       >
                         <p className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)] mb-1">{pkg.label}</p>
                         <p className="text-lg font-black text-[var(--text-heading)]">{pkg.price}</p>
                       </button>
                     ))}
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Briefly tell us about your interest in DSE</label>
                  <textarea 
                    rows={4}
                    placeholder="Tell us about yourself..."
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full px-6 py-4 rounded-2xl border-2 border-[var(--bg-surface)] bg-[var(--bg-surface)] focus:border-[var(--brand-primary)] focus:bg-white outline-none transition-all font-bold text-[var(--text-heading)] resize-none"
                  />
                </div>

                <div className="md:col-span-2 pt-6">
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="w-full py-6 bg-[var(--brand-primary)] text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-[var(--brand-primary)]/30 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                  >
                    {submitting ? "Sending Application..." : <><Send size={18} /> Submit Application</>}
                  </button>
                  <p className="text-[10px] font-bold text-gray-400 text-center mt-6 flex items-center justify-center gap-2">
                    <ShieldCheck size={14} className="text-emerald-500" /> Your information is secure and encrypted
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
