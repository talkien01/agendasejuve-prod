export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { 
  sendAppointmentUpdate, 
  sendAppointmentCancellation,
  sendAppointmentFollowUp 
} from '@/lib/notifications';

export async function GET(request, props) {
  try {
    const params = await props.params;
    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: { patient: true, resource: true },
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    return NextResponse.json(appointment);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch appointment' }, { status: 500 });
  }
}

export async function PATCH(request, props) {
  try {
    const params = await props.params;
    const body = await request.json();
    const id = params.id;
    
    const oldAppointment = await prisma.appointment.findUnique({ where: { id } });
    if (!oldAppointment) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    let updatedDate = undefined;
    if (body.date) {
      const parts = body.date.split('-');
      if (parts.length === 3) {
        const [y, m, d] = parts.map(Number);
        updatedDate = new Date(y, m - 1, d, 0, 0, 0);
      } else {
        updatedDate = new Date(body.date);
      }
    }

    const updateData = {
      date: updatedDate,
      startTime: body.startTime,
      endTime: body.endTime,
      type: body.type,
      status: body.status,
      notes: body.notes,
      patientId: body.patientId || null,
      professionalId: body.professionalId || null,
      resourceId: body.resourceId || null,
      localId: body.localId || null,
    };

    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const appointment = await prisma.appointment.update({
      where: { id: id },
      data: updateData,
      include: { patient: true, resource: true, professional: true },
    });

    // logic for follow-ups
    if (body.status && body.status !== oldAppointment.status) {
      if (body.status === 'ASISTIDA') {
        sendAppointmentFollowUp(id, false).catch(e => console.error("Follow-up error:", e));
      } else if (body.status === 'CANCELADA') {
        sendAppointmentFollowUp(id, true).catch(e => console.error("No-show error:", e));
      }
    }

    if (body.notifyPatient && body.status !== 'CANCELADA' && body.status !== 'ASISTIDA') {
      await sendAppointmentUpdate(id).catch(e => console.error("Notification error on UPDATE:", e));
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error(`Update appointment error:`, error);
    return NextResponse.json({ 
      error: 'Failed to update appointment', 
      details: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}

export async function DELETE(request, props) {
  try {
    const params = await props.params;
    const id = params.id;
    const notifyOpt = request.nextUrl.searchParams.get('notify') === 'true';
    console.log(`[DELETE] Starting deletion process for appointment: ${id}, notify: ${notifyOpt}`);

    let appointmentToCancel = null;
    if (notifyOpt) {
      appointmentToCancel = await prisma.appointment.findUnique({
        where: { id },
        include: { patient: true }
      });
    }

    // 1. Delete associated notifications
    const deletedNotifications = await prisma.notification.deleteMany({
      where: { appointmentId: id }
    });
    console.log(`[DELETE] Deleted ${deletedNotifications.count} notifications.`);

    // 2. Clear appointmentId from ClinicalRecord
    // We use updateMany just in case, but it's 1:1
    const updatedRecords = await prisma.clinicalRecord.updateMany({
      where: { appointmentId: id },
      data: { appointmentId: null }
    });
    console.log(`[DELETE] Updated ${updatedRecords.count} clinical records.`);

    // 3. Finally delete the appointment
    await prisma.appointment.delete({
      where: { id: id },
    });
    console.log(`[DELETE] Appointment ${id} deleted successfully.`);

    if (notifyOpt && appointmentToCancel) {
      await sendAppointmentCancellation(appointmentToCancel).catch(e => console.error("Notification error on DELETE:", e));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`[DELETE ERROR]:`, error);
    
    // Check if it's a Prisma error with a specific code
    let message = error.message;
    if (error.code === 'P2003') {
      message = "No se puede eliminar la cita porque tiene registros dependientes que no pudieron ser limpiados (Error de integridad).";
    }

    return NextResponse.json({ 
      error: 'Error al eliminar la cita', 
      details: message,
      code: error.code
    }, { status: 500 });
  }
}
