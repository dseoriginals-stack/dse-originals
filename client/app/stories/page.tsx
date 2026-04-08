"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import StorySubmitModal from "@/components/stories/StorySubmitModal"

type Story = {
  id: string
  title: string
  content: string
  image?: string
  productTags?: string[]
  createdAt: string
}

export default function StoriesPage() {

  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [openSubmit, setOpenSubmit] = useState(false)

  const fetchStories = async () => {

    try {

      const data = await api.get<any>("/stories")

      setStories(data.data || data)

    } catch (err) {

      console.error("Failed to fetch stories")

    } finally {

      setLoading(false)

    }

  }

  useEffect(() => {
    fetchStories()
  }, [])

  return (

    <main className="container mx-auto py-16 md:py-24 space-y-16 max-w-6xl">

      {/* HEADER */}
      <div className="text-center space-y-6 flex flex-col items-center">
        <div className="text-xs font-bold tracking-[0.3em] uppercase text-[var(--brand-accent)]">DSE Community</div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-[var(--text-heading)] tracking-tight">
          Community Stories
        </h1>

        <p className="text-lg md:text-xl text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">
          Real experiences shared by our community.  
          Inspire others by sharing your journey and how grace moves through your life.
        </p>

        <button
          onClick={() => setOpenSubmit(true)}
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {stories.map(story => (
            <div
              key={story.id}
              className="bg-[var(--bg-card)] border border-[var(--border-light)] rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl hover:border-[var(--brand-accent)]/40 transition-all duration-500 group flex flex-col"
            >
              {/* IMAGE */}
              {story.image && (
                <div className="w-full aspect-square relative overflow-hidden bg-[var(--bg-surface)] border-b border-[var(--border-light)]">
                  <img
                    src={story.image}
                    alt={story.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              )}

              {/* CONTENT */}
              <div className="p-8 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-2xl text-[var(--text-heading)] leading-snug group-hover:text-[var(--brand-primary)] transition-colors">
                    {story.title}
                  </h3>

                  <p className="text-base text-[var(--text-muted)] mt-3 leading-relaxed">
                    {story.content.substring(0, 140)}...
                  </p>
                </div>

                <div>
                  {/* TAGS */}
                  {story.productTags && story.productTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 py-4">
                      {story.productTags.map(tag => (
                        <span
                          key={tag}
                          className="bg-[var(--brand-soft)]/20 border border-[var(--brand-accent)]/20 text-[var(--brand-primary)] text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wider shadow-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* DATE */}
                  <div className="text-xs font-bold tracking-widest text-[var(--text-muted)] pt-4 border-t border-[var(--border-light)] uppercase">
                    {new Date(story.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}


      {/* SUBMIT MODAL */}

      <StorySubmitModal
        open={openSubmit}
        onClose={() => setOpenSubmit(false)}
      />

    </main>

  )
}