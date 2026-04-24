import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Checking Story table...')
    
    // Check if likes column exists by trying to select it
    try {
      await prisma.$queryRaw`SELECT likes FROM "Story" LIMIT 1`
      console.log('Column "likes" already exists.')
    } catch (e) {
      console.log('Column "likes" missing. Adding it...')
      await prisma.$executeRawUnsafe('ALTER TABLE "Story" ADD COLUMN IF NOT EXISTS "likes" INTEGER NOT NULL DEFAULT 0')
      console.log('Column "likes" added successfully.')
    }

  } catch (error) {
    console.error('Operation failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
