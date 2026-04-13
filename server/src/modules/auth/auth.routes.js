import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import crypto from "crypto"
import passport from "passport"
import prisma from "../../config/prisma.js"
import authLimiter from "../../middleware/authRateLimiter.js"
import { loginSchema, registerSchema } from "../../validators/auth.validator.js"
import logger from "../../config/logger.js"
import { sendPasswordResetEmail, sendVerificationEmail } from "../../config/email.js"
import authenticate from "../../middleware/auth.middleware.js"

const router = express.Router()

/* =============================
   ENV CHECK (PREVENT CRASH)
============================= */
if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
  throw new Error("JWT secrets are missing")
}

const isProd = process.env.NODE_ENV === "production"

/* =============================
   TOKEN GENERATORS
============================= */

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" }
  )
}

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  )
}

/* =============================
   ISSUE TOKENS
============================= */

async function issueTokens(user, req, res, isOAuth = false) {
  const accessToken = generateAccessToken(user)
  const refreshToken = generateRefreshToken(user)

  const hashedToken = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex")

  await prisma.refreshToken.create({
    data: {
      tokenHash: hashedToken,
      userId: user.id,
      userAgent: req.headers["user-agent"],
      ip: req.ip,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  })

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  })

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  })

  if (isOAuth) {
    return res.redirect(`${process.env.CLIENT_URL}/account?auth=success`);
  }

  return res.json({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      luckyPoints: user.luckyPoints,
      createdAt: user.createdAt,
    },
  })
}

/* =============================
   REGISTER
============================= */

/* =============================
   REGISTER (DISABLED - MOVED TO GOOGLE ONLY)
   ============================= */
router.post("/register", (req, res) => {
  return res.status(403).json({
    message: "Manual registration is disabled. Please use 'Continue with Google'."
  })
})



/* =============================
   LOGIN
============================= */

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      })
    }

    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    })

    if (!user) {
      return res.status(401).json({
        message: "This account does not exist.",
      })
    }

    if (user.provider === "google") {
      return res.status(400).json({
        message: "This account uses Google login. Please click 'Continue with Google'.",
      })
    }

    if (!user.password) {
      return res.status(401).json({
        message: "This account does not have a password set. Please use social login.",
      })
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      })
    }

    return await issueTokens(user, req, res)
  } catch (error) {
    console.error("LOGIN ERROR:", error)

    return res.status(500).json({
      message: error.message || "Login failed",
    })
  }
})

/* =============================
   GOOGLE OAUTH
============================= */

router.get("/google", passport.authenticate("google", {
  scope: ["profile", "email"],
  session: false
}))

router.get("/google/callback", (req, res, next) => {
  passport.authenticate("google", { session: false }, async (err, user) => {
    if (err || !user) {
      return res.redirect(`${process.env.CLIENT_URL}/account?error=oauth_failed`);
    }
    return await issueTokens(user, req, res, true);
  })(req, res, next);
});

/* =============================
   FACEBOOK OAUTH
============================= */

router.get("/facebook", passport.authenticate("facebook", {
  scope: ["email"],
  session: false
}))

router.get("/facebook/callback", (req, res, next) => {
  passport.authenticate("facebook", { session: false }, async (err, user) => {
    if (err || !user) {
      const errorType = err?.message === "no_account" ? "no_account" : "oauth_failed";
      return res.redirect(`${process.env.CLIENT_URL}/account?error=${errorType}`);
    }
    return await issueTokens(user, req, res, true);
  })(req, res, next);
});

/* =============================
   LOGOUT
============================= */

router.post("/logout", async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken

    if (refreshToken) {
      const hashedToken = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex")

      await prisma.refreshToken.deleteMany({
        where: { tokenHash: hashedToken },
      })
    }

    res.clearCookie("accessToken")
    res.clearCookie("refreshToken")

    return res.json({ message: "Logged out" })
  } catch (error) {
    logger.error("LOGOUT ERROR:", error)

    return res.status(500).json({
      message: "Logout failed",
    })
  }
})

/* =============================
   VERIFY ROLE
============================= */

router.get("/verify-role", async (req, res) => {
  try {
    const token = req.cookies.accessToken

    if (!token) {
      return res.status(401).json({
        message: "No token",
      })
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET
    )

    return res.json({
      role: decoded.role,
    })
  } catch (err) {
    console.error("VERIFY ROLE ERROR:", err)

    return res.status(401).json({
      message: "Invalid or expired token",
    })
  }
})

/* =============================
   auth/me
============================= */

router.get("/me", authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        phone: user.phone,
        luckyPoints: user.luckyPoints,
        createdAt: user.createdAt,
      },
    })
  } catch (err) {
    console.error("ME ERROR:", err)
    res.status(500).json({ message: "Failed to fetch user" })
  }
})

export default router