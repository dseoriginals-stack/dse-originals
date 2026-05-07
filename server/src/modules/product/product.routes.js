import express from "express"
import {
  searchProducts,
  getProducts,
  createProduct,
  deleteProduct,
  getProductBySlugController,
  updateProduct,
  getProductQuestions,
  askProductQuestion,
  answerProductQuestion
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
router.get("/:id/questions", getProductQuestions)
router.post("/:id/questions", askProductQuestion)

/* =========================
   ADMIN / STAFF
========================= */
router.use(authenticate)

router.post("/", authorize("admin", "staff"), upload.any(), createProduct)
router.put("/:id", authorize("admin", "staff"), upload.any(), updateProduct)
router.delete("/:id", authorize("admin", "staff"), deleteProduct)
router.put("/questions/:questionId/answer", authorize("admin", "staff"), answerProductQuestion)

export default router