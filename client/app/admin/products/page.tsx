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
    fetchAll()
  }, [])

  async function fetchAll() {
    try {
      setLoading(true)
      const [productRes, categoryRes] = await Promise.all([
        api.get("/admin/products"),
        api.get("/categories")
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
      formData.append("price", String(Number(form.price)))
      formData.append("stock", String(Number(form.stock)))
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
      image: null
    })
    setPreview(product.image || null)
    setShowModal(true)
  }

  function closeModal() {
    setEditing(null)
    setShowModal(false)
    setPreview(null)
    setForm({ name: "", description: "", categoryId: "", price: "", stock: "", image: null })
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                   <InputField label="Product Designation" value={form.name} onChange={(v: string)=>setForm({...form, name: v})} placeholder="e.g. Classic Marine Shirt" />
                   <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Composition Description</label>
                      <textarea 
                        value={form.description}
                        onChange={(e: any)=>setForm({...form, description: e.target.value})}
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
                        onChange={(e: any)=>setForm({...form, categoryId: e.target.value})}
                        className="w-full px-5 py-4 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] text-sm font-bold transition-all"
                      >
                        <option value="">Select Category</option>
                        {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <InputField label="Market Value (₱)" value={form.price} onChange={(v: string)=>setForm({...form, price: v})} type="number" />
                      <InputField label="Stock Units" value={form.stock} onChange={(v: string)=>setForm({...form, stock: v})} type="number" />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Product Media</label>
                      <div className="relative border-2 border-dashed border-[var(--border-light)] rounded-2xl p-6 text-center hover:bg-gray-50 transition min-h-[140px] flex flex-col items-center justify-center gap-2">
                         <input 
                           type="file" 
                           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                           onChange={async(e: any)=>{
                             const f = e.target.files?.[0]; if(!f) return;
                             const comp = await imageCompression(f, { maxSizeMB: 1, maxWidthOrHeight: 1200, useWebWorker: true });
                             setForm({...form, image: new File([comp], f.name, {type: comp.type})});
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
    <div className="bg-white rounded-[2rem] border border-[var(--border-light)] p-6 shadow-sm hover:shadow-xl transition-all duration-500 group relative">
      <div className="absolute top-4 right-4 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
         <button onClick={onEdit} className="p-2 bg-white rounded-xl shadow-md border border-gray-100 text-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-white transition"><Edit3 size={14}/></button>
         <button onClick={onDelete} className="p-2 bg-white rounded-xl shadow-md border border-gray-100 text-red-500 hover:bg-red-500 hover:text-white transition"><Trash2 size={14}/></button>
      </div>
      <div className="w-full aspect-square rounded-[1.5rem] bg-[var(--bg-surface)] border border-gray-100 overflow-hidden relative mb-6">
        {product.image ? (
          <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={product.name} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={48} /></div>
        )}
        {(isLowStock || isOutOfStock) && (
           <div className={`absolute bottom-3 left-3 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg ${isOutOfStock ? "bg-red-500 text-white" : "bg-amber-500 text-white"}`}>
             <AlertTriangle size={10} /> {isOutOfStock ? "Zero Stock" : `Low: ${product.stock} left`}
           </div>
        )}
      </div>
      <div>
        <div className="flex justify-between items-start mb-1">
           <span className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-accent)]">{product.category}</span>
           <span className="text-sm font-[1000] text-[var(--brand-primary)]">₱{product.price.toLocaleString()}</span>
        </div>
        <h3 className="text-lg font-black text-[var(--text-heading)] leading-tight line-clamp-1 mb-4">{product.name}</h3>
        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
           <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isOutOfStock ? 'bg-red-500' : 'bg-emerald-500'}`} />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{product.stock} in Inventory</span>
           </div>
           {product.stock > 0 && <span className="text-[10px] text-emerald-600 font-bold uppercase flex items-center gap-1"><CheckCircle size={10}/> Ready</span>}
        </div>
      </div>
    </div>
  )
}

function InputField({ label, value, onChange, type = "text", placeholder }: any) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">{label}</label>
      <input type={type} value={value} onChange={(e: any)=>onChange(e.target.value)} className="w-full px-5 py-4 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] text-sm font-bold transition-all" placeholder={placeholder} />
    </div>
  )
}

function SkeletonProductCard() {
  return <div className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm animate-pulse h-[350px]" />
}