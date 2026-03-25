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

export async function GET(req, { params }) {
  const { id } = await params;
  const user = await isAuthenticated(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  
  // Only ADMIN and PSICOLOGIA can see clinical history
  if (!hasRole(user, ['ADMIN', 'PSICOLOGIA'])) {
    return NextResponse.json({ error: 'Prohibido: Rol insuficiente para ver historial clínico' }, { status: 403 });
  }

  try {
    const history = await prisma.clinicalRecord.findMany({
      where: { patientId: id },
      include: {
        professional: true,
        appointment: {
          include: {
            service: true
          }
        }
      },
      orderBy: { date: 'desc' },
    });
    return NextResponse.json(history);
  } catch (error) {
    console.error('HISTORY FETCH ERROR:', error);
    return NextResponse.json({ error: 'Failed to fetch clinical history' }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  const { id } = await params;
  const user = await isAuthenticated(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  if (!hasRole(user, ['ADMIN', 'PSICOLOGIA'])) {
    return NextResponse.json({ error: 'Prohibido: Solo ADMIN o PSICOLOGIA pueden crear registros clínicos' }, { status: 403 });
  }

  try {
    const body = await req.json();
    
    // Validate patient exists
    const patient = await prisma.patient.findUnique({ where: { id } });
    if (!patient) return NextResponse.json({ error: 'Paciente no encontrado' }, { status: 404 });

    const record = await prisma.clinicalRecord.create({
      data: {
        patientId: id,
        content: body.content,
        diagnosis: body.diagnosis || null,
        treatment: body.treatment || null,
        date: body.date ? new Date(body.date) : new Date(),
        professionalId: body.professionalId || null,
        appointmentId: body.appointmentId || null,
      },
    });
    return NextResponse.json(record);
  } catch (error) {
    console.error('CREATE HISTORY ERROR:', error);
    if (error.code) console.error('Prisma Error Code:', error.code);
    if (error.meta) console.error('Prisma Error Meta:', JSON.stringify(error.meta));
    return NextResponse.json({ 
      error: 'Failed to create clinical record', 
      details: error.message,
      code: error.code 
    }, { status: 500 });
  }
}
