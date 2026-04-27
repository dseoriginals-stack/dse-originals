import prisma from "../../config/prisma.js"
import xendit from "../../config/xendit.js"
import PDFDocument from "pdfkit"
import logger from "../../config/logger.js"
import { canTransition } from "../../utils/orderState.js"
import { sendShippedEmail, sendDeliveredEmail } from "../../services/email.service.js"
import {
  reserveStock,
  reserveStockBatch,
  releaseReservation
} from "../inventory/inventoryService.js"
import { createOrderEvent } from "../../services/orderEvent.service.js"
import { createInvoice } from "../../config/xendit.js"
import { awardOrderPoints } from "../../services/loyalty.service.js"
import { getBaseShippingFee, calculateOrderWeight, calculateFinalShippingFee } from "../../utils/shipping.js"

/* ============================
INTERNAL CLEANUP HELPER
Runs on every order creation to free up stuck stock 
without needing Redis/Workers.
============================ */

async function cleanupExpiredCheckouts() {
  try {
    // 1. Find expired reservations
    const expired = await prisma.inventoryReservation.findMany({
      where: {
        status: "reserved",
        expiresAt: { lt: new Date() }
      }
    })

    if (expired.length === 0) return

    logger.info(`Cleaning up ${expired.length} expired reservations...`)

    await prisma.$transaction(async (tx) => {
      for (const res of expired) {
        // Restore stock
        await tx.productVariant.update({
          where: { id: res.variantId },
          data: { stock: { increment: res.quantity } }
        })

        // Mark as expired/released
        await tx.inventoryReservation.update({
          where: { id: res.id },
          data: { status: "expired" }
        })
      }

      // 2. Delete or Cancel initialized orders that are "dead" (> 1 hour old)
      // This keeps the database clean of abandoned checkout attempts.
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
      await tx.order.deleteMany({
        where: {
          status: "initialized",
          createdAt: { lt: oneHourAgo }
        }
      })
    })

  } catch (err) {
    logger.error("Passive cleanup failed", { error: err.message })
  }
}

/* ============================
CREATE ORDER
============================ */

