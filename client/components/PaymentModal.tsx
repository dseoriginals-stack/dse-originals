"use client"

import { X, Lock, ShieldCheck, CreditCard } from "lucide-react"
import ModalPortal from "./ModalPortal"
import { useEffect, useState } from "react"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  invoiceUrl: string
  total: number
}

export default function PaymentModal({ isOpen, onClose, invoiceUrl, total }: PaymentModalProps) {
  const [loading, setLoading] = useState(true)

  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10 animate-fade-in">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal Container */}
        <div className="relative w-full max-w-4xl h-[90vh] bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col animate-scale-up">
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--brand-primary)] flex items-center justify-center text-white shadow-lg shadow-[var(--brand-primary)]/20">
                <CreditCard size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Complete Payment</h3>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <Lock size={10} className="text-emerald-500" />
                  Secure Checkout · ₱{total.toLocaleString()}
                </div>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-50 transition-colors text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
          </div>

          {/* Iframe Content */}
          <div className="flex-1 bg-slate-50 relative">
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-0">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-[var(--brand-primary)] rounded-full animate-spin mb-4" />
                <p className="text-slate-400 font-bold text-sm animate-pulse">Initializing Secure Payment...</p>
              </div>
            )}
            <iframe 
              src={invoiceUrl}
              className={`w-full h-full border-none transition-opacity duration-500 ${loading ? 'opacity-0' : 'opacity-100'}`}
              onLoad={() => setLoading(false)}
              allow="payment"
            />
          </div>

          {/* Footer / Trust badges */}
          <div className="px-6 py-3 bg-slate-50 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                <ShieldCheck size={14} className="text-emerald-500" />
                PCI-DSS COMPLIANT
              </div>
            </div>
            <div className="flex items-center gap-2">
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-3 opacity-60" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-5 opacity-60" />
              <img src="https://xendit.co/wp-content/uploads/2020/07/xendit-logo.png" alt="Xendit" className="h-3 ml-2 grayscale opacity-60" />
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  )
}
