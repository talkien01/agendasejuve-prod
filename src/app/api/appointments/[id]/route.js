export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: { patient: true, resource: true },
    });
    if (!appointment) return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    return NextResponse.json(appointment);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch appointment' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const body = await request.json();
    const appointment = await prisma.appointment.update({
      where: { id: params.id },
      data: {
        date: body.date ? new Date(body.date) : undefined,
        startTime: body.startTime,
        endTime: body.endTime,
        type: body.type,
        status: body.status,
        notes: body.notes,
        patientId: body.patientId,
        resourceId: body.resourceId,
      },
      include: { patient: true, resource: true },
    });
    return NextResponse.json(appointment);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await prisma.appointment.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete appointment' }, { status: 500 });
  }
}
