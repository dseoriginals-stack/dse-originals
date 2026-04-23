"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import Link from "next/link"
import { Check, X, Trash2, ExternalLink, Clock, ShieldCheck } from "lucide-react"
import toast from "react-hot-toast"

export default function AdminStoriesPage() {
  const [stories, setStories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStory, setSelectedStory] = useState<any>(null)

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
    const newStatus = currentStatus === "approved" ? "pending" : "approved"
    try {
      await api.patch(`/stories/${id}/status`, { status: newStatus })
      toast.success(newStatus === "approved" ? "Story approved!" : "Story set to pending")
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
                <tr 
                  key={story.id} 
                  onClick={() => setSelectedStory(story)}
                  className="hover:bg-gray-50/30 transition-colors group cursor-pointer"
                >
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
                    {story.status === "approved" ? (
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
                        onClick={(e) => { e.stopPropagation(); toggleStatus(story.id, story.status); }}
                        className={`p-2 rounded-xl transition-all ${story.status === 'approved' ? 'bg-amber-50 text-amber-500 hover:bg-amber-500 hover:text-white' : 'bg-green-50 text-green-500 hover:bg-green-500 hover:text-white'}`}
                        title={story.status === 'approved' ? 'Revert to Pending' : 'Approve Story'}
                      >
                        {story.status === 'approved' ? <X size={18} /> : <Check size={18} />}
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteStory(story.id); }}
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

      {/* STORY DETAIL MODAL */}
      {selectedStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl animate-scaleIn">
            {/* Modal Header/Image */}
            <div className="relative h-64 md:h-80 bg-slate-100">
              {selectedStory.image ? (
                <img src={selectedStory.image} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  No Image Provided
                </div>
              )}
              <button 
                onClick={() => setSelectedStory(null)}
                className="absolute top-6 right-6 p-2 bg-white/90 rounded-full text-slate-500 hover:text-slate-900 shadow-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 md:p-10 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-black text-[var(--text-heading)] tracking-tighter">{selectedStory.title}</h2>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)] mt-1">{selectedStory.category || 'General'}</p>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${selectedStory.status === 'approved' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                  {selectedStory.status === 'approved' ? 'Approved' : 'Pending Review'}
                </div>
              </div>

              <p className="text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">
                {selectedStory.content}
              </p>

              <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{selectedStory.user?.name || selectedStory.guestName || 'Anonymous'}</p>
                    <p className="text-[10px] font-medium text-slate-400">{new Date(selectedStory.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStatus(selectedStory.id, selectedStory.status);
                      setSelectedStory(null);
                    }}
                    className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedStory.status === 'approved' ? 'bg-amber-50 text-amber-500 hover:bg-amber-500 hover:text-white' : 'bg-green-50 text-green-500 hover:bg-green-500 hover:text-white'}`}
                  >
                    {selectedStory.status === 'approved' ? 'Revert to Pending' : 'Approve Now'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}