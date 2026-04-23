"use client"

import { useState } from "react"
import { Heart, Loader2, ShieldCheck, Sparkles, Target, Users } from "lucide-react"
import { api } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import toast from "react-hot-toast"
import { motion } from "framer-motion"
import Image from "next/image"

export default function DonatePage() {
  const [customAmount, setCustomAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
 
  const handleDonate = async () => {
    const amount = Number(customAmount)
    if (!amount || amount <= 0) return toast.error("Please enter a valid amount")
    
    setLoading(true)
    try {
      const res: any = await api.post("/donations", {
        amount,
        email: user?.email || "anonymous@dseoriginals.com",
        name: user?.name || "Guest Contributor"
      })
      
      toast.success("Redirecting to secure payment...")
      window.location.href = res.invoiceUrl
    } catch (err: any) {
      toast.error(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const impacts = [
    {
      icon: <Target className="text-blue-500" size={24} />,
      title: "Content Creation",
      desc: "Empowering faith-based storytelling and digital ministry.",
      color: "bg-blue-50"
    },
    {
      icon: <Users className="text-emerald-500" size={24} />,
      title: "Community Growth",
      desc: "Expanding our reach to build up more individuals globally.",
      color: "bg-emerald-50"
    },
    {
      icon: <Sparkles className="text-amber-500" size={24} />,
      title: "Innovation",
      desc: "Developing modern tools and platforms for connection.",
      color: "bg-amber-50"
    }
  ]

  return (
    <div className="min-h-screen bg-[var(--bg-main)] overflow-hidden">
      
      <div className="relative h-[70vh] md:h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="/community-support.png" 
            alt="Community Support" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--brand-primary)]/60 via-[var(--brand-primary)]/20 to-[var(--bg-main)]" />
        </div>

        <div className="container relative z-10 text-center space-y-6 px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-6 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-xs font-black uppercase tracking-[0.3em]"
          >
            <Heart className="fill-rose-500 text-rose-500 animate-pulse" size={14} />
            The Heart of the Mission
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-8xl font-[1000] text-white tracking-tighter leading-none"
          >
            Build the <span className="text-[var(--brand-soft)]">Future</span><br />Of Our Community
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto font-medium leading-relaxed"
          >
            Your contribution is more than a donation—it's an investment in the spiritual and social growth of the DSE community.
          </motion.p>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-6 -mt-24 relative z-20 pb-32">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT: IMPACT CARDS */}
          <div className="lg:col-span-7 space-y-12">
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-1 gap-6">
              {impacts.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white p-8 rounded-[2.5rem] border border-[var(--border-light)] shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all group"
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center shrink-0 shadow-inner`}>
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-[var(--text-heading)] mb-1 tracking-tight">{item.title}</h3>
                      <p className="text-[var(--text-muted)] text-sm font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="relative h-[500px] rounded-[3rem] overflow-hidden group shadow-2xl"
            >
              <img 
                src="/community-impact.png" 
                alt="Impact" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-10">
                <p className="text-white text-xl font-bold italic">"Seeing the community grow is the greatest reward of all."</p>
              </div>
            </motion.div>
          </div>

          {/* RIGHT: DONATION FORM */}
          <div className="lg:col-span-5 sticky top-24">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[3rem] p-10 border border-[var(--border-light)] shadow-2xl shadow-[var(--brand-primary)]/10"
            >
              <div className="space-y-8">
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--brand-primary)] mb-2">Contribution Portal</p>
                  <h2 className="text-3xl font-[1000] text-[var(--text-heading)] tracking-tighter">Support the Journey</h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[500, 1000, 2500, 5000].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setCustomAmount(String(amount))}
                      className={`py-5 rounded-2xl font-black text-sm border-2 transition-all active:scale-95 ${
                        customAmount === String(amount)
                          ? "bg-[var(--brand-primary)] border-[var(--brand-primary)] text-white shadow-xl shadow-[var(--brand-primary)]/20"
                          : "bg-[var(--bg-surface)] border-transparent text-[var(--text-muted)] hover:border-[var(--border-light)] hover:bg-white"
                      }`}
                    >
                      ₱{amount.toLocaleString()}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block">Custom Contribution</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--brand-primary)] font-black text-xl">₱</span>
                    <input
                      type="number"
                      placeholder="Enter amount"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="w-full pl-14 pr-6 py-5 rounded-[2rem] bg-[var(--bg-surface)] border-2 border-transparent focus:border-[var(--brand-primary)] text-xl font-black text-[var(--text-heading)] placeholder:text-gray-300 outline-none transition-all shadow-inner"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleDonate}
                  disabled={loading}
                  className="w-full btn-premium !py-6 !rounded-[2rem] text-lg shadow-2xl flex justify-center items-center gap-3 disabled:opacity-50 group overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  {loading ? <Loader2 className="animate-spin" size={24} /> : <Heart size={24} className="fill-white/20" />}
                  <span className="relative z-10">{loading ? "Processing..." : "Complete Contribution"}</span>
                </button>

                <div className="flex items-center justify-center gap-2 text-slate-400">
                  <ShieldCheck size={16} />
                  <p className="text-[10px] font-black uppercase tracking-widest">Secure & Private Transmission</p>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  )
}