import prisma from "../config/prisma.js"
import logger from "../config/logger.js"
import { getTrackingInfo } from "../services/tracking.service.js"
import { sendDeliveredEmail } from "../services/email.service.js"
import { createOrderEvent } from "../services/orderEvent.service.js"

/**
 * Automatically polls the tracking service for all 'shipped' orders
 * and updates them to 'delivered' if the carrier confirms arrival.
 */
export async function autoTrackOrders() {
  
  try {
    
    // 1. Get all orders currently in 'shipped' state
    const shippedOrders = await prisma.order.findMany({
      where: {
        status: "shipped",
        trackingNo: { not: null }
      },
      include: {
        user: true,
        items: true
      }
    })

    if (shippedOrders.length === 0) {
      return
    }

    logger.info(`Auto-Tracker: Polling status for ${shippedOrders.length} shipped orders...`)

    for (const order of shippedOrders) {
      
      const trackingData = await getTrackingInfo(order.trackingNo)
      
      if (!trackingData || trackingData.length === 0) continue

      // Look for any event that contains "Delivered" or "Received"
      const isDelivered = trackingData.some(event => {
        const desc = (event.description || event.status || "").toLowerCase()
        return desc.includes("delivered") || desc.includes("received") || desc.includes("successfully signed")
      })

      if (isDelivered) {
        
        logger.info(`Auto-Tracker: Order #${order.id} detected as DELIVERED by carrier. Updating...`)

        await prisma.$transaction(async (tx) => {
          
          await tx.order.update({
            where: { id: order.id },
            data: {
              status: "delivered",
              deliveredAt: new Date()
            }
          })

          await createOrderEvent(order.id, "delivered", "Auto-detected delivery via tracking service polling.")

        })

        // Send Email Notification
        const toEmail = order.user?.email || order.guestEmail
        if (toEmail) {
          try {
            await sendDeliveredEmail(toEmail, order)
          } catch (err) {
            logger.error(`Auto-Tracker: Failed to send delivery email for #${order.id}`, { error: err.message })
          }
        }

      }

    }

  } catch (err) {
    logger.error("Auto-Tracker Job failed", { error: err.message })
  }

}
