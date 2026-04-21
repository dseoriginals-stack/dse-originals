
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('--- WEBSITE PROCESS DIAGNOSTICS ---');

  // 1. Order Statuses (Raw SQL to avoid Enum validation issues in Client)
  try {
    const statusCounts = await prisma.$queryRaw`
      SELECT status::text, COUNT(*) as count 
      FROM "Order" 
      GROUP BY status
    `;
    console.log('\nOrder Status Summary:');
    statusCounts.forEach(s => console.log(`- ${s.status}: ${s.count}`));
  } catch (err) {
    console.error('Failed to query Order statuses:', err.message);
  }

  // 2. Stuck / In-Progress Orders
  try {
    const stuck = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Order" 
      WHERE status::text = 'initialized' 
      AND "createdAt" < NOW() - INTERVAL '1 hour'
    `;
    console.log(`\nStuck "initialized" orders (>1h old): ${stuck[0].count}`);

    const unpaid = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Order" 
      WHERE status::text = 'paid' AND "approvedAt" IS NULL
    `;
    console.log(`Paid orders awaiting Approval: ${unpaid[0].count}`);
  } catch (err) {
    console.error('Failed to query stuck orders:', err.message);
  }

  // 3. Inventory Reservations
  try {
    const resStats = await prisma.$queryRaw`
      SELECT status::text, COUNT(*) as count 
      FROM "InventoryReservation" 
      GROUP BY status
    `;
    console.log('\nInventory Reservations:');
    resStats.forEach(s => console.log(`- ${s.status}: ${s.count}`));

    const expired = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "InventoryReservation" 
      WHERE status::text = 'reserved' AND "expiresAt" < NOW()
    `;
    console.log(`Expired but unreleased reservations: ${expired[0].count}`);
  } catch (err) {
    console.error('Failed to query reservations:', err.message);
  }

  // 4. Webhook Connectivity
  try {
    const recentWebhooks = await prisma.webhookEvent.count({
      where: { createdAt: { gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
    });
    console.log(`\nWebhook events received in last 24h: ${recentWebhooks}`);
  } catch (err) {
    console.error('Failed to query webhooks:', err.message);
  }

  // 5. Worker Status Suspicions
  console.log('\nBackground Jobs Check:');
  console.log('- BullMQ workers (email, inventory) do NOT appear to be running based on process list.');
  console.log('- If expired reservations or emails are not processing, start them with "npm run worker" and "npm run worker:inventory".');

  console.log('\n--- DIAGNOSTICS COMPLETE ---');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
