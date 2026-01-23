import { useState, useEffect } from 'react';
import { 
  Evento, 
  EventoFilters, 
  CreateEventoData, 
  PaginatedResponse,
  ApiError 
} from '../../types/api';

interface UseEventosResult {
  eventos: Evento[];
  total: number;
  loading: boolean;
  error: string | null;
  createEvento: (data: CreateEventoData) => Promise<Evento | null>;
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

  const buildQuery = (params: Record<string, any>): string => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        query.append(key, value.toString());
      }
    });
    return query.toString() ? `?${query.toString()}` : '';
  };

  const loadEventos = async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin-buffets/eventos${buildQuery(filters)}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

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
  };

  const createEvento = async (eventoData: CreateEventoData): Promise<Evento | null> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin-buffets/eventos`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
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

  useEffect(() => {
    loadEventos();
  }, [JSON.stringify(filters)]);

  return {
    ...data,
    createEvento,
    reload: loadEventos
  };
}