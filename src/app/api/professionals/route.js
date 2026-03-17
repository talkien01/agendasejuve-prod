import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const pros = await prisma.professional.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(pros);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch professionals' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const pro = await prisma.professional.create({
      data: {
        name: body.name,
        specialty: body.specialty,
      },
    });
    return NextResponse.json(pro);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create professional' }, { status: 500 });
  }
}
