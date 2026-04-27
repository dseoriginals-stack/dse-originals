"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"

import { api } from "@/lib/api"
import { useCart } from "@/context/CartContext"
import ProductCard from "@/components/ProductCard"
import RecommendationStrip from "@/components/product/RecommendationStrip"
import { flyToCart } from "@/lib/flyToCart"

import { ProductFull, ProductVariant } from "@/types/product"
import { transformProductToCard } from "@/lib/transformProduct"

import Reviews from "@/components/Reviews"
import ReviewForm from "@/components/ReviewForm"
import CinematicLookbook from "@/components/product/CinematicLookbook"

import { getImageUrl } from "@/lib/image"

import toast from "react-hot-toast"

import { 
  Check, Share2, Facebook, MessageSquare, 
  ShoppingCart, Heart, ChevronLeft, 
  Zap, ShieldCheck, Truck, Star 
} from "lucide-react"

export default function ProductClient({ initialProduct }: { initialProduct: ProductFull | null }) {
  const params = useParams()
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug
  const router = useRouter()
  const { addToCart } = useCart()

  const [product, setProduct] = useState<ProductFull | null>(initialProduct)
  const [related, setRelated] = useState<ProductFull[]>([])
  const [variant, setVariant] = useState<ProductVariant | null>(
    initialProduct?.variants.find(v => v.stock > 0) || initialProduct?.variants[0] || null
  )

  const [qty, setQty] = useState(1)
  const [activeImage, setActiveImage] = useState(initialProduct?.images?.[0]?.url ?? "/placeholder.png")
  const [loading, setLoading] = useState(!initialProduct)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [refreshReviews, setRefreshReviews] = useState(0)

  // Carousel State
  const [currentImgIndex, setCurrentImgIndex] = useState(0)

  useEffect(() => {
    if (!slug) return
    if (product && product.slug === slug) {
       async function fetchRelated() {
         try {
           const rel = await api.get<ProductFull[]>(`/products/${product!.id}/related`)
           setRelated(rel)
         } catch {}
       }
       fetchRelated()
       return
    }
    async function fetchData() {
      try {
        const res = await api.get<ProductFull>(`/products/slug/${slug}`)
        if (!res) throw new Error("Product not found")
        setProduct(res)
        const firstAvailable = res.variants.find(v => v.stock > 0) || res.variants[0]
        setVariant(firstAvailable)
        setActiveImage(res.images?.[0]?.url ?? "/placeholder.png")
      } catch (err) {
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [slug])

  const handleAdd = async () => {
    if (!product || !variant || variant.stock === 0 || adding) return
    setAdding(true)
    await addToCart({
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      price: price,
      quantity: qty,
      category: product.category,
      image: getImageUrl(activeImage),
      attributes: variant.attributes.map(a => ({ name: a.name, value: a.value }))
    })
    setAdded(true)
    setTimeout(() => {
      setAdded(false)
      setAdding(false)
      router.push("/cart")
    }, 600)
  }

  if (!product) return <div className="container py-20 text-center">Product not found</div>

  const stock = variant?.stock || 0
  const getDisplayPrice = () => {
    if (!variant) return 0
    const attrValues = (variant.attributes || []).map((a) => (a.value || "").toLowerCase())
    if (attrValues.some(v => v.includes("55ml"))) return 349
    if (attrValues.some(v => v.includes("30ml"))) return 249
    return Number(variant.price)
  }
  const price = getDisplayPrice()

  return (
    <div className="bg-[#f8f9fb] min-h-screen pb-32">
      
      {/* MOBILE HEADER */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-transparent pointer-events-none">
        <button 
          onClick={() => router.back()}
          className="pointer-events-auto p-2 rounded-full bg-black/30 backdrop-blur-md text-white"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex gap-2 pointer-events-auto">
          <button className="p-2 rounded-full bg-black/30 backdrop-blur-md text-white">
            <Share2 size={20} />
          </button>
          <button className="p-2 rounded-full bg-black/30 backdrop-blur-md text-white">
            <ShoppingCart size={20} />
          </button>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto md:pt-10 md:px-8">
        <div className="flex flex-col md:flex-row gap-0 md:gap-10">
          
          {/* GALLERY SECTION */}
          <div className="w-full md:w-1/2 relative">
            <div className="relative aspect-[1/1] bg-white md:rounded-3xl overflow-hidden shadow-sm">
              <Image
                id="product-main-image"
                src={getImageUrl(activeImage || "/placeholder.png")}
                alt={product.name}
                fill
                className="object-contain p-4 md:p-10"
                priority
              />
              
              {/* Image Counter Badge */}
              <div className="absolute bottom-6 right-6 px-3 py-1 rounded-full bg-black/50 text-white text-[10px] font-bold backdrop-blur-sm">
                {product.images.findIndex(i => i.url === activeImage) + 1} / {product.images.length}
              </div>

              {/* Bestseller Badge */}
              {product.isBestseller && (
                <div className="absolute top-6 left-0 bg-[var(--brand-primary)] text-white px-4 py-1.5 rounded-r-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                  Bestseller Choice
                </div>
              )}
            </div>

            {/* Thumbnails (Desktop Only) */}
            <div className="hidden md:flex gap-3 mt-4 overflow-x-auto py-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img.url)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    activeImage === img.url ? "border-[var(--brand-primary)]" : "border-transparent opacity-60"
                  }`}
                >
                  <Image src={getImageUrl(img.url)} alt={product.name} fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* CONTENT SECTION */}
          <div className="flex-1 px-4 py-6 md:p-0 space-y-6">
            
            {/* Price & Flash Sale Area */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
               <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-rose-500 text-white rounded text-[9px] font-black uppercase italic">
                    <Zap size={10} fill="currentColor" /> Flash Sale
                  </div>
                  <span className="text-rose-500 text-xs font-bold">Ends in 05:42:10</span>
               </div>
               
               <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-black text-slate-900 tracking-tight">₱{price.toLocaleString()}</span>
                  <span className="text-slate-400 text-sm line-through decoration-slate-300">₱{(price * 1.5).toFixed(0)}</span>
                  <span className="text-rose-500 text-xs font-bold">-50% OFF</span>
               </div>
            </div>

            {/* Title & Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-3">
              <div className="flex items-center gap-1">
                 {[...Array(5)].map((_, i) => (
                   <Star key={i} size={14} fill={i < 4 ? "#fbbf24" : "none"} stroke={i < 4 ? "#fbbf24" : "#cbd5e1"} />
                 ))}
                 <span className="text-xs text-slate-500 ml-1 font-semibold">4.9 (1.2k Sold)</span>
              </div>
              <h1 className="text-xl md:text-3xl font-black text-slate-800 leading-tight">{product.name}</h1>
              
              <div className="flex flex-wrap gap-3 pt-2">
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                  <Truck size={12} /> Free Shipping
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">
                  <ShieldCheck size={12} /> Authentic Guarantee
                </div>
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Product Story</h3>
               <p className="text-slate-600 text-sm leading-relaxed font-medium">
                 {product.description || "A masterpiece of sensory experience, crafted for those who value presence and elegance in every detail."}
               </p>
               
               {/* Cinematic Lookbook Trigger */}
               {(product.videoUrl || product.storyHtml) && (
                 <div className="mt-6 pt-6 border-t border-dashed border-gray-100">
                    <CinematicLookbook product={product as any} />
                 </div>
               )}
            </div>

            {/* Variants Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
               {/* Same Variant Logic from before, just styled better */}
               {(() => {
                const grouped: Record<string, string[]> = {}
                product.variants.forEach((v) => {
                  v.attributes.forEach((attr) => {
                    if (!grouped[attr.name]) grouped[attr.name] = []
                    if (!grouped[attr.name].includes(attr.value)) grouped[attr.name].push(attr.value)
                  })
                })
                const selections: Record<string, string> = {}
                variant?.attributes.forEach(a => selections[a.name] = a.value)

                const handleAttrClick = (name: string, value: string) => {
                  const next = { ...selections, [name]: value }
                  const match = product.variants.find(v => v.attributes.every(a => next[a.name] === a.value))
                  if (match) {
                    setVariant(match)
                    if (match.image) setActiveImage(match.image)
                  }
                }

                return Object.entries(grouped).map(([name, values]) => (
                  <div key={name} className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Select {name}</h3>
                      <span className="text-[10px] font-bold text-[var(--brand-primary)]">Size Guide</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {values.map((val) => {
                        const isActive = selections[name] === val
                        return (
                          <button
                            key={val}
                            onClick={() => handleAttrClick(name, val)}
                            className={`px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase border-2 transition-all ${
                              isActive ? "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)] shadow-md" : "bg-gray-50 border-gray-100 text-slate-500"
                            }`}
                          >
                            {val}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))
              })()}
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
               <ReviewForm productId={product.id} onSuccess={() => setRefreshReviews(p => p + 1)} />
               <Reviews key={refreshReviews} productId={product.id} />
            </div>

          </div>
        </div>
      </div>

      {/* STICKY BOTTOM ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-[60] bg-white/80 backdrop-blur-xl border-t border-gray-100 px-4 py-4 md:py-6 pb-safe">
        <div className="max-w-[1200px] mx-auto flex items-center gap-3">
          
          {/* Action Icons */}
          <div className="flex gap-1 md:gap-4 pr-2 border-r border-gray-100">
            <button className="flex flex-col items-center gap-1 px-2">
              <MessageSquare size={20} className="text-slate-500" />
              <span className="text-[8px] font-bold text-slate-400 uppercase">Chat</span>
            </button>
            <button 
              onClick={() => router.push("/cart")}
              className="flex flex-col items-center gap-1 px-2 relative"
            >
              <ShoppingCart size={20} className="text-slate-500" />
              <span className="text-[8px] font-bold text-slate-400 uppercase">Cart</span>
            </button>
            <button className="hidden md:flex flex-col items-center gap-1 px-2">
              <Heart size={20} className="text-slate-500" />
              <span className="text-[8px] font-bold text-slate-400 uppercase">Wish</span>
            </button>
          </div>

          {/* Main Buttons */}
          <div className="flex-1 flex gap-2">
            <button 
              onClick={handleAdd}
              disabled={stock === 0 || adding}
              className="flex-1 h-12 rounded-xl bg-slate-100 text-slate-800 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
            >
              Add to Cart
            </button>
            <button 
              onClick={handleAdd}
              disabled={stock === 0 || adding}
              className="flex-[1.5] h-12 rounded-xl bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-accent)] text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-900/20 active:scale-95 transition-all"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 mt-10 space-y-10">
        <RecommendationStrip type="related" productId={product.id} title="You May Also Like" />
      </div>
    </div>
  )
}