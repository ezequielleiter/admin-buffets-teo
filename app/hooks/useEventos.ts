import { useState, useEffect, useMemo, useCallback } from 'react';
import teoAuth from '../lib/teoAuth';
import { 
  Evento, 
  EventoFilters, 
  CreateEventoData,
  UpdateEventoData, 
  PaginatedResponse,
  ApiError 
} from '../../types/api';

interface UseEventosResult {
  eventos: Evento[];
  total: number;
  loading: boolean;
  error: string | null;
  createEvento: (data: CreateEventoData) => Promise<Evento | null>;
  updateEvento: (id: string, data: UpdateEventoData) => Promise<Evento | null>;
  deleteEvento: (id: string) => Promise<boolean>;
  reload: () => Promise<void>;
}

export function useEventos(filters: EventoFilters = {}): UseEventosResult {
  const [data, setData] = useState<{
    eventos: Evento[];
    total: number;
    loading: boolean;
    error: string | null;
  }>({
    eventos: [],
    total: 0,
    loading: true,
    error: null
  });

  // Memoizar filters para evitar recreación en cada render
  const memoizedFilters = useMemo(() => filters, [JSON.stringify(filters)]);

  const buildQuery = useCallback((params: Record<string, any>): string => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        query.append(key, value.toString());
      }
    });
    return query.toString() ? `?${query.toString()}` : '';
  }, []);

  const loadEventos = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await teoAuth.authenticatedRequest(`/api/admin-buffets/eventos${buildQuery(memoizedFilters)}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al cargar eventos');
      }

      const result = await response.json();
      setData({
        eventos: result.eventos || [],
        total: result.total || 0,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error loading eventos:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }));
    }
  }, [memoizedFilters, buildQuery]);

  const createEvento = async (eventoData: CreateEventoData): Promise<Evento | null> => {
    try {
      const response = await teoAuth.authenticatedRequest('/api/admin-buffets/eventos', {
        method: 'POST',
        body: JSON.stringify(eventoData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear evento');
      }

      const result = await response.json();
      await loadEventos(); // Recargar lista
      return result.evento;
    } catch (error) {
      console.error('Error creating evento:', error);
      setData(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error al crear evento'
      }));
      return null;
    }
  };

  const updateEvento = async (id: string, eventoData: UpdateEventoData): Promise<Evento | null> => {
    try {
      const response = await teoAuth.authenticatedRequest(`/api/admin-buffets/eventos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(eventoData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar evento');
      }

      const result = await response.json();
      await loadEventos(); // Recargar lista
      return result.evento;
    } catch (error) {
      console.error('Error updating evento:', error);
      setData(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error al actualizar evento'
      }));
      return null;
    }
  };

  const deleteEvento = async (id: string): Promise<boolean> => {
    try {
      const response = await teoAuth.authenticatedRequest(`/api/admin-buffets/eventos/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar evento');
      }

      await loadEventos(); // Recargar lista
      return true;
    } catch (error) {
      console.error('Error deleting evento:', error);
      setData(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error al eliminar evento'
      }));
      return false;
    }
  };

  useEffect(() => {
    loadEventos();
  }, [loadEventos]);

  return {
    ...data,
    createEvento,
    updateEvento,
    deleteEvento,
    reload: loadEventos
  };
}