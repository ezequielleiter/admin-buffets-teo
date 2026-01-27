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
  
  if (isProtectedPath) {
    // En el nuevo sistema JWT, la verificación se hace del lado del cliente
    // El middleware solo redirige rutas básicas
    
    // TODO: Aquí podrías verificar un token en cookies si decides usarlas
    // Por ahora, dejamos que el cliente (useAuth) maneje la autenticación
  }
  
  if (pathname === '/') {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
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