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

  const [variantData, setVariantData] = useState<Record<string, { price: string; stock: string }>>({
    M: { price: "", stock: "" },
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

        return {
          id: p.id,
          name: p.name,
          description: p.description || "",
          categoryId: p.categoryId,
          category: cat?.name || "Uncategorized",
          image: p.image || null,
          price: Number(p.price || 0),
          stock: Number(p.stock || 0),
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

      const mapped: Record<string, { price: string; stock: string }> = {}
      product.variants.forEach((v: any) => {
        const key = v.attributes?.[0]?.value
        if (key) {
          mapped[key] = {
            price: String(v.price ?? ""),
            stock: String(v.stock ?? "")
          }
        }
      })

      setVariantData(mapped)
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
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 animate-scale-up">
            <div className="bg-[var(--bg-surface)] px-10 py-8 border-b border-[var(--border-light)] flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-[1000] text-[var(--text-heading)] tracking-tighter">
                  {editing ? 'Update Record' : 'Deploy Product'}
                </h2>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--brand-primary)] mt-1">Catalog Integrity System</p>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-gray-200 rounded-full transition text-gray-400">
                <X size={24} />
              </button>
            </div>

            <div className="p-10 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <InputField label="Product Designation" value={form.name} onChange={(v: string) => setForm({ ...form, name: v })} placeholder="e.g. Classic Marine Shirt" />
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Composition Description</label>
                    <textarea
                      value={form.description}
                      onChange={(e: any) => setForm({ ...form, description: e.target.value })}
                      className="w-full px-5 py-4 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] text-sm font-bold min-h-[120px] transition-all"
                      placeholder="Detail the product unique features..."
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Classification Group</label>
                    <select
                      value={form.categoryId}
                      onChange={(e: any) => setForm({ ...form, categoryId: e.target.value })}
                      className="w-full px-5 py-4 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] text-sm font-bold transition-all"
                    >
                      <option value="">Select Category</option>
                      {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-wrap gap-4 py-2 px-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isBestseller"
                        checked={form.isBestseller}
                        onChange={(e) => setForm({ ...form, isBestseller: e.target.checked })}
                        className="w-5 h-5 rounded border-[var(--border-light)] text-[var(--brand-primary)] focus:ring-[var(--brand-primary)] cursor-pointer"
                      />
                      <label htmlFor="isBestseller" className="text-xs font-bold text-[var(--text-heading)] cursor-pointer uppercase tracking-wider">Best Seller</label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isPopular"
                        checked={form.isPopular}
                        onChange={(e) => setForm({ ...form, isPopular: e.target.checked })}
                        className="w-5 h-5 rounded border-[var(--border-light)] text-[var(--brand-primary)] focus:ring-[var(--brand-primary)] cursor-pointer"
                      />
                      <label htmlFor="isPopular" className="text-xs font-bold text-[var(--text-heading)] cursor-pointer uppercase tracking-wider">Popular</label>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Market Value (₱)" value={form.price} onChange={(v: string) => setForm({ ...form, price: v })} type="number" />
                    <InputField label="Stock Units" value={form.stock} onChange={(v: string) => setForm({ ...form, stock: v })} type="number" />
                    {/* VARIANTS */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                        Variant System
                      </label>

                      {/* TYPE SELECT */}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setVariantType("size")
                            setVariantOptions(["XS", "S", "M", "L", "XL", "2XL"])
                          }}
                          className={`px-4 py-2 rounded-xl text-xs font-bold ${variantType === "size"
                            ? "bg-[var(--brand-primary)] text-white"
                            : "bg-[var(--bg-surface)]"
                            }`}
                        >
                          Apparel (Size)
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setVariantType("volume")
                            setVariantOptions(["55ml", "30ml"])
                          }}
                          className={`px-4 py-2 rounded-xl text-xs font-bold ${variantType === "volume"
                            ? "bg-[var(--brand-primary)] text-white"
                            : "bg-[var(--bg-surface)]"
                            }`}
                        >
                          Perfume (Volume)
                        </button>
                      </div>

                      {/* VARIANT LIST */}
                      <div className="space-y-2">
                        {variantOptions.map((opt) => (
                          <div key={opt} className="grid grid-cols-3 gap-2">
                            <div className="flex items-center text-xs font-bold px-3">
                              {opt}
                            </div>

                            <input
                              placeholder="Price"
                              value={variantData[opt]?.price || ""}
                              onChange={(e) =>
                                setVariantData((prev) => ({
                                  ...prev,
                                  [opt]: { ...prev[opt], price: e.target.value },
                                }))
                              }
                              className="px-3 py-2 rounded-lg border"
                            />

                            <input
                              placeholder="Stock"
                              value={variantData[opt]?.stock || ""}
                              onChange={(e) =>
                                setVariantData((prev) => ({
                                  ...prev,
                                  [opt]: { ...prev[opt], stock: e.target.value },
                                }))
                              }
                              className="px-3 py-2 rounded-lg border"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Product Media</label>
                    <div className="relative border-2 border-dashed border-[var(--border-light)] rounded-2xl p-6 text-center hover:bg-gray-50 transition min-h-[140px] flex flex-col items-center justify-center gap-2">
                      <input
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        onChange={async (e: any) => {
                          const f = e.target.files?.[0]; if (!f) return;
                          const comp = await imageCompression(f, { maxSizeMB: 1, maxWidthOrHeight: 1200, useWebWorker: true });
                          setForm({ ...form, image: new File([comp], f.name, { type: comp.type }) });
                          setPreview(URL.createObjectURL(comp));
                        }}
                      />
                      {preview ? (
                        <img src={preview} className="absolute inset-0 w-full h-full object-cover rounded-2xl" />
                      ) : (
                        <>
                          <ImageIcon className="text-gray-300" size={32} />
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Drop visual asset here</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-10 bg-[var(--bg-surface)] border-t border-[var(--border-light)] flex gap-4">
              <button onClick={closeModal} className="flex-1 px-8 py-4 rounded-2xl border-2 border-[var(--border-light)] text-xs font-black uppercase tracking-widest hover:bg-white transition">Discard</button>
              <button
                onClick={handleSubmit}
                className="flex-[2] btn-premium !py-4 shadow-xl text-sm font-black uppercase tracking-[0.1em]"
                disabled={saving}
              >
                {saving ? 'Syncing...' : (editing ? 'Update Production' : 'Deploy to Catalog')}
              </button>
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