import prisma from "../config/prisma.js"

export const createNotification = async (type, message, metadata = {}) => {
  try {
    return await prisma.notification.create({
      data: {
        type,
        message,
        metadata
      }
    })
  } catch (err) {
    console.error("Failed to create notification:", err)
  }
}

export const getNotifications = async (limit = 50) => {
  return prisma.notification.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit
  })
}

export const getUnreadCount = async () => {
  return prisma.notification.count({
    where: { isRead: false }
  })
}

export const markAsRead = async (id) => {
  return prisma.notification.update({
    where: { id },
    data: { isRead: true }
  })
}

export const markAllAsRead = async () => {
  return prisma.notification.updateMany({
    where: { isRead: false },
    data: { isRead: true }
  })
}

export default {
  createNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
}
