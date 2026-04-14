import prisma from "../../config/prisma.js"

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
            include: { images: { take: 1 } }
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

  // 5. CATEGORY BREAKDOWN
  const categories = await prisma.category.findMany({
    include: {
      products: {
        include: {
          variants: {
            include: {
              orderItems: {
                where: { order: { status: "paid" } }
              }
            }
          }
        }
      }
    }
  })

  const categoryBreakdown = categories.map(cat => {
    let sales = 0
    cat.products.forEach(prod => {
      prod.variants.forEach(variant => {
        variant.orderItems.forEach(item => {
          sales += item.quantity
        })
      })
    })
    return { name: cat.name, sales }
  }).sort((a, b) => b.sales - a.sales)

  return {
    totalCustomers: users,
    totalOrders: ordersCount,
    totalProducts: productsCount,
    revenue: revenue._sum.totalAmount || 0,
    donationRevenue: donations._sum.amount || 0,
    revenueChart,
    topProducts,
    recentOrders,
    categoryBreakdown
  }
}

const getOrders = async () => {
  return prisma.order.findMany({
    include: {
      items: true,
      user: true
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
  return prisma.order.update({
    where: { id },
    data: {
      status,
      trackingNo
    }
  })
}

const getProducts = async () => {
  return prisma.product.findMany({
    where: {
      status: { not: "archived" }
    },
    include: {
      variants: true,
      images: { take: 1 }
    },
    orderBy: {
      createdAt: "desc"
    }
  })
}

const getUsers = async () => {
  return prisma.user.findMany({
    orderBy: {
      createdAt: "desc"
    }
  })
}

const updateUserRole = async (id, role) => {
  return prisma.user.update({
    where: { id },
    data: { role }
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
  deleteReview
}