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

export async function GET(req, { params }) {
  const user = await isAuthenticated(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const { id } = await params;
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        appointments: {
          orderBy: { date: 'desc' },
          take: 1
        }
      }
    });
    if (!patient) return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    return NextResponse.json(patient);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch patient' }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  const user = await isAuthenticated(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();
    const patient = await prisma.patient.update({
      where: { id },
      data: {
        name: body.name,
        email: body.email || null,
        phone: body.phone || null,
        identifier: body.identifier || null,
        status: body.status,
      },
    });
    return NextResponse.json(patient);
  } catch (error) {
    console.error('UPDATE PATIENT ERROR:', error);
    return NextResponse.json({ error: 'Failed to update patient' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const user = await isAuthenticated(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const { id } = await params;
    await prisma.patient.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete patient' }, { status: 500 });
  }
}
