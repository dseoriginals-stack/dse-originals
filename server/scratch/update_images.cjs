
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Update Heaven's Embrace 30ml
  const v1 = await prisma.productVariant.update({
    where: { id: 'ec931720-e686-4b1c-aeb3-829c263f9d88' },
    data: { image: 'heavens_embrace_30ml.jpg' }
  });
  console.log(`Updated Heaven's Embrace 30ml: ${v1.image}`);

  // Update Sacred Serenity 30ml
  const v2 = await prisma.productVariant.update({
    where: { id: 'ec6403da-46e2-4df0-b97d-4effd327e3a5' },
    data: { image: 'sacred_serenity_30ml.jpg' }
  });
  console.log(`Updated Sacred Serenity 30ml: ${v2.image}`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
