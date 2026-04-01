import express from "express"
import {
  getCategories,
  createCategory,
  deleteCategory
} from "../modules/category/category.controller.js"

const router = express.Router()

/* =========================
   PUBLIC
========================= */
router.get("/", getCategories)

/* =========================
   ADMIN
========================= */
router.post("/", createCategory)
router.delete("/:id", deleteCategory)

export default router