"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"

export default function AddressesPage() {

  const { user } = useAuth()

  const [addresses, setAddresses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)

  const [form, setForm] = useState({
    label: "",
    fullName: "",
    phone: "",
    region: "",
    province: "",
    city: "",
    barangay: "",
    street: "",
    postalCode: "",
    isDefault: false
  })

  useEffect(() => {
    if (!user) return
    fetchAddresses()
  }, [user])

  const fetchAddresses = async () => {
    try {
      const data = await api.get("/user/me/addresses")
      setAddresses(data)
    } catch (err) {
      console.error("Failed to fetch addresses")
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditing(null)
    setForm({
      label: "",
      fullName: "",
      phone: "",
      region: "",
      province: "",
      city: "",
      barangay: "",
      street: "",
      postalCode: "",
      isDefault: false
    })
    setFormOpen(true)
  }

  const openEdit = (addr:any) => {
    setEditing(addr)
    setForm(addr)
    setFormOpen(true)
  }

  const handleSubmit = async () => {
    try {
      if (editing) {
        await api.put(`/user/me/addresses/${editing.id}`, form)
      } else {
        await api.post(`/user/me/addresses`, form)
      }

      setFormOpen(false)
      fetchAddresses()
    } catch (err) {
      console.error("Save failed")
    }
  }

  const handleDelete = async (id:string) => {
    if (!confirm("Delete this address?")) return
    await api.delete(`/user/me/addresses/${id}`)
    fetchAddresses()
  }

  const setDefault = async (addr:any) => {
    await api.put(`/user/me/addresses/${addr.id}`, {
      ...addr,
      isDefault: true
    })
    fetchAddresses()
  }

  if (!user) {
    return (
      <div className="container py-20 text-center">
        Please login to manage addresses.
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container py-20 text-center">
        Loading addresses...
      </div>
    )
  }

  return (

    <section className="max-w-5xl mx-auto px-6 py-20 space-y-10">

      <div className="flex justify-between items-center">

        <h1 className="text-3xl font-semibold">
          Your Addresses
        </h1>

        <button
          onClick={openCreate}
          className="bg-primary text-white px-5 py-2 rounded-xl"
        >
          Add Address
        </button>

      </div>

      {addresses.length === 0 && (
        <p className="text-slate-500">
          No saved addresses yet.
        </p>
      )}

      <div className="grid gap-6">

        {addresses.map(addr => (

          <div
            key={addr.id}
            className="bg-white border border-border rounded-xl p-6 space-y-3"
          >

            <div className="flex justify-between items-start">

              <div>

                <p className="font-semibold">
                  {addr.fullName}
                </p>

                <p className="text-sm text-slate-500">
                  {addr.phone}
                </p>

              </div>

              {addr.isDefault && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                  Default
                </span>
              )}

            </div>

            <p className="text-sm text-slate-600">
              {addr.street}, {addr.barangay}
            </p>

            <p className="text-sm text-slate-600">
              {addr.city}, {addr.province}, {addr.region}
            </p>

            <div className="flex gap-4 pt-3 text-sm">

              <button
                onClick={() => openEdit(addr)}
                className="text-primary"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(addr.id)}
                className="text-red-500"
              >
                Delete
              </button>

              {!addr.isDefault && (
                <button
                  onClick={() => setDefault(addr)}
                  className="text-slate-600"
                >
                  Set Default
                </button>
              )}

            </div>

          </div>

        ))}

      </div>

      {/* FORM MODAL (UNCHANGED — YOUR ORIGINAL) */}

      {formOpen && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white p-8 rounded-2xl w-full max-w-lg space-y-4">

            <h2 className="text-xl font-semibold">
              {editing ? "Edit Address" : "New Address"}
            </h2>

            {[
              "label",
              "fullName",
              "phone",
              "region",
              "province",
              "city",
              "barangay",
              "street",
              "postalCode"
            ].map(field => (

              <input
                key={field}
                placeholder={field}
                value={(form as any)[field]}
                onChange={e =>
                  setForm({
                    ...form,
                    [field]: e.target.value
                  })
                }
                className="w-full border p-2 rounded"
              />

            ))}

            <label className="flex items-center gap-2 text-sm">

              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={e =>
                  setForm({
                    ...form,
                    isDefault: e.target.checked
                  })
                }
              />

              Set as default

            </label>

            <div className="flex justify-end gap-3 pt-4">

              <button
                onClick={() => setFormOpen(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                className="bg-primary text-white px-4 py-2 rounded"
              >
                Save
              </button>

            </div>

          </div>

        </div>

      )}

    </section>

  )
}