import prisma from "../../config/prisma.js"
import { baseTemplate, transporter } from "../../services/email.service.js"
import crypto from "crypto"
import logger from "../../config/logger.js"

// 1. SEND OTP
export const sendGuestOTP = async (req, res, next) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: "Email is required" })
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Cleanup old tokens and store new one
    await prisma.emailVerificationToken.deleteMany({ where: { email } })
    await prisma.emailVerificationToken.create({
      data: { email, token: otp, expiresAt }
    })

    // HTML Content
    const content = `
      <div style="text-align: center; padding: 20px 0;">
        <h2 style="color: #274C77; margin-bottom: 10px;">Verify Your Email</h2>
        <p style="color: #64748b; font-size: 16px; margin-bottom: 25px;">You're almost there! Use the verification code below to complete your guest checkout.</p>
        
        <div style="background: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 12px; padding: 20px; display: inline-block;">
          <span style="font-family: monospace; font-size: 32px; font-weight: 800; color: #274C77; letter-spacing: 5px;">${otp}</span>
        </div>
        
        <p style="color: #94a3b8; font-size: 12px; margin-top: 25px;">This code will expire in 15 minutes. If you didn't request this, please ignore this email.</p>
      </div>
    `

    try {
      await transporter.sendMail({
        from: `"DSE Originals" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Verification Code: ${otp}`,
        html: baseTemplate(content)
      })
    } catch (mailError) {
      logger.error("Failed to send guest OTP email", { error: mailError.message, email })
      return res.status(500).json({ message: "Failed to send code. Please check your email and try again." })
    }

    logger.info(`OTP sent to ${email}`)
    res.json({ success: true, message: "OTP sent successfully" })

  } catch (err) {
    next(err)
  }
}

// 2. VERIFY OTP
export const verifyGuestOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" })
    }

    const record = await prisma.emailVerificationToken.findFirst({
      where: {
        email,
        token: otp,
        expiresAt: { gte: new Date() }
      }
    })

    if (!record) {
      return res.status(400).json({ message: "Invalid or expired verification code" })
    }

    // Success - delete the token
    await prisma.emailVerificationToken.delete({
      where: { id: record.id }
    })

    res.json({ success: true, message: "Email verified" })

  } catch (err) {
    next(err)
  }
}
