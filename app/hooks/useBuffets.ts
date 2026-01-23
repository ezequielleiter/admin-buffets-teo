import { useState, useEffect } from 'react';
import { 
  Buffet, 
  BuffetFilters, 
  CreateBuffetData, 
  PaginatedResponse,
  ApiError 
} from '../../types/api';
import { useAuth } from './useAuth';

interface UseBuffetsResult {
  buffets: Buffet[];
  total: number;
  loading: boolean;
  error: string | null;
  createBuffet: (data: CreateBuffetData) => Promise<Buffet | null>;
  reload: () => Promise<void>;
}

export function useBuffets(filters: BuffetFilters = {}): UseBuffetsResult {
  const { user } = useAuth();
  const [data, setData] = useState<{
    buffets: Buffet[];
    total: number;
    loading: boolean;
    error: string | null;
  }>({
    buffets: [],
    total: 0,
    loading: true,
    error: null
  });

  const buildQuery = (params: Record<string, any>, user): string => {
    const query = new URLSearchParams();
    
    // Aplicar filtros automáticos según el rol del usuario
    const finalParams = { ...params };
    if (user && user.role === 'admin') {
      // Para usuarios admin, filtrar automáticamente por su user_id
      finalParams.user_id = user.id;
    }

    Object.entries(finalParams).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        query.append(key, value.toString());
      }
    });
    console.log( `?${query.toString()}`);
    
    return query.toString() ? `?${query.toString()}` : '';
  };

  const loadBuffets = async () => {
    if (!user) return; // No cargar hasta que tengamos la información del usuario
    console.log(user);
    
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin-buffets/buffets${buildQuery(filters, user)}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al cargar buffets');
      }

      const result = await response.json();
      setData({
        buffets: result.buffets || [],
        total: result.total || 0,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error loading buffets:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }));
    }
  };

  const createBuffet = async (buffetData: CreateBuffetData): Promise<Buffet | null> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin-buffets/buffets`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buffetData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear buffet');
      }

      const result = await response.json();
      await loadBuffets(); // Recargar lista
      return result.buffet;
    } catch (error) {
      console.error('Error creating buffet:', error);
      setData(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error al crear buffet'
      }));
      return null;
    }
  };

  useEffect(() => {
    if (user) {
      loadBuffets();
    }
  }, [user, JSON.stringify(filters)]);

  return {
    ...data,
    createBuffet,
    reload: loadBuffets
  };
}