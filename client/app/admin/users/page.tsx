"use client"
export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Users, Mail, Phone, Calendar, ShieldCheck, UserCog, User as UserIcon } from "lucide-react"
import toast from "react-hot-toast"

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
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
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

  const updateRole = async (id: string, newRole: string) => {
    try {
      setUpdatingId(id)
      await api.patch(`/admin/users/${id}/role`, { role: newRole })
      toast.success(`User promoted to ${newRole}!`)
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u))
    } catch (err) {
      toast.error("Role update failed")
    } finally {
      setUpdatingId(null)
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

  return (
    <div className="space-y-10 pb-20">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-[1000] text-[var(--text-heading)] tracking-tighter">Personnel Directory</h1>
          <p className="text-[var(--text-muted)] font-bold uppercase tracking-widest text-[10px] mt-1">Manage core team and community access</p>
        </div>
        <div className="bg-white px-6 py-3 border border-[var(--border-light)] rounded-2xl shadow-sm flex items-center gap-2">
          <ShieldCheck className="text-[var(--brand-primary)]" size={18} />
          <span className="text-xs font-black uppercase tracking-widest text-[var(--text-heading)]">{users.length} Registered Nodes</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
        {users.length === 0 ? (
          <div className="col-span-full py-24 flex flex-col items-center justify-center text-center bg-white/50 backdrop-blur-md border-2 border-dashed border-[var(--border-light)] rounded-[3rem]">
            <Users size={64} className="text-[var(--border-light)] mb-4 opacity-30" />
            <p className="text-[var(--text-muted)] font-black uppercase tracking-widest text-sm">Vault is currently empty</p>
          </div>
        ) : (
          users.map((user) => (
            <div key={user.id} className="bg-white border border-[var(--border-light)] p-8 rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 group flex flex-col gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                 {user.role === 'admin' ? <ShieldCheck size={100} /> : <UserIcon size={100} />}
              </div>

              <div className="flex gap-4 items-center relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[var(--brand-primary)] to-[var(--brand-accent)] text-white flex justify-center items-center text-2xl font-black shadow-xl shadow-[var(--brand-primary)]/20 group-hover:scale-110 transition-transform">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-[1000] text-xl text-[var(--text-heading)] leading-none mb-1.5 transition-colors">{user.name}</h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest">
                    <Mail size={12} className="text-[var(--brand-primary)]" />
                    {user.email}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50/50 rounded-[1.5rem] p-5 flex flex-col gap-3 border border-gray-100 relative z-10">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-gray-400 flex items-center gap-2"><Calendar size={12} /> Creation Date</span>
                  <span className="text-[var(--text-heading)]">
                    {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                {user.phone && (
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-gray-400 flex items-center gap-2"><Phone size={12} /> Contact</span>
                    <span className="text-[var(--text-heading)]">{user.phone}</span>
                  </div>
                )}
                <div className="pt-3 mt-1 border-t border-gray-100 flex justify-between items-center">
                   <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Security Clearance</span>
                   <span className={`text-[9px] uppercase tracking-[0.2em] font-black px-3 py-1 rounded-full border shadow-sm ${user.role === 'admin' ? 'bg-purple-50 text-purple-600 border-purple-100 shadow-purple-100/50' : user.role === 'staff' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                    {user.role}
                  </span>
                </div>
              </div>

              {/* ROLE SWITCHER */}
              <div className="relative z-10">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Assign Authority</p>
                <div className="flex gap-2">
                   {['user', 'staff', 'admin'].map(r => (
                     <button
                      key={r}
                      disabled={updatingId === user.id || user.role === r}
                      onClick={() => updateRole(user.id, r)}
                      className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all border ${user.role === r 
                        ? 'bg-[var(--brand-primary)] text-white border-[var(--brand-primary)] shadow-lg shadow-[var(--brand-primary)]/20' 
                        : 'bg-white text-gray-400 border-gray-100 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]'}`}
                     >
                        {updatingId === user.id ? '...' : r}
                     </button>
                   ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  )
}