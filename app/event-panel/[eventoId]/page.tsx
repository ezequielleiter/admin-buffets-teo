'use client';

import { useParams } from 'next/navigation';
import { useState, useMemo, useEffect } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useBuffetProductos } from '../../hooks/useProductos';
import { useBuffetPromos } from '../../hooks/usePromos';
import { useOrdenes } from '../../hooks/useOrdenes';
import { useAuth } from '../../hooks/useAuth';
import { Evento, Producto, Promo, ItemProducto } from '../../../types/api';

// Tipo para items del carrito
interface CartItem {
  id: string;
  tipo: 'producto' | 'promo';
  nombre: string;
  precio: number;
  cantidad: number;
  descripcion: string;
}

function EventPanelContent() {
  const params = useParams();
  const eventoId = params?.eventoId as string;
  
  const { user } = useAuth();
  const { createOrden, loading: ordenLoading } = useOrdenes();
  
  const [evento, setEvento] = useState<Evento | null>(null);
  const [loadingEvento, setLoadingEvento] = useState(true);
  const [errorEvento, setErrorEvento] = useState<string | null>(null);
  
  const { productos, loading: productosLoading } = useBuffetProductos(evento?.buffet_id || '');
  const { promos, loading: promosLoading } = useBuffetPromos(evento?.buffet_id || '');

  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);

  // Cargar evento específico
  useEffect(() => {
    const fetchEvento = async () => {
      try {
        setLoadingEvento(true);
        setErrorEvento(null);

        // Usar el endpoint de lista para obtener todos los eventos y buscar el específico
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin-buffets/eventos?limite=100&pagina=1`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('Error al cargar eventos');
        }

        const result = await response.json();
        // Buscar el evento específico en los resultados
        const eventoEncontrado = result.eventos?.find((e: Evento) => e._id === eventoId);
        
        if (!eventoEncontrado) {
          throw new Error('Evento no encontrado');
        }
        
        setEvento(eventoEncontrado);
      } catch (error) {
        setErrorEvento('No se pudo cargar la información del evento');
        console.error('Error loading evento:', error);
      } finally {
        setLoadingEvento(false);
      }
    };

    if (eventoId) {
      fetchEvento();
    }
  }, [eventoId]);

  // Filtrar productos y promos por búsqueda
  const filteredItems = useMemo(() => {
    const allItems: Array<(Producto | Promo) & { type: 'producto' | 'promo' }> = [
      ...productos.map(p => ({ ...p, type: 'producto' as const })),
      ...promos.map(p => ({ ...p, type: 'promo' as const }))
    ];

    if (!searchQuery.trim()) return allItems;

    return allItems.filter(item =>
      item.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ('descripcion' in item && item.descripcion?.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [productos, promos, searchQuery]);

  // Calcular total del carrito
  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  }, [cart]);

  const addToCart = (item: Producto | Promo, type: 'producto' | 'promo') => {
    setCart(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === item._id && cartItem.tipo === type);
      
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.id === item._id && cartItem.tipo === type
            ? { ...cartItem, cantidad: cartItem.cantidad + 1 }
            : cartItem
        );
      }
      
      return [...prev, {
        id: item._id!,
        tipo: type,
        nombre: item.nombre,
        precio: item.valor,
        cantidad: 1,
        descripcion: 'descripcion' in item ? item.descripcion : 'Promoción especial'
      }];
    });
  };

  const updateCartQuantity = (id: string, tipo: 'producto' | 'promo', newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(id, tipo);
      return;
    }

    setCart(prev =>
      prev.map(item =>
        item.id === id && item.tipo === tipo
          ? { ...item, cantidad: newQuantity }
          : item
      )
    );
  };

  const removeFromCart = (id: string, tipo: 'producto' | 'promo') => {
    setCart(prev => prev.filter(item => !(item.id === id && item.tipo === tipo)));
  };

  const clearCart = () => {
    setCart([]);
  };

  const finalizarVenta = async () => {
    if (!evento || cart.length === 0) return;

    const productosOrden: ItemProducto[] = cart.map(item => ({
      tipo: item.tipo,
      id: item.id,
      cantidad: item.cantidad,
      precio_unitario: item.precio
    }));

    const ordenData = {
      buffet_id: evento.buffet_id,
      evento_id: evento._id!,
      productos: productosOrden,
      total: cartTotal,
      forma_pago: 'efectivo' as const,
      nota: `Venta realizada desde el panel de evento por ${user?.name}`,
      estado: 'pendiente' as const
    };

    try {
      const orden = await createOrden(ordenData);
      if (orden) {
        alert('Venta realizada exitosamente');
        clearCart();
      } else {
        alert('Error al procesar la venta');
      }
    } catch (error) {
      alert('Error al procesar la venta');
      console.error('Error:', error);
    }
  };

  if (loadingEvento) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-2 border-highlight-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (errorEvento || !evento) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
          <p>No se pudo cargar la información del evento</p>
          <button
            onClick={() => window.close()}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-[#181411] dark:text-white min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-solid border-[#e6e0db] bg-white dark:bg-[#1a140f] px-10 py-3">
        <div className="flex items-center gap-8">
          <div className="h-8 w-px bg-[#e6e0db]"></div>
          <div>
            <p className="text-sm text-[#8c735f] uppercase tracking-wider font-semibold">Evento Actual</p>
            <h1 className="text-lg font-bold text-[#181411] dark:text-white">{evento.nombre}</h1>
            <p className="text-sm text-[#8c735f]">{formatDate(evento.fecha.toString())} • {evento.buffet?.nombre}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => window.close()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#e6e0db] hover:bg-gray-50 transition-colors text-highlight-blue font-bold text-sm"
          >
            <span className="material-symbols-outlined text-[20px]">dashboard</span>
            Volver al Dashboard
          </button>
          <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-primary bg-gray-300 flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-sm">person</span>
          </div>
        </div>
      </header>

      <main className="flex h-[calc(100vh-65px)] overflow-hidden">
        {/* Panel de productos */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Barra de búsqueda */}
          <div className="p-6 pb-2 bg-background-light dark:bg-background-dark">
            <div className="flex items-center justify-between">
              <div className="relative w-full max-w-md">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#8c735f]">
                  <span className="material-symbols-outlined">search</span>
                </span>
                <input 
                  className="block w-full pl-10 pr-3 py-2 border-none rounded-xl bg-white dark:bg-[#2d241d] focus:ring-2 focus:ring-highlight-blue text-sm" 
                  placeholder="Buscar productos por nombre o código..." 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Grid de productos */}
          <div className="flex-1 overflow-y-auto p-6">
            {productosLoading || promosLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-highlight-blue border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-6xl text-[#8c735f] mb-4">inventory</span>
                <p className="text-[#8c735f] text-lg mb-2">
                  {searchQuery ? 'No se encontraron productos' : 'No hay productos disponibles'}
                </p>
                <p className="text-sm text-[#8c735f]">
                  {searchQuery ? 'Intenta con otra búsqueda' : 'Agrega productos al buffet desde el panel de administración'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredItems.map((item) => (
                  <div 
                    key={`${item.type}-${item._id}`}
                    onClick={() => addToCart(item, item.type)}
                    className="group bg-white dark:bg-[#2d241d] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer border-2 border-transparent hover:border-highlight-blue/30"
                  >
                    <div className="h-40 bg-center bg-no-repeat bg-cover relative" style={{backgroundImage: `url('https://images.unsplash.com/photo-${item.type === 'producto' ? '1567620905586-95b68e8bf377' : '1567620905778-4d6c1c7a31b1'}?w=400&h=300&fit=crop')`}}>
                      <span className="absolute top-2 right-2 bg-highlight-blue text-white text-xs font-bold px-2 py-1 rounded-full">
                        ${item.valor.toFixed(2)}
                      </span>
                      {item.type === 'promo' && (
                        <span className="absolute top-2 left-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                          PROMO
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-[#181411] dark:text-white font-bold text-sm mb-1">{item.nombre}</h3>
                      <p className="text-[#8c735f] text-xs">{'descripcion' in item ? item.descripcion : 'Promoción especial'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Panel del carrito */}
        <aside className="w-[400px] flex flex-col bg-white dark:bg-[#1a140f] border-l border-[#e6e0db] shadow-xl">

          {/* Items del carrito */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-6xl text-[#8c735f] mb-4">shopping_cart</span>
                <p className="text-[#8c735f]">El carrito está vacío</p>
                <p className="text-sm text-[#8c735f] mt-2">Selecciona productos para agregar</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={`${item.tipo}-${item.id}`} className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-lg bg-center bg-cover flex-shrink-0" style={{backgroundImage: `url('https://images.unsplash.com/photo-${item.tipo === 'producto' ? '1567620905586-95b68e8bf377' : '1567620905778-4d6c1c7a31b1'}?w=100&h=100&fit=crop')`}}></div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold">{item.nombre}</h4>
                    <p className="text-xs text-[#8c735f]">${item.precio.toFixed(2)} c/u</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => updateCartQuantity(item.id, item.tipo, item.cantidad - 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 dark:bg-[#2d241d] hover:bg-highlight-blue hover:text-white transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">remove</span>
                    </button>
                    <span className="font-bold text-sm">{item.cantidad}</span>
                    <button 
                      onClick={() => updateCartQuantity(item.id, item.tipo, item.cantidad + 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 dark:bg-[#2d241d] hover:bg-highlight-blue hover:text-white transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                    </button>
                  </div>
                  <div className="w-16 text-right">
                    <p className="text-sm font-bold text-highlight-blue">${(item.precio * item.cantidad).toFixed(2)}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Panel de checkout */}
          <div className="p-6 bg-gray-50 dark:bg-[#2d241d]/50 border-t border-[#e6e0db] space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-[#8c735f]">
                <span>Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-2xl font-black text-[#181411] dark:text-white pt-2">
                <span>Total</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button 
                onClick={finalizarVenta}
                disabled={cart.length === 0 || ordenLoading}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {ordenLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span className="material-symbols-outlined">payments</span>
                    Finalizar Venta
                  </>
                )}
              </button>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default function EventPanelPage() {
  return (
    <ProtectedRoute>
      <EventPanelContent />
    </ProtectedRoute>
  );
}