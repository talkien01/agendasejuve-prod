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
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  if (!hasRole(user, ['ADMIN'])) {
    return NextResponse.json({ error: 'Prohibido: Se requieren permisos de administrador' }, { status: 403 });
  }

  try {
    const locales = await prisma.local.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ locales });
  } catch (error) {
    console.error('Error fetching locales:', error);
    return NextResponse.json({ error: 'Error al obtener sucursales' }, { status: 500 });
  }
}

export async function POST(req) {
  const user = await isAuthenticated(req);
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  if (!hasRole(user, ['ADMIN'])) {
    return NextResponse.json({ error: 'Prohibido: Se requieren permisos de administrador' }, { status: 403 });
  }

  try {
    const data = await req.json();
    const newLocal = await prisma.local.create({
      data: {
        name: data.name,
        address: data.address,
        phone: data.phone,
        status: data.status || 'Activo',
      }
    });
    return NextResponse.json({ local: newLocal }, { status: 201 });
  } catch (error) {
    console.error('Error creating local:', error);
    return NextResponse.json({ error: 'Error al crear la sucursal' }, { status: 500 });
  }
}
