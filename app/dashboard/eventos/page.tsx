'use client';

import React, { useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useEventos } from '../../hooks/useEventos';
import { useAuth } from '../../hooks/useAuth';
import EventoForm from '../../components/forms/EventoForm';
import { CreateEventoData, UpdateEventoData, Evento } from '../../../types/api';

function EventosContent() {
  const { user } = useAuth();
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
      <div className="p-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="text-red-800 dark:text-red-200 font-medium mb-2">Error al cargar eventos</h3>
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          <button
            onClick={reload}
            className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-buffest-dark text-white flex flex-col shrink-0">
        <div className="p-6 flex flex-col h-full">
          {/* Brand / Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-primary p-2 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white">restaurant</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold leading-tight">Buffests</h1>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 space-y-2">
            <a 
              href="/dashboard" 
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 text-slate-300 transition-colors"
            >
              <span className="material-symbols-outlined">dashboard</span>
              <span>Dashboard</span>
            </a>
            <a 
              href="/dashboard/eventos" 
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-white font-medium"
            >
              <span className="material-symbols-outlined">calendar_today</span>
              <span>Eventos</span>
            </a>
            <a 
              href="/dashboard/productos" 
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 text-slate-300 transition-colors"
            >
              <span className="material-symbols-outlined">inventory_2</span>
              <span>Productos</span>
            </a>
            <a 
              href="/dashboard/promos" 
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 text-slate-300 transition-colors"
            >
              <span className="material-symbols-outlined">sell</span>
              <span>Promos</span>
            </a>
          </nav>

          {/* User Info & Logout */}
          <div className="mt-auto pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-sm">person</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name || 'Usuario'}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Navigation Bar */}
        <header className="h-20 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-8 py-4 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Gestión de Eventos</h2>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined">add</span>
            Nuevo Evento
          </button>
        </header>

        {/* Content */}
        <div className="p-8">
          {/* Filters */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="fecha_desde" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Desde
              </label>
              <input
                type="date"
                id="fecha_desde"
                value={filters.fecha_desde}
                onChange={(e) => setFilters(prev => ({ ...prev, fecha_desde: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="fecha_hasta" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Hasta
              </label>
              <input
                type="date"
                id="fecha_hasta"
                value={filters.fecha_hasta}
                onChange={(e) => setFilters(prev => ({ ...prev, fecha_hasta: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ buffet_id: '', fecha_desde: '', fecha_hasta: '' })}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
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
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Eventos ({total})
                </h3>
              </div>
              
              {eventos.length === 0 ? (
                <div className="p-12 text-center">
                  <span className="material-symbols-outlined text-slate-400 text-6xl mb-4">calendar_today</span>
                  <h3 className="text-xl font-medium text-slate-600 dark:text-slate-400 mb-2">
                    No hay eventos
                  </h3>
                  <p className="text-slate-500 dark:text-slate-500 mb-6">
                    Comienza creando tu primer evento
                  </p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Crear Evento
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                  {eventos.map((evento) => (
                    <div key={evento._id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="bg-primary/10 p-3 rounded-lg text-primary">
                            <span className="material-symbols-outlined">event</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-900 dark:text-white">
                              {evento.nombre}
                            </h4>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">
                              {evento.buffet?.nombre} - {evento.buffet?.lugar}
                            </p>
                            <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">
                              {formatDate(evento.fecha.toString())}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => window.open(`/event-panel/${evento._id}`, '_blank')}
                            className="px-3 py-2 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-sm">storefront</span>
                            Ir al evento
                          </button>
                          <button 
                            onClick={() => handleEditEvento(evento)}
                            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          >
                            <span className="material-symbols-outlined">edit</span>
                          </button>
                          <button 
                            onClick={() => handleDeleteEvento(evento)}
                            className="p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <span className="material-symbols-outlined">delete</span>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-xl max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              Confirmar Eliminación
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              ¿Estás seguro de que quieres eliminar el evento &ldquo;{eventoToDelete.nombre}&rdquo;? 
              Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteEvento}
                disabled={isDeleting}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
    </div>
  );
}

export default function EventosPage() {
  return (
    <ProtectedRoute>
      <EventosContent />
    </ProtectedRoute>
  );
}