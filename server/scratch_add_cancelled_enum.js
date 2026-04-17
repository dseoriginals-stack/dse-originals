
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log("Adding 'cancelled' to OrderStatus enum...")
  
  try {
    await prisma.$executeRawUnsafe(`ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'cancelled'`)
    console.log("Success")
  } catch (err) {
    console.log("Skipped/Failed (Enum might already have it):", err.message)
  }

  console.log("Database patch completed.")
}

main().catch(console.error).finally(() => prisma.$disconnect())
