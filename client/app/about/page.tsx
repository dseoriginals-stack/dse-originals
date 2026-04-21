"use client"

import { motion } from "framer-motion"
import { ShieldCheck, Target, Users } from "lucide-react"
import Image from "next/image"

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white py-20 px-4 md:px-10">
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* TOP SECTION: OUR STORY (HORIZONTAL CARD) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 md:p-12 shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col md:flex-row items-center gap-10"
        >
          <div className="flex-1 space-y-6">
            <h2 className="text-3xl font-black text-[var(--text-heading)] tracking-tight">Our Story</h2>
            <p className="text-slate-500 font-medium leading-relaxed">
              DSE Originals was born from a deep desire to weave spiritual meaning into modern lifestyle essentials. We believe that every product—from the clothes we wear to the scents we carry—is an opportunity to reflect our values and our path.
            </p>
            <p className="text-slate-500 font-medium leading-relaxed">
              Started as an extension of the DiTaSCoM social communications mission, we have grown into a premium collective that prioritizes quality, intention, and faith-inspired design.
            </p>
          </div>
          <div className="w-full md:w-[350px] aspect-[4/3] relative bg-[#f8fafc] rounded-2xl overflow-hidden flex items-center justify-center border border-gray-50">
             <Image 
                src="/DSE.png" 
                alt="Our Story Icon" 
                width={150} 
                height={50} 
                className="opacity-20 grayscale"
             />
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 text-slate-200">
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                </div>
             </div>
          </div>
        </motion.div>

        {/* BOTTOM SECTION: THREE COLUMNS */}
        <div className="grid md:grid-cols-3 gap-12 md:gap-8 pt-10">
          
          {/* CARD 1: OUR STORY */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative pt-12"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full bg-gradient-to-b from-[#4A7BB0] to-[#274C77] flex items-center justify-center text-white shadow-[0_10px_20px_rgba(39,76,119,0.3)] z-10">
              <ShieldCheck size={40} strokeWidth={1.5} />
            </div>
            <div className="bg-white rounded-3xl p-10 pt-16 text-center shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-gray-50 h-full flex flex-col justify-between transition-transform hover:-translate-y-2 duration-500">
              <div>
                <h3 className="text-xl font-black text-[var(--text-heading)] mb-6 tracking-tight">Our Story</h3>
                <p className="text-slate-500 text-sm font-medium leading-loose">
                  Our journey is a shared narrative of faith and creativity. We focus on creating essentials that resonate with the modern believer, ensuring that every piece in our collection has a story of hope to tell.
                </p>
              </div>
            </div>
          </motion.div>

          {/* CARD 2: OUR MISSION */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative pt-12"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full bg-gradient-to-b from-[#4A7BB0] to-[#274C77] flex items-center justify-center text-white shadow-[0_10px_20px_rgba(39,76,119,0.3)] z-10">
              <Target size={40} strokeWidth={1.5} />
            </div>
            <div className="bg-white rounded-3xl p-10 pt-16 text-center shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-gray-50 h-full flex flex-col justify-between transition-transform hover:-translate-y-2 duration-500">
              <div>
                <h3 className="text-xl font-black text-[var(--text-heading)] mb-6 tracking-tight">Our Mission</h3>
                <p className="text-slate-500 text-sm font-medium leading-loose">
                  Our mission is simple: to create meaningful products that inspire faith, hope and love. We aim to sustain the mission of DiTaSCoM, supporting evangelization, and inspiration through social communications.
                </p>
              </div>
            </div>
          </motion.div>

          {/* CARD 3: OUR TEAM */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative pt-12"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full bg-gradient-to-b from-[#4A7BB0] to-[#274C77] flex items-center justify-center text-white shadow-[0_10px_20px_rgba(39,76,119,0.3)] z-10">
              <Users size={40} strokeWidth={1.5} />
            </div>
            <div className="bg-white rounded-3xl p-10 pt-16 text-center shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-gray-50 h-full flex flex-col justify-between transition-transform hover:-translate-y-2 duration-500">
              <div>
                <h3 className="text-xl font-black text-[var(--text-heading)] mb-6 tracking-tight">Our Team</h3>
                <p className="text-slate-500 text-sm font-medium leading-loose">
                  We are a community of dedicated witnesses, designers, and creators. Together, we work to maintain the highest standards of retail while keeping our spiritual mission at the heart of everything we do.
                </p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </main>
  )
}
