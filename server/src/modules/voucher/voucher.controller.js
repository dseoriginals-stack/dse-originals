import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

/**
 * Validate a voucher code against a cart subtotal
 * POST /api/vouchers/validate
 * Body: { code: string, subtotal: number }
 */
export const validateVoucher = async (req, res) => {
  try {
    const { code, subtotal } = req.body

    if (!code) {
      return res.status(400).json({ success: false, message: "Voucher code is required" })
    }

    const voucher = await prisma.voucher.findUnique({
      where: { code: code.toUpperCase() }
    })

    if (!voucher) {
      return res.status(404).json({ success: false, message: "Invalid voucher code" })
    }

    if (!voucher.isActive) {
      return res.status(400).json({ success: false, message: "Voucher is no longer active" })
    }

    if (voucher.expiresAt && new Date(voucher.expiresAt) < new Date()) {
      return res.status(400).json({ success: false, message: "Voucher has expired" })
    }

    if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
      return res.status(400).json({ success: false, message: "Voucher usage limit reached" })
    }

    if (subtotal < Number(voucher.minSpend)) {
      return res.status(400).json({ 
        success: false, 
        message: `Minimum spend of ₱${Number(voucher.minSpend)} required for this voucher` 
      })
    }

    res.json({
      success: true,
      voucher: {
        id: voucher.id,
        code: voucher.code,
        discount: Number(voucher.discount),
        minSpend: Number(voucher.minSpend)
      }
    })
  } catch (error) {
    console.error("❌ Validate Voucher Error:", error)
    res.status(500).json({ success: false, message: "Internal server error" })
  }
}

/**
 * Create a new voucher
 * POST /api/vouchers
 * Admin only
 */
export const createVoucher = async (req, res) => {
  try {
    const { code, discount, minSpend, isActive, expiresAt, usageLimit } = req.body

    const existing = await prisma.voucher.findUnique({
      where: { code: code.toUpperCase() }
    })

    if (existing) {
      return res.status(400).json({ success: false, message: "Voucher code already exists" })
    }

    const voucher = await prisma.voucher.create({
      data: {
        code: code.toUpperCase(),
        discount: Number(discount),
        minSpend: Number(minSpend || 0),
        isActive: isActive !== undefined ? isActive : true,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        usageLimit: usageLimit ? Number(usageLimit) : null
      }
    })

    res.status(201).json({ success: true, voucher })
  } catch (error) {
    console.error("❌ Create Voucher Error:", error)
    res.status(500).json({ success: false, message: "Internal server error" })
  }
}

/**
 * Get all vouchers
 * GET /api/vouchers
 * Admin only
 */
export const getVouchers = async (req, res) => {
  try {
    const vouchers = await prisma.voucher.findMany({
      orderBy: { createdAt: 'desc' }
    })
    res.json({ success: true, vouchers })
  } catch (error) {
    console.error("❌ Get Vouchers Error:", error)
    res.status(500).json({ success: false, message: "Internal server error" })
  }
}

/**
 * Toggle voucher active status
 * PUT /api/vouchers/:id/toggle
 * Admin only
 */
export const toggleVoucherStatus = async (req, res) => {
  try {
    const { id } = req.params
    const voucher = await prisma.voucher.findUnique({ where: { id } })
    
    if (!voucher) return res.status(404).json({ success: false, message: "Voucher not found" })

    const updated = await prisma.voucher.update({
      where: { id },
      data: { isActive: !voucher.isActive }
    })

    res.json({ success: true, voucher: updated })
  } catch (error) {
    console.error("❌ Toggle Voucher Error:", error)
    res.status(500).json({ success: false, message: "Internal server error" })
  }
}

/**
 * Delete a voucher
 * DELETE /api/vouchers/:id
 * Admin only
 */
export const deleteVoucher = async (req, res) => {
  try {
    const { id } = req.params
    await prisma.voucher.delete({ where: { id } })
    res.json({ success: true })
  } catch (error) {
    console.error("❌ Delete Voucher Error:", error)
    res.status(500).json({ success: false, message: "Internal server error" })
  }
}
