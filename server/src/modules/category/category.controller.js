import * as categoryService from "../../services/categoryService.js"
import { z } from "zod"

/* =========================
   SCHEMA
========================= */
const categorySchema = z.object({
  name: z.string().min(2, "Category name is too short")
})

/* =========================
   GET
========================= */
export async function getCategories(req, res) {
  try {
    const categories = await categoryService.getCategories()
    res.json(categories)
  } catch (err) {
    console.error("❌ GET CATEGORIES ERROR:", err)
    res.status(500).json({ message: "Failed to fetch categories" })
  }
}

/* =========================
   CREATE
========================= */
export async function createCategory(req, res) {
  try {
    const validation = categorySchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        message: validation.error.errors[0]?.message
      })
    }

    const category = await categoryService.createCategory(validation.data)

    res.status(201).json(category)

  } catch (err) {
    console.error("❌ CREATE CATEGORY ERROR:", err)

    // handle duplicate safely
    if (err.code === "P2002") {
      return res.status(400).json({
        message: "Category already exists"
      })
    }

    res.status(400).json({
      message: err.message || "Failed to create category"
    })
  }
}

/* =========================
   DELETE
========================= */
export async function deleteCategory(req, res) {
  try {
    await categoryService.deleteCategory(req.params.id)
    res.json({ success: true })
  } catch (err) {
    console.error("❌ DELETE CATEGORY ERROR:", err)

    res.status(400).json({
      message: "Failed to delete category"
    })
  }
}