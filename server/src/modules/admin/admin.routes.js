import express from "express"

import adminController from "./admin.controller.js"
import authenticate from "../../middleware/auth.middleware.js"
import requireRole from "../../middleware/role.middleware.js"

const router = express.Router()

// Protect all admin routes
router.use(authenticate)
router.use(requireRole("admin"))

router.get("/stats", adminController.getAdminStats)

router.get("/orders", adminController.getOrders)

router.get("/payments", adminController.getPayments)

router.patch("/orders/:id/status", adminController.updateOrderStatus)

router.get("/products", adminController.getProducts)

router.get("/users", adminController.getUsers)

router.patch("/users/:id/role", adminController.updateUserRole)

router.get("/stories", adminController.getStories)

router.get("/reviews", adminController.getReviews)

router.delete("/reviews/:id", adminController.deleteReview)

export default router