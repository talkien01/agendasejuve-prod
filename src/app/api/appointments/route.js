import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession, hasRole } from '@/lib/auth';

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
      const date = new Date(dateStr);
      date.setHours(0, 0, 0, 0);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
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
    const role = session.role;

    // RBAC: Creation guards
    if (role === 'PSICOLOGIA') {
      if (body.type === 'Reserva') {
        const res = await prisma.resource.findUnique({ where: { id: body.resourceId } });
        if (res?.type !== 'Consultorio') {
          return NextResponse.json({ error: 'Unauthorized to reserve this resource' }, { status: 403 });
        }
      }
    } else if (role === 'RECURSOS') {
      if (body.type === 'Cita') {
        return NextResponse.json({ error: 'Unauthorized to create professional appointments' }, { status: 403 });
      }
      const res = await prisma.resource.findUnique({ where: { id: body.resourceId } });
      if (res?.type === 'Consultorio') {
        return NextResponse.json({ error: 'Unauthorized to reserve consultorios' }, { status: 403 });
      }
    }

    const appointment = await prisma.appointment.create({
      data: {
        date: new Date(body.date),
        startTime: body.startTime,
        endTime: body.endTime,
        type: body.type,
        status: body.status || 'PENDIENTE',
        notes: body.notes,
        patientId: body.patientId,
        professionalId: body.professionalId || null,
        resourceId: body.resourceId || null,
        localId: body.localId || null,
      },
      include: {
        patient: true,
        resource: true,
        professional: true,
      }
    });
    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Create appointment error:', error);
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
  }
}
