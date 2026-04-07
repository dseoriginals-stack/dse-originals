"use client"
export const dynamic = "force-dynamic"


import { useEffect, useState } from "react"
import { API_URL } from "@/lib/api"
import Link from "next/link"
import { supabase } from "@/lib/supabase-browser"

export default function AdminStoriesPage() {

  if (typeof window === "undefined") return null

  const [stories, setStories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    if (typeof window === "undefined") return

    fetchStories()

  }, [])

  const fetchStories = async () => {
    try {

      const session = await supabase.auth.getSession()
      const token = session.data.session?.access_token

      const res = await fetch(`${API_URL}/stories/admin/all`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await res.json()
      setStories(data || [])

    } catch (err) {
      console.error("Fetch stories failed", err)
      setStories([])
    } finally {
      setLoading(false)
    }
  }

  const deleteStory = async (id: string) => {
    try {

      const session = await supabase.auth.getSession()
      const token = session.data.session?.access_token

      await fetch(`${API_URL}/stories/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      fetchStories()

    } catch (err) {
      console.error("Delete failed", err)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-10">

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">
          Manage Stories
        </h1>

        <Link href="/admin/stories/create" className="bg-primary text-white px-4 py-2 rounded-lg">
          + New Story
        </Link>
      </div>

      <div className="bg-white border rounded-2xl overflow-hidden">

        <table className="w-full text-left">

          <thead className="bg-light">
            <tr>
              <th className="p-4">Title</th>
              <th>Status</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>

            {stories.map(story => (
              <tr key={story.id} className="border-t">

                <td className="p-4">{story.title}</td>

                <td>
                  {story.published
                    ? <span className="text-green-600">Published</span>
                    : <span className="text-yellow-600">Draft</span>
                  }
                </td>

                <td>{story.category}</td>

                <td className="space-x-3">
                  <Link href={`/admin/stories/edit/${story.id}`} className="text-blue-600">
                    Edit
                  </Link>

                  <button onClick={()=>deleteStory(story.id)} className="text-red-600">
                    Delete
                  </button>
                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  )
}