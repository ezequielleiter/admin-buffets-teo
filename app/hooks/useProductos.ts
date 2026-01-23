import { useState, useEffect } from 'react';
import { 
  Producto, 
  ProductoFilters, 
  CreateProductoData, 
  PaginatedResponse,
  ApiError 
} from '../../types/api';

interface UseProductosResult {
  productos: Producto[];
  total: number;
  loading: boolean;
  error: string | null;
  createProducto: (data: CreateProductoData) => Promise<Producto | null>;
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

  const buildQuery = (params: Record<string, any>): string => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        query.append(key, value.toString());
      }
    });
    return query.toString() ? `?${query.toString()}` : '';
  };

  const loadProductos = async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin-buffets/productos${buildQuery(filters)}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

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
  };

  const createProducto = async (productoData: CreateProductoData): Promise<Producto | null> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin-buffets/productos`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
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

  useEffect(() => {
    loadProductos();
  }, [JSON.stringify(filters)]);

  return {
    ...data,
    createProducto,
    reload: loadProductos
  };
}