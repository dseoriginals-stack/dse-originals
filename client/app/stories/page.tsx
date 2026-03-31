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

    <main className="container py-16 space-y-12">

      {/* HEADER */}

      <div className="text-center space-y-4">

        <h1 className="text-3xl md:text-4xl font-bold text-primary">
          Community Stories
        </h1>

        <p className="text-muted max-w-xl mx-auto">
          Real experiences shared by our community.  
          Inspire others by sharing your journey.
        </p>

        <button
          onClick={() => setOpenSubmit(true)}
          className="bg-accent text-white px-6 py-3 rounded-xl"
        >
          Share Your Story
        </button>

      </div>


      {/* STORIES */}

      {loading ? (

        <div className="text-center py-20 text-muted">
          Loading stories...
        </div>

      ) : stories.length === 0 ? (

        <div className="text-center py-20 text-muted">
          No stories yet. Be the first to share!
        </div>

      ) : (

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">

          {stories.map(story => (

            <div
              key={story.id}
              className="bg-surface rounded-2xl shadow-md overflow-hidden transition hover:shadow-lg"
            >

              {/* IMAGE */}

              {story.image && (

                <img
                  src={story.image}
                  alt={story.title}
                  className="w-full h-52 object-cover"
                />

              )}

              {/* CONTENT */}

              <div className="p-6 space-y-3">

                <h3 className="font-semibold text-lg">
                  {story.title}
                </h3>

                <p className="text-sm text-muted">
                  {story.content.substring(0, 140)}...
                </p>

                {/* TAGS */}

                {story.productTags && story.productTags.length > 0 && (

                  <div className="flex flex-wrap gap-2 pt-2">

                    {story.productTags.map(tag => (

                      <span
                        key={tag}
                        className="bg-soft text-primary text-xs px-3 py-1 rounded-full"
                      >
                        {tag}
                      </span>

                    ))}

                  </div>

                )}

                {/* DATE */}

                <div className="text-xs text-muted pt-3">
                  {new Date(story.createdAt).toLocaleDateString()}
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