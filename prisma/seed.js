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
  await prisma.resource.deleteMany({});
  const resources = [
    { name: 'Consultorio 1', type: 'Consultorio', localId: local.id, status: 'Activo' },
    { name: 'Consultorio 2', type: 'Consultorio', localId: local.id, status: 'Activo' },
    { name: 'Consultorio 3', type: 'Consultorio', localId: local.id, status: 'Activo' },
    { name: 'Consultorio 4', type: 'Consultorio', localId: local.id, status: 'Activo' },
    { name: 'Auditorio Principal', type: 'Auditorio', localId: local.id, status: 'Activo' },
    { name: 'Sala de Juntas A', type: 'Sala', localId: local.id, status: 'Activo' },
    { name: 'Cabina de Audio', type: 'Cabina', localId: local.id, status: 'Activo' },
    { name: 'Cabina de TV', type: 'Cabina', localId: local.id, status: 'Activo' },
  ];

  for (const r of resources) {
    const existing = await prisma.resource.findFirst({ where: { name: r.name, localId: local.id } });
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

  // 6. Create Default Users
  const adminEmail = 'admin@sejuve.com';
  const psicEmail = 'psicologia@sejuve.com';
  const recEmail = 'recursos@sejuve.com';
  const defaultPassword = 'admin123';
  const passwordHash = await require('bcryptjs').hash(defaultPassword, 10);
  
  // Admin
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { password: passwordHash, name: 'Jose Luis Admin' },
    create: { email: adminEmail, password: passwordHash, name: 'Jose Luis Admin', role: 'ADMIN' },
  });

  // Psicología
  await prisma.user.upsert({
    where: { email: psicEmail },
    update: { password: passwordHash, name: 'Area Psicología' },
    create: { email: psicEmail, password: passwordHash, name: 'Area Psicología', role: 'PSICOLOGIA' },
  });

  // Recursos
  await prisma.user.upsert({
    where: { email: recEmail },
    update: { password: passwordHash, name: 'Area Recursos' },
    create: { email: recEmail, password: passwordHash, name: 'Area Recursos', role: 'RECURSOS' },
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
