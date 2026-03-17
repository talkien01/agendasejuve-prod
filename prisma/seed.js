require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 0. Create Professionals
  const pros = [
    { name: 'Dr. Jose Luis', specialty: 'Médico General' },
    { name: 'Dra. Elena', specialty: 'Psicología' },
    { name: 'Lic. Rodrigo', specialty: 'Nutrición' },
  ];

  for (const pro of pros) {
    await prisma.professional.upsert({
      where: { id: `pro-${pro.name.replace(/\s+/g, '-')}` },
      update: pro,
      create: { ...pro, id: `pro-${pro.name.replace(/\s+/g, '-')}` },
    });
  }

  // 1. Create Patients
  const patients = [
    { name: 'Juan Pérez', email: 'juan.perez@email.com', phone: '+52 5512345678', identifier: 'PERJ880101HXXXXX01', status: 'Activo' },
    { name: 'María García', email: 'm.garcia@email.com', phone: '+52 5598765432', identifier: 'GARM900505MXXXXX02', status: 'Inactivo' },
    { name: 'Carlos Ruiz', email: 'c.ruiz@email.com', phone: '+52 5524681357', identifier: 'RUIC850202HXXXXX03', status: 'Activo' },
    { name: 'Elena López', email: 'elena.l@email.com', phone: '+52 5536925814', identifier: 'LOPE920808MXXXXX04', status: 'Activo' },
    { name: 'Ricardo Sánchez', email: 'r.sanchez@email.com', phone: '+52 5574185296', identifier: 'SANR801212HXXXXX05', status: 'Pendiente' },
  ];

  for (const p of patients) {
    await prisma.patient.upsert({
      where: { identifier: p.identifier },
      update: p,
      create: p,
    });
  }

  // 2. Create Resources
  const resources = [
    { name: 'Auditorio Principal', type: 'Auditorio', location: 'Sede Centro', status: 'Activo', services: 'Conferencia, Taller' },
    { name: 'Sala de Juntas A', type: 'Sala', location: 'Sede Centro', status: 'Activo', services: 'Reunión, Entrevista' },
    { name: 'Cabina de Audio 1', type: 'Cabina', location: 'Sede Norte', status: 'Mantenimiento', services: 'Grabación' },
    { name: 'Cabina de TV', type: 'Cabina', location: 'Sede Norte', status: 'Activo', services: 'Streaming, Grabación' },
  ];

  for (const r of resources) {
    await prisma.resource.create({
      data: r,
    });
  }

  // 3. Create Config
  await prisma.config.upsert({
    where: { key: 'app_name' },
    update: { value: 'SEJUVE Citas' },
    create: { key: 'app_name', value: 'SEJUVE Citas' },
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
  });
