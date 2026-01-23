'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import teoAuth from '../lib/teoAuth';

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verificar sesión actual desde el servidor
        const sessionData = await teoAuth.getCurrentSession();
        
        if (sessionData?.user && teoAuth.isSessionValid) {
          setAuthState({
            user: sessionData.user,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          // Limpiar cualquier sesión local inválida
          if (sessionData === null) {
            teoAuth.clearSession();
          }
          setAuthState({ user: null, isLoading: false, isAuthenticated: false });
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setAuthState({ user: null, isLoading: false, isAuthenticated: false });
      }
    };

    checkAuth();
  }, []);

  const logout = async () => {
    try {
      const success = await teoAuth.signOut();
      if (success) {
        setAuthState({ user: null, isLoading: false, isAuthenticated: false });
        router.push('/login');
      }
      return success;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  };

  const login = async (email: string, password: string) => {
    const result = await teoAuth.authenticate(email, password);
    
    if (result.success && result.user) {
      setAuthState({
        user: result.user,
        isLoading: false,
        isAuthenticated: true,
      });
    }
    
    return result;
  };

  return {
    ...authState,
    logout,
    login,
    teoAuth, // Exponer el cliente para uso directo
  };
};

