import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession, hasRole } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const role = session.role;

    let where = {};
    if (role === 'PSICOLOGIA') {
      where.type = 'Consultorio';
    } else if (role === 'RECURSOS') {
      where.type = { not: 'Consultorio' };
    }

    const resources = await prisma.resource.findMany({
      where,
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(resources);
  } catch (error) {
    console.error('Fetch resources error:', error);
    return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    if (!hasRole(session, ['ADMIN'])) {
      return NextResponse.json({ error: 'Prohibido: Se requieren permisos de administrador' }, { status: 403 });
    }

    const body = await request.json();
    const resource = await prisma.resource.create({
      data: {
        name: body.name,
        type: body.type,
        localId: body.localId,
        status: body.status || 'Activo',
        services: body.services,
      },
    });
    return NextResponse.json(resource);
  } catch (error) {
    console.error('Create resource error:', error);
    return NextResponse.json({ error: 'Failed to create resource' }, { status: 500 });
  }
}
