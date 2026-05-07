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
    orderBy: { createdAt: 'desc' },
    take: 200
  })
}

const getPayments = async () => {
  return await prisma.donation.findMany({
    orderBy: { createdAt: 'desc' }
  })
}

import { 
  sendShippedEmail, 
  sendDeliveredEmail, 
  sendReadyForPickupEmail 
} from "../../services/email.service.js"

const updateOrderStatus = async (orderId, status, trackingNo) => {
  const updated = await prisma.order.update({
    where: { id: orderId },
    data: {
      status,
      ...(trackingNo && { trackingNo })
    },
    include: {
      items: {
        include: { variant: { include: { product: true } } }
      },
      user: true
    }
  })

  await logOrderEvent(orderId, status, `Order status updated to ${status}`)

  // Dispatch Email Logic
  const email = updated.user?.email || updated.guestEmail
  if (email) {
    try {
      if (status === "shipped" && updated.deliveryMethod !== "pickup") {
        await sendShippedEmail(email, updated)
      } else if (status === "delivered") {
        await sendDeliveredEmail(email, updated)
      } else if (status === "shipped" && updated.deliveryMethod === "pickup") {
        // Shipped for pickup means ready for pickup
        await sendReadyForPickupEmail(email, updated)
      }
    } catch (err) {
      console.error(`Failed to send status update email to ${email}:`, err)
    }
  }

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

const getQuestions = async () => {
  return prisma.productQuestion.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      product: { select: { name: true, slug: true } },
      user: { select: { name: true, email: true } }
    }
  })
}

/* =======================================
   CART RECOVERY (Abandoned Carts)
======================================= */

const getAbandonedCarts = async () => {
  // Carts not updated in the last 2 hours
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)

  const carts = await prisma.cart.findMany({
    where: {
      updatedAt: { lte: twoHoursAgo },
      items: { some: {} },
      OR: [
        { email: { not: null } },
        { user: { email: { not: null } } }
      ]
    },
    include: {
      user: true,
      items: {
        include: { variant: { include: { product: true } } }
      },
      cartRecoveries: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  })

  // Filter out those who received a recovery email in the last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  return carts.filter(c => {
    const lastRecovery = c.cartRecoveries[0]
    return !lastRecovery || new Date(lastRecovery.createdAt) < sevenDaysAgo
  }).map(c => {
    // Format response
    const email = c.user?.email || c.email
    const name = c.user?.name || "Guest"
    const totalValue = c.items.reduce((sum, item) => sum + (Number(item.variant.price) * item.quantity), 0)
    return {
      id: c.id,
      email,
      name,
      updatedAt: c.updatedAt,
      totalValue,
      itemsCount: c.items.length,
      items: c.items.map(i => ({ name: i.variant.product.name, quantity: i.quantity }))
    }
  })
}

import { v4 as uuidv4 } from "uuid"
import { sendAbandonedCartEmail, sendReviewRequestEmail } from "../../services/email.service.js"

const sendRecoveryEmails = async (cartIds) => {
  if (!cartIds || !cartIds.length) return { count: 0 }

  const carts = await prisma.cart.findMany({
    where: { id: { in: cartIds } },
    include: { user: true }
  })

  let count = 0
  for (const cart of carts) {
    const email = cart.user?.email || cart.email
    if (!email) continue

    // Create a recovery token
    const token = uuidv4()
    await prisma.cartRecovery.create({
      data: {
        cartId: cart.id,
        token,
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days
      }
    })

    // In a real app, send an email here
    try {
      const recoveryUrl = `${process.env.CLIENT_URL || 'https://dseoriginals.com'}/recover?token=${token}`
      await sendAbandonedCartEmail(email, cart, recoveryUrl)
    } catch (err) {
      console.error(`Failed to send abandoned cart email to ${email}:`, err)
    }
    
    count++
  }

  return { count }
}

/* =======================================
   AUTOMATED REVIEW REQUESTS
======================================= */

const getReviewRequests = async () => {
  // Orders delivered more than 5 days ago
  const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)

  // Find orders that are delivered and haven't had a REVIEW_REQUEST_SENT event
  const orders = await prisma.order.findMany({
    where: {
      status: "delivered",
      updatedAt: { lte: fiveDaysAgo },
      events: {
        none: { type: "REVIEW_REQUEST_SENT" }
      }
    },
    include: {
      user: true,
      items: {
        include: { variant: { include: { product: true } } }
      }
    }
  })

  const eligibleRequests = []

  for (const order of orders) {
    if (!order.userId && !order.guestEmail) continue
    
    // For each item, check if the user has a review for this product
    const unreviewedItems = []
    for (const item of order.items) {
      const productId = item.variant.product.id
      let hasReview = false
      if (order.userId) {
        const review = await prisma.review.findFirst({
          where: { userId: order.userId, productId }
        })
        if (review) hasReview = true
      }
      
      if (!hasReview && !unreviewedItems.find(i => i.productId === productId)) {
        unreviewedItems.push({
          productId,
          productName: item.variant.product.name
        })
      }
    }

    if (unreviewedItems.length > 0) {
      eligibleRequests.push({
        orderId: order.id,
        email: order.user?.email || order.guestEmail,
        name: order.user?.name || order.guestName || "Customer",
        deliveredAt: order.updatedAt,
        unreviewedItems
      })
    }
  }

  return eligibleRequests
}

const sendReviewRequests = async (orderIds) => {
  if (!orderIds || !orderIds.length) return { count: 0 }

  const orders = await prisma.order.findMany({
    where: { id: { in: orderIds } }
  })

  let count = 0
  for (const order of orders) {
    // Record the event so we don't send again
    await prisma.orderEvent.create({
      data: {
        orderId: order.id,
        type: "REVIEW_REQUEST_SENT",
        message: "Automated review request email dispatched."
      }
    })

    // In a real app, integrate email service here.
    const email = order.user?.email || order.guestEmail
    if (email) {
      try {
        // We need to re-evaluate the unreviewed items here since they aren't passed from the frontend
        const unreviewedItems = []
        // We will just fetch items for the order
        const items = await prisma.orderItem.findMany({
          where: { orderId: order.id },
          include: { variant: { include: { product: true } } }
        })
        for (const item of items) {
          unreviewedItems.push({
            productId: item.variant.product.id,
            productName: item.variant.product.name
          })
        }
        await sendReviewRequestEmail(email, order, unreviewedItems)
      } catch (err) {
        console.error(`Failed to send review request email to ${email}:`, err)
      }
    }
    
    count++
  }

  return { count }
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
      include: {
        variants: {
          take: 1,
          select: { price: true }
        }
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
      subtitle: `₱${Number(p.variants?.[0]?.price || 0).toLocaleString()}`,
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

const getNotifications = async () => {
  return await prisma.notification.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
}

const markNotificationRead = async (id) => {
  return await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  })
}

const markAllNotificationsRead = async () => {
  return await prisma.notification.updateMany({
    where: { isRead: false },
    data: { isRead: true },
  })
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
  getQuestions,
  getAbandonedCarts,
  sendRecoveryEmails,
  getReviewRequests,
  sendReviewRequests,
  updateOrderStatus,
  getProducts,
  getUsers,
  updateUserRole,
  getStories,
  getReviews,
  deleteReview,
  deleteOrder,
  globalSearch,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getActivityLogs
}
