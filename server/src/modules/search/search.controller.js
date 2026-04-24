import prisma from "../../config/prisma.js"

export const globalSearch = async (req, res, next) => {
  try {
    const { q } = req.query
    if (!q || q.length < 2) {
      return res.json({ products: [], stories: [] })
    }

    const query = q.trim()

    // 1. Search Products
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { category: { contains: query, mode: "insensitive" } }
        ],
        isArchived: false
      },
      take: 5,
      include: {
        variants: {
          take: 1
        }
      }
    })

    // 2. Search Stories
    const stories = await prisma.story.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { content: { contains: query, mode: "insensitive" } },
          { category: { contains: query, mode: "insensitive" } }
        ],
        status: "approved"
      },
      take: 5
    })

    res.json({
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        image: p.image,
        price: p.variants[0]?.price || 0,
        type: "product"
      })),
      stories: stories.map(s => ({
        id: s.id,
        title: s.title,
        image: s.image,
        type: "story"
      }))
    })
  } catch (err) {
    next(err)
  }
}
