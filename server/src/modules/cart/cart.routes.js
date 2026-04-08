import express from "express"
import authenticate from "../../middleware/auth.middleware.js"
import * as controller from "./cart.controller.js"
import { saveCartEmail } from "./cart.controller.js"

const router = express.Router()

router.post("/save-email", saveCartEmail)

router.get("/", authenticate, controller.getCart)

router.post("/", authenticate, controller.addItem)

router.delete("/item/:id", authenticate, controller.removeItem)
router.patch("/qty", authenticate, controller.updateItemQuantity)
router.delete("/", authenticate, async (req, res) => {
  const userId = req.user?.id
  const sessionId = req.headers["x-session-id"]
  const whereClause = userId ? { userId } : { sessionId }
  
  const cart = await prisma.cart.findFirst({ where: whereClause })
  if (cart) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
  }
  res.json({ success: true })
})

export default router