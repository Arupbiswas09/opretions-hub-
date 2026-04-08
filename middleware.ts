import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from './src/app/lib/supabase/middleware';
import { isHubBypassAuth } from './src/app/lib/hub/dev-bypass';

/**
 * Supabase session refresh (updateSession) + protect /hub when auth is configured.
 * Redis / ioredis stay in Node API routes only (Edge middleware cannot use them).
 *
 * HUB_BYPASS_AUTH=1 — allow /hub without a session (local ERP testing; pair with HUB_DEV_* in .env.local).
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  /** Must run for /api too — otherwise session cookies are never refreshed on data fetches (dashboard 401s). */
  const { response: supabaseResponse, user } = await updateSession(request);

  if (pathname.startsWith('/api/')) {
    return supabaseResponse;
  }

  const isHub = pathname.startsWith('/hub');
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isCallback = pathname.startsWith('/auth/callback');
  const bypassHubAuth = isHubBypassAuth();
  if (
    process.env.NODE_ENV === 'development' &&
    process.env.HUB_BYPASS_AUTH === '1' &&
    !bypassHubAuth
  ) {
    console.warn(
      '[hub] HUB_BYPASS_AUTH=1 but HUB_DEV_ORG_ID and HUB_DEV_USER_ID are missing — set both (real UUIDs) or sign in at /login.',
    );
  }

  if (isHub && !user && !bypassHubAuth) {
    const login = new URL('/login', request.url);
    login.searchParams.set('next', pathname + request.nextUrl.search);
    return NextResponse.redirect(login);
  }

  if ((isAuthPage || isCallback) && user && isAuthPage) {
    return NextResponse.redirect(new URL('/hub/dashboard', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
