export const API_URL = process.env.NEXT_PUBLIC_API_URL as string

function buildURL(endpoint: string) {
  const base = API_URL.replace(/\/$/, "")
  const cleanEndpoint = endpoint.replace(/^\//, "")

  // ✅ Prevent double /api/api bug
  if (cleanEndpoint.startsWith("api/")) {
    return `${base}/${cleanEndpoint}`
  }

  return `${base}/api/${cleanEndpoint}`
}

export async function request<T = any>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = buildURL(endpoint)
  const isFormData = options?.body instanceof FormData

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000) // 15s timeout

  try {
    const res = await fetch(url, {
      ...options,
      credentials: "include",
      signal: controller.signal,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(options?.headers || {}),
      },
    })

    let data: any = null

    try {
      data = await res.json()
    } catch {}

    if (!res.ok) {
      console.error("❌ API ERROR:", {
        url,
        status: res.status,
        data,
      })

      throw new Error(data?.message || `Request failed: ${res.status}`)
    }

    return data as T
  } catch (err: any) {
    if (err.name === "AbortError") {
      throw new Error("Request timeout")
    }
    throw err
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
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  put: <T = any>(endpoint: string, body?: any) =>
    request<T>(endpoint, {
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  patch: <T = any>(endpoint: string, body?: any) =>
    request<T>(endpoint, {
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  delete: <T = any>(endpoint: string) =>
    request<T>(endpoint, { method: "DELETE" }),
}