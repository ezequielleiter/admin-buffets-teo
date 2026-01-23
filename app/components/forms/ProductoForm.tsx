import React, { useState } from 'react';
import { CreateProductoData } from '../../../types/api';
import { useBuffets } from '../../hooks/useBuffets';

interface ProductoFormProps {
  onSubmit: (data: CreateProductoData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function ProductoForm({ onSubmit, onCancel, isSubmitting = false }: ProductoFormProps) {
  const [formData, setFormData] = useState<CreateProductoData>({
    buffet_id: '',
    nombre: '',
    valor: 0,
    descripcion: ''
  });
  const [errors, setErrors] = useState<Partial<CreateProductoData>>({});
  
  const { buffets, loading: buffetsLoading } = useBuffets();

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateProductoData> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }
    if (!formData.buffet_id) {
      newErrors.buffet_id = 'El buffet es requerido';
    }
    if (formData.valor <= 0) {
      newErrors.valor = 'El valor debe ser mayor a 0';
    }
    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      await onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof CreateProductoData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-xl max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          Crear Nuevo Producto
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Selector de Buffet */}
          <div>
            <label htmlFor="buffet_id" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Buffet *
            </label>
            <select
              id="buffet_id"
              value={formData.buffet_id}
              onChange={(e) => handleInputChange('buffet_id', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white ${
                errors.buffet_id ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
              }`}
              disabled={buffetsLoading}
            >
              <option value="">
                {buffetsLoading ? 'Cargando buffets...' : 'Selecciona un buffet'}
              </option>
              {buffets.map((buffet) => (
                <option key={buffet._id} value={buffet._id}>
                  {buffet.nombre} - {buffet.lugar}
                </option>
              ))}
            </select>
            {errors.buffet_id && (
              <p className="text-red-500 text-sm mt-1">{errors.buffet_id}</p>
            )}
          </div>

          {/* Nombre */}
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Nombre del Producto *
            </label>
            <input
              type="text"
              id="nombre"
              value={formData.nombre}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white ${
                errors.nombre ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
              }`}
              placeholder="Ej: Parrillada Completa"
            />
            {errors.nombre && (
              <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>
            )}
          </div>

          {/* Valor */}
          <div>
            <label htmlFor="valor" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Precio *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500 dark:text-slate-400">$</span>
              <input
                type="number"
                id="valor"
                value={formData.valor || ''}
                onChange={(e) => handleInputChange('valor', parseFloat(e.target.value) || 0)}
                className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white ${
                  errors.valor ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                }`}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
            {errors.valor && (
              <p className="text-red-500 text-sm mt-1">{errors.valor}</p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Descripción *
            </label>
            <textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white ${
                errors.descripcion ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
              }`}
              placeholder="Describe el producto..."
              rows={3}
            />
            {errors.descripcion && (
              <p className="text-red-500 text-sm mt-1">{errors.descripcion}</p>
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || buffetsLoading}
              className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creando...
                </>
              ) : (
                'Crear Producto'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}