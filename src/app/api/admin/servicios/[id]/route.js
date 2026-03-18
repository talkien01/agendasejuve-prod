import { NextResponse } from 'next/server';
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

export async function PUT(req, { params }) {
  const user = await isAuthenticated(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const { id } = await params;
    const data = await req.json();
    
    const updated = await prisma.service.update({
      where: { id },
      data: {
        name: data.name,
        duration: parseInt(data.duration, 10) || 60,
        price: parseFloat(data.price) || 0,
        category: data.category || 'General',
      }
    });
    return NextResponse.json({ service: updated });
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const user = await isAuthenticated(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const { id } = await params;
    await prisma.service.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 });
  }
}
