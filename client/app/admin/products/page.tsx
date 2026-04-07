"use client"

export const dynamic = "force-dynamic"

import { useEffect, useMemo, useState } from "react"
import { api, API_URL } from "@/lib/api"
import imageCompression from "browser-image-compression"

type Category = {
  id: string
  name: string
}

type Product = {
  id: string
  name: string
  description: string
  categoryId: string
  category: string
  image?: string | null
  price: string
  stock: string
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [editing, setEditing] = useState<Product | null>(null)

  const [form, setForm] = useState({
    name: "",
    description: "",
    categoryId: "",
    price: "",
    stock: "",
    image: null as File | null
  })

  const [preview, setPreview] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
  try {
    setLoading(true)

    const [productRes, categoryRes] = await Promise.all([
      api.get("/products"),
      api.get("/categories")
    ])

    // ✅ FIX: your API returns raw data already
    const productData = Array.isArray(productRes)
      ? productRes
      : productRes?.data || []

    const categoryData = Array.isArray(categoryRes)
      ? categoryRes
      : categoryRes?.data || []

    setCategories(categoryData)

      const mapped = productData.map((p: any) => {

      const categoryId = p.categoryId || ""

      const category = categoryData.find(
        (c: any) => c.id === categoryId
      )

      return {
        id: p.id,
        name: p.name,
        description: p.description || "",
        categoryId,
        category: category?.name || "Uncategorized",

        // ✅ GUARANTEED IMAGE
        image: p.image ?? null,

        price: String(p.price || 0),
        stock: "0"
      }
    })

    setProducts(mapped)

  } catch (err) {
    console.error(err)
    setProducts([])
    setCategories([])
  } finally {
    setLoading(false)
  }
}

  async function handleSubmit() {
  try {
    setSaving(true)
    setError("")

    if (!form.name || !form.categoryId || !form.price || !form.stock) {
      setError("All fields are required")
      return
    }

    const formData = new FormData()
    formData.append("name", form.name)
    formData.append("description", form.description)
    formData.append("categoryId", form.categoryId)
    formData.append("price", String(Number(form.price)))
    formData.append("stock", String(Number(form.stock)))

    if (form.image) {
      formData.append("image", form.image)
    }

    // 🚨 FORCE RAW REQUEST (NO WRAPPER, NO HEADERS)
    const res = await fetch(`${API_URL}/api/products`, {
      method: "POST",
      body: formData,
    })

    const data = await res.json()
    console.log("UPLOAD RESPONSE:", data)

    resetForm()
    fetchAll()

  } catch (err: any) {
    console.error("SAVE ERROR:", err)
    setError(err.message || "Save failed")
  } finally {
    setSaving(false)
  }
}

  function resetForm() {
    setEditing(null)
    setPreview(null)
    setForm({
      name: "",
      description: "",
      categoryId: "",
      price: "",
      stock: "",
      image: null
    })
  }

  function handleEdit(product: Product) {
    setEditing(product)
    setPreview(product.image || null)

    setForm({
      name: product.name,
      description: product.description,
      categoryId: product.categoryId,
      price: product.price,
      stock: product.stock,
      image: null
    })
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete product?")) return
    await api.delete(`/products/${id}`)
    fetchAll()
  }

  const filteredProducts = useMemo(() => {
    return products.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase())
    )
  }, [products, search])

  if (loading) {
    return <div className="py-20 text-center text-gray-500">Loading...</div>
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">

      <div>
        <h1 className="text-3xl font-semibold">Products</h1>
        <p className="text-gray-500 text-sm">Manage inventory</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">

        {/* FORM */}
        <div className="bg-white p-6 rounded-2xl border space-y-4">
          <h2 className="text-lg font-medium">
            {editing ? "Edit Product" : "Add Product"}
          </h2>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <input className="input" placeholder="Name"
            value={form.name}
            onChange={(e)=>setForm({...form,name:e.target.value})}
          />

          <textarea className="input" placeholder="Description"
            value={form.description}
            onChange={(e)=>setForm({...form,description:e.target.value})}
          />

          {/* ✅ FIXED DROPDOWN */}
          <select
            className="input"
            value={form.categoryId}
            onChange={(e)=>setForm({...form,categoryId:e.target.value})}
          >
            <option value="">Select Category</option>

            {loading && <option disabled>Loading categories...</option>}

            {!loading && categories.length === 0 && (
              <option disabled>No categories found</option>
            )}

            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-4">
            <input type="number" className="input" placeholder="Price"
              value={form.price}
              onChange={(e)=>setForm({...form,price:e.target.value})}
            />
            <input type="number" className="input" placeholder="Stock"
              value={form.stock}
              onChange={(e)=>setForm({...form,stock:e.target.value})}
            />
          </div>

          <input type="file"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (!file) return

              const compressed = await imageCompression(file, {
                maxSizeMB: 1,
                maxWidthOrHeight: 1200,
                useWebWorker: true
              })

              // ✅ FORCE it to be a real File
              const finalFile = new File(
                [compressed],
                file.name,
                { type: compressed.type }
              )

              setForm((prev) => ({
                ...prev,
                image: finalFile
              }))

              setPreview(URL.createObjectURL(finalFile))
            }}  
          />

          {preview && (
            <img src={preview} className="h-24 rounded-lg border" />
          )}

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="btn-primary w-full"
          >
            {saving ? "Saving..." : "Save Product"}
          </button>
        </div>

        {/* LIST */}
        <div className="bg-white p-6 rounded-2xl border">
          <input className="input mb-4"
            placeholder="Search..."
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
          />

          <div className="space-y-3">
            {filteredProducts.map(p => (
              <div key={p.id} className="flex justify-between items-center border p-3 rounded-lg">
                <div className="flex gap-3 items-center">
                  <img src={p.image ? p.image : "/placeholder.png"} className="w-10 h-10 rounded"/>
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-gray-500">{p.category}</div>
                  </div>
                </div>

                <div className="text-sm">
                  ₱{p.price} • {p.stock}
                </div>

                <div className="flex gap-2 text-sm">
                  <button onClick={()=>handleEdit(p)} className="text-blue-500">Edit</button>
                  <button onClick={()=>handleDelete(p.id)} className="text-red-500">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}