import React, { useState, useEffect } from 'react';
import { CreateEventoData, UpdateEventoData, Evento } from '../../../types/api';
import { useBuffets } from '../../hooks/useBuffets';

interface EventoFormProps {
  onSubmit: (data: CreateEventoData | UpdateEventoData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  evento?: Evento; // Para edición
}

export default function EventoForm({ onSubmit, onCancel, isSubmitting = false, evento }: EventoFormProps) {
  const [formData, setFormData] = useState<CreateEventoData | UpdateEventoData>({
    nombre: evento?.nombre || '',
    fecha: evento?.fecha ? new Date(evento.fecha).toISOString() : '',
    buffet_id: evento?.buffet_id || ''
  });
  const [errors, setErrors] = useState<Partial<CreateEventoData>>({});
  
  const { buffets, loading: buffetsLoading } = useBuffets();

  // Efecto para actualizar el formulario cuando se pasa un evento para edición
  useEffect(() => {
    if (evento) {
      setFormData({
        nombre: evento.nombre,
        fecha: new Date(evento.fecha).toISOString(),
        buffet_id: evento.buffet_id
      });
    } else if (buffets.length > 0 && !formData.buffet_id) {
      // Automáticamente seleccionar el primer buffet si no hay uno seleccionado
      setFormData(prev => ({ ...prev, buffet_id: buffets[0]._id! }));
    }
  }, [evento, buffets, formData.buffet_id]);

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateEventoData> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre del evento es requerido';
    }
    if (!formData.fecha) {
      newErrors.fecha = 'La fecha es requerida';
    }
    if (!formData.buffet_id) {
      newErrors.buffet_id = 'El buffet es requerido';
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

  const handleInputChange = (field: keyof CreateEventoData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Formatear fecha para input datetime-local
  const formatDateTimeLocal = (date: string) => {
    if (!date) return '';
    return new Date(date).toISOString().slice(0, 16);
  };

  const handleDateChange = (value: string) => {
    // Convertir de datetime-local a ISO string
    const isoDate = new Date(value).toISOString();
    handleInputChange('fecha', isoDate);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-text-primary mb-6">
          {evento ? 'Editar Evento' : 'Crear Nuevo Evento'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre del Evento */}
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-text-primary mb-2">
              Nombre del Evento *
            </label>
            <input
              type="text"
              id="nombre"
              value={formData.nombre}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-text-primary ${
                errors.nombre ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: Boda familiar, Evento corporativo..."
            />
            {errors.nombre && (
              <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>
            )}
          </div>

          {/* Fecha y Hora */}
          <div>
            <label htmlFor="fecha" className="block text-sm font-medium text-text-primary mb-2">
              Fecha y Hora del Evento *
            </label>
            <input
              type="datetime-local"
              id="fecha"
              value={formatDateTimeLocal(formData.fecha)}
              onChange={(e) => handleDateChange(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-text-primary ${
                errors.fecha ? 'border-red-500' : 'border-gray-300'
              }`}
              min={new Date().toISOString().slice(0, 16)} // No permitir fechas pasadas
            />
            {errors.fecha && (
              <p className="text-red-500 text-sm mt-1">{errors.fecha}</p>
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
                  {evento ? 'Actualizando...' : 'Creando...'}
                </>
              ) : (
                evento ? 'Actualizar Evento' : 'Crear Evento'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}