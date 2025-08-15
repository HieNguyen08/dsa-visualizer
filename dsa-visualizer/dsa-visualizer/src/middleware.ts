import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/auth/signin',
    '/auth/signup',
    '/auth/forgot-password',
    '/api/auth',
  ];

  // Guest accessible routes (limited functionality)
  const guestRoutes = [
    '/dashboard',
    '/visualizer/sorting',
    '/visualizer/binary-tree',
    '/visualizer/stack',
    '/visualizer/queue',
  ];

  // Admin only routes
  const adminRoutes = [
    '/admin',
  ];

  // Protected routes that require authentication
  const protectedRoutes = [
    '/playground',
    '/profiler',
    '/learn',
    '/comparison',
    '/community',
    '/profile',
    '/settings',
  ];

  // Allow access to public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Handle guest mode
  if (pathname === '/dashboard' && request.nextUrl.searchParams.get('mode') === 'guest') {
    return NextResponse.next();
  }

  // Check if user is trying to access admin routes
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
    if (token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard?error=unauthorized', request.url));
    }
    return NextResponse.next();
  }

  // Check if user is trying to access protected routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
    return NextResponse.next();
  }

  // For guest routes, allow access but add headers to identify guest mode
  if (guestRoutes.some(route => pathname.startsWith(route))) {
    if (!token) {
      const response = NextResponse.next();
      response.headers.set('X-User-Mode', 'guest');
      return response;
    }
    return NextResponse.next();
  }

  // Default: require authentication for all other routes
  if (!token) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
