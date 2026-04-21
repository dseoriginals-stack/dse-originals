"use client"

import Modal from "@/components/ui/Modal"
import { useState } from "react"
import { Heart, Camera, Loader2, X, Search, MapPin, Smile, Sparkles, Lightbulb, Cloud, MessageSquare, Megaphone, Users, Star, ChevronRight, Lock } from "lucide-react"
import { api } from "@/lib/api"
import toast from "react-hot-toast"
import { useAuth } from "@/context/AuthContext"
import { useEffect, useRef } from "react"

export default function StorySubmitModal({ open, onClose }: any) {
  const { user } = useAuth()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [content, setContent] = useState("")
  const [title, setTitle] = useState("")
  const [location, setLocation] = useState("")
  const [loading, setLoading] = useState(false)
  const [image, setImage] = useState<string | null>(null)
  const [selectedFeeling, setSelectedFeeling] = useState("Inspired")
  const [tags, setTags] = useState<string[]>(["#DSEoriginals"])

  // PRODUCT SELECTION STATE
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await api.get("/products")
        setAllProducts(data)
      } catch (err) {
        console.error("Failed to fetch products:", err)
      }
    }
    if (open) fetchProducts()
  }, [open])

  const filteredProducts = (Array.isArray(allProducts) ? allProducts : []).filter(p => 
    p?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5)

  const feelings = [
    { name: "Happy", icon: <Smile size={18} /> },
    { name: "Confident", icon: <Sparkles size={18} /> },
    { name: "Grateful", icon: <Heart size={18} /> },
    { name: "Inspired", icon: <Lightbulb size={18} /> },
    { name: "Chill", icon: <Cloud size={18} /> },
  ]

  const suggestedTags = ["#MyStyleToday", "#UnfoldYourself", "#DailyFit", "#StreetMinimal", "#WearYourStory", "#RealMoments"]

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) setTags(tags.filter(t => t !== tag))
    else if (tags.length < 5) setTags([...tags, tag])
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) return toast.error("Image must be smaller than 5MB")
      const reader = new FileReader()
      reader.onloadend = () => setImage(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    if (!content) return toast.error("Please share your story content")
    if (!user) return toast.error("You must be logged in")
    
    setLoading(true)
    try {
      await api.post("/stories", {
        title: title || `${selectedFeeling} Moments`,
        content,
        image,
        category: selectedFeeling,
        location,
        productTags: tags,
        featuredProductId: selectedProduct?._id,
        name: user.name || "Member",
        email: user.email
      })
      toast.success("Story posted successfully!")
      onClose()
      // Reset
      setContent("")
      setTitle("")
      setImage(null)
      setTags(["#DSEoriginals"])
      setSelectedProduct(null)
      setSearchQuery("")
    } catch (err: any) {
      toast.error(err.message || "Failed to post story")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-4xl">
      <div className="flex flex-col h-full bg-white">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-[1000] text-[var(--text-heading)] tracking-tighter leading-none">Add Your Story</h2>
            <p className="text-[10px] md:text-sm text-[var(--text-muted)] font-bold mt-2 uppercase tracking-tight">Share your moment. Inspire others. Be you.</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-900 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="grid lg:grid-cols-5 gap-6 md:gap-10">
          
          {/* LEFT: FORM (3 columns) */}
          <div className="lg:col-span-3 space-y-6 md:space-y-8">
            
            {/* DESCRIPTION */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <MessageSquare size={12} className="text-[var(--brand-primary)]" /> Description
                </label>
                <span className="text-[9px] font-bold text-slate-300">{content.length}/500</span>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder="What's your story about? Share what's happening..."
                className="w-full p-4 md:p-6 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-[var(--brand-primary)] rounded-2xl md:rounded-3xl font-medium text-xs md:text-sm outline-none transition-all placeholder:text-slate-300 resize-none leading-relaxed"
              />
            </div>

            {/* PRODUCT TAGGING */}
            <div className="space-y-2 relative" ref={dropdownRef}>
              <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-500 px-1 flex items-center gap-2">
                <Search size={12} className="text-[var(--brand-primary)]" /> Featured Product
              </label>
              <div className="group relative">
                <input
                  onFocus={() => setShowDropdown(true)}
                  value={selectedProduct ? selectedProduct.name : searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setSelectedProduct(null)
                    setShowDropdown(true)
                  }}
                  placeholder="Search or select a product..."
                  className="w-full px-5 py-3 md:py-4 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-[var(--brand-primary)] rounded-xl md:rounded-2xl font-bold text-[10px] md:text-xs outline-none transition-all"
                />
                {selectedProduct ? (
                  <button 
                    onClick={() => { setSelectedProduct(null); setSearchQuery(""); }}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-red-500 transition"
                  >
                    <X size={14} />
                  </button>
                ) : (
                  <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-[var(--brand-primary)] transition" size={14} />
                )}
              </div>

              {/* DROPDOWN */}
              {showDropdown && filteredProducts.length > 0 && (
                <div className="absolute z-20 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden animate-slideUp">
                  {filteredProducts.map(p => (
                    <button
                      key={p._id}
                      onClick={() => {
                        setSelectedProduct(p)
                        setSearchQuery(p.name)
                        setShowDropdown(false)
                      }}
                      className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                    >
                      <img src={p.image} className="w-10 h-10 rounded-lg object-cover" />
                      <div className="text-left">
                        <p className="text-[10px] font-black uppercase tracking-tight text-slate-800">{p.name}</p>
                        <p className="text-[8px] font-bold text-[var(--brand-primary)] uppercase tracking-widest">{p.category}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* TAGS */}
            <div className="space-y-2">
              <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-500 px-1 flex items-center gap-2">
                <Star size={12} className="text-[var(--brand-primary)]" /> Tags
              </label>
              <div className="flex flex-wrap gap-1.5 md:gap-2">
                {[...tags, ...suggestedTags.filter(st => !tags.includes(st))].slice(0, 6).map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                      tags.includes(tag) 
                        ? 'bg-[var(--brand-primary)] border-[var(--brand-primary)] text-white shadow-lg' 
                        : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* FEELINGS */}
            <div className="space-y-2">
              <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">How are you feeling?</label>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {feelings.map(f => (
                  <button
                    key={f.name}
                    onClick={() => setSelectedFeeling(f.name)}
                    className={`flex flex-col items-center gap-1.5 min-w-[60px] p-2.5 rounded-xl transition-all border-2 ${
                      selectedFeeling === f.name 
                        ? 'border-[var(--brand-primary)] bg-[var(--brand-soft)]/10 text-[var(--brand-primary)]' 
                        : 'border-transparent bg-slate-50 text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    {f.icon}
                    <span className="text-[8px] font-black uppercase tracking-widest">{f.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* LOCATION */}
            <div className="space-y-2">
              <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-500 px-1 flex items-center gap-2">
                <MapPin size={12} className="text-[var(--brand-primary)]" /> Location
              </label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Where are you? (optional)"
                className="w-full px-5 py-3 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-[var(--brand-primary)] rounded-xl md:rounded-2xl font-bold text-[10px] md:text-xs outline-none transition-all"
              />
            </div>

          </div>

          {/* RIGHT: SIDEBAR (2 columns) */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            
            {/* INSPIRATION CARD */}
            <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-slate-100 p-5 md:p-6 shadow-sm overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--brand-soft)]/5 rounded-full blur-[40px] -mr-12 -mt-12" />
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-10 h-10 bg-[var(--brand-primary)] rounded-xl flex items-center justify-center text-white mb-4 shadow-lg">
                  <Heart size={16} fill="currentColor" className="opacity-20" />
                </div>
                <h3 className="text-lg font-black text-[var(--text-heading)] mb-1 tracking-tight">Your story matters.</h3>
                <p className="text-[9px] font-bold text-slate-400 text-center uppercase tracking-widest leading-loose mb-4">
                  Every feeling is part of your journey.
                </p>
                <div className="w-full aspect-video md:aspect-[4/5] rounded-2xl md:rounded-3xl overflow-hidden bg-slate-100 shadow-xl relative">
                   {image ? (
                     <>
                        <img src={image} className="w-full h-full object-cover" />
                        <button onClick={() => setImage(null)} className="absolute top-3 right-3 p-1.5 bg-white/90 rounded-full text-red-500 shadow-xl opacity-0 group-hover:opacity-100 transition">
                          <X size={12} />
                        </button>
                     </>
                   ) : (
                     <label className="w-full h-full flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 transition-colors">
                        <Camera size={32} className="text-slate-200" />
                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em]">Upload Photo</span>
                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                     </label>
                   )}
                </div>
              </div>
            </div>

            {/* WHY SHARE LIST (HIDDEN ON MOBILE TO MAKE IT SMALLER) */}
            <div className="hidden md:block bg-slate-50/50 rounded-[2.5rem] p-6 space-y-5">
              <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300 border-b border-white pb-3">Why share?</h4>
              {[
                { icon: <Users size={14} />, t: "Inspire others", d: "Your motivation could help someone." },
                { icon: <Smile size={14} />, t: "Express yourself", d: "Show the world your style." }
              ].map((item, i) => (
                <div key={i} className="flex gap-3 group text-left">
                   <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[var(--brand-primary)] shadow-sm border border-white group-hover:scale-110 transition-transform shrink-0">
                      {item.icon}
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-[var(--text-heading)] uppercase tracking-tight">{item.t}</p>
                      <p className="text-[8px] font-bold text-slate-400 mt-0.5 max-w-[140px] leading-tight">{item.d}</p>
                   </div>
                </div>
              ))}
            </div>

          </div>

        </div>

        {/* FOOTER ACTIONS */}
        <div className="mt-8 md:mt-10 pt-6 md:pt-8 border-t border-slate-50 flex flex-col items-center gap-4">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full btn-premium !py-4 !rounded-2xl shadow-xl shadow-[var(--brand-primary)]/10 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Megaphone size={18} />}
            <div className="text-center">
              <span className="block font-black text-[10px] uppercase tracking-[0.2em]">{loading ? "Post Witnessing..." : "Post Your Story"}</span>
            </div>
          </button>
          
          <div className="flex items-center gap-2 text-slate-300">
             <Lock size={10} />
             <p className="text-[8px] font-bold uppercase tracking-widest text-center">
               Visible based on community guidelines.
             </p>
          </div>
        </div>

      </div>
    </Modal>
  )
}