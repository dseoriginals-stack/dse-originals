import ProductsClient from "./ProductsClient"

async function getProducts() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/products`,
      {
        next: { revalidate: 60 }
      }
    )

    // ✅ DO NOT THROW — handle gracefully
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

  return <ProductsClient initialProducts={products} />
}