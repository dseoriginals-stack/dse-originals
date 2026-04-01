const BASE_URL = process.env.NEXT_PUBLIC_API_URL!

export function getImageUrl(path?: string | null) {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not defined")
  }

  // ✅ strict fallback
  if (!path || path === "placeholder.png") {
    return "/placeholder.png"
  }

  // ✅ full URL (Cloudinary)
  if (path.startsWith("http")) return path

  let clean = path.trim()

  // remove leading slash
  clean = clean.replace(/^\/+/, "")

  // ❗ prevent double uploads path
  if (clean.startsWith("uploads/")) {
    clean = clean.replace(/^uploads\//, "")
  }

  return `${BASE_URL}/api/uploads/${clean}`
}