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
    const profesionales = await prisma.professional.findMany({
      include: {
        local: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ profesionales });
  } catch (error) {
    console.error('Error fetching profesionales:', error);
    return NextResponse.json({ error: 'Error al obtener profesionales' }, { status: 500 });
  }
}

export async function POST(req) {
  const user = await isAuthenticated(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (!hasRole(user, ['ADMIN'])) return NextResponse.json({ error: 'Prohibido' }, { status: 403 });

  try {
    const data = await req.json();
    const newPro = await prisma.professional.create({
      data: {
        name: data.name,
        specialty: data.specialty,
        localId: data.localId || null,
      }
    });
    return NextResponse.json({ professional: newPro }, { status: 201 });
  } catch (error) {
    console.error('Error creating professional:', error);
    return NextResponse.json({ error: 'Error al crear el profesional' }, { status: 500 });
  }
}
