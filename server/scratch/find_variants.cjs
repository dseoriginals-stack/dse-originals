
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    where: {
      name: {
        contains: 'Serenity',
        mode: 'insensitive'
      }
    },
    include: {
      variants: {
        include: {
          attributes: true
        }
      }
    }
  });

  console.log(JSON.stringify(products, null, 2));

  const products2 = await prisma.product.findMany({
    where: {
      name: {
        contains: 'Embrace',
        mode: 'insensitive'
      }
    },
    include: {
      variants: {
        include: {
          attributes: true
        }
      }
    }
  });

  console.log(JSON.stringify(products2, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
