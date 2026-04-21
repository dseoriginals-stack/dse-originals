"use client"

import { motion } from "framer-motion"
import { ShieldCheck, Target, Users, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-50/30 pb-20">
      
      {/* HERO / HEADER SECTION */}
      <section className="pt-20 pb-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-[var(--brand-primary)]/10 px-4 py-2 rounded-full mb-6"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--brand-primary)]">Modern Faith • Timeless Mission</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-[1000] tracking-tighter text-[var(--text-heading)] mb-6"
          >
            Presence in Every <span className="text-[var(--brand-primary)]">Detail.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto font-medium"
          >
            DSE Originals is more than a brand; it's a social communication mission dedicated to evangelization, community connection, and premium craftsmanship.
          </motion.p>
        </div>
      </section>

      {/* TOP SECTION: OUR STORY */}
      <section className="px-4 mb-20">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(39,76,119,0.08)] border border-slate-100 flex flex-col md:flex-row items-center gap-10"
          >
            <div className="flex-1 space-y-6">
              <h2 className="text-3xl font-[1000] text-[var(--brand-primary)] tracking-tight">Our Story</h2>
              <p className="text-slate-600 leading-relaxed font-medium">
                DSE Originals started with a simple yet powerful goal: to create premium products that speak volumes about faith. We believe that what you wear and what you use should reflect your identity and mission. Our designs are meticulously crafted to blend modern aesthetics with timeless spiritual values, ensuring that every detail carries a deeper meaning.
              </p>
              <p className="text-slate-600 leading-relaxed font-medium">
                From our signature scents to our precision-cut apparel, every piece is a testimony to our commitment to excellence and our support for the mission of social communications.
              </p>
            </div>
            <div className="w-full md:w-[350px] aspect-square relative bg-slate-50 rounded-3xl overflow-hidden border border-slate-100 flex items-center justify-center group">
               <Image 
                  src="/DSEoriginals.png" 
                  alt="DSE Story" 
                  fill 
                  className="object-contain p-12 transition-transform duration-700 group-hover:scale-110"
               />
               <div className="absolute inset-0 bg-gradient-to-tr from-[var(--brand-primary)]/5 to-transparent"></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* THREE CARDS SECTION */}
      <section className="px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12 md:gap-8">
          
          {/* CARD 1: OUR HISTORY/VALUES */}
          <div className="relative pt-10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-accent)] flex items-center justify-center text-white shadow-xl z-10 border-4 border-white">
              <ShieldCheck size={32} />
            </div>
            <div className="bg-white rounded-[2.5rem] p-10 pt-16 h-full shadow-[0_15px_40px_rgba(39,76,119,0.05)] border border-slate-50 text-center transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
              <h3 className="text-xl font-black text-[var(--text-heading)] mb-4 uppercase tracking-widest">Our Story</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                Rooted in deep-seated traditions and inspired by the future, our story is one of continuous growth and spiritual evolution. We stand by the weight of our legacy.
              </p>
            </div>
          </div>

          {/* CARD 2: OUR MISSION */}
          <div className="relative pt-10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-accent)] flex items-center justify-center text-white shadow-xl z-10 border-4 border-white">
              <Target size={32} />
            </div>
            <div className="bg-white rounded-[2.5rem] p-10 pt-16 h-full shadow-[0_15px_40px_rgba(39,76,119,0.05)] border border-slate-50 text-center transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
              <h3 className="text-xl font-black text-[var(--text-heading)] mb-4 uppercase tracking-widest">Our Mission</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                To create meaningful products that inspire faith, hope and love. Supporting evangelization and community connection through every thread and scent.
              </p>
            </div>
          </div>

          {/* CARD 3: OUR TEAM */}
          <div className="relative pt-10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-accent)] flex items-center justify-center text-white shadow-xl z-10 border-4 border-white">
              <Users size={32} />
            </div>
            <div className="bg-white rounded-[2.5rem] p-10 pt-16 h-full shadow-[0_15px_40px_rgba(39,76,119,0.05)] border border-slate-50 text-center transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
              <h3 className="text-xl font-black text-[var(--text-heading)] mb-4 uppercase tracking-widest">Our Team</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                A community of dedicated visionaries, creators, and believers working together to sustain the mission of social communications and premium retail.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="mt-24 px-4 text-center">
        <Link 
          href="/products"
          className="group inline-flex items-center gap-4 bg-[var(--text-heading)] text-white px-12 py-5 rounded-full font-black uppercase text-xs tracking-[0.3em] transition-all hover:scale-105 shadow-2xl hover:bg-[var(--brand-primary)]"
        >
          Be Part of the Mission <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
        </Link>
      </section>

    </main>
  )
}
