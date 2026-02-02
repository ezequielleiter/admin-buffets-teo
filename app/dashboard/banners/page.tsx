'use client';

import React, { useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useBanners } from '../../hooks/useBanners';
import BannerForm from '../../components/forms/BannerForm';
import { CreateBannerData, UpdateBannerData, Banner } from '../../../types/api';
import DashboardLayout from '@/app/components/DashboardLayout';

function BannersContent() {
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<Banner | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filters, setFilters] = useState({
    mensaje: ''
  });
  
  const { banners, total, loading, error, createBanner, updateBanner, deleteBanner, reload } = useBanners(filters);

  const handleSubmitBanner = async (data: CreateBannerData | UpdateBannerData) => {
    setIsSubmitting(true);
    try {
      let result;
      if (editingBanner) {
        result = await updateBanner(editingBanner._id!, data as UpdateBannerData);
      } else {
        result = await createBanner(data as CreateBannerData);
      }
      
      if (result) {
        setShowForm(false);
        setEditingBanner(null);
        // Opcional: mostrar notificación de éxito
      }
    } catch (error) {
      console.error('Error submitting banner:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditBanner = (banner: Banner) => {
    setEditingBanner(banner);
    setShowForm(true);
  };

  const handleDeleteBanner = (banner: Banner) => {
    setBannerToDelete(banner);
    setShowDeleteModal(true);
  };

  const confirmDeleteBanner = async () => {
    if (!bannerToDelete) return;
    
    setIsDeleting(true);
    try {
      const success = await deleteBanner(bannerToDelete._id!);
      if (success) {
        setShowDeleteModal(false);
        setBannerToDelete(null);
        // Opcional: mostrar notificación de éxito
      }
    } catch (error) {
      console.error('Error deleting banner:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingBanner(null);
  };

  const getContrastColor = (bgColor: string): string => {
    const color = bgColor.replace('#', '');
    const r = parseInt(color.substr(0, 2), 16);
    const g = parseInt(color.substr(2, 2), 16);
    const b = parseInt(color.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  };

  if (error) {
    return (
      <div className="p-4 md:p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium mb-2">Error al cargar banners</h3>
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
    <DashboardLayout title='Banners'>
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Navigation Bar */}
        <header className="h-16 md:h-20 border-b border-gray-200 bg-white flex items-center justify-between px-4 md:px-8 py-2 md:py-4 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-base md:text-lg font-bold text-text-primary">Gestión de Banners</h2>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary text-white px-3 md:px-4 py-2 rounded-lg hover:bg-accent-blue transition-colors flex items-center gap-2 text-sm md:text-base"
          >
            <span className="material-symbols-outlined text-lg md:text-xl">add</span>
            Nuevo Banner
          </button>
        </header>

        {/* Content */}
        <div className="p-4 md:p-8">
          {/* Filters */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="mensaje" className="block text-sm font-medium text-text-primary mb-2">
                Buscar por mensaje
              </label>
              <input
                type="text"
                id="mensaje"
                value={filters.mensaje}
                onChange={(e) => setFilters(prev => ({ ...prev, mensaje: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-text-primary text-sm md:text-base"
                placeholder="Buscar banners..."
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ mensaje: '' })}
                className="w-full px-4 py-2 border border-gray-300 text-text-secondary rounded-lg hover:bg-gray-50 transition-colors text-sm md:text-base"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>

          {/* Banners List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-4 md:p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-text-primary">
                  Banners ({total})
                </h3>
              </div>
              
              {banners.length === 0 ? (
                <div className="p-8 md:p-12 text-center">
                  <span className="material-symbols-outlined text-text-secondary text-4xl md:text-6xl mb-4">campaign</span>
                  <h3 className="text-lg md:text-xl font-medium text-text-primary mb-2">
                    No hay banners
                  </h3>
                  <p className="text-text-secondary mb-6 text-sm md:text-base">
                    Comienza creando tu primer banner
                  </p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-primary text-white px-4 md:px-6 py-2 md:py-3 rounded-lg hover:bg-accent-blue transition-colors text-sm md:text-base"
                  >
                    Crear Banner
                  </button>
                </div>
              ) : (
                <div className="space-y-4 p-4 md:p-6">
                  {banners.map((banner) => (
                    <div key={banner._id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      {/* Banner Preview */}
                      <div 
                        className="px-4 py-3 text-center font-medium relative"
                        style={{ 
                          backgroundColor: banner.color,
                          color: getContrastColor(banner.color)
                        }}
                      >
                        <div className="absolute top-2 right-2 flex items-center gap-1">
                          <button 
                            onClick={() => handleEditBanner(banner)}
                            className="p-1 bg-black/20 backdrop-blur-sm text-white hover:bg-black/30 rounded-full transition-colors min-h-[28px] min-w-[28px] flex items-center justify-center"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button 
                            onClick={() => handleDeleteBanner(banner)}
                            className="p-1 bg-black/20 backdrop-blur-sm text-white hover:bg-red-500 rounded-full transition-colors min-h-[28px] min-w-[28px] flex items-center justify-center"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                        <span className="text-sm md:text-base">{banner.mensaje}</span>
                      </div>
                      
                      {/* Banner Details */}
                      <div className="p-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-text-secondary mb-1">Color</p>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-4 h-4 rounded border border-gray-300"
                                style={{ backgroundColor: banner.color }}
                              ></div>
                              <span className="text-sm text-text-primary font-mono">{banner.color}</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-text-secondary mb-1">Enlace</p>
                            {banner.link ? (
                              <a 
                                href={banner.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline truncate block"
                              >
                                {banner.link}
                              </a>
                            ) : (
                              <span className="text-sm text-text-secondary">Sin enlace</span>
                            )}
                          </div>
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
        <BannerForm
          onSubmit={handleSubmitBanner}
          onCancel={handleCancelForm}
          isSubmitting={isSubmitting}
          banner={editingBanner || undefined}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && bannerToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-xl max-w-sm md:max-w-md w-full mx-4">
            <h3 className="text-lg md:text-xl font-bold text-text-primary mb-4">
              Confirmar Eliminación
            </h3>
            <p className="text-text-secondary mb-6 text-sm md:text-base">
              ¿Estás seguro de que quieres eliminar este banner? Esta acción no se puede deshacer.
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
                onClick={confirmDeleteBanner}
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

export default function BannersPage() {
  return (
    <ProtectedRoute>
      <BannersContent />
    </ProtectedRoute>
  );
}