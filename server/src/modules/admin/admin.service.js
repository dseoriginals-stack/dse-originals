import prisma from "../../config/prisma.js"
import { logOrderEvent } from "../../services/orderEvent.service.js"

const getAdminStats = async () => {
  const users = await prisma.user.count()
  const ordersCount = await prisma.order.count()
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

  // Hydrate top product details
  const topProducts = await Promise.all(
    topProductItems.map(async (item) => {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
        include: { 
          product: {
            select: {
              id: true,
              name: true,
              images: { take: 1, select: { url: true } }
            }
          } 
        }
      })
      return {
        id: variant?.productId,
        name: variant?.product?.name,
        sold: item._sum.quantity,
        image: variant?.product?.images?.[0]?.url
      }
    })
  )

  // 4. DONATION ANALYTICS
  const donations = await prisma.donation.aggregate({
    _sum: { amount: true },
    where: { status: "paid" }
  })
 
  // 5. REVENUE BY CATEGORY
  const categories = await prisma.category.findMany({
    include: {
      products: {
        select: {
          id: true,
          variants: {
            include: {
              orderItems: {
                where: { order: { status: "paid" } },
                select: { quantity: true, price: true }
              }
            }
          }
        }
      }
    }
  })
 
  const categoryBreakdown = categories.map(cat => {
    let revenue = 0
    cat.products.forEach(prod => {
      prod.variants.forEach(variant => {
        variant.orderItems.forEach(item => {
          revenue += Number(item.price) * item.quantity
        })
      })
    })
    return { name: cat.name, value: revenue }
  }).filter(c => c.value > 0).sort((a, b) => b.value - a.value)
 
  // 6. INVENTORY ALERTS (Low Stock < 5)
  const lowStockProducts = await prisma.productVariant.findMany({
    where: { stock: { lt: 5 } },
    include: {
      product: {
        select: { name: true }
      }
    },
    take: 10,
    orderBy: { stock: 'asc' }
  })
 
  const inventoryAlerts = lowStockProducts.map(v => ({
    id: v.id,
    sku: v.sku,
    name: v.name ? `${v.product.name} (${v.name})` : v.product.name,
    stock: v.stock
  }))
 
  // 7. CUSTOMER TIERS
  const tierCounts = await prisma.user.groupBy({
    by: ['tier'],
    _count: { id: true },
    where: { role: 'customer' }
  })
 
  const customerTiers = tierCounts.map(t => ({
    name: t.tier,
    count: t._count.id
  }))
 
  // 8. RECENT ORDERS
  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true } } }
  })
 
  return {
    totalCustomers: users,
    totalOrders: ordersCount,
    totalProducts: productsCount,
    revenue: revenue._sum.totalAmount || 0,
    donationRevenue: donations._sum.amount || 0,
    revenueChart,
    topProducts,
    recentOrders,
    categoryBreakdown,
    inventoryAlerts,
    customerTiers
  }
}

const getOrders = async () => {
  return prisma.order.findMany({
    include: {
      items: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          address: true,
          phone: true,
          luckyPoints: true,
          tier: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  })
}

const getPayments = async () => {
  const [orders, donations] = await Promise.all([
    prisma.order.findMany({
      where: { status: "paid" },
      include: {
        user: { select: { name: true, email: true } }
      }
    }),
    prisma.donation.findMany({
      where: { status: "paid" },
      include: {
        user: { select: { name: true, email: true } }
      }
    })
  ])

  const orderPayments = orders.map(o => ({
    id: o.id,
    type: "Order",
    customer: o.user?.name || o.guestName || "Guest",
    email: o.user?.email || o.guestEmail,
    amount: o.totalAmount,
    method: "Xendit (Store)",
    reference: o.paymentId,
    createdAt: o.createdAt
  }))

  const donationPayments = donations.map(d => ({
    id: d.id,
    type: "Donation",
    customer: d.name || d.user?.name || "Anonymous",
    email: d.email || d.user?.email,
    amount: d.amount,
    method: "Xendit (Cause)",
    reference: d.paymentId,
    createdAt: d.createdAt
  }))

  return [...orderPayments, ...donationPayments].sort((a, b) => b.createdAt - a.createdAt)
}

const updateOrderStatus = async (id, status, trackingNo) => {
  const updated = await prisma.order.update({
    where: { id },
    data: {
      status,
      trackingNo
    }
  })

  // ✅ Log the manual status change for the audit trail
  await logOrderEvent(
    id, 
    "STATUS_UPDATE", 
    `Manual update to [${status}]${trackingNo ? ' with tracking: ' + trackingNo : ''}`
  )

  return updated
}

const getProducts = async () => {
  return prisma.product.findMany({
    where: {
      status: { not: "archived" }
    },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      categoryId: true,
      createdAt: true,
      updatedAt: true,
      images: { take: 1, select: { url: true } },
      variants: {
        select: {
          id: true,
          sku: true,
          name: true,
          price: true,
          stock: true,
          image: true,
          attributes: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  })
}

const getUsers = async () => {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      address: true,
      phone: true,
      luckyPoints: true,
      tier: true,
      createdAt: true
    },
    orderBy: {
      createdAt: "desc"
    }
  })
}

const updateUserRole = async (id, role) => {
  return prisma.user.update({
    where: { id },
    data: { role },
    select: {
      id: true,
      name: true,
      role: true
    }
  })
}

const getStories = async () => {
  return prisma.story.findMany({
    orderBy: {
      createdAt: "desc"
    }
  })
}

const getReviews = async () => {
  return prisma.review.findMany({
    include: {
      user: { select: { name: true, email: true } },
      product: { select: { name: true } }
    },
    orderBy: {
      createdAt: "desc"
    }
  })
}

const deleteReview = async (id) => {
  return prisma.review.delete({
    where: { id }
  })
}

const deleteOrder = async (id) => {
  return prisma.$transaction(async (tx) => {
    // 1. Delete associated inventory reservations (they don't cascade)
    await tx.inventoryReservation.deleteMany({
      where: { orderId: id }
    })

    // 2. Delete associated inventory movements (they don't cascade)
    await tx.inventoryMovement.deleteMany({
      where: { orderId: id }
    })

    // 3. Delete the order (items, events, and address will cascade)
    await tx.order.delete({
      where: { id }
    })
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
  deleteOrder
}