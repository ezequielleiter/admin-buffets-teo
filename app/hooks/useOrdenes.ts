'use client';

import { useState, useCallback } from 'react';
import { CreateOrdenData, Orden } from '../../types/api';

export function useOrdenes() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrden = useCallback(async (data: CreateOrdenData): Promise<Orden | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin-buffets/ordenes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
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

  return {
    createOrden,
    loading,
    error,
  };
}