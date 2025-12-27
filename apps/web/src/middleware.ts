import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected routes that require authentication
const protectedRoutes = ['/beneficiary'];

// Auth routes (redirect to dashboard if already logged in)
const authRoutes = ['/login', '/signup'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  
  // Check if the route is an auth route
  const isAuthRoute = authRoutes.some((route) =>
    pathname.startsWith(route)
  );
  
  // Get session token from cookies
  const sessionToken = request.cookies.get('better-auth.session_token')?.value;
  
  // If accessing protected route without session, redirect to login
  if (isProtectedRoute && !sessionToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // If accessing auth route with session, redirect to dashboard
  if (isAuthRoute && sessionToken) {
    return NextResponse.redirect(new URL('/beneficiary/medical-record', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
};

