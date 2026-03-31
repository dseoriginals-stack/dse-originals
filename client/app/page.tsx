"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"

import ProductCard from "@/components/ProductCard"
import { api } from "@/lib/api"
import { transformProductToCard } from "@/lib/transformProduct"
import { ProductFull } from "@/types/product"
import { useRef } from "react"
import Image from "next/image"

const heroSlides = [
  {
    id: 1,
    title: "Wear Your Faith.",
    subtitle:
      "Premium faith-inspired essentials for students and organizations.",
  },
  {
    id: 2,
    title: "Live With Purpose.",
    subtitle:
      "Designed for young professionals and campus communities.",
  },
  {
    id: 3,
    title: "Represent Something Greater.",
    subtitle:
      "Built for impact. Crafted with excellence.",
  },
]

export default function HomePage() {
  const featuredRef = useRef<HTMLDivElement>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [products, setProducts] = useState<ProductFull[]>([])
  const [loading, setLoading] = useState(true)
  const scroll = (direction: "left" | "right") => {
  if (!featuredRef.current) return

  const scrollAmount = 300

  featuredRef.current.scrollBy({
    left: direction === "left" ? -scrollAmount : scrollAmount,
    behavior: "smooth",
  })
}
  /*
  HERO SLIDER
  */

  useEffect(() => {

    const interval = setInterval(() => {

      setCurrentSlide((prev) =>
        prev === heroImages.length - 1 ? 0 : prev + 1
      )

    }, 6000)

    return () => clearInterval(interval)

  }, [])

  /*
  FETCH PRODUCTS
  */

  useEffect(() => {
  let mounted = true

  const fetchProducts = async () => {
  try {
    const data = await api.get<{ data: ProductFull[] }>("/products")

    if (!mounted) return

    setProducts(data.data || [])
  } catch (err) {
    console.error("Product fetch failed", err)
    setProducts([])
  } finally {
    if (mounted) setLoading(false)
  }
}

  fetchProducts()

  return () => {
    mounted = false
  }
}, [])

  /*
  MEMOIZED PRODUCT GROUPS
  */

  const featured = useMemo(() => products.slice(0, 5), [products])
  const bestsellers = useMemo(() => products.slice(0, 4), [products])

  /*
  SKELETON
  */

    const SkeletonGrid = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="rounded-2xl overflow-hidden bg-gray-100 animate-pulse"
        >
          <div className="aspect-square bg-gray-200" />
          <div className="p-4 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )

  const heroImages = [
    "/hero1.png",
    "/hero2.png",
    "/hero3.png",
    "/hero4.png",
    "/hero5.png",
  ]

  return (

    <main>

      

        <section className="relative w-full h-[90vh] overflow-hidden">

  {/* IMAGES */}
  {heroImages.map((img, i) => (
  <Image
    key={i}
    src={img}
    alt="Hero"
    fill
    priority={i === 0}
    className={`object-cover transition-opacity duration-700 ${
      i === currentSlide ? "opacity-100" : "opacity-0"
    }`}
  />
))}

  {/* OVERLAY */}
  <div className="absolute inset-0" />
  
  {/* CONTENT */}
  <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-6">

  {/* <h1 className="
    text-3xl sm:text-4xl md:text-6xl 
    font-bold leading-tight mb-4 md:mb-6
    max-w-[280px] sm:max-w-md md:max-w-2xl
  ">
    Represent Something <br className="hidden sm:block" />
    Greater.
  </h1>

  <p className="
    text-sm sm:text-base md:text-lg 
    text-white/80 
    mb-6 md:mb-8 
    max-w-[260px] sm:max-w-md
  ">
    Join the community of students and organizations making an impact.
  </p> */}

  <Link
    href="/products"
    className="bg-white text-black px-6 py-3 rounded-full text-sm md:text-base font-medium hover:scale-95 transition"
  >
    Shop Collection →
  </Link>

</div>

</section>
<div className="max-w-7xl mx-auto px-4">
        {/* FEATURED */}
<section className="py-16 md:py-24">
  <div className="max-w-7xl mx-auto px-4">

    <div className="flex justify-between items-end mb-8">

  <div>
    <p className="text-xs tracking-widest text-gray-400 uppercase mb-2">
      Featured
    </p>

    <h2 className="text-3xl font-bold text-[var(--brand-primary)]">
      Featured Products
    </h2>
  </div>

  <Link href="/products" className="text-sm text-gray-500 hover:text-black">
    View All →
  </Link>

</div>

    {loading ? (
      <SkeletonGrid />
    ) : (
      <div className="relative">

        {/* LEFT FADE */}
        <div className="absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />

        {/* RIGHT FADE */}
        <div className="absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        {/* SCROLL CONTAINER */}
        <div
          ref={featuredRef}
          className="flex gap-5 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory pb-2 px-1"
        >

          {featured.map((p) => (
            <div
              key={p.id}
              className="min-w-[180px] md:min-w-[220px] snap-start"
            >
              <ProductCard product={transformProductToCard(p)} />
            </div>
          ))}

        </div>
      </div>
    )}

  </div>
</section>


<section className="py-16 md:py-24">
  <div className="max-w-7xl mx-auto px-4">

    {/* HEADER */}
    <div className="flex justify-between items-end mb-8">

      <div>
        <p className="text-xs tracking-widest text-gray-400 uppercase mb-2">
          Popular
        </p>

        <h2 className="text-2xl md:text-3xl font-bold text-[var(--brand-primary)]">
          Bestsellers
        </h2>
      </div>

    </div>

    {loading ? (
      <SkeletonGrid />
    ) : (

      <div className="relative">

        {/* LEFT FADE */}
        <div className="absolute left-0 top-0 h-full w-12 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />

        {/* RIGHT FADE */}
        <div className="absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

        {/* SCROLL */}
        <div className="
          flex gap-5 overflow-x-auto scrollbar-hide
          snap-x snap-mandatory pb-2 px-1
        ">

          {bestsellers.map((p) => (
            <div
              key={p.id}
              className="min-w-[180px] md:min-w-[220px] snap-start"
            >
              <ProductCard product={transformProductToCard(p)} />
            </div>
          ))}

        </div>

      </div>

    )}

  </div>
</section>


{/* ABOUT */}
<section className="py-16 md:py-24">
  <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">

    {/* TEXT */}
    <div>
      <h2 className="text-3xl md:text-4xl font-bold leading-tight">
        More Than a Brand.
      </h2>

      <p className="mt-6 text-gray-600 max-w-md">
        DSEoriginals empowers students and professionals to live with purpose.
      </p>

      <Link
        href="/stories"
        className="mt-6 inline-block bg-primary text-white px-6 py-3 rounded-full hover:opacity-90 transition"
      >
        Learn More
      </Link>
    </div>

    {/* IMAGE / VISUAL */}
    <div className="w-full h-80 md:h-96 bg-gray-100 rounded-3xl" />

  </div>
</section>


{/* TESTIMONIALS */}
<section className="py-16 md:py-24">
  <div className="max-w-7xl mx-auto px-4">

    <h2 className="text-2xl md:text-3xl text-center font-semibold mb-12">
      What Our Community Says
    </h2>

    <div className="grid md:grid-cols-3 gap-6">

      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition"
        >
          <p className="text-sm text-gray-600 leading-relaxed">
            “Premium quality and meaningful design.”
          </p>

          <p className="mt-4 font-semibold">
            Campus Organization
          </p>
        </div>
      ))}

    </div>

  </div>
</section>

      </div>

    </main>

  )

}