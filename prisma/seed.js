require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Start seeding...');

  // 0. Create Locales
  const local = await prisma.local.upsert({
    where: { id: 'sede-centro' },
    update: {},
    create: {
      id: 'sede-centro',
      name: 'Secretaría de la Juventud',
      address: 'Blvd. Bernardo Quintana Arrioja, Arboledas, Santiago de Querétaro, Qro., México',
      phone: '524422242254',
    },
  });

  // 1. Create Services
  const services = [
    { id: 'ser-terapia-online', name: 'Terapia online', duration: 60, price: 0, category: 'General' },
    { id: 'ser-terapia-presencial', name: 'Terapia presencial', duration: 60, price: 0, category: 'General' },
    { id: 'ser-valoracion-inicial', name: 'Valoración Inicial', duration: 60, price: 0, category: 'General' },
  ];

  for (const s of services) {
    await prisma.service.upsert({
      where: { id: s.id },
      update: s,
      create: s,
    });
  }

  // 2. Create Professionals
  const pros = [
    { name: 'Dr. Jose Luis', specialty: 'Médico General', localId: local.id },
    { name: 'Dra. Elena', specialty: 'Psicología', localId: local.id },
    { name: 'Lic. Rodrigo', specialty: 'Nutrición', localId: local.id },
  ];

  for (const pro of pros) {
    await prisma.professional.upsert({
      where: { id: `pro-${pro.name.replace(/\s+/g, '-')}` },
      update: pro,
      create: { ...pro, id: `pro-${pro.name.replace(/\s+/g, '-')}` },
    });
  }

  // 3. Create Patients
  const patients = [
    { name: 'Juan Pérez', email: 'juan.perez@email.com', phone: '+52 5512345678', identifier: 'PERJ880101HXXXXX01', status: 'Activo' },
    { name: 'María García', email: 'm.garcia@email.com', phone: '+52 5598765432', identifier: 'GARM900505MXXXXX02', status: 'Inactivo' },
  ];

  for (const p of patients) {
    await prisma.patient.upsert({
      where: { identifier: p.identifier },
      update: p,
      create: p,
    });
  }

  // 4. Create Resources
  const resources = [
    { name: 'Auditorio Principal', type: 'Auditorio', localId: local.id, status: 'Activo', services: 'Conferencia, Taller' },
    { name: 'Sala de Juntas A', type: 'Sala', localId: local.id, status: 'Activo', services: 'Reunión, Entrevista' },
  ];

  for (const r of resources) {
    const existing = await prisma.resource.findFirst({ where: { name: r.name } });
    if (!existing) {
      await prisma.resource.create({ data: r });
    }
  }

  // 5. Create Config
  await prisma.config.upsert({
    where: { key: 'app_name' },
    update: { value: 'SEJUVE Citas' },
    create: { key: 'app_name', value: 'SEJUVE Citas' },
  });

  // 6. Create Default User
  const adminEmail = 'admin@sejuve.com';
  const adminPasswordHash = '$2b$10$gfz0LAhkOykSj0y6pNvJyuL4XjGGfST.IJb5COddxb9TeeqibQYeLa'; // admin123
  
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: adminPasswordHash,
      name: 'Jose Luis',
    },
    create: {
      email: adminEmail,
      password: adminPasswordHash,
      name: 'Jose Luis',
      role: 'ADMIN',
    },
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
