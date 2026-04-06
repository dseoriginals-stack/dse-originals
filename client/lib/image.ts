export function getImageUrl(path?: string | null) {
  // ✅ fallback
  if (!path) return "/placeholder.png"

  // ✅ Cloudinary / external URLs
  if (path.startsWith("http")) return path

  // ✅ optional local fallback
  const base = process.env.NEXT_PUBLIC_API_URL

  if (!base) return "/placeholder.png" // ❗ DO NOT THROW

  const clean = path
    .trim()
    .replace(/^\/+/, "")
    .replace(/^uploads\//, "")

  return `${base}/api/uploads/${clean}`
}