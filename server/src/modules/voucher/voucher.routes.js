import express from "express"
import { validateVoucher, createVoucher, getVouchers, toggleVoucherStatus, deleteVoucher } from "./voucher.controller.js"
import authenticate, { authorize } from "../../middleware/auth.middleware.js"

const router = express.Router()

// Public route to validate a voucher before checkout
router.post("/validate", validateVoucher)

// Admin routes
router.post("/", authenticate, authorize("admin"), createVoucher)
router.get("/", authenticate, authorize("admin"), getVouchers)
router.put("/:id/toggle", authenticate, authorize("admin"), toggleVoucherStatus)
router.delete("/:id", authenticate, authorize("admin"), deleteVoucher)

export default router
