const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.user.update({
    where: { email: 'joberticalina604@gmail.com' },
    data: { role: 'admin' }
  });
  console.log('User promoted');
}
main().catch(console.error).finally(() => prisma.$disconnect());
