const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.resource.deleteMany({
    where: { name: 'Cabina de TB' }
  });
  console.log(`Deleted ${result.count} resources named 'Cabina de TB'`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
