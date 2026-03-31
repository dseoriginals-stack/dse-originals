const BASE_URL = process.env.NEXT_PUBLIC_API_URL!

export function getImageUrl(path?: string) {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not defined")
  }

  if (!path) return "/placeholder.png"

  if (path.startsWith("http")) return path

  // normalize
  let clean = path.trim()

  // remove leading slash
  clean = clean.replace(/^\/+/, "")

  // 🔥 remove duplicate "uploads/"
  if (clean.startsWith("uploads/")) {
    clean = clean.replace(/^uploads\//, "")
  }
  
  return `${BASE_URL}/api/uploads/${clean}`
}