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
  QrCode
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
  const [variantType, setVariantType] = useState<"size" | "volume">("size")

  const [variantOptions, setVariantOptions] = useState<string[]>(["M"])

  const [variantData, setVariantData] = useState<Record<string, { price: string; stock: string; image?: File | null; preview?: string | null }>>({
    M: { price: "", stock: "", image: null, preview: null },
  })
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
      if (!form.name || !form.categoryId || !form.price || !form.stock) {
        toast.error("All core fields are required")
        return
      }

      const formData = new FormData()
      formData.append("name", form.name)
      formData.append("description", form.description)
      formData.append("categoryId", form.categoryId)
      const variants = variantOptions.map((opt) => ({
        price: Number(variantData[opt]?.price || form.price),
        stock: Number(variantData[opt]?.stock || form.stock),
        attributes: [
          {
            name: variantType === "size" ? "Size" : "Volume",
            value: opt,
          },
        ],
      }))

      formData.append("variants", JSON.stringify(variants))
      formData.append("isBestseller", String(form.isBestseller))
      formData.append("isPopular", String(form.isPopular))
      if (form.image) formData.append("image", form.image)

      // ✅ ADD VARIANT IMAGES
      variantOptions.forEach((opt, idx) => {
        if (variantData[opt]?.image) {
          formData.append(`variant_image_${idx}`, variantData[opt].image!)
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
      const firstAttr = product.variants[0]?.attributes?.[0]?.value || "M"
      const firstAttrName = product.variants[0]?.attributes?.[0]?.name || "Size"

      setVariantType(firstAttrName.toLowerCase() === "volume" ? "volume" : "size")

      const options = product.variants.map((v: any) => v.attributes?.[0]?.value).filter(Boolean)
      setVariantOptions(options)

      const mapped: Record<string, { price: string; stock: string; preview?: string | null }> = {}
      product.variants.forEach((v: any) => {
        const key = v.attributes?.[0]?.value
        if (key) {
          mapped[key] = {
            price: String(v.price ?? ""),
            stock: String(v.stock ?? ""),
            preview: v.image || null
          }
        }
      })

      setVariantData(mapped as any)
    }

    setPreview(product.image || null)
    setShowModal(true)
  }

  function closeModal() {
    setEditing(null)
    setShowModal(false)
    setPreview(null)
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
        <div className="fixed inset-0 z-[100] bg-[var(--bg-surface)] flex flex-col animate-fade-in overflow-y-auto custom-scrollbar">
          {/* TOP BAR */}
          <div className="sticky top-0 z-20 bg-white border-b border-[var(--border-light)] px-8 py-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-xl transition">
                <ArrowLeft size={20} className="text-gray-500" />
              </button>
              <h1 className="text-xl font-[1000] text-[var(--text-heading)] tracking-tighter">Add Product</h1>
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

          <div className="max-w-7xl mx-auto w-full p-8 grid lg:grid-cols-12 gap-8">
            {/* LEFT COLUMN: CORE INFO & VARIANTS */}
            <div className="lg:col-span-8 space-y-8">
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
                      onChange={(e: any) => setForm({ ...form, categoryId: e.target.value })}
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
              </div>

              {/* VARIANTS SECTION */}
              <div className="bg-white rounded-3xl border border-[var(--border-light)] p-8 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-black text-[var(--text-heading)] tracking-tight">Variants</h3>
                    <p className="text-[11px] text-gray-400 font-medium">Add variants (e.g., size, color) with their own price, stock and images.</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => {
                      const next = variantOptions.length === 0 ? "M" : `Option ${variantOptions.length + 1}`
                      setVariantOptions([...variantOptions, next])
                      setVariantData({...variantData, [next]: { price: form.price, stock: "0", image: null, preview: null }})
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border-light)] text-[11px] font-black uppercase tracking-widest hover:bg-gray-50 transition"
                  >
                    <Plus size={14} /> Add Variant
                  </button>
                </div>

                <div className="overflow-x-auto mt-6">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[11px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">
                        <th className="pb-4 pl-12">Variant (Size / Color)</th>
                        <th className="pb-4">Cost</th>
                        <th className="pb-4">Stock</th>
                        <th className="pb-4">Images</th>
                        <th className="pb-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {variantOptions.map((opt, idx) => (
                        <tr key={opt} className="group hover:bg-gray-50/50 transition">
                          <td className="py-4 relative">
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col gap-0.5 opacity-20">
                              <div className="grid grid-cols-2 gap-0.5">
                                <div className="w-1 h-1 rounded-full bg-gray-900" />
                                <div className="w-1 h-1 rounded-full bg-gray-900" />
                              </div>
                              <div className="grid grid-cols-2 gap-0.5">
                                <div className="w-1 h-1 rounded-full bg-gray-900" />
                                <div className="w-1 h-1 rounded-full bg-gray-900" />
                              </div>
                              <div className="grid grid-cols-2 gap-0.5">
                                <div className="w-1 h-1 rounded-full bg-gray-900" />
                                <div className="w-1 h-1 rounded-full bg-gray-900" />
                              </div>
                            </div>
                            <div className="flex gap-2 pl-12 pr-4">
                              <select className="bg-white border border-[var(--border-light)] rounded-lg px-3 py-2 text-sm font-bold w-full focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]">
                                <option>{variantType === 'size' ? 'Size' : 'Volume'}</option>
                              </select>
                              <select className="bg-white border border-[var(--border-light)] rounded-lg px-3 py-2 text-sm font-bold w-full focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]" value={opt}>
                                <option value={opt}>{opt}</option>
                              </select>
                            </div>
                          </td>
                          <td className="py-4">
                            <input 
                              type="number"
                              placeholder="₱ 0.00"
                              value={variantData[opt]?.price || ""}
                              onChange={(e) => setVariantData({...variantData, [opt]: { ...variantData[opt], price: e.target.value }})}
                              className="w-32 bg-white border border-[var(--border-light)] rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
                            />
                          </td>
                          <td className="py-4">
                            <input 
                              type="number"
                              placeholder="0"
                              value={variantData[opt]?.stock || ""}
                              onChange={(e) => setVariantData({...variantData, [opt]: { ...variantData[opt], stock: e.target.value }})}
                              className="w-24 bg-white border border-[var(--border-light)] rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
                            />
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              {variantData[opt]?.preview ? (
                                <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-gray-100 shadow-sm">
                                  <img src={variantData[opt].preview!} className="w-full h-full object-cover" />
                                </div>
                              ) : null}
                              <button className="w-10 h-10 rounded-lg border-2 border-dashed border-gray-100 flex items-center justify-center text-gray-300 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition relative overflow-hidden group/vup">
                                <Plus size={16} />
                                <input 
                                  type="file" 
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                  onChange={async (e: any) => {
                                    const f = e.target.files?.[0]; if (!f) return;
                                    const comp = await imageCompression(f, { maxSizeMB: 0.5, maxWidthOrHeight: 800 });
                                    setVariantData(prev => ({
                                      ...prev,
                                      [opt]: { 
                                        ...prev[opt], 
                                        image: new File([comp], f.name, { type: comp.type }),
                                        preview: URL.createObjectURL(comp)
                                      }
                                    }))
                                  }}
                                />
                              </button>
                            </div>
                          </td>
                          <td className="py-4 pr-4">
                            <button 
                              onClick={() => setVariantOptions(prev => prev.filter(o => o !== opt))}
                              className="p-2 text-gray-300 hover:text-red-400 transition opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button 
                  type="button"
                  onClick={() => {
                    const next = `Option ${variantOptions.length + 1}`
                    setVariantOptions([...variantOptions, next])
                    setVariantData({...variantData, [next]: { price: form.price, stock: "0", image: null, preview: null }})
                  }}
                  className="mt-6 flex items-center gap-2 text-xs font-black text-[var(--brand-primary)] uppercase tracking-widest hover:opacity-70 transition"
                >
                  <Plus size={14} className="bg-[var(--brand-soft)] text-white rounded-full p-0.5" /> Add Another Variant
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: PRICING & IMAGES */}
            <div className="lg:col-span-4 space-y-8">
              {/* PRICING & STOCK CARD */}
              <div className="bg-white rounded-3xl border border-[var(--border-light)] p-8 shadow-sm space-y-6">
                <h3 className="text-sm font-black text-[var(--text-heading)] tracking-tight">Pricing & Stock</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Cost / per size <span className="text-red-500">*</span></label>
                    <input 
                      placeholder="Enter cost"
                      type="number"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      className="w-full px-5 py-3 bg-white border border-[var(--border-light)] rounded-xl focus:ring-2 focus:ring-[var(--brand-primary)] focus:outline-none font-bold text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Stock <span className="text-red-500">*</span></label>
                    <input 
                      placeholder="Enter quantity"
                      type="number"
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: e.target.value })}
                      className="w-full px-5 py-3 bg-white border border-[var(--border-light)] rounded-xl focus:ring-2 focus:ring-[var(--brand-primary)] focus:outline-none font-bold text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* PRODUCT IMAGES CARD */}
              <div className="bg-white rounded-3xl border border-[var(--border-light)] p-8 shadow-sm space-y-6">
                <h3 className="text-sm font-black text-[var(--text-heading)] tracking-tight">Product Images <span className="text-gray-400 font-medium">(Optional)</span></h3>
                
                <div className="relative group/mainup">
                  <div className="border-2 border-dashed border-[var(--border-light)] rounded-3xl p-10 text-center space-y-4 hover:border-[var(--brand-primary)] transition cursor-pointer bg-gray-50/30 overflow-hidden relative min-h-[220px] flex flex-col items-center justify-center">
                    {preview ? (
                      <img src={preview} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-[var(--brand-primary)]">
                          <Plus size={24} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-[var(--text-heading)] uppercase tracking-widest mb-1">Upload main product images</p>
                          <p className="text-[10px] text-gray-400 font-medium">Drag & drop images here or click to browse</p>
                        </div>
                      </>
                    )}
                    <input 
                      type="file" 
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      onChange={async (e: any) => {
                        const f = e.target.files?.[0]; if (!f) return;
                        const comp = await imageCompression(f, { maxSizeMB: 1, maxWidthOrHeight: 1200 });
                        setForm({ ...form, image: new File([comp], f.name, { type: comp.type }) });
                        setPreview(URL.createObjectURL(comp));
                      }}
                    />
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 font-medium leading-relaxed italic text-center">These images will be used in the product gallery.</p>
              </div>

              {/* VARIANT IMAGE UPLOAD DIRECT PANEL */}
              <div className="bg-[#F8F7FF] rounded-3xl border border-[#EBE9FE] p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-[#574EAD] tracking-tight">Variant Image Upload (Direct)</h3>
                </div>
                
                <div className="flex gap-3 p-4 bg-white rounded-2xl border border-[#EBE9FE]">
                  <div className="w-5 h-5 rounded-full bg-[#EBE9FE] flex items-center justify-center text-[#574EAD] flex-shrink-0">
                    <span className="text-[10px] font-black">i</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-[#574EAD]">Upload images directly for each variant.</p>
                    <p className="text-[10px] text-[#574EAD]/60 font-medium">Each variant can have multiple images.</p>
                  </div>
                </div>

                <div className="border-2 border-dashed border-[#DEDCFE] rounded-3xl p-10 text-center space-y-3 bg-white/50 group hover:border-[#574EAD] transition cursor-pointer">
                  <div className="w-10 h-10 mx-auto bg-white rounded-xl shadow-sm border border-[#EBE9FE] flex items-center justify-center text-[#574EAD]">
                    <Plus size={20} />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-[#574EAD] uppercase tracking-widest mb-0.5">Drag & drop images here or click to browse</p>
                    <p className="text-[9px] text-[#574EAD]/50 font-medium uppercase tracking-tighter">PNG, JPG, WEBP UP TO 5MB</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {variantOptions.map((opt) => variantData[opt]?.preview && (
                    <div key={opt} className="relative group">
                      <div className="w-16 h-16 rounded-xl border border-[#EBE9FE] overflow-hidden shadow-sm">
                        <img src={variantData[opt].preview!} className="w-full h-full object-cover" />
                      </div>
                      <button className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition">
                        <X size={10} />
                      </button>
                    </div>
                  ))}
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