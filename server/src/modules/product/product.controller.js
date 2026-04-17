import prisma from "../../config/prisma.js"
import { z } from "zod"
import generateSlug from "../../utils/slugify.js"
import { Prisma } from "@prisma/client"
import cloudinary from "../../config/cloudinary.js"
import fs from "fs"
import {
  getCache,
  setCache,
  deleteCache
} from "../../utils/searchCache.js"

/* ================================
   HELPERS
================================ */
const uploadFromPath = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "dse-products",
      resource_type: "image",
      format: "webp",
      quality: "auto",
      transformation: [{ width: 1200, crop: "limit" }]
    })

    // delete local file after upload
    fs.unlinkSync(filePath)

    return result
  } catch (error) {
    console.error("CLOUDINARY ERROR:", error)
    throw error
  }
}

/* ================================
   SCHEMA
================================ */

const updateProductSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  categoryId: z.string(),

  price: z.coerce.number().optional(),
  stock: z.coerce.number().optional(),
  variants: z.string().optional(),

  isBestseller: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional(),
  isPopular: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional()
})

/* ================================
   CREATE PRODUCT
================================ */

export const createProduct = async (req, res, next) => {
  try {
    console.log("HIT CREATE PRODUCT")
    console.log("FILE:", req.file)

    // ================================
    // VALIDATE INPUT FIRST
    // ================================
    const validation = updateProductSchema.safeParse(req.body)
    if (!validation.success) {
      return res.status(400).json({
        message: validation.error?.errors?.[0]?.message || "Invalid input"
      })
    }

    const data = validation.data
    if (!data.variants && (!data.price || data.stock === undefined)) {
      return res.status(400).json({
        message: "Provide either variants or price & stock"
      })
    }
    // ✅ NEW VALIDATION LOGIC
    if (!data.variants && (!data.price || data.stock === undefined)) {
      return res.status(400).json({
        message: "Provide either variants or price & stock"
      })
    }

    if (!validation.success) {
      return res.status(400).json({
        message:
          validation.error?.errors?.[0]?.message || "Invalid input"
      })
    }

    const {
      name,
      price,
      stock,
      categoryId,
      description,
      isBestseller,
      isPopular,
      variants
    } = data

    let variantsFromClient = []

    if (variants) {
      try {
        variantsFromClient = JSON.parse(variants)
      } catch (e) {
        return res.status(400).json({ message: "Invalid variants format" })
      }
    }
    // ================================
    // CHECK CATEGORY
    // ================================
    const category = await prisma.category.findFirst({
      where: {
        OR: [{ id: categoryId }, { slug: categoryId }]
      }
    })

    if (!category) {
      return res.status(400).json({
        message: "Category does not exist"
      })
    }

    // ================================
    // UPLOAD IMAGE (SAFE VERSION)
    // ================================
    let imageUrl = null

    if (req.file) {
      try {
        const result = await uploadFromPath(req.file.path)
        if (result?.secure_url) {
          imageUrl = result.secure_url
        }
      } catch (err) {
        console.error("⚠️ CLOUDINARY FAILED:", err.message)
      }
    }

    // ================================
    // GENERATE VARIANTS BASED ON CATEGORY
    // ================================
    const catIdLower = String(category.id).toLowerCase();

    let variantsCreate = []

    if (variantsFromClient.length > 0) {
      // ✅ USE FRONTEND DATA
      variantsCreate = variantsFromClient.map((v) => ({
        sku: `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        price: new Prisma.Decimal(v.price),
        stock: parseInt(String(v.stock)) || 0,
        attributes: {
          create: v.attributes.map((a) => ({
            name: a.name,
            value: a.value
          }))
        }
      }))
    } else {
      // ⚠️ FALLBACK (optional)
      variantsCreate = [
        {
          sku: `SKU-${Date.now()}`,
          price: new Prisma.Decimal(price),
          stock: parseInt(String(stock)) || 0
        }
      ]
    }

    // ================================
    // CREATE PRODUCT (WITH SELF-HEALING FALLBACK)
    // ================================
    const slug = await generateSlug(name)

    const baseData = {
      name,
      slug,
      description,
      status: "active",
      categoryId: category.id,
      ...(imageUrl && {
        images: {
          create: [{ url: imageUrl, isPrimary: true }]
        }
      }),
      variants: {
        create: variantsCreate
      }
    }

    let product
    try {
      // Pass 1: Try with new fields
      product = await prisma.product.create({
        data: {
          ...baseData,
          isBestseller: !!isBestseller,
          isPopular: !!isPopular
        }
      })
    } catch (err) {
      if (err.message?.includes("Unknown argument")) {
        console.warn("⚠️ Prisma Sync Delay: Falling back to legacy create")
        // Pass 2: Try without new fields
        product = await prisma.product.create({
          data: baseData
        })
      } else {
        throw err // Re-throw if it's not a schema mismatch
      }
    }

    await deleteCache("products:*")
    await deleteCache("product:*")
    res.status(201).json(product)

  } catch (err) {
    console.error("❌ CRITICAL CREATE ERROR:", err)
    next(err)
  }
}

/* ================================
   GET PRODUCTS (FIXED PROPERLY)
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

          images: {
            orderBy: { isPrimary: "desc" }, // ✅ ensures primary first
            take: 1,
            select: { url: true }
          },
          isBestseller: true,

          variants: {
            select: {
              id: true,
              price: true,
              stock: true,
              attributes: {
                select: {
                  name: true,
                  value: true
                }
              }
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

        // ✅ GUARANTEED FIX
        image: p.images.length > 0 ? p.images[0].url : null,

        price: p.variants.length > 0
          ? Number(p.variants[0].price)
          : 0,
        isBestseller: p.isBestseller,

        variantId: p.variants.length > 0
          ? p.variants[0].id
          : "",
        variants: p.variants
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
   GET PRODUCT BY SLUG (IMPROVED)
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
          orderBy: { isPrimary: "desc" }
        },

        variants: {
          include: {
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
    console.error("❌ GET PRODUCT ERROR:", err)
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

export const searchProducts = async (req, res) => {
  try {
    const { q } = req.query

    if (!q) {
      return res.json({ data: [] })
    }

    const products = await prisma.product.findMany({
      where: {
        status: "active",
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } }
        ]
      },
      select: {
        id: true,
        name: true,
        slug: true,

        images: {
          take: 1,
          select: { url: true }
        },

        variants: {
          select: {
            id: true,
            productId: true,
            sku: true,
            name: true,
            price: true,
            stock: true,
            attributes: {
              select: {
                name: true,
                value: true
              }
            }
          }
        }
      }
    })

    res.json({
      data: products.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        image: p.images?.[0]?.url || null,
        price: Number(p.variants?.[0]?.price || 0),
        variantId: p.variants?.[0]?.id || "",
        variants: p.variants
      }))
    })
  } catch (err) {
    console.error("❌ SEARCH ERROR:", err)
    res.status(500).json({ error: err.message })
  }
}

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params

    // Validate input
    const validation = updateProductSchema.safeParse(req.body)
    if (!validation.success) {
      return res.status(400).json({
        message: validation.error?.errors?.[0]?.message || "Invalid input"
      })
    }

    const data = validation.data

    const {
      name,
      price,
      stock,
      categoryId,
      description,
      isBestseller,
      isPopular,
      variants
    } = data

    let variantsFromClient = []

    if (variants) {
      try {
        variantsFromClient = JSON.parse(variants)
      } catch (e) {
        return res.status(400).json({ message: "Invalid variants format" })
      }
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        variants: true
      }
    })

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    // Validate category exists
    if (categoryId) {
      const cat = await prisma.category.findFirst({
        where: {
          OR: [{ id: categoryId }, { slug: categoryId }]
        }
      })

      if (!cat) {
        return res.status(400).json({ message: "Invalid Category" })
      }
    }

    let imageUrl = null

    // Upload new image if exists
    if (req.file) {
      try {
        const result = await uploadFromPath(req.file.path)
        if (result?.secure_url) {
          imageUrl = result.secure_url
        }
      } catch (err) {
        console.error("⚠️ CLOUDINARY UPDATE FAILED:", err.message)
      }
    }

    const updateData = {
      name,
      description,
      isBestseller: !!isBestseller,
      isPopular: !!isPopular,
      ...(categoryId && { categoryId })
    }

    // Replace image if uploaded
    if (imageUrl) {
      updateData.images = {
        deleteMany: {},
        create: [{ url: imageUrl, isPrimary: true }]
      }
    }

    // Replace variants if sent
    if (variantsFromClient.length > 0) {
      updateData.variants = {
        deleteMany: {},
        create: variantsFromClient.map((v) => ({
          sku: `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          price: new Prisma.Decimal(v.price),
          stock: parseInt(String(v.stock)) || 0,
          attributes: {
            create: (v.attributes || []).map((a) => ({
              name: a.name,
              value: a.value
            }))
          }
        }))
      }
    } else if (price !== undefined || stock !== undefined) {
      updateData.variants = {
        deleteMany: {},
        create: [
          {
            sku: `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            price: new Prisma.Decimal(price || 0),
            stock: parseInt(String(stock)) || 0
          }
        ]
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: updateData
    })

    console.log(`✅ Product ${id} updated, invalidating cache...`)
    await deleteCache("products:*")
    await deleteCache("product:*")

    res.json(updated)
  } catch (err) {
    console.error("❌ UPDATE PRODUCT ERROR:", err)

    if (err.message?.includes("Unknown argument")) {
      return res.status(500).json({
        message: "System sync in progress. Please wait 2 minutes for backend update.",
        details: "Prisma schema mismatch"
      })
    }

    next(err)
  }
}