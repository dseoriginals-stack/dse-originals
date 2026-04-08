"use client"

import Modal from "@/components/ui/Modal"
import { useState } from "react"
import { Heart, Camera } from "lucide-react"

export default function StorySubmitModal({ open, onClose }: any) {

  const [story, setStory] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")

  const addTag = () => {
    if (!tagInput) return
    setTags([...tags, tagInput])
    setTagInput("")
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
        <div className="border-2 border-dashed border-[var(--border-light)] rounded-2xl p-10 text-center text-gray-400 hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)] hover:bg-[var(--bg-surface)] transition-colors cursor-pointer flex flex-col items-center gap-3">
          <Camera size={32} />
          <p className="font-semibold text-sm">Click to upload or drag and drop</p>
          <p className="text-xs">PNG, JPG up to 10MB</p>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex flex-col sm:flex-row justify-end items-center gap-4 border-t border-[var(--border-light)] pt-6">
        <button
          onClick={onClose}
          type="button"
          className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-[var(--text-muted)] hover:text-[var(--text-heading)] transition-colors"
        >
          Cancel
        </button>
        <button className="w-full sm:w-auto btn-premium !py-3 !px-8 flex justify-center items-center gap-2 shadow-md">
          <Heart size={16} className="fill-white/20" />
          Publish Story
        </button>
      </div>

    </Modal>

  )
}