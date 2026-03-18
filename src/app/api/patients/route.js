import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';

async function isAuthenticated(req) {
  try {
    const session = await getSession();
    return session ? session : false;
  } catch (error) {
    return false;
  }
}

export async function GET(req) {
  const user = await isAuthenticated(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

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

export async function POST(req) {
  const user = await isAuthenticated(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const body = await req.json();
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
    console.error('CREATE PATIENT ERROR:', error);
    return NextResponse.json({ error: 'Failed to create patient' }, { status: 500 });
  }
}
