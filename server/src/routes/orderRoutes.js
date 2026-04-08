import express from "express"
import { createCheckout } from "../services/checkoutService.js"

const router = express.Router()

router.post("/checkout", async (req, res) => {
  try {

    const result = await createCheckout({
      ...req.body,
      userId: req.user?.id || null
    })

    res.json(result)

  } catch (err) {

    console.error("❌ Checkout error:", err)

    res.status(400).json({
      message: err.message || "Checkout failed"
    })
  }
})

export default router