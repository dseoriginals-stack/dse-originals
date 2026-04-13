"use client"

import Modal from "@/components/ui/Modal"
import { useState } from "react"
import { Heart, Camera, Loader2, X } from "lucide-react"
import { api } from "@/lib/api"
import toast from "react-hot-toast"

export default function StorySubmitModal({ open, onClose }: any) {

  const [story, setStory] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [title, setTitle] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [image, setImage] = useState<string | null>(null)

  const addTag = () => {
    if (!tagInput || tags.includes(tagInput)) return
    setTags([...tags, tagInput])
    setTagInput("")
  }

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
    setLoading(true)
    try {
      await api.post("/stories", {
        title,
        content: story,
        image,
        category: tags[0] || "General",
        name,
        email
      })
      toast.success("Story submitted for approval!")
      onClose()
      // Reset form
      setTitle("")
      setStory("")
      setTags([])
      setImage(null)
    } catch (err: any) {
      toast.error(err.message || "Failed to submit story")
    } finally {
      setLoading(false)
    }
  }

  return (

    <Modal open={open} onClose={onClose}>

      {/* HEADER */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-tr from-[var(--brand-primary)] to-[var(--brand-accent)] text-white p-3 rounded-2xl flex items-center justify-center shadow-lg shadow-[var(--brand-primary)]/20 shrink-0">
          <Heart size={24} className="fill-white/20" />
        </div>
        <div>
          <h2 className="font-extrabold text-2xl text-[var(--text-heading)] tracking-tight">
            Share Your Journey
          </h2>
          <p className="text-sm text-[var(--text-muted)] font-medium mt-1 leading-relaxed">
            Your unique experience can deeply inspire our community. Share how grace moves through your life.
          </p>
        </div>
      </div>

      {/* INFO BANNER */}
      <div className="bg-[var(--brand-soft)]/20 border border-[var(--brand-accent)]/20 p-4 rounded-2xl text-sm font-semibold text-[var(--brand-primary)] mb-8 flex gap-3 items-start">
        <span className="text-lg leading-none mt-0.5">✨</span>
        <p>We'd love to hear how DSE products impacted or accompanied you on your personal journey.</p>
      </div>


      {/* USER INFO */}
      <div className="space-y-4 mb-8">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] border-b border-[var(--border-light)] pb-2">
          Your Identity
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <input
            placeholder="Full Name"
            className="w-full px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]/30 focus:border-[var(--brand-primary)] transition placeholder:text-gray-400 font-medium text-sm"
            value={name}
            onChange={(e)=>setName(e.target.value)}
          />
          <input
            placeholder="Email Address (Optional)"
            className="w-full px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]/30 focus:border-[var(--brand-primary)] transition placeholder:text-gray-400 font-medium text-sm"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
          />
        </div>
      </div>

      {/* STORY */}
      <div className="space-y-4 mb-8">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] border-b border-[var(--border-light)] pb-2">
          Your Narrative
        </h3>
        <input
          placeholder="Story Title (e.g. A New Beginning)"
          className="w-full px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]/30 focus:border-[var(--brand-primary)] transition placeholder:text-gray-400 font-bold text-sm mb-4"
          value={title}
          onChange={(e)=>setTitle(e.target.value)}
        />
        <textarea
          rows={6}
          placeholder="Start writing your experience here..."
          className="w-full px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]/30 focus:border-[var(--brand-primary)] transition placeholder:text-gray-400 font-medium text-sm resize-y"
          value={story}
          onChange={(e)=>setStory(e.target.value)}
        />
      </div>

      {/* TAGS */}
      <div className="space-y-4 mb-8">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] border-b border-[var(--border-light)] pb-2">
          Product Tags (Optional)
        </h3>
        <div className="flex gap-3">
          <input
            className="flex-1 px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]/30 focus:border-[var(--brand-primary)] transition placeholder:text-gray-400 font-medium text-sm"
            placeholder="e.g. Premium Hoodie"
            value={tagInput}
            onChange={(e)=>setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
          />
          <button
            onClick={addTag}
            type="button"
            className="px-6 rounded-xl font-bold text-sm bg-[var(--bg-surface)] border border-[var(--border-light)] text-[var(--text-main)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] hover:bg-[var(--brand-soft)]/10 transition-all"
          >
            Add
          </button>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {tags.map(tag => (
              <span
                key={tag}
                className="bg-[var(--brand-soft)]/20 border border-[var(--brand-accent)]/20 text-[var(--brand-primary)] text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wider"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>


      {/* PHOTO UPLOAD */}
      <div className="mb-10">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] border-b border-[var(--border-light)] pb-2 mb-4">
          Attach Memories
        </h3>
        {image ? (
          <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-[var(--brand-primary)]">
            <img src={image} className="w-full h-full object-cover" alt="Preview" />
            <button 
              onClick={() => setImage(null)}
              className="absolute top-4 right-4 p-2 bg-white/90 rounded-full text-red-500 shadow-xl hover:scale-110 transition"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <label className="border-2 border-dashed border-[var(--border-light)] rounded-2xl p-10 text-center text-gray-400 hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)] hover:bg-[var(--bg-surface)] transition-colors cursor-pointer flex flex-col items-center gap-3">
            <Camera size={32} />
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            <p className="font-semibold text-sm">Click to upload or drag and drop</p>
            <p className="text-xs">PNG, JPG up to 5MB</p>
          </label>
        )}
      </div>

      {/* ACTIONS */}
      <div className="flex flex-col sm:flex-row justify-end items-center gap-4 border-t border-[var(--border-light)] pt-6">
        <button
          onClick={onClose}
          type="button"
          disabled={loading}
          className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-[var(--text-muted)] hover:text-[var(--text-heading)] transition-colors"
        >
          Cancel
        </button>
        <button 
          onClick={handleSubmit}
          disabled={loading}
          className="w-full sm:w-auto btn-premium !py-3 !px-8 flex justify-center items-center gap-2 shadow-md disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : <Heart size={16} className="fill-white/20" />}
          {loading ? "Publishing..." : "Publish Story"}
        </button>
      </div>

    </Modal>

  )
}