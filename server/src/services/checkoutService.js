import prisma from "../config/prisma.js"
import { reserveStock } from "../modules/inventory/inventoryService.js"
import { createInvoice } from "../config/xendit.js"
import logger from "../config/logger.js"

/* ============================
   CREATE CHECKOUT
============================ */

export async function createCheckout({
  items,
  userId,
  guestEmail,
  deliveryMethod,
  shippingFee = 0,
  pickupTime,
  address
}) {

  if (!items || items.length === 0) {
    throw new Error("Cart is empty")
  }

  const reservations = []
  let subtotal = 0

  /* =========================
     VALIDATE + RESERVE STOCK
  ========================= */

  for (const item of items) {

    if (!item.variantId || !item.quantity) {
      throw new Error("Invalid cart item")
    }

    const variant = await prisma.productVariant.findUnique({
      where: { id: item.variantId },
      include: { product: true }
    })

    if (!variant) {
      throw new Error("Product variant not found")
    }

    if (variant.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${variant.product.name}`)
    }

    const reservation = await reserveStock(
      item.variantId,
      item.quantity
    )

    reservations.push(reservation)

    subtotal += Number(variant.price) * item.quantity
  }

  const total = subtotal + Number(shippingFee)

  /* =========================
     CREATE ORDER
  ========================= */

  const order = await prisma.order.create({
    data: {
      userId: userId || null,
      guestEmail: guestEmail || null,

      totalAmount: total,
      shippingFee: Number(shippingFee),
      deliveryMethod,
      pickupTime: pickupTime ? new Date(pickupTime) : null,

      status: "pending",

      items: {
        create: await Promise.all(
          items.map(async (i) => {
            const variant = await prisma.productVariant.findUnique({
              where: { id: i.variantId },
              include: { product: true }
            })

            return {
              variantId: i.variantId,
              quantity: i.quantity,
              price: variant.price,
              productName: variant.product.name
            }
          })
        )
      }
    }
  })

  /* =========================
     LINK INVENTORY RESERVATIONS
  ========================= */

  await prisma.inventoryReservation.updateMany({
    where: {
      id: { in: reservations.map(r => r.id) }
    },
    data: {
      orderId: order.id
    }
  })

  /* =========================
     CREATE ORDER ADDRESS
  ========================= */

  if (address && deliveryMethod === "delivery") {
    await prisma.orderAddress.create({
      data: {
        orderId: order.id,
        ...address
      }
    })
  }

  /* =========================
     CREATE XENDIT INVOICE
  ========================= */

  const invoice = await createInvoice({
    external_id: order.id,
    amount: total,
    payer_email: guestEmail || "customer@email.com",
    description: `Order ${order.id}`
  })

  /* =========================
     SAVE PAYMENT ID
  ========================= */

  await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentId: invoice.id
    }
  })

  logger.info("Checkout created", {
    orderId: order.id,
    total
  })

  /* =========================
     RETURN RESPONSE
  ========================= */

  return {
    orderId: order.id,
    invoiceUrl: invoice.invoice_url
  }
}