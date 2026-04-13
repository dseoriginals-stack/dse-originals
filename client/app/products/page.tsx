import { Suspense } from "react"
import ProductsClient from "./ProductsClient"

async function getProducts() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/products`,
      {
        next: { revalidate: 60 }
      }
    )

    if (!res.ok) {
      console.error("❌ API ERROR:", res.status)
      return []
    }

    const data = await res.json()

    return Array.isArray(data?.data) ? data.data : []
  } catch (err) {
    console.error("❌ FETCH FAILED:", err)
    return []
  }
}

export default async function ProductsPage() {
  const products = await getProducts()

  return (
    <Suspense fallback={
       <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center pt-24">
         <div className="w-12 h-12 border-4 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin" />
       </div>
    }>
      <ProductsClient initialProducts={products} />
    </Suspense>
  )
}