import express from "express"
import authenticate from "../../middleware/auth.middleware.js"
import { getStories, createStory, getAdminStories, updateStoryStatus, deleteStory } from "./story.controller.js"

const router = express.Router()

router.get("/", getStories)
router.post("/", (req, res, next) => {
  if (req.headers.authorization || req.cookies.token) {
    return authenticate(req, res, next)
  }
  next()
}, createStory)

// Admin
router.get("/admin/all", authenticate, getAdminStories)
router.patch("/:id/status", authenticate, updateStoryStatus)
router.delete("/:id", authenticate, deleteStory)

export default router
