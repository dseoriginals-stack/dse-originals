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

    // ✅ USE API WRAPPER
    const data = await api.post("/products", formData)

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
    return (
      <div className="py-20 flex justify-center items-center gap-3 text-[var(--text-muted)] font-medium">
         <svg className="animate-spin h-6 w-6 text-[var(--brand-primary)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
         Synchronizing inventory...
      </div>
    )
  }

  return (
    <div className="space-y-8">

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-[var(--text-heading)] tracking-tight">Inventory Management</h1>
        <p className="text-[var(--text-muted)] font-medium">Add, edit, or remove products and categorizations from the global catalog.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">

        {/* FORM */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-[var(--border-light)] p-8 shadow-sm h-fit">
          <h2 className="text-xl font-bold text-[var(--text-heading)] mb-6">
            {editing ? "Edit Product" : "Add New Product"}
          </h2>

          {error && <p className="text-red-500 text-sm font-semibold mb-4 bg-red-50 py-2 px-3 rounded-lg border border-red-100">{error}</p>}

          <div className="space-y-4">
            <input className="w-full px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]/30 focus:border-[var(--brand-primary)] transition placeholder:text-gray-400 font-medium text-sm" placeholder="Product Name"
              value={form.name}
              onChange={(e)=>setForm({...form,name:e.target.value})}
            />

            <textarea className="w-full px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]/30 focus:border-[var(--brand-primary)] transition placeholder:text-gray-400 font-medium text-sm min-h-[100px] resize-y" placeholder="Product Description"
              value={form.description}
              onChange={(e)=>setForm({...form,description:e.target.value})}
            />

            <select
              className="w-full px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]/30 focus:border-[var(--brand-primary)] transition font-medium text-sm"
              value={form.categoryId}
              onChange={(e)=>setForm({...form,categoryId:e.target.value})}
            >
              <option value="">Select Category</option>
              {loading && <option disabled>Loading categories...</option>}
              {!loading && categories.length === 0 && (
                <option disabled>No categories found</option>
              )}
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-4">
              <input type="number" className="w-full px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]/30 focus:border-[var(--brand-primary)] transition placeholder:text-gray-400 font-medium text-sm" placeholder="Price (₱)"
                value={form.price}
                onChange={(e)=>setForm({...form,price:e.target.value})}
              />
              <input type="number" className="w-full px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]/30 focus:border-[var(--brand-primary)] transition placeholder:text-gray-400 font-medium text-sm" placeholder="Stock Quantity"
                value={form.stock}
                onChange={(e)=>setForm({...form,stock:e.target.value})}
              />
            </div>

            <div className="border-2 border-dashed border-[var(--border-light)] rounded-xl p-6 text-center hover:bg-[var(--bg-surface)] transition-colors cursor-pointer group relative overflow-hidden">
              <input type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  const compressed = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1200, useWebWorker: true })
                  const finalFile = new File([compressed], file.name, { type: compressed.type })
                  setForm((prev) => ({ ...prev, image: finalFile }))
                  setPreview(URL.createObjectURL(finalFile))
                }}  
              />
              <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 group-hover:text-[var(--brand-primary)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                <span className="text-sm font-semibold text-gray-500 group-hover:text-[var(--brand-primary)] transition-colors">Upload Product Image</span>
              </div>
            </div>

            {preview && (
              <div className="relative rounded-xl overflow-hidden shadow-sm h-32 w-fit border border-[var(--border-light)] group">
                <img src={preview} className="h-full object-cover" />
                <div onClick={()=> { setPreview(null); setForm(p => ({...p, image: null })) }} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer text-white font-bold text-xs uppercase tracking-widest">Remove</div>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={saving}
              className="btn-premium w-full mt-2"
            >
              {saving ? "Saving Data..." : (editing ? "Update Target" : "Deploy Product")}
            </button>
          </div>
        </div>

        {/* LIST */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-[var(--border-light)] p-8 shadow-sm flex flex-col max-h-[800px]">
          
          <div className="relative mb-6">
             <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
             </div>
            <input className="w-full pl-11 pr-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]/30 focus:border-[var(--brand-primary)] transition placeholder:text-gray-400 font-medium text-sm"
              placeholder="Search catalog..."
              value={search}
              onChange={(e)=>setSearch(e.target.value)}
            />
          </div>

          <div className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
            {filteredProducts.map(p => (
              <div key={p.id} className="flex justify-between items-center bg-[var(--bg-surface)] border border-[var(--border-light)] p-4 rounded-2xl hover:border-[var(--brand-primary)]/30 transition-colors group">
                <div className="flex gap-4 items-center">
                  <div className="w-14 h-14 rounded-xl overflow-hidden border border-[var(--border-light)] shadow-sm shrink-0">
                    <img src={p.image ? p.image : "/placeholder.png"} className="w-full h-full object-cover"/>
                  </div>
                  <div>
                    <div className="font-bold text-[var(--text-heading)] leading-tight mb-1">{p.name}</div>
                    <div className="text-xs font-semibold text-[var(--brand-accent)] uppercase tracking-wider">{p.category}</div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0 ml-4">
                  <div className="text-sm font-bold text-[var(--brand-primary)]">
                    ₱{Number(p.price).toLocaleString()}
                  </div>
                  <div className="flex gap-3 text-xs font-bold uppercase tracking-widest opacity-50 group-hover:opacity-100 transition-opacity">
                    <button onClick={()=>handleEdit(p)} className="text-[var(--brand-primary)] hover:text-[#1a2c47]">Edit</button>
                    <button onClick={()=>handleDelete(p.id)} className="text-red-500 hover:text-red-700">Drop</button>
                  </div>
                </div>
              </div>
            ))}
            {filteredProducts.length === 0 && (
              <div className="text-center py-10 text-[var(--text-muted)] italic font-medium">No products match your search.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}