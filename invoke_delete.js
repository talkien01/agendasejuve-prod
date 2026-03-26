const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDelete() {
  try {
    // Buscar una cita para eliminar
    const appointment = await prisma.appointment.findFirst({
      orderBy: { createdAt: 'desc' },
      include: { notifications: true, clinicalRecord: true }
    });

    if (!appointment) {
      console.log('No hay citas en la base de datos para borrar.');
      return;
    }

    console.log('\n--- CITA A ELIMINAR ---');
    console.log('ID:', appointment.id);
    console.log('Paciente ID:', appointment.patientId);
    console.log('Notificaciones asociadas:', appointment.notifications.length);
    console.log('Historia Clínica asociada:', appointment.clinicalRecord ? 'Sí' : 'No');

    console.log('\n--- INVOCANDO API DE BORRADO ---');
    const response = await fetch(`http://localhost:3000/api/appointments/${appointment.id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });

    const status = response.status;
    let data;
    try {
      data = await response.json();
    } catch(e) {
      data = await response.text();
    }

    console.log('Status HTTP:', status);
    console.log('Respuesta:', data);

    console.log('\n--- VERIFICANDO BD ---');
    const check = await prisma.appointment.findUnique({ where: { id: appointment.id }});
    if (check) {
      console.log('FALLO: La cita AÚN EXISTE en la base de datos.');
    } else {
      console.log('ÉXITO: La cita fue borrada de la base de datos de Prisma.');
    }

  } catch (err) {
    console.error('Error durante el script de prueba:', err);
  } finally {
    await prisma.$disconnect();
  }
}

testDelete();
