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

  const role = user.role;
  if (!hasRole(user, ['ADMIN', 'PSICOLOGIA', 'RECURSOS'])) {
    return NextResponse.json({ error: 'Prohibido' }, { status: 403 });
  }

  let resourceWhere = {};
  if (role === 'PSICOLOGIA') {
    resourceWhere.type = 'Consultorio';
  } else if (role === 'RECURSOS') {
    resourceWhere.type = { not: 'Consultorio' };
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [totalPatients, totalResources, activeResources, todayAppointments, upcomingAppointments] =
      await Promise.all([
        prisma.patient.count(),
        prisma.resource.count({ where: resourceWhere }),
        prisma.resource.count({ where: { ...resourceWhere, status: 'Activo' } }),
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

    const resources = await prisma.resource.findMany({ 
      where: resourceWhere,
      orderBy: { name: 'asc' } 
    });

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
