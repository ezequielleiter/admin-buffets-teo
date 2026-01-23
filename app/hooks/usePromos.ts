import { useState, useEffect } from 'react';
import { 
  Promo, 
  PromoFilters, 
  CreatePromoData,
  UpdatePromoData, 
  PaginatedResponse,
  ApiError 
} from '../../types/api';

interface UsePromosResult {
  promos: Promo[];
  total: number;
  loading: boolean;
  error: string | null;
  createPromo: (data: CreatePromoData) => Promise<Promo | null>;
  updatePromo: (id: string, data: UpdatePromoData) => Promise<Promo | null>;
  deletePromo: (id: string) => Promise<boolean>;
  reload: () => Promise<void>;
}

export function usePromos(filters: PromoFilters = {}): UsePromosResult {
  const [data, setData] = useState<{
    promos: Promo[];
    total: number;
    loading: boolean;
    error: string | null;
  }>({
    promos: [],
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

  const loadPromos = async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin-buffets/promos${buildQuery(filters)}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al cargar promos');
      }

      const result = await response.json();
      setData({
        promos: result.promos || [],
        total: result.total || 0,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error loading promos:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }));
    }
  };

  const createPromo = async (promoData: CreatePromoData): Promise<Promo | null> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin-buffets/promos`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(promoData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear promo');
      }

      const result = await response.json();
      await loadPromos(); // Recargar lista
      return result.promo;
    } catch (error) {
      console.error('Error creating promo:', error);
      setData(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error al crear promo'
      }));
      return null;
    }
  };

  const updatePromo = async (id: string, promoData: UpdatePromoData): Promise<Promo | null> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin-buffets/promos/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(promoData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar promo');
      }

      const result = await response.json();
      await loadPromos(); // Recargar lista
      return result.promo;
    } catch (error) {
      console.error('Error updating promo:', error);
      setData(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error al actualizar promo'
      }));
      return null;
    }
  };

  const deletePromo = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin-buffets/promos/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar promo');
      }

      await loadPromos(); // Recargar lista
      return true;
    } catch (error) {
      console.error('Error deleting promo:', error);
      setData(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error al eliminar promo'
      }));
      return false;
    }
  };

  useEffect(() => {
    loadPromos();
  }, [JSON.stringify(filters)]);

  return {
    ...data,
    createPromo,
    updatePromo,
    deletePromo,
    reload: loadPromos
  };
}