export const createOrder = async (req, res, next) => {

  let order = null

  try {

    // 🔥 Passive cleanup: Free up stock from abandoned orders before proceeding
    await cleanupExpiredCheckouts()

    const {
      items,
      address,
      guestEmail,
      guestName,
      clientOrderId,
      deliveryMethod = "delivery",
      shippingFee = 0,
      pointsToUse = 0
    } = req.body

    const userId = req.user?.id || null

    if (!items || items.length === 0) {
      return res.status(400).json({
        message: "No items provided"
      })
    }

    /*
    ---------------------------
    IDEMPOTENCY
    ---------------------------
    */

    if (clientOrderId) {

      const existing = await prisma.order.findUnique({
        where: { clientOrderId }
      })

      if (existing) {
        return res.json({
          orderId: existing.id,
          invoiceUrl: existing.invoiceUrl || null
        })
      }

    }

    /*
    ---------------------------
    CREATE ORDER (TX)
    ---------------------------
    */

    order = await prisma.$transaction(async (tx) => {

      let subtotal = 0
      const orderItems = []

      for (let item of items) {
        // Handle cases where item might be wrapped in an array
        while (Array.isArray(item)) item = item[0]

        if (!item) continue;

        let vId = typeof item === "string" ? item : (item.variantId || item.productId || item.id)
        let quantity = item.quantity || 1

        // If vId itself is still an object/array, drill down
        while (vId && typeof vId === "object") {
          if (Array.isArray(vId)) {
            vId = vId[0]
          } else {
            const nextId = vId.variantId || vId.id || vId.productId
            if (!nextId) {
              vId = null // Force invalid if we hit a dead end
              break
            }
            vId = nextId
          }
        }

        if (!vId || typeof vId !== "string") {
          logger.error("Invalid item in order", { item })
          throw new Error(`Invalid item ID provided: ${JSON.stringify(item)}`)
        }

        const variant = await tx.productVariant.findUnique({
          where: { id: vId },
          include: { product: true, attributes: true }
        })

        if (!variant || variant.stock < quantity) {
          throw new Error(`Insufficient stock for ${variant?.product?.name || 'product'}`)
        }

        const getStandardPrice = (v) => {
          const attrs = (v.attributes || []).map(a => (a.value || "").toLowerCase())
          if (attrs.some(a => a.includes("55ml"))) return 349
          if (attrs.some(a => a.includes("30ml"))) return 249
          return Number(v.price)
        }

        const standardPrice = getStandardPrice(variant)
        const itemTotal = standardPrice * quantity
        subtotal += itemTotal

        orderItems.push({
          variantId: variant.id,
          productName: variant.product.name,
          quantity: quantity,
          price: standardPrice,
          category: variant.product.category,
          attributes: variant.attributes
        })
      }

      let pointsDiscount = 0
      if (userId && pointsToUse > 0) {
        const user = await tx.user.findUnique({ where: { id: userId } })
        if (!user || user.luckyPoints < pointsToUse) {
          throw new Error("Insufficient loyalty points")
        }

        // 1 point = ₱1 discount
        // Limit discount to subtotal
        pointsDiscount = Math.min(Number(pointsToUse), subtotal)

        await tx.user.update({
          where: { id: userId },
          data: {
            luckyPoints: { decrement: Math.floor(pointsDiscount) }
          },
          select: { id: true }
        })
      }

      const totalWeight = calculateOrderWeight(orderItems)
      let finalShippingFee = 0

      if (deliveryMethod === "delivery" && address?.region) {
        const baseFee = getBaseShippingFee(address.region)
        finalShippingFee = calculateFinalShippingFee(baseFee, totalWeight)
      }

      const totalAmount = subtotal + finalShippingFee - pointsDiscount

      return tx.order.create({
        data: {
          userId,
          guestEmail: userId ? null : guestEmail,
          guestName: userId ? null : guestName,
          totalAmount,
          shippingFee: finalShippingFee,
          pointsUsed: userId ? Math.floor(pointsDiscount) : 0,
          pointsDiscount: pointsDiscount,
          deliveryMethod,
          clientOrderId,
          status: "initialized",

          items: {
            create: orderItems
          },

          address: address ? {
            create: {
              fullName: address.fullName,
              phone: address.phone,
              region: address.region,
              province: address.province,
              city: address.city,
              barangay: address.barangay,
              street: address.street,
              postalCode: address.postalCode || null
            }
          } : undefined
        },
        include: {
          items: true,
          address: true
        }
      })

    })

    logger.info("Order created", { orderId: order.id })

    /*
    ---------------------------
    SAVE USER INFO + ADDRESS
    ---------------------------
    */

    if (userId && address) {

      await prisma.user.update({
        where: { id: userId },
        data: {
          ...(guestName && { name: guestName }),
          ...(address.phone && { phone: address.phone })
        }
      })

      // ✅ FIX: ensure only one default address
      await prisma.address.updateMany({
        where: {
          userId,
          isDefault: true
        },
        data: {
          isDefault: false
        }
      })

      await prisma.address.create({
        data: {
          userId,
          label: "Default",
          fullName: address.fullName,
          phone: address.phone,
          region: address.region,
          province: address.province,
          city: address.city,
          barangay: address.barangay,
          street: address.street,
          postalCode: address.postalCode || null,
          isDefault: true
        }
      })
    }

    await createOrderEvent(order.id, "created", "Order created")

    /*
    ---------------------------
    RESERVE STOCK
    ---------------------------
    */

    await reserveStockBatch(order.items, order.id)

    /*
    ---------------------------
    CREATE XENDIT INVOICE
    ---------------------------
    */

    const invoice = await createInvoice({
      external_id: order.id,
      amount: Number(order.totalAmount),
      payer_email: req.user?.email || guestEmail || "no-reply@dseoriginals.com",
      description: `DSE Order #${order.id}`,
    })

    /*
    ---------------------------
    SAVE PAYMENT DATA
    ---------------------------
    */

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentId: invoice.id
      }
    })

    return res.json({
      orderId: order.id,
      invoiceUrl: invoice.invoiceUrl || invoice.invoice_url
    })

  } catch (err) {
    if (order?.id) {
      await releaseReservation(order.id)
    }
    next(err)
  }
}

/* ============================
GET ALL ORDERS
============================ */

