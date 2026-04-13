import express from "express"
import authenticate from "../../middleware/auth.middleware.js"
import { getStories, createStory, getAdminStories, updateStoryStatus, deleteStory } from "./story.controller.js"

const router = express.Router()

router.get("/", getStories)
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
}, createStory)

// Admin
router.get("/admin/all", authenticate, getAdminStories)
router.patch("/:id/status", authenticate, updateStoryStatus)
router.delete("/:id", authenticate, deleteStory)

export default router
