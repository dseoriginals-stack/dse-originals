import prisma from "../../config/prisma.js"
import logger from "../../config/logger.js"
import { awardOrderPoints } from "../../services/loyalty.service.js"

export const handleXenditWebhook = async (req, res) => {
  try {

    /*
    ============================
    VERIFY SIGNATURE
    ============================
    */

    const callbackToken = req.headers["x-callback-token"]
    const secret = process.env.XENDIT_WEBHOOK_SECRET || process.env.XENDIT_CALLBACK_TOKEN

    if (!callbackToken || callbackToken !== secret) {
      return res.status(403).json({ message: "Invalid webhook signature" })
    }

    // Handle both JSON and express.raw() Buffer
    let event = req.body
    if (Buffer.isBuffer(req.body)) {
      try {
        event = JSON.parse(req.body.toString("utf8"))
      } catch (err) {
        logger.error("Failed to parse raw webhook body", { error: err.message })
        return res.status(400).json({ message: "Invalid JSON" })
      }
    }

    const orderId = event.external_id || event.externalId
    const eventId = event.id || `${orderId}-${event.status}`

    if (!orderId) return res.sendStatus(400)

    logger.info("Xendit webhook", {
      orderId,
      status: event.status
    })

    /*
    ============================
    IDEMPOTENCY
    ============================
    */

    const existing = await prisma.webhookEvent.findUnique({
      where: { id: eventId }
    })

    if (existing) return res.sendStatus(200)

    await prisma.webhookEvent.create({
      data: {
        id: eventId,
        source: "xendit"
      }
    })

    /*
    ============================
    FETCH ORDER
    ============================
    */

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, user: true }
    })

    if (!order) return res.sendStatus(404)

    /*
    ============================
    PAYMENT SUCCESS
    ============================
    */

    if (event.status === "PAID") {

      if (Number(event.amount) !== Number(order.totalAmount)) {
        logger.warn("Amount mismatch", {
          orderId,
          expected: order.totalAmount,
          received: event.amount
        })
        return res.status(400).json({ message: "Amount mismatch" })
      }

      if (order.status === "paid") {
        return res.sendStatus(200)
      }

      await prisma.$transaction(async (tx) => {

        /*
        LOCK ORDER (prevents race condition)
        */
        const lockedOrder = await tx.order.findUnique({
          where: { id: orderId },
          include: { items: true }
        })

        if (lockedOrder.status === "paid") return

        /*
        FINALIZE STOCK (reservation → deduction)
        */
        for (const item of lockedOrder.items) {
          // decrement from VARIANT stock, not product
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              stock: { decrement: item.quantity }
            }
          })
        }

        /*
        CONFIRM RESERVATION
        */
        await tx.inventoryReservation.updateMany({
          where: {
            orderId,
            status: "reserved"
          },
          data: {
            status: "confirmed"
          }
        })

        /*
        UPDATE ORDER
        */
        const updated = await tx.order.update({
          where: { id: orderId },
          data: { status: "paid" },
          include: { user: true }
        })

        /*
        LOYALTY POINTS
        */
        if (updated.userId) {
          await awardOrderPoints(tx, orderId)
        }

        /*
        NOTIFY ADMINS (Real-time Dashboard Update)
        */
        try {
          const { notifyAdmins } = await import("../../config/socket.js")
          notifyAdmins("order:status", { 
            orderId, 
            status: "paid",
            total: Number(updated.totalAmount)
          })
          notifyAdmins("stats:update", {}) // Trigger dashboard refresh
        } catch (socErr) {
          logger.error("Socket notification failed", { error: socErr.message })
        }

      })

      logger.info("Order PAID", { orderId })

      return res.sendStatus(200)
    }

    /*
    ============================
    PAYMENT FAILED / EXPIRED
    ============================
    */

    if (event.status === "EXPIRED" || event.status === "FAILED") {

      if (order.status !== "pending") {
        return res.sendStatus(200)
      }

      await prisma.$transaction(async (tx) => {

        await tx.order.update({
          where: { id: orderId },
          data: { status: "cancelled" }
        })

        // REFUND POINTS
        if (order.userId && order.pointsUsed > 0) {
          await tx.user.update({
            where: { id: order.userId },
            data: {
              luckyPoints: { increment: order.pointsUsed }
            }
          })
        }

        await tx.inventoryReservation.updateMany({
          where: {
            orderId,
            status: "reserved"
          },
          data: {
            status: "released"
          }
        })

      })

      logger.info("Order cancelled (payment failed)", { orderId })

      return res.sendStatus(200)
    }

    return res.sendStatus(200)

  } catch (err) {

    logger.error("Webhook Error", {
      error: err.message
    })

    return res.sendStatus(500)

  }
}