"use client"

import { Heart, CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"

export default function MissionSection() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden bg-white">
      <div className="container mx-auto px-6 md:px-12 lg:px-24">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          
          {/* TEXT CONTENT */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 space-y-8 md:space-y-12"
          >
            <div>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 bg-[#274C77]/5 border border-[#274C77]/10 px-4 py-2 rounded-2xl mb-8 group"
              >
                <Heart size={16} className="text-[var(--brand-primary)] fill-[var(--brand-primary)]/20 transition-transform group-hover:scale-125 duration-500" />
                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-[#274C77]">Our Mission</span>
              </motion.div>
              
              <h2 className="text-4xl md:text-6xl font-[1000] tracking-tighter leading-[0.9] text-[#1a1a1a] max-w-xl">
                DSE is More Than a <span className="text-[var(--brand-primary)]">Brand</span>,<br />
                It&apos;s a <span className="text-[var(--brand-primary)] italic">Mission</span>
              </h2>
            </div>

            <div className="space-y-6 md:space-y-8">
              {[
                "Our mission is simple: to create meaningful products that inspire faith, hope and love.",
                "We aim to sustain the mission of DiTaSCoM, supporting evangelization, inspiration, and community connection through social communications.",
                "When you choose DSE, you choose to be part of the mission."
              ].map((bullet, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4 group"
                >
                  <div className="shrink-0 mt-1">
                    <div className="w-4 h-4 rounded-full bg-[var(--brand-primary)] flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    </div>
                  </div>
                  <p className="text-base md:text-lg lg:text-xl font-bold text-slate-600 leading-relaxed font-outfit">
                    {bullet}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* VISUAL / POSTER SECTION */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            className="flex-1 w-full"
          >
            <div className="relative aspect-[4/5] md:aspect-square w-full rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl shadow-blue-900/10 group">
              {/* BRANDED POSTER RECREATION */}
              <div className="absolute inset-0 flex flex-col md:flex-row">
                <div className="flex-1 bg-[#274C77] p-8 md:p-12 flex flex-col justify-center text-white relative overflow-hidden">
                  <div className="absolute -bottom-10 -right-10 opacity-10">
                    <ShoppingBagGraphic />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black uppercase tracking-widest mb-6 border-b-4 border-white inline-block w-fit">About Us</h3>
                  <div className="space-y-4">
                     <p className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-white/60">Essentials that speak</p>
                     <p className="text-4xl md:text-5xl font-black tracking-tighter">D S E</p>
                     <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/40">FAITH • HOPE • LOVE</p>
                  </div>
                </div>
                <div className="flex-1 bg-[#E1F1FD] relative p-8 flex flex-col justify-end">
                   <div className="relative w-full h-full transform transition-transform duration-700 group-hover:scale-110 group-hover:rotate-3">
                     <Image 
                       src="/DSEoriginals.png" 
                       alt="DSE Branding" 
                       fill 
                       className="object-contain drop-shadow-2xl" 
                     />
                   </div>
                   <div className="relative z-10 text-center space-y-2 mt-4">
                     <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-[#274C77]">Be part of the mission</p>
                     <p className="text-[#274C77]/40 text-[8px] font-black uppercase tracking-widest">+63 998 864 4548</p>
                   </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}

function ShoppingBagGraphic() {
  return (
    <svg width="400" height="400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-white">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  )
}
