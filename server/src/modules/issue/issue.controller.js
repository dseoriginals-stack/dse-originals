import prisma from "../../config/prisma.js"
import logger from "../../config/logger.js"

export const reportIssue = async (req, res, next) => {
  try {
    const { name, email, type, description, url, image } = req.body
    const userId = req.user?.id || null

    if (!email || !type || !description) {
      return res.status(400).json({ message: "Email, type, and description are required" })
    }

    const issue = await prisma.issueReport.create({
      data: {
        userId,
        name,
        email,
        type,
        description,
        url,
        image,
        status: "pending"
      }
    })

    logger.info("Issue reported", { issueId: issue.id, type })

    res.status(201).json({
      success: true,
      message: "Issue reported successfully. Thank you for your feedback!",
      issue
    })
  } catch (err) {
    logger.error("Failed to report issue", { error: err.message })
    next(err)
  }
}

export const getAllIssues = async (req, res, next) => {
  try {
    const issues = await prisma.issueReport.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } }
    })
    res.json(issues)
  } catch (err) {
    next(err)
  }
}

export const updateIssueStatus = async (req, res, next) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const updated = await prisma.issueReport.update({
      where: { id },
      data: { status }
    })

    res.json({ success: true, message: `Issue status updated to ${status}`, updated })
  } catch (err) {
    next(err)
  }
}
