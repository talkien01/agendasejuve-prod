import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession, hasRole } from '@/lib/auth';

export async function GET(request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    if (!hasRole(session, ['ADMIN'])) return NextResponse.json({ error: 'Prohibido' }, { status: 403 });

    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Fetch notification logs error:', error);
    return NextResponse.json({ error: 'Failed to fetch notification logs' }, { status: 500 });
  }
}
