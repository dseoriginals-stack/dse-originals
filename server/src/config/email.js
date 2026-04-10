import sgMail from "@sendgrid/mail"

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

/* =========================
   PASSWORD RESET EMAIL
========================= */

export async function sendPasswordResetEmail(email, resetUrl) {

  await sgMail.send({
    to: email,
    from: process.env.EMAIL_FROM,
    subject: "Reset your password",
    html: `
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
    `
  })

}

/* =========================
   VERIFICATION EMAIL
========================= */

export async function sendVerificationEmail(email, token) {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`

  await sgMail.send({
    to: email,
    from: process.env.EMAIL_FROM,
    subject: "Verify your email - DSE Originals",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
        <h2>Welcome to DSE Originals!</h2>
        <p>Please click the button below to verify your email address and activate your account:</p>
        <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background-color: #274C77; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Verify Email</a>
        <p style="margin-top: 20px; font-size: 12px; color: #666;">If the button doesn't work, copy and paste this link into your browser: <br/> ${verifyUrl}</p>
      </div>
    `
  })
}

/* =========================
   ORDER INVOICE EMAIL
========================= */

export async function sendInvoiceEmail(email, order) {

  await sgMail.send({
    to: email,
    from: process.env.EMAIL_FROM,
    subject: `Order #${order.id} confirmation`,
    html: `
      <h2>Thank you for your order</h2>
      <p>Order ID: ${order.id}</p>
      <p>Total: ${order.total}</p>
      <p>Status: ${order.status}</p>
    `
  })

}