import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function check() {
  try {
    const products = await prisma.product.findMany({
      where: { name: { contains: 'SACRED SERENITY', mode: 'insensitive' } },
      include: { 
        images: true,
        variants: {
          include: { attributes: true }
        }
      }
    })
    console.log(JSON.stringify(products, null, 2))
  } catch (err) {
    console.error(err)
  } finally {
    await prisma.$disconnect()
  }
}

check()
