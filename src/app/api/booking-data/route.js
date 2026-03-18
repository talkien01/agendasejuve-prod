import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [locales, services, professionals] = await Promise.all([
      prisma.local.findMany({
        where: { status: 'Activo' },
        select: {
          id: true,
          name: true,
          address: true,
          phone: true,
        }
      }),
      prisma.service.findMany({
        orderBy: { category: 'asc' }
      }),
      prisma.professional.findMany({
        select: {
          id: true,
          name: true,
          specialty: true,
          localId: true,
        }
      })
    ]);

    return NextResponse.json({
      locales,
      services,
      professionals
    });
  } catch (error) {
    console.error('Error fetching booking data:', error);
    return NextResponse.json({ error: 'Failed to fetch booking data' }, { status: 500 });
  }
}
