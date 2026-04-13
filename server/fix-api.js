import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
dotenv.config()

const prisma = new PrismaClient()

async function main() {
  console.log("Checking DB connection...")
  try {
    const products = await prisma.product.findMany({
      take: 5,
      select: { id: true, name: true, isBestseller: true }
    })
    console.log("Products found in DB:", products.length)
    console.log("Sample:", products)
  } catch (err) {
    console.error("DB Error:", err.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
