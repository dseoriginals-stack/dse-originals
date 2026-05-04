import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  try {
    const res = await prisma.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name = 'OrderItem' AND column_name = 'attributes'`
    console.log('OrderItem attributes column:', res)
    
    const res2 = await prisma.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name = 'CartItem' AND column_name = 'attributes'`
    console.log('CartItem attributes column:', res2)
  } catch (err) {
    console.error('Check failed:', err)
  } finally {
    await prisma.$disconnect()
  }
}

main()
