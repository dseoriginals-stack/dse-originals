import express from "express"
import authenticate from "../../middleware/auth.middleware.js"
import { 
  getStories, 
  createStory, 
  getAdminStories, 
  updateStoryStatus, 
  deleteStory,
  likeStory 
} from "./story.controller.js"

import { validate } from "../../middleware/validate.middleware.js"
import { createStorySchema, updateStatusSchema } from "./story.validation.js"
import { storyLimiter } from "../../config/rateLimit.js"

const router = express.Router()

router.get("/", getStories)
router.post("/:id/like", likeStory)
import jwt from "jsonwebtoken"
import prisma from "../../config/prisma.js"

router.post("/", async (req, res, next) => {
  const token = req.cookies?.accessToken
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
      const user = await prisma.user.findUnique({ where: { id: decoded.id } })
      if (user) {
        req.user = { id: user.id, email: user.email, role: user.role }
      }
    } catch (err) {
      // Proceed as guest if token is invalid
    }
  }
  next()
}, storyLimiter, validate(createStorySchema), createStory)

import requireRole from "../../middleware/role.middleware.js"

// Admin
router.get("/admin/all", authenticate, requireRole("admin"), getAdminStories)
router.patch("/:id/status", authenticate, requireRole("admin"), validate(updateStatusSchema), updateStoryStatus)
router.delete("/:id", authenticate, requireRole("admin"), deleteStory)

export default router
