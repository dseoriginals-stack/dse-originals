import prisma from "../config/prisma.js"

export const createNotification = async (type, message, metadata = {}) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        type,
        message,
        metadata
      }
    })

    // Broadcast real-time update
    try {
      const { notifyAdmins } = await import("../config/socket.js")
      notifyAdmins("notification:new", notification)
    } catch (sErr) {
      console.warn("Socket notification failed:", sErr.message)
    }

    return notification
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
