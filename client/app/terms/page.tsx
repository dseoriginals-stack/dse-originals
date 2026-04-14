"use client"

export default function TermsPage() {
  return (
    <div className="min-h-screen py-24 px-6 bg-[var(--bg-surface)]">

      {/* Background Decorators */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--brand-accent)]/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      <div className="max-w-3xl mx-auto bg-white/90 backdrop-blur-md rounded-3xl border border-[var(--border-light)] p-10 md:p-14 shadow-sm">

        <h1 className="text-3xl md:text-5xl font-extrabold text-[var(--text-heading)] tracking-tight mb-8">
          Terms of Service
        </h1>

        <div className="space-y-8 text-[var(--text-muted)] font-medium leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-[var(--text-heading)] mb-3">1. Agreement to Terms</h2>
            <p>
              By accessing our website and purchasing products from DSEoriginals, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you are prohibited from utilizing our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-heading)] mb-3">2. Products and Availability</h2>
            <p>
              We strive to display our premium apparel accurately. However, colors and materials may slightly vary based on your monitor. All products are subject to availability, and we reserve the right to discontinue any product at any given time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--brand-primary)] mb-3 border-l-4 border-[var(--brand-primary)] pl-4">3. Final Sales & Payment Policy</h2>
            <p className="bg-[var(--brand-soft)]/20 p-4 rounded-xl border border-[var(--brand-accent)]/20 font-semibold text-[var(--brand-primary)]">
              <strong>Strictly No Cash on Delivery (COD) and No Refunds.</strong> Every purchase made through DSEoriginals requires upfront digital payment. We do not support COD under any circumstances. Furthermore, to maintain our premium quality control, all sales are considered final and strict, and we do not issue refunds.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-heading)] mb-3">4. Intellectual Property</h2>
            <p>
              All content on this store, including typography, designs, product images, and branding, is the exclusive intellectual property of DSEoriginals. Copying or modifying our assets without authorization is strictly prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-heading)] mb-3">5. Governing Law</h2>
            <p>
              These Terms of Service are governed by and construed in accordance with local regulations. Any disputes shall be resolved in the jurisdiction where DSEoriginals operates.
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
