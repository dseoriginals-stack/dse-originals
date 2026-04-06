export const API_URL = process.env.NEXT_PUBLIC_API_URL as string

function buildURL(endpoint: string) {
  const base = API_URL.replace(/\/$/, "")
  const clean = endpoint.replace(/^\//, "")

  if (clean.startsWith("api/")) return `${base}/${clean}`

  return `${base}/api/${clean}`
}

export async function request<T = any>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = buildURL(endpoint)
  const isFormData = options?.body instanceof FormData

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  const isServer = typeof window === "undefined"

  try {
    const res = await fetch(url, {
      ...options,
      credentials: "include",
      signal: controller.signal,

      // ✅ FIXED (no more build error)
      ...(isServer ? { next: { revalidate: 60 } } : {}),

      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(options?.headers || {})
      }
    })

    const data = await res.json().catch(() => null)

    if (!res.ok) {
      throw new Error(data?.message || `Request failed: ${res.status}`)
    }

    return data
  } finally {
    clearTimeout(timeout)
  }
}

export const api = {
  get: <T = any>(endpoint: string) =>
    request<T>(endpoint, { method: "GET" }),

  post: <T = any>(endpoint: string, body?: any) =>
    request<T>(endpoint, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body)
    }),

  put: <T = any>(endpoint: string, body?: any) =>
    request<T>(endpoint, {
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body)
    }),

  patch: <T = any>(endpoint: string, body?: any) =>
    request<T>(endpoint, {
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body)
    }),

  delete: <T = any>(endpoint: string) =>
    request<T>(endpoint, { method: "DELETE" })
}