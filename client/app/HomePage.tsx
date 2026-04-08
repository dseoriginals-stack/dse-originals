"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Sparkles } from "lucide-react"

import ProductCard from "@/components/ProductCard"
import { transformProductToCard } from "@/lib/transformProduct"
import { ProductFull } from "@/types/product"

type Props = {
  initialProducts: ProductFull[]
}

const heroImages = [
  "/hero1.png",
  "/hero2.png",
  "/hero3.png",
  "/hero4.png",
  "/hero5.png",
]

export default function HomePage({ initialProducts }: Props) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [products] = useState<ProductFull[]>(initialProducts)

  /* =========================
     HERO SLIDER (SMOOTH)
  ========================= */
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === heroImages.length - 1 ? 0 : prev + 1
      )
    }, 6000)

    return () => clearInterval(interval)
  }, [])

  const featured = useMemo(() => products.slice(0, 6), [products])
  const bestsellers = useMemo(() => products.slice(0, 8), [products])

  return (
    <main className="w-full">

      {/* ================= HERO ================= */}
      <section className="relative w-full h-[65vh] md:h-[75vh] overflow-hidden -mt-[56px]">

        {/* Background Images */}
        <AnimatePresence>
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0, ease: "easeInOut" }}
            className="absolute inset-0 z-0"
          >
            <Image
              src={heroImages[currentSlide]}
              alt="Hero"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/* No gradient overlays - preserving full image brightness as requested */}

        {/* Content */}
        <div className="absolute inset-0 z-20 flex flex-col items-start justify-center px-6 md:px-20 max-w-7xl mx-auto">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/20 backdrop-blur-md border border-white/20 mb-6 shadow-md"
          >
            <Sparkles size={16} className="text-[var(--brand-soft)]" />
            <span className="text-xs font-bold tracking-widest uppercase text-white">
              New Collection 2026
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight max-w-2xl leading-[1.1] text-white"
            style={{ textShadow: "0px 2px 6px rgba(0,0,0,0.6), 0px 1px 2px rgba(0,0,0,0.8)" }}
          >
            Elevate Your <br className="hidden sm:block" /> <span className="text-[var(--brand-soft)]">Everyday Style</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            className="text-sm md:text-base text-white max-w-lg mt-4 mb-7 font-medium"
            style={{ textShadow: "0px 1px 4px rgba(0,0,0,0.6), 0px 1px 2px rgba(0,0,0,0.8)" }}
          >
            Discover premium apparel and essentials meticulously crafted for confidence, presence, and purpose.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <Link
              href="/products"
              className="btn-premium w-full sm:w-auto flex justify-center !px-5 !py-2.5 md:!px-7 md:!py-3 shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)]"
            >
              Shop Collection <ArrowRight size={18} />
            </Link>

            <button className="btn-outline w-full sm:w-auto flex justify-center !px-5 !py-2.5 md:!px-7 md:!py-3 border-white/40 bg-black/20 backdrop-blur-md !text-white hover:!bg-white hover:!text-[var(--text-heading)]">
              View Stories
            </button>
          </motion.div>

        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-3">
          {heroImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`transition-all duration-300 rounded-full ${i === currentSlide ? "w-8 h-2.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.4)]" : "w-2.5 h-2.5 bg-white/40 hover:bg-white/80"}`}
            />
          ))}
        </div>

      </section>

      {/* ================= CONTENT ================= */}
      <div className="max-w-7xl mx-auto px-4 relative z-10 pb-12">

        {/* FEATURED */}
        <section className="py-8 md:py-14">

          <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-5 md:mb-8 gap-3">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="h-[2px] w-8 bg-[var(--brand-primary)]"></div>
                <p className="text-sm font-bold tracking-[0.2em] text-[var(--brand-primary)] uppercase">
                  Curated Selection
                </p>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-heading)]">
                Featured Products
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Link
                href="/products"
                className="btn-outline inline-flex items-center gap-2 hover:bg-[var(--brand-soft)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] text-[var(--brand-primary)] border-[var(--brand-primary)]"
              >
                View All <ArrowRight size={16} />
              </Link>
            </motion.div>
          </div>

          <div className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide snap-x pb-6 -mx-4 px-4 md:mx-0 md:px-0">
            {featured.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="min-w-[44vw] sm:min-w-[200px] md:min-w-[240px] snap-start"
              >
                <ProductCard product={transformProductToCard(p)} />
              </motion.div>
            ))}
          </div>

        </section>

        {/* Divider */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--border-light)] to-transparent my-8"></div>

        {/* BESTSELLERS */}
        <section className="py-8 md:py-14">

          <div className="mb-6 md:mb-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center flex flex-col items-center"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="h-[2px] w-8 bg-[var(--brand-accent)]"></div>
                <p className="text-sm font-bold tracking-[0.2em] text-[var(--brand-accent)] uppercase">
                  Most Loved
                </p>
                <div className="h-[2px] w-8 bg-[var(--brand-accent)]"></div>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-heading)] mb-2">
                Bestsellers
              </h2>
              <p className="text-[var(--text-muted)] max-w-2xl mx-auto">
                Explore the pieces that our community can't get enough of. Perfectly designed for any occasion.
              </p>
            </motion.div>
          </div>

          <div className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide snap-x pb-6 -mx-4 px-4 md:mx-0 md:px-0">
            {bestsellers.map((p, i) => (
              <motion.div 
                 key={p.id} 
                 initial={{ opacity: 0, scale: 0.95 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.5, delay: i * 0.05 }}
                 className="min-w-[44vw] sm:min-w-[200px] md:min-w-[240px] snap-start"
              >
                <ProductCard product={transformProductToCard(p)} />
              </motion.div>
            ))}
          </div>

        </section>

      </div>
    </main>
  )
}