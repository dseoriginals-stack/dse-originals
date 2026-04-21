"use client"

import Modal from "@/components/ui/Modal"
import { useState } from "react"
import { Heart, Camera, Loader2, X, Target } from "lucide-react"
import { api } from "@/lib/api"
import toast from "react-hot-toast"
import { useAuth } from "@/context/AuthContext"

export default function StorySubmitModal({ open, onClose }: any) {
  const { user } = useAuth()
  const [story, setStory] = useState("")
  const [title, setTitle] = useState("")
  const [loading, setLoading] = useState(false)
  const [image, setImage] = useState<string | null>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) return toast.error("Image must be smaller than 5MB")
      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    if (!title || !story) return toast.error("Title and story content are required")
    if (!user) return toast.error("You must be logged in to share a story")
    
    setLoading(true)
    try {
      await api.post("/stories", {
        title,
        content: story,
        image,
        category: "Community",
        name: user.name || "Member",
        email: user.email
      })
      toast.success("Story submitted for approval!")
      onClose()
      // Reset form
      setTitle("")
      setStory("")
      setImage(null)
    } catch (err: any) {
      toast.error(err.message || "Failed to submit story")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="relative pt-8">
        {/* OVERLAPPING ICON STYLE */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gradient-to-b from-[#4A7BB0] to-[#274C77] flex items-center justify-center text-white shadow-xl z-10 border-4 border-white">
          <Target size={32} />
        </div>

        <div className="text-center mb-8">
          <h2 className="font-black text-2xl text-[var(--text-heading)] tracking-tight uppercase">
            Share Your Journey
          </h2>
          <p className="text-sm text-[var(--text-muted)] font-bold mt-2 uppercase tracking-widest opacity-60">
            Authenticated as {user?.name || user?.email}
          </p>
        </div>

        <div className="space-y-6">
          {/* TITLE */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">The Headline</label>
            <input
              placeholder="Give your story a title..."
              className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-[var(--brand-primary)] rounded-2xl font-bold transition-all outline-none text-[var(--text-main)] placeholder:text-slate-300"
              value={title}
              onChange={(e)=>setTitle(e.target.value)}
            />
          </div>

          {/* CONTENT */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Your Testimony</label>
            <textarea
              rows={5}
              placeholder="How has faith and grace moved through your life?"
              className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-[var(--brand-primary)] rounded-2xl font-medium transition-all outline-none text-[var(--text-main)] placeholder:text-slate-300 resize-none text-sm leading-relaxed"
              value={story}
              onChange={(e)=>setStory(e.target.value)}
            />
          </div>

          {/* PHOTO UPLOAD */}
          <div className="space-y-2">
             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Visual Inspiration</label>
             {image ? (
              <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-dashed border-[var(--brand-primary)] group">
                <img src={image} className="w-full h-full object-cover" alt="Preview" />
                <button 
                  onClick={() => setImage(null)}
                  className="absolute top-4 right-4 p-2 bg-white/90 rounded-full text-red-500 shadow-xl hover:scale-110 transition"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-100 rounded-2xl p-8 text-center text-slate-300 hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)] hover:bg-slate-50 transition-all cursor-pointer flex flex-col items-center gap-2 group">
                <Camera size={24} className="group-hover:scale-110 transition-transform" />
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                <p className="font-black text-[10px] uppercase tracking-widest">Add a Photo Memory</p>
              </label>
            )}
          </div>

          {/* ACTIONS */}
          <div className="flex flex-col gap-3 pt-4">
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="w-full btn-premium !py-4 !px-8 flex justify-center items-center gap-2 shadow-xl shadow-[var(--brand-primary)]/20 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Heart size={18} className="fill-white/20" />}
              <span className="font-black uppercase tracking-widest text-xs">
                {loading ? "Witnessing..." : "Submit Story"}
              </span>
            </button>
            <button
              onClick={onClose}
              type="button"
              disabled={loading}
              className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-slate-500 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}