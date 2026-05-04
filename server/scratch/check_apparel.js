import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  try {
    const products = await prisma.product.findMany({
      where: { name: { contains: 'HOPE' } },
      include: {
        variants: {
          include: { attributes: true }
        }
      }
    })
    console.log(JSON.stringify(products, null, 2))
  } catch (err) {
    console.error('Check failed:', err)
  } finally {
    await prisma.$disconnect()
  }
}

main()
