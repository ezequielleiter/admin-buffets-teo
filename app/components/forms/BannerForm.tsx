import React, { useState, useEffect } from 'react';
import { CreateBannerData, UpdateBannerData, Banner, BannerFormErrors } from '../../../types/api';
import { useBuffets } from '../../hooks/useBuffets';

interface BannerFormProps {
  onSubmit: (data: CreateBannerData | UpdateBannerData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  banner?: Banner; // Para edición
}

export default function BannerForm({ onSubmit, onCancel, isSubmitting = false, banner }: BannerFormProps) {
  const [formData, setFormData] = useState<CreateBannerData | UpdateBannerData>({
    buffet_id: banner?.buffet_id || '',
    mensaje: banner?.mensaje || '',
    link: banner?.link || '',
    color: banner?.color || '#000000'
  });
  const [errors, setErrors] = useState<BannerFormErrors>({});
  
  const { buffets, loading: buffetsLoading } = useBuffets();

  // Efecto para actualizar el formulario cuando se pasa un banner para edición
  useEffect(() => {
    if (banner) {
      setFormData({
        buffet_id: banner.buffet_id,
        mensaje: banner.mensaje,
        link: banner.link || '',
        color: banner.color
      });
    } else if (buffets.length > 0) {
      // Automáticamente seleccionar el primer (y único) buffet del usuario
      setFormData(prev => ({ ...prev, buffet_id: buffets[0]._id! }));
    }
  }, [banner, buffets]);

  const validateForm = (): boolean => {
    const newErrors: BannerFormErrors = {};

    if (!formData.mensaje || !formData.mensaje.trim()) {
      newErrors.mensaje = 'El mensaje es requerido';
    }

    if (!formData.color || formData.color.trim() === '') {
      newErrors.color = 'El color es requerido';
    }

    if (formData.link && formData.link.trim()) {
      try {
        new URL(formData.link);
      } catch {
        newErrors.link = 'La URL del enlace no es válida';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Limpiar link vacío
      const dataToSubmit = {
        ...formData,
        link: formData.link?.trim() || undefined
      };
      await onSubmit(dataToSubmit);
    }
  };

  const handleInputChange = (field: keyof CreateBannerData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Solo limpiar errores para campos que existen en BannerFormErrors
    if (field !== 'buffet_id' && errors[field as keyof BannerFormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-text-primary mb-6">
          {banner ? 'Editar Banner' : 'Crear Nuevo Banner'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label htmlFor="mensaje" className="block text-sm font-medium text-text-primary mb-2">
              Mensaje *
            </label>
            <textarea
              id="mensaje"
              value={formData.mensaje}
              onChange={(e) => handleInputChange('mensaje', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-text-primary ${
                errors.mensaje ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Escribe el mensaje del banner..."
              rows={3}
            />
            {errors.mensaje && (
              <p className="text-red-500 text-sm mt-1">{errors.mensaje}</p>
            )}
          </div>

          {/* Color */}
          <div>
            <label htmlFor="color" className="block text-sm font-medium text-text-primary mb-2">
              Color *
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                id="color"
                value={formData.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={formData.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
                className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-text-primary ${
                  errors.color ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="#000000"
              />
            </div>
            {errors.color && (
              <p className="text-red-500 text-sm mt-1">{errors.color}</p>
            )}
          </div>

          {/* Link (opcional) */}
          <div>
            <label htmlFor="link" className="block text-sm font-medium text-text-primary mb-2">
              Enlace (opcional)
            </label>
            <input
              type="url"
              id="link"
              value={formData.link || ''}
              onChange={(e) => handleInputChange('link', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-text-primary ${
                errors.link ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="https://ejemplo.com"
            />
            {errors.link && (
              <p className="text-red-500 text-sm mt-1">{errors.link}</p>
            )}
          </div>

          {/* Vista previa */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Vista previa
            </label>
            <div 
              className="w-full px-4 py-3 rounded-lg text-center font-medium text-sm"
              style={{ 
                backgroundColor: formData.color || '#000000',
                color: getContrastColor(formData.color || '#000000')
              }}
            >
              {formData.mensaje || 'Mensaje del banner...'}
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-text-secondary rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-accent-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {banner ? 'Actualizando...' : 'Creando...'}
                </>
              ) : (
                banner ? 'Actualizar Banner' : 'Crear Banner'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Función auxiliar para determinar el color del texto basado en el color de fondo
function getContrastColor(bgColor: string): string {
  // Convertir hex a RGB
  const color = bgColor.replace('#', '');
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);
  
  // Calcular luminancia
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Retornar color contrastante
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}