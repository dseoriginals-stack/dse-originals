import express from "express"
import {
  searchProducts,
  getProducts,
  createProduct,
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

/* =========================
   ADMIN
========================= */
router.post("/", upload.single("image"), createProduct)
router.delete("/:id", deleteProduct)

export default router