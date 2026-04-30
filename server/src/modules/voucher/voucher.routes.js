import express from "express"
import { validateVoucher, createVoucher, getVouchers } from "./voucher.controller.js"
import { protect, adminOnly } from "../../middlewares/auth.middleware.js"

const router = express.Router()

// Public route to validate a voucher before checkout
router.post("/validate", validateVoucher)

// Admin routes
router.post("/", protect, adminOnly, createVoucher)
router.get("/", protect, adminOnly, getVouchers)

export default router
