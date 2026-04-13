const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.user.update({
    where: { email: 'icalina.jobert@dnsc.edu.ph' },
    data: { role: 'admin' }
  });
  console.log('User promoted: icalina.jobert@dnsc.edu.ph');

  await prisma.user.update({
      where: { email: 'joberticalina604@gmail.com' },
      data: { role: 'admin' }
    });
    console.log('User promoted: joberticalina604@gmail.com');
}
main().catch(console.error).finally(() => prisma.$disconnect());
