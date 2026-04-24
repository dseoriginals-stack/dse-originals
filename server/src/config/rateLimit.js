import rateLimit from "express-rate-limit"

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes"
  },
  standardHeaders: true,
  legacyHeaders: false,
})

export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 login/register attempts per hour
  message: {
    success: false,
    message: "Too many authentication attempts, please try again after an hour"
  },
  standardHeaders: true,
  legacyHeaders: false,
})

export const storyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 story submissions per hour
  message: {
    success: false,
    message: "Slow down! You can only share 5 stories per hour"
  },
  standardHeaders: true,
  legacyHeaders: false,
})
