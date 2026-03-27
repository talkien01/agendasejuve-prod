import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession, hasRole } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

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
        attachments: true,
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
    const formData = await req.formData();
    const content = formData.get('content');
    const diagnosis = formData.get('diagnosis');
    const treatment = formData.get('treatment');
    const templateId = formData.get('templateId');
    const templateDataStr = formData.get('templateData');
    const templateData = templateDataStr ? JSON.parse(templateDataStr) : null;
    const dateStr = formData.get('date');
    const professionalId = formData.get('professionalId');
    const appointmentId = formData.get('appointmentId');
    const files = formData.getAll('files'); // Array of Files
    
    // Validate patient exists
    const patientValue = await prisma.patient.findUnique({ where: { id } });
    if (!patientValue) return NextResponse.json({ error: 'Paciente no encontrado' }, { status: 404 });

    // Create the clinical record
    const record = await prisma.clinicalRecord.create({
      data: {
        patientId: id,
        content: content || '',
        diagnosis: diagnosis || null,
        treatment: treatment || null,
        date: dateStr ? new Date(dateStr) : new Date(),
        professionalId: professionalId || null,
        appointmentId: appointmentId || null,
        templateId: templateId || null,
        templateData: templateData || null,
      },
    });

    // Handle File Saving
    const attachments = [];
    if (files && files.length > 0) {
      try {
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'clinical-records', id);
        await mkdir(uploadDir, { recursive: true });

        for (const file of files) {
          if (file instanceof File && file.size > 0) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
            const filePath = join(uploadDir, fileName);
            const relativeUrl = `/uploads/clinical-records/${id}/${fileName}`;
            
            await writeFile(filePath, buffer);

            const attachment = await prisma.recordAttachment.create({
              data: {
                name: file.name,
                url: relativeUrl,
                type: file.type,
                size: file.size,
                clinicalRecordId: record.id
              }
            });
            attachments.push(attachment);
          }
        }
      } catch (fileError) {
        console.error('FILE UPLOAD ERROR:', fileError);
        // We don't fail the whole request if files fail, just log it
        // Or we could return a partial success, but for now we log.
      }
    }

    return NextResponse.json({ ...record, attachments });
  } catch (error) {
    console.error('CREATE HISTORY ERROR:', error);
    // Determine if it is a Prisma error
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Unicidad violada en los datos' }, { status: 400 });
    }
    return NextResponse.json({ 
      error: 'Error al crear el registro clínico', 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    }, { status: 500 });
  }
}
