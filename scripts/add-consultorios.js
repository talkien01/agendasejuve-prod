const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const local = await prisma.local.findFirst();
  if (!local) {
    console.error('No local found');
    return;
  }
  
  const consultorios = [
    { name: 'Consultorio 1', type: 'Consultorio' },
    { name: 'Consultorio 2', type: 'Consultorio' },
    { name: 'Consultorio 3', type: 'Consultorio' },
    { name: 'Consultorio 4', type: 'Consultorio' }
  ];

  for (const item of consultorios) {
    const existing = await prisma.resource.findFirst({
      where: { name: item.name, localId: local.id }
    });
    
    if (!existing) {
      await prisma.resource.create({
        data: { 
          name: item.name, 
          type: item.type, 
          localId: local.id 
        }
      });
      console.log(`Created ${item.name}`);
    } else {
      console.log(`${item.name} already exists`);
    }
  }
  console.log('Consultorios updated');
}

main().catch(console.error).finally(() => prisma.$disconnect());
