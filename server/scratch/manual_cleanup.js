
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function manualCleanup() {
  console.log('--- STARTING MANUAL STOCK RECOVERY ---');

  const expired = await prisma.inventoryReservation.findMany({
    where: {
      status: 'reserved',
      expiresAt: { lt: new Date() }
    }
  });

  if (expired.length === 0) {
    console.log('No expired reservations found.');
  } else {
    console.log(`Found ${expired.length} expired reservations. Releasing...`);

    await prisma.$transaction(async (tx) => {
      for (const res of expired) {
        await tx.productVariant.update({
          where: { id: res.variantId },
          data: { stock: { increment: res.quantity } }
        });

        await tx.inventoryReservation.update({
          where: { id: res.id },
          data: { status: 'expired' }
        });
        console.log(`  - Released ${res.quantity} units for variant ${res.variantId}`);
      }
    });
    console.log('Stock recovery complete.');
  }

  const oldOrders = await prisma.order.deleteMany({
    where: {
      status: 'initialized',
      createdAt: { lt: new Date(Date.now() - 60 * 60 * 1000) }
    }
  });
  console.log(`Deleted ${oldOrders.count} old abandoned orders.`);

  console.log('--- MANUAL CLEANUP COMPLETE ---');
}

manualCleanup()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
