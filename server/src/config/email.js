import { sendEmail, baseTemplate } from "../services/email.service.js"

/* =========================
   PASSWORD RESET EMAIL
========================= */

export async function sendPasswordResetEmail(email, resetUrl) {

  await sendEmail({
    to: email,
    subject: "Reset your password",
    html: baseTemplate(`
      <h2 style="margin-top:0;">Password Reset Request</h2>
      <p>Click the link below to reset your password. If you didn't request this, please ignore this email.</p>
      <div style="margin:30px 0;">
        <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#274C77;color:white;text-decoration:none;border-radius:8px;font-weight:600;">Reset Password</a>
      </div>
      <p style="font-size:12px;color:#94a3b8;">Or copy and paste this link: <br/> ${resetUrl}</p>
    `)
  })

}

/* =========================
   VERIFICATION EMAIL
========================= */

export async function sendVerificationEmail(email, token) {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`

  await sendEmail({
    to: email,
    subject: "Verify your email - DSEoriginals",
    html: baseTemplate(`
      <div style="font-family: sans-serif;">
        <h2 style="margin-top:0;">Welcome to DSEoriginals!</h2>
        <p>Please click the button below to verify your email address and activate your account:</p>
        <div style="margin:30px 0;">
          <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background-color: #274C77; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Verify Email</a>
        </div>
        <p style="margin-top: 20px; font-size: 12px; color: #666;">If the button doesn't work, copy and paste this link into your browser: <br/> ${verifyUrl}</p>
      </div>
    `)
  })
}

/* =========================
   ORDER INVOICE EMAIL
========================= */

export async function sendInvoiceEmail(email, order) {

  await sendEmail({
    to: email,
    subject: `Order #${order.id} confirmation`,
    html: baseTemplate(`
      <h2 style="margin-top:0;">Thank you for your order</h2>
      <div style="background:#f8fafc;padding:20px;border-radius:12px;border:1px solid #e2e8f0;">
        <p><strong>Order ID:</strong> ${order.id}</p>
        <p><strong>Total:</strong> ₱${Number(order.totalAmount || order.total).toLocaleString()}</p>
        <p><strong>Status:</strong> ${order.status}</p>
      </div>
    `)
  })
}

export async function sendAdminStoryNotification(story) {
  try {
    if (!process.env.EMAIL_USER) return
    await sendEmail({
      to: process.env.EMAIL_USER,
      subject: "✨ New Story Pending Review - DSE Community",
      html: baseTemplate(`
        <div style="font-family: sans-serif; color: #333;">
          <h2 style="color: #274C77; margin-top:0;">New Story Submission</h2>
          <p>A new story has been shared by the community and is waiting for your approval.</p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; border:1px solid #eee;">
            <p><strong>Title:</strong> ${story.title}</p>
            <p><strong>Preview:</strong> ${story.content.substring(0, 150)}...</p>
          </div>
          <a href="${process.env.FRONTEND_URL}/admin" style="display: inline-block; padding: 12px 24px; background-color: #274C77; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Review Stories</a>
        </div>
      `)
    })
  } catch (err) {
    console.error("Failed to send admin story notification:", err)
  }
}