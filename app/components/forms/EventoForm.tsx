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
    buffet_id: evento?.buffet_id || '',
    imagen: evento?.imagen || '',
    descripcion: evento?.descripcion || '',
    redes_artista: {
      instagram: evento?.redes_artista?.instagram || '',
      facebook: evento?.redes_artista?.facebook || '',
      spotify: evento?.redes_artista?.spotify || '',
      youtube: evento?.redes_artista?.youtube || ''
    }
  });
  const [errors, setErrors] = useState<Partial<CreateEventoData>>({});
  
  const { buffets, loading: buffetsLoading } = useBuffets();

  // Efecto para actualizar el formulario cuando se pasa un evento para edición
  useEffect(() => {
    if (evento) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        nombre: evento.nombre,
        fecha: new Date(evento.fecha).toISOString(),
        buffet_id: evento.buffet_id,
        imagen: evento.imagen || '',
        descripcion: evento.descripcion || '',
        redes_artista: {
          instagram: evento.redes_artista?.instagram || '',
          facebook: evento.redes_artista?.facebook || '',
          spotify: evento.redes_artista?.spotify || '',
          youtube: evento.redes_artista?.youtube || ''
        }
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
    if (!formData.imagen || !formData.imagen.trim()) {
      newErrors.imagen = 'La URL de la imagen es requerida';
    } else {
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

  const handleInputChange = (field: keyof CreateEventoData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleRedSocialChange = (red: keyof NonNullable<CreateEventoData['redes_artista']>, value: string) => {
    setFormData(prev => ({
      ...prev,
      redes_artista: {
        ...prev.redes_artista,
        [red]: value
      }
    }));
  };

  // Formatear fecha para input datetime-local (mantener local, no UTC)
  const formatDateTimeLocal = (date: string) => {
    if (!date) return '';
    // Si ya está en formato yyyy-MM-ddTHH:mm, devolverlo
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(date)) return date;
    // Si es ISO, convertir a local
    const d = new Date(date);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const handleDateChange = (value: string) => {
    if (value) {
      // Convertir yyyy-MM-ddTHH:mm a ISO string (asumiendo local time)
      const date = new Date(value + ':00'); // Add seconds
      handleInputChange('fecha', date.toISOString());
    } else {
      handleInputChange('fecha', '');
    }
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

          {/* Imagen */}
          <div>
            <label htmlFor="imagen" className="block text-sm font-medium text-text-primary mb-2">
              URL de Imagen *
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

          {/* Descripción */}
          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-text-primary mb-2">
              Descripción (opcional)
            </label>
            <textarea
              id="descripcion"
              value={formData.descripcion || ''}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-text-primary"
              placeholder="Describe el evento..."
              rows={2}
            />
          </div>

          {/* Redes del Artista */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Redes del Artista (opcional)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input
                type="url"
                placeholder="Instagram"
                value={formData.redes_artista?.instagram || ''}
                onChange={e => handleRedSocialChange('instagram', e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-text-primary"
              />
              <input
                type="url"
                placeholder="Facebook"
                value={formData.redes_artista?.facebook || ''}
                onChange={e => handleRedSocialChange('facebook', e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-text-primary"
              />
              <input
                type="url"
                placeholder="Spotify"
                value={formData.redes_artista?.spotify || ''}
                onChange={e => handleRedSocialChange('spotify', e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-text-primary"
              />
              <input
                type="url"
                placeholder="YouTube"
                value={formData.redes_artista?.youtube || ''}
                onChange={e => handleRedSocialChange('youtube', e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-text-primary"
              />
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