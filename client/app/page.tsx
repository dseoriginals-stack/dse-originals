import HomePage from "./HomePage"
import { API_URL } from "@/lib/api"

async function getProducts() {
  try {
    if (!API_URL) {
      throw new Error("API_URL is undefined")
    }

    const res = await fetch(`${API_URL}/products?limit=8`, {
      next: { revalidate: 60 },
    })

    if (!res.ok) {
      throw new Error(`Fetch failed: ${res.status}`)
    }

    const data = await res.json()
    return data
  } catch (err) {
    console.error("getProducts error:", err)
    return { data: [] }
  }
}

export default async function Page() {
  const data = await getProducts()

  return <HomePage initialProducts={data.data || []} />
}