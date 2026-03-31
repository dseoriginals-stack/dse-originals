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

      <div className="flex items-center gap-3 mb-6">

        <div className="bg-primary/10 p-3 rounded-full">
          <Heart className="text-primary" size={22} />
        </div>

        <div>
          <h2 className="font-semibold text-lg">
            Share Your Story
          </h2>

          <p className="text-sm text-muted">
            Your experience can inspire others.
          </p>
        </div>

      </div>


      {/* INFO BANNER */}

      <div className="bg-soft p-4 rounded-xl text-sm text-primary mb-6">

        ✨ We'd love to hear how our products impacted your journey.

      </div>


      {/* USER INFO */}

      <div className="space-y-4 mb-6">

        <h3 className="font-semibold text-primary">
          Your Information
        </h3>

        <div className="grid md:grid-cols-2 gap-4">

          <input
            placeholder="Your Name"
            className="input"
            value={name}
            onChange={(e)=>setName(e.target.value)}
          />

          <input
            placeholder="Email (optional)"
            className="input"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
          />

        </div>

      </div>


      {/* STORY */}

      <div className="space-y-3 mb-6">

        <h3 className="font-semibold text-primary">
          Your Story
        </h3>

        <textarea
          rows={5}
          placeholder="Tell us your experience..."
          className="input"
          value={story}
          onChange={(e)=>setStory(e.target.value)}
        />

      </div>


      {/* TAGS */}

      <div className="space-y-3 mb-6">

        <h3 className="font-semibold text-primary">
          Tags
        </h3>

        <div className="flex gap-2">

          <input
            className="input flex-1"
            placeholder="Add tag"
            value={tagInput}
            onChange={(e)=>setTagInput(e.target.value)}
          />

          <button
            onClick={addTag}
            className="bg-primary text-white px-4 rounded-xl"
          >
            Add
          </button>

        </div>

        <div className="flex flex-wrap gap-2">

          {tags.map(tag => (

            <span
              key={tag}
              className="bg-soft text-primary text-xs px-3 py-1 rounded-full"
            >
              {tag}
            </span>

          ))}

        </div>

      </div>


      {/* PHOTO UPLOAD */}

      <div className="mb-8">

        <h3 className="font-semibold text-primary mb-3">
          Photos (optional)
        </h3>

        <div className="border-2 border-dashed border-accent rounded-xl p-8 text-center text-muted flex flex-col items-center gap-2">

          <Camera size={28} />

          <p>Add photos</p>

        </div>

      </div>


      {/* ACTIONS */}

      <div className="flex justify-end gap-3">

        <button
          onClick={onClose}
          className="px-4 py-2 text-muted"
        >
          Cancel
        </button>

        <button className="bg-primary text-white px-5 py-2 rounded-xl flex items-center gap-2">

          <Heart size={16} />

          Share Story

        </button>

      </div>

    </Modal>

  )
}