import passport from "passport"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import { Strategy as FacebookStrategy } from "passport-facebook"

import prisma from "./prisma.js"
import logger from "./logger.js"
import { customAlphabet } from "nanoid"

const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 8)

/* =============================
   GOOGLE STRATEGY
============================= */

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback"
      },

      async (accessToken, refreshToken, profile, done) => {

        try {

          const email = profile.emails?.[0]?.value

          if (!email) {
            return done(new Error("Google account has no email"), null)
          }

          let user = await prisma.user.findUnique({
            where: { email }
          })
          
          const fullName = profile.displayName || `${profile.name?.givenName || ""} ${profile.name?.familyName || ""}`.trim() || email.split("@")[0]

          if (!user) {
            // Auto create account
            user = await prisma.user.create({
              data: {
                email,
                name: fullName,
                provider: "google",
                emailVerified: true,
                role: "customer",
                luckyPoints: 0,
                // referralCode: `DSE-${nanoid()}`
              }
            })
            logger.info(`Auto-created user from Google: ${email}`)
          }

          return done(null, user)

        } catch (err) {

          logger.error("GOOGLE OAUTH ERROR:", err)
          return done(err, null)

        }

      }
    )
  )

} else {

  logger.warn("Google OAuth disabled: missing credentials")

}



/* =============================
   SESSION HANDLING
============================= */

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (id, done) => {

  try {

    const user = await prisma.user.findUnique({
      where: { id }
    })

    done(null, user)

  } catch (err) {

    done(err, null)

  }

})

export default passport