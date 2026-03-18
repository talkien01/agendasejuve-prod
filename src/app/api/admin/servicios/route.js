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

export async function GET(req) {
  const user = await isAuthenticated(req);
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const services = await prisma.service.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ services });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ error: 'Error al obtener servicios' }, { status: 500 });
  }
}

export async function POST(req) {
  const user = await isAuthenticated(req);
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const data = await req.json();
    const newService = await prisma.service.create({
      data: {
        name: data.name,
        duration: parseInt(data.duration, 10) || 60,
        price: parseFloat(data.price) || 0,
        category: data.category || 'General',
      }
    });
    return NextResponse.json({ service: newService }, { status: 201 });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json({ error: 'Error al crear el servicio' }, { status: 500 });
  }
}
