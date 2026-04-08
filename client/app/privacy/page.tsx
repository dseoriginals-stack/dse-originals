"use client"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-24 px-6 bg-[var(--bg-surface)]">
      
      {/* Background Decorators */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[var(--brand-primary)]/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      <div className="max-w-3xl mx-auto bg-white/90 backdrop-blur-md rounded-3xl border border-[var(--border-light)] p-10 md:p-14 shadow-sm">
        
        <h1 className="text-3xl md:text-5xl font-extrabold text-[var(--text-heading)] tracking-tight mb-8">
          Privacy Policy
        </h1>
        
        <div className="space-y-8 text-[var(--text-muted)] font-medium leading-relaxed">
          
          <section>
            <h2 className="text-xl font-bold text-[var(--text-heading)] mb-3">1. Information We Collect</h2>
            <p>
              At DSE Originals, we value your privacy and security. We collect minimal data required to process your orders efficiently, including your name, email address, shipping destination, and securely encrypted payment details.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-heading)] mb-3">2. How We Use Your Data</h2>
            <p>
              Your data is strictly utilized for the fulfillment of your orders, shipping logistics, and responding to your customer support queries. We occasionally use your email to send updates about new collections if you have opted in.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-heading)] mb-3">3. Secure Transactions</h2>
            <p>
              All payment transactions run through highly secure, encrypted gateways. We do not store your raw credit card information on our servers. 
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--brand-primary)] mb-3 border-l-4 border-[var(--brand-primary)] pl-4">4. Payment & Refunds (Important)</h2>
            <p className="bg-[var(--brand-soft)]/20 p-4 rounded-xl border border-[var(--brand-accent)]/20 font-semibold text-[var(--brand-primary)]">
              Please be advised that we do not support Cash on Delivery (COD). All orders must be fully paid via our secure digital payment gateways prior to fulfillment. Additionally, all sales are final. We do not process refunds or returns unless an item arrives critically defective.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-heading)] mb-3">5. Data Protection Rights</h2>
            <p>
              Under global data protection regulations, you possess the right to access, alter, or request the deletion of any personal data stored on our systems. To invoke these rights, please contact our support team.
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
