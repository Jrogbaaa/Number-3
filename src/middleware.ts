import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // PUBLIC PATHS: Allow access to public resources and API routes
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api/') ||
    pathname.startsWith('/signin') ||
    pathname.startsWith('/debug-auth') ||
    pathname === '/' || // Allow access to home page
    pathname.includes('.') // Files like favicon.ico, etc.
  ) {
    return NextResponse.next();
  }

  try {
    // Get session token with explicit secret
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === 'production'
    });
    
    // IMPORTANT: Add stronger verification of the token
    // Only consider user authenticated if token exists AND has required properties
    const tokenExpiry = token?.exp ? Number(token.exp) : 0;
    const isAuthenticated = !!(
      token && 
      token.sub && // User ID must exist
      tokenExpiry > Math.floor(Date.now() / 1000) // Token must not be expired
    );
    
    // REDIRECT: Unauthenticated users to signin (except for signin page)
    if (!isAuthenticated && pathname !== '/signin') {
      console.log(`Middleware: User not authenticated, redirecting to signin`);
      const url = new URL('/signin', request.url);
      return NextResponse.redirect(url);
    }
    
    // REDIRECT: Authenticated users trying to access signin to dashboard
    // Note: We're no longer redirecting from root (/) to allow the sign-in button to be displayed
    if (isAuthenticated && pathname === '/signin') {
      console.log(`Middleware: User authenticated, redirecting to dashboard`);
      const url = new URL('/dashboard', request.url);
      return NextResponse.redirect(url);
    }
    
    // Allow request to proceed for authenticated users accessing protected routes
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    // On error, redirect to signin to be safe
    if (pathname !== '/signin') {
      const url = new URL('/signin', request.url);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }
}

// Configure which paths the middleware runs on
export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|debug-auth|favicon.ico).*)'],
}; 