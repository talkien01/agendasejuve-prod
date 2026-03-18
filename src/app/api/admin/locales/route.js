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
    return payload; // Returns user info if valid
  } catch (error) {
    return false;
  }
}

export async function GET(req) {
  const user = await isAuthenticated(req);
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
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
