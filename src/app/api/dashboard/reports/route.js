import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession, hasRole } from '@/lib/auth';
import { startOfMonth, endOfMonth, subMonths, format, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';

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
    const [totalAppointments, attendedAppointments, cancelledAppointments, newBookings, newPatients, repeatPatientsCount] = await Promise.all([
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
      }),
      // For retention: patients with more than 1 appointment (Total historical)
      prisma.appointment.groupBy({
        by: ['patientId'],
        _count: { id: true },
        having: { id: { _count: { gt: 1 } } }
      })
    ]);

    // Alternative Revenue Calculation
    const attendedWithPrice = await prisma.appointment.findMany({
      where: { date: { gte: thirtyDaysAgo }, status: 'ASISTIDA' },
      include: { service: true }
    });
    const totalRevenue = attendedWithPrice.reduce((sum, app) => sum + (app.service?.price || 0), 0);

    const activeAppointments = totalAppointments - cancelledAppointments;
    const attendanceRate = activeAppointments > 0 
      ? (attendedAppointments / activeAppointments * 100).toFixed(1) 
      : 0;
    
    const totalPatients = await prisma.patient.count();
    const retentionRate = totalPatients > 0 
      ? (repeatPatientsCount.length / totalPatients * 100).toFixed(1)
      : 0;

    // 2. Bar Chart Data (Fixed: Jan to Jun of current year)
    const monthlyBookings = [];
    const currentYear = now.getFullYear();
    for (let i = 0; i < 6; i++) {
      const monthStart = startOfMonth(new Date(currentYear, i, 1));
      const monthEnd = endOfMonth(new Date(currentYear, i, 1));
      
      const count = await prisma.appointment.count({
        where: { date: { gte: monthStart, lte: monthEnd } }
      });
      
      monthlyBookings.push({
        label: format(monthStart, 'MMM', { locale: es }).replace('.', '').toUpperCase(),
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
      if (app.type === 'RESOURCE' || app.type === 'Reserva') {
        reservasCount++;
      } else if ((app.type === 'PROFESSIONAL' || app.type === 'Cita') && app.service) {
        const category = app.service.category?.toLowerCase() || '';
        const name = app.service.name?.toLowerCase() || '';
        if (category.includes('consulta') || name.includes('consulta') || name.includes('valoración')) {
          consultaCount++;
        } else if (category.includes('terapia') || name.includes('terapia')) {
          terapiaCount++;
        } else {
          consultaCount++;
        }
      } else {
        consultaCount++;
      }
    });

    const serviceDist = [
      { name: 'Consulta', value: consultaCount },
      { name: 'Terapia', value: terapiaCount },
      { name: 'Reservas', value: reservasCount },
    ];

    // 4. Space Reservation (Reservas) Distribution
    const resourceAppointments = await prisma.appointment.findMany({
      where: { 
        date: { gte: thirtyDaysAgo }, 
        resourceId: { not: null } 
      },
      include: { resource: true }
    });

    let cabinaCount = 0;
    let auditorioCount = 0;
    let salaCount = 0;
    let consultorioCount = 0;

    resourceAppointments.forEach(app => {
      if (app.resource) {
        const type = app.resource.type?.toLowerCase();
        if (type?.includes('cabina')) cabinaCount++;
        else if (type?.includes('auditorio')) auditorioCount++;
        else if (type?.includes('sala')) salaCount++;
        else if (type?.includes('consultorio')) consultorioCount++;
      }
    });

    const spaceDist = [
      { name: 'Cabinas', value: cabinaCount },
      { name: 'Auditorio', value: auditorioCount },
      { name: 'Salas', value: salaCount },
      { name: 'Consultorios', value: consultorioCount },
    ];

    return NextResponse.json({
      kpis: [
        { name: 'Asistencia', value: `${attendanceRate}%`, color: '#4CAF50' },
        { name: 'Ingresos (30d)', value: `$${totalRevenue.toLocaleString()}`, color: '#FFD700' },
        { name: 'Retención', value: `${retentionRate}%`, color: '#9C27B0' },
        { name: 'Reservas (30d)', value: newBookings.toString(), color: '#00BFFF' },
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
