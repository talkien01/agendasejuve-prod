import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const resources = await prisma.resource.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(resources);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const resource = await prisma.resource.create({
      data: {
        name: body.name,
        type: body.type,
        location: body.location,
        status: body.status || 'Activo',
        services: body.services,
      },
    });
    return NextResponse.json(resource);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create resource' }, { status: 500 });
  }
}
