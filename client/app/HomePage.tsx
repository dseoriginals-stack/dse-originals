"use client"

import { useEffect, useMemo, useState, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Sparkles } from "lucide-react"

import ProductCard from "@/components/ProductCard"
import MissionSection from "@/components/MissionSection"
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

  /* =========================
     AUTO-SCROLL FEATURED
  ========================= */
  const carouselRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (!carouselRef.current || isHovered) return;

    const interval = setInterval(() => {
      const container = carouselRef.current;
      if (!container) return;

      const firstChild = container.children[0] as HTMLElement;
      const scrollAmount = firstChild ? firstChild.offsetWidth + 16 : 300; // padding approx

      const maxScroll = container.scrollWidth - container.clientWidth;

      if (container.scrollLeft >= maxScroll - 10) {
        container.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [isHovered]);

  const perfumeProducts = useMemo(() => {
    return products.filter(p => {
      const cat = (p.category || "").toLowerCase()
      const tags = (p.tags || []).map(t => t.toLowerCase())
      const name = (p.name || "").toLowerCase()
      // Keywords for Perfumes including specific product names from screenshot
      const perfumeKeywords = ["perfume", "scent", "fragrance", "eau", "spray", "heaven", "sacred", "embrace", "serenity", "ml", "frag"]
      return perfumeKeywords.some(key => name.includes(key) || cat.includes(key) || tags.includes(key))
    }).slice(0, 8)
  }, [products])

  const apparelProducts = useMemo(() => {
    return products.filter(p => {
      const cat = (p.category || "").toLowerCase()
      const tags = (p.tags || []).map(t => t.toLowerCase())
      const name = (p.name || "").toLowerCase()
      // Keywords for Apparel including specific product names/branding from screenshot
      const apparelKeywords = ["apparel", "clothing", "shirt", "tee", "wear", "faith", "hope", "slvrgn", "hoodie"]
      return apparelKeywords.some(key => name.includes(key) || cat.includes(key) || tags.includes(key))
    }).slice(0, 8)
  }, [products])

  const bestsellers = useMemo(() => products.filter(p => p.isBestseller), [products])

  return (
    <main className="w-full">

      {/* ================= HERO ================= */}
      <section className="relative w-full h-[65vh] md:h-[75vh] overflow-hidden -mt-[56px]">

        {/* Background Images */}
        <AnimatePresence mode="wait">
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
              Limited Drop 2026
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight max-w-2xl leading-[1.1] text-white"
            style={{ textShadow: "0px 2px 10px rgba(0,0,0,0.4)" }}
          >
            Presence in <br className="hidden sm:block" /> <span className="text-[var(--brand-soft)]">Every Detail.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            className="text-sm md:text-base text-white/90 max-w-lg mt-4 mb-7 font-medium"
          >
            From signature scents that capture the room to precision-cut apparel that defines it. Elevate your identity.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <Link
              href="/products"
              className="btn-premium w-full sm:w-auto flex justify-center !px-5 !py-2.5 md:!px-7 md:!py-3 shadow-2xl"
            >
              Shop All Originals <ArrowRight size={18} />
            </Link>
          </motion.div>

        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-3">
          {heroImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`transition-all duration-300 rounded-full ${i === currentSlide ? "w-8 h-2.5 bg-white shadow-lg" : "w-2.5 h-2.5 bg-white/40"}`}
            />
          ))}
        </div>

      </section>

      {/* ================= CONTENT ================= */}
      <div className="max-w-7xl mx-auto px-4 relative z-10 pb-12">

        {/* FEATURED PRODUCTS (SPLIT) */}
        <section className="py-12 md:py-20">

          <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-10 md:mb-16 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-[2px] w-12 bg-[var(--brand-primary)]"></div>
                <p className="text-sm font-black tracking-[0.3em] text-[var(--brand-primary)] uppercase">
                  Curated Selection
                </p>
              </div>
              <h2 className="text-3xl md:text-5xl font-[1000] text-[var(--text-heading)] tracking-tighter">
                Featured Products
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/products"
                className="group relative inline-flex items-center gap-3 bg-[var(--brand-primary)] text-white px-10 py-4 rounded-full font-[1000] text-[10px] uppercase tracking-[0.2em] shadow-[0_10px_40px_rgba(27,59,96,0.25)] hover:shadow-[0_15px_50px_rgba(27,59,96,0.4)] transition-all duration-500 overflow-hidden"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <span className="relative z-10">Explore Full Catalog</span>
                <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>

          <div className="space-y-16 md:space-y-24">

            {/* FEATURED PERFUME - Dedicated Carousel */}
            {perfumeProducts.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-black text-[var(--text-heading)] tracking-tight">Featured Perfume</h3>
                  <div className="flex-1 h-[1px] bg-gray-100"></div>
                </div>
                <div
                  ref={carouselRef}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  className="flex gap-4 md:gap-8 overflow-x-auto scrollbar-hide snap-x pb-4 -mx-4 px-4 md:mx-0 md:px-0"
                >
                  {perfumeProducts.map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="min-w-[46vw] sm:min-w-[280px] md:min-w-[320px] snap-start"
                    >
                      <ProductCard product={transformProductToCard(p)} />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* FEATURED APPAREL - Dedicated Carousel */}
            {apparelProducts.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-black text-[var(--text-heading)] tracking-tight">Featured Apparel</h3>
                  <div className="flex-1 h-[1px] bg-gray-100"></div>
                </div>
                <div className="flex gap-4 md:gap-8 overflow-x-auto scrollbar-hide snap-x pb-4 -mx-4 px-4 md:mx-0 md:px-0">
                  {apparelProducts.map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="min-w-[46vw] sm:min-w-[280px] md:min-w-[320px] snap-start"
                    >
                      <ProductCard product={transformProductToCard(p)} />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </section>

        {/* Divider */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--border-light)] to-transparent my-4"></div>

        {/* BESTSELLERS */}
        <section className="py-12 md:py-20">
          <div className="text-center mb-10 md:mb-16">
            <p className="text-xs font-black tracking-[0.4em] text-[var(--brand-accent)] uppercase mb-4">Trending Now</p>
            <h2 className="text-3xl md:text-5xl font-[1000] text-[var(--text-heading)] tracking-tighter">Community Favorites</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {bestsellers.slice(0, 4).map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <ProductCard product={transformProductToCard(p)} />
              </motion.div>
            ))}
          </div>
        </section>

      </div>

      {/* ================= MISSION SECTION ================= */}
      <MissionSection />

    </main>
  )
}