import express from "express"

import prisma from "../../config/prisma.js"
import authenticate, { authorize, optionalAuthenticate } from "../../middleware/auth.middleware.js"
import requireRole from "../../middleware/role.middleware.js"

import * as controller from "./order.controller.js"
import { handleXenditWebhook } from "./webhook.controller.js"
import { getTrackingInfo } from "../../services/tracking.service.js"
import { validate } from "../../middleware/validate.middleware.js"
import { createOrderSchema, updateStatusSchema } from "./order.validation.js"

const router = express.Router()

router.get(
  "/my-orders",
  authenticate,
  controller.getMyOrders
)

router.get(
  "/track",
  controller.trackOrder
)

/* =============================
  CHECKOUT
============================= */

// Optional Authenticated checkout (supports both guests & logged-in users)
router.post("/checkout", optionalAuthenticate, validate(createOrderSchema), controller.createOrder)

// Optional guest order creation endpoint
router.post("/", validate(createOrderSchema), controller.createOrder)

// Staff/Admin Walk-in Orders (Manual)
router.post(
  "/manual", 
  authenticate, 
  authorize("admin", "staff"), 
  controller.createManualOrder
)

/* =============================
   ADMIN / STAFF ROUTES
============================= */

router.get(
  "/",
  authenticate,
  authorize("admin", "staff"),
  controller.getAllOrders
)

router.put(
  "/:id/status",
  authenticate,
  authorize("admin", "staff"),
  controller.updateOrderStatus
)

/* Staff/Admin actions: approve / ship / deliver */
router.patch(
  "/:id/approve",
  authenticate,
  authorize("admin", "staff"),
  controller.approveOrder
)

router.patch(
  "/:id/ship",
  authenticate,
  authorize("admin", "staff"),
  controller.shipOrder
)

router.patch(
  "/:id/deliver",
  authenticate,
  authorize("admin", "staff"),
  controller.deliverOrder
)

/* =============================
   USER ORDER ROUTES
============================= */

router.get(
  "/:id",
  authenticate,
  controller.getSingleOrder
)

router.get(
  "/:id/receipt",
  optionalAuthenticate,
  controller.downloadReceipt
)

router.post(
  "/:id/refund",
  authenticate,
  requireRole("admin"),
  controller.refundOrder
)

router.put(
  "/:id/cancel",
  authenticate,
  controller.cancelOrder
)

router.put(
  "/:id/status",
  authenticate,
  requireRole("admin"),
  validate(updateStatusSchema),
  controller.updateOrderStatus
)
 
router.delete(
  "/:id",
  authenticate,
  requireRole("admin"),
  controller.deleteOrder
)

/* =============================
   ORDER TRACKING
============================= */

router.get("/:id/tracking", authenticate, async (req, res) => {

  try {

    const { id } = req.params

    const order = await prisma.order.findUnique({
      where: { id }
    })

    if (!order || !order.trackingNo) {
      return res.json({ events: [] })
    }

    const events = await getTrackingInfo(order.trackingNo)

    res.json({ events })

  } catch (err) {

    res.status(500).json({
      message: "Tracking failed"
    })

  }

})

/* =============================
   XENDIT WEBHOOK
============================= */

router.post("/webhook", handleXenditWebhook)

export default router