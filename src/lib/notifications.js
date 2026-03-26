import nodemailer from 'nodemailer';
import prisma from './db';

const evolutionApiUrl = process.env.WHATSAPP_API_URL;
const evolutionApiKey = process.env.WHATSAPP_API_KEY;
const evolutionInstance = process.env.WHATSAPP_INSTANCE;

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

export async function sendNotification({ type, recipient, content, appointmentId, title = 'Notificación' }) {
  let status = 'PENDING';
  let errorMsg = null;

  try {
    if (type === 'WHATSAPP') {
      if (!evolutionApiUrl || !evolutionApiKey || !evolutionInstance) {
        throw new Error('EvolutionAPI configuration missing');
      }

      // Ensure URL doesn't have trailing slash
      const baseUrl = evolutionApiUrl.endsWith('/') ? evolutionApiUrl.slice(0, -1) : evolutionApiUrl;
      
      let cleanPhone = recipient.replace(/\D/g, '');
      if (cleanPhone.length === 10) {
        cleanPhone = `52${cleanPhone}`;
      }
      
      const response = await fetch(`${baseUrl}/message/sendText/${evolutionInstance}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': evolutionApiKey
        },
        body: JSON.stringify({
          number: cleanPhone,
          text: content
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(`EvolutionAPI error: ${JSON.stringify(errData)}`);
      }
      status = 'SENT';
    } else if (type === 'EMAIL') {
      if (!emailUser || !emailPass) {
        throw new Error('Gmail configuration missing');
      }

      await transporter.sendMail({
        from: `"SEJUVE Citas" <${emailUser}>`,
        to: recipient,
        subject: `${title} - SEJUVE`,
        text: content,
        html: `<div style="font-family: inherit; padding: 20px; border-radius: 12px; border: 1px solid #eee;">
          <h2 style="color: #00BFFF;">${title}</h2>
          <p>${content.replace(/\n/g, '<br>')}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <small style="color: #666;">Este es un mensaje automático, por favor no responda.</small>
        </div>`
      });
      status = 'SENT';
    }
  } catch (error) {
    console.error(`Failed to send ${type} notification:`, error);
    status = 'FAILED';
    errorMsg = error.message;
  }

  // Log to database
  try {
    await prisma.notification.create({
      data: {
        type,
        recipient,
        content,
        status,
        error: errorMsg,
        appointmentId
      }
    });
  } catch (logError) {
    console.error('Failed to log notification to DB:', logError);
  }

  return { status, error: errorMsg };
}

export async function sendAppointmentConfirmation(appointmentId) {
  const app = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      patient: true,
      service: true,
      resource: true,
      professional: true,
      local: true
    }
  });

  if (!app || !app.patient) return;

  const dateStr = new Date(app.date).toLocaleDateString('es-MX', { 
    timeZone: 'America/Mexico_City',
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const place = app.resource?.name || app.professional?.name || 'SEJUVE';
  const localName = app.local?.name || 'SEJUVE';

  const message = `¡Hola ${app.patient.name}! 👋\n\nTu cita ha sido confirmada:\n📅 Fecha: ${dateStr}\n⏰ Hora: ${app.startTime}\n📍 Lugar: ${place} (${localName})\n\nTe esperamos. Si necesitas cancelar, por favor avísanos con tiempo.`;

  const results = [];
  
  if (app.patient.notifyWhatsapp && app.patient.phone) {
    results.push(await sendNotification({
      type: 'WHATSAPP',
      recipient: app.patient.phone,
      content: message,
      appointmentId
    }));
  }

  if (app.patient.notifyEmail && app.patient.email) {
    results.push(await sendNotification({
      type: 'EMAIL',
      recipient: app.patient.email,
      content: message,
      appointmentId,
      title: 'Confirmación de Cita'
    }));
  }

  return results;
}

/**
 * Envía un recordatorio de cita (usualmente 24h antes)
 */
export async function sendAppointmentReminder(appointment) {
  const patient = appointment.patient || appointment.patent;
  const { date, startTime, professional, service } = appointment;
  
  if (!patient) return { status: 'ERROR', error: 'No patient data' };

  const dateStr = new Date(date).toLocaleDateString('es-MX', { 
    timeZone: 'America/Mexico_City',
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });
  
  const place = appointment.resource?.name || appointment.professional?.name || 'SEJUVE';

  const content = `¡Hola ${patient.name}! 👋\n\nSolo pasamos a recordarte tu cita para mañana:\n📅 Fecha: ${dateStr}\n⏰ Hora: ${startTime}\n📍 Lugar: ${place}\n\n¡Te esperamos!`;

  const results = [];

  // WhatsApp Reminder
  if (patient.notifyWhatsapp && patient.phone) {
    results.push(await sendNotification({
      type: 'WHATSAPP',
      recipient: patient.phone,
      content,
      appointmentId: appointment.id
    }));
  }

  // Email Reminder
  if (patient.notifyEmail && patient.email) {
    results.push(await sendNotification({
      type: 'EMAIL',
      recipient: patient.email,
      content,
      appointmentId: appointment.id,
      title: 'Recordatorio de Cita'
    }));
  }

  return results;
}

export async function sendAppointmentUpdate(appointmentId) {
  const app = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { patient: true, service: true, resource: true, professional: true, local: true }
  });
  if (!app || !app.patient) return;
  
  const dateStr = new Date(app.date).toLocaleDateString('es-MX', { timeZone: 'America/Mexico_City', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const place = app.resource?.name || app.professional?.name || 'SEJUVE';
  const localName = app.local?.name || 'SEJUVE';
  
  const message = `¡Hola ${app.patient.name}! 👋\n\nTu cita ha sido ACTUALIZADA:\n📅 Fecha: ${dateStr}\n⏰ Hora: ${app.startTime}\n📍 Lugar: ${place} (${localName})\n\nCualquier duda, contáctanos.`;
  
  const results = [];
  if (app.patient.notifyWhatsapp && app.patient.phone) {
    results.push(await sendNotification({ type: 'WHATSAPP', recipient: app.patient.phone, content: message, appointmentId }));
  }
  if (app.patient.notifyEmail && app.patient.email) {
    results.push(await sendNotification({ type: 'EMAIL', recipient: app.patient.email, content: message, appointmentId, title: 'Actualización de Cita' }));
  }
  return results;
}

export async function sendAppointmentCancellation(app) {
  if (!app || !app.patient) return;
  
  const dateStr = new Date(app.date).toLocaleDateString('es-MX', { timeZone: 'America/Mexico_City', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const message = `¡Hola ${app.patient.name}!\n\nTe informamos que tu cita programada para el ${dateStr} a las ${app.startTime} ha sido CANCELADA.\n\nSi necesitas reprogramar, por favor contáctanos.`;
  
  const results = [];
  if (app.patient.notifyWhatsapp && app.patient.phone) {
    results.push(await sendNotification({ type: 'WHATSAPP', recipient: app.patient.phone, content: message, appointmentId: null }));
  }
  if (app.patient.notifyEmail && app.patient.email) {
    results.push(await sendNotification({ type: 'EMAIL', recipient: app.patient.email, content: message, appointmentId: null, title: 'Cancelación de Cita' }));
  }
  return results;
}