export const getAllOrders = async (req, res, next) => {
  try {

    const { status, includePending } = req.query

    // Only show pending orders if explicitly requested (e.g., Abandoned Cart view)
    // Default is to hide them to satisfy "don't consider it as an order until paid"
    const where = {
      ...(status ? { status } : { status: { notIn: ["initialized"] } }),
      ...(includePending === "true" && { status: undefined })
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
        user: true,
        address: true,
        approvedBy: { select: { id: true, name: true } },
        shippedBy: { select: { id: true, name: true } },
        deliveredBy: { select: { id: true, name: true } }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    // Fix for ₱NaN: cast Decimals to Number
    const safeOrders = orders.map(o => ({
      ...o,
      totalAmount: Number(o.totalAmount),
      shippingFee: Number(o.shippingFee),
      pointsDiscount: Number(o.pointsDiscount)
    }))

    res.json(safeOrders)

  } catch (err) {
    logger.error("Fetch all orders failed", { error: err })
    next(err)
  }
}

/* ============================
GET SINGLE ORDER
============================ */

export const getSingleOrder = async (req, res, next) => {
  try {
    const { id } = req.params

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        address: true,
        user: true,
        approvedBy: { select: { id: true, name: true } },
        shippedBy: { select: { id: true, name: true } },
        deliveredBy: { select: { id: true, name: true } }
      }
    })

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    if (
      req.user.role === "admin" ||
      req.user.role === "staff"
    ) {
      return res.json({
        ...order,
        totalAmount: Number(order.totalAmount),
        shippingFee: Number(order.shippingFee),
        pointsDiscount: Number(order.pointsDiscount)
      })
    }

    if (!order.userId || order.userId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" })
    }

    // Hide if still in checkout phase unless it were somehow paid
    if (order.status === "initialized") {
      return res.status(404).json({ message: "Order not found" })
    }

    res.json({
      ...order,
      totalAmount: Number(order.totalAmount),
      shippingFee: Number(order.shippingFee),
      pointsDiscount: Number(order.pointsDiscount)
    })

  } catch (err) {
    logger.error("Fetch single order failed", { error: err })
    next(err)
  }
}

/* ============================
UPDATE ORDER STATUS
============================ */

export const updateOrderStatus = async (req, res, next) => {
  try {

    const { id } = req.params
    const { status, trackingNo } = req.body

    const order = await prisma.order.findUnique({
      where: { id }
    })

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    if (!canTransition(order.status, status)) {
      return res.status(400).json({
        message: `Invalid transition from ${order.status} → ${status}`
      })
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id },
        data: {
          status,
          ...(trackingNo && { trackingNo })
        },
        include: { user: true }
      })

      await createOrderEvent(id, status, `Order → ${status}`)

      // Award points if manually marked as paid
      if (status === "paid" && order.status !== "paid" && updated.userId) {
        await awardOrderPoints(tx, id)
      }

      return updated
    })

    if (status === "shipped" || (trackingNo && trackingNo !== order.trackingNo)) {

      const fullOrder = await prisma.order.findUnique({
        where: { id },
        include: { items: true, user: true }
      })

      // Use a graceful subject if it's just a tracking update vs full ship
      const toEmail = fullOrder.user?.email || fullOrder.guestEmail
      if (toEmail) {
        await sendShippedEmail(toEmail, fullOrder)
      }
    }

    res.json(updated)

  } catch (err) {
    next(err)
  }
}

/* ============================
REFUND ORDER
============================ */

export const refundOrder = async (req, res, next) => {
  try {

    const { id } = req.params

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true }
    })

    if (!order || order.status !== "paid") {
      return res.status(400).json({
        message: "Refund not allowed"
      })
    }

    await prisma.$transaction(async (tx) => {

      for (const item of order.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: { increment: item.quantity }
          }
        })
      }

      await tx.order.update({
        where: { id },
        data: { status: "refunded" }
      })
    })

    await createOrderEvent(id, "refunded", "Order refunded")

    logger.info("Order refunded", { orderId: id })

    res.json({ message: "Order refunded" })

  } catch (err) {
    logger.error("Refund failed", { error: err })
    next(err)
  }
}

/* ============================
CANCEL ORDER
============================ */

export const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user.id
    const userRole = req.user.role

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true }
    })

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    // Authorization: User can only cancel their own order before it's shipped
    if (userRole !== "admin" && userRole !== "staff") {
      if (order.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" })
      }
      if (order.status !== "pending" && order.status !== "paid") {
        return res.status(400).json({ message: "Cannot cancel order once shipped" })
      }
    }

    await prisma.$transaction(async (tx) => {
      // Release stock if it was reserved
      for (const item of order.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: { increment: item.quantity }
          }
        })
      }

      await tx.order.update({
        where: { id },
        data: { status: "cancelled" }
      })
    })

    await createOrderEvent(id, "cancelled", `Order cancelled by ${userRole} ${userId}`)

    res.json({ message: "Order cancelled" })

  } catch (err) {
    next(err)
  }
}

