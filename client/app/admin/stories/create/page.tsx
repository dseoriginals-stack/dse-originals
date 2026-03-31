"use client"
export const dynamic = "force-dynamic"

import { useState } from "react"
import { API_URL } from "@/lib/api"
import { useRouter } from "next/navigation"

export default function CreateStoryPage() {

  if (typeof window === "undefined") return null

  const router = useRouter()

  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "Events",
    published: false,
  })

  const handleSubmit = async (e: any) => {
    e.preventDefault()

    try {

      // ✅ LAZY IMPORT (FIX)
      const { supabase } = await import("@/lib/supabase-browser")

      const session = await supabase.auth.getSession()
      const token = session.data.session?.access_token

      await fetch(`${API_URL}/stories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      })

      router.push("/admin/stories")

    } catch (err) {
      console.error("Create story failed", err)
    }
  }

  return (
    <div className="max-w-3xl space-y-8">
      <h1 className="text-3xl font-bold text-primary">Create Story</h1>

      <form onSubmit={handleSubmit} className="space-y-6">

        <input
          placeholder="Title"
          className="w-full border p-3 rounded"
          onChange={(e)=>setForm({...form,title:e.target.value})}
        />

        <input
          placeholder="Slug"
          className="w-full border p-3 rounded"
          onChange={(e)=>setForm({...form,slug:e.target.value})}
        />

        <textarea
          placeholder="Excerpt"
          className="w-full border p-3 rounded"
          onChange={(e)=>setForm({...form,excerpt:e.target.value})}
        />

        <textarea
          placeholder="Content"
          className="w-full border p-3 rounded h-40"
          onChange={(e)=>setForm({...form,content:e.target.value})}
        />

        <select
          className="border p-3 rounded"
          onChange={(e)=>setForm({...form,category:e.target.value})}
        >
          <option>Events</option>
          <option>Product Launch</option>
          <option>Community</option>
        </select>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            onChange={(e)=>setForm({...form,published:e.target.checked})}
          />
          Publish immediately
        </label>

        <button className="bg-primary text-white px-6 py-3 rounded-lg">
          Save Story
        </button>

      </form>
    </div>
  )
}