export const dynamic = 'force-dynamic';
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

  try {
    const pros = await prisma.professional.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(pros);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch professionals' }, { status: 500 });
  }
}

export async function POST(req) {
  const user = await isAuthenticated(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  if (!hasRole(user, ['ADMIN'])) {
    return NextResponse.json({ error: 'Prohibido: Se requieren permisos de administrador' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const pro = await prisma.professional.create({
      data: {
        name: body.name,
        specialty: body.specialty,
      },
    });
    return NextResponse.json(pro);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create professional' }, { status: 500 });
  }
}
