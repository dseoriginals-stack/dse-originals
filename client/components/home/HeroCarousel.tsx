"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function HeroCarousel() {
  const [active, setActive] = useState(0)

  const slides = [
    {
      title: "Elevate Your Style",
      subtitle: "Discover premium perfumes & apparel",
    },
    {
      title: "Authentic DSE Collection",
      subtitle: "Limited releases available now",
    },
    {
      title: "Support Through Donations",
      subtitle: "Be part of the mission",
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative h-[80vh] min-h-[600px] bg-primary text-white flex items-center">

      <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/60"></div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-2xl space-y-6">

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
            {slides[active].title}
          </h1>

          <p className="text-lg text-light">
            {slides[active].subtitle}
          </p>

          <Link
            href="/products"
            className="inline-block bg-accent text-primary px-8 py-3 rounded-full font-semibold hover:scale-105 transition"
          >
            Shop Now
          </Link>

        </div>
      </div>

    </section>
  )
}