import logger from "../config/logger.js"

export default function errorHandler(err, req, res, next) {
  logger.error("API Error", { 
    message: err.message, 
    path: req.path,
    method: req.method
  })

  let status = err.status || 500
  let message = err.message || "Something went wrong"

  // 🛡 PRISMA ERROR MAPPING
  if (err.code === "P2002") {
    status = 409
    const target = err.meta?.target || "field"
    message = `A record with this ${target} already exists.`
  }

  if (err.code === "P2025") {
    status = 404
    message = "The requested record was not found."
  }

  // 🛡 JWT ERROR MAPPING
  if (err.name === "TokenExpiredError") {
    status = 401
    message = "Your session has expired. Please log in again."
  }

  if (err.name === "JsonWebTokenError") {
    status = 401
    message = "Invalid or tampered session token."
  }

  // 🛡 VALIDATION ERROR MAPPING
  if (err.name === "ValidationError" || Array.isArray(err.errors)) {
    status = 400
    message = "Data validation failed."
  }

  res.status(status).json({
    success: false,
    message: message,
    code: err.code || err.name,
    errors: err.errors,
    debug: {
      stack: err.stack,
      fullError: err
    }
  })
}