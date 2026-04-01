import prisma from "../../config/prisma.js"
import { z } from "zod"
import generateSlug from "../../utils/slugify.js"
import { Prisma } from "@prisma/client"
import cloudinary from "../../config/cloudinary.js"
import streamifier from "streamifier"

import {
  getCache,
  setCache,
  deleteCache
} from "../../utils/searchCache.js"
import { upload } from "../../config/multer.js"

router.post("/", upload.single("image"), createProduct)
router.put("/:id", upload.single("image"), updateProduct) // if you have update
/* ================================
   HELPERS
================================ */

const uploadFromBuffer = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "dse-products",

        // 🔥 AUTO OPTIMIZATION
        resource_type: "image",
        format: "webp", // modern format
        quality: "auto", // compress automatically

        // 🔥 RESPONSIVE SIZING
        transformation: [
          { width: 1200, crop: "limit" } // prevent huge images
        ]
      },
      (error, result) => {
        if (result) resolve(result)
        else reject(error)
      }
    )

    streamifier.createReadStream(buffer).pipe(stream)
  })
}

/* ================================
   PRODUCT SCHEMA
================================ */

const productSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  price: z.coerce.number().positive(),
  categoryId: z.string(),
  stock: z.coerce.number().int().nonnegative()
})

/* ================================
   CREATE PRODUCT
================================ */

export const createProduct = async (req, res, next) => {
  try {
    const validation = productSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        message: validation.error?.errors?.[0]?.message || "Invalid input"
      })
    }

    const { name, price, stock, categoryId, description } = validation.data

    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    })

    if (!category) {
      return res.status(400).json({
        message: "Category does not exist"
      })
    }

    let imageUrl = null

    if (req.file) {
      const result = await uploadFromBuffer(req.file.buffer)
      imageUrl = result.secure_url
    }

    const slug = await generateSlug(name)

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        status: "active",

        category: {
          connect: { id: categoryId }
        },

        ...(imageUrl && {
          images: {
            create: [{ url: imageUrl, isPrimary: true }]
          }
        }),

        variants: {
          create: [
            {
              sku: `SKU-${Date.now()}`,
              name: "Default",
              price: new Prisma.Decimal(price),
              stock
            }
          ]
        }
      }
    })

    await deleteCache("products:*")

    res.status(201).json(product)

  } catch (err) {
    console.error("❌ CREATE PRODUCT ERROR:", err)
    next(err)
  }
}

/* ================================
   GET PRODUCTS (OPTIMIZED)
================================ */

export const getProducts = async (req, res) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 12
    } = req.query

    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const skip = (pageNum - 1) * limitNum

    const cacheKey = `products:${JSON.stringify(req.query)}`
    const cached = await getCache(cacheKey)
    if (cached) return res.json(cached)

    const where = {
      status: "active",

      ...(category && { categoryId: category }),

      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } }
        ]
      }),

      ...(minPrice || maxPrice
        ? {
            variants: {
              some: {
                price: {
                  ...(minPrice && { gte: new Prisma.Decimal(minPrice) }),
                  ...(maxPrice && { lte: new Prisma.Decimal(maxPrice) })
                }
              }
            }
          }
        : {})
    }

    let orderBy = { createdAt: "desc" }

    if (sort === "price_asc") {
      orderBy = { variants: { _min: { price: "asc" } } }
    }

    if (sort === "price_desc") {
      orderBy = { variants: { _max: { price: "desc" } } }
    }

    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          createdAt: true,

          // ✅ FIX: include category
          categoryId: true,
          category: {
            select: {
              id: true,
              name: true
            }
          },

          // ✅ IMAGE
          images: {
            where: { isPrimary: true },
            take: 1,
            select: { url: true }
          },

          // ✅ FIX: include stock
          variants: {
            take: 1,
            select: {
              price: true,
              stock: true
            }
          }
        },
        skip,
        take: limitNum,
        orderBy
      }),
      prisma.product.count({ where })
    ])

    const response = {
      data: products.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        image: p.images?.[0]?.url || null,
        price: Number(p.variants?.[0]?.price || 0)
      })),
      pagination: {
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum)
      }
    }

    await setCache(cacheKey, response, 120)

    res.json(response)

  } catch (err) {
    console.error("❌ GET PRODUCTS ERROR:", err)
    res.status(500).json({ error: err.message })
  }
}

/* ================================
   GET PRODUCT BY SLUG (OPTIMIZED)
================================ */

export const getProductBySlugController = async (req, res) => {
  try {
    const { slug } = req.params

    const cacheKey = `product:${slug}`
    const cached = await getCache(cacheKey)
    if (cached) return res.json(cached)

    const product = await prisma.product.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,

        images: {
          select: { url: true }
        },

        variants: {
          select: {
            id: true,
            price: true,
            stock: true,
            attributes: true
          }
        },

        category: {
          select: { id: true, name: true }
        }
      }
    })

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    await setCache(cacheKey, product, 180)

    res.json(product)

  } catch (err) {
    console.error("❌ GET PRODUCT BY SLUG ERROR:", err)
    res.status(500).json({ error: err.message })
  }
}

/* ================================
   SEARCH PRODUCTS (FIXED)
================================ */

export const searchProducts = async (req, res) => {
  try {
    const q = (req.query.q || "").trim()

    if (!q) return res.json([])

    const products = await prisma.product.findMany({
      where: {
        status: "active",
        name: {
          contains: q,
          mode: "insensitive"
        }
      },
      take: 8,
      select: {
        id: true,
        name: true,
        slug: true,
        images: {
          take: 1,
          select: { url: true }
        },
        variants: {
          take: 1,
          select: { price: true }
        }
      }
    })

    res.json(products.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      image: p.images?.[0]?.url || null,
      price: Number(p.variants?.[0]?.price || 0)
    })))

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}

/* ================================
   DELETE PRODUCT
================================ */

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params

    await prisma.product.update({
      where: { id },
      data: { status: "archived" }
    })

    await deleteCache("products:*")
    await deleteCache("product:*")

    res.json({ message: "Product disabled" })

  } catch (err) {
    console.error("❌ DELETE PRODUCT ERROR:", err)
    res.status(500).json({ error: err.message })
  }
}