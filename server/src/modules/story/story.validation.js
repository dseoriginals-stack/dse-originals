import { z } from "zod"

export const createStorySchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(100),
    content: z.string().min(10, "Story must be at least 10 characters").max(2000),
    image: z.string().optional(),
    category: z.string().optional(),
    name: z.string().optional(),
    email: z.string().email("Invalid email format").optional(),
    featuredProductId: z.string().uuid().optional().nullable(),
    productTags: z.array(z.string()).optional()
  })
})

export const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(["pending", "approved", "rejected"])
  })
})
