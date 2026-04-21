"use client"

import Modal from "@/components/ui/Modal"
import { useState } from "react"
import { Heart, Camera, Loader2, X, Search, MapPin, Smile, Sparkles, Lightbulb, Cloud, MessageSquare, Megaphone, Users, Star } from "lucide-react"
import { api } from "@/lib/api"
import toast from "react-hot-toast"
import { useAuth } from "@/context/AuthContext"

export default function StorySubmitModal({ open, onClose }: any) {
  const { user } = useAuth()
  const [content, setContent] = useState("")
  const [title, setTitle] = useState("")
  const [location, setLocation] = useState("")
  const [loading, setLoading] = useState(false)
  const [image, setImage] = useState<string | null>(null)
  const [selectedFeeling, setSelectedFeeling] = useState("Inspired")
  const [tags, setTags] = useState<string[]>(["#DSEoriginals"])

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-[1000] text-[var(--text-heading)] tracking-tighter leading-none">Add Your Story</h2>
            <p className="text-sm text-[var(--text-muted)] font-bold mt-2">Share your moment. Inspire others. Be you.</p>
          </div>
          <button onClick={onClose} className="p-2.5 bg-slate-50 rounded-full text-slate-400 hover:text-slate-900 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="grid lg:grid-cols-5 gap-10">
          
          {/* LEFT: FORM (3 columns) */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* DESCRIPTION */}
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <MessageSquare size={14} className="text-[var(--brand-primary)]" /> Description
                </label>
                <span className="text-[10px] font-bold text-slate-300">{content.length}/500</span>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={500}
                rows={4}
                placeholder="What's your story about? Share what's happening..."
                className="w-full p-6 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-[var(--brand-primary)] rounded-3xl font-medium text-sm outline-none transition-all placeholder:text-slate-300 resize-none leading-relaxed"
              />
            </div>

            {/* PRODUCT TAGGING */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1 flex items-center gap-2">
                <Search size={14} className="text-[var(--brand-primary)]" /> What product are you featuring?
              </label>
              <div className="group relative">
                <input
                  placeholder="Link a DSE product..."
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-[var(--brand-primary)] rounded-2xl font-bold text-xs outline-none transition-all"
                />
                <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-[var(--brand-primary)] transition" size={16} />
              </div>
            </div>

            {/* TAGS */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1 flex items-center gap-2">
                <Star size={14} className="text-[var(--brand-primary)]" /> Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {[...tags, ...suggestedTags.filter(st => !tags.includes(st))].slice(0, 8).map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
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
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">How are you feeling?</label>
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {feelings.map(f => (
                  <button
                    key={f.name}
                    onClick={() => setSelectedFeeling(f.name)}
                    className={`flex flex-col items-center gap-2 min-w-[70px] p-3 rounded-2xl transition-all border-2 ${
                      selectedFeeling === f.name 
                        ? 'border-[var(--brand-primary)] bg-[var(--brand-soft)]/10 text-[var(--brand-primary)]' 
                        : 'border-transparent bg-slate-50 text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    {f.icon}
                    <span className="text-[9px] font-black uppercase tracking-widest">{f.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* LOCATION */}
            <div className="space-y-3 pt-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1 flex items-center gap-2">
                <MapPin size={14} className="text-[var(--brand-primary)]" /> Add Location
              </label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Where are you?"
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-[var(--brand-primary)] rounded-2xl font-bold text-xs outline-none transition-all"
              />
            </div>

          </div>

          {/* RIGHT: SIDEBAR (2 columns) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* INSPIRATION CARD */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-6 shadow-sm overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--brand-soft)]/5 rounded-full blur-[40px] -mr-16 -mt-16" />
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-12 h-12 bg-[var(--brand-primary)] rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg">
                  <Heart size={20} fill="currentColor" className="opacity-20" />
                </div>
                <h3 className="text-xl font-black text-[var(--text-heading)] mb-2 tracking-tight">Your story matters.</h3>
                <p className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest leading-loose mb-6">
                  Every moment, every outfit, every feeling — it's part of your journey.
                </p>
                <div className="w-full aspect-[4/5] rounded-3xl overflow-hidden bg-slate-100 shadow-2xl relative">
                   {image ? (
                     <>
                        <img src={image} className="w-full h-full object-cover" />
                        <button onClick={() => setImage(null)} className="absolute top-4 right-4 p-2 bg-white/90 rounded-full text-red-500 shadow-xl opacity-0 group-hover:opacity-100 transition">
                          <X size={14} />
                        </button>
                     </>
                   ) : (
                     <label className="w-full h-full flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors">
                        <Camera size={40} className="text-slate-200" />
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Upload Photo</span>
                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                     </label>
                   )}
                </div>
              </div>
            </div>

            {/* WHY SHARE LIST */}
            <div className="bg-slate-50/50 rounded-[2.5rem] p-8 space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 border-b border-white pb-4">Why share?</h4>
              {[
                { icon: <Users size={16} />, t: "Inspire others", d: "Your story could be the motivation someone needs." },
                { icon: <Smile size={16} />, t: "Express yourself", d: "Show the world your style, your way." },
                { icon: <Heart size={16} />, t: "Earn Love", d: "Get featured and appreciated by our community." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 group">
                   <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[var(--brand-primary)] shadow-sm border border-white group-hover:scale-110 transition-transform shrink-0">
                      {item.icon}
                   </div>
                   <div>
                      <p className="text-xs font-black text-[var(--text-heading)] uppercase tracking-tight">{item.t}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 max-w-[140px] leading-tight">{item.d}</p>
                   </div>
                </div>
              ))}
            </div>

          </div>

        </div>

        {/* FOOTER ACTIONS */}
        <div className="mt-12 pt-8 border-t border-slate-50 flex flex-col items-center gap-6">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full btn-premium !py-5 !rounded-3xl shadow-2xl shadow-[var(--brand-primary)]/20 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Megaphone size={20} />}
            <div className="text-center">
              <span className="block font-black text-xs uppercase tracking-[0.2em]">{loading ? "Post Witnessing..." : "Post Your Story"}</span>
              <span className="block text-[8px] font-bold opacity-60 uppercase tracking-widest mt-0.5">Inspire the DSE community.</span>
            </div>
          </button>
          
          <div className="flex items-center gap-2 text-slate-300">
             <Lock size={12} />
             <p className="text-[9px] font-bold uppercase tracking-widest">
               Your story will be visible based on our community guidelines.
             </p>
          </div>
        </div>

      </div>
    </Modal>
  )
}

function ChevronRight(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
  )
}

function Lock(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
  )
}