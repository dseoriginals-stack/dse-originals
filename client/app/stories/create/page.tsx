"use client"

import { useState } from "react"
import { api } from "@/lib/api"

export default function CreateStoryPage() {

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [image, setImage] = useState("")
  const [tags, setTags] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {

    setLoading(true)

    try {

      await api.post("/stories", {
        title,
        content,
        image,
        productTags: tags.split(",")
      })

      alert("Story submitted for review")

      setTitle("")
      setContent("")
      setImage("")
      setTags("")

    } catch {

      alert("Failed to submit story")

    }

    setLoading(false)

  }

  return (

    <main className="container py-16 max-w-xl space-y-6">

      <h1 className="text-2xl font-bold text-primary">
        Share Your Story
      </h1>

      <input
        className="input"
        placeholder="Story Title"
        value={title}
        onChange={(e)=>setTitle(e.target.value)}
      />

      <textarea
        rows={5}
        className="input"
        placeholder="Your Story..."
        value={content}
        onChange={(e)=>setContent(e.target.value)}
      />

      <input
        className="input"
        placeholder="Image URL"
        value={image}
        onChange={(e)=>setImage(e.target.value)}
      />

      <input
        className="input"
        placeholder="Product tags (comma separated)"
        value={tags}
        onChange={(e)=>setTags(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-primary text-white px-6 py-3 rounded-xl w-full"
      >
        {loading ? "Posting..." : "Post Story"}
      </button>

    </main>
  )
}