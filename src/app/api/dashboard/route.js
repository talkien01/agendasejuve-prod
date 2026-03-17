import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [totalPatients, totalResources, activeResources, todayAppointments, upcomingAppointments] =
      await Promise.all([
        prisma.patient.count(),
        prisma.resource.count(),
        prisma.resource.count({ where: { status: 'Activo' } }),
        prisma.appointment.count({
          where: { date: { gte: today, lt: tomorrow } },
        }),
        prisma.appointment.findMany({
          where: { date: { gte: today, lt: tomorrow } },
          include: { patient: true, resource: true },
          orderBy: { startTime: 'asc' },
          take: 5,
        }),
      ]);

    const resources = await prisma.resource.findMany({ orderBy: { name: 'asc' } });

    return NextResponse.json({
      stats: {
        todayAppointments,
        totalPatients,
        activeResources,
        totalResources,
      },
      upcomingAppointments,
      resources,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
