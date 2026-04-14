import prisma from "../config/prisma.js"
import logger from "../config/logger.js"

/**
 * 🛡 OrderEventService
 * Centralized service to log every single status change, payment attempt, 
 * and fulfillment action for an order. Ensures a full audit trail.
 */

export const logOrderEvent = async (orderId, type, message = "") => {
  try {
    const event = await prisma.orderEvent.create({
      data: {
        orderId,
        type,
        message,
        createdAt: new Date()
      }
    })

    logger.debug(`Order Event Created: [${orderId}] ${type} - ${message}`)
    return event
  } catch (err) {
    logger.error("Failed to log order event", { orderId, type, error: err })
    // We don't throw here to avoid failing the main process if logging fails
  }
}

export default { logOrderEvent }