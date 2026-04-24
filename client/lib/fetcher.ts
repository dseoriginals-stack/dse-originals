import { api } from "./api"

export const fetcher = (url: string) => api.get(url)
