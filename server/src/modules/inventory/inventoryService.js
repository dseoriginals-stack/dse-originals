import prisma from "../../config/prisma.js"

/*
================================
RESERVE STOCK (VARIANT-BASED)
================================
*/

export async function reserveStock(variantId, quantity) {
  return await prisma.$transaction(async (tx) => {
    const variant = await tx.productVariant.findUnique({
      where: { id: variantId },
      select: { id: true, stock: true }
    })

    if (!variant) throw new Error("Product variant not found")
    if (variant.stock < quantity) throw new Error("Insufficient stock")

    await tx.productVariant.update({
      where: { id: variantId },
      data: { stock: { decrement: quantity } }
    })

    return await tx.inventoryReservation.create({
      data: {
        variantId,
        quantity,
        status: "reserved",
        expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 min
      }
    })
  })
}

/*
================================
RESERVE STOCK BATCH
================================
*/

export async function reserveStockBatch(items, orderId) {
  return await prisma.$transaction(async (tx) => {
    const reservations = []

    for (const item of items) {
      const variant = await tx.productVariant.findUnique({
        where: { id: item.variantId },
        select: { id: true, stock: true, product: { select: { name: true } } }
      })

      if (!variant) throw new Error(`Product not found: ${item.variantId}`)
      if (variant.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${variant.product.name}`)
      }

      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } }
      })

      const reservation = await tx.inventoryReservation.create({
        data: {
          variantId: item.variantId,
          orderId: orderId,
          quantity: item.quantity,
          status: "reserved",
          expiresAt: new Date(Date.now() + 20 * 60 * 1000) // 20 min for checkout
        }
      })
      
      reservations.push(reservation)
    }

    return reservations
  })
}

/*
================================
CONFIRM RESERVATIONS
================================
*/

export async function confirmReservation(orderId) {

  await prisma.inventoryReservation.updateMany({
    where: {
      orderId,
      status: "reserved"
    },
    data: {
      status: "confirmed"
    }
  })

  return true
}

/*
================================
RELEASE RESERVATIONS
================================
*/

export async function releaseReservation(orderId) {

  const reservations = await prisma.inventoryReservation.findMany({
    where: {
      orderId,
      status: "reserved"
    }
  })

  await prisma.$transaction(async (tx) => {

    for (const reservation of reservations) {

      // ➕ restore stock
      await tx.productVariant.update({
        where: { id: reservation.variantId },
        data: {
          stock: {
            increment: reservation.quantity
          }
        }
      })

      // update reservation
      await tx.inventoryReservation.update({
        where: { id: reservation.id },
        data: {
          status: "released"
        }
      })
    }
  })
}