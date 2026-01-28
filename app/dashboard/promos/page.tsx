'use client';

import React, { useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import { usePromos } from '../../hooks/usePromos';
import PromoForm from '../../components/forms/PromoForm';
import { CreatePromoData, UpdatePromoData, Promo } from '../../../types/api';
import DashboardLayout from '@/app/components/DashboardLayout';

function PromosContent() {
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
      <div className="p-4 md:p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium mb-2">Error al cargar promociones</h3>
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
            <h2 className="text-base md:text-lg font-bold text-text-primary">Gestión de Promociones</h2>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary text-white px-3 md:px-4 py-2 rounded-lg hover:bg-accent-blue transition-colors flex items-center gap-2 text-sm md:text-base"
          >
            <span className="material-symbols-outlined text-lg md:text-xl">add</span>
            Nueva Promoción
          </button>
        </header>

        {/* Content */}
        <div className="p-4 md:p-8">
          {/* Filters */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-text-primary mb-2">
                Buscar por nombre
              </label>
              <input
                type="text"
                id="nombre"
                value={filters.nombre}
                onChange={(e) => setFilters(prev => ({ ...prev, nombre: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-text-primary text-sm md:text-base"
                placeholder="Buscar promociones..."
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ nombre: '' })}
                className="w-full px-4 py-2 border border-gray-300 text-text-secondary rounded-lg hover:bg-gray-50 transition-colors text-sm md:text-base"
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-4 md:p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-text-primary">
                  Promociones ({total})
                </h3>
              </div>
              
              {promos.length === 0 ? (
                <div className="p-8 md:p-12 text-center">
                  <span className="material-symbols-outlined text-text-secondary text-4xl md:text-6xl mb-4">sell</span>
                  <h3 className="text-lg md:text-xl font-medium text-text-primary mb-2">
                    No hay promociones
                  </h3>
                  <p className="text-text-secondary mb-6 text-sm md:text-base">
                    Comienza creando tu primera promoción
                  </p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-primary text-white px-4 md:px-6 py-2 md:py-3 rounded-lg hover:bg-accent-blue transition-colors text-sm md:text-base"
                  >
                    Crear Promoción
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 p-4 md:p-6">
                  {promos.map((promo) => (
                    <div key={promo._id} className="border border-gray-200 rounded-lg p-4 md:p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="bg-accent-orange/10 p-2 rounded-lg text-accent-orange flex-shrink-0">
                          <span className="material-symbols-outlined text-lg md:text-xl">local_offer</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => handleEditPromo(promo)}
                            className="p-1 text-text-secondary hover:text-text-primary rounded hover:bg-gray-100 transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button 
                            onClick={() => handleDeletePromo(promo)}
                            className="p-1 text-accent-orange hover:text-accent-orange-intense rounded hover:bg-red-50 transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </div>
                      
                      <h4 className="font-medium text-text-primary mb-2 text-sm md:text-base truncate">
                        {promo.nombre}
                      </h4>
                      
                      {/* Productos incluidos */}
                      <div className="mb-4">
                        <p className="text-xs text-text-secondary mb-2 uppercase tracking-wider">
                          Incluye {promo.productos.length} productos
                        </p>
                        {promo.productosDetalle && promo.productosDetalle.length > 0 && (
                          <div className="space-y-1">
                            {promo.productosDetalle.slice(0, 2).map((producto, index) => (
                              <p key={index} className="text-sm text-text-primary">
                                • {producto.nombre}
                              </p>
                            ))}
                            {promo.productosDetalle.length > 2 && (
                              <p className="text-sm text-text-secondary">
                                +{promo.productosDetalle.length - 2} más
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xl md:text-2xl font-bold text-accent-orange">
                            ${promo.valor.toFixed(2)}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-xl max-w-sm md:max-w-md w-full mx-4">
            <h3 className="text-lg md:text-xl font-bold text-text-primary mb-4">
              Confirmar Eliminación
            </h3>
            <p className="text-text-secondary mb-6 text-sm md:text-base">
              ¿Estás seguro de que quieres eliminar la promoción &ldquo;{promoToDelete.nombre}&rdquo;? 
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
                onClick={confirmDeletePromo}
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

export default function PromosPage() {
  return (
    <ProtectedRoute>
      <PromosContent />
    </ProtectedRoute>
  );
}