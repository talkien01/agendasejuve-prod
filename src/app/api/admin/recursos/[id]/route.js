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

export async function PUT(req, { params }) {
  const user = await isAuthenticated(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (!hasRole(user, ['ADMIN'])) return NextResponse.json({ error: 'Prohibido' }, { status: 403 });

  try {
    const { id } = await params;
    const data = await req.json();
    
    const updated = await prisma.resource.update({
      where: { id },
      data: {
        name: data.name,
        type: data.type,
        localId: data.localId || null,
        status: data.status,
        services: data.services,
      }
    });
    return NextResponse.json({ resource: updated });
  } catch (error) {
    console.error('Error updating resource:', error);
    return NextResponse.json({ error: 'Error al actualizar el recurso' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const user = await isAuthenticated(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (!hasRole(user, ['ADMIN'])) return NextResponse.json({ error: 'Prohibido' }, { status: 403 });

  try {
    const { id } = await params;
    await prisma.resource.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting resource:', error);
    return NextResponse.json({ error: 'Error al eliminar el recurso' }, { status: 500 });
  }
}
