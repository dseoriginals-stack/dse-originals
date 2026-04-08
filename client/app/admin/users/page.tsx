"use client"
export const dynamic = "force-dynamic"


import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Users, Mail, Phone, Calendar } from "lucide-react"

type User = {
  id: string
  name: string
  email: string
  role: string
  luckyPoints: number
  createdAt: string
  phone?: string
}

export default function UsersPage() {
  if (typeof window === "undefined") return null

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await api.get<User[]>("/admin/users")
      setUsers(data || [])
    } catch (err: any) {
      setError(err.message || "Failed to load users.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center gap-3 text-[var(--text-muted)] font-medium">
         <svg className="animate-spin h-6 w-6 text-[var(--brand-primary)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
         Loading customer database...
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500 font-medium bg-red-50 p-4 rounded-xl border border-red-100">{error}</div>
  }

  return (
    <div className="space-y-8">
      
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-[var(--text-heading)] tracking-tight">User Management</h1>
        <p className="text-[var(--text-muted)] font-medium">View and manage customer accounts and roles.</p>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {users.length === 0 ? (
          <div className="col-span-full py-10 flex flex-col items-center justify-center text-center bg-white/50 backdrop-blur-md border border-[var(--border-light)] rounded-3xl">
            <Users size={48} className="text-[var(--border-light)] mb-4" />
            <p className="text-[var(--text-muted)] font-medium italic">No users found in database.</p>
          </div>
        ) : (
          users.map((user) => (
            <div key={user.id} className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-[var(--border-light)] shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col gap-5">
              
              <div className="flex justify-between items-start">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[var(--brand-primary)] to-[var(--brand-accent)] text-white flex justify-center items-center text-xl font-bold shadow-md shadow-[var(--brand-primary)]/20">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-[var(--text-heading)] leading-none mb-1 group-hover:text-[var(--brand-primary)] transition-colors">{user.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-medium">
                      <Mail size={12} />
                      {user.email}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[var(--bg-surface)] rounded-2xl p-4 flex flex-col gap-2 border border-[var(--border-light)]/50">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[var(--text-muted)] font-medium flex items-center gap-2"><Calendar size={14} className="opacity-50" /> Joined</span>
                  <span className="font-semibold text-[var(--text-main)]">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {user.phone && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[var(--text-muted)] font-medium flex items-center gap-2"><Phone size={14} className="opacity-50" /> Phone</span>
                    <span className="font-semibold text-[var(--text-main)]">{user.phone}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[var(--text-muted)] font-medium">Role</span>
                  <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded border ${user.role === 'admin' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                    {user.role}
                  </span>
                </div>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  )
}