export const generateInvoice = async (req, res, next) => {
  try {

    const { id } = req.params

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true, address: true }
    })

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      })
    }

    const doc = new PDFDocument()

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${id}.pdf`
    )

    doc.pipe(res)

    doc.fontSize(20).text("Invoice", { align: "center" })
    doc.moveDown()

    doc.text(`Order ID: ${order.id}`)
    doc.text(`Status: ${order.status}`)
    doc.text(`Total: ₱${order.totalAmount}`)
    doc.moveDown()

    if (order.address) {
      doc.text("Shipping Address:")
      doc.text(`${order.address.fullName}`)
      doc.text(`${order.address.phone}`)
      doc.text(`${order.address.street}, ${order.address.barangay}`)
      doc.text(`${order.address.city}, ${order.address.province}`)
      doc.text(`${order.address.region}`)
      doc.moveDown()
    }

    order.items.forEach(item => {
      doc.text(
        `Product: ${item.productName} | Qty: ${item.quantity} | ₱${item.price}`
      )
    })

    doc.end()

  } catch (err) {
    logger.error("Generate invoice failed", { error: err })
    next(err)
  }
}

export const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user.id

    const orders = await prisma.order.findMany({
      where: {
        userId,
        status: { notIn: ["initialized"] }
      },
      include: {
        items: true,
        address: true
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    const safeOrders = orders.map(o => ({
      ...o,
      totalAmount: Number(o.totalAmount),
      shippingFee: Number(o.shippingFee),
      pointsDiscount: Number(o.pointsDiscount)
    }))

    res.json(safeOrders)
  } catch (err) {
    next(err)
  }
}

/**
 * Public tracking (Guest & Logged In)
 * Requires Order ID and Guest Email
 */
export const trackOrder = async (req, res, next) => {
  try {
    const { id, email } = req.query

    if (!id || !email) {
      return res.status(400).json({ message: "Order ID and Email are required" })
    }

    const order = await prisma.order.findFirst({
      where: {
        id: id,
        OR: [
          { guestEmail: email },
          { user: { email: email } }
        ]
      },
      include: {
        items: true,
        address: true,
        events: {
          orderBy: { createdAt: "desc" }
        }
      }
    })

    if (!order) {
      return res.status(404).json({ message: "Order not found with these details" })
    }

    // Return limited data for privacy
    const safeData = {
      id: order.id,
      status: order.status,
      total: order.totalAmount,
      createdAt: order.createdAt,
      items: order.items.map(i => ({
        productName: i.productName,
        quantity: i.quantity,
        price: i.price
      })),
      events: order.events,
      trackingNo: order.trackingNo
    }

    res.json(safeData)

  } catch (err) {
    next(err)
  }
}


/* ============================
STAFF ACTIONS: APPROVE / SHIP / DELIVER
============================ */

export const approveOrder = async (req, res, next) => {
  try {
    const { id } = req.params

    if (req.user.role !== "staff") return res.status(403).json({ message: "Forbidden" })

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id } })
      if (!order) throw new Error("Order not found")

      /*
      if (req.user.shopId && order.shopId && req.user.shopId !== order.shopId) {
        throw new Error("Forbidden: order not in your shop")
      }
      */

      if (order.status === "approved") {
        throw new Error("Order already approved")
      }

      if (order.status !== "pending" && order.status !== "paid") {
        throw new Error("Cannot approve order in current state")
      }

      const updated = await tx.order.update({
        where: { id },
        data: {
          status: "approved",
          approvedById: req.user.id,
          approvedAt: new Date()
        }
      })

      await createOrderEvent(id, "approved", `Order approved by staff ${req.user.id}`)

      return updated
    })

    res.json(result)
  } catch (err) {
    next(err)
  }
}

export const shipOrder = async (req, res, next) => {
  try {
    const { id } = req.params

    if (req.user.role !== "staff") return res.status(403).json({ message: "Forbidden" })

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id } })
      if (!order) throw new Error("Order not found")

      /*
      if (req.user.shopId && order.shopId && req.user.shopId !== order.shopId) {
        throw new Error("Forbidden: order not in your shop")
      }
      */

      if (order.status !== "approved") {
        throw new Error("Order must be approved before shipping")
      }

      const updated = await tx.order.update({
        where: { id },
        data: {
          status: "shipped",
          shippedById: req.user.id,
          shippedAt: new Date()
        }
      })

      await createOrderEvent(id, "shipped", `Order shipped by staff ${req.user.id}`)

      return updated
    })

    // Send shipped email (best-effort)
    try {
      const fullOrder = await prisma.order.findUnique({ where: { id }, include: { user: true } })
      const toEmail = fullOrder.user?.email || fullOrder.guestEmail
      if (toEmail) await sendShippedEmail(toEmail, fullOrder)
    } catch (e) {
      logger.warn("Failed to send shipped email", { err: e })
    }

    res.json(result)
  } catch (err) {
    next(err)
  }
}

export const deliverOrder = async (req, res, next) => {
  try {
    const { id } = req.params

    if (req.user.role !== "staff") return res.status(403).json({ message: "Forbidden" })

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id } })
      if (!order) throw new Error("Order not found")

      /*
      if (req.user.shopId && order.shopId && req.user.shopId !== order.shopId) {
        throw new Error("Forbidden: order not in your shop")
      }
      */

      if (order.status !== "shipped") {
        throw new Error("Order must be shipped before delivery")
      }

      const updated = await tx.order.update({
        where: { id },
        data: {
          status: "delivered",
          deliveredById: req.user.id,
          deliveredAt: new Date()
        }
      })

      await createOrderEvent(id, "delivered", `Order delivered by staff ${req.user.id}`)

      return updated
    })

    // Send delivered email (best-effort)
    try {
      const fullOrder = await prisma.order.findUnique({ 
        where: { id: result.id || id }, 
        include: { user: true, items: true } 
      })
      const toEmail = fullOrder.user?.email || fullOrder.guestEmail
      if (toEmail) await sendDeliveredEmail(toEmail, fullOrder)
    } catch (e) {
      logger.warn("Failed to send delivered email", { err: e })
    }

    res.json(result)
  } catch (err) {
    next(err)
  }
}

/* ============================
   CREATE MANUAL ORDER (POS)
   ============================ */
export const createManualOrder = async (req, res, next) => {
  try {
    const {
      items,
      guestName,
      userId,
      paymentMethod = "cash",
      status = "paid"
    } = req.body

    const staffId = req.user.id

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items provided" })
    }

    const result = await prisma.$transaction(async (tx) => {
      let totalAmount = 0
      const orderItems = []

      for (const item of items) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          include: { product: true }
        })

        if (!variant || variant.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${variant?.product?.name || 'item'}`)
        }

        // Deduct stock immediately
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } }
        })

        totalAmount += Number(item.price) * item.quantity

        orderItems.push({
          variantId: variant.id,
          productName: variant.product.name,
          quantity: item.quantity,
          price: item.price
        })
      }

      // Create the manual order
      const order = await tx.order.create({
        data: {
          userId: userId || null,
          totalAmount,
          status,
          paymentMethod,
          isManual: true,
          guestName: userId ? null : (guestName || "Walk-in Customer"),
          deliveryMethod: "pickup",
          approvedById: staffId,
          approvedAt: new Date(),
          items: {
            create: orderItems
          }
        },
        include: { items: true }
      })

      // Award points if paid
      if (status === "paid" && userId) {
        await awardOrderPoints(tx, order.id)
      }

      return order
    })

    await createOrderEvent(result.id, "paid", "Manual Walk-in Sale completed")

    res.json(result)
  } catch (err) {
    next(err)
  }
}

/* ============================
   DELETE ORDER (ADMIN ONLY)
   ============================ */
export const deleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true }
    })

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    // Security: Only Admin can delete
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admin only" })
    }

    await prisma.$transaction(async (tx) => {
      // 1. Delete associated inventory reservations (they don't cascade)
      await tx.inventoryReservation.deleteMany({
        where: { orderId: id }
      })

      // 2. Delete associated inventory movements (they don't cascade)
      await tx.inventoryMovement.deleteMany({
        where: { orderId: id }
      })

      // 3. Delete the order (items, events, and address will cascade)
      await tx.order.delete({
        where: { id }
      })
    })

    logger.info("Order deleted permanently", { orderId: id, adminId: req.user.id })

    res.json({ message: "Order deleted permanently" })

  } catch (err) {
    logger.error("Delete order failed", { error: err.message, orderId: req.params.id })
    next(err)
  }
}
