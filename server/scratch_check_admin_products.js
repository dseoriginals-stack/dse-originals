import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function getProducts() {
  const products = await prisma.product.findMany({
    where: {
      status: { not: "archived" }
    },
    include: {
      variants: true,
      images: { take: 1 }
    },
    orderBy: {
      createdAt: "desc"
    }
  })
  return products
}

async function main() {
  const data = await getProducts()
  console.log('--- ADMIN PRODUCTS DATA ---')
  console.log(JSON.stringify(data, null, 2))
  console.log('\nTOTAL:', data.length)
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
