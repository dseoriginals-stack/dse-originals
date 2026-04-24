import { z } from "zod"

const addressSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().min(7, "Valid phone number is required"),
  region: z.string().min(1, "Region is required"),
  province: z.string().min(1, "Province is required"),
  city: z.string().min(1, "City is required"),
  barangay: z.string().min(1, "Barangay is required"),
  street: z.string().min(3, "Street address is required"),
  postalCode: z.string().optional().nullable(),
})

export const createOrderSchema = z.object({
  body: z.object({
    items: z.array(z.object({
      variantId: z.string().uuid("Invalid item ID"),
      quantity: z.number().int().positive("Quantity must be at least 1"),
      productId: z.string().uuid().optional(),
    })).min(1, "At least one item is required"),
    address: addressSchema,
    guestEmail: z.string().email("Valid email is required").optional().nullable(),
    guestName: z.string().optional().nullable(),
    deliveryMethod: z.enum(["delivery", "pickup"]).default("delivery"),
    shippingFee: z.number().nonnegative().optional(),
    pointsToUse: z.number().int().nonnegative().optional(),
    clientOrderId: z.string().optional(),
  })
})

export const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum([
      "initialized",
      "pending",
      "approved",
      "accepted",
      "paid",
      "shipped",
      "delivered",
      "refunded",
      "cancelled"
    ]),
    trackingNo: z.string().optional()
  })
})
