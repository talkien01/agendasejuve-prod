export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const patients = await prisma.patient.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(patients);
  } catch (error) {
    console.error('PATIENTS ERROR:', error.message, error.code, JSON.stringify(error.meta));
    return NextResponse.json({ error: 'Failed to fetch patients', detail: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const patient = await prisma.patient.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        identifier: body.identifier,
        status: body.status || 'Activo',
      },
    });
    return NextResponse.json(patient);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create patient' }, { status: 500 });
  }
}
