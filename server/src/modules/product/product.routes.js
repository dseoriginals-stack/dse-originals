import express from "express"
import {
  searchProducts,
  getProducts,
  createProduct,
  deleteProduct,
  getProductBySlugController,
  updateProduct
} from "./product.controller.js"
import { upload } from "../../config/multer.js"

import { authorize } from "../../middleware/auth.middleware.js"
import authenticate from "../../middleware/auth.middleware.js"

const router = express.Router()

/* =========================
   PUBLIC
========================= */
router.get("/", getProducts)
router.get("/search", searchProducts)
router.get("/slug/:slug", getProductBySlugController)

/* =========================
   ADMIN / STAFF
========================= */
router.use(authenticate)

router.post("/", authorize("admin", "staff"), upload.any(), createProduct)
router.put("/:id", authorize("admin", "staff"), upload.any(), updateProduct)
router.delete("/:id", authorize("admin", "staff"), deleteProduct)

export default router