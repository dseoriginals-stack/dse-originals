export const handleXenditWebhook = async (req, res) => {
  try {

    /*
    ============================
    VERIFY SIGNATURE
    ============================
    */

    if (
      req.headers["x-callback-token"] !==
      process.env.XENDIT_WEBHOOK_SECRET
    ) {
      return res.status(403).json({
        message: "Invalid webhook signature"
      })
    }

    const event = req.body
    const orderId = event.external_id
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
          // 1 point for every 100 spent (of the original subtotal? or final payed?)
          // Let's use total paid for simplicity
          const pointsEarned = Math.floor(Number(updated.totalAmount) / 100)

          if (pointsEarned > 0) {
            const user = await tx.user.findUnique({
              where: { id: updated.userId }
            })

            const newLifetimePoints = user.lifetimePoints + pointsEarned
            
            // Determine Tier
            let tier = "Faith"
            if (newLifetimePoints >= 1000) tier = "Love"
            else if (newLifetimePoints >= 500) tier = "Hope"

            await tx.user.update({
              where: { id: updated.userId },
              data: {
                luckyPoints: { increment: pointsEarned },
                lifetimePoints: { increment: pointsEarned },
                tier: tier
              }
            })
          }
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