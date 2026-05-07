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
router.get("/questions", authorize("admin", "staff"), adminController.getQuestions)
router.get("/abandoned-carts", authorize("admin", "staff"), adminController.getAbandonedCarts)
router.post("/abandoned-carts/send", authorize("admin", "staff"), adminController.sendRecoveryEmails)
router.patch("/orders/:id/status", authorize("admin", "staff"), adminController.updateOrderStatus)

// Sensitive Routes (Admin Only)
router.get("/users", authorize("admin"), adminController.getUsers)
router.patch("/users/:id/role", authorize("admin"), adminController.updateUserRole)
router.get("/stories", authorize("admin"), adminController.getStories)
router.get("/reviews", authorize("admin"), adminController.getReviews)
router.delete("/reviews/:id", authorize("admin"), adminController.deleteReview)
router.delete("/orders/:id", authorize("admin"), adminController.deleteOrder)
router.get("/activity-logs", authorize("admin"), adminController.getActivityLogs)

// Notification Routes
router.get("/notifications", authorize("admin", "staff"), adminController.getNotifications)
router.patch("/notifications/read-all", authorize("admin", "staff"), adminController.markAllNotificationsRead)
router.patch("/notifications/:id/read", authorize("admin", "staff"), adminController.markNotificationRead)

// Global Search
router.get("/search", authorize("admin", "staff"), adminController.globalSearch)

export default router