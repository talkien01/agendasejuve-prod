import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { sendAppointmentReminder } from '@/lib/notifications';

export async function GET(request) {
  // En producción, esto debería estar protegido por un API Key secreto
  // const authHeader = request.headers.get('authorization');
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  // }

  try {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    // Formatear fechas para la consulta (depende de cómo guardes las fechas en DB)
    // El modelo suele usar DateTime, pero aquí buscamos las que son mañana
    const startOfTomorrow = new Date(tomorrow.setHours(0, 0, 0, 0));
    const endOfTomorrow = new Date(tomorrow.setHours(23, 59, 59, 999));

    const appointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: startOfTomorrow,
          lte: endOfTomorrow
        },
        status: { in: ['CONFIRMADA', 'PENDIENTE'] },
        reminderSent: false
      },
      include: {
        patient: true,
        professional: true,
        service: true
      }
    });

    const results = [];
    for (const appt of appointments) {
      const res = await sendAppointmentReminder(appt);
      
      // Marcar como enviado
      await prisma.appointment.update({
        where: { id: appt.id },
        data: { reminderSent: true }
      });
      
      results.push({
        id: appt.id,
        patient: appt.patient?.name,
        statuses: res
      });
    }

    return NextResponse.json({
      processed: appointments.length,
      details: results
    });

  } catch (error) {
    console.error('Error in reminders job:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
