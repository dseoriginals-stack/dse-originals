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

  const timeout =
    typeof window !== "undefined"
      ? setTimeout(() => controller.abort(), isFormData ? 120000 : 30000)
      : null

  const isServer = typeof window === "undefined"

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,

      ...(isServer ? { next: { revalidate: 60 } } : {}),

      // ✅ CRITICAL FIX (COOKIE AUTH)
      credentials: "include",

      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(options?.headers || {})
      }
    })

    const data = await res.json().catch(() => null)

    if (!res.ok) {
      console.error(`❌ API ERROR [${res.status}] at: ${url}`);
      if (data) console.error("Response:", data);

      throw new Error(data?.message || `Request failed: ${res.status}`)
    }

    return data
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.warn("Request timeout:", url)
      throw new Error("Request timeout — server may be slow")
    }

    throw error
  } finally {
    if (timeout) clearTimeout(timeout)
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

  delete: <T = any>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: "DELETE" })
}