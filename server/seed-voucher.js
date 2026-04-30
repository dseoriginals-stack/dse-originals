import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const existing = await prisma.voucher.findUnique({
    where: { code: 'WELCOME100' }
  })

  if (!existing) {
    await prisma.voucher.create({
      data: {
        code: 'WELCOME100',
        discount: 100,
        minSpend: 500,
        isActive: true,
      }
    })
    console.log('Test voucher WELCOME100 created (₱100 off, min spend ₱500)')
  } else {
    console.log('Test voucher WELCOME100 already exists')
  }

  const existing2 = await prisma.voucher.findUnique({
    where: { code: 'DSE500' }
  })

  if (!existing2) {
    await prisma.voucher.create({
      data: {
        code: 'DSE500',
        discount: 500,
        minSpend: 2000,
        isActive: true,
      }
    })
    console.log('Test voucher DSE500 created (₱500 off, min spend ₱2000)')
  } else {
    console.log('Test voucher DSE500 already exists')
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
