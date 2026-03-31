import HomePage from "./HomePage"
import { api } from "@/lib/api"

async function getProducts() {
  try {
    const data = await api.get("products?limit=8")
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