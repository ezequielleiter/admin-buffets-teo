'use client';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

interface SessionData {
  user: {
    id: string;
    email: string;
    name?: string;
  };
  expires: string;
}

class TeoAuthClient {
  private baseUrl: string;
  private sessionData: SessionData | null;

  constructor(apiBaseUrl: string) {
    this.baseUrl = apiBaseUrl;
    this.sessionData = this.getStoredSession();
  }

  // Obtener token CSRF requerido por NextAuth
  async fetchCSRFToken(): Promise<string> {
    try {
      console.log('🔑 Obteniendo token CSRF de:', `${this.baseUrl}/api/auth/csrf`);
      
      const response = await fetch(`${this.baseUrl}/api/auth/csrf`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      console.log('📡 Respuesta CSRF:', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText
      });
      
      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('🎫 Token CSRF obtenido exitosamente');
      return data.csrfToken;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('❌ Error fetching CSRF token:', {
        error,
        message: errorMessage,
        baseUrl: this.baseUrl
      });
      throw new Error(`No se pudo obtener el token CSRF: ${errorMessage}`);
    }
  }

  // Login usando credentials provider
  async authenticate(email: string, password: string): Promise<AuthResult> {
    try {
      const csrfToken = await this.fetchCSRFToken();
      
      const loginResponse = await fetch(`${this.baseUrl}/api/auth/callback/credentials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          email: email,
          password: password,
          csrfToken: csrfToken,
          json: 'true'
        }),
        credentials: 'include' // Importante para manejar cookies
      });

      if (loginResponse.ok) {
        // Verificar si la autenticación fue exitosa obteniendo la sesión
        const sessionInfo = await this.getCurrentSession();
        if (sessionInfo?.user) {
          this.storeSession(sessionInfo);
          return { success: true, user: sessionInfo.user };
        }
      }
      
      return { success: false, error: 'Credenciales incorrectas' };
    } catch (error) {
      console.error('Error en autenticación:', error);
      return { success: false, error: 'Error de conexión' };
    }
  }

  // Obtener sesión actual
  async getCurrentSession(): Promise<SessionData | null> {
    try {
      console.log('🔍 Intentando obtener sesión de:', `${this.baseUrl}/api/auth/session`);
      
      const response = await fetch(`${this.baseUrl}/api/auth/session`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      console.log('📡 Respuesta del servidor:', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });
      
      if (response.ok) {
        const sessionData = await response.json();
        console.log('📦 Datos de sesión recibidos:', sessionData);
        
        // NextAuth puede devolver un objeto vacío si no hay sesión
        if (sessionData && sessionData.user) {
          return sessionData as SessionData;
        }
      } else {
        console.warn('⚠️ Respuesta no exitosa del servidor');
      }
      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('❌ Error obteniendo sesión:', {
        error,
        message: errorMessage,
        baseUrl: this.baseUrl,
        fullUrl: `${this.baseUrl}/api/auth/session`
      });
      
      // Si es un error de conexión, no es crítico al inicio
      if (errorMessage.includes('Failed to fetch')) {
        console.warn('🔄 No se pudo conectar al backend - continuando sin sesión');
      }
      
      return null;
    }
  }

  // Cerrar sesión
  async signOut(): Promise<boolean> {
    try {
      const csrfToken = await this.fetchCSRFToken();
      
      const response = await fetch(`${this.baseUrl}/api/auth/signout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          csrfToken: csrfToken
        }),
        credentials: 'include'
      });
      
      if (response.ok) {
        this.clearSessionInternal();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error cerrando sesión:', error);
      return false;
    }
  }

  // Hacer peticiones autenticadas a tus APIs
  async authenticatedRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const defaultOptions: RequestInit = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    return fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      ...defaultOptions
    });
  }

  // Utilidades para manejar sesión local
  private storeSession(sessionData: SessionData): void {
    localStorage.setItem('teo-auth-session', JSON.stringify(sessionData));
    this.sessionData = sessionData;
  }

  private getStoredSession(): SessionData | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const stored = localStorage.getItem('teo-auth-session');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private clearSessionInternal(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('teo-auth-session');
    }
    this.sessionData = null;
  }

  // Método público para limpiar sesión (usado por useAuth)
  clearSession(): void {
    this.clearSessionInternal();
  }

  get currentUser() {
    return this.sessionData?.user || null;
  }

  get isAuthenticated(): boolean {
    return !!this.currentUser && this.sessionData !== null;
  }

  // Verificar si la sesión ha expirado
  get isSessionValid(): boolean {
    if (!this.sessionData) return false;
    
    const expiresAt = new Date(this.sessionData.expires);
    return expiresAt > new Date();
  }

  // Verificar conectividad con el backend
  async checkBackendConnection(): Promise<boolean> {
    try {
      console.log('🔗 Verificando conexión con backend...');
      const response = await fetch(`${this.baseUrl}/api/auth/csrf`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        // No incluir credentials aquí para evitar errores de CORS en la verificación
      });
      
      const isConnected = response.ok;
      console.log(isConnected ? '✅ Backend conectado' : '❌ Backend no disponible');
      return isConnected;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.log('❌ No se puede conectar al backend:', errorMessage);
      return false;
    }
  }

  // Obtener información de debug
  getDebugInfo() {
    return {
      baseUrl: this.baseUrl,
      hasStoredSession: !!this.sessionData,
      isAuthenticated: this.isAuthenticated,
      isSessionValid: this.isSessionValid,
      currentUser: this.currentUser
    };
  }
}

// Crear instancia singleton con debugging
console.log('🚀 Inicializando TeoAuthClient con URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000');

const teoAuth = new TeoAuthClient(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000');

export default teoAuth;
export { TeoAuthClient };
export type { AuthResult, SessionData };
