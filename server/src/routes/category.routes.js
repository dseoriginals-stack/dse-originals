import express from "express"
import {
  getCategories,
  createCategory,
  deleteCategory
} from "../modules/category/category.controller.js"

import authenticate, { authorize } from "../middleware/auth.middleware.js"

const router = express.Router()

/* =========================
   PUBLIC
========================= */
router.get("/", getCategories)

/* =========================
   ADMIN / STAFF
========================= */
router.use(authenticate)

router.post("/", authorize("admin", "staff"), createCategory)
router.delete("/:id", authorize("admin", "staff"), deleteCategory)

export default router