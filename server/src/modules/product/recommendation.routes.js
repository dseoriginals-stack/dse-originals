import express from "express"
import * as controller from "./recommendation.controller.js"

import authenticate from "../../middleware/auth.middleware.js"

const router = express.Router()

router.get("/related/:id", controller.getRelatedProducts)
router.get("/trending", controller.getTrendingProducts)
router.get("/together/:id", controller.getFrequentlyBoughtTogether)
router.get("/personalized", (req, res, next) => {
  // Use authenticate if token exists, otherwise proceed as guest
  if (req.headers.authorization || req.cookies?.token) {
    return authenticate(req, res, () => controller.getPersonalizedRecommendations(req, res, next))
  }
  return controller.getTrendingProducts(req, res, next)
})

export default router