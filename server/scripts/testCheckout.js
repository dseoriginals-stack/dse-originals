import fs from "fs"
import prisma from "../src/config/prisma.js"
import { createOrder } from "../src/modules/order/order.controller.js"

async function test() {
  const req = {
    body: {
      items: [
        { variantId: "test-var-id", quantity: 1 } // ensure valid in DB
      ],
      deliveryMethod: "pickup",
      guestEmail: "test@example.com",
    }
  }
  
  const res = {
    json: (data) => console.log("RES JSON:", data),
    status: (code) => ({ json: (d) => console.log("RES STATUS", code, d) }),
  }
  
  const next = (err) => {
    if (err && err.response && err.response.errors) {
      console.log("XENDIT VALIDATION ERRORS:", JSON.stringify(err.response.errors, null, 2))
    } else {
      console.error("NEXT ERR:", err)
    }
  }
  
  // need a valid variant
  const variant = await prisma.productVariant.findFirst()
  if (!variant) return console.log("No variant found")
  
  req.body.items[0].variantId = variant.id
  
  await createOrder(req, res, next)
}

test().catch(e => {
  if (e.response && e.response.errors) {
    fs.writeFileSync("xendit_error.json", JSON.stringify(e.response.errors, null, 2))
    console.error("Errors written to xendit_error.json")
  } else {
    console.error(e)
  }
}).finally(() => process.exit())
