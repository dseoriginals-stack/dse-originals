"use client"

export default function DonatePage() {
  return (
    <div className="bg-gradient-to-br from-[#e7ecef] to-[#a3cef1] min-h-screen py-20">

      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl p-12 space-y-10 text-center">

        <h1 className="text-3xl font-bold text-primary">
          Support the Mission
        </h1>

        <p className="text-neutral">
          Your donation helps us continue crafting meaningful stories and premium products.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[500, 1000, 2000, 5000].map((amount) => (
            <button
              key={amount}
              className="bg-light py-4 rounded-xl font-semibold hover:bg-primary hover:text-white transition"
            >
              ₱{amount}
            </button>
          ))}
        </div>

        <input
          placeholder="Custom Amount"
          className="w-full border p-4 rounded-xl text-center"
        />

        <button className="bg-primary text-white px-10 py-4 rounded-full font-semibold">
          Donate Now
        </button>

      </div>
    </div>
  )
}