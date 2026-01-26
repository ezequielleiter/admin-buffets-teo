import React, { useState, useEffect } from 'react';
import { CreatePromoData, UpdatePromoData, Promo, PromoFormErrors } from '../../../types/api';
import { useBuffets } from '../../hooks/useBuffets';
import { useProductos } from '../../hooks/useProductos';

interface PromoFormProps {
  onSubmit: (data: CreatePromoData | UpdatePromoData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  promo?: Promo; // Para edición
}

export default function PromoForm({ onSubmit, onCancel, isSubmitting = false, promo }: PromoFormProps) {
  const [formData, setFormData] = useState<CreatePromoData | UpdatePromoData>({
    buffet_id: promo?.buffet_id || '',
    nombre: promo?.nombre || '',
    productos: promo?.productos || [],
    valor: promo?.valor || 0
  });
  const [errors, setErrors] = useState<PromoFormErrors>({});
  
  const { buffets, loading: buffetsLoading } = useBuffets();
  const { productos, loading: productosLoading } = useProductos({ 
    buffet_id: formData.buffet_id 
  });

  // Efecto para actualizar el formulario cuando se pasa una promo para edición
  useEffect(() => {
    if (promo) {
      setFormData({
        buffet_id: promo.buffet_id,
        nombre: promo.nombre,
        productos: promo.productos,
        valor: promo.valor
      });
    }
  }, [promo]);

  const validateForm = (): boolean => {
    const newErrors: PromoFormErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }
    if (!formData.buffet_id) {
      newErrors.buffet_id = 'El buffet es requerido';
    }
    if (formData.valor <= 0) {
      newErrors.valor = 'El valor debe ser mayor a 0';
    }
    if (formData.productos.length < 2) {
      newErrors.productos = 'Debe seleccionar al menos 2 productos';
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

  const handleInputChange = (field: keyof CreatePromoData, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleBuffetChange = (buffetId: string) => {
    setFormData(prev => ({
      ...prev,
      buffet_id: buffetId,
      productos: promo ? prev.productos : [] // Solo reset productos si no es edición
    }));
    if (errors.buffet_id) {
      setErrors(prev => ({ ...prev, buffet_id: undefined }));
    }
  };

  const handleProductoToggle = (productoId: string) => {
    const newProductos = formData.productos.includes(productoId)
      ? formData.productos.filter(id => id !== productoId)
      : [...formData.productos, productoId];
    
    handleInputChange('productos', newProductos);
  };

  // Calcular precio sugerido basado en productos seleccionados
  const precioSugerido = formData.productos.reduce((total, productoId) => {
    const producto = productos.find(p => p._id === productoId);
    return total + (producto?.valor || 0);
  }, 0);

  const descuentoSugerido = Math.round(precioSugerido * 0.15 * 100) / 100; // 15% de descuento
  const precioPromoSugerido = precioSugerido - descuentoSugerido;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-text-primary mb-6">
          {promo ? 'Editar Promoción' : 'Crear Nueva Promoción'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Selector de Buffet */}
          <div>
            <label htmlFor="buffet_id" className="block text-sm font-medium text-text-primary mb-2">
              Buffet *
            </label>
            <select
              id="buffet_id"
              value={formData.buffet_id}
              onChange={(e) => handleBuffetChange(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-text-primary ${
                errors.buffet_id ? 'border-red-500' : 'border-gray-300'
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
            <label htmlFor="nombre" className="block text-sm font-medium text-text-primary mb-2">
              Nombre de la Promoción *
            </label>
            <input
              type="text"
              id="nombre"
              value={formData.nombre}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-text-primary ${
                errors.nombre ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: Combo Familiar"
            />
            {errors.nombre && (
              <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>
            )}
          </div>

          {/* Selección de Productos */}
          {formData.buffet_id && (
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Productos de la Promoción * (mínimo 2)
              </label>
              <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
                {productosLoading ? (
                  <p className="text-text-secondary">Cargando productos...</p>
                ) : productos.length === 0 ? (
                  <p className="text-text-secondary">No hay productos disponibles para este buffet</p>
                ) : (
                  <div className="space-y-2">
                    {productos.map((producto) => (
                      <label
                        key={producto._id}
                        className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.productos.includes(producto._id!)}
                          onChange={() => handleProductoToggle(producto._id!)}
                          className="w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary"
                        />
                        <div className="flex-1">
                          <span className="text-text-primary font-medium">
                            {producto.nombre}
                          </span>
                          <span className="text-text-secondary text-sm ml-2">
                            ${producto.valor.toFixed(2)}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              {errors.productos && (
                <p className="text-red-500 text-sm mt-1">{errors.productos}</p>
              )}
            </div>
          )}

          {/* Información de precios */}
          {formData.productos.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-text-primary mb-2">Información de Precios</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Precio individual total:</span>
                  <span className="text-text-primary">${precioSugerido.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Descuento sugerido (15%):</span>
                  <span className="text-green-600">${descuentoSugerido.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-text-primary">Precio promocional sugerido:</span>
                  <span className="text-primary">${precioPromoSugerido.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Valor de la Promoción */}
          <div>
            <label htmlFor="valor" className="block text-sm font-medium text-text-primary mb-2">
              Precio de la Promoción *
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
                placeholder={precioPromoSugerido > 0 ? precioPromoSugerido.toFixed(2) : '0.00'}
                step="0.01"
                min="0"
              />
            </div>
            {formData.productos.length > 0 && (
              <button
                type="button"
                onClick={() => handleInputChange('valor', precioPromoSugerido)}
                className="text-primary text-sm hover:underline mt-1"
              >
                Usar precio sugerido (${precioPromoSugerido.toFixed(2)})
              </button>
            )}
            {errors.valor && (
              <p className="text-red-500 text-sm mt-1">{errors.valor}</p>
            )}
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
                  {promo ? 'Actualizando...' : 'Creando...'}
                </>
              ) : (
                promo ? 'Actualizar Promoción' : 'Crear Promoción'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}