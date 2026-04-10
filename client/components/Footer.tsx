"use client"

import Link from "next/link"
import { Facebook, Instagram, Twitter, Mail, MapPin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-white/80 backdrop-blur-xl border-t border-[var(--border-light)] py-6 mt-auto z-10 relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <p className="text-[10px] md:text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
            &copy; {new Date().getFullYear()} DSE Originals. All Rights Reserved.
          </p>
          <div className="flex flex-wrap justify-center md:justify-end items-center gap-4 md:gap-6 text-[10px] md:text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
            <Link href="/privacy" className="hover:text-[var(--brand-primary)] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[var(--brand-primary)] transition-colors">Terms of Service</Link>
            <Link href="/track" className="hover:text-[var(--brand-primary)] transition-colors text-[var(--brand-primary)]">Track Order</Link>
          </div>
        </div>

      </div>
    </footer>
  )
}
