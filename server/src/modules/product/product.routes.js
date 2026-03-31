import express from "express"
import {
  searchProducts,
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductBySlugController
} from "./product.controller.js"
import { upload } from "../../config/multer.js"

const router = express.Router()

/* =========================
   PUBLIC
========================= */
router.get("/", getProducts)
router.get("/search", searchProducts)
router.get("/slug/:slug", getProductBySlugController)
router.get("/:id", getProduct)

/* =========================
   ADMIN
========================= */
router.post("/", upload.single("image"), createProduct) // ✅ ONLY ONE
router.put("/:id", upload.single("image"), updateProduct)
router.delete("/:id", deleteProduct)

export default router