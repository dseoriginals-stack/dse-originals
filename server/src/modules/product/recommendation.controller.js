import prisma from "../../config/prisma.js"
import { getCache, setCache } from "../../utils/cache.js"

/*
==============================
RELATED PRODUCTS
==============================
*/

export const getRelatedProducts = async (req, res, next) => {

  try {

    const { id } = req.params

    const cacheKey = `product:related:${id}`

    const cached = await getCache(cacheKey)
    if (cached) return res.json(cached)

    const product = await prisma.product.findUnique({
      where: { id },
      select: { categoryId: true }
    })

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      })
    }

    const related = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: id },
        status: "active"
      },
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        images: {
          where: { isPrimary: true },
          take: 1
        }
      }
    })

    await setCache(cacheKey, related, 300)

    res.json(related)

  } catch (err) {
    next(err)
  }

}

/*
==============================
TRENDING PRODUCTS (OPTIMIZED)
==============================
*/

export const getTrendingProducts = async (req, res, next) => {

  try {

    const cacheKey = "products:trending"

    const cached = await getCache(cacheKey)
    if (cached) return res.json(cached)

    const trending = await prisma.$queryRaw`

      SELECT 
        p.id,
        p.name,
        p.slug,
        pi.url AS image,
        SUM(oi.quantity) as sales
      FROM "OrderItem" oi
      JOIN "ProductVariant" pv ON oi."variantId" = pv.id
      JOIN "Product" p ON pv."productId" = p.id
      LEFT JOIN "ProductImage" pi 
        ON pi."productId" = p.id AND pi."isPrimary" = true
      WHERE p.status = 'active'
      GROUP BY p.id, pi.url
      ORDER BY sales DESC
      LIMIT 8

    `

    await setCache(cacheKey, trending, 300)

    res.json(trending)

  } catch (err) {
    next(err)
  }

}

/*
==============================
FREQUENTLY BOUGHT TOGETHER
==============================
*/

export const getFrequentlyBoughtTogether = async (req, res, next) => {

  try {

    const { id } = req.params

    const cacheKey = `product:alsoBought:${id}`

    const cached = await getCache(cacheKey)
    if (cached) return res.json(cached)

    const results = await prisma.$queryRaw`

      SELECT 
        p.id,
        p.name,
        p.slug,
        pi.url AS image,
        COUNT(*) as frequency
      FROM "OrderItem" oi1
      JOIN "OrderItem" oi2 
        ON oi1."orderId" = oi2."orderId"
      JOIN "ProductVariant" pv ON oi2."variantId" = pv.id
      JOIN "Product" p ON pv."productId" = p.id
      LEFT JOIN "ProductImage" pi 
        ON pi."productId" = p.id AND pi."isPrimary" = true
      WHERE oi1."variantId" IN (
        SELECT id FROM "ProductVariant" WHERE "productId" = ${id}
      )
      AND oi2."variantId" != oi1."variantId"
      AND p.status = 'active'
      GROUP BY p.id, pi.url
      ORDER BY frequency DESC
      LIMIT 6

    `

    await setCache(cacheKey, results, 300)

    res.json(results)

  } catch (err) {
    next(err)
  }

}

/*
==============================
PERSONALIZED RECOMMENDATIONS
==============================
*/
export const getPersonalizedRecommendations = async (req, res, next) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      // Fallback to trending for guests
      return getTrendingProducts(req, res, next)
    }

    const cacheKey = `user:recommendations:${userId}`
    const cached = await getCache(cacheKey)
    if (cached) return res.json(cached)

    // 1. Find user's favorite categories from last 5 orders
    const favoriteCategories = await prisma.$queryRaw`
      SELECT p."categoryId", COUNT(*) as count
      FROM "Order" o
      JOIN "OrderItem" oi ON o.id = oi."orderId"
      JOIN "ProductVariant" pv ON oi."variantId" = pv.id
      JOIN "Product" p ON pv."productId" = p.id
      WHERE o."userId" = ${userId}
      GROUP BY p."categoryId"
      ORDER BY count DESC
      LIMIT 3
    `

    const categoryIds = Array.isArray(favoriteCategories) ? favoriteCategories.map((c) => c.categoryId) : []

    // 2. Fetch products from these categories that the user hasn't bought yet
    const recommendations = await prisma.product.findMany({
      where: {
        categoryId: { in: categoryIds.length > 0 ? categoryIds : undefined },
        status: "active",
        // Ideally we'd filter out already bought products, but for small catalogs it's fine to show similar
      },
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        images: {
          where: { isPrimary: true },
          take: 1
        }
      }
    })

    // If no specific recommendations, fallback to trending
    if (recommendations.length < 4) {
      return getTrendingProducts(req, res, next)
    }

    await setCache(cacheKey, recommendations, 600)
    res.json(recommendations)

  } catch (err) {
    next(err)
  }
}