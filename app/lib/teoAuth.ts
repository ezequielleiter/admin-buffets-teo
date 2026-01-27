'use client';

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

interface AuthResult {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

interface SessionData {
  user: User;
  token: string;
  expires: string;
}

class TeoAuthClient {
  private baseUrl: string;
  private sessionData: SessionData | null;

  constructor(apiBaseUrl: string) {
    this.baseUrl = apiBaseUrl;
    this.sessionData = this.getStoredSession();
  }

  // Login usando la nueva API JWT
  async authenticate(email: string, password: string): Promise<AuthResult> {
    try {
      const loginResponse = await fetch(`${this.baseUrl}/api/auth/login-external`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });
      
      const loginData = await loginResponse.json();
      
      if (loginResponse.ok && loginData.success) {
        // Crear sesión con los datos recibidos
        const sessionData: SessionData = {
          user: loginData.user,
          token: loginData.token,
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 días
        };
        
        this.storeSession(sessionData);
        
        return { 
          success: true, 
          user: loginData.user, 
          token: loginData.token 
        };
      }
      
      return { 
        success: false, 
        error: loginData.error || 'Credenciales incorrectas' 
      };
    } catch (error) {
      console.error('Error en autenticación:', error);
      return { success: false, error: 'Error de conexión' };
    }
  }

  // Verificar token JWT
  async verifyToken(): Promise<boolean> {
    try {
      if (!this.sessionData?.token) {
        return false;
      }
      
      const response = await fetch(`${this.baseUrl}/api/auth/verify-token`, {
        headers: {
          'Authorization': `Bearer ${this.sessionData.token}`,
          'Accept': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.valid && data.user) {
          // Actualizar datos del usuario si es necesario
          this.sessionData.user = data.user;
          this.storeSession(this.sessionData);
          return true;
        }
      }
      
      // Token inválido, limpiar sesión
      this.clearSessionInternal();
      return false;
    } catch (error) {
      console.error('❌ Error verificando token:', error);
      return false;
    }
  }

  // Obtener sesión actual (para compatibilidad)
  async getCurrentSession(): Promise<SessionData | null> {
    // Si tenemos una sesión local, verificar si es válida
    if (this.sessionData) {
      const isValid = await this.verifyToken();
      if (isValid) {
        return this.sessionData;
      } else {
        return null;
      }
    }
    
    return null;
  }

  // Cerrar sesión
  async signOut(): Promise<boolean> {
    try {
      // Limpiar sesión local siempre
      this.clearSessionInternal();
      
      return true;
    } catch (error) {
      console.error('Error cerrando sesión:', error);
      // Limpiar sesión local aunque falle
      this.clearSessionInternal();
      return false;
    }
  }

  // Hacer peticiones autenticadas usando JWT
  async authenticatedRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    if (!this.sessionData?.token) {
      throw new Error('No hay token de autenticación');
    }

    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.sessionData.token}`,
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
      localStorage.removeItem('teo-auth-token'); // Por si usamos esto en el futuro
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
      const response = await fetch(`${this.baseUrl}/api/auth/login-external`, {
        method: 'OPTIONS',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      const isConnected = response.ok || response.status === 405; // 405 = Method not allowed pero server responde
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
      hasToken: !!this.sessionData?.token,
      isAuthenticated: this.isAuthenticated,
      isSessionValid: this.isSessionValid,
      currentUser: this.currentUser
    };
  }
}


const teoAuth = new TeoAuthClient(process.env.NEXT_PUBLIC_API_URL || 'http://192.168.120.21:3000');

export default teoAuth;
export { TeoAuthClient };
export type { AuthResult, SessionData };
