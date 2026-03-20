import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession, hasRole } from '@/lib/auth';

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
  if (!hasRole(user, ['ADMIN'])) return NextResponse.json({ error: 'Prohibido' }, { status: 403 });

  try {
    const resources = await prisma.resource.findMany({
      include: {
        local: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ resources });
  } catch (error) {
    console.error('Error fetching resources:', error);
    return NextResponse.json({ error: 'Error al obtener recursos' }, { status: 500 });
  }
}

export async function POST(req) {
  const user = await isAuthenticated(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (!hasRole(user, ['ADMIN'])) return NextResponse.json({ error: 'Prohibido' }, { status: 403 });

  try {
    const data = await req.json();
    const newResource = await prisma.resource.create({
      data: {
        name: data.name,
        type: data.type,
        localId: data.localId || null,
        status: data.status || 'Activo',
        services: data.services || '',
      }
    });
    return NextResponse.json({ resource: newResource }, { status: 201 });
  } catch (error) {
    console.error('Error creating resource:', error);
    return NextResponse.json({ error: 'Error al crear el recurso' }, { status: 500 });
  }
}
