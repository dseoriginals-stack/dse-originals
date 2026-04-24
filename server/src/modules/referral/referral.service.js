import prisma from "../../config/prisma.js"
// import { customAlphabet } from "nanoid"

// const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 8)

/**
 * Generates a unique referral code for a user.
 * (STUBBED DUE TO DB SYNC ISSUE)
 */
export async function generateReferralCode(userId) {
  /*
  const code = `DSE-${nanoid()}`
  
  await prisma.user.update({
    where: { id: userId },
    data: { referralCode: code }
  })
  
  return code
  */
  return null
}

/**
 * Handles the logic for when a new user signs up with a referral code.
 * (STUBBED DUE TO DB SYNC ISSUE)
 */
export async function processReferralSignup(newUserId, referralCode) {
  return
}

/**
 * Rewards both parties when the referee makes their first purchase.
 * (STUBBED DUE TO DB SYNC ISSUE)
 */
export async function rewardReferral(orderId) {
  return
}
