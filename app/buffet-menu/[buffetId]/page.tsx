'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Buffet {
  _id: string;
  nombre: string;
  descripcion?: string;
  // Otros campos según la API
}

interface Producto {
  _id: string;
  nombre: string;
  valor: number;
  descripcion?: string;
  imagen?: string;
  disponible?: boolean
}

interface Promo {
  _id: string;
  nombre: string;
  valor: number;
  productos: any[];
}

export default function BuffetMenuPage() {
  const params = useParams();
  const buffetId = params.buffetId as string;

  const [buffet, setBuffet] = useState<Buffet | null>(null);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBuffet = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin-buffets/buffet-menu/${buffetId}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setBuffet(data.buffet);
          setProductos(data.productos || []);
          setPromos(data.promos || []);
        } else {
          setError('Error al cargar el buffet');
        }
      } catch (err) {
        console.error('Error fetching buffet:', err);
        setError('Error de conexión');
      } finally {
        setLoading(false);
      }
    };

    if (buffetId) {
      fetchBuffet();
    }
  }, [buffetId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-secondary">Cargando menú...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface-light flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🍽️</div>
          <h1 className="text-2xl font-display font-bold text-text-primary mb-2">Oops!</h1>
          <p className="text-text-secondary">{error}</p>
        </div>
      </div>
    );
  }

  if (!buffet) {
    return (
      <div className="min-h-screen bg-surface-light flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-display font-bold text-text-primary mb-2">Buffet no encontrado</h1>
          <p className="text-text-secondary">El buffet que buscas no existe.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-light">
      {/* Header del buffet */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">
            {buffet.nombre}
          </h1>
          {buffet.descripcion && (
            <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
              {buffet.descripcion}
            </p>
          )}
        </div>
      </div>

      {/* Menú de productos */}
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-display font-bold text-text-primary mb-6 text-center">Menú</h2>
          {productos.length === 0 ? (
            <div className="text-center text-text-secondary">No hay productos disponibles.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {productos.map((producto) => (
                <div key={producto._id} className="flex flex-col md:flex-row items-center bg-surface-light rounded-lg p-4 shadow-sm">
                  {producto.imagen && (
                    <img src={producto.imagen} alt={producto.nombre} className="w-24 h-24 object-cover rounded-lg mb-4 md:mb-0 md:mr-6 border" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-text-primary mb-1">{producto.nombre}</h3>
                    <p className="text-text-secondary text-sm mb-2">{producto.descripcion}</p>
                    <div className="font-bold text-primary text-xl">${producto.valor}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Promociones */}
        <div className="bg-white rounded-xl shadow-lg p-8 mt-12">
          <h2 className="text-2xl font-display font-bold text-text-primary mb-6 text-center">Promociones</h2>
          {promos.length === 0 ? (
            <div className="text-center text-text-secondary">No hay promociones disponibles.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {promos.map((promo) => (
                <div key={promo._id} className="flex flex-col bg-surface-light rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold text-lg text-text-primary mb-1">{promo.nombre}</h3>
                  <div className="text-text-secondary text-sm mb-2">
                    {promo.productos && promo.productos.length > 0 && (
                      <ul className="list-disc list-inside">
                        {promo.productos.map((prod: any, idx: number) => (
                          <li key={idx}>{prod.nombre}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="font-bold text-primary text-xl">${promo.valor}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}