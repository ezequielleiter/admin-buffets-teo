import React, { useState, useEffect } from 'react';
import { CreateProductoData, UpdateProductoData, Producto, ProductoFormErrors } from '../../../types/api';
import { useBuffets } from '../../hooks/useBuffets';

interface ProductoFormProps {
  onSubmit: (data: CreateProductoData | UpdateProductoData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  producto?: Producto; // Para edición
}

export default function ProductoForm({ onSubmit, onCancel, isSubmitting = false, producto }: ProductoFormProps) {
  const [formData, setFormData] = useState<CreateProductoData | UpdateProductoData>({
    buffet_id: producto?.buffet_id || '',
    nombre: producto?.nombre || '',
    valor: producto?.valor || 0,
    descripcion: producto?.descripcion || '',
    imagen: producto?.imagen || '',
    disponible: producto?.disponible ?? false
  });
  const [errors, setErrors] = useState<ProductoFormErrors>({});
  
  const { buffets, loading: buffetsLoading } = useBuffets();

  // Efecto para actualizar el formulario cuando se pasa un producto para edición
  useEffect(() => {
    if (producto) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        buffet_id: producto.buffet_id,
        nombre: producto.nombre,
        valor: producto.valor,
        descripcion: producto.descripcion,
        imagen: producto.imagen || '',
        disponible: producto.disponible ?? false
      });
    } else if (buffets.length > 0 && !formData.buffet_id) {
      // Automáticamente seleccionar el primer buffet si no hay uno seleccionado
      setFormData(prev => ({ ...prev, buffet_id: buffets[0]._id! }));
    }
  }, [producto, buffets, formData.buffet_id]);

  const validateForm = (): boolean => {
    const newErrors: ProductoFormErrors = {};

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
    if (formData.imagen && formData.imagen.trim()) {
      try {
        new URL(formData.imagen);
      } catch {
        newErrors.imagen = 'La URL de la imagen no es válida';
      }
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

  const handleInputChange = (field: keyof CreateProductoData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-text-primary mb-6">
          {producto ? 'Editar Producto' : 'Crear Nuevo Producto'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-text-primary mb-2">
              Nombre del Producto *
            </label>
            <input
              type="text"
              id="nombre"
              value={formData.nombre}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-text-primary ${
                errors.nombre ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: Parrillada Completa"
            />
            {errors.nombre && (
              <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>
            )}
          </div>

          {/* Valor */}
          <div>
            <label htmlFor="valor" className="block text-sm font-medium text-text-primary mb-2">
              Precio *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-text-secondary">$</span>
              <input
                type="number"
                id="valor"
                value={formData.valor || ''}
                onChange={(e) => handleInputChange('valor', parseFloat(e.target.value) || 0)}
                className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-text-primary ${
                  errors.valor ? 'border-red-500' : 'border-gray-300'
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
            <label htmlFor="descripcion" className="block text-sm font-medium text-text-primary mb-2">
              Descripción *
            </label>
            <textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-text-primary ${
                errors.descripcion ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Describe el producto..."
              rows={3}
            />
            {errors.descripcion && (
              <p className="text-red-500 text-sm mt-1">{errors.descripcion}</p>
            )}
          </div>

          {/* Imagen */}
          <div>
            <label htmlFor="imagen" className="block text-sm font-medium text-text-primary mb-2">
              URL de Imagen (opcional)
            </label>
            <input
              type="url"
              id="imagen"
              value={formData.imagen || ''}
              onChange={(e) => handleInputChange('imagen', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-text-primary ${
                errors.imagen ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="https://example.com/imagen.jpg"
            />
            {errors.imagen && (
              <p className="text-red-500 text-sm mt-1">{errors.imagen}</p>
            )}
            {formData.imagen && formData.imagen.trim() && (
              <div className="mt-2">
                <img
                  src={formData.imagen}
                  alt="Vista previa"
                  className="w-20 h-20 object-cover rounded border"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              </div>
            )}
          </div>

          {/* Disponible Switch */}
          <div className="flex items-center gap-3 pt-2">
            <label htmlFor="disponible" className="block text-sm font-medium text-text-primary">
              Disponible
            </label>
            <button
              type="button"
              role="switch"
              aria-checked={formData.disponible === true}
              id="disponible"
              onClick={() => handleInputChange('disponible', !(formData.disponible === true))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.disponible === true ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.disponible === true ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
            <span className="text-xs text-text-secondary">{formData.disponible === true ? 'Disponible' : 'No disponible'}</span>
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
              disabled={isSubmitting || buffetsLoading}
              className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-accent-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {producto ? 'Actualizando...' : 'Creando...'}
                </>
              ) : (
                producto ? 'Actualizar Producto' : 'Crear Producto'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}