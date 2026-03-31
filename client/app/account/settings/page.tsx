"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"

type Profile = {
  name: string
  phone: string
}

export default function SettingsPage() {

  const { user, updateUser, loading: authLoading } = useAuth()

  /* ========================
     PROFILE STATE
  ======================== */

  const [profile, setProfile] = useState<Profile>({
    name: "",
    phone: ""
  })

  const [profileLoading, setProfileLoading] = useState(true)
  const [profileSaving, setProfileSaving] = useState(false)

  /* ========================
     PASSWORD STATE
  ======================== */

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  /* ========================
     FETCH PROFILE
  ======================== */

  useEffect(() => {
    if (!user) {
      setProfileLoading(false)
      return
    }
    fetchProfile()
  }, [user])

  const fetchProfile = async () => {
    try {
      const data = await api.get<any>("/user/me") // ✅ already parsed JSON

      setProfile({
        name: data?.name || "",
        phone: data?.phone || ""
      })

    } catch (err) {
      console.error("Profile fetch failed", err)
      setProfile({ name: "", phone: "" })
    } finally {
      setProfileLoading(false)
    }
  }

  /* ========================
     UPDATE PROFILE
  ======================== */

  const updateProfile = async () => {
    try {
      setProfileSaving(true)

      await api.patch("/user/me", profile)

      updateUser(profile) // instant UI update

      alert("Profile updated")

    } catch (err: any) {
      alert(err.message || "Update failed")
    } finally {
      setProfileSaving(false)
    }
  }

  /* ========================
     UPDATE PASSWORD
  ======================== */

  const updatePassword = async () => {
    if (!password || !confirmPassword) {
      alert("Please fill all fields")
      return
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match")
      return
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters")
      return
    }

    try {
      setLoading(true)

      await api.post("/auth/update-password", { password })

      setPassword("")
      setConfirmPassword("")

      alert("Password updated successfully")

    } catch (error: any) {
      alert(error.message || "Password update failed")
    } finally {
      setLoading(false)
    }
  }

  /* ========================
     GUARDS
  ======================== */

  if (authLoading) {
    return (
      <div className="container py-20 text-center text-white">
        Loading...
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container py-20 text-center text-white">
        Please login to access settings.
      </div>
    )
  }

  /* ========================
     UI
  ======================== */

  return (
    <div className="container py-10 space-y-10">

      <h1 className="text-2xl font-bold text-white">
        Account Settings
      </h1>

      {/* PROFILE SECTION */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-6 max-w-lg">

        <h2 className="text-lg font-semibold text-white">
          Profile Information
        </h2>

        {profileLoading ? (
          <p className="text-slate-400">Loading profile...</p>
        ) : (
          <div className="space-y-4">

            {/* EMAIL */}
            <input
              value={user.email}
              disabled
              className="w-full bg-slate-800 border border-slate-700 p-3 rounded text-slate-400"
            />

            {/* NAME */}
            <input
              placeholder="Full Name"
              value={profile.name}
              onChange={(e) =>
                setProfile({ ...profile, name: e.target.value })
              }
              className="w-full bg-slate-950 border border-slate-800 p-3 rounded text-white"
            />

            {/* PHONE */}
            <input
              placeholder="Phone"
              value={profile.phone}
              onChange={(e) =>
                setProfile({ ...profile, phone: e.target.value })
              }
              className="w-full bg-slate-950 border border-slate-800 p-3 rounded text-white"
            />

            <button
              onClick={updateProfile}
              disabled={profileSaving}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              {profileSaving ? "Saving..." : "Save Profile"}
            </button>

          </div>
        )}

      </div>

      {/* PASSWORD SECTION */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-6 max-w-lg">

        <h2 className="text-lg font-semibold text-white">
          Change Password
        </h2>

        <div className="space-y-4">

          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 p-3 rounded text-white"
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e)=>setConfirmPassword(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 p-3 rounded text-white"
          />

        </div>

        <button
          onClick={updatePassword}
          disabled={loading}
          className="bg-primary text-white px-6 py-2 rounded-lg hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>

      </div>

    </div>
  )
}