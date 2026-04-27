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
    const trending = await prisma.product.findMany({
      where: { status: "active" },
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        images: {
          where: { isPrimary: true },
          take: 1
        }
      }
    })

    const response = trending.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      image: p.images?.[0]?.url || null,
      sales: 0 // Placeholder as we switched to simple fetch
    }))

    await setCache(cacheKey, response, 300)
    res.json(response)

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

    const results = await prisma.product.findMany({
      where: {
        status: "active",
        id: { not: id }
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

    const response = results.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      image: p.images?.[0]?.url || null,
      frequency: 0
    }))

    await setCache(cacheKey, response, 300)
    res.json(response)

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
  const MAX_RETRIES = 2;
  let retryCount = 0;

  const execute = async () => {
    try {
      const userId = req.user?.id
      if (!userId) {
        return getTrendingProducts(req, res, next)
      }

      const cacheKey = `user:recommendations:${userId}`
      const cached = await getCache(cacheKey)
      if (cached) return res.json(cached)

      // Ensure connection
      await prisma.$connect().catch(() => {});

      // 1. Find user's favorite categories
      const recentOrders = await prisma.order.findMany({
        where: { userId },
        take: 10,
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    select: { categoryId: true }
                  }
                }
              }
            }
          }
        }
      })

      const categoriesMap = {}
      recentOrders.forEach(order => {
        order.items.forEach(item => {
          const catId = item.variant?.product?.categoryId
          if (catId) {
            categoriesMap[catId] = (categoriesMap[catId] || 0) + 1
          }
        })
      })

      const categoryIds = Object.keys(categoriesMap)
        .sort((a, b) => categoriesMap[b] - categoriesMap[a])
        .slice(0, 3)

      // 2. Fetch products
      const recommendations = await prisma.product.findMany({
        where: {
          categoryId: { in: categoryIds.length > 0 ? categoryIds : undefined },
          status: "active",
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

      if (recommendations.length < 4) {
        return getTrendingProducts(req, res, next)
      }

      await setCache(cacheKey, recommendations, 600)
      res.json(recommendations)

    } catch (err) {
      if (err.message.includes("Connection is closed") && retryCount < MAX_RETRIES) {
        retryCount++;
        console.warn(`🔄 Retrying recommendations (attempt ${retryCount})...`);
        return execute();
      }
      next(err)
    }
  };

  return execute();
}