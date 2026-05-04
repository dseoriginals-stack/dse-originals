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
          orderBy: { isPrimary: "desc" },
          take: 1
        },
        variants: {
          include: {
            attributes: true
          }
        }
      }
    })

    const response = related.map(p => ({
      ...p,
      image: p.images?.[0]?.url || null,
      price: Number(p.variants?.[0]?.price || 0),
      stock: p.variants?.reduce((acc, v) => acc + (v.stock || 0), 0) || 0,
      variantId: p.variants?.[0]?.id || ""
    }))

    await setCache(cacheKey, response, 300)
    res.json(response)

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
          orderBy: { isPrimary: "desc" },
          take: 1
        },
        variants: {
          include: {
            attributes: true
          }
        }
      }
    })

    const response = trending.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      image: p.images?.[0]?.url || null,
      price: Number(p.variants?.[0]?.price || 0),
      stock: p.variants?.reduce((acc, v) => acc + (v.stock || 0), 0) || 0,
      variantId: p.variants?.[0]?.id || "",
      variants: p.variants,
      sales: 0 
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
          orderBy: { isPrimary: "desc" },
          take: 1
        },
        variants: {
          include: {
            attributes: true
          }
        }
      }
    })

    const response = results.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      image: p.images?.[0]?.url || null,
      price: Number(p.variants?.[0]?.price || 0),
      stock: p.variants?.reduce((acc, v) => acc + (v.stock || 0), 0) || 0,
      variantId: p.variants?.[0]?.id || "",
      variants: p.variants,
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
  try {
    const userId = req.user?.id
    if (!userId) {
      // Fallback to trending for guests
      return getTrendingProducts(req, res, next)
    }

    const cacheKey = `user:recommendations:${userId}`
    const cached = await getCache(cacheKey)
    if (cached) return res.json(cached)

    // 1. Find user's favorite categories from last orders using standard Prisma
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
          orderBy: { isPrimary: "desc" },
          take: 1
        },
        variants: {
          include: {
            attributes: true
          }
        }
      }
    })

    // If no specific recommendations, fallback to trending
    if (recommendations.length < 4) {
      return getTrendingProducts(req, res, next)
    }

    const response = recommendations.map(p => ({
      ...p,
      image: p.images?.[0]?.url || null,
      price: Number(p.variants?.[0]?.price || 0),
      stock: p.variants?.reduce((acc, v) => acc + (v.stock || 0), 0) || 0,
      variantId: p.variants?.[0]?.id || ""
    }))

    await setCache(cacheKey, response, 600)
    res.json(response)

  } catch (err) {
    next(err)
  }
}