import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  const appts = await prisma.appointment.findMany({
    orderBy: { date: 'asc' },
    include: { patient: true, professional: true, resource: true }
  });
  return NextResponse.json(appts);
}
