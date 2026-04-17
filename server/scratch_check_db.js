import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const allProducts = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      status: true
    }
  })
  
  console.log('--- ALL PRODUCTS ---')
  console.log(JSON.stringify(allProducts, null, 2))
  
  const activeProducts = await prisma.product.findMany({
    where: { status: 'active' }
  })
  console.log('\n--- ACTIVE PRODUCTS ---')
  console.log(activeProducts.length)

  const notArchivedProducts = await prisma.product.findMany({
    where: { status: { not: 'archived' } }
  })
  console.log('\n--- NOT ARCHIVED PRODUCTS ---')
  console.log(notArchivedProducts.length)
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
