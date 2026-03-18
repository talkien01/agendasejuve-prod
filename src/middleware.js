import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secretKey = process.env.JWT_SECRET || 'fallback-secret-key-change-it';
const key = new TextEncoder().encode(secretKey);

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Paths that don't require authentication
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/auth/login') ||
    pathname.startsWith('/_next') ||
    pathname.includes('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  const session = request.cookies.get('session')?.value;

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    await jwtVerify(session, key);
    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/((?!api/auth/login|api/diag|api/seed|_next/static|_next/image|favicon.ico).*)'],
};
