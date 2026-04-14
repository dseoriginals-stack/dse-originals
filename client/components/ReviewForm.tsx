"use client"

import { useState, useRef } from "react"
import { api } from "@/lib/api"
import { Star, Camera, X, Loader2, CheckCircle2 } from "lucide-react"
import toast from "react-hot-toast"
import { motion, AnimatePresence } from "framer-motion"

export default function ReviewForm({
  productId,
  onSuccess
}: {
  productId: string
  onSuccess?: () => void
}) {

  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.readAsDataURL(file)
          reader.onload = async () => {
            try {
              const base64 = reader.result as string
              const res = await api.post<{ url: string }>("/upload", { image: base64 })
              resolve(res.url)
            } catch (err) {
              reject(err)
            }
          }
          reader.onerror = reject
        })
      })

      const urls = await Promise.all(uploadPromises)
      setImages(prev => [...prev, ...urls])
      toast.success("Photos uploaded!")
    } catch (err) {
      toast.error("Failed to upload photos")
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const submit = async () => {
    if (!comment.trim()) return toast.error("Please write a comment")

    try {
      setLoading(true)
      await api.post("/reviews", {
        productId,
        rating,
        comment,
        images
      })

      toast.success("Review submitted! ✨")
      setComment("")
      setRating(5)
      setImages([])
      onSuccess?.()
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-[2.5rem] border border-[var(--border-light)] p-8 md:p-10 shadow-sm relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-2 h-full bg-[var(--brand-primary)] opacity-20"></div>
      
      <div className="mb-8">
        <h4 className="text-2xl font-black text-[var(--text-heading)] tracking-tighter">Share Your Experience</h4>
        <p className="text-[var(--text-muted)] text-[10px] uppercase font-black tracking-widest mt-1">Join the DSE Community Dialogue</p>
      </div>

      <div className="space-y-6">
        {/* RATING */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Overall Rating</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => setRating(n)}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${rating >= n ? 'bg-yellow-400 text-white shadow-lg shadow-yellow-200' : 'bg-gray-50 text-gray-300 hover:bg-gray-100'}`}
              >
                <Star size={20} fill={rating >= n ? 'currentColor' : 'none'} />
              </button>
            ))}
          </div>
        </div>

        {/* COMMENT */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Your Review</label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="What do you think of the design, fit, and flow?"
            className="w-full min-h-[120px] px-6 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-[var(--brand-primary)] rounded-[1.5rem] font-bold outline-none transition-all text-[var(--text-heading)] placeholder:text-gray-300"
          />
        </div>

        {/* PHOTO UPLOAD */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Visual Proof (Optional)</label>
          <div className="flex flex-wrap gap-3">
            <AnimatePresence>
              {images.map((img, i) => (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  key={i}
                  className="w-24 h-24 rounded-2xl overflow-hidden relative group border border-gray-100"
                >
                  <img src={img} className="w-full h-full object-cover" alt="Review" />
                  <button 
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {(images.length < 5) && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] hover:bg-[var(--brand-soft)]/5 transition-all gap-1 group"
              >
                {uploading ? (
                  <Loader2 size={24} className="animate-spin" />
                ) : (
                  <>
                    <Camera size={24} className="group-hover:scale-110 transition-transform" />
                    <span className="text-[8px] font-black uppercase">Add Photo</span>
                  </>
                )}
              </button>
            )}
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            multiple 
            accept="image/*" 
            className="hidden" 
          />
        </div>

        {/* SUBMIT */}
        <button
          onClick={submit}
          disabled={loading || uploading}
          className="w-full btn-premium !py-5 !rounded-2xl shadow-xl shadow-[var(--brand-primary)]/20 uppercase tracking-[0.2em] font-black text-xs group"
        >
          {loading ? (
            <Loader2 className="animate-spin mx-auto" size={20} />
          ) : (
            <span className="flex items-center justify-center gap-2">
              Broadcast Review <CheckCircle2 size={16} className="group-hover:translate-x-1 transition-transform" />
            </span>
          )}
        </button>
      </div>
    </div>
  )
}