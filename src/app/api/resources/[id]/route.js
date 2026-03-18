export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function PATCH(request, { params }) {
  try {
    const body = await request.json();
    const resource = await prisma.resource.update({
      where: { id: params.id },
      data: {
        name: body.name,
        type: body.type,
        location: body.location,
        status: body.status,
        services: body.services,
      },
    });
    return NextResponse.json(resource);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update resource' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await prisma.resource.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete resource' }, { status: 500 });
  }
}
