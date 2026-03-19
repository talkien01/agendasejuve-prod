export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');
    const professionalId = searchParams.get('professionalId');
    const resourceId = searchParams.get('resourceId');
    const localId = searchParams.get('localId');
    const status = searchParams.get('status');

    let where = {};
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
      // Logic for "ACTIVAS" (CONFIRMADA, PENDIENTE) vs others
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
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const appointment = await prisma.appointment.create({
      data: {
        date: new Date(body.date),
        startTime: body.startTime,
        endTime: body.endTime,
        type: body.type,
        status: body.status || 'PENDIENTE',
        notes: body.notes,
        patientId: body.patientId,
        professionalId: body.professionalId,
        resourceId: body.resourceId,
        localId: body.localId,
      },
    });
    return NextResponse.json(appointment);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
  }
}
