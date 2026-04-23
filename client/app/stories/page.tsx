"use client"
export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import StorySubmitModal from "@/components/stories/StorySubmitModal"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, Clock, X, ExternalLink } from "lucide-react"
import toast from "react-hot-toast"

import { useAuth } from "@/context/AuthContext"

interface Story {
  id: string
  title: string
  content: string
  image?: string
  category?: string
  productTags?: string[]
  createdAt: string
  likes: number
  status: string
  user?: { name: string }
  guestName?: string
}

export default function StoriesPage() {
  const { user } = useAuth()

  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStory, setSelectedStory] = useState<Story | null>(null)
  const [openSubmit, setOpenSubmit] = useState(false)
  const [likedStories, setLikedStories] = useState<string[]>([])

  useEffect(() => {
    fetchStories()
    const savedLikes = localStorage.getItem("liked_stories")
    if (savedLikes) setLikedStories(JSON.parse(savedLikes))
  }, [])

  const fetchStories = async () => {
    try {
      const data = await api.get<any>(`/stories?t=${Date.now()}`)
      setStories(data || [])
    } catch (err) {
      console.error("Failed to fetch stories")
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (id: string) => {
    if (likedStories.includes(id)) return

    try {
      const res = await api.post<{ likes: number }>(`/stories/${id}/like`)
      setStories(prev => prev.map(s =>
        s.id === id ? { ...s, likes: res.likes } : s
      ))
      if (selectedStory?.id === id) {
        setSelectedStory(prev => prev ? { ...prev, likes: res.likes } : null)
      }

      const newLiked = [...likedStories, id]
      setLikedStories(newLiked)
      localStorage.setItem("liked_stories", JSON.stringify(newLiked))
    } catch (err) {
      toast.error("Failed to like story")
    }
  }

  return (
    <main className="min-h-screen bg-[var(--bg-main)] py-20 px-4 md:px-12">
      {/* HEADER SECTION */}
      <div className="max-w-4xl mx-auto text-center mb-24 space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-3 px-6 py-2 bg-[var(--brand-soft)]/20 border border-[var(--brand-accent)]/20 rounded-full text-[var(--brand-primary)] text-xs font-black uppercase tracking-[0.3em] shadow-sm"
        >
          <div className="w-2 h-2 bg-[var(--brand-primary)] rounded-full animate-pulse" />
          Community Journal
        </motion.div>

        <h1 className="text-5xl md:text-7xl font-[1000] text-[var(--text-heading)] tracking-tighter leading-none">
          Stories That <span className="text-[var(--brand-primary)]">Connect</span> Us
        </h1>

        <p className="text-xl text-[var(--text-muted)] font-medium max-w-2xl mx-auto leading-relaxed">
          Explore the journeys, moments, and experiences shared by our community. Join the conversation and share your own story.
        </p>

        <button
          onClick={() => {
            if (!user) {
              toast.error("Please login to share your story")
              return
            }
            setOpenSubmit(true)
          }}
          className="btn-premium mt-8 !px-8 !py-4 shadow-[0_10px_30px_rgba(39,76,119,0.2)]"
        >
          Share Your Story
        </button>
      </div>


      {/* STORIES */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <svg className="animate-spin h-8 w-8 text-[var(--brand-primary)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <div className="text-[var(--text-muted)] font-semibold tracking-wider uppercase text-sm">Fetching Stories...</div>
        </div>
      ) : stories.length === 0 ? (
        <div className="max-w-2xl mx-auto text-center py-24 px-8 bg-white/80 backdrop-blur-md rounded-[2.5rem] border border-[var(--border-light)] shadow-sm flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] rounded-full flex items-center justify-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          </div>
          <h3 className="font-extrabold text-2xl text-[var(--text-heading)]">No stories yet</h3>
          <p className="text-[var(--text-muted)] font-medium text-lg leading-relaxed max-w-sm">
            Our journal is currently blank. Be the first to share your journey and inspire the DSE community!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stories.map((story) => (
            <motion.div
              key={story.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setSelectedStory(story)}
              className="group relative bg-white rounded-[3rem] border border-[var(--border-light)] shadow-sm hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 overflow-hidden cursor-pointer flex flex-col"
            >
              {/* INTERACTIVE HEART (FLOATING) */}
              <div className="absolute top-6 right-6 z-10">
                <button
                  onClick={(e) => { e.stopPropagation(); handleLike(story.id); }}
                  className={`p-3 rounded-2xl flex items-center gap-2 backdrop-blur-md transition-all duration-300 shadow-lg ${likedStories.includes(story.id)
                    ? 'bg-rose-500 text-white shadow-rose-500/30'
                    : 'bg-white/90 text-slate-400 hover:text-rose-500 border border-[var(--border-light)]'}`}
                >
                  <motion.div
                    animate={likedStories.includes(story.id) ? { scale: [1, 1.4, 1] } : {}}
                    transition={{ duration: 0.4 }}
                  >
                    <Heart size={20} className={likedStories.includes(story.id) ? 'fill-white' : ''} />
                  </motion.div>
                  <span className="text-xs font-[1000] tabular-nums tracking-tighter">
                    {story.likes || 0}
                  </span>
                </button>
              </div>

              {/* PENDING STATUS BADGE (For Owner) */}
              {story.status === "pending" && (
                <div className="absolute top-6 left-6 z-10">
                  <div className="px-4 py-2 bg-amber-500 text-white rounded-2xl flex items-center gap-2 shadow-lg shadow-amber-500/30 border border-amber-400">
                    <Clock size={14} className="animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Pending</span>
                  </div>
                </div>
              )}

              {/* IMAGE */}
              {story.image && (
                <div className="w-full aspect-square relative overflow-hidden bg-[var(--bg-surface)] border-b border-[var(--border-light)]">
                  <img
                    src={story.image}
                    alt={story.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              )}

              {/* CONTENT */}
              <div className="p-8 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-black text-[var(--text-heading)] tracking-tighter leading-tight group-hover:text-[var(--brand-primary)] transition-colors line-clamp-2">
                    {story.title}
                  </h3>
                  <p className="text-slate-500 font-medium text-sm line-clamp-3 leading-relaxed mt-2">
                    {story.content}
                  </p>

                  {/* CONTRIBUTOR */}
                  <div className="pt-6 flex items-center gap-3 mt-auto">
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-[var(--brand-primary)] text-[10px] font-black border border-slate-100">
                      {(story.user?.name || story.guestName || "A")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-heading)]">
                        {story.user?.name || story.guestName || "Anonymous"}
                      </p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                        {new Date(story.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* STORY DETAIL MODAL */}
      <AnimatePresence>
        {selectedStory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedStory(null)}
                className="absolute top-6 right-6 z-20 p-2 bg-white/90 rounded-full text-slate-500 hover:text-slate-900 shadow-lg transition-colors"
              >
                <X size={20} />
              </button>

              {/* Modal Image */}
              {selectedStory.image && (
                <div className="h-64 md:h-80 w-full relative">
                  <img src={selectedStory.image} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              )}

              {/* Modal Content */}
              <div className="p-8 md:p-12 space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)] px-3 py-1 bg-blue-50 rounded-full">
                      {selectedStory.category || "General"}
                    </span>
                    {selectedStory.status === "pending" && (
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 px-3 py-1 bg-amber-50 rounded-full flex items-center gap-1.5">
                        <Clock size={10} /> Pending
                      </span>
                    )}
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-[var(--text-heading)] tracking-tighter leading-tight">
                    {selectedStory.title}
                  </h2>
                </div>

                <div className="flex items-center gap-4 py-4 border-y border-slate-50">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-[var(--brand-primary)] text-sm font-black border border-slate-100 shadow-sm">
                    {(selectedStory.user?.name || selectedStory.guestName || "A")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-black text-[var(--text-heading)] uppercase tracking-widest">
                      {selectedStory.user?.name || selectedStory.guestName || "Anonymous Contributor"}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                      Shared on {new Date(selectedStory.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <p className="text-slate-600 leading-relaxed font-medium whitespace-pre-wrap text-base md:text-lg">
                  {selectedStory.content}
                </p>

                <div className="pt-6 flex justify-between items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleLike(selectedStory.id)
                    }}
                    className="flex items-center gap-2.5 px-6 py-3 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                  >
                    <Heart size={18} fill={likedStories.includes(selectedStory.id) ? "currentColor" : "none"} />
                    <span className="text-sm font-black tracking-tight">{selectedStory.likes} Likes</span>
                  </button>

                  <div className="flex gap-2">
                    <button className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-[var(--brand-primary)] transition-colors">
                      <ExternalLink size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SUBMIT MODAL */}
      <StorySubmitModal
        open={openSubmit}
        onClose={() => setOpenSubmit(false)}
      />

    </main>
  )
}