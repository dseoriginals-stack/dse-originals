import prisma from "../../config/prisma.js"
import { customAlphabet } from "nanoid"

const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 8)

/**
 * Generates a unique referral code for a user.
 * Format: DSE-XXXXXXX
 */
export async function generateReferralCode(userId) {
  const code = `DSE-${nanoid()}`
  
  await prisma.user.update({
    where: { id: userId },
    data: { referralCode: code }
  })
  
  return code
}

/**
 * Handles the logic for when a new user signs up with a referral code.
 */
export async function processReferralSignup(newUserId, referralCode) {
  if (!referralCode) return

  const referrer = await prisma.user.findUnique({
    where: { referralCode }
  })

  if (!referrer) return

  // Create the referral link
  await prisma.referral.create({
    data: {
      referrerId: referrer.id,
      refereeId: newUserId,
      status: "pending"
    }
  })

  // Update the new user's referredById
  await prisma.user.update({
    where: { id: newUserId },
    data: { referredById: referrer.id }
  })
}

/**
 * Rewards both parties when the referee makes their first purchase.
 * Reward: 50 Lucky Points each.
 */
export async function rewardReferral(orderId) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true }
  })

  if (!order || !order.userId) return

  const referral = await prisma.referral.findUnique({
    where: { refereeId: order.userId }
  })

  if (!referral || referral.status === "rewarded") return

  // Reward 50 points to both
  const REWARD_POINTS = 50

  await prisma.$transaction([
    // Update Referral status
    prisma.referral.update({
      where: { id: referral.id },
      data: {
        status: "rewarded",
        rewardType: "points",
        rewardValue: REWARD_POINTS
      }
    }),
    // Referrer reward
    prisma.user.update({
      where: { id: referral.referrerId },
      data: { 
        luckyPoints: { increment: REWARD_POINTS },
        lifetimePoints: { increment: REWARD_POINTS }
      }
    }),
    // Referee reward
    prisma.user.update({
      where: { id: referral.refereeId },
      data: { 
        luckyPoints: { increment: REWARD_POINTS },
        lifetimePoints: { increment: REWARD_POINTS }
      }
    })
  ])
}
