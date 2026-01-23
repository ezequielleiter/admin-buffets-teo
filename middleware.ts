import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Rutas que requieren autenticación
  const protectedPaths = ['/dashboard'];
  
  const { pathname } = request.nextUrl;
  
  // Verificar si la ruta actual requiere autenticación
  const isProtectedPath = protectedPaths.some(path => 
    pathname.startsWith(path)
  );
  
  // Si es una ruta protegida, verificar autenticación
  if (isProtectedPath) {
    // NextAuth maneja las sesiones a través de cookies específicas
    const sessionToken = request.cookies.get('next-auth.session-token')?.value ||
                         request.cookies.get('__Secure-next-auth.session-token')?.value ||
                         request.cookies.get('teo-auth-session')?.value;
    
    if (!sessionToken) {
      // Redirigir al login si no hay token de sesión
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  // Si está en login y ya tiene una sesión, redirigir al dashboard
  if (pathname === '/login') {
    const sessionToken = request.cookies.get('next-auth.session-token')?.value ||
                         request.cookies.get('__Secure-next-auth.session-token')?.value ||
                         request.cookies.get('teo-auth-session')?.value;
    
    if (sessionToken) {
      const dashboardUrl = new URL('/dashboard', request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }
  
  // Redirigir root según estado de autenticación
  if (pathname === '/') {
    const sessionToken = request.cookies.get('next-auth.session-token')?.value ||
                         request.cookies.get('__Secure-next-auth.session-token')?.value ||
                         request.cookies.get('teo-auth-session')?.value;
    
    const redirectUrl = new URL(sessionToken ? '/dashboard' : '/login', request.url);
    return NextResponse.redirect(redirectUrl);
  }
  
  return NextResponse.next();
}

// Configurar las rutas donde se ejecuta el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};