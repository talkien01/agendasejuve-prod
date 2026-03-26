const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function run() {
  try {
    const appointment = await prisma.appointment.findFirst({
      orderBy: { createdAt: 'desc' },
      include: { notifications: true, clinicalRecord: true }
    });
    fs.writeFileSync('c:/tmp/prisma_res.json', JSON.stringify(appointment, null, 2));
    console.log("OK");
  } catch (e) {
    fs.writeFileSync('c:/tmp/prisma_res.json', JSON.stringify({ error: e.message, code: e.code, stack: e.stack }, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}
run();
