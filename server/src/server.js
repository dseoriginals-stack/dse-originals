import "dotenv/config"
import express from "express"
import cors from "cors"
import helmet from "helmet"
import cookieParser from "cookie-parser"
import path from "path"
import { fileURLToPath } from "url"

// ✅ Load dotenv ONLY in development
if (process.env.NODE_ENV !== "production") {
  const dotenv = await import("dotenv")
  dotenv.config()
}

import logger from "./config/logger.js"
import passport from "./config/passport.js"
import errorHandler from "./middleware/error.middleware.js"

// Routes
import authRoutes from "./modules/auth/auth.routes.js"
import productRoutes from "./modules/product/product.routes.js"
import recommendationRoutes from "./modules/product/recommendation.routes.js"
import orderRoutes from "./modules/order/order.routes.js"
import adminRoutes from "./modules/admin/admin.routes.js"
import wishlistRoutes from "./modules/wishlist/wishlist.routes.js"
import cartRoutes from "./modules/cart/cart.routes.js"
import categoryRoutes from "./routes/category.routes.js"
import reviewRoutes from "./modules/review/review.routes.js"
import analyticsRoutes from "./modules/analytics/analytics.routes.js"
import userRoutes from "./modules/user/user.routes.js"

// Webhooks
import { handleXenditWebhook } from "./webhooks/xendit.webhook.js"


const app = express()
app.set("trust proxy", 1)

// =========================
// __dirname FIX
// =========================
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// =========================
// CORS (PRODUCTION SAFE)
// =========================
const allowedOrigins = [
  "http://localhost:3000",
  "https://dseoriginals.com",
  "https://www.dseoriginals.com",
]
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")))
app.use(
  cors({
    origin: function (origin, callback) {
      // allow server-to-server or curl
      if (!origin) return callback(null, true)

      // allow Vercel preview deployments
      if (origin.includes("vercel.app")) {
        return callback(null, true)
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true)
      }

      console.warn("❌ Blocked by CORS:", origin)
      return callback(new Error("Not allowed by CORS"))
    },
    credentials: true,
  })
)

// =========================
// SECURITY
// =========================
app.use(helmet())

// =========================
// WEBHOOK RAW (MUST be before json)
// =========================
app.use("/webhooks/xendit", express.raw({ type: "*/*" }))
app.use("/api/orders/webhook", express.raw({ type: "*/*" }))

// =========================
// PARSERS
// =========================
app.use(express.json({ limit: "1mb" }))
app.use(cookieParser())
app.use(passport.initialize())

// =========================
// ROUTES
// =========================
app.use("/api/user", userRoutes)
app.use("/api/analytics", analyticsRoutes)
app.use("/api/reviews", reviewRoutes)

app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes)
app.use("/api/recommendations", recommendationRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/cart", cartRoutes)
app.use("/api/wishlist", wishlistRoutes)
app.use("/api/categories", categoryRoutes)
app.use("/api/admin", adminRoutes)

// =========================
// WEBHOOK
// =========================
app.post("/webhooks/xendit", handleXenditWebhook)

// =========================
// ROOT
// =========================
app.get("/", (_req, res) => {
  res.send("🚀 DSE Originals API Running")
})

// =========================
// HEALTH CHECK
// =========================
app.get("/api/health", (_req, res) => {
  res.json({
    status: "OK",
    service: "DSE Originals API",
    timestamp: new Date(),
  })
})

// =========================
// ERROR HANDLER
// =========================
app.use(errorHandler)

// =========================
// START SERVER
// =========================
const PORT = process.env.PORT || 10000

app.listen(PORT, () => {
  console.log(`🔥 SERVER RUNNING ON PORT ${PORT}`)
  console.log(`🌍 ENV: ${process.env.NODE_ENV || "development"}`)
})