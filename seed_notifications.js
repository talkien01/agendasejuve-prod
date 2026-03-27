const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const templates = [
    {
      key: 'ntfy_confirmation_msg',
      value: '¡Hola {{patientName}}! 👋\n\nTu cita ha sido confirmada:\n📅 Fecha: {{date}}\n⏰ Hora: {{time}}\n📍 Lugar: {{place}}\n\nTe esperamos. Si necesitas cancelar, por favor avísanos con tiempo.'
    },
    {
      key: 'ntfy_reminder_msg',
      value: '¡Hola {{patientName}}! 👋\n\nSolo pasamos a recordarte tu cita para mañana:\n📅 Fecha: {{date}}\n⏰ Hora: {{time}}\n📍 Lugar: {{place}}\n\n¡Te esperamos!'
    },
    {
      key: 'ntfy_thankyou_msg',
      value: '¡Hola {{patientName}}! 👋\n\nGracias por asistir a tu cita hoy en SEJUVE. Esperamos que te hayas sentido muy bien.\n\n¡Que tengas un excelente día!'
    },
    {
      key: 'ntfy_noshow_msg',
      value: '¡Hola {{patientName}}! 👋\n\nTe extrañamos en tu cita de hoy. Si no pudiste asistir, no te preocupes, puedes reagendar una nueva fecha aquí: {{link}}'
    }
  ];

  for (const t of templates) {
    await prisma.config.upsert({
      where: { key: t.key },
      update: { value: t.value },
      create: t,
    });
  }

  console.log('Notification templates seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
