'use client';

import ProtectedRoute from '@/app/components/ProtectedRoute';
import { useOrdenes } from '@/app/hooks/useOrdenes';
import teoAuth from '@/app/lib/teoAuth';
import { Evento, Orden } from '@/types/api';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

// Popup de confirmación reutilizable
function ConfirmDialog({ open, message, onConfirm, onCancel, loading }: { open: boolean, message: string, onConfirm: () => void, onCancel: () => void, loading?: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-xs flex flex-col items-center">
        <span className="material-symbols-outlined text-4xl text-primary mb-2">help</span>
        <div className="text-center mb-4 text-base font-medium">{message}</div>
        <div className="flex gap-2 w-full">
          <button
            className="flex-1 py-2 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" /> : 'Confirmar'}
          </button>
          <button
            className="flex-1 py-2 rounded-lg bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 transition-colors"
            onClick={onCancel}
            disabled={loading}
          >Cancelar</button>
        </div>
      </div>
    </div>
  );
}


function OrdersPanelContent() {
  const params = useParams();
  const eventoId = params?.eventoId as string;

  const [evento, setEvento] = useState<Evento | null>(null);
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accionLoading, setAccionLoading] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [activeTab, setActiveTab] = useState<'pendiente' | 'entregado' | 'cancelado'>('pendiente');
  // Estado para popup de confirmación
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    ordenId?: string;
    nuevoEstado?: Orden['estado'];
    mensaje?: string;
  }>({ open: false });

  // Cargar evento y todas las ordenes del evento
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Cargar evento
        const eventoRes = await teoAuth.authenticatedRequest('/api/admin-buffets/eventos?limite=100&pagina=1');
        if (!eventoRes.ok) throw new Error('Error al cargar evento');
        const eventoData = await eventoRes.json();
        const eventoEncontrado = eventoData.eventos?.find((e: Evento) => e._id === eventoId);
        if (!eventoEncontrado) throw new Error('Evento no encontrado');
        setEvento(eventoEncontrado);
        // Cargar todas las ordenes del evento
        const ordenesRes = await teoAuth.authenticatedRequest(`/api/admin-buffets/ordenes?evento_id=${eventoId}`);
        if (!ordenesRes.ok) throw new Error('Error al cargar órdenes');
        const ordenesData = await ordenesRes.json();
        setOrdenes(ordenesData.ordenes || []);
      } catch (err) {
        setError('No se pudo cargar la información');
      } finally {
        setLoading(false);
      }
    };
    if (eventoId) fetchData();
  }, [eventoId]);

  // Update the order status
  const { updateOrden } = useOrdenes();

  // Abre el popup de confirmación
  const handleUpdateOrden = (ordenId: string, nuevoEstado: Orden['estado']) => {
    let mensaje = '';
    if (nuevoEstado === 'entregado') {
      mensaje = '¿Estás seguro que deseas marcar este pedido como ENTREGADO?';
    } else if (nuevoEstado === 'cancelado') {
      mensaje = '¿Estás seguro que deseas CANCELAR este pedido?';
    }
    setConfirmDialog({ open: true, ordenId, nuevoEstado, mensaje });
  };

  // Ejecuta la acción tras confirmar
  const handleConfirmDialog = async () => {
    if (!confirmDialog.ordenId || !confirmDialog.nuevoEstado) return;
    setAccionLoading(confirmDialog.ordenId + confirmDialog.nuevoEstado);
    const success = await updateOrden(confirmDialog.ordenId, confirmDialog.nuevoEstado);
    if (success) {
      setOrdenes((prev) => prev.map((o) => o._id === confirmDialog.ordenId ? { ...o, estado: confirmDialog.nuevoEstado } : o));
    } else {
      alert('No se pudo actualizar la orden');
    }
    setAccionLoading(null);
    setConfirmDialog({ open: false });
  };

  // Filtrar ordenes por pestaña activa
  const ordenesFiltradas = useMemo(() => {
    if (activeTab === 'pendiente') {
      // Mostrar pendientes y confirmados
      return ordenes.filter(o => o.estado === 'pendiente');
    }
    return ordenes.filter(o => o.estado === activeTab);
  }, [ordenes, activeTab]);

  const sortedOrdenes = useMemo(() => {
    return [...ordenesFiltradas].sort((a, b) => {
      const dateA = new Date(a.fechaCreacion).getTime();
      const dateB = new Date(b.fechaCreacion).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }, [ordenesFiltradas, sortOrder]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !evento) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
          <p>{error || 'No se pudo cargar la información'}</p>
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
    <div className="bg-surface-light font-display text-text-primary min-h-screen flex flex-col">
      <div className="p-4 sm:p-6 bg-white border-b border-gray-200 flex items-center justify-between">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold">Órdenes</h1>
          <p className="text-sm text-text-secondary">Evento: <span className="font-semibold">{evento.nombre}</span></p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
            className="flex items-center justify-center p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-text-secondary bg-white"
            title="Ordenar por fecha"
          >
            <span className="material-symbols-outlined text-[20px] sm:text-[24px]">
              {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
            </span>
          </button>
          <button
            onClick={() => window.close()}
            className="flex items-center justify-center p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-text-secondary bg-white"
            title="Volver"
          >
            <span className="material-symbols-outlined text-[20px] sm:text-[24px]">close</span>
          </button>
        </div>
      </div>
      {/* Pestañas */}
      <div className="flex gap-2 px-4 sm:px-6 pt-2 bg-white border-b border-gray-200">
        <button
          className={`px-4 py-2 rounded-t-lg font-semibold transition-colors ${activeTab === 'pendiente' ? 'bg-primary text-white' : 'bg-gray-100 text-text-secondary hover:bg-gray-200'}`}
          onClick={() => setActiveTab('pendiente')}
        >Pendiente</button>
        <button
          className={`px-4 py-2 rounded-t-lg font-semibold transition-colors ${activeTab === 'entregado' ? 'bg-primary text-white' : 'bg-gray-100 text-text-secondary hover:bg-gray-200'}`}
          onClick={() => setActiveTab('entregado')}
        >Entregado</button>
        <button
          className={`px-4 py-2 rounded-t-lg font-semibold transition-colors ${activeTab === 'cancelado' ? 'bg-primary text-white' : 'bg-gray-100 text-text-secondary hover:bg-gray-200'}`}
          onClick={() => setActiveTab('cancelado')}
        >Cancelado</button>
      </div>
      {/* Popup de confirmación */}
      <ConfirmDialog
        open={confirmDialog.open}
        message={confirmDialog.mensaje || ''}
        onConfirm={handleConfirmDialog}
        onCancel={() => setConfirmDialog({ open: false })}
        loading={!!accionLoading}
      />
      <main className="flex-1 overflow-y-auto p-3 sm:p-6">
        {sortedOrdenes.length === 0 ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-6xl text-text-secondary mb-4">assignment</span>
            <p className="text-text-secondary text-lg mb-2">No hay órdenes {activeTab === 'pendiente' ? 'pendientes o confirmadas' : activeTab === 'entregado' ? 'entregadas' : 'canceladas'}</p>
            <p className="text-sm text-text-secondary">Las órdenes aparecerán aquí</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedOrdenes.map((orden) => (
              <div key={orden._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-primary">shopping_cart_checkout</span>
                    <span className="font-bold text-base">Orden #{orden._id?.slice(-4)}</span>
                  </div>
                  <div className="text-xs text-text-secondary mb-2">{new Date(orden.fechaCreacion).toLocaleString()}</div>
                  <div className="text-sm font-medium mb-1">Total: <span className="text-primary font-bold">${orden.total.toFixed(0)}</span></div>
                  <div className="text-xs text-text-secondary mb-2">{orden.nota}</div>
                  <div className="text-xs text-text-secondary mb-2">Estado: <span className={`font-semibold ${orden.estado === 'pendiente' ? 'text-accent-orange' : orden.estado === 'entregado' ? 'text-primary' : 'text-red-600'}`}>{orden.estado}</span></div>
                  <div className="text-xs text-text-secondary">Productos:</div>
                  <ul className="list-disc pl-5 text-xs text-text-primary">
                    {orden.productosExpandidos.map((prod, idx) => (
                      <li key={idx}>
                         <span className="font-semibold">{prod.nombre}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Botones según estado */}
                {activeTab === 'pendiente' && (
                  <div className="flex flex-col gap-2 min-w-[140px]">
                    <button
                      disabled={accionLoading === orden._id + 'entregado'}
                      onClick={() => handleUpdateOrden(orden._id!, 'entregado')}
                      className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-2 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {accionLoading === orden._id + 'entregado' ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[18px]">check_circle</span>
                          Entregar
                        </>
                      )}
                    </button>
                    <button
                      disabled={accionLoading === orden._id + 'cancelado'}
                      onClick={() => handleUpdateOrden(orden._id!, 'cancelado')}
                      className="w-full bg-accent-orange hover:bg-accent-orange-intense text-white font-bold py-2 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {accionLoading === orden._id + 'cancelado' ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[18px]">cancel</span>
                          Cancelar
                        </>
                      )}
                    </button>
                  </div>
                )}
                {activeTab === 'entregado' && (
                  <div className="flex flex-col gap-2 min-w-[140px]">
                    <button
                      disabled={accionLoading === orden._id + 'pendiente'}
                      onClick={() => handleUpdateOrden(orden._id!, 'pendiente')}
                      className="w-full bg-accent-orange hover:bg-accent-orange-intense text-white font-bold py-2 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {accionLoading === orden._id + 'pendiente' ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[18px]">undo</span>
                          Mover a pendiente
                        </>
                      )}
                    </button>
                  </div>
                )}
                {activeTab === 'cancelado' && (
                  <div className="flex flex-col gap-2 min-w-[140px]">
                    <button
                      disabled={accionLoading === orden._id + 'pendiente'}
                      onClick={() => handleUpdateOrden(orden._id!, 'pendiente')}
                      className="w-full bg-accent-orange hover:bg-accent-orange-intense text-white font-bold py-2 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {accionLoading === orden._id + 'pendiente' ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[18px]">undo</span>
                          Mover a pendiente
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function OrdersPanelPage() {
  return (
    <ProtectedRoute>
      <OrdersPanelContent />
    </ProtectedRoute>
  );
}
