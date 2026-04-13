"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import Link from "next/link"
import { Check, X, Trash2, ExternalLink, Clock, ShieldCheck } from "lucide-react"
import toast from "react-hot-toast"

export default function AdminStoriesPage() {
  const [stories, setStories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStories()
  }, [])

  const fetchStories = async () => {
    try {
      const data = await api.get("/stories/admin/all")
      setStories(data || [])
    } catch (err) {
      console.error("Fetch stories failed", err)
      toast.error("Failed to load stories")
    } finally {
      setLoading(false)
    }
  }

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "pending" : "active"
    try {
      await api.patch(`/stories/${id}/status`, { status: newStatus })
      toast.success(newStatus === "active" ? "Story approved!" : "Story set to pending")
      fetchStories()
    } catch (err) {
      toast.error("Update failed")
    }
  }

  const deleteStory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this story?")) return
    try {
      await api.delete(`/stories/${id}`)
      toast.success("Story deleted")
      fetchStories()
    } catch (err) {
      toast.error("Delete failed")
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand-primary)]"></div>
    </div>
  )

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-heading)] tracking-tighter flex items-center gap-3">
            <ShieldCheck className="text-[var(--brand-primary)]" size={32} />
            Community Moderation
          </h1>
          <p className="text-[var(--text-muted)] font-medium mt-1">Review and approve stories shared by the DSE community.</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-left">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Story Title</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Contributor</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Status</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-gray-400 font-medium">
                    No stories have been submitted yet.
                  </td>
                </tr>
              ) : stories.map(story => (
                <tr key={story.id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      {story.image && (
                        <img src={story.image} className="w-12 h-12 rounded-xl object-cover ring-2 ring-gray-100" />
                      )}
                      <div>
                        <p className="font-bold text-[var(--text-heading)]">{story.title}</p>
                        <p className="text-xs text-gray-400 font-medium">{story.category || 'General'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 font-semibold text-sm text-gray-500">
                    {story.user?.name || 'Anonymous'}
                  </td>
                  <td className="px-6 py-6">
                    {story.status === "active" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest ring-1 ring-green-100">
                        Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest ring-1 ring-amber-100">
                        <Clock size={10} /> Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => toggleStatus(story.id, story.status)}
                        className={`p-2 rounded-xl transition-all ${story.status === 'active' ? 'bg-amber-50 text-amber-500 hover:bg-amber-500 hover:text-white' : 'bg-green-50 text-green-500 hover:bg-green-500 hover:text-white'}`}
                        title={story.status === 'active' ? 'Revert to Pending' : 'Approve Story'}
                      >
                        {story.status === 'active' ? <X size={18} /> : <Check size={18} />}
                      </button>
                      <button 
                        onClick={() => deleteStory(story.id)}
                        className="p-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                        title="Delete Story"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}