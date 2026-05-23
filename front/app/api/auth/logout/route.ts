import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  const hasToken = cookieStore.get('accessToken');

  // If a cookie store is writable, clear the cookie
  const response = NextResponse.json({ ok: true });

  if (hasToken) {
    response.cookies.set('accessToken', '', {
      path: '/',
      maxAge: 0,
      sameSite: 'lax',
    });
  }

  return response;
}
