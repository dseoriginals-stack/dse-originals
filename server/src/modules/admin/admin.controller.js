import adminService from "./admin.service.js"
import logger from "../../config/logger.js"

const getAdminStats = async (req, res, next) => {
  try {
    const stats = await adminService.getAdminStats()
    res.json(stats)
  } catch (err) {
    logger.error("Admin stats failed", { error: err })
    next(err)
  }
}

const getOrders = async (req, res, next) => {
  try {
    const orders = await adminService.getOrders()
    res.json(orders)
  } catch (err) {
    logger.error("Fetch admin orders failed", { error: err })
    next(err)
  }
}

const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params
    const { status, trackingNo } = req.body

    const updated = await adminService.updateOrderStatus(
      id,
      status,
      trackingNo
    )

    res.json(updated)
  } catch (err) {
    logger.error("Admin order update failed", { error: err })
    next(err)
  }
}

const getProducts = async (req, res, next) => {
  try {
    const products = await adminService.getProducts()
    res.json(products)
  } catch (err) {
    logger.error("Admin products fetch failed", { error: err })
    next(err)
  }
}

const getUsers = async (req, res, next) => {
  try {
    const users = await adminService.getUsers()
    res.json(users)
  } catch (err) {
    logger.error("Admin users fetch failed", { error: err })
    next(err)
  }
}

const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params
    const { role } = req.body
    const updated = await adminService.updateUserRole(id, role)
    res.json(updated)
  } catch (err) {
    logger.error("Admin user role update failed", { error: err })
    next(err)
  }
}

const getStories = async (req, res, next) => {
  try {
    const stories = await adminService.getStories()
    res.json(stories)
  } catch (err) {
    logger.error("Admin stories fetch failed", { error: err })
    next(err)
  }
}

const getReviews = async (req, res, next) => {
  try {
    const reviews = await adminService.getReviews()
    res.json(reviews)
  } catch (err) {
    logger.error("Admin reviews fetch failed", { error: err })
    next(err)
  }
}

const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params
    await adminService.deleteReview(id)
    res.json({ success: true })
  } catch (err) {
    logger.error("Admin review delete failed", { error: err })
    next(err)
  }
}

export default {
  getAdminStats,
  getOrders,
  updateOrderStatus,
  getProducts,
  getUsers,
  updateUserRole,
  getStories,
  getReviews,
  deleteReview
}
