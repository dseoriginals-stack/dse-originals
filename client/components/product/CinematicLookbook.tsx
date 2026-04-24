"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { X, Play, Volume2, VolumeX, ArrowDown } from "lucide-react"
import Image from "next/image"

interface CinematicLookbookProps {
  product: {
    name: string
    videoUrl?: string
    storyHtml?: string
    images: { url: string }[]
  }
}

export default function CinematicLookbook({ product }: CinematicLookbookProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  
  if (!product.videoUrl && !product.storyHtml) return null

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="group relative flex items-center gap-3 px-8 py-4 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] overflow-hidden shadow-2xl hover:scale-105 transition-transform"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-accent)] opacity-0 group-hover:opacity-100 transition-opacity" />
        <Play size={16} className="relative z-10" />
        <span className="relative z-10">Watch the Story</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black overflow-y-auto custom-scrollbar"
          >
            {/* CLOSE BUTTON */}
            <button 
              onClick={() => setIsOpen(false)}
              className="fixed top-8 right-8 z-[110] p-4 bg-white/10 backdrop-blur-xl rounded-full text-white hover:bg-white/20 transition-all"
            >
              <X size={24} />
            </button>

            {/* MUTE TOGGLE */}
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="fixed bottom-8 right-8 z-[110] p-4 bg-white/10 backdrop-blur-xl rounded-full text-white hover:bg-white/20 transition-all"
            >
              {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>

            {/* HERO VIDEO / BACKGROUND */}
            <div className="relative h-screen w-full flex items-center justify-center">
              {product.videoUrl ? (
                <video 
                  autoPlay 
                  loop 
                  muted={isMuted}
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                >
                  <source src={product.videoUrl} type="video/mp4" />
                </video>
              ) : (
                <Image 
                  src={product.images[0]?.url} 
                  alt={product.name} 
                  fill 
                  className="object-cover opacity-40 blur-sm"
                />
              )}

              <div className="relative z-10 text-center px-6">
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[var(--brand-soft)] text-xs font-black uppercase tracking-[0.4em] mb-4"
                >
                  DSE Originals Presents
                </motion.p>
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-5xl md:text-8xl font-[1000] text-white tracking-tighter leading-none"
                >
                  {product.name}
                </motion.h2>
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 1, repeat: Infinity, repeatType: "reverse" }}
                  className="mt-20 flex flex-col items-center gap-4 text-white/40"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest">Scroll to Explore</span>
                  <ArrowDown size={20} />
                </motion.div>
              </div>
            </div>

            {/* STORY CONTENT */}
            <div className="max-w-4xl mx-auto px-6 py-32 space-y-32">
              {product.storyHtml ? (
                <div 
                  className="prose prose-invert prose-2xl max-w-none font-medium leading-relaxed text-white/80"
                  dangerouslySetInnerHTML={{ __html: product.storyHtml }}
                />
              ) : (
                <div className="text-3xl md:text-5xl font-[1000] text-white/90 leading-tight tracking-tighter text-center italic">
                  "Every detail is a witness to the faith we carry."
                </div>
              )}

              {/* IMAGE SHOWCASE */}
              <div className="grid md:grid-cols-2 gap-8">
                {product.images.slice(0, 4).map((img, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className={`relative aspect-[3/4] rounded-3xl overflow-hidden ${i % 2 === 1 ? 'md:mt-20' : ''}`}
                  >
                    <Image src={img.url} alt={`${product.name} ${i}`} fill className="object-cover" />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* FINAL FOOTER */}
            <div className="py-40 text-center">
               <button 
                onClick={() => setIsOpen(false)}
                className="px-12 py-5 bg-white text-black rounded-full font-black text-xs uppercase tracking-[0.2em] hover:scale-110 transition-transform"
               >
                 Return to Shop
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
