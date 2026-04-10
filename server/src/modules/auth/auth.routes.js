import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import crypto from "crypto"
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

async function issueTokens(user, req, res) {
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

router.post("/register", authLimiter, async (req, res) => {
  const validation = registerSchema.safeParse(req.body)

  if (!validation.success) {
    return res.status(400).json({
      message: validation.error.errors[0].message,
    })
  }

  try {
    const { name, email, password } = req.body

    const existing = await prisma.user.findUnique({
      where: { email },
    })

    if (existing) {
      return res.status(400).json({
        message: "Email already exists",
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "customer",
        luckyPoints: 0,
      },
    })

    // --- EMAIL VERIFICATION ---
    const token = crypto.randomBytes(32).toString("hex")
    await prisma.emailVerificationToken.create({
      data: {
        email: user.email,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    })

    try {
      await sendVerificationEmail(user.email, token)
    } catch (emailErr) {
      logger.error("Failed to send verification email", emailErr)
    }

    return res.json({
      success: true,
      message: "Registration successful! Please check your email to verify your account."
    })
  } catch (err) {
    logger.error("REGISTER ERROR:", err)

    return res.status(500).json({
      message: "Registration failed",
    })
  }
})

/* =============================
   VERIFY EMAIL
============================= */

router.get("/verify-email", async (req, res) => {
  const { token } = req.query

  if (!token) {
    return res.status(400).json({ message: "Token is required" })
  }

  try {
    const verificationRecord = await prisma.emailVerificationToken.findUnique({
      where: { token },
    })

    if (!verificationRecord || verificationRecord.expiresAt < new Date()) {
      return res.status(400).json({ message: "Invalid or expired verification token" })
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { email: verificationRecord.email },
        data: { emailVerified: true },
      }),
      prisma.emailVerificationToken.delete({
        where: { id: verificationRecord.id },
      }),
    ])

    return res.json({ success: true, message: "Email verified successfully! You can now log in." })
  } catch (err) {
    logger.error("VERIFY EMAIL ERROR:", err)
    return res.status(500).json({ message: "Verification failed" })
  }
})

/* =============================
   RESEND VERIFICATION
============================= */

router.post("/resend-verification", authLimiter, async (req, res) => {
  const { email } = req.body

  if (!email) {
    return res.status(400).json({ message: "Email is required" })
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return res.status(200).json({ success: true, message: "If an account exists, a new verification link has been sent." })
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: "Email is already verified" })
    }

    await prisma.emailVerificationToken.deleteMany({ where: { email } })

    const token = crypto.randomBytes(32).toString("hex")
    await prisma.emailVerificationToken.create({
      data: {
        email: user.email,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    })

    await sendVerificationEmail(user.email, token)

    return res.json({ success: true, message: "Verification email resent!" })
  } catch (err) {
    logger.error("RESEND VERIFICATION ERROR:", err)
    return res.status(500).json({ message: "Failed to resend verification email" })
  }
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

    if (!user || !user.password) {
      return res.status(401).json({
        message: "Invalid credentials",
      })
    }

    // CHECK VERIFICATION
    if (!user.emailVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in.",
        unverified: true,
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