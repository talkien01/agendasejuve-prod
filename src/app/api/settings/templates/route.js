import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request) {
  let session;
  try {
    session = await getSession();
  } catch (e) {
    // JWT expired or invalid - treat as unauthenticated
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get('all') === 'true';

    const templates = await prisma.clinicalTemplate.findMany({
      where: showAll ? {} : { isActive: true },
      include: { services: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(templates);
  } catch (error) {
    console.error('[templates GET] Error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch templates', details: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, description, fields, serviceIds = [] } = body;

    if (!name || !fields) {
      return NextResponse.json({ error: 'Nombre y campos son obligatorios' }, { status: 400 });
    }

    const template = await prisma.clinicalTemplate.upsert({
      where: { id: id || 'new-template' },
      update: {
        name,
        description,
        fields,
        isActive: true,
        services: {
          set: serviceIds.map(sId => ({ id: sId }))
        }
      },
      create: {
        name,
        description,
        fields,
        services: {
          connect: serviceIds.map(sId => ({ id: sId }))
        }
      },
      include: { services: true }
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error('Upsert template error:', error);
    return NextResponse.json({ error: 'Failed to save template' }, { status: 500 });
  }
}

// PATCH /api/settings/templates?id=xxx  → Restore (unarchive) a template
export async function PATCH(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID de plantilla requerido' }, { status: 400 });
    }

    await prisma.clinicalTemplate.update({
      where: { id },
      data: { isActive: true }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Restore template error:', error);
    return NextResponse.json({ error: 'Failed to restore template' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID de plantilla requerido' }, { status: 400 });
    }

    // Soft delete
    await prisma.clinicalTemplate.update({
      where: { id },
      data: { isActive: false, services: { set: [] } }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete template error:', error);
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
  }
}


