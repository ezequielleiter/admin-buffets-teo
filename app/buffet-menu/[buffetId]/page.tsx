'use client';
import { useEffect, useState } from 'react';
import { FaInstagram, FaFacebook, FaSpotify, FaYoutube, FaTimes } from 'react-icons/fa';
import { useParams } from 'next/navigation';

interface Buffet {
  _id: string;
  nombre: string;
  descripcion?: string;
  logo?: string;
  lugar?: string;
  redes_sociales?: {
    instagram?: string;
    [key: string]: string | undefined;
  };
}

interface Producto {
  _id: string;
  nombre: string;
  valor: number;
  descripcion?: string;
  imagen?: string;
  disponible?: boolean;
}

interface Promo {
  _id: string;
  nombre: string;
  valor: number;
  productos: any[];
}

interface Evento {
  _id: string;
  nombre: string;
  fecha: string;
  imagen?: string;
  descripcion?: string;
  redes_artista?: {
    instagram?: string;
    facebook?: string;
    spotify?: string;
    youtube?: string;
    [key: string]: string | undefined;
  };
}

function getGoogleCalendarUrl(evento: Evento) {
  const start = new Date(evento.fecha);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const pad = (n: number) => n.toString().padStart(2, '0');
  const format = (d: Date) => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
  const dates = `${format(start)}/${format(end)}`;
  const text = encodeURIComponent(evento.nombre);
  const details = encodeURIComponent(evento.descripcion || '');
  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}`;
}

export default function BuffetMenuPage() {
  const params = useParams();
  const buffetId = params.buffetId as string;

  const [buffet, setBuffet] = useState<Buffet | null>(null);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventoSeleccionado, setEventoSeleccionado] = useState<Evento | null>(null);

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
          setEventos(data.eventos || []);
        } else {
          setError('Error al cargar el buffet');
        }
      } catch (err) {
        setError('Error de conexión');
      } finally {
        setLoading(false);
      }
    };
    if (buffetId) {
      fetchBuffet();
    }
    // eslint-disable-next-line
    // No returns here, solo fetch y setState
  }, [buffetId]);

  // Colores sugeridos para la landing
  // Primario: #1e293b (azul oscuro)
  // Secundario: #fbbf24 (amarillo)
  // Fondo: #f8fafc (gris claro)
  // Texto: #0f172a (casi negro)

  // Ordenar eventos por fecha ascendente y filtrar próximos
  const eventosProximos = (eventos || [])
    .filter(e => e.fecha && new Date(e.fecha) >= new Date())
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

  // Render condicional fuera del cuerpo de useEffect
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fbbf24] mx-auto"></div>
          <p className="mt-4 text-[#64748b]">Cargando menú...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🍽️</div>
          <h1 className="text-2xl font-bold text-[#1e293b] mb-2">Oops!</h1>
          <p className="text-[#64748b]">{error}</p>
        </div>
      </div>
    );
  }

  if (!buffet) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-[#1e293b] mb-2">Bar no encontrado</h1>
          <p className="text-[#64748b]">El bar que buscas no existe.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      {/* Header con logo, nombre y redes */}
      <header className="bg-gradient-to-r from-[#1e293b] to-[#334155] text-white py-8 px-4 flex flex-col items-center">
        {buffet.logo && (
          <img
            src={buffet.logo}
            alt={buffet.nombre}
            className="w-24 h-24 rounded-full object-cover border-4 border-[#fbbf24] shadow-lg mb-4"
            style={{ background: '#fff' }}
          />
        )}
        <h1 className="text-3xl md:text-5xl font-bold font-display mb-2 text-center drop-shadow-lg">
          {buffet.nombre}
        </h1>
        {buffet.lugar && (
          <p className="text-[#fbbf24] text-lg font-medium mb-2 text-center">{buffet.lugar}</p>
        )}
        <div className="flex gap-4 mt-2">
          {buffet.redes_sociales?.instagram && (
            <a
              href={buffet.redes_sociales.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#fbbf24] text-[#1e293b] px-4 py-2 rounded-full font-semibold shadow hover:bg-[#fde68a] transition"
            >
              <FaInstagram className="text-xl" /> Instagram
            </a>
          )}
        </div>
        {buffet.descripcion && (
          <p className="text-[#f1f5f9] text-base mt-4 max-w-xl text-center opacity-90">
            {buffet.descripcion}
          </p>
        )}
      </header>

      {/* Slider de próximos eventos */}
      <section className="w-full max-w-3xl mx-auto mt-6 px-2">
        <h2 className="text-2xl font-bold text-[#1e293b] mb-4 text-center">Próximos eventos</h2>
        {eventosProximos.length === 0 ? (
          <div className="text-center text-[#64748b]">No hay eventos próximos.</div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
            {eventosProximos.map((evento) => (
              <button
                key={evento._id}
                className="min-w-[260px] max-w-xs bg-white rounded-xl shadow-lg p-4 flex flex-col items-center flex-shrink-0 border border-[#e2e8f0] focus:outline-none hover:shadow-xl transition cursor-pointer"
                onClick={() => setEventoSeleccionado(evento)}
                aria-label={`Ver detalles de ${evento.nombre}`}
                type="button"
              >
                {evento.imagen ? (
                  <img
                    src={evento.imagen}
                    alt={evento.nombre}
                    className="w-40 h-40 object-cover rounded-lg mb-3 border"
                  />
                ) : (
                  <div className="w-40 h-40 flex items-center justify-center bg-[#f1f5f9] rounded-lg mb-3 text-5xl">🎤</div>
                )}
                <div className="text-[#1e293b] font-bold text-lg mb-1 text-center">{evento.nombre}</div>
                <div className="text-[#fbbf24] font-semibold text-base mb-1">
                  {evento.fecha && new Date(evento.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
                {evento.descripcion && (
                  <div className="text-[#64748b] text-sm text-center line-clamp-2">{evento.descripcion}</div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Modal de evento */}
        {eventoSeleccionado && (
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-fade-in">
              {/* Botón cerrar fuera del área de la imagen */}
              <div className="absolute -top-5 right-0 flex justify-end w-full">
                <button
                  className="bg-white rounded-full shadow p-1 text-[#1e293b] hover:text-[#fbbf24] text-2xl focus:outline-none border"
                  onClick={() => setEventoSeleccionado(null)}
                  aria-label="Cerrar"
                  type="button"
                  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                >
                  <FaTimes />
                </button>
              </div>
              {eventoSeleccionado.imagen && (
                <img
                  src={eventoSeleccionado.imagen}
                  alt={eventoSeleccionado.nombre}
                  className="w-full h-56 object-cover rounded-xl mb-4 border"
                />
              )}
              <h3 className="text-2xl font-bold text-[#1e293b] mb-2 text-center">{eventoSeleccionado.nombre}</h3>
              <div className="text-[#fbbf24] font-semibold text-base mb-2 text-center flex flex-col items-center gap-2">
                {eventoSeleccionado.fecha && new Date(eventoSeleccionado.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                {/* Botón para agendar en Google Calendar */}
                {eventoSeleccionado.fecha && (
                  <a
                    href={getGoogleCalendarUrl(eventoSeleccionado)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block bg-[#fbbf24] text-[#1e293b] font-semibold px-4 py-2 rounded-full shadow hover:bg-[#fde68a] transition text-sm"
                  >
                    Agendar evento
                  </a>
                )}
              </div>
              {eventoSeleccionado.descripcion && (
                <p className="text-[#64748b] text-base mb-4 text-center whitespace-pre-line">{eventoSeleccionado.descripcion}</p>
              )}
              {/* Redes sociales del artista */}
              {eventoSeleccionado.redes_artista && (
                <div className="flex justify-center gap-4 mt-2">
                  {eventoSeleccionado.redes_artista.instagram && (
                    <a href={eventoSeleccionado.redes_artista.instagram} target="_blank" rel="noopener noreferrer" className="text-[#E4405F] text-2xl hover:scale-110 transition" aria-label="Instagram"><FaInstagram /></a>
                  )}
                  {eventoSeleccionado.redes_artista.facebook && eventoSeleccionado.redes_artista.facebook !== '' && (
                    <a href={eventoSeleccionado.redes_artista.facebook} target="_blank" rel="noopener noreferrer" className="text-[#1877F3] text-2xl hover:scale-110 transition" aria-label="Facebook"><FaFacebook /></a>
                  )}
                  {eventoSeleccionado.redes_artista.spotify && (
                    <a href={eventoSeleccionado.redes_artista.spotify} target="_blank" rel="noopener noreferrer" className="text-[#1DB954] text-2xl hover:scale-110 transition" aria-label="Spotify"><FaSpotify /></a>
                  )}
                  {eventoSeleccionado.redes_artista.youtube && (
                    <a href={eventoSeleccionado.redes_artista.youtube} target="_blank" rel="noopener noreferrer" className="text-[#FF0000] text-2xl hover:scale-110 transition" aria-label="YouTube"><FaYoutube /></a>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Menú de productos */}
      <section className="w-full max-w-3xl mx-auto mt-10 px-2">
        <h2 className="text-2xl font-bold text-[#1e293b] mb-4 text-center">Menú</h2>
        <div className="bg-white rounded-xl shadow-lg p-4">
          {productos.length === 0 ? (
            <div className="text-center text-[#64748b]">No hay productos disponibles.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {productos.map((producto) => (
                <div key={producto._id} className="flex items-center bg-[#f8fafc] rounded-lg p-3 shadow-sm">
                  {producto.imagen && (
                    <img src={producto.imagen} alt={producto.nombre} className="w-20 h-20 object-cover rounded-lg mr-4 border" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-[#1e293b] mb-1">{producto.nombre}</h3>
                    <p className="text-[#64748b] text-sm mb-1">{producto.descripcion}</p>
                    <div className="font-bold text-[#fbbf24] text-xl">${producto.valor}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Promociones */}
      <section className="w-full max-w-3xl mx-auto mt-10 px-2 mb-10">
        <h2 className="text-2xl font-bold text-[#1e293b] mb-4 text-center">Promociones</h2>
        <div className="bg-white rounded-xl shadow-lg p-4">
          {promos.length === 0 ? (
            <div className="text-center text-[#64748b]">No hay promociones disponibles.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {promos.map((promo) => (
                <div key={promo._id} className="flex flex-col bg-[#f8fafc] rounded-lg p-3 shadow-sm">
                  <h3 className="font-semibold text-lg text-[#1e293b] mb-1">{promo.nombre}</h3>
                  <div className="font-bold text-[#fbbf24] text-xl">${promo.valor}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}