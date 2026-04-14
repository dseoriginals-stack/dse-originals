import express from "express"

import adminController from "./admin.controller.js"
import authenticate from "../../middleware/auth.middleware.js"
import requireRole from "../../middleware/role.middleware.js"

import { authorize } from "../../middleware/auth.middleware.js"

const router = express.Router()

// Authenticate all routes
router.use(authenticate)

// Operational Routes (Both Admin & Staff)
router.get("/stats", authorize("admin", "staff"), adminController.getAdminStats)
router.get("/orders", authorize("admin", "staff"), adminController.getOrders)
router.get("/payments", authorize("admin", "staff"), adminController.getPayments)
router.get("/products", authorize("admin", "staff"), adminController.getProducts)
router.patch("/orders/:id/status", authorize("admin", "staff"), adminController.updateOrderStatus)

// Sensitive Routes (Admin Only)
router.get("/users", authorize("admin"), adminController.getUsers)
router.patch("/users/:id/role", authorize("admin"), adminController.updateUserRole)
router.get("/stories", authorize("admin"), adminController.getStories)
router.get("/reviews", authorize("admin"), adminController.getReviews)
router.delete("/reviews/:id", authorize("admin"), adminController.deleteReview)

export default router