import prisma from "../../config/prisma.js"

/*
================================
RESERVE STOCK (VARIANT-BASED)
================================
*/

export async function reserveStock(variantId, quantity) {

  return await prisma.$transaction(async (tx) => {

    // 🔒 LOCK ROW (IMPORTANT)
    const variant = await tx.productVariant.findUnique({
      where: { id: variantId }
    })

    if (!variant) {
      throw new Error("Product variant not found")
    }

    if (variant.stock < quantity) {
      throw new Error("Insufficient stock")
    }

    // ➖ decrement stock
    await tx.productVariant.update({
      where: { id: variantId },
      data: {
        stock: {
          decrement: quantity
        }
      }
    })

    // 🧾 create reservation
    const reservation = await tx.inventoryReservation.create({
      data: {
        variantId,
        quantity,
        status: "reserved",
        expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 min
      }
    })

    return reservation
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