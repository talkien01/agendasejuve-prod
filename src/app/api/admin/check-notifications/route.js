import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import nodemailer from 'nodemailer';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const results = {
      whatsapp: { status: 'unknown', message: '' },
      email: { status: 'unknown', message: '' },
    };

    // --- WhatsApp (EvolutionAPI) Health Check ---
    try {
      const waRes = await fetch(`${process.env.WHATSAPP_API_URL}/instance/fetchInstances`, {
        headers: { 'apikey': process.env.WHATSAPP_API_KEY },
        signal: AbortSignal.timeout(5000)
      });
      if (waRes.ok) {
        const data = await waRes.json();
        const instance = Array.isArray(data)
          ? data.find(i => i.instance?.instanceName === process.env.WHATSAPP_INSTANCE)
          : null;
        if (instance && instance.instance?.state === 'open') {
          results.whatsapp = { status: 'ok', message: `Instancia "${process.env.WHATSAPP_INSTANCE}" conectada` };
        } else {
          results.whatsapp = { status: 'warning', message: `Instancia encontrada pero estado: ${instance?.instance?.state || 'desconocido'}` };
        }
      } else {
        results.whatsapp = { status: 'error', message: `Error HTTP ${waRes.status} al conectar con la API` };
      }
    } catch (e) {
      results.whatsapp = { status: 'error', message: `No se pudo conectar: ${e.message}` };
    }

    // --- Gmail / SMTP Health Check ---
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
      });
      await transporter.verify();
      results.email = { status: 'ok', message: `Cuenta "${process.env.EMAIL_USER}" verificada correctamente` };
    } catch (e) {
      results.email = { status: 'error', message: `Fallo al verificar Gmail: ${e.message}` };
    }

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
