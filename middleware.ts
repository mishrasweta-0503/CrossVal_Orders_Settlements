import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const { pathname } = req.nextUrl;

  // Protect dashboard and order routes
  if (pathname.startsWith('/orders') && !token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Redirect authenticated users away from login/register
  if ((pathname === '/login' || pathname === '/register') && token) {
    return NextResponse.redirect(new URL('/orders', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/orders/:path*', '/login', '/register'],
};