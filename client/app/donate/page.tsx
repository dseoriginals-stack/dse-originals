"use client"

import { useState } from "react"
import { Heart, Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import toast from "react-hot-toast"

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

  return (
    <div className="min-h-screen py-24 px-6">
      
      {/* Background Decorators */}
      <div className="absolute top-20 left-0 w-[500px] h-[500px] bg-[var(--brand-primary)]/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-20 right-0 w-[400px] h-[400px] bg-[var(--brand-accent)]/10 rounded-full blur-[80px] -z-10 pointer-events-none"></div>

      <div className="max-w-4xl mx-auto flex flex-col items-center">
        
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-[var(--brand-primary)] to-[var(--brand-accent)] rounded-full flex items-center justify-center text-white shadow-lg mb-6">
            <Heart size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--text-heading)] tracking-tight">
            Support the Mission
          </h1>
          <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto font-medium leading-relaxed">
            Your generous donation empowers us to continue crafting meaningful stories, engineering premium apparel, and building a community rooted in faith up-building.
          </p>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-2xl bg-white/80 backdrop-blur-xl border border-[var(--border-light)] rounded-[2.5rem] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          
          <div className="space-y-8">
            
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-[var(--text-heading)] mb-4 text-center">Select an Amount</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[500, 1000, 2000, 5000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setCustomAmount(String(amount))}
                    className="py-4 rounded-2xl font-bold border-2 border-[var(--border-light)] bg-[var(--bg-surface)] text-[var(--text-main)] hover:border-[var(--brand-primary)] hover:bg-[var(--brand-soft)]/20 hover:text-[var(--brand-primary)] transition-all focus:border-[var(--brand-primary)] focus:bg-[var(--brand-soft)]/20 outline-none"
                  >
                    ₱{amount.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative flex items-center">
              <div className="flex-grow border-t border-[var(--border-light)]"></div>
              <span className="flex-shrink-0 mx-4 text-[var(--text-muted)] text-xs font-bold uppercase tracking-widest">Or enter custom amount</span>
              <div className="flex-grow border-t border-[var(--border-light)]"></div>
            </div>

            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] font-bold text-lg">₱</span>
              <input
                type="number"
                placeholder="0.00"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full pl-12 pr-6 py-5 rounded-2xl bg-[var(--bg-surface)] border-2 border-[var(--border-light)] text-xl font-bold text-[var(--text-heading)] placeholder:text-gray-300 focus:outline-none focus:bg-white focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-accent)]/20 transition-all"
              />
            </div>

            <button 
              onClick={handleDonate}
              disabled={loading}
              className="w-full btn-premium !py-5 !rounded-2xl text-lg shadow-[0_10px_40px_rgba(39,76,119,0.25)] flex justify-center items-center gap-3 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Heart size={20} className="fill-white/20" />}
              {loading ? "Initializing..." : "Complete Processing"}
            </button>
            <p className="text-center text-xs text-[var(--text-muted)] font-medium mt-4">Securely processed. Transactions are encrypted and private.</p>

          </div>

        </div>

      </div>
    </div>
  )
}