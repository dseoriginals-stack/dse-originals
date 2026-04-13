
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const activeCount = await prisma.product.count({ where: { status: 'active' } });
  console.log(`Active product count: ${activeCount}`);
  
  const allCount = await prisma.product.count();
  console.log(`Total product count: ${allCount}`);

  const activeProducts = await prisma.product.findMany({ 
    where: { status: 'active' },
    take: 5 
  });
  console.log('Active products:', JSON.stringify(activeProducts, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
