import express from "express"
import authenticate, { authorize, optionalAuthenticate } from "../../middleware/auth.middleware.js"
import * as controller from "./issue.controller.js"

const router = express.Router()

// Public endpoint (optional auth if logged in)
router.post("/", optionalAuthenticate, controller.reportIssue)

// Admin endpoints
router.get("/", authenticate, authorize("admin", "staff"), controller.getAllIssues)
router.patch("/:id/status", authenticate, authorize("admin", "staff"), controller.updateIssueStatus)

export default router
