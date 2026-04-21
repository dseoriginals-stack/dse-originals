
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkEnum() {
  try {
    const result = await prisma.$queryRaw`
      SELECT enumlabel 
      FROM pg_enum 
      JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
      WHERE pg_type.typname = 'OrderStatus';
    `;
    console.log('Database OrderStatus Enum values:');
    console.log(result.map(r => r.enumlabel));
  } catch (err) {
    console.error('Failed to query raw enum:', err);
  } finally {
    await prisma.$disconnect();
  }
}

checkEnum();
