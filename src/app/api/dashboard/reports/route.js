import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession, hasRole } from '@/lib/auth';
import { startOfMonth, endOfMonth, subMonths, format, startOfDay, endOfDay } from 'date-fns';

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
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    // 1. KPIs
    const [totalAppointments, attendedAppointments, cancelledAppointments, newBookings, newPatients] = await Promise.all([
      prisma.appointment.count({
        where: { date: { gte: thirtyDaysAgo } }
      }),
      prisma.appointment.count({
        where: { date: { gte: thirtyDaysAgo }, status: 'ASISTIDA' }
      }),
      prisma.appointment.count({
        where: { date: { gte: thirtyDaysAgo }, status: 'CANCELADA' }
      }),
      prisma.appointment.count({
        where: { createdAt: { gte: thirtyDaysAgo } }
      }),
      prisma.patient.count({
        where: { createdAt: { gte: thirtyDaysAgo } }
      })
    ]);

    const activeAppointments = totalAppointments - cancelledAppointments;
    const attendanceRate = activeAppointments > 0 
      ? (attendedAppointments / activeAppointments * 100).toFixed(1) 
      : 0;

    // 2. Bar Chart Data (Monthly bookings Jan to Jun of current year)
    const monthlyBookings = [];
    const yearStart = new Date(now.getFullYear(), 0, 1); // Jan 1st
    for (let i = 0; i < 6; i++) {
      const monthStart = startOfMonth(new Date(now.getFullYear(), i, 1));
      const monthEnd = endOfMonth(new Date(now.getFullYear(), i, 1));
      const count = await prisma.appointment.count({
        where: { date: { gte: monthStart, lte: monthEnd } }
      });
      monthlyBookings.push({
        label: format(monthStart, 'MMM'),
        value: count
      });
    }

    // 3. Service Distribution
    const appointmentsWithServices = await prisma.appointment.findMany({
      where: { date: { gte: thirtyDaysAgo } },
      include: { service: true }
    });

    let consultaCount = 0;
    let terapiaCount = 0;
    let reservasCount = 0;

    appointmentsWithServices.forEach(app => {
      if (app.type === 'RESOURCE') {
        reservasCount++;
      } else if (app.type === 'PROFESSIONAL' && app.service) {
        if (app.service.category?.toLowerCase().includes('consulta')) {
          consultaCount++;
        } else if (app.service.category?.toLowerCase().includes('terapia')) {
          terapiaCount++;
        } else {
          // Default to consulta if category doesn't strictly match but it's professional
          consultaCount++;
        }
      } else {
        consultaCount++;
      }
    });

    const totalDist = consultaCount + terapiaCount + reservasCount;
    const serviceDist = [
      { name: 'Consulta', value: totalDist > 0 ? Math.round((consultaCount / totalDist) * 100) : 0 },
      { name: 'Terapia', value: totalDist > 0 ? Math.round((terapiaCount / totalDist) * 100) : 0 },
      { name: 'Reservas', value: totalDist > 0 ? Math.round((reservasCount / totalDist) * 100) : 0 },
    ];

    // 4. Space Reservation (Reservas) Distribution
    const resourceAppointments = await prisma.appointment.findMany({
      where: { date: { gte: thirtyDaysAgo }, type: 'RESOURCE' },
      include: { resource: true }
    });

    let cabinaCount = 0;
    let auditorioCount = 0;
    let salaCount = 0;

    resourceAppointments.forEach(app => {
      if (app.resource) {
        const type = app.resource.type?.toLowerCase();
        if (type?.includes('cabina')) cabinaCount++;
        else if (type?.includes('auditorio')) auditorioCount++;
        else if (type?.includes('sala')) salaCount++;
      }
    });

    const totalSpace = cabinaCount + auditorioCount + salaCount;
    const spaceDist = [
      { name: 'Cabinas', value: totalSpace > 0 ? Math.round((cabinaCount / totalSpace) * 100) : 0 },
      { name: 'Auditorio', value: totalSpace > 0 ? Math.round((auditorioCount / totalSpace) * 100) : 0 },
      { name: 'Salas de Juntas', value: totalSpace > 0 ? Math.round((salaCount / totalSpace) * 100) : 0 },
    ];

    return NextResponse.json({
      kpis: [
        { name: 'Tasa de Asistencia', value: `${attendanceRate}%`, color: '#4CAF50' },
        { name: 'Reservas Nuevas', value: newBookings.toString(), color: '#00BFFF' },
        { name: 'Nuevos Pacientes', value: newPatients.toString(), color: '#E91E63' },
      ],
      monthlyBookings,
      serviceDist,
      spaceDist
    });
  } catch (error) {
    console.error('Reports API error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
