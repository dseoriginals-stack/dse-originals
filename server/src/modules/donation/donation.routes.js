import express from "express"
import authenticate from "../../middleware/auth.middleware.js"
import { createDonation, getMyDonations } from "./donation.controller.js"

const router = express.Router()

router.post("/", (req, res, next) => {
  // Optional authentication: check if user is logged in
  // but allow guest donations
  if (req.headers.authorization) {
    return authenticate(req, res, next)
  }
  next()
}, createDonation)

router.get("/me", authenticate, getMyDonations)

export default router
