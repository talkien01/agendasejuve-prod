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

/**
 * Centrally fetch a template from the Config table
 */
async function getTemplate(key, defaultText) {
  try {
    const config = await prisma.config.findUnique({ where: { key } });
    return config ? config.value : defaultText;
  } catch (error) {
    return defaultText;
  }
}

/**
 * Replace placeholders in a template string
 */
function parseTemplate(template, data) {
  let result = template;
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, data[key]);
  });
  return result;
}

export async function sendNotification({ type, recipient, content, appointmentId, title = 'Notificación', buttons = [] }) {
  let status = 'PENDING';
  let errorMsg = null;

  try {
    if (type === 'WHATSAPP') {
      if (!evolutionApiUrl || !evolutionApiKey || !evolutionInstance) {
        throw new Error('EvolutionAPI configuration missing');
      }

      const baseUrl = evolutionApiUrl.endsWith('/') ? evolutionApiUrl.slice(0, -1) : evolutionApiUrl;
      
      let cleanPhone = recipient.replace(/\D/g, '');
      if (cleanPhone.length === 10) cleanPhone = `52${cleanPhone}`;
      
      let endpoint = `${baseUrl}/message/sendText/${evolutionInstance}`;
      let body = { number: cleanPhone, text: content };

      // Support for Buttons (EvolutionAPI v2)
      if (buttons && buttons.length > 0) {
        endpoint = `${baseUrl}/message/sendButtons/${evolutionInstance}`;
        body = {
          number: cleanPhone,
          title: title,
          description: content,
          footer: 'SEJUVE Citas',
          buttons: buttons.map((btn, index) => ({
            buttonId: btn.id || `btn-${index}`,
            buttonText: { displayText: btn.text },
            type: 1 // Reply Button
          }))
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': evolutionApiKey
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(`EvolutionAPI error: ${JSON.stringify(errData)}`);
      }
      status = 'SENT';
    } else if (type === 'EMAIL') {
      if (!emailUser || !emailPass) throw new Error('Gmail configuration missing');

      await transporter.sendMail({
        from: `"SEJUVE Citas" <${emailUser}>`,
        to: recipient,
        subject: `${title} - SEJUVE`,
        text: content,
        html: `<div style="font-family: sans-serif; padding: 20px; border-radius: 12px; border: 1px solid #eee;">
          <h2 style="color: #7c3aed;">${title}</h2>
          <p style="white-space: pre-wrap;">${content}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <small style="color: #666;">Este es un mensaje automático del sistema de citas SEJUVE.</small>
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
      data: { type, recipient, content, status, error: errorMsg, appointmentId }
    });
  } catch (logError) {
    console.error('Failed to log notification to DB:', logError);
  }

  return { status, error: errorMsg };
}

export async function sendAppointmentConfirmation(appointmentId) {
  const app = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { patient: true, service: true, resource: true, professional: true, local: true }
  });

  if (!app || !app.patient) return;

  const dateStr = new Date(app.date).toLocaleDateString('es-MX', { 
    timeZone: 'America/Mexico_City', weekday: 'long', day: 'numeric', month: 'long' 
  });
  
  const place = app.resource?.name || app.professional?.name || 'SEJUVE';
  const template = await getTemplate('ntfy_confirmation_msg', 'Tu cita ha sido confirmada para el {{date}} a las {{time}} en {{place}}.');
  const message = parseTemplate(template, {
    patientName: app.patient.name,
    date: dateStr,
    time: app.startTime,
    place: place
  });

  const results = [];
  const waButtons = [
    { id: 'confirm', text: 'Confirmar Asistencia' },
    { id: 'reschedule', text: 'Reagendar' }
  ];

  if (app.patient.notifyWhatsapp && app.patient.phone) {
    results.push(await sendNotification({
      type: 'WHATSAPP',
      recipient: app.patient.phone,
      content: message,
      appointmentId,
      title: 'Confirmación de Cita',
      buttons: waButtons
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

export async function sendAppointmentReminder(appointment) {
  const patient = appointment.patient;
  if (!patient) return { status: 'ERROR', error: 'No patient data' };

  const dateStr = new Date(appointment.date).toLocaleDateString('es-MX', { 
    timeZone: 'America/Mexico_City', weekday: 'long', day: 'numeric', month: 'long' 
  });
  
  const place = appointment.resource?.name || appointment.professional?.name || 'SEJUVE';
  const template = await getTemplate('ntfy_reminder_msg', 'Recordatorio de tu cita para mañana {{date}} a las {{time}}.');
  const content = parseTemplate(template, {
    patientName: patient.name,
    date: dateStr,
    time: appointment.startTime,
    place: place
  });

  const waButtons = [{ id: 'confirm', text: 'Confirmar' }, { id: 'cancel', text: 'Cancelar' }];
  const results = [];

  if (patient.notifyWhatsapp && patient.phone) {
    results.push(await sendNotification({
      type: 'WHATSAPP',
      recipient: patient.phone,
      content,
      appointmentId: appointment.id,
      title: 'Recordatorio',
      buttons: waButtons
    }));
  }

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

export async function sendAppointmentFollowUp(appointmentId, isNoShow = false) {
  const app = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { patient: true }
  });

  if (!app || !app.patient) return;

  const configKey = isNoShow ? 'ntfy_noshow_msg' : 'ntfy_thankyou_msg';
  const defaultText = isNoShow ? 'Te extrañamos hoy.' : 'Gracias por asistir.';
  const template = await getTemplate(configKey, defaultText);

  const message = parseTemplate(template, {
    patientName: app.patient.name,
    link: `${process.env.NEXT_PUBLIC_BASE_URL || ''}/reservar`
  });

  const results = [];
  if (app.patient.notifyWhatsapp && app.patient.phone) {
    const waButtons = isNoShow ? [{ id: 'reschedule', text: 'Reagendar Cita' }] : [];
    results.push(await sendNotification({
      type: 'WHATSAPP',
      recipient: app.patient.phone,
      content: message,
      appointmentId,
      title: isNoShow ? 'Te extrañamos' : 'Gracias por tu visita',
      buttons: waButtons
    }));
  }

  if (app.patient.notifyEmail && app.patient.email) {
    results.push(await sendNotification({
      type: 'EMAIL',
      recipient: app.patient.email,
      content: message,
      appointmentId,
      title: isNoShow ? 'Te extrañamos' : 'Gracias por tu visita'
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
  
  const dateStr = new Date(app.date).toLocaleDateString('es-MX', { timeZone: 'America/Mexico_City', weekday: 'long', day: 'numeric', month: 'long' });
  const place = app.resource?.name || app.professional?.name || 'SEJUVE';
  const message = `¡Hola ${app.patient.name}! 👋\n\nTu cita ha sido ACTUALIZADA:\n📅 Fecha: ${dateStr}\n⏰ Hora: ${app.startTime}\n📍 Lugar: ${place}\n\nCualquier duda, contáctanos.`;
  
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
  const dateStr = new Date(app.date).toLocaleDateString('es-MX', { timeZone: 'America/Mexico_City', weekday: 'long', day: 'numeric', month: 'long' });
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
