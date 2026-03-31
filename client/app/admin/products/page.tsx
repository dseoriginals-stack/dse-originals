"use client"

export const dynamic = "force-dynamic"

import { useEffect, useMemo, useState } from "react"
import { api, API_URL } from "@/lib/api"
import imageCompression from "browser-image-compression"

type ProductAPI = {
  id: string
  name: string
  description: string
  categoryId: string
  images: { url: string }[]
  variants: { price: number; stock: number }[]
}

type ProductsResponse = {
  data: ProductAPI[]
}

type Product = {
  id: string
  name: string
  description: string
  category: string
  image?: string | null
  price: number
  stock: number
}

type Category = {
  id: string
  name: string
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

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  async function fetchProducts() {
    try {
      const res = await api.get<ProductsResponse>("/products")

      const mapped = res.data.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        category: p.categoryId,
        image: p.images?.[0]?.url || null,
        price: Number(p.variants?.[0]?.price || 0),
        stock: p.variants?.[0]?.stock || 0
      }))

      setProducts(mapped)
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  async function fetchCategories() {
    try {
      const res = await api.get<Category[]>("/categories")
      setCategories(res || [])
    } catch {}
  }

  async function handleSubmit() {
    try {
      setSaving(true)

      const formData = new FormData()
      formData.append("name", form.name)
      formData.append("description", form.description)
      formData.append("categoryId", form.categoryId)
      formData.append("price", form.price)
      formData.append("stock", form.stock)

      if (form.image) formData.append("image", form.image)

      const url = editing
        ? `${API_URL}/products/${editing.id}`
        : `${API_URL}/products`

      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        credentials: "include",
        body: formData
      })

      if (!res.ok) throw new Error()

      resetForm()
      fetchProducts()

    } catch {
      alert("Save failed")
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
      categoryId: product.category,
      price: String(product.price),
      stock: String(product.stock),
      image: null
    })
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete product?")) return
    await api.delete(`/products/${id}`)
    fetchProducts()
  }

  const filteredProducts = useMemo(() => {
    return products.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase())
    )
  }, [products, search])

  if (loading) return <p>Loading...</p>

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold text-[#1a2a44]">
          Product Manager
        </h1>
        <p className="text-gray-500 text-sm">
          Create and manage your products
        </p>
      </div>

      {/* GRID */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* FORM */}
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">

          <h2 className="font-semibold">
            {editing ? "Edit Product" : "Add Product"}
          </h2>

          <input
            placeholder="Product Name"
            value={form.name}
            onChange={(e)=>setForm({...form,name:e.target.value})}
            className="input"
          />

          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e)=>setForm({...form,description:e.target.value})}
            className="input"
          />

          <select
            value={form.categoryId}
            onChange={(e)=>setForm({...form,categoryId:e.target.value})}
            className="input"
          >
            <option value="">Select Category</option>
            {categories.map(c=>(
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* IMAGE */}
          <div className="border border-dashed rounded-xl p-4 text-center">
            <input
              type="file"
              onChange={async (e)=>{
                const file = e.target.files?.[0]
                if (!file) return

                const compressed = await imageCompression(file, {
                  maxSizeMB: 1,
                  maxWidthOrHeight: 1200,
                  useWebWorker: true
                })

                setForm({...form,image:compressed})
                setPreview(URL.createObjectURL(compressed))
              }}
            />

            {preview && (
              <img src={preview} className="mt-3 h-24 mx-auto rounded" />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input
              placeholder="Price"
              value={form.price}
              onChange={(e)=>setForm({...form,price:e.target.value})}
              className="input"
            />
            <input
              placeholder="Stock"
              value={form.stock}
              onChange={(e)=>setForm({...form,stock:e.target.value})}
              className="input"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="btn-primary w-full"
          >
            {saving ? "Saving..." : editing ? "Update" : "Create"}
          </button>

        </div>

        {/* LIST */}
        <div className="bg-white rounded-2xl shadow-sm p-6">

          <input
            placeholder="Search products..."
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
            className="input mb-4"
          />

          <div className="space-y-3">

            {filteredProducts.map(product=>(
              <div key={product.id} className="flex justify-between items-center p-3 border rounded-xl">

                <div className="flex items-center gap-3">
                  <img
                    src={product.image || "/placeholder.png"}
                    className="w-12 h-12 rounded object-cover"
                  />

                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-500">
                      ₱{product.price}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 text-sm">
                  <button onClick={()=>handleEdit(product)} className="text-blue-500">
                    Edit
                  </button>
                  <button onClick={()=>handleDelete(product.id)} className="text-red-500">
                    Delete
                  </button>
                </div>

              </div>
            ))}

          </div>

        </div>

      </div>

    </div>
  )
}