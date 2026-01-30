'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useProductos } from '../../hooks/useProductos';
import ProductoForm from '../../components/forms/ProductoForm';
import { CreateProductoData, UpdateProductoData, Producto } from '../../../types/api';
import DashboardLayout from '@/app/components/DashboardLayout';

function ProductosContent() {
  const [imageLoadError, setImageLoadError] = useState<{ [key: string]: boolean }>({});
  const [showForm, setShowForm] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productoToDelete, setProductoToDelete] = useState<Producto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filters, setFilters] = useState({
    nombre: ''
  });
  
  const { productos, total, loading, error, createProducto, updateProducto, deleteProducto, reload } = useProductos(filters);

  const handleSubmitProducto = async (data: CreateProductoData | UpdateProductoData) => {
    setIsSubmitting(true);
    try {
      let result;
      if (editingProducto) {
        result = await updateProducto(editingProducto._id!, data as UpdateProductoData);
      } else {
        result = await createProducto(data as CreateProductoData);
      }
      
      if (result) {
        setShowForm(false);
        setEditingProducto(null);
        // Opcional: mostrar notificación de éxito
      }
    } catch (error) {
      console.error('Error submitting producto:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProducto = (producto: Producto) => {
    setEditingProducto(producto);
    setShowForm(true);
  };

  const handleDeleteProducto = (producto: Producto) => {
    setProductoToDelete(producto);
    setShowDeleteModal(true);
  };

  const confirmDeleteProducto = async () => {
    if (!productoToDelete) return;
    
    setIsDeleting(true);
    try {
      const success = await deleteProducto(productoToDelete._id!);
      if (success) {
        setShowDeleteModal(false);
        setProductoToDelete(null);
        // Opcional: mostrar notificación de éxito
      }
    } catch (error) {
      console.error('Error deleting producto:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingProducto(null);
  };

  if (error) {
    return (
      <div className="p-4 md:p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium mb-2">Error al cargar productos</h3>
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
    <DashboardLayout title='Productos'>
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Navigation Bar */}
        <header className="h-16 md:h-20 border-b border-gray-200 bg-white flex items-center justify-between px-4 md:px-8 py-2 md:py-4 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-base md:text-lg font-bold text-text-primary">Gestión de Productos</h2>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary text-white px-3 md:px-4 py-2 rounded-lg hover:bg-accent-blue transition-colors flex items-center gap-2 text-sm md:text-base"
          >
            <span className="material-symbols-outlined text-lg md:text-xl">add</span>
            Nuevo Producto
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
                placeholder="Buscar productos..."
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

          {/* Products List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-4 md:p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-text-primary">
                  Productos ({total})
                </h3>
              </div>
              
              {productos.length === 0 ? (
                <div className="p-8 md:p-12 text-center">
                  <span className="material-symbols-outlined text-text-secondary text-4xl md:text-6xl mb-4">inventory_2</span>
                  <h3 className="text-lg md:text-xl font-medium text-text-primary mb-2">
                    No hay productos
                  </h3>
                  <p className="text-text-secondary mb-6 text-sm md:text-base">
                    Comienza creando tu primer producto
                  </p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-primary text-white px-4 md:px-6 py-2 md:py-3 rounded-lg hover:bg-accent-blue transition-colors text-sm md:text-base"
                  >
                    Crear Producto
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 p-4 md:p-6">
                  {productos.map((producto) => (
                    <div key={producto._id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      {/* Image Banner */}
                      <div className="relative h-32 bg-gray-100">
                        {producto.imagen && !imageLoadError[producto._id ?? ''] ? (
                          <Image
                            src={producto.imagen}
                            alt={producto.nombre}
                            fill
                            className="object-cover"
                            onError={() => setImageLoadError(prev => ({ ...prev, [producto._id ?? '']: true }))}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-4xl">restaurant_menu</span>
                          </div>
                        )}
                        {/* Edit/Delete buttons overlay */}
                        <div className="absolute top-2 right-2 flex items-center gap-1">
                          <button 
                            onClick={() => handleEditProducto(producto)}
                            className="p-1 bg-white/80 backdrop-blur-sm text-text-secondary hover:text-text-primary rounded-full hover:bg-white transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center shadow-sm"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button 
                            onClick={() => handleDeleteProducto(producto)}
                            className="p-1 bg-white/80 backdrop-blur-sm text-accent-orange hover:text-accent-orange-intense rounded-full hover:bg-red-50 transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center shadow-sm"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="p-4 md:p-6">
                        <h4 className="font-medium text-text-primary mb-2 text-sm md:text-base truncate">
                          {producto.nombre}
                        </h4>
                        
                        <p className="text-text-secondary text-xs md:text-sm mb-4 line-clamp-3">
                          {producto.descripcion}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xl md:text-2xl font-bold text-primary">
                              ${producto.valor.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            {producto.disponible === true ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                                Disponible
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                                No disponible
                              </span>
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
        <ProductoForm
          onSubmit={handleSubmitProducto}
          onCancel={handleCancelForm}
          isSubmitting={isSubmitting}
          producto={editingProducto || undefined}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && productoToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-xl max-w-sm md:max-w-md w-full mx-4">
            <h3 className="text-lg md:text-xl font-bold text-text-primary mb-4">
              Confirmar Eliminación
            </h3>
            <p className="text-text-secondary mb-6 text-sm md:text-base">
              ¿Estás seguro de que quieres eliminar el producto &ldquo;{productoToDelete.nombre}&rdquo;? 
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
                onClick={confirmDeleteProducto}
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

export default function ProductosPage() {
  return (
    <ProtectedRoute>
      <ProductosContent />
    </ProtectedRoute>
  );
}