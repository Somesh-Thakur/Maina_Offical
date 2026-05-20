import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that are always public (no auth or guest cookie required)
const PUBLIC_PATHS = ['/login', '/api/', '/share/', '/invite/', '/u/'];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow public paths through
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const session = await auth();

  // ── Admin guard ──────────────────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return NextResponse.next();
  }

  // ── Main app guard ───────────────────────────────────────────────────────
  // Allow signed-in users through
  if (session) return NextResponse.next();

  // Allow guests (they clicked "Continue as Guest" which sets this cookie)
  const guestCookie = req.cookies.get('maina_guest');
  if (guestCookie?.value === '1') return NextResponse.next();

  // Everyone else → show the landing/login page
  return NextResponse.redirect(new URL('/login', req.url));
}

export const config = {
  // Run on all pages except Next.js internals and static files
  matcher: [
    '/((?!_next/static|_next/image|favicon|icon|manifest|sw\\.js|.*\\.png|.*\\.svg|.*\\.ico).*)',
  ],
};
