import express from "express"
import { getAnalytics } from "./analytics.controller.js"
import authenticate from "../../middleware/auth.middleware.js"
import { authorize } from "../../middleware/auth.middleware.js"

const router = express.Router()

router.get(
  "/",
  authenticate,
  authorize("admin", "staff"),
  getAnalytics
)

export default router