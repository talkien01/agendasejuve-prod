import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    const allUsers = await prisma.user.findMany({
      select: { email: true, name: true, role: true }
    });
    
    return NextResponse.json({ 
      userCount, 
      users: allUsers,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
