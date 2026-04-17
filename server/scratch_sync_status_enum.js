
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log("Synchronizing OrderStatus enum with 'initialized' and 'cancelled'...")
  
  const values = ['initialized', 'cancelled']
  for (const v of values) {
    try {
      await prisma.$executeRawUnsafe(`ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS '${v}'`)
      console.log(`Success: Added ${v}`)
    } catch (err) {
      console.log(`Skipped ${v} (likely already exists)`)
    }
  }

  console.log("Database patch completed.")
}

main().catch(console.error).finally(() => prisma.$disconnect())
