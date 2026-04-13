import prisma from "./src/config/prisma.js"

async function debug() {
  console.log("Prisma Models:", Object.keys(prisma).filter(k => !k.startsWith("_")))
  process.exit(0)
}

debug()
