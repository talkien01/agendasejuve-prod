import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession, hasRole } from '@/lib/auth';
import { sendAppointmentConfirmation } from '@/lib/notifications';
import crypto from 'crypto';

export async function GET(request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const role = session.role;

    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');
    const professionalId = searchParams.get('professionalId');
    const resourceId = searchParams.get('resourceId');
    const localId = searchParams.get('localId');
    const status = searchParams.get('status');

    let where = {};
    
    // RBAC: Professional/Resource filtering
    if (role === 'PSICOLOGIA') {
      where.AND = [
        {
          OR: [
            { professionalId: { not: null } },
            { resource: { type: 'Consultorio' } }
          ]
        }
      ];
    } else if (role === 'RECURSOS') {
      where.professionalId = null;
      where.resource = { type: { not: 'Consultorio' } };
    }

    if (dateStr) {
      const [year, month, day] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day, 0, 0, 0);
      const nextDay = new Date(year, month - 1, day + 1, 0, 0, 0);
      where.date = { gte: date, lt: nextDay };
    }

    if (professionalId && professionalId !== 'all' && professionalId !== '') {
      where.professionalId = professionalId;
    }
    if (resourceId && resourceId !== 'all' && resourceId !== '') {
      where.resourceId = resourceId;
    }
    if (localId && localId !== 'all' && localId !== '') {
      where.localId = localId;
    }
    if (status && status !== 'TODAS' && status !== '') {
      if (status === 'ACTIVAS') {
        where.status = { in: ['CONFIRMADA', 'PENDIENTE', 'ASISTIDA'] };
      } else {
        where.status = status;
      }
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: true,
        resource: true,
        professional: true,
      },
      orderBy: { startTime: 'asc' },
    });
    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Fetch appointments error:', error);
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    console.log('--- POST /api/appointments START ---');
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));
    const role = session.role;
    console.log('Session role:', role);

    // RBAC: Creation guards
    console.log('Checking RBAC guards...');
    if (role === 'PSICOLOGIA') {
      if (body.type === 'Reserva') {
        console.log('Type is Reserva, checking resource type...');
        const res = await prisma.resource.findUnique({ where: { id: body.resourceId } });
        if (res?.type !== 'Consultorio') {
          console.log('RBAC: Unauthorized resource type');
          return NextResponse.json({ error: 'Unauthorized to reserve this resource' }, { status: 403 });
        }
      }
    } else if (role === 'RECURSOS') {
      if (body.type === 'Cita') {
        console.log('RBAC: Unauthorized type Cita for RECURSOS');
        return NextResponse.json({ error: 'Unauthorized to create professional appointments' }, { status: 403 });
      }
      const res = await prisma.resource.findUnique({ where: { id: body.resourceId } });
      if (res?.type === 'Consultorio') {
        console.log('RBAC: Unauthorized consultorio for RECURSOS');
        return NextResponse.json({ error: 'Unauthorized to reserve consultorios' }, { status: 403 });
      }
    }

    console.log('Parsing date:', body.date);
    const [y, m, d] = body.date.split('-').map(Number);
    const isRecurring = body.isRecurring === true;
    const count = isRecurring ? Math.min(parseInt(body.recurrenceCount) || 1, 12) : 1;
    const recurrenceId = isRecurring ? crypto.randomUUID() : null;
    
    console.log(`Plan: count=${count}, isRecurring=${isRecurring}, recurrenceId=${recurrenceId}`);
    
    const createdAppointments = [];

    for (let i = 0; i < count; i++) {
      console.log(`Processing instance ${i}...`);
      const instanceDate = new Date(y, m - 1, d + (i * 7), 0, 0, 0);
      console.log(`Instance ${i} date:`, instanceDate.toISOString());
      
      try {
        const appointmentData = {
          date: instanceDate,
          startTime: body.startTime,
          endTime: body.endTime,
          type: body.type,
          status: body.status || 'PENDIENTE',
          notes: body.notes,
          patientId: body.patientId,
          professionalId: body.professionalId || null,
          resourceId: body.resourceId || null,
          localId: body.localId || null,
          recurrenceId: recurrenceId,
        };
        console.log(`Instance ${i} creating in DB with:`, JSON.stringify(appointmentData, null, 2));

        const appointment = await prisma.appointment.create({
          data: appointmentData,
          include: {
            patient: true,
            resource: true,
            professional: true,
          }
        });
        
        console.log(`Instance ${i} created successfully with ID:`, appointment.id);
        createdAppointments.push(appointment);

        // Trigger notification ONLY for the first one to avoid spam
        if (i === 0) {
          console.log(`Instance ${i} triggering notification...`);
          sendAppointmentConfirmation(appointment.id).catch(err => {
            console.error('Error triggering notification:', err);
          });
        }
      } catch (innerError) {
        console.error(`Error creating instance ${i}:`, innerError);
        throw innerError;
      }
    }

    console.log('--- POST /api/appointments END SUCCESS ---');
    return NextResponse.json(createdAppointments[0]);
  } catch (error) {
    console.error('--- POST /api/appointments ERROR ---');
    console.error(error);
    return NextResponse.json({ 
        error: 'Failed to create appointment', 
        details: error.message,
        stack: error.stack
    }, { status: 500 });
  }
}
