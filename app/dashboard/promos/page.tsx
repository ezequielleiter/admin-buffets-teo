'use client';

import React, { useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import { usePromos } from '../../hooks/usePromos';
import { useAuth } from '../../hooks/useAuth';
import PromoForm from '../../components/forms/PromoForm';
import { CreatePromoData, UpdatePromoData, Promo } from '../../../types/api';

function PromosContent() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [promoToDelete, setPromoToDelete] = useState<Promo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filters, setFilters] = useState({
    nombre: '',
  });
  
  const { promos, total, loading, error, createPromo, updatePromo, deletePromo, reload } = usePromos(filters);

  const handleSubmitPromo = async (data: CreatePromoData | UpdatePromoData) => {
    setIsSubmitting(true);
    try {
      let result;
      if (editingPromo) {
        result = await updatePromo(editingPromo._id!, data as UpdatePromoData);
      } else {
        result = await createPromo(data as CreatePromoData);
      }
      
      if (result) {
        setShowForm(false);
        setEditingPromo(null);
        // Opcional: mostrar notificación de éxito
      }
    } catch (error) {
      console.error('Error submitting promo:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPromo = (promo: Promo) => {
    setEditingPromo(promo);
    setShowForm(true);
  };

  const handleDeletePromo = (promo: Promo) => {
    setPromoToDelete(promo);
    setShowDeleteModal(true);
  };

  const confirmDeletePromo = async () => {
    if (!promoToDelete) return;
    
    setIsDeleting(true);
    try {
      const success = await deletePromo(promoToDelete._id!);
      if (success) {
        setShowDeleteModal(false);
        setPromoToDelete(null);
        // Opcional: mostrar notificación de éxito
      }
    } catch (error) {
      console.error('Error deleting promo:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingPromo(null);
  };

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="text-red-800 dark:text-red-200 font-medium mb-2">Error al cargar promociones</h3>
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
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 text-slate-300 transition-colors"
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
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-white font-medium"
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
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Gestión de Promociones</h2>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined">add</span>
            Nueva Promoción
          </button>
        </header>

        {/* Content */}
        <div className="p-8">
          {/* Filters */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Buscar por nombre
              </label>
              <input
                type="text"
                id="nombre"
                value={filters.nombre}
                onChange={(e) => setFilters(prev => ({ ...prev, nombre: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                placeholder="Buscar promociones..."
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ nombre: '' })}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>

          {/* Promos List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Promociones ({total})
                </h3>
              </div>
              
              {promos.length === 0 ? (
                <div className="p-12 text-center">
                  <span className="material-symbols-outlined text-slate-400 text-6xl mb-4">sell</span>
                  <h3 className="text-xl font-medium text-slate-600 dark:text-slate-400 mb-2">
                    No hay promociones
                  </h3>
                  <p className="text-slate-500 dark:text-slate-500 mb-6">
                    Comienza creando tu primera promoción
                  </p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Crear Promoción
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                  {promos.map((promo) => (
                    <div key={promo._id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="bg-buffest-orange/10 p-2 rounded-lg text-buffest-orange">
                          <span className="material-symbols-outlined">local_offer</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => handleEditPromo(promo)}
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button 
                            onClick={() => handleDeletePromo(promo)}
                            className="p-1 text-red-400 hover:text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </div>
                      
                      <h4 className="font-medium text-slate-900 dark:text-white mb-2">
                        {promo.nombre}
                      </h4>
                      
                      {/* Productos incluidos */}
                      <div className="mb-4">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                          Incluye {promo.productos.length} productos
                        </p>
                        {promo.productosDetalle && promo.productosDetalle.length > 0 && (
                          <div className="space-y-1">
                            {promo.productosDetalle.slice(0, 2).map((producto, index) => (
                              <p key={index} className="text-sm text-slate-600 dark:text-slate-300">
                                • {producto.nombre}
                              </p>
                            ))}
                            {promo.productosDetalle.length > 2 && (
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                +{promo.productosDetalle.length - 2} más
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-buffest-orange">
                            ${promo.valor.toFixed(2)}
                          </p>
                          <span className="inline-block bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 px-2 py-1 rounded-full text-xs font-medium">
                            PROMO
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {promo.buffet?.nombre}
                          </p>
                          <p className="text-xs text-slate-400">
                            {promo.buffet?.lugar}
                          </p>
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
        <PromoForm
          onSubmit={handleSubmitPromo}
          onCancel={handleCancelForm}
          isSubmitting={isSubmitting}
          promo={editingPromo || undefined}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && promoToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-xl max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              Confirmar Eliminación
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              ¿Estás seguro de que quieres eliminar la promoción &ldquo;{promoToDelete.nombre}&rdquo;? 
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
                onClick={confirmDeletePromo}
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

export default function PromosPage() {
  return (
    <ProtectedRoute>
      <PromosContent />
    </ProtectedRoute>
  );
}