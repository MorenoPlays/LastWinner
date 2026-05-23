import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = [
  '/settings',
  '/profile',
  '/tournaments/',
  '/tournaments/new',
  '/tournaments',
  '/games/',
  '/games/new',
  '/games',
];
const publicRoutes = ['/login', '/register'];

export const config = {
  matcher: [
    '/profile/:path*',
    '/settings/:path*',
    '/tournaments/:path*',
    '/tournaments/new',
    '/tournaments',
    '/games/:path*',
    '/games/new',
    '/games',
    '/login',
    '/register',
  ],
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const rawToken = request.cookies.get('accessToken')?.value;

  // ── Auth pages (login/register): allow through without auth ────────────
  if (publicRoutes.some((r) => pathname === r || pathname.startsWith(r + '/'))) {
    return NextResponse.next();
  }

  // ── Protected routes: require token, else redirect to /login ────────────
  if (
    protectedRoutes.some(
      (r) => pathname === r || pathname.startsWith(r),
    )
  ) {
    if (!rawToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // ── All other routes: pass through ──────────────────────────────────────
  return NextResponse.next();
}
