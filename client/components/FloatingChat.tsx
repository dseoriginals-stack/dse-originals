"use client"

import { MessageCircle, Mail, Facebook, LifeBuoy } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import toast from "react-hot-toast"

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false)

  const FB_PAGE_URL = "https://www.facebook.com/DSEoriginals"
  const SUPPORT_EMAIL = "support@dseoriginals.com"

  const handleAction = (item: any) => {
    if (item.id === 'email') {
      navigator.clipboard.writeText(SUPPORT_EMAIL)
      toast.success("Email address copied!")
    } else {
      window.open(item.href, "_blank", "noopener,noreferrer")
    }
  }

  const menuItems = [
    {
      id: 'fb',
      icon: <Facebook size={20} />,
      href: FB_PAGE_URL,
      label: "Facebook Page",
      color: "bg-gradient-to-tr from-[#006AFF] to-[#00B2FF]"
    },
    {
      id: 'email',
      icon: <Mail size={20} />,
      label: "support@dseoriginals.com",
      color: "bg-gradient-to-tr from-[#4F46E5] to-[#7C3AED]"
    }
  ]

  return (
    <div className="fixed bottom-8 right-8 z-[9999]">
      <div className="flex flex-col items-end gap-3 px-2 pb-2">
        <AnimatePresence>
          {isOpen && (
            <div className="flex flex-col items-end gap-3 mb-2">
              {menuItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20, scale: 0.5 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.5 }}
                  transition={{
                    delay: (menuItems.length - 1 - i) * 0.1,
                    type: "spring",
                    stiffness: 260,
                    damping: 20
                  }}
                  className="flex items-center gap-3 group"
                >
                  <span className="
                    bg-white/90 backdrop-blur-xl border border-white/20 
                    px-3 py-1.5 rounded-xl text-[10px] font-black uppercase 
                    tracking-widest text-slate-500 shadow-xl opacity-0 
                    group-hover:opacity-100 transition-opacity
                  ">
                    {item.label}
                  </span>
                  <button
                    onClick={() => handleAction(item)}
                    className={`
                      w-12 h-12 flex items-center justify-center rounded-2xl 
                      text-white shadow-2xl transition-transform hover:scale-110
                      active:scale-95 ${item.color}
                    `}
                  >
                    {item.icon}
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        <motion.div
          onClick={() => setIsOpen(!isOpen)}
          animate={{
            rotate: isOpen ? 90 : 0,
            scale: isOpen ? 1.1 : 1
          }}
          className="
            relative h-16 w-16 flex items-center justify-center rounded-[1.75rem]
            bg-white/80 backdrop-blur-3xl border-4 border-white
            text-[#274C77] shadow-[0_20px_40px_rgba(39,76,119,0.15)]
            cursor-pointer group
          "
        >
          <LifeBuoy size={32} className="group-hover:text-[var(--brand-primary)] transition-colors" />

          {/* Status highlight */}
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-emerald-400 border-4 border-white animate-pulse" />
        </motion.div>
      </div>
    </div>
  )
}

