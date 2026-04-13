import prisma from "../../config/prisma.js"
import { createInvoice } from "../../config/xendit.js"
import logger from "../../config/logger.js"

export const createDonation = async (req, res, next) => {
  try {
    const { amount, name, email } = req.body
    const userId = req.user?.id || null

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid donation amount" })
    }

    if (!email) {
      return res.status(400).json({ message: "Email is required" })
    }

    const donation = await prisma.donation.create({
      data: {
        amount: Number(amount),
        name,
        email,
        userId,
        status: "pending"
      }
    })

    const invoice = await createInvoice({
      external_id: `don_${donation.id}`, // Prefix with don_ to distinguish from orders
      amount: Number(amount),
      payer_email: email,
      description: `DSE Mission Support Donation - ${name || 'Anonymous'}`,
    })

    await prisma.donation.update({
      where: { id: donation.id },
      data: {
        paymentId: invoice.id,
        invoiceUrl: invoice.invoiceUrl
      }
    })

    res.json({
      donationId: donation.id,
      invoiceUrl: invoice.invoiceUrl
    })
  } catch (err) {
    logger.error("Donation creation failed", { error: err.message })
    next(err)
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
