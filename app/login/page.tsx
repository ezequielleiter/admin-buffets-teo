'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import teoAuth from '../lib/teoAuth';
import AuthDebugPanel from '../components/AuthDebugPanel';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const sessionData = await teoAuth.getCurrentSession();
        if (sessionData?.user && teoAuth.isSessionValid) {
          router.push('/dashboard');
        } else {
        }
      } catch (error) {
        console.error('⚠️ Error checking auth (no crítico):', error);
        // No es crítico si no puede verificar la sesión al inicio
        // El usuario simplemente permanecerá en el login
      }
    };
    
    // Pequeño delay para evitar problemas de hidratación
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await teoAuth.authenticate(email, password);
      
      if (result.success) {
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        setError(result.error || 'Error en el inicio de sesión. Verifica tus credenciales.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Error de conexión. Por favor, intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AuthDebugPanel />
      <div className="min-h-screen flex flex-col bg-surface-light font-display">
        {/* Top Navigation Bar */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-200 bg-white px-10 py-3">
          <div className="flex items-center gap-4 text-text-primary">
            <h2 className="text-text-primary text-xl font-bold leading-tight tracking-[-0.015em]">
              Buffests
            </h2>
          </div>
        </header>

        {/* Main Content Area: Centered Login Card */}
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-[440px] w-full">
            {/* Card Container */}
            <div className="flex flex-col items-stretch justify-start rounded-xl shadow-lg bg-white overflow-hidden">

              {/* Form Content */}
              <div className="flex w-full grow flex-col items-stretch justify-center gap-6 py-8 px-8">
                <div className="text-center mb-2">
                  <p className="text-text-primary text-lg font-bold leading-tight tracking-[-0.015em]">
                    Buffests Login
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {/* Error Message */}
                  {error && (
                    <div className="w-full p-3 rounded-lg bg-red-50 border border-red-200">
                      <p className="text-red-800 text-sm font-medium">{error}</p>
                    </div>
                  )}
                  
                  {/* Email Field */}
                  <div className="flex flex-col w-full">
                    <label className="flex flex-col w-full">
                      <p className="text-text-primary text-sm font-semibold leading-normal pb-2">
                        Email
                      </p>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-xl">
                          email
                        </span>
                        <input
                          className="form-input flex w-full resize-none overflow-hidden rounded-lg text-text-primary focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-gray-300 bg-white focus:border-primary h-12 placeholder:text-text-secondary pl-10 pr-4 text-base font-normal leading-normal transition-colors"
                          placeholder="Ingresa tu email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </label>
                  </div>

                  {/* Password Field */}
                  <div className="flex flex-col w-full">
                    <label className="flex flex-col w-full">
                      <p className="text-text-primary text-sm font-semibold leading-normal pb-2">
                        Contraseña
                      </p>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-xl">
                          lock
                        </span>
                        <input
                          className="form-input flex w-full resize-none overflow-hidden rounded-lg text-text-primary focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-gray-300 bg-white focus:border-primary h-12 placeholder:text-text-secondary pl-10 pr-4 text-base font-normal leading-normal transition-colors"
                          placeholder="Ingresa tu contraseña"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </label>
                  </div>

                  {/* Login Button */}
                  <div className="flex pt-4">
                    <button
                      className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary hover:bg-accent-blue disabled:bg-secondary disabled:cursor-not-allowed text-white text-base font-bold leading-normal tracking-[0.015em] transition-all shadow-md active:scale-[0.98] disabled:active:scale-100"
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span className="truncate">Iniciando sesión...</span>
                        </div>
                      ) : (
                        <span className="truncate">Iniciar Sesión</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}