import prisma from "../../config/prisma.js"
import xendit from "../../config/xendit.js"
import PDFDocument from "pdfkit"
import logger from "../../config/logger.js"
import { canTransition } from "../../utils/orderState.js"
import { sendShippedEmail } from "../../services/email.service.js"
import {
  reserveStock,
  reserveStockBatch,
  releaseReservation
} from "../inventory/inventoryService.js"
import { createOrderEvent } from "../../services/orderEvent.service.js"
import { createInvoice } from "../../config/xendit.js"

/* ============================
CREATE ORDER
============================ */

export const createOrder = async (req, res, next) => {

  let order = null

  try {

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
          include: { product: true }
        })

        if (!variant || variant.stock < quantity) {
          throw new Error(`Insufficient stock for ${variant?.product?.name || 'product'}`)
        }

        const itemTotal = Number(variant.price) * quantity
        subtotal += itemTotal

        orderItems.push({
          variantId: variant.id,
          productName: variant.product.name,
          quantity: quantity,
          price: variant.price
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
          }
        })
      }

      const totalAmount = subtotal + Number(shippingFee) - pointsDiscount

      return tx.order.create({
        data: {
          userId,
          guestEmail: userId ? null : guestEmail,
          guestName: userId ? null : guestName,
          totalAmount,
          shippingFee: Number(shippingFee),
          pointsUsed: userId ? Math.floor(pointsDiscount) : 0,
          pointsDiscount: pointsDiscount,
          deliveryMethod,
          clientOrderId,
          status: "pending",

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
      invoiceUrl: invoice.invoiceUrl
    })

  } catch (err) {

    logger.error("Order creation failed", {
      error: err.message,
      orderId: order?.id
    })

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

    const { status } = req.query

    const orders = await prisma.order.findMany({
      where: {
        ...(status && { status })
      },
      include: {
        items: true,
        user: true,
        address: true
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    res.json(orders)

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
        address: true
      }
    })

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    if (
      req.user.role === "admin" ||
      req.user.role === "staff"
    ) {
      return res.json(order)
    }

    if (!order.userId || order.userId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" })
    }

    res.json(order)

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

    const updated = await prisma.order.update({
      where: { id },
      data: {
        status,
        ...(trackingNo && { trackingNo })
      }
    })

    await createOrderEvent(id, status, `Order → ${status}`)

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
GENERATE INVOICE
============================ */

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
      where: { userId },
      include: {
        items: true,
        address: true
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    res.json(orders)
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