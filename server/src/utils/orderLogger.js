import prisma from "../config/prisma.js"

/**
 * Standardized utility to log order lifecycle events.
 * Provides a full audit trail for customer support and admin monitoring.
 */
export async function logOrderEvent(orderId, type, message = null) {
  try {
    const event = await prisma.orderEvent.create({
      data: {
        orderId,
        type,
        message,
      },
    })
    return event
  } catch (err) {
    console.error(`Failed to log order event [${type}] for order ${orderId}:`, err)
    // We don't throw here to avoid blocking the main transaction
  }
}
