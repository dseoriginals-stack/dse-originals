import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const allProducts = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      status: true,
      _count: {
        select: { variants: true }
      }
    }
  })
  console.log('Total Products:', allProducts.length)
  console.log('Products:', JSON.stringify(allProducts, null, 2))
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
