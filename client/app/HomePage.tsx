"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"

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
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const featured = useMemo(() => products.slice(0, 6), [products])
  const bestsellers = useMemo(() => products.slice(0, 8), [products])

  return (
    <main className="bg-white">

      {/* ================= HERO ================= */}
      <section className="relative w-full h-[85vh] md:h-[90vh] overflow-hidden">

        {/* Background Images (crossfade) */}
        {heroImages.map((img, i) => (
          <Image
            key={i}
            src={img}
            alt="Hero"
            fill
            priority={i === 0}
            sizes="100vw"
            className={`
              object-cover absolute inset-0
              transition-opacity duration-1000
              ${i === currentSlide ? "opacity-100" : "opacity-0"}
            `}
          />
        ))}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-6 space-y-6">

          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight max-w-2xl">
            Elevate Your Everyday Style
          </h1>

          <p className="text-sm md:text-base text-white/80 max-w-md">
            Premium fragrances and essentials crafted for confidence and presence.
          </p>

          <Link
            href="/products"
            className="
              bg-white text-black px-7 py-3 rounded-full 
              text-sm md:text-base font-medium 
              hover:scale-95 transition
            "
          >
            Shop Collection →
          </Link>

        </div>

      </section>

      {/* ================= CONTENT ================= */}
      <div className="max-w-7xl mx-auto px-4">

        {/* FEATURED */}
        <section className="py-14 md:py-20">

          <div className="flex justify-between items-end mb-8">
            <div>
              <p className="text-xs tracking-widest text-gray-400 uppercase mb-2">
                Featured
              </p>
              <h2 className="text-2xl md:text-3xl font-semibold text-[var(--brand-primary)]">
                Featured Products
              </h2>
            </div>

            <Link
              href="/products"
              className="text-sm text-gray-500 hover:text-black transition"
            >
              View All →
            </Link>
          </div>

          <div className="flex gap-5 overflow-x-auto scrollbar-hide snap-x pb-2">
            {featured.map((p) => (
              <div key={p.id} className="min-w-[180px] md:min-w-[220px] snap-start">
                <ProductCard product={transformProductToCard(p)} />
              </div>
            ))}
          </div>

        </section>

        {/* BESTSELLERS */}
        <section className="py-14 md:py-20">

          <div className="mb-8">
            <p className="text-xs tracking-widest text-gray-400 uppercase mb-2">
              Popular
            </p>

            <h2 className="text-2xl md:text-3xl font-semibold text-[var(--brand-primary)]">
              Bestsellers
            </h2>
          </div>

          <div className="flex gap-5 overflow-x-auto scrollbar-hide snap-x pb-2">
            {bestsellers.map((p) => (
              <div key={p.id} className="min-w-[180px] md:min-w-[220px] snap-start">
                <ProductCard product={transformProductToCard(p)} />
              </div>
            ))}
          </div>

        </section>

      </div>

    </main>
  )
}