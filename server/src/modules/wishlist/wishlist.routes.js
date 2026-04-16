import express from "express"
import prisma from "../../config/prisma.js"
import authenticate from "../../middleware/auth.middleware.js"

const router = express.Router()

/* =============================
   TOGGLE WISHLIST
============================= */
router.post("/toggle", authenticate, async (req, res) => {
  try {
    const { productId } = req.body
    const userId = req.user.id

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" })
    }

    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    })

    if (existing) {
      // Remove
      await prisma.wishlist.delete({
        where: { id: existing.id }
      })
      return res.json({ action: "removed" })
    } else {
      // Add
      await prisma.wishlist.create({
        data: { userId, productId }
      })
      return res.json({ action: "added" })
    }

  } catch (error) {
    console.error("WISHLIST TOGGLE ERROR:", error)
    return res.status(500).json({ message: "Failed to update wishlist" })
  }
})

/* =============================
   GET USER WISHLIST
============================= */
router.get("/", authenticate, async (req, res) => {
  try {
    const userId = req.user.id
    
    const items = await prisma.wishlist.findMany({
      where: { userId },
      select: { productId: true }
    })

    return res.json(items.map(i => i.productId))

  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch wishlist" })
  }
})

export default router