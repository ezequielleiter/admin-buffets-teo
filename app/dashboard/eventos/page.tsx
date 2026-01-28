'use client';

import React, { useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useEventos } from '../../hooks/useEventos';
import EventoForm from '../../components/forms/EventoForm';
import { CreateEventoData, UpdateEventoData, Evento } from '../../../types/api';
import DashboardLayout from '@/app/components/DashboardLayout';

function EventosContent() {
  const [showForm, setShowForm] = useState(false);
  const [editingEvento, setEditingEvento] = useState<Evento | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventoToDelete, setEventoToDelete] = useState<Evento | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filters, setFilters] = useState({
    buffet_id: '',
    fecha_desde: '',
    fecha_hasta: ''
  });
  
  const { eventos, total, loading, error, createEvento, updateEvento, deleteEvento, reload } = useEventos(filters);

  const handleSubmitEvento = async (data: CreateEventoData | UpdateEventoData) => {
    setIsSubmitting(true);
    try {
      let result;
      if (editingEvento) {
        result = await updateEvento(editingEvento._id!, data as UpdateEventoData);
      } else {
        result = await createEvento(data as CreateEventoData);
      }
      
      if (result) {
        setShowForm(false);
        setEditingEvento(null);
        // Opcional: mostrar notificación de éxito
      }
    } catch (error) {
      console.error('Error submitting evento:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditEvento = (evento: Evento) => {
    setEditingEvento(evento);
    setShowForm(true);
  };

  const handleDeleteEvento = (evento: Evento) => {
    setEventoToDelete(evento);
    setShowDeleteModal(true);
  };

  const confirmDeleteEvento = async () => {
    if (!eventoToDelete) return;
    
    setIsDeleting(true);
    try {
      const success = await deleteEvento(eventoToDelete._id!);
      if (success) {
        setShowDeleteModal(false);
        setEventoToDelete(null);
        // Opcional: mostrar notificación de éxito
      }
    } catch (error) {
      console.error('Error deleting evento:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingEvento(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (error) {
    return (
      <div className="p-4 md:p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium mb-2">Error al cargar eventos</h3>
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={reload}
            className="mt-3 bg-accent-orange text-white px-4 py-2 rounded-lg hover:bg-accent-orange-intense transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Navigation Bar */}
        <header className="h-16 md:h-20 border-b border-gray-200 bg-white flex items-center justify-between px-4 md:px-8 py-2 md:py-4 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-base md:text-lg font-bold text-text-primary">Gestión de Eventos</h2>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary text-white px-3 md:px-4 py-2 rounded-lg hover:bg-accent-blue transition-colors flex items-center gap-2 text-sm md:text-base"
          >
            <span className="material-symbols-outlined text-lg md:text-xl">add</span>
            Nuevo Evento
          </button>
        </header>

        {/* Content */}
        <div className="p-4 md:p-8">
          {/* Filters */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="fecha_desde" className="block text-sm font-medium text-text-primary mb-2">
                Desde
              </label>
              <input
                type="date"
                id="fecha_desde"
                value={filters.fecha_desde}
                onChange={(e) => setFilters(prev => ({ ...prev, fecha_desde: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-text-primary text-sm md:text-base"
              />
            </div>
            <div>
              <label htmlFor="fecha_hasta" className="block text-sm font-medium text-text-primary mb-2">
                Hasta
              </label>
              <input
                type="date"
                id="fecha_hasta"
                value={filters.fecha_hasta}
                onChange={(e) => setFilters(prev => ({ ...prev, fecha_hasta: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-text-primary text-sm md:text-base"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ buffet_id: '', fecha_desde: '', fecha_hasta: '' })}
                className="w-full px-4 py-2 border border-gray-300 text-text-secondary rounded-lg hover:bg-gray-50 transition-colors text-sm md:text-base"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>

          {/* Events List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-4 md:p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-text-primary">
                  Eventos ({total})
                </h3>
              </div>
              
              {eventos.length === 0 ? (
                <div className="p-8 md:p-12 text-center">
                  <span className="material-symbols-outlined text-text-secondary text-4xl md:text-6xl mb-4">calendar_today</span>
                  <h3 className="text-lg md:text-xl font-medium text-text-primary mb-2">
                    No hay eventos
                  </h3>
                  <p className="text-text-secondary mb-6 text-sm md:text-base">
                    Comienza creando tu primer evento
                  </p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-primary text-white px-4 md:px-6 py-2 md:py-3 rounded-lg hover:bg-accent-blue transition-colors text-sm md:text-base"
                  >
                    Crear Evento
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {eventos.map((evento) => (
                    <div key={evento._id} className="p-4 md:p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="bg-primary/10 p-2 md:p-3 rounded-lg text-primary flex-shrink-0">
                            <span className="material-symbols-outlined text-lg md:text-xl">event</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium text-text-primary text-sm md:text-base truncate">
                              {evento.nombre}
                            </h4>
                            <p className="text-text-primary text-xs md:text-sm mt-1">
                              {formatDate(evento.fecha.toString())}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => window.open(`/event-panel/${evento._id}`, '_blank')}
                            className="px-2 md:px-3 py-1 md:py-2 bg-primary text-white text-xs md:text-sm font-medium rounded-lg hover:bg-accent-blue transition-colors flex items-center gap-1 min-h-[36px]"
                          >
                            <span className="material-symbols-outlined text-sm md:text-base">storefront</span>
                            <span className="">Ir al evento</span>
                          </button>
                          <button
                            onClick={() => window.open(`/event-panel/${evento._id}/orders`, '_blank')}
                            className="px-2 md:px-3 py-1 md:py-2 bg-accent-orange text-white text-xs md:text-sm font-medium rounded-lg hover:bg-accent-blue transition-colors flex items-center gap-1 min-h-[36px]"
                          >
                            <span className="material-symbols-outlined text-sm md:text-base">storefront</span>
                            <span className="">Ir al ordenes</span>
                          </button>
                          <button 
                            onClick={() => handleEditEvento(evento)}
                            className="p-2 text-text-secondary hover:text-text-primary rounded-lg hover:bg-gray-100 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                          >
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button 
                            onClick={() => handleDeleteEvento(evento)}
                            className="p-2 text-accent-orange hover:text-accent-orange-intense rounded-lg hover:bg-red-50 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Form Modal */}
      {showForm && (
        <EventoForm
          onSubmit={handleSubmitEvento}
          onCancel={handleCancelForm}
          isSubmitting={isSubmitting}
          evento={editingEvento || undefined}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && eventoToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-xl max-w-sm md:max-w-md w-full mx-4">
            <h3 className="text-lg md:text-xl font-bold text-text-primary mb-4">
              Confirmar Eliminación
            </h3>
            <p className="text-text-secondary mb-6 text-sm md:text-base">
              ¿Estás seguro de que quieres eliminar el evento &ldquo;{eventoToDelete.nombre}&rdquo;? 
              Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-text-secondary rounded-lg hover:bg-gray-50 transition-colors text-sm md:text-base"
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteEvento}
                disabled={isDeleting}
                className="flex-1 bg-accent-orange text-white px-4 py-2 rounded-lg hover:bg-accent-orange-intense transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Eliminando...
                  </>
                ) : (
                  'Eliminar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default function EventosPage() {
  return (
    <ProtectedRoute>
      <EventosContent />
    </ProtectedRoute>
  );
}