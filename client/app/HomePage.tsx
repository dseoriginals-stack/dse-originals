"use client"

import { useEffect, useMemo, useState, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight, ShieldCheck, Target, Users } from "lucide-react"

import ProductCard from "@/components/ProductCard"

import { transformProductToCard } from "@/lib/transformProduct"
import { ProductFull } from "@/types/product"
import { getCloudinaryBlurUrl } from "@/lib/imageUtils"

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
      // Extremely greedy keywords based on flagship product list
      const keywords = [
        "perfume", "scent", "fragrance", "eau", "spray", "heaven", "sacred",
        "embrace", "serenity", "ml", "frag", "dse", "angelic", "collection",
        "incensum", "eterna", "lume", "whisper", "credu", "bleu", "celestial", "aura", "angel's"
      ]
      return keywords.some(key => name.includes(key) || cat.includes(key) || tags.includes(key))
    })
  }, [products])

  const apparelProducts = useMemo(() => {
    return products.filter(p => {
      const cat = (p.category || "").toLowerCase()
      const tags = (p.tags || []).map(t => t.toLowerCase())
      const name = (p.name || "").toLowerCase()
      const keywords = ["apparel", "clothing", "shirt", "tee", "wear", "faith", "hope", "slvrgn", "hoodie"]
      return keywords.some(key => name.includes(key) || cat.includes(key) || tags.includes(key))
    })
  }, [products])

  const bestsellers = useMemo(() => products.filter(p => p.isBestseller), [products])

  // Refs for Perpetual Glide
  const pRef = useRef<HTMLDivElement>(null)
  const aRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)
  const lastActivityTime = useRef(Date.now())

  // Continuous Glide Engine (60fps)
  useEffect(() => {
    let animationFrameId: number;

    const glide = () => {
      // Pause if user is interacting OR if they just stopped (2s delay)
      const now = Date.now();
      const timeSinceActivity = now - lastActivityTime.current;

      if (!isPaused && timeSinceActivity > 2000) {
        [pRef, aRef].forEach(ref => {
          if (ref.current) {
            const container = ref.current;
            container.scrollLeft += 0.5; // Fine-tuned speed (0.5px per frame)

            // Loop back if at the end
            if (container.scrollLeft >= (container.scrollWidth / 2)) {
              container.scrollLeft = 0;
            }
          }
        });
      }
      animationFrameId = requestAnimationFrame(glide);
    };

    animationFrameId = requestAnimationFrame(glide);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused]);

  // Activity Handlers
  const handleInteractionStart = () => {
    setIsPaused(true);
    lastActivityTime.current = Date.now();
  }
  const handleInteractionEnd = () => {
    setIsPaused(false);
    lastActivityTime.current = Date.now();
  }

  // Split into two sets for a deeper loop
  const perfumeDisplay = [...perfumeProducts, ...perfumeProducts]
  const apparelDisplay = [...apparelProducts, ...apparelProducts]

  return (
    <main className="w-full">

      {/* ================= HERO ================= */}
      <section className="relative w-full h-[100svh] md:h-[75vh] overflow-hidden -mt-[56px] bg-black">

        {/* Background Images */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0"
            >
              <Image
                src={heroImages[currentSlide]}
                alt="Hero"
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/30" />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Content */}
        <div className="absolute inset-0 z-20 flex flex-col items-start justify-center px-6 md:px-20 max-w-7xl mx-auto">

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight max-w-2xl leading-[1.1] text-white"
          >
            Presence in <br className="hidden sm:block" /> Every Detail.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-base md:text-lg text-white/90 max-w-lg mt-6 mb-8 font-medium"
          >
            From signature scents that capture the room to precision-cut apparel that defines it. Elevate your identity.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link
              href="/products"
              className="btn-premium flex items-center gap-2 !px-8 !py-4 shadow-xl"
            >
              Shop All Originals <ArrowRight size={20} />
            </Link>
          </motion.div>

        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-3">
          {heroImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`transition-all duration-300 rounded-full ${i === currentSlide ? "w-8 h-2.5 bg-white shadow-lg" : "w-2.5 h-2.5 bg-white/40 hover:bg-white/60"}`}
            />
          ))}
        </div>

      </section>

      {/* ================= CONTENT ================= */}
      <div className="max-w-7xl mx-auto px-4 relative z-10 pb-12">

        {/* FEATURED PRODUCTS */}
        <section className="py-12 md:py-20 overflow-hidden">

          <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-10 md:mb-16 gap-6 px-4">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-[2px] w-12 bg-[var(--brand-primary)]"></div>
                <p className="text-sm font-black tracking-[0.3em] text-[var(--brand-primary)] uppercase">
                  Featured
                </p>
              </div>
              <h2 className="text-3xl md:text-5xl font-[1000] text-[var(--text-heading)] tracking-tighter">
                Originals Collection
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
                className="group relative inline-flex items-center gap-3 bg-[var(--brand-primary)] text-white px-10 py-4 rounded-full font-[1000] text-[10px] uppercase tracking-[0.2em] shadow-xl overflow-hidden"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <span className="relative z-10">Explore Full Catalog</span>
                <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>

          <div className="space-y-16 md:space-y-32">

            {/* FEATURED PERFUME - HYBRID CAROUSEL WITH NAV */}
            {perfumeProducts.length > 0 && (
              <div className="space-y-8 relative group/carousel">
                <div className="flex items-center justify-between px-4">
                  <div className="flex items-center gap-4 flex-1">
                    <h3 className="text-xl font-black text-[var(--text-heading)] tracking-tight">Featured Perfume</h3>
                    <div className="flex-1 h-[1px] bg-gray-100"></div>
                  </div>
                  <div className="hidden md:flex items-center gap-2 ml-4">
                    <button
                      onClick={() => pRef.current?.scrollBy({ left: -400, behavior: "smooth" })}
                      className="p-3 rounded-full border border-gray-100 hover:bg-white hover:shadow-xl hover:border-white transition-all text-gray-400 hover:text-[var(--brand-primary)]"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() => pRef.current?.scrollBy({ left: 400, behavior: "smooth" })}
                      className="p-3 rounded-full border border-gray-100 hover:bg-white hover:shadow-xl hover:border-white transition-all text-gray-400 hover:text-[var(--brand-primary)]"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>

                <div className="relative w-full">
                  <div
                    ref={pRef}
                    onMouseEnter={handleInteractionStart}
                    onMouseLeave={handleInteractionEnd}
                    onTouchStart={handleInteractionStart}
                    onScroll={handleInteractionStart}
                    onMouseDown={handleInteractionStart}
                    onPointerDown={handleInteractionStart}
                    className="flex gap-4 md:gap-8 overflow-x-auto scrollbar-hide snap-x pb-8 px-4 select-none"
                  >
                    {perfumeDisplay.map((p, i) => (
                      <div
                        key={`${p.id}-${i}`}
                        className="min-w-[46vw] sm:min-w-[280px] md:min-w-[300px] snap-start flex-shrink-0"
                      >
                        <ProductCard product={transformProductToCard(p)} />
                      </div>
                    ))}
                  </div>

                  {/* Subtle Scroll Hint Indicator (Mobile) */}
                  <div className="md:hidden flex justify-center mt-2">
                    <div className="h-1 w-24 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-[var(--brand-primary)] w-1/3"
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FEATURED APPAREL - HYBRID CAROUSEL WITH NAV */}
            {apparelProducts.length > 0 && (
              <div className="space-y-8 relative group/carousel">
                <div className="flex items-center justify-between px-4">
                  <div className="flex items-center gap-4 flex-1">
                    <h3 className="text-xl font-black text-[var(--text-heading)] tracking-tight">Featured Apparel</h3>
                    <div className="flex-1 h-[1px] bg-gray-100"></div>
                  </div>
                  <div className="hidden md:flex items-center gap-2 ml-4">
                    <button
                      onClick={() => aRef.current?.scrollBy({ left: -400, behavior: "smooth" })}
                      className="p-3 rounded-full border border-gray-100 hover:bg-white hover:shadow-xl hover:border-white transition-all text-gray-400 hover:text-[var(--brand-primary)]"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() => aRef.current?.scrollBy({ left: 400, behavior: "smooth" })}
                      className="p-3 rounded-full border border-gray-100 hover:bg-white hover:shadow-xl hover:border-white transition-all text-gray-400 hover:text-[var(--brand-primary)]"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>

                <div className="relative w-full">
                  <div
                    ref={aRef}
                    onMouseEnter={handleInteractionStart}
                    onMouseLeave={handleInteractionEnd}
                    onTouchStart={handleInteractionStart}
                    onScroll={handleInteractionStart}
                    onMouseDown={handleInteractionStart}
                    onPointerDown={handleInteractionStart}
                    className="flex gap-4 md:gap-8 overflow-x-auto scrollbar-hide snap-x pb-8 px-4 select-none"
                  >
                    {apparelDisplay.map((p, i) => (
                      <div
                        key={`${p.id}-${i}`}
                        className="min-w-[46vw] sm:min-w-[280px] md:min-w-[300px] snap-start flex-shrink-0"
                      >
                        <ProductCard product={transformProductToCard(p)} />
                      </div>
                    ))}
                  </div>

                  {/* Subtle Scroll Hint Indicator (Mobile) */}
                  <div className="md:hidden flex justify-center mt-2">
                    <div className="h-1 w-24 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-[var(--brand-primary)] w-1/3"
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      />
                    </div>
                  </div>
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
            <h2 className="text-3xl md:text-5xl font-[1000] text-[var(--text-heading)] tracking-tighter">Best Sellers</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {bestsellers.slice(0, 8).map((p, i) => (
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
 
        {/* ================= FLAGSHIP SHOWCASE ================= */}
        <section className="py-24 relative overflow-hidden">
          <div className="text-center mb-16 px-4">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-xs font-black text-[var(--brand-primary)] uppercase tracking-[0.4em] mb-4"
            >
              The DSE Signature
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-[1000] text-[var(--text-heading)] tracking-tighter"
            >
              Presence In Every Thread.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-slate-500 font-medium max-w-2xl mx-auto text-sm md:text-base leading-relaxed"
            >
              Quality clothing and signature scents for those who refuse to settle and define their presence through excellence and faith.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-4">
            {[
              { title: "Freedom in Every Move", img: "/hero2.png", delay: 0 },
              { title: "Confidence That Shows", img: "/hero3.png", delay: 0.1 },
              { title: "Built for Your Build", img: "/hero4.png", delay: 0.2 },
              { title: "Refined, but not Loud", img: "/hero1.png", delay: 0.3 },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: item.delay }}
                className="group relative aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-2xl"
              >
                <Image
                  src={item.img}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8 text-center">
                  <h3 className="text-white font-black text-sm uppercase tracking-widest">{item.title}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ================= WHY CHOOSE DSE ================= */}
        <section className="py-24 bg-slate-50/50 rounded-[4rem] my-12 border border-white/50">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-[1000] text-[var(--text-heading)] tracking-tighter uppercase">Why DSE Originals Stand Out</h2>
              <p className="mt-4 text-slate-400 font-bold uppercase tracking-widest text-[10px]">Purposely designed for those who move, sweat, and show up in style.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-16 md:gap-12 items-center">
              {/* Left Column */}
              <div className="space-y-16">
                {[
                  { icon: <Sparkles size={24} />, title: "High-Quality", desc: "Quality-crafted fabrics and premium oils that won't easily fade or stretch out over time." },
                  { icon: <Target size={24} />, title: "Precision Design", desc: "Every thread and note is calculated to ensure a sharp fit and a lasting impression." },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center md:items-end text-center md:text-right gap-4"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-white shadow-xl flex items-center justify-center text-[var(--brand-primary)] border border-gray-50">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-[var(--text-heading)] mb-2 uppercase tracking-tight">{item.title}</h4>
                      <p className="text-xs text-slate-400 font-medium leading-loose">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Center Image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative aspect-[3/4] md:aspect-square flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-[var(--brand-primary)]/5 rounded-full blur-3xl" />
                <div className="relative w-full h-full rounded-[3rem] overflow-hidden shadow-2xl">
                  <Image
                    src="/hero5.png"
                    alt="Highlight"
                    fill
                    className="object-cover"
                  />
                </div>
              </motion.div>

              {/* Right Column */}
              <div className="space-y-16">
                {[
                  { icon: <ShieldCheck size={24} />, title: "Durable & Lasting", desc: "Designed with upgraded materials that can survive your busiest days and laundry runs." },
                  { icon: <Users size={24} />, title: "Community Driven", desc: "Every purchase supports our shared mission of hope and social communication." },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center md:items-start text-center md:text-left gap-4"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-white shadow-xl flex items-center justify-center text-[var(--brand-primary)] border border-gray-50">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-[var(--text-heading)] mb-2 uppercase tracking-tight">{item.title}</h4>
                      <p className="text-xs text-slate-400 font-medium leading-loose">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mt-20 text-center">
              <Link
                href="/products"
                className="btn-premium !px-12 !py-5 shadow-2xl shadow-[var(--brand-primary)]/20"
              >
                Shop The Collection
              </Link>
            </div>
          </div>
        </section>



        {/* MISSION CARDS SECTION (RESTORED WITH NEW DESIGN) */}
        <section className="py-20">
          <div className="grid md:grid-cols-3 gap-12 md:gap-8 pt-10">

            {/* CARD 1: OUR STORY */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative pt-12"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full bg-gradient-to-b from-[#4A7BB0] to-[#274C77] flex items-center justify-center text-white shadow-[0_10px_20px_rgba(39,76,119,0.3)] z-10">
                <ShieldCheck size={40} strokeWidth={1.5} />
              </div>
              <div className="bg-white rounded-3xl p-10 pt-16 text-center shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-gray-50 h-full flex flex-col justify-between transition-transform hover:-translate-y-2 duration-500">
                <div>
                  <h3 className="text-xl font-black text-[var(--text-heading)] mb-6 tracking-tight uppercase">Our Story</h3>
                  <p className="text-slate-500 text-sm font-medium leading-loose">
                    Our journey is a shared narrative of faith and creativity. We focus on creating essentials that resonate with the modern believer, ensuring that every piece tells a story of hope.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* CARD 2: OUR MISSION */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="relative pt-12"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full bg-gradient-to-b from-[#4A7BB0] to-[#274C77] flex items-center justify-center text-white shadow-[0_10px_20px_rgba(39,76,119,0.3)] z-10">
                <Target size={40} strokeWidth={1.5} />
              </div>
              <div className="bg-white rounded-3xl p-10 pt-16 text-center shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-gray-50 h-full flex flex-col justify-between transition-transform hover:-translate-y-2 duration-500">
                <div>
                  <h3 className="text-xl font-black text-[var(--text-heading)] mb-6 tracking-tight uppercase">Our Mission</h3>
                  <p className="text-slate-500 text-sm font-medium leading-loose">
                    DSEoriginals is more than a brand, it's a mission <br></br>
                    to create meaningful products that inspire faith, hope and love. Supporting evangelization and inspiration through social communications.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* CARD 3: OUR TEAM */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative pt-12"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full bg-gradient-to-b from-[#4A7BB0] to-[#274C77] flex items-center justify-center text-white shadow-[0_10px_20px_rgba(39,76,119,0.3)] z-10">
                <Users size={40} strokeWidth={1.5} />
              </div>
              <div className="bg-white rounded-3xl p-10 pt-16 text-center shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-gray-50 h-full flex flex-col justify-between transition-transform hover:-translate-y-2 duration-500">
                <div>
                  <h3 className="text-xl font-black text-[var(--text-heading)] mb-6 tracking-tight uppercase">Our Team</h3>
                  <p className="text-slate-500 text-sm font-medium leading-loose">
                    We are a community of witnesses, designers, and creators working together to maintain the highest standards while keeping our spiritual mission at the heart of our work.
                  </p>
                </div>
              </div>
            </motion.div>

          </div>
        </section>

      </div>
    </main>
  )
}