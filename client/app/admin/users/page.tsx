"use client"
export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

import { useEffect, useState } from "react"

export default function UsersPage() {

  if (typeof window === "undefined") return null

  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {

    if (typeof window === "undefined") return

    fetchUsers()

  }, [])

  const fetchUsers = async () => {
    try {

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user`
      )

      if (!res.ok) {
        throw new Error("Failed to fetch users")
      }

      const data = await res.json()
      setUsers(data.data || [])

    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading users...</div>
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <div className="p-6 space-y-4">

      <h1 className="text-2xl font-semibold">
        Users
      </h1>

      {users.map(user => (
        <div key={user.id} className="border p-4 rounded">

          <p className="font-medium">
            {user.name || "No Name"}
          </p>

          <p className="text-sm text-gray-500">
            {user.email}
          </p>

        </div>
      ))}

    </div>
  )
}