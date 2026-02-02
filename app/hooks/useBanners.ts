import { useState, useEffect, useMemo, useCallback } from 'react';
import teoAuth from '../lib/teoAuth';
import { 
  Banner, 
  BannerFilters, 
  CreateBannerData,
  UpdateBannerData, 
  PaginatedResponse,
  ApiError 
} from '../../types/api';

interface UseBannersResult {
  banners: Banner[];
  total: number;
  loading: boolean;
  error: string | null;
  createBanner: (data: CreateBannerData) => Promise<Banner | null>;
  updateBanner: (id: string, data: UpdateBannerData) => Promise<Banner | null>;
  deleteBanner: (id: string) => Promise<boolean>;
  reload: () => Promise<void>;
}

export function useBanners(filters: BannerFilters = {}): UseBannersResult {
  const [data, setData] = useState<{
    banners: Banner[];
    total: number;
    loading: boolean;
    error: string | null;
  }>({
    banners: [],
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

  const loadBanners = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await teoAuth.authenticatedRequest(`/api/admin-buffets/banners${buildQuery(memoizedFilters)}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al cargar banners');
      }

      const result = await response.json();
      setData({
        banners: result.banners || [],
        total: result.total || 0,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error loading banners:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }));
    }
  }, [memoizedFilters, buildQuery]);

  const createBanner = async (bannerData: CreateBannerData): Promise<Banner | null> => {
    try {
      const response = await teoAuth.authenticatedRequest('/api/admin-buffets/banners', {
        method: 'POST',
        body: JSON.stringify(bannerData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear banner');
      }

      const result = await response.json();
      await loadBanners(); // Recargar lista
      return result.banner;
    } catch (error) {
      console.error('Error creating banner:', error);
      setData(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error al crear banner'
      }));
      return null;
    }
  };

  const updateBanner = async (id: string, bannerData: UpdateBannerData): Promise<Banner | null> => {
    try {
      const response = await teoAuth.authenticatedRequest(`/api/admin-buffets/banners/${id}`, {
        method: 'PUT',
        body: JSON.stringify(bannerData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar banner');
      }

      const result = await response.json();
      await loadBanners(); // Recargar lista
      return result.banner;
    } catch (error) {
      console.error('Error updating banner:', error);
      setData(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error al actualizar banner'
      }));
      return null;
    }
  };

  const deleteBanner = async (id: string): Promise<boolean> => {
    try {
      const response = await teoAuth.authenticatedRequest(`/api/admin-buffets/banners/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar banner');
      }

      await loadBanners(); // Recargar lista
      return true;
    } catch (error) {
      console.error('Error deleting banner:', error);
      setData(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error al eliminar banner'
      }));
      return false;
    }
  };

  useEffect(() => {
    loadBanners();
  }, [loadBanners]);

  return {
    ...data,
    createBanner,
    updateBanner,
    deleteBanner,
    reload: loadBanners
  };
}

// Hook específico para obtener banners de un buffet específico
export function useBuffetBanners(buffet_id: string) {
  return useBanners({ buffet_id, limite: 100 }); // Sin paginación para uso específico
}