'use client';

import { useState, useEffect } from 'react';
import teoAuth from '../lib/teoAuth';

interface DebugInfo {
  baseUrl: string;
  hasStoredSession: boolean;
  isAuthenticated: boolean;
  isSessionValid: boolean;
  currentUser: { id: string; email: string; name?: string } | null;
}

export default function AuthDebugPanel() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateDebugInfo = () => {
      setDebugInfo(teoAuth.getDebugInfo());
    };

    const checkConnection = async () => {
      const connected = await teoAuth.checkBackendConnection();
      setIsBackendConnected(connected);
    };

    updateDebugInfo();
    checkConnection();

    // Actualizar cada 5 segundos en desarrollo
    if (process.env.NODE_ENV === 'development') {
      const interval = setInterval(() => {
        updateDebugInfo();
        checkConnection();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, []);

  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed top-4 right-4 z-50 bg-surface-dark text-surface-light px-3 py-1 rounded text-xs font-mono hover:bg-primary transition-colors"
      >
        🐛 Debug
      </button>

      {/* Debug panel */}
      {isVisible && (
        <div className="fixed top-16 right-4 z-50 bg-surface-dark text-green-400 p-4 rounded-lg shadow-xl max-w-md text-xs font-mono">
          <div className="mb-2 text-accent-orange font-bold">Auth Debug Panel</div>
          
          <div className="mb-2">
            <span className="text-blue-400">Backend Status:</span>
            <span className={`ml-2 ${isBackendConnected ? 'text-green-400' : 'text-red-400'}`}>
              {isBackendConnected === null ? '⏳ Checking...' : 
               isBackendConnected ? '✅ Connected' : '❌ Disconnected'}
            </span>
          </div>

          {debugInfo && (
            <div className="space-y-1">
              <div>
                <span className="text-blue-400">Base URL:</span>
                <span className="ml-2 text-surface-light">{debugInfo.baseUrl}</span>
              </div>
              <div>
                <span className="text-blue-400">Has Session:</span>
                <span className={`ml-2 ${debugInfo.hasStoredSession ? 'text-green-400' : 'text-red-400'}`}>
                  {debugInfo.hasStoredSession ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="text-blue-400">Authenticated:</span>
                <span className={`ml-2 ${debugInfo.isAuthenticated ? 'text-green-400' : 'text-red-400'}`}>
                  {debugInfo.isAuthenticated ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="text-blue-400">Session Valid:</span>
                <span className={`ml-2 ${debugInfo.isSessionValid ? 'text-green-400' : 'text-red-400'}`}>
                  {debugInfo.isSessionValid ? 'Yes' : 'No'}
                </span>
              </div>
              {debugInfo.currentUser && (
                <div>
                  <span className="text-blue-400">User:</span>
                  <span className="ml-2 text-surface-light">{debugInfo.currentUser.email}</span>
                </div>
              )}
            </div>
          )}

          <div className="mt-3 pt-2 border-t border-gray-600">
            <div className="text-gray-400 text-xs">
              ENV: {process.env.NEXT_PUBLIC_API_URL || 'undefined'}
            </div>
          </div>
        </div>
      )}
    </>
  );
}