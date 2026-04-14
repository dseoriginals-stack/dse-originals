import express from "express"
import authenticate from "../../middleware/auth.middleware.js"
import { createDonation, getMyDonations } from "./donation.controller.js"

const router = express.Router()

import jwt from "jsonwebtoken"
import prisma from "../../config/prisma.js"

router.post("/", async (req, res, next) => {
  const token = req.cookies?.accessToken
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
      const user = await prisma.user.findUnique({ where: { id: decoded.id } })
      if (user) {
        req.user = { id: user.id, email: user.email, role: user.role }
      }
    } catch (err) {
      // Token exists but is invalid/expired. 
      // We ignore it and proceed as guest to prevent "Invalid token" errors for donors.
    }
  }
  next()
}, createDonation)

router.get("/me", authenticate, getMyDonations)

export default router
