
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    where: {
      name: {
        in: ["Heaven's Embrace", "Sacred Serenity"],
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

  products.forEach(p => {
    console.log(`Product: ${p.name} (${p.id})`);
    p.variants.forEach(v => {
      const vol = v.attributes.find(a => a.name === 'Volume')?.value;
      console.log(`  - Variant: ${vol} (ID: ${v.id})`);
    });
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
