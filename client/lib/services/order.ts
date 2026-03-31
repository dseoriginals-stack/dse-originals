import { api } from "@/lib/api"

export const orderService = {
  getMyOrders: () => api.get("/orders/my-orders"),

  getOrder: (id: string) => api.get(`/orders/${id}`),

  getTracking: (id: string) =>
    api.get(`/orders/${id}/tracking`),
}