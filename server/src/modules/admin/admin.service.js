import prisma from "../../config/prisma.js"
import { logOrderEvent } from "../../services/orderEvent.service.js"

const getAdminStats = async () => {
  const users = await prisma.user.count()
  const ordersCount = await prisma.order.count({
    where: {
      status: { notIn: ['cancelled'] }
    }
  })
  const productsCount = await prisma.product.count()

  const revenue = await prisma.order.aggregate({
    _sum: { totalAmount: true },
    where: { status: "paid" }
  })

  // 1. REVENUE CHART DATA (Last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const rawDailyRevenue = await prisma.order.groupBy({
    by: ['createdAt'],
    _sum: { totalAmount: true },
    where: {
      status: "paid",
      createdAt: { gte: thirtyDaysAgo }
    },
    orderBy: { createdAt: 'asc' }
  })

  // Format daily revenue for frontend (grouping by date string)
  const revenueMap = {}
  rawDailyRevenue.forEach(item => {
    const date = item.createdAt.toISOString().split('T')[0]
    revenueMap[date] = (revenueMap[date] || 0) + Number(item._sum.totalAmount || 0)
  })
  const revenueChart = Object.keys(revenueMap).map(date => ({
    date,
    amount: revenueMap[date]
  }))

  // 2. TOP PRODUCTS
  const topProductItems = await prisma.orderItem.groupBy({
    by: ['variantId'],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 5
  })

  const topProducts = await Promise.all(
    topProductItems.map(async (item) => {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
        include: { product: true }
      })
      return {
        name: variant?.product?.name || "Unknown",
        quantity: item._sum.quantity,
        revenue: Number(variant?.price || 0) * item._sum.quantity
      }
    })
  )

  return {
    summary: {
      users,
      orders: ordersCount,
      products: productsCount,
      revenue: Number(revenue._sum.totalAmount || 0)
    },
    revenueChart,
    topProducts
  }
}

const getOrders = async () => {
  return await prisma.order.findMany({
    include: {
      items: true,
      user: true,
      address: true
    },
    orderBy: { createdAt: 'desc' }
  })
}

const getPayments = async () => {
  return await prisma.donation.findMany({
    orderBy: { createdAt: 'desc' }
  })
}

const updateOrderStatus = async (orderId, status, trackingNo) => {
  const updated = await prisma.order.update({
    where: { id: orderId },
    data: {
      status,
      ...(trackingNo && { trackingNo })
    }
  })

  await logOrderEvent(orderId, status, `Order status updated to ${status}`)
  return updated
}

const getProducts = async () => {
  return await prisma.product.findMany({
    include: {
      variants: {
        include: {
          attributes: true
        }
      },
      category: true,
      images: true
    },
    orderBy: { createdAt: 'desc' }
  })
}

const getUsers = async () => {
  return await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  })
}

const updateUserRole = async (userId, role) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { role }
  })
}

const getStories = async () => {
  return await prisma.story.findMany({
    include: { user: true },
    orderBy: { createdAt: 'desc' }
  })
}

const getReviews = async () => {
  return await prisma.review.findMany({
    include: { user: true, product: true },
    orderBy: { createdAt: 'desc' }
  })
}

const deleteReview = async (id) => {
  return await prisma.review.delete({
    where: { id }
  })
}

const deleteOrder = async (id) => {
  return await prisma.order.delete({
    where: { id }
  })
}

const globalSearch = async (q) => {
  const [orders, products, users] = await Promise.all([
    prisma.order.findMany({
      where: {
        OR: [
          { id: { contains: q, mode: 'insensitive' } },
          { guestEmail: { contains: q, mode: 'insensitive' } },
          { guestName: { contains: q, mode: 'insensitive' } }
        ]
      },
      take: 5
    }),
    prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { slug: { contains: q, mode: 'insensitive' } }
        ]
      },
      take: 5
    }),
    prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } }
        ]
      },
      take: 5
    })
  ])

  return {
    orders: orders.map(o => ({
      id: o.id,
      title: o.guestName || o.userId || "Order",
      subtitle: o.id,
      type: 'order',
      link: `/admin/orders?id=${o.id}`
    })),
    products: products.map(p => ({
      id: p.id,
      title: p.name,
      subtitle: `₱${Number(p.price).toLocaleString()}`,
      type: 'product',
      link: `/admin/products?id=${p.id}`
    })),
    users: users.map(u => ({
      id: u.id,
      title: u.name,
      subtitle: u.email,
      type: 'user',
      link: `/admin/users?id=${u.id}`
    }))
  }
}

const getActivityLogs = async (limit = 100) => {
  return await prisma.activityLog.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

export default {
  getAdminStats,
  getOrders,
  getPayments,
  updateOrderStatus,
  getProducts,
  getUsers,
  updateUserRole,
  getStories,
  getReviews,
  deleteReview,
  deleteOrder,
  globalSearch,
  getActivityLogs
}
