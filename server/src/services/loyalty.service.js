import prisma from "../config/prisma.js"
import logger from "../config/logger.js"

/**
 * Awards loyalty points to a user based on their order amount.
 * Rule: 1 point for every 100 pesos spent.
 */
export const awardOrderPoints = async (tx, orderId) => {
  try {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { user: true }
    })

    if (!order || !order.userId) return

    // Points earned: 1 point per ₱100
    const pointsEarned = Math.floor(Number(order.totalAmount) / 100)

    if (pointsEarned <= 0) return

    const user = order.user
    const newLifetimePoints = (user.lifetimePoints || 0) + pointsEarned

    // Determine Tier based on Lifetime Points
    let tier = "Faith"
    if (newLifetimePoints >= 1000) tier = "Love"
    else if (newLifetimePoints >= 500) tier = "Hope"

    await tx.user.update({
      where: { id: order.userId },
      data: {
        luckyPoints: { increment: pointsEarned },
        lifetimePoints: { increment: pointsEarned },
        tier: tier
      }
    })

    logger.info(`Awarded ${pointsEarned} points to user ${order.userId} for order ${orderId}`)
  } catch (err) {
    logger.error("Failed to award loyalty points", { error: err.message, orderId })
  }
}
