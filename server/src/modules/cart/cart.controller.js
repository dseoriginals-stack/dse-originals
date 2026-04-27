import prisma from "../../config/prisma.js"

/* ============================
GET USER CART
============================ */

export const getCart = async (req, res, next) => {

  try {

    const userId = req.user?.id
    const sessionId = req.headers["x-session-id"]

    if (!userId && !sessionId) {
      return res.json({ items: [] })
    }

    const whereClause = userId ? { userId } : { sessionId }

    const cart = await prisma.cart.findFirst({
      where: whereClause,
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: { take: 1 }
                  }
                },
                attributes: true
              }
            }
          }
        }
      }
    })

    res.json({
      items:
        cart?.items.map(item => {
          const variant = item.variant
          const product = variant.product
          const attributes = variant.attributes || []
          
          // Consistent Price Logic
          const getPrice = () => {
            const attrs = attributes.map(a => (a.value || "").toLowerCase())
            if (attrs.some(a => a.includes("55ml"))) return 349
            if (attrs.some(a => a.includes("30ml"))) return 249
            return Number(variant.price)
          }

          return {
            variantId: item.variantId,
            productId: product.id,
            name: product.name,
            price: getPrice(),
            quantity: item.quantity,
            attributes: attributes.map(a => ({ name: a.name, value: a.value })),
            image: variant.image || product.images?.[0]?.url || null
          }
        }).reverse() || []
    })

  } catch (err) {
    next(err)
  }

}

/* ============================
ADD ITEM
============================ */

export const addItem = async (req, res, next) => {

  try {

    const userId = req.user?.id
    const sessionId = req.headers["x-session-id"]

    if (!userId && !sessionId) {
      return res.status(400).json({ success: false, message: "No user or session ID provided" })
    }

    const { variantId, quantity } = req.body

    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId }
    })

    if (!variant) {
      return res.status(404).json({ success: false, message: "Product variation not found" })
    }

    const whereClause = userId ? { userId } : { sessionId }

    let cart = await prisma.cart.findFirst({
      where: whereClause
    })

    if (!cart) {

      cart = await prisma.cart.create({
        data: userId ? { userId } : { sessionId }
      })

    }

    const existing = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        variantId // ✅ FIXED
      }
    })

    if (existing) {

      await prisma.cartItem.update({
        where: { id: existing.id },
        data: {
          quantity: existing.quantity + quantity
        }
      })

    } else {

      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          variantId, // ✅ FIXED
          quantity
        }
      })

    }

    res.json({ success: true })

  } catch (err) {
    next(err)
  }

}

export const removeItem = async (req, res, next) => {

  try {

    const userId = req.user?.id
    const sessionId = req.headers["x-session-id"]
    const { id: variantId } = req.params

    const whereClause = userId ? { userId } : { sessionId }

    const cart = await prisma.cart.findFirst({
      where: whereClause
    })

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" })
    }

    await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
        variantId
      }
    })

    res.json({ success: true })

  } catch (err) {
    next(err)
  }

}

export const updateItemQuantity = async (req, res, next) => {
  try {
    const userId = req.user?.id
    const sessionId = req.headers["x-session-id"]
    const { variantId, quantity } = req.body

    const whereClause = userId ? { userId } : { sessionId }

    const cart = await prisma.cart.findFirst({
      where: whereClause
    })

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" })
    }

    await prisma.cartItem.updateMany({
      where: {
        cartId: cart.id,
        variantId
      },
      data: {
        quantity
      }
    })

    res.json({ success: true })
  } catch (err) {
    next(err)
  }
}

/* ============================
SAVE EMAIL (🔥 REQUIRED FOR RECOVERY)
============================ */

export const saveCartEmail = async (req, res, next) => {

  try {

    const userId = req.user?.id
    const sessionId = req.headers["x-session-id"]
    const { email } = req.body

    let cart = null

    if (userId) {

      cart = await prisma.cart.findFirst({
        where: { userId }
      })

    } else if (sessionId) {
      cart = await prisma.cart.findFirst({
        where: { sessionId }
      })
    }

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found"
      })
    }

    await prisma.cart.update({
      where: { id: cart.id },
      data: { email }
    })

    res.json({ success: true })

  } catch (err) {
    next(err)
  }

}