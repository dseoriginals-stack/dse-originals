"use client"

export const dynamic = "force-dynamic"

import { useEffect, useMemo, useState } from "react"
import { api } from "@/lib/api"
import imageCompression from "browser-image-compression"
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Package,
  AlertTriangle,
  CheckCircle,
  Image as ImageIcon,
  MoreVertical,
  X,
  Layers,
  Archive,
  QrCode,
  ArrowLeft
} from "lucide-react"
import toast from "react-hot-toast"
import QRScanner from "@/components/admin/QRScanner"

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
  price: number
  stock: number
  isBestseller: boolean
  isPopular: boolean
  variants?: any[]
  sku?: string
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [variantType, setVariantType] = useState<"size" | "volume" | "color_size">("size")
  
  type VariantRow = { 
    id: string; 
    optionValues: Record<string, string>; // Map option name to value
    price: string; 
    stock: string; 
    image?: File | null; 
    preview?: string | null 
  }
  const [variantsState, setVariantsState] = useState<VariantRow[]>([])
  
  // Input helpers for the two tables
  const [colorInput, setColorInput] = useState<{ id: string; value: string; image: File | null; preview: string | null }[]>([])
  const [sizeInput, setSizeInput] = useState<{ id: string; value: string }[]>([])
  
  const [form, setForm] = useState({
    name: "",
    description: "",
    categoryId: "",
    price: "",
    stock: "",
    isBestseller: false,
    isPopular: false,
    image: null as File | null
  })

  const [preview, setPreview] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchAll()
    const syncInterval = setInterval(fetchAll, 60000)
    return () => clearInterval(syncInterval)
  }, [])

  async function fetchAll() {
    try {
      setLoading(true)
      const [productRes, categoryRes] = await Promise.all([
        api.get(`/admin/products?cb=${Date.now()}`),
        api.get(`/categories?cb=${Date.now()}`)
      ])

      const productData = Array.isArray(productRes) ? productRes : productRes?.data || []
      const categoryData = Array.isArray(categoryRes) ? categoryRes : categoryRes?.data || []
      setCategories(categoryData)

      const mapped = productData.map((p: any) => {
        const cat = categoryData.find((c: any) => c.id === p.categoryId)
        const mainSku = p.variants?.[0]?.sku || ""

        // Extract nested data for the card view
        const image = p.images?.[0]?.url || p.image || null
        const price = p.variants?.[0]?.price ? Number(p.variants[0].price) : 0
        const stock = p.variants?.reduce((sum: number, v: any) => sum + (Number(v.stock) || 0), 0) || 0

        return {
          id: p.id,
          name: p.name,
          description: p.description || "",
          categoryId: p.categoryId,
          category: cat?.name || "Uncategorized",
          image,
          price,
          stock,
          isBestseller: !!p.isBestseller,
          isPopular: !!p.isPopular,
          sku: mainSku,
          variants: p.variants || []
        }
      })
      setProducts(mapped)
    } catch (err) {
      console.error(err)
      toast.error("Failed to sync inventory")
    } finally {
      setLoading(false)
    }
  }

  const handleScan = (decodedText: string) => {
    setShowScanner(false)
    setSearch(decodedText)

    // Check if item exists
    const found = products.find(p =>
      p.sku?.toLowerCase() === decodedText.toLowerCase() ||
      p.id?.toLowerCase() === decodedText.toLowerCase() ||
      p.variants?.some(v => v.sku?.toLowerCase() === decodedText.toLowerCase())
    )

    if (found) {
      toast.success(`Product Detected: ${found.name}`)
    } else {
      toast.error("Product code not recognized in catalog")
    }
  }

  async function handleSubmit() {
    try {
      setSaving(true)
      if (!form.name || !form.categoryId) {
        toast.error("Name and Category are required")
        return
      }

      const formData = new FormData()
      formData.append("name", form.name)
      formData.append("description", form.description)
      formData.append("categoryId", form.categoryId)
      const variants = variantsState.map((row) => ({
        id: row.id.length > 15 ? row.id : undefined,
        price: Number(row.price || form.price),
        stock: Number(row.stock || form.stock),
        preview: row.preview || null,
        attributes: Object.entries(row.optionValues).map(([name, value]) => ({ name, value }))
      }))

      formData.append("variants", JSON.stringify(variants))
      formData.append("isBestseller", String(form.isBestseller))
      formData.append("isPopular", String(form.isPopular))
      if (form.image) formData.append("image", form.image)

      // ✅ ADD VARIANT IMAGES
      variantsState.forEach((row, idx) => {
        if (row.image) {
          formData.append(`variant_image_${idx}`, row.image)
        }
      })

      if (editing) {
        await api.put(`/products/${editing.id}`, formData)
        toast.success("Product updated successfully")
      } else {
        await api.post("/products", formData)
        toast.success("New product deployed")
      }

      closeModal()
      fetchAll()
    } catch (err: any) {
      toast.error(err.message || "Operation failed")
    } finally {
      setSaving(false)
    }
  }

  function handleEdit(product: Product) {
    setEditing(product)

    setForm({
      name: product.name,
      description: product.description,
      categoryId: product.categoryId,
      price: String(product.price),
      stock: String(product.stock),
      isBestseller: product.isBestseller,
      isPopular: product.isPopular,
      image: null
    })

    if (product.variants?.length) {
      // Extract unique colors and sizes for the input tables
      const colorsMap = new Map<string, { value: string; preview: string | null }>()
      const sizes = new Set<string>()
      
      product.variants.forEach((v: any) => {
        let colorVal = ""
        v.attributes?.forEach((a: any) => {
          if (a.name === "Color") {
            colorVal = a.value
            if (!colorsMap.has(colorVal)) {
              colorsMap.set(colorVal, { value: colorVal, preview: v.image || null })
            }
          }
          if (a.name === "Size" || a.name === "Volume") sizes.add(a.value)
        })
      })
      
      setColorInput(Array.from(colorsMap.values()).map(c => ({ id: Math.random().toString(), value: c.value, image: null, preview: c.preview })))
      setSizeInput(Array.from(sizes).map(s => ({ id: Math.random().toString(), value: s })))

      const mapped: VariantRow[] = product.variants.map((v: any) => {
        const optionValues: Record<string, string> = {}
        v.attributes?.forEach((a: any) => {
          optionValues[a.name] = a.value
        })

        return {
          id: v.id,
          optionValues,
          price: String(v.price ?? ""),
          stock: String(v.stock ?? ""),
          preview: v.image || null,
          image: null
        }
      })
      setVariantsState(mapped)
    } else {
      setColorInput([])
      setSizeInput([])
      setVariantsState([])
    }

    setPreview(product.image || null)
    setShowModal(true)
  }

  function closeModal() {
    setEditing(null)
    setShowModal(false)
    setColorInput([])
    setSizeInput([])
    setForm({ name: "", description: "", categoryId: "", price: "", stock: "", isBestseller: false, isPopular: false, image: null })
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure? This will remove the product permanently.")) return
    try {
      await api.delete(`/products/${id}`)
      toast.success("Product archived")
      fetchAll()
    } catch (err) {
      toast.error("Archive failed")
    }
  }

  const filteredProducts = useMemo(() => {
    return products.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase()) ||
      p.id?.toLowerCase().includes(search.toLowerCase())
    )
  }, [products, search])

  const isInitialLoading = loading && products.length === 0

  return (
    <div className="space-y-8 pb-20">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-[1000] text-[var(--text-heading)] tracking-tighter">Inventory Console</h1>
          <p className="text-[var(--text-muted)] text-sm font-bold uppercase tracking-wider mt-1">Catalog management & Stock Control</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-premium !py-3 !px-6 text-sm !font-black uppercase tracking-widest flex items-center gap-2 shadow-xl"
        >
          <Plus size={18} strokeWidth={3} /> Add Product
        </button>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="bg-white rounded-[2rem] border border-[var(--border-light)] p-4 flex flex-col md:flex-row gap-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            placeholder="Search catalog by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-[var(--bg-surface)] border border-transparent focus:bg-white focus:border-[var(--brand-primary)] rounded-[1.5rem] text-sm font-bold focus:outline-none transition-all shadow-inner"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowScanner(true)}
            className="px-6 py-4 bg-white border border-[var(--border-light)] rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition shadow-sm flex items-center gap-2 text-[var(--brand-primary)]"
          >
            <QrCode size={18} /> Scan QR
          </button>
          <button className="px-6 py-4 bg-white border border-[var(--border-light)] rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition shadow-sm flex items-center gap-2">
            <Layers size={14} /> Categories
          </button>
          <button className="px-6 py-4 bg-white border border-[var(--border-light)] rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition shadow-sm flex items-center gap-2">
            <Archive size={14} /> Archived
          </button>
        </div>
      </div>

      {/* PRODUCT GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
        {isInitialLoading ? (
          Array(6).fill(0).map((_, i) => <SkeletonProductCard key={i} />)
        ) : (
          <>
            {filteredProducts.map(p => (
              <ProductCard key={p.id} product={p} onEdit={() => handleEdit(p)} onDelete={() => handleDelete(p.id)} />
            ))}
            {!isInitialLoading && filteredProducts.length === 0 && (
              <div className="col-span-full py-32 text-center text-[var(--text-muted)] italic font-bold">
                No products match your current search criteria.
              </div>
            )}
          </>
        )}
      </div>

      {/* MODALS */}
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-[var(--bg-surface)] flex flex-col animate-fade-in overflow-y-auto custom-scrollbar">
          {/* TOP BAR */}
          <div className="sticky top-0 z-20 bg-white border-b border-[var(--border-light)] px-8 py-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-xl transition">
                <ArrowLeft size={20} className="text-gray-500" />
              </button>
              <h1 className="text-xl font-[1000] text-[var(--text-heading)] tracking-tighter">
                {editing ? "Edit Product" : "Add Product"}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={closeModal} className="px-6 py-2.5 rounded-xl border border-[var(--border-light)] text-xs font-bold text-gray-500 hover:bg-gray-50 transition">Discard</button>
              <button 
                onClick={handleSubmit} 
                className="px-6 py-2.5 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-black uppercase tracking-widest shadow-lg hover:opacity-90 transition flex items-center gap-2"
                disabled={saving}
              >
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Save Product"}
              </button>
            </div>
          </div>

          <div className="max-w-4xl mx-auto w-full p-8">
            {/* LEFT COLUMN: CORE INFO & VARIANTS */}
            <div className="space-y-8">
              {/* PRODUCT INFORMATION */}
              <div className="bg-white rounded-3xl border border-[var(--border-light)] p-8 shadow-sm space-y-6">
                <h3 className="text-sm font-black text-[var(--text-heading)] tracking-tight">Product Information</h3>
                
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Name <span className="text-red-500">*</span></label>
                  <input 
                    placeholder="Enter product name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-5 py-3 bg-white border border-[var(--border-light)] rounded-xl focus:ring-2 focus:ring-[var(--brand-primary)] focus:outline-none font-bold text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Description <span className="text-red-500">*</span></label>
                  <div className="border border-[var(--border-light)] rounded-2xl overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b border-[var(--border-light)] flex gap-4 text-gray-400">
                      <span className="text-xs font-bold">Paragraph</span>
                      <div className="w-[1px] h-4 bg-gray-200" />
                      <span className="text-xs">B</span>
                      <span className="text-xs">I</span>
                      <span className="text-xs underline">U</span>
                    </div>
                    <textarea 
                      placeholder="Write product description..."
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="w-full p-5 min-h-[150px] focus:outline-none text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Category <span className="text-red-500">*</span></label>
                    <select
                      value={form.categoryId}
                      onChange={(e: any) => {
                        const selectedId = e.target.value
                        setForm({ ...form, categoryId: selectedId })
                        
                        const selectedCat = categories.find(c => c.id === selectedId)
                          if (selectedCat && !editing) {
                            const catName = selectedCat.name.toLowerCase()
                          if (colorInput.length === 0 && sizeInput.length === 0) {
                            if (catName.includes('perfume')) {
                              setSizeInput([
                                { id: "v1", value: "55ml" },
                                { id: "v2", value: "30ml" }
                              ])
                            } else if (catName.includes('apparel') || catName.includes('clothing')) {
                              setColorInput([
                                { id: "c1", value: "Black", image: null, preview: null },
                                { id: "c2", value: "White", image: null, preview: null }
                              ])
                              setSizeInput([
                                { id: "s1", value: "XS" },
                                { id: "s2", value: "S" },
                                { id: "s3", value: "M" },
                                { id: "s4", value: "L" },
                                { id: "s5", value: "XL" },
                                { id: "s6", value: "2XL" }
                              ])
                            }
                          }
                        }
                      }}
                      className="w-full px-5 py-3 bg-white border border-[var(--border-light)] rounded-xl focus:ring-2 focus:ring-[var(--brand-primary)] focus:outline-none font-bold text-sm"
                    >
                      <option value="">Select category</option>
                      {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">BestSeller</label>
                    <div className="flex items-center gap-3 px-5 py-3 bg-gray-50 border border-transparent rounded-xl cursor-pointer hover:bg-gray-100 transition" onClick={() => setForm({...form, isBestseller: !form.isBestseller})}>
                      <input type="checkbox" checked={form.isBestseller} readOnly className="w-4 h-4 rounded border-gray-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]" />
                      <span className="text-sm font-bold text-gray-600">Mark as BestSeller</span>
                    </div>
                  </div>
                </div>
              </div>              {/* STEP 1: DEFINE ATTRIBUTES */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl border border-[var(--border-light)] p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-black text-[var(--text-heading)]">1. Available Colors</h3>
                    <button type="button" onClick={() => setColorInput([...colorInput, { id: Date.now().toString(), value: "", image: null, preview: null }])} className="text-[10px] font-black uppercase text-[var(--brand-primary)]">+ Add</button>
                  </div>
                  <div className="space-y-4">
                    {colorInput.map((c, idx) => (
                      <div key={c.id} className="flex items-center gap-4 bg-gray-50/50 p-3 rounded-2xl border border-gray-100/50">
                        <div className="relative w-16 h-16 rounded-xl bg-white border border-gray-100 flex items-center justify-center overflow-hidden shrink-0 group">
                          {c.preview ? (
                            <img src={c.preview} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon size={20} className="text-gray-300" />
                          )}
                          <input 
                            type="file" 
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                            onChange={async (e: any) => {
                              const f = e.target.files?.[0]; if (!f) return;
                              const comp = await imageCompression(f, { maxSizeMB: 1 });
                              const next = [...colorInput];
                              next[idx].image = new File([comp], f.name, { type: comp.type });
                              next[idx].preview = URL.createObjectURL(comp);
                              setColorInput(next);
                            }}
                          />
                        </div>
                        <input 
                          value={c.value} 
                          onChange={(e) => {
                            const next = [...colorInput]; next[idx].value = e.target.value; setColorInput(next)
                          }} 
                          className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold" 
                          placeholder="e.g. Black" 
                        />
                        <button onClick={() => setColorInput(colorInput.filter(i => i.id !== c.id))} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={16}/></button>
                      </div>
                    ))}
                  </div>
                </div>
 
                <div className="bg-white rounded-3xl border border-[var(--border-light)] p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-black text-[var(--text-heading)]">2. Available Sizes/Volumes</h3>
                    <button type="button" onClick={() => setSizeInput([...sizeInput, { id: Date.now().toString(), value: "" }])} className="text-[10px] font-black uppercase text-[var(--brand-primary)]">+ Add</button>
                  </div>
                  <div className="space-y-2">
                    {sizeInput.map((s, idx) => (
                      <div key={s.id} className="flex items-center gap-2 bg-gray-50/50 p-3 rounded-xl border border-gray-100/50">
                        <input 
                          value={s.value} 
                          onChange={(e) => {
                            const next = [...sizeInput]; next[idx].value = e.target.value; setSizeInput(next)
                          }} 
                          className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold" 
                          placeholder="e.g. XL" 
                        />
                        <button onClick={() => setSizeInput(sizeInput.filter(i => i.id !== s.id))} className="p-2 text-gray-300 hover:text-red-500 rounded-lg transition"><Trash2 size={16}/></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* STEP 2: GENERATE MATRIX */}
              <button 
                type="button"
                onClick={() => {
                  const colors = colorInput.map(c => c.value).filter(v => v)
                  const sizes = sizeInput.map(s => s.value).filter(v => v)
                  
                  if (colors.length === 0 && sizes.length === 0) return
                  
                  // Decide attribute names based on category
                  const sizeAttrName = categories.find(c => c.id === form.categoryId)?.name.toLowerCase().includes('perfume') ? "Volume" : "Size"
                  
                  const combos = []
                  if (colors.length > 0 && sizes.length > 0) {
                    for (const c of colors) {
                      for (const s of sizes) {
                        combos.push({ Color: c, [sizeAttrName]: s })
                      }
                    }
                  } else if (colors.length > 0) {
                    for (const c of colors) combos.push({ Color: c })
                  } else {
                    for (const s of sizes) combos.push({ [sizeAttrName]: s })
                  }

                  const newMatrix = combos.map(combo => {
                    const existing = variantsState.find(v => 
                      Object.entries(combo).every(([n, val]) => v.optionValues[n] === val)
                    )
                    
                    // Automatically assign image from color input if available
                    const colorVal = combo.Color
                    const colorData = colorInput.find(c => c.value === colorVal)

                    return existing || {
                      id: Math.random().toString(36).substr(2, 9),
                      optionValues: combo,
                      price: form.price,
                      stock: form.stock || "0",
                      image: colorData?.image || null,
                      preview: colorData?.preview || null
                    }
                  })
                  setVariantsState(newMatrix)
                  toast.success(`${newMatrix.length} Combinations Ready`)
                }}
                className="w-full py-4 bg-[var(--brand-primary)]/5 border-2 border-dashed border-[var(--brand-primary)]/20 rounded-2xl text-[var(--brand-primary)] text-[11px] font-black uppercase tracking-widest hover:bg-[var(--brand-primary)]/10 transition flex items-center justify-center gap-3"
              >
                <Layers size={18} /> Sync & Generate Variant Matrix
              </button>

              {/* STEP 3: MANAGE MATRIX */}
              <div className="bg-white rounded-3xl border border-[var(--border-light)] p-8 shadow-sm">
                <h3 className="text-sm font-black text-[var(--text-heading)] mb-6">3. Variant Matrix (Prices & Images)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">
                        <th className="pb-4 pl-4">Combo</th>
                        <th className="pb-4">Price</th>
                        <th className="pb-4">Stock</th>
                        <th className="pb-4">Image</th>
                        <th className="pb-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {variantsState.map((row, idx) => (
                        <tr key={row.id} className="group hover:bg-gray-50/50 transition">
                          <td className="py-4 pl-4">
                            <div className="flex gap-1">
                              {Object.values(row.optionValues).map((v, i) => (
                                <span key={i} className="px-2 py-1 bg-gray-100 rounded text-[9px] font-bold uppercase">{v}</span>
                              ))}
                            </div>
                          </td>
                          <td className="py-4">
                            <input type="number" value={row.price} onChange={(e) => {
                              const next = [...variantsState]; next[idx].price = e.target.value; setVariantsState(next)
                            }} className="w-24 bg-white border border-gray-200 rounded-lg px-2 py-1 text-sm font-bold" />
                          </td>
                          <td className="py-4">
                            <input type="number" value={row.stock} onChange={(e) => {
                              const next = [...variantsState]; next[idx].stock = e.target.value; setVariantsState(next)
                            }} className="w-20 bg-white border border-gray-200 rounded-lg px-2 py-1 text-sm font-bold" />
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              {row.preview && <img src={row.preview} className="w-8 h-8 rounded object-cover" />}
                              <button className="relative w-8 h-8 rounded border-2 border-dashed border-gray-100 flex items-center justify-center text-gray-300">
                                <Plus size={12} />
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={async (e: any) => {
                                  const f = e.target.files?.[0]; if (!f) return;
                                  const comp = await imageCompression(f, { maxSizeMB: 1 });
                                  const next = [...variantsState]
                                  next[idx].image = new File([comp], f.name, { type: comp.type })
                                  next[idx].preview = URL.createObjectURL(comp)
                                  setVariantsState(next)
                                }} />
                              </button>
                            </div>
                          </td>
                          <td className="py-4 pr-4 text-right">
                            <button onClick={() => setVariantsState(variantsState.filter(v => v.id !== row.id))} className="text-gray-300 hover:text-red-500"><Trash2 size={14}/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {showScanner && <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />}
    </div>
  )
}

function ProductCard({ product, onEdit, onDelete }: { product: Product, onEdit: any, onDelete: any }) {
  const isLowStock = product.stock > 0 && product.stock <= 5
  const isOutOfStock = product.stock === 0
  return (
    <div className="bg-white rounded-3xl border border-[var(--border-light)] p-3 shadow-sm hover:shadow-lg transition-all duration-300 group relative flex flex-col h-full">
      <div className="absolute top-3 right-3 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onEdit} className="p-1.5 bg-white rounded-lg shadow-md border border-gray-100 text-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-white transition"><Edit3 size={12} /></button>
        <button onClick={onDelete} className="p-1.5 bg-white rounded-lg shadow-md border border-gray-100 text-red-500 hover:bg-red-500 hover:text-white transition"><Trash2 size={12} /></button>
      </div>
      <div className="w-full aspect-square rounded-2xl bg-[var(--bg-surface)] border border-gray-100 overflow-hidden relative mb-3">
        {product.image ? (
          <img src={product.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={product.name} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={24} /></div>
        )}

        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isBestseller && (
            <div className="bg-amber-400 text-[#274C77] px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tight shadow-sm flex items-center gap-0.5">
              <CheckCircle size={8} /> Best Seller
            </div>
          )}
          {product.isPopular && (
            <div className="bg-[var(--brand-soft)] text-white px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tight shadow-sm flex items-center gap-0.5">
              <Plus size={8} /> Popular
            </div>
          )}
        </div>

        {(isLowStock || isOutOfStock) && (
          <div className={`absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tight flex items-center gap-0.5 shadow-md ${isOutOfStock ? "bg-red-500 text-white" : "bg-amber-500 text-white"}`}>
            <AlertTriangle size={8} /> {isOutOfStock ? "Zero Stock" : `Low: ${product.stock}`}
          </div>
        )}
      </div>
      <div className="flex flex-col flex-1">
        <div className="flex justify-between items-start mb-0.5">
          <span className="text-[8px] font-black uppercase tracking-widest text-[var(--brand-accent)]">{product.category}</span>
          <span className="text-xs font-black text-[var(--brand-primary)]">₱{product.price.toLocaleString()}</span>
        </div>
        <h3 className="text-xs font-bold text-[var(--text-heading)] leading-tight line-clamp-2 mb-2 min-h-[2rem]">{product.name}</h3>

        <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-gray-400">
            <div className={`w-1.5 h-1.5 rounded-full ${isOutOfStock ? 'bg-red-500' : 'bg-emerald-500'}`} />
            {product.stock} Units
          </div>
        </div>
      </div>
    </div>
  )
}

function InputField({ label, value, onChange, type = "text", placeholder }: any) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">{label}</label>
      <input type={type} value={value} onChange={(e: any) => onChange(e.target.value)} className="w-full px-5 py-4 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] text-sm font-bold transition-all" placeholder={placeholder} />
    </div>
  )
}

function SkeletonProductCard() {
  return <div className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm animate-pulse h-[350px]" />
}