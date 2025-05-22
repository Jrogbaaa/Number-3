import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log(`[Middleware] Processing: ${pathname}`);
  
  // ALWAYS ALLOW these paths without authentication
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/signin') ||
    pathname.startsWith('/debug-auth') ||
    pathname === '/' || // Allow access to home page
    pathname.includes('.') // Files like favicon.ico, etc.
  ) {
    console.log(`[Middleware] Public path detected: ${pathname}`);
    return NextResponse.next();
  }

  // Allow all API routes through middleware - they handle their own auth
  if (pathname.startsWith('/api/')) {
    console.log(`[Middleware] API route detected: ${pathname}`);
    return NextResponse.next();
  }

  try {
    // Get session token with explicit secret
    console.log(`[Middleware] Checking auth token for: ${pathname}`);
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === 'production'
    });
    
    // Debug token information
    if (token) {
      console.log(`[Middleware] Token found for ${pathname} - user: ${token.name || 'unnamed'}`);
    } else {
      console.log(`[Middleware] No token found for ${pathname} - redirecting to signin`);
      return NextResponse.redirect(new URL('/signin', request.url));
    }
    
    // REDIRECT: Unauthenticated users to signin
    const isAuthenticated = !!(token && token.sub); 
    if (!isAuthenticated) {
      console.log(`[Middleware] Invalid token for ${pathname} - redirecting to signin`);
      return NextResponse.redirect(new URL('/signin', request.url));
    }
    
    // Allow request to proceed for authenticated users accessing protected routes
    console.log(`[Middleware] Auth OK for ${pathname}`);
    return NextResponse.next();
  } catch (error) {
    console.error('[Middleware] Error:', error);
    // On error, redirect to signin to be safe
    return NextResponse.redirect(new URL('/signin', request.url));
  }
}

// Configure which paths the middleware runs on
export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|debug-auth|favicon.ico).*)'],
}; 