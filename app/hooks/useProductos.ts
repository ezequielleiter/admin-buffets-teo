import { useState, useEffect, useMemo, useCallback } from 'react';
import teoAuth from '../lib/teoAuth';
import { 
  Producto, 
  ProductoFilters, 
  CreateProductoData,
  UpdateProductoData, 
  PaginatedResponse,
  ApiError 
} from '../../types/api';

interface UseProductosResult {
  productos: Producto[];
  total: number;
  loading: boolean;
  error: string | null;
  createProducto: (data: CreateProductoData) => Promise<Producto | null>;
  updateProducto: (id: string, data: UpdateProductoData) => Promise<Producto | null>;
  deleteProducto: (id: string) => Promise<boolean>;
  reload: () => Promise<void>;
}

export function useProductos(filters: ProductoFilters = {}): UseProductosResult {
  const [data, setData] = useState<{
    productos: Producto[];
    total: number;
    loading: boolean;
    error: string | null;
  }>({
    productos: [],
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

  const loadProductos = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await teoAuth.authenticatedRequest(`/api/admin-buffets/productos${buildQuery(memoizedFilters)}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al cargar productos');
      }

      const result = await response.json();
      setData({
        productos: result.productos || [],
        total: result.total || 0,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error loading productos:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }));
    }
  }, [memoizedFilters, buildQuery]);

  const createProducto = async (productoData: CreateProductoData): Promise<Producto | null> => {
    try {
      const response = await teoAuth.authenticatedRequest('/api/admin-buffets/productos', {
        method: 'POST',
        body: JSON.stringify(productoData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear producto');
      }

      const result = await response.json();
      await loadProductos(); // Recargar lista
      return result.producto;
    } catch (error) {
      console.error('Error creating producto:', error);
      setData(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error al crear producto'
      }));
      return null;
    }
  };

  const updateProducto = async (id: string, productoData: UpdateProductoData): Promise<Producto | null> => {
    try {
      const response = await teoAuth.authenticatedRequest(`/api/admin-buffets/productos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(productoData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar producto');
      }

      const result = await response.json();
      await loadProductos(); // Recargar lista
      return result.producto;
    } catch (error) {
      console.error('Error updating producto:', error);
      setData(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error al actualizar producto'
      }));
      return null;
    }
  };

  const deleteProducto = async (id: string): Promise<boolean> => {
    try {
      const response = await teoAuth.authenticatedRequest(`/api/admin-buffets/productos/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar producto');
      }

      await loadProductos(); // Recargar lista
      return true;
    } catch (error) {
      console.error('Error deleting producto:', error);
      setData(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error al eliminar producto'
      }));
      return false;
    }
  };

  useEffect(() => {
    loadProductos();
  }, [loadProductos]);

  return {
    ...data,
    createProducto,
    updateProducto,
    deleteProducto,
    reload: loadProductos
  };
}

// Hook específico para obtener productos de un buffet específico (para el POS)
export function useBuffetProductos(buffet_id: string) {
  return useProductos({ buffet_id, limite: 100 }); // Sin paginación para el POS
}