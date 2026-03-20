import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      serviceId, 
      professionalId, 
      localId, 
      date, 
      time, 
      userData 
    } = body;

    if (!userData.email || !userData.name || !date || !time) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
    }

    // 1. Find or Create Patient (Usuario)
    let patient = await prisma.patient.findFirst({
      where: {
        OR: [
          { email: userData.email },
          { phone: userData.phone }
        ]
      }
    });

    if (!patient) {
      patient = await prisma.patient.create({
        data: {
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          status: 'Activo'
        }
      });
    }

    // 2. Prepare Date/Time
    // time is "HH:mm"
    const [hours, minutes] = time.split(':').map(Number);
    const appointmentDate = new Date(date);
    appointmentDate.setHours(hours, minutes, 0, 0);

    const endTime = new Date(appointmentDate);
    // Default duration from service or 60 min
    let duration = 60;
    if (serviceId) {
      const service = await prisma.service.findUnique({ where: { id: serviceId } });
      if (service) duration = service.duration;
    }
    endTime.setMinutes(endTime.getMinutes() + duration);

    const startTimeStr = time;
    const endTimeStr = `${String(endTime.getHours()).padStart(2, '0')}:${String(endTime.getMinutes()).padStart(2, '0')}`;

    // 3. Create Appointment
    const appointment = await prisma.appointment.create({
      data: {
        date: new Date(date),
        startTime: startTimeStr,
        endTime: endTimeStr,
        type: professionalId ? 'Cita' : 'Reserva',
        status: 'PENDIENTE',
        notes: `Reserva web automática. Servicio: ${serviceId || 'No especificado'}`,
        patientId: patient.id,
        professionalId: professionalId || null,
        localId: localId || null,
      },
      include: {
        patient: true,
        professional: true,
        local: true
      }
    });

    return NextResponse.json({ 
      success: true, 
      appointment 
    });

  } catch (error) {
    console.error('Error in public booking API:', error);
    return NextResponse.json({ error: 'Error al procesar la reserva' }, { status: 500 });
  }
}
