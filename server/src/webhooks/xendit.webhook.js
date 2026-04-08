import prisma from "../config/prisma.js"
import logger from "../config/logger.js"
import { createOrderEvent } from "../services/orderEvent.service.js"
import {
  confirmReservation,
  releaseReservation
} from "../modules/inventory/inventoryService.js"
import { sendOrderPaidEmail } from "../services/email.service.js"

export const handleXenditWebhook = async (req, res) => {
  try {

    // ✅ FIX Buffer parsing from express.raw()
    const eventBody = req.body?.toString?.("utf8") || "{}"
    const event = JSON.parse(eventBody)

    const callbackToken = req.headers["x-callback-token"]

    // ✅ SECURITY
    if (callbackToken !== process.env.XENDIT_CALLBACK_TOKEN) {
      return res.status(403).json({ message: "Invalid token" })
    }

    const orderId = event.external_id
    const status = event.status

    if (!orderId) {
      return res.status(400).json({ message: "Missing order ID" })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    /* =========================
       PAID
    ========================= */

    if (status === "PAID") {

      // ✅ IDEMPOTENCY FIX
      if (order.status === "paid") {
        return res.json({ success: true })
      }

      await prisma.$transaction(async (tx) => {

        await tx.order.update({
          where: { id: orderId },
          data: { status: "paid" }
        })

        await confirmReservation(orderId)

        await createOrderEvent(orderId, "paid", "Payment confirmed")

      })

      logger.info("Order PAID", { orderId })

      // ✅ EMAIL (outside transaction)
      try {
        const user = order.userId
          ? await prisma.user.findUnique({ where: { id: order.userId } })
          : null

        await sendOrderPaidEmail(
          user?.email || order.guestEmail,
          order
        )
      } catch (err) {
        logger.error("Email failed", { error: err.message })
      }
    }

    /* =========================
       EXPIRED
    ========================= */

    if (status === "EXPIRED") {

      // ✅ IDEMPOTENCY FIX
      if (order.status === "cancelled") {
        return res.json({ success: true })
      }

      await prisma.$transaction(async (tx) => {

        await tx.order.update({
          where: { id: orderId },
          data: { status: "cancelled" }
        })

        await releaseReservation(orderId)

        await createOrderEvent(orderId, "cancelled", "Payment expired")

      })

      logger.info("Order EXPIRED", { orderId })
    }

    return res.json({ success: true })

  } catch (err) {

    logger.error("Webhook error", { error: err.message })

    return res.status(500).json({ message: "Webhook failed" })
  }
}