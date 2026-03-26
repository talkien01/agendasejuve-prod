import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const templates = await prisma.clinicalTemplate.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(templates);
  } catch (error) {
    console.error('Fetch templates error:', error);
    return NextResponse.json({ error: 'Failed to fetch templates', details: error.message, stack: error.stack }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, description, fields } = body;

    if (!name || !fields) {
      return NextResponse.json({ error: 'Nombre y campos son obligatorios' }, { status: 400 });
    }

    const template = await prisma.clinicalTemplate.upsert({
      where: { id: id || 'new-template' },
      update: {
        name,
        description,
        fields,
      },
      create: {
        name,
        description,
        fields,
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error('Upsert template error:', error);
    return NextResponse.json({ error: 'Failed to save template' }, { status: 500 });
  }
}
