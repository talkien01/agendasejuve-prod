import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key-for-jwt-12345!');

async function isAuthenticated(req) {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) return false;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload; 
  } catch (error) {
    return false;
  }
}

export async function PUT(req, { params }) {
  const user = await isAuthenticated(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const { id } = params;
    const data = await req.json();
    
    const updated = await prisma.local.update({
      where: { id },
      data: {
        name: data.name,
        address: data.address,
        phone: data.phone,
        status: data.status,
      }
    });
    return NextResponse.json({ local: updated });
  } catch (error) {
    console.error('Error updating local:', error);
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const user = await isAuthenticated(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const { id } = params;
    await prisma.local.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting local:', error);
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 });
  }
}
