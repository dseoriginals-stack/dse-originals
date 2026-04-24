import { Suspense } from "react"
import ProductsClient from "./ProductsClient"
import ProductSkeleton from "@/components/ui/ProductSkeleton"

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
       <div className="min-h-screen bg-[var(--bg-main)] pt-24 pb-12">
         <div className="container mx-auto px-4">
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
             {[...Array(8)].map((_, i) => (
               <ProductSkeleton key={i} />
             ))}
           </div>
         </div>
       </div>
    }>
      <ProductsClient initialProducts={products} />
    </Suspense>
  )
}