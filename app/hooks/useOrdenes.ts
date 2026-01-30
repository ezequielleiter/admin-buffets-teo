'use client';

import { useState, useCallback } from 'react';
import teoAuth from '../lib/teoAuth';
import { CreateOrdenData, Orden } from '../../types/api';

// Define possible order states
export const ORDER_STATES = {
  PENDIENTE: 'pendiente',
  ENTREGADO: 'entregado',
  CANCELADO: 'cancelado',
};

export function useOrdenes() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrden = useCallback(async (data: CreateOrdenData): Promise<Orden | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await teoAuth.authenticatedRequest('/api/admin-buffets/ordenes', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear orden');
      }

      const result = await response.json();
      return result.orden;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOrden = useCallback(async (ordenId: string, nuevoEstado: 'entregado' | 'cancelado' | 'pendiente'): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      
      const response = await teoAuth.authenticatedRequest(`/api/admin-buffets/ordenes/${ordenId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar la orden');
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createOrden,
    updateOrden,
    loading,
    error,
  };
}