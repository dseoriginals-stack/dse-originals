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

    const orderId = event.external_id || event.externalId
    const status = event.status

    if (!orderId) {
      return res.status(400).json({ message: "Missing order ID" })
    }

    /* =========================
       PAID
    ========================= */

    if (status === "PAID") {
      if (orderId.startsWith("don_")) {
        const donationId = orderId.replace("don_", "")
        await prisma.donation.update({
          where: { id: donationId },
          data: { status: "paid" }
        })
        logger.info("Donation PAID", { donationId })
        return res.json({ success: true })
      }

      // Existing order logic
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true, address: true, user: true }
      })

      if (!order) return res.status(404).json({ message: "Order not found" })
      if (order.status === "paid") return res.json({ success: true })

      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: orderId },
          data: { status: "paid" }
        })
        await confirmReservation(orderId)
        await createOrderEvent(orderId, "paid", "Payment confirmed")
      })

      // Handle referral rewards
      try {
        const { rewardReferral } = await import("../modules/referral/referral.service.js")
        await rewardReferral(orderId)
      } catch (refErr) {
        logger.error("Referral Reward Error:", refErr)
      }

      logger.info("Order PAID", { orderId })
      try {
        await sendOrderPaidEmail(order.user?.email || order.guestEmail, order)
      } catch (err) {
        logger.error("Email failed", { error: err.message })
      }
    }

    /* =========================
       EXPIRED
    ========================= */

    if (status === "EXPIRED") {
      if (orderId.startsWith("don_")) {
        const donationId = orderId.replace("don_", "")
        await prisma.donation.update({
          where: { id: donationId },
          data: { status: "cancelled" }
        })
        logger.info("Donation EXPIRED", { donationId })
        return res.json({ success: true })
      }

      const order = await prisma.order.findUnique({ where: { id: orderId } })
      if (!order || order.status === "cancelled") return res.json({ success: true })

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