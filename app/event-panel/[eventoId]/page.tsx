'use client';

import { useParams } from 'next/navigation';
import { useState, useMemo, useEffect } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import teoAuth from '../../lib/teoAuth';
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
  imagen?: string;
}

function EventPanelContent() {
  const params = useParams();
  const eventoId = params?.eventoId as string;
  
  const { user } = useAuth();
  const { createOrden, loading: ordenLoading } = useOrdenes();
  
  const [evento, setEvento] = useState<Evento | null>(null);
  const [loadingEvento, setLoadingEvento] = useState(true);
  const [errorEvento, setErrorEvento] = useState<string | null>(null);
  
  // Estados para el sistema de pestañas
  const [currentView, setCurrentView] = useState<'productos' | 'ordenes'>('productos');
  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [loadingOrdenes, setLoadingOrdenes] = useState(false);
  
  // Estados para editar orden
  const [editingOrder, setEditingOrder] = useState<any | null>(null);
  
  const { productos, loading: productosLoading } = useBuffetProductos(evento?.buffet_id || '');
  const { promos, loading: promosLoading } = useBuffetPromos(evento?.buffet_id || '');

  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'transferencia'>('efectivo');
  const [cartExpanded, setCartExpanded] = useState(false);
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteNota, setClienteNota] = useState('');

  // Cargar evento específico
  useEffect(() => {
    const fetchEvento = async () => {
      try {
        setLoadingEvento(true);
        setErrorEvento(null);

        // Usar el endpoint de lista para obtener todos los eventos y buscar el específico
        const response = await teoAuth.authenticatedRequest('/api/admin-buffets/eventos?limite=100&pagina=1');

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

  // Función para cargar órdenes
  const fetchOrdenes = async () => {
    try {
      setLoadingOrdenes(true);
      const response = await teoAuth.authenticatedRequest(`/api/admin-buffets/ordenes?evento_id=${eventoId}`);
      if (!response.ok) throw new Error('Error al cargar órdenes');
      const data = await response.json();
      setOrdenes(data.ordenes || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      alert('Error al cargar las órdenes');
    } finally {
      setLoadingOrdenes(false);
    }
  };

  // Función para cambiar a vista de órdenes
  const handleShowOrders = () => {
    setCurrentView('ordenes');
    if (ordenes.length === 0) {
      fetchOrdenes();
    }
  };

  // Función para volver a vista de productos
  const handleShowProducts = () => {
    setCurrentView('productos');
  };

  // Función para cargar orden en el carrito para editar
  const loadOrderForEdit = (orden: any) => {
    setEditingOrder(orden);
    setClienteNombre(orden.cliente_nombre);
    setClienteNota(orden.nota || '');
    setMetodoPago(orden.forma_pago);
    
    // Convertir productos de la orden al formato del carrito usando el array original de productos
    // y obteniendo información de display de productosExpandidos
    const cartItems: CartItem[] = orden.productos?.map((item: ItemProducto) => {
      // Buscar información de display correspondiente en productosExpandidos
      const expandedInfo = orden.productosExpandidos?.find((expanded: any) => {
        // Mapear por cantidad y precio para encontrar el item correspondiente
        return expanded.cantidad === item.cantidad && 
               expanded.precio_unitario === item.precio_unitario;
      });
      
      return {
        id: item.id,
        tipo: item.tipo,
        nombre: expandedInfo?.nombre || 'Producto desconocido',
        precio: item.precio_unitario,
        cantidad: item.cantidad,
        descripcion: item.tipo === 'producto' ? 'Producto' : 'Promoción especial',
        imagen: expandedInfo?.imagen
      };
    }) || [];
    
    setCart(cartItems);
    setCurrentView('productos');
  };

  // Función para cancelar edición
  const cancelEdit = () => {
    setEditingOrder(null);
    clearCart();
  };

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
        descripcion: 'descripcion' in item ? item.descripcion : 'Promoción especial',
        imagen: 'imagen' in item ? item.imagen : undefined
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
    setClienteNombre('');
    setClienteNota('');
  };

  const finalizarVenta = async () => {
    if (!evento || cart.length === 0) return;

    // Validar nombre del cliente
    if (!clienteNombre.trim()) {
      alert('Por favor ingresa el nombre del cliente');
      return;
    }

    // Validar que todos los items del carrito tengan id y tipo válidos
    const invalidItems = cart.filter(item => !item.id || !item.tipo);
    if (invalidItems.length > 0) {
      console.error('Items del carrito con datos inválidos:', invalidItems);
      alert('Error: Hay productos sin información completa en el carrito. Por favor, vuelve a cargarlos.');
      return;
    }

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
      forma_pago: metodoPago,
      cliente_nombre: clienteNombre.trim(),
      ...(clienteNota.trim() && { nota: clienteNota.trim() }),
      estado: 'pendiente' as const
    };

    try {
      let orden: any;
      if (editingOrder) {
        // Actualizar orden existente
        const response = await teoAuth.authenticatedRequest(
          `/api/admin-buffets/ordenes/${editingOrder._id}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ordenData)
          }
        );
        if (response.ok) {
          orden = await response.json();
          // Asegurar que la orden actualizada mantenga todas las propiedades necesarias
          const ordenCompleta = {
            ...editingOrder,
            ...orden,
            estado: orden.estado || 'pendiente'
          };
          // Actualizar la orden en la lista local
          setOrdenes(prev => prev.map(o => o._id === editingOrder._id ? ordenCompleta : o));
          alert('Orden actualizada exitosamente');
        } else {
          throw new Error('Error al actualizar la orden');
        }
      } else {
        // Crear nueva orden
        orden = await createOrden(ordenData);
        if (orden) {
          alert('Venta realizada exitosamente');
          // Actualizar lista de órdenes si está cargada
          if (ordenes.length > 0) {
            setOrdenes(prev => [orden, ...prev]);
          }
        } else {
          alert('Error al procesar la venta');
          return;
        }
      }
      
      // Limpiar carrito y estado de edición
      clearCart();
      setEditingOrder(null);
      setClienteNombre('');
      setClienteNota('');
    } catch (error) {
      alert(editingOrder ? 'Error al actualizar la orden' : 'Error al procesar la venta');
      console.error('Error:', error);
    }
  };

  if (loadingEvento) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
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
            className="mt-4 px-4 py-2 bg-accent-orange text-white rounded-lg hover:bg-accent-orange-intense transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }



  return (
    <div className="bg-surface-light font-display text-text-primary h-screen overflow-hidden flex flex-col">
      {/* Header fijo - Solo visible en móvil */}
      <div className="sm:hidden fixed top-0 left-0 right-0 z-20 p-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary">
              <span className="material-symbols-outlined">search</span>
            </span>
            <input 
              className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary focus:border-primary text-sm" 
              placeholder="Buscar productos..." 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleShowProducts}
              className={`flex items-center justify-center p-3 rounded-xl border transition-colors ${
                currentView === 'productos' 
                  ? 'border-primary bg-primary text-white' 
                  : 'border-gray-200 bg-white text-text-secondary hover:bg-gray-50'
              }`}
              title="Ver Productos"
            >
              <span className="material-symbols-outlined text-[20px]">inventory_2</span>
            </button>
            <button 
              onClick={handleShowOrders}
              className={`flex items-center justify-center p-3 rounded-xl border transition-colors ${
                currentView === 'ordenes' 
                  ? 'border-primary bg-primary text-white' 
                  : 'border-gray-200 bg-white text-text-secondary hover:bg-gray-50'
              }`}
              title="Ver Órdenes"
            >
              <span className="material-symbols-outlined text-[20px]">receipt_long</span>
            </button>
          </div>
          <button 
            onClick={() => window.close()}
            className="flex items-center justify-center p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-text-secondary bg-white"
            title="Volver al Dashboard"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      </div>

      <main className="flex flex-col sm:flex-row h-full overflow-hidden">
        {/* Panel de productos */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Barra de búsqueda con botón de salir - Solo desktop */}
          <div className="hidden sm:block p-4 sm:p-6 bg-white border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-2xl">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary">
                  <span className="material-symbols-outlined">search</span>
                </span>
                <input 
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary focus:border-primary text-sm sm:text-base" 
                  placeholder="Buscar productos..." 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleShowProducts}
                  className={`flex items-center justify-center p-3 rounded-xl border transition-colors ${
                    currentView === 'productos' 
                      ? 'border-primary bg-primary text-white' 
                      : 'border-gray-200 bg-white text-text-secondary hover:bg-gray-50'
                  }`}
                  title="Ver Productos"
                >
                  <span className="material-symbols-outlined text-[20px] sm:text-[24px]">inventory_2</span>
                </button>
                <button 
                  onClick={handleShowOrders}
                  className={`flex items-center justify-center p-3 rounded-xl border transition-colors ${
                    currentView === 'ordenes' 
                      ? 'border-primary bg-primary text-white' 
                      : 'border-gray-200 bg-white text-text-secondary hover:bg-gray-50'
                  }`}
                  title="Ver Órdenes"
                >
                  <span className="material-symbols-outlined text-[20px] sm:text-[24px]">receipt_long</span>
                </button>
              </div>
              <button 
                onClick={() => window.close()}
                className="flex items-center justify-center p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-text-secondary bg-white"
                title="Volver al Dashboard"
              >
                <span className="material-symbols-outlined text-[20px] sm:text-[24px]">close</span>
              </button>
            </div>
          </div>

          {/* Grid de productos o lista de órdenes con padding top en móvil para el header fijo */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-6 pt-[100px] sm:pt-3 pb-[80px] sm:pb-3">
            {currentView === 'productos' ? (
              // Vista de productos
              productosLoading || promosLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-6xl text-text-secondary mb-4">inventory</span>
                  <p className="text-text-secondary text-lg mb-2">
                    {searchQuery ? 'No se encontraron productos' : 'No hay productos disponibles'}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {searchQuery ? 'Intenta con otra búsqueda' : 'Agrega productos al buffet desde el panel de administración'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {filteredItems.map((item) => (
                    <div 
                      key={`${item.type}-${item._id}`}
                      onClick={() => addToCart(item, item.type)}
                      className="bg-white rounded-xl overflow-hidden shadow-sm cursor-pointer border border-gray-200 hover:shadow-md active:scale-95 transition-all"
                    >
                      <div className="h-20 sm:h-24 bg-center bg-no-repeat bg-cover relative" style={{backgroundImage: `url('${('imagen' in item ? item.imagen : null) || `https://images.unsplash.com/photo-${item.type === 'producto' ? '1567620905586-95b68e8bf377' : '1567620905778-4d6c1c7a31b1'}?w=400&h=300&fit=crop`}')`}}>
                        <span className="absolute top-1 right-1 bg-primary text-white text-xs font-bold px-2 py-1 rounded-lg shadow-sm">
                          ${item.valor.toFixed(0)}
                        </span>
                        {item.type === 'promo' && (
                          <span className="absolute top-1 left-1 bg-accent-orange text-white text-xs font-bold px-2 py-1 rounded-lg shadow-sm">
                            PROMO
                          </span>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="text-text-primary font-bold text-sm mb-1 truncate">{item.nombre}</h3>
                        <p className="text-text-secondary text-xs leading-tight line-clamp-2">
                          {'descripcion' in item && item.descripcion ? item.descripcion : 'Promoción especial'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              // Vista de órdenes
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-text-primary">Órdenes del Evento</h2>
                  <button
                    onClick={fetchOrdenes}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">refresh</span>
                    Actualizar
                  </button>
                </div>

                {loadingOrdenes ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : ordenes.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="material-symbols-outlined text-6xl text-text-secondary mb-4">receipt</span>
                    <p className="text-text-secondary text-lg mb-2">No hay órdenes</p>
                    <p className="text-sm text-text-secondary">Las órdenes creadas aparecerán aquí</p>
                  </div>
                ) : (
                  ordenes.map((orden) => (
                    <div key={orden._id} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-text-primary">{orden.cliente_nombre}</h3>
                          <p className="text-sm text-text-secondary">
                            {new Date(orden.fechaCreacion).toLocaleString('es-ES')}
                          </p>
                        </div>
                        <div className="text-right flex items-center gap-2">
                          <div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              orden.estado === 'pendiente' 
                                ? 'bg-yellow-100 text-yellow-800'
                                : orden.estado === 'entregado'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {orden.estado ? (orden.estado.charAt(0).toUpperCase() + orden.estado.slice(1)) : 'Pendiente'}
                            </span>
                            <p className="font-bold text-lg text-primary mt-1">${orden.total.toFixed(0)}</p>
                          </div>
                          {/* Botón de editar */}
                          <button
                            onClick={() => loadOrderForEdit(orden)}
                            className="p-2 rounded-lg border border-primary text-primary hover:bg-primary hover:text-white transition-colors"
                            title="Editar orden"
                          >
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                        </div>
                      </div>
                      
                      {/* Lista de productos */}
                      <div className="space-y-2 mb-3">
                        {orden.productosExpandidos?.map((item: any, index: number) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <span className="text-text-primary">
                              {item.cantidad}x {item.nombre}
                            </span>
                            <span className="text-text-secondary">
                              ${(item.precio_unitario * item.cantidad).toFixed(0)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Método de pago */}
                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <span className="material-symbols-outlined text-[16px]">
                          {orden.forma_pago === 'efectivo' ? 'payments' : 'account_balance'}
                        </span>
                        <span>{orden.forma_pago === 'efectivo' ? 'Efectivo' : 'Transferencia'}</span>
                      </div>

                      {/* Nota si existe */}
                      {orden.nota && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-800">
                          <strong>Nota:</strong> {orden.nota}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Panel del carrito - Responsive - Solo visible en vista de productos */}
        {currentView === 'productos' && (
          <aside className="w-full sm:w-[380px] lg:w-[420px] flex flex-col bg-white sm:border-l border-t sm:border-t-0 border-gray-200 shadow-lg relative">
          {/* Vista comprimida del carrito en móvil - Fijo en la parte inferior - Solo en vista de productos */}
          {currentView === 'productos' && (
            <div className={`sm:hidden fixed bottom-0 left-0 right-0 z-30 ${cartExpanded ? 'hidden' : 'block'}`}>
            <button
              onClick={() => setCartExpanded(true)}
              className="w-full p-4 bg-primary text-white flex items-center justify-between hover:bg-primary/90 transition-colors shadow-lg"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined">{editingOrder ? 'edit' : 'shopping_cart'}</span>
                <span className="font-bold">{editingOrder ? 'Editando' : 'Carrito'}</span>
                {cart.length > 0 && (
                  <span className="bg-white text-primary text-xs font-bold px-2 py-1 rounded-full">
                    {cart.length}
                  </span>
                )}
                {editingOrder && (
                  <span className="text-xs opacity-90">({editingOrder.cliente_nombre})</span>
                )}
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">${cartTotal.toFixed(0)}</div>
                <div className="text-xs opacity-90">{editingOrder ? 'Ver edición' : 'Ver detalles'}</div>
              </div>
            </button>
          </div>
          )}

          {/* Vista expandida del carrito - Modal en móvil */}
          <div className={`${cartExpanded ? 'fixed inset-0 z-40 bg-white sm:relative sm:inset-auto sm:z-auto' : 'hidden'} sm:flex flex-col h-full`}>
            {/* Header del carrito expandido en móvil */}
            <div className="sm:hidden flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <div>
                <h2 className="font-bold text-lg text-text-primary">
                  {editingOrder ? 'Editando Orden' : 'Carrito'}
                </h2>
                {editingOrder && (
                  <p className="text-xs text-blue-600">Orden de {editingOrder.cliente_nombre}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {editingOrder && (
                  <button
                    onClick={cancelEdit}
                    className="p-1 hover:bg-red-100 rounded-full transition-colors text-red-600"
                    title="Cancelar edición"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                )}
                <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-lg">
                  {cart.length}
                </span>
                <button
                  onClick={() => setCartExpanded(false)}
                  className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <span className="material-symbols-outlined text-gray-600">close</span>
                </button>
              </div>
            </div>

            {/* Items del carrito */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <span className="material-symbols-outlined text-4xl sm:text-6xl text-text-secondary mb-2 sm:mb-4">shopping_cart</span>
                  <p className="text-text-secondary text-sm sm:text-base">El carrito está vacío</p>
                  <p className="text-xs sm:text-sm text-text-secondary mt-1 sm:mt-2">Toca productos para agregar</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={`${item.tipo}-${item.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-center bg-cover flex-shrink-0" style={{backgroundImage: `url('${item.imagen || `https://images.unsplash.com/photo-${item.tipo === 'producto' ? '1567620905586-95b68e8bf377' : '1567620905778-4d6c1c7a31b1'}?w=100&h=100&fit=crop`}')`}}></div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold truncate text-text-primary">{item.nombre}</h4>
                      <p className="text-xs text-text-secondary">${item.precio.toFixed(0)} c/u</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          updateCartQuantity(item.id, item.tipo, item.cantidad - 1);
                        }}
                        className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-600 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px] sm:text-[16px]">remove</span>
                      </button>
                      <span className="font-bold text-xs sm:text-sm w-6 text-center text-text-primary">{item.cantidad}</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          updateCartQuantity(item.id, item.tipo, item.cantidad + 1);
                        }}
                        className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-green-100 hover:text-green-600 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px] sm:text-[16px]">add</span>
                      </button>
                    </div>
                    <div className="w-12 sm:w-16 text-right">
                      <p className="text-xs sm:text-sm font-bold text-primary">${(item.precio * item.cantidad).toFixed(0)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Panel de checkout */}
            <div className="p-3 sm:p-4 bg-gray-50 border-t border-gray-200 space-y-3 sm:space-y-4">
              {/* Indicador de edición */}
              {editingOrder && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
                  <div className="flex items-center gap-2 text-blue-800">
                    <span className="material-symbols-outlined text-[20px]">edit</span>
                    <div>
                      <p className="font-bold text-sm">Editando Orden</p>
                      <p className="text-xs">Cliente: {editingOrder.cliente_nombre}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Nombre del cliente */}
              <div className="space-y-2 sm:space-y-3">
                <h3 className="text-xs sm:text-sm font-bold text-text-primary">Nombre del Cliente *</h3>
                <input
                  type="text"
                  value={clienteNombre}
                  onChange={(e) => setClienteNombre(e.target.value)}
                  placeholder="Ingresa el nombre del cliente"
                  className="w-full p-2 sm:p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-sm sm:text-base"
                  required
                />
              </div>

              {/* Nota del cliente */}
              <div className="space-y-2 sm:space-y-3">
                <h3 className="text-xs sm:text-sm font-bold text-text-primary">Nota (opcional)</h3>
                <textarea
                  value={clienteNota}
                  onChange={(e) => setClienteNota(e.target.value)}
                  placeholder="Agrega una nota para esta venta..."
                  rows={2}
                  className="w-full p-2 sm:p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-sm sm:text-base resize-none"
                />
              </div>

              {/* Método de pago */}
              <div className="space-y-2 sm:space-y-3">
                <h3 className="text-xs sm:text-sm font-bold text-text-primary">Método de Pago</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setMetodoPago('efectivo')}
                    className={`p-2 sm:p-3 rounded-xl border-2 transition-all text-xs sm:text-sm font-medium ${
                      metodoPago === 'efectivo'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-200 text-text-secondary hover:border-primary/50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px] sm:text-[18px] mb-1">payments</span>
                    <div>Efectivo</div>
                  </button>
                  <button
                    onClick={() => setMetodoPago('transferencia')}
                    className={`p-2 sm:p-3 rounded-xl border-2 transition-all text-xs sm:text-sm font-medium ${
                      metodoPago === 'transferencia'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-200 text-text-secondary hover:border-primary/50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px] sm:text-[18px] mb-1">account_balance</span>
                    <div>Transferencia</div>
                  </button>
                </div>
              </div>

              {/* Total */}
              <div className="space-y-1 sm:space-y-2">
                <div className="flex justify-between text-xs sm:text-sm text-text-secondary">
                  <span>Subtotal ({cart.length} items)</span>
                  <span>${cartTotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-xl sm:text-2xl font-black text-text-primary pt-1 sm:pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>${cartTotal.toFixed(0)}</span>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col gap-2">
                {editingOrder && (
                  <button 
                    onClick={cancelEdit}
                    className="w-full bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                    Cancelar Edición
                  </button>
                )}
                {cart.length > 0 && !editingOrder && (
                  <button 
                    onClick={clearCart}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 rounded-xl transition-colors text-sm"
                  >
                    Limpiar Carrito
                  </button>
                )}
                <button 
                  onClick={finalizarVenta}
                  disabled={cart.length === 0 || ordenLoading}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 sm:py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {ordenLoading ? (
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px] sm:text-[20px]">
                        {editingOrder ? 'save' : 'payments'}
                      </span>
                      {editingOrder ? 'Actualizar Orden' : 'Finalizar Venta'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </aside>
        )}
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