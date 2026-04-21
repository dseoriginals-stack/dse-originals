
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

const prisma = new PrismaClient();

async function scanProcesses() {
  console.log('--- WEBSITE PROCESS SCAN ---');

  // 1. Order Status Counts
  const orderStats = await prisma.order.groupBy({
    by: ['status'],
    _count: { id: true }
  });
  console.log('\nOrder Status Counts:');
  orderStats.forEach(s => console.log(`- ${s.status}: ${s._count.id}`));

  // 2. Old "initialized" orders (Potential abandoned carts or failed transitions)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const stuckInitialized = await prisma.order.count({
    where: {
      status: 'initialized',
      createdAt: { lt: oneHourAgo }
    }
  });
  console.log(`\nStuck "initialized" orders (>1 hour old): ${stuckInitialized}`);

  // 3. Paid but not Approved/Shipped
  const unpaidProgressing = await prisma.order.count({
    where: {
      status: 'paid',
      approvedAt: null
    }
  });
  console.log(`Paid orders awaiting Approval: ${unpaidProgressing}`);

  // 4. Inventory Reservations
  const activeReservations = await prisma.inventoryReservation.count({
    where: { status: 'reserved' }
  });
  const expiredReservations = await prisma.inventoryReservation.count({
    where: {
      status: 'reserved',
      expiresAt: { lt: new Date() }
    }
  });
  console.log(`\nActive Reservations: ${activeReservations}`);
  console.log(`Expired Reservations (Stuck): ${expiredReservations}`);

  // 5. Redis Check
  console.log('\nChecking Redis connection...');
  const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
    maxRetriesPerRequest: 1,
    retryStrategy: () => null
  });

  try {
    const ping = await redis.ping();
    console.log(`Redis Ping: ${ping}`);
  } catch (err) {
    console.log('Redis Status: UNAVAILABLE (Background jobs may be stuck)');
  } finally {
    redis.disconnect();
  }

  console.log('\n--- SCAN COMPLETE ---');
}

scanProcesses()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
