import prisma from "../config/prisma.js"

/**
 * Standardized utility to log staff and admin activities.
 * This provides a full audit trail for store management.
 */
export async function logActivity({ userId, action, entity, entityId, details, req }) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        entity,
        entityId: entityId?.toString(),
        details: details ? (typeof details === "object" ? JSON.stringify(details) : details) : null,
        ip: req?.ip || req?.headers["x-forwarded-for"] || null,
        userAgent: req?.headers["user-agent"] || null,
      },
    })
  } catch (err) {
    console.error(`[ActivityLog Error] Failed to log action ${action}:`, err)
    // We don't throw to prevent blocking the main operation
  }
}
