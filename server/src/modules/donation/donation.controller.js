import prisma from "../../config/prisma.js"
import { createInvoice } from "../../config/xendit.js"
import logger from "../../config/logger.js"

export const createDonation = async (req, res, next) => {
  try {
    const { amount, name, email } = req.body
    const userId = req.user?.id || null

    logger.info("Initiating donation process", { userId, amount, email })

    if (!amount || amount <= 0) {
      logger.warn("Invalid donation amount attempt", { amount })
      return res.status(400).json({ message: "Invalid donation amount" })
    }

    if (!email) {
      logger.warn("Donation attempt without email")
      return res.status(400).json({ message: "Email is required" })
    }

    const model = prisma.donation || prisma.Donation
    if (!model) {
       throw new Error("Donation model not found in database client. Please redeploy server.")
    }

    const donation = await model.create({
      data: {
        amount: Number(amount),
        name,
        email,
        userId,
        status: "pending"
      }
    })

    logger.info("Donation record created", { donationId: donation.id })

    const invoice = await createInvoice({
      external_id: `don_${donation.id}`, 
      amount: Number(amount),
      payer_email: email,
      description: `DSE Mission Support Donation - ${name || 'Anonymous'}`,
      success_url: `${process.env.FRONTEND_URL}/donation-success?id=${donation.id}`,
      failure_url: `${process.env.FRONTEND_URL}/donate`
    })

    logger.info("Xendit invoice created", { invoiceId: invoice.id })

    await prisma.donation.update({
      where: { id: donation.id },
      data: {
        paymentId: invoice.id,
        invoiceUrl: invoice.invoiceUrl || invoice.invoice_url
      }
    })

    res.json({
      donationId: donation.id,
      invoiceUrl: invoice.invoiceUrl || invoice.invoice_url
    })
  } catch (err) {
    logger.error("❌ DONATION FAILED:", { 
      message: err.message, 
      stack: err.stack,
      body: req.body 
    })
    
    // Provide a more helpful error message
    res.status(err.status || 500).json({ 
      message: err.message || "Failed to initialize payment. Please check your connection or try a different amount.",
      details: err.response?.data?.message || null
    })
  }
}

export const getMyDonations = async (req, res, next) => {
  try {
    const donations = await prisma.donation.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" }
    })
    res.json(donations)
  } catch (err) {
    next(err)
  }
}
