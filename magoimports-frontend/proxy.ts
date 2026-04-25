import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname === '/login' || 
    pathname.startsWith('/_next') || 
    pathname.includes('/imagens') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const userCookie = request.cookies.get('mago_user_session');

  if (!userCookie) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};