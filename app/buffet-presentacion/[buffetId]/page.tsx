'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import QRCode from 'qrcode';

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

interface Banner {
  _id: string;
  buffet_id: string;
  color: string;
  mensaje: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  user_id: string;
}

export default function BuffetPresentacionPage() {
  const params = useParams();
  const buffetId = params.buffetId as string;

  const [buffet, setBuffet] = useState<Buffet | null>(null);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentSection, setCurrentSection] = useState<'menu' | 'promos'>('menu');
  const [currentEventoIndex, setCurrentEventoIndex] = useState(0);
  const [bannerActivo, setBannerActivo] = useState(0);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  // Auto-rotación de secciones derecha (menu y promos)
  useEffect(() => {
    const sectionRotation = setInterval(() => {
      setCurrentSection(current => current === 'menu' ? 'promos' : 'menu');
    }, 15000); // Cambia cada 15 segundos

    return () => clearInterval(sectionRotation);
  }, []);

  // Auto-rotación de eventos (lado izquierdo)
  useEffect(() => {
    const eventosProximos = (eventos || [])
      .filter(e => e.fecha && new Date(e.fecha) >= new Date())
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

    if (eventosProximos.length > 1) {
      const eventoRotation = setInterval(() => {
        setCurrentEventoIndex(current => (current + 1) % eventosProximos.length);
      }, 10000); // Cambia cada 10 segundos

      return () => clearInterval(eventoRotation);
    }
  }, [eventos]);

  // Carrusel automático para banners
  useEffect(() => {
    if (banners.length <= 1) return;
    
    const interval = setInterval(() => {
      setBannerActivo((prev) => (prev + 1) % banners.length);
    }, 10000); // Cambia cada 10 segundos

    return () => clearInterval(interval);
  }, [banners.length]);

  // Reloj en tiempo real
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Generar QR Code para el menú
  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const menuUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/buffet-menu/${buffetId}`;
        const qrDataUrl = await QRCode.toDataURL(menuUrl, {
          width: 200,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });
        setQrCodeUrl(qrDataUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    if (buffetId) {
      generateQRCode();
    }
  }, [buffetId]);

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
          setBanners(data.banners || []);
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
  }, [buffetId]);

  // Filtrar productos disponibles
  const productosDisponibles = productos.filter(p => p.disponible !== false);

  // Ordenar eventos por fecha ascendente y filtrar próximos
  const eventosProximos = (eventos || [])
    .filter(e => e.fecha && new Date(e.fecha) >= new Date())
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    .slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-600 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-white text-2xl font-semibold animate-pulse">Cargando presentación...</p>
        </div>
      </div>
    );
  }

  if (error || !buffet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-800 via-red-600 to-orange-500 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-9xl mb-8 animate-bounce">🚫</div>
          <h1 className="text-4xl font-bold mb-4">Error</h1>
          <p className="text-xl">{error || 'Bar no encontrado'}</p>
        </div>
      </div>
    );
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-AR', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-AR', { 
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('es-AR', { 
        day: '2-digit', 
        month: 'short'
      }),
      time: date.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
      {/* Banner fijo superior */}
      {banners.length > 0 && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <div 
            className="w-full py-3 transition-all duration-1000 ease-in-out shadow-lg"
            style={{ backgroundColor: banners[bannerActivo]?.color || '#fbbf24' }}
          >
            <div className="max-w-6xl mx-auto">
              <p className="text-white font-bold text-lg md:text-xl text-center drop-shadow-lg">
                {banners[bannerActivo]?.mensaje}
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Elementos de fondo animados */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full animate-pulse"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-blue-500/20 rounded-full animate-pulse delay-300"></div>
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-pink-500/10 rounded-full animate-pulse delay-700"></div>
      </div>

      {/* Layout principal dividido en dos */}
      <div className="min-h-screen flex relative z-10">
        {/* Lado izquierdo - Eventos */}
        <div className="w-1/2 flex flex-col justify-center items-center p-12 bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-sm border-r border-white/10">
          {eventosProximos.length === 0 ? (
            <div className="text-center">
              <div className="text-8xl mb-8 animate-float">🎤</div>
              <h2 className="text-4xl font-bold text-purple-300 mb-4">Próximamente</h2>
              <p className="text-2xl text-gray-300">Nuevos eventos se anunciarán pronto</p>
            </div>
          ) : (
            <div className="text-center animate-fadeIn">
              {eventosProximos[currentEventoIndex] && (
                <>
                  {/* Imagen del evento */}
                  {eventosProximos[currentEventoIndex].imagen && (
                    <div className="w-100 mx-auto mb-8">
                      <Image
                        src={eventosProximos[currentEventoIndex].imagen}
                        alt={eventosProximos[currentEventoIndex].nombre}
                        width={500}
                        height={200}
                        className="w-full h-[450px] object-fill rounded-3xl shadow-2xl animate-glow"
                        priority
                      />
                    </div>
                  )}

                  {/* Nombre del evento */}
                  <h2 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-6 leading-tight">
                    {eventosProximos[currentEventoIndex].nombre}
                  </h2>

                  {/* Fecha del evento */}
                  <div className="text-4xl font-semibold text-yellow-400 mb-2">
                    {formatEventDate(eventosProximos[currentEventoIndex].fecha).date}
                  </div>
                  <div className="text-3xl text-purple-300">
                    {formatEventDate(eventosProximos[currentEventoIndex].fecha).time}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Lado derecho - Menú y Promociones */}
        <div className="w-1/2 flex flex-col p-12 bg-gradient-to-br from-green-900/30 to-blue-900/30 backdrop-blur-sm relative">
          {/* Contenido que rota */}
          <div className="flex-1 flex flex-col justify-center h-full pt-12">
            {currentSection === 'menu' && productosDisponibles.length > 0 && (
              <section className="animate-fadeIn h-full flex flex-col">
                <h2 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                  Nuestro Menú
                </h2>
                <div className="flex-1 overflow-y-auto hide-scrollbar space-y-3">
                  {productosDisponibles.map((producto) => (
                    <div 
                      key={producto._id}
                      className="flex justify-between items-center py-3 px-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <span className="text-white text-xl font-medium">
                        {producto.nombre}
                      </span>
                      <span className="text-yellow-400 text-2xl font-bold">
                        ${producto.valor}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {currentSection === 'promos' && promos.length > 0 && (
              <section className="animate-fadeIn h-full flex flex-col">
                <h2 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                  Promociones Especiales
                </h2>
                <div className="flex-1 overflow-y-auto hide-scrollbar space-y-3">
                  {promos.map((promo) => (
                    <div 
                      key={promo._id}
                      className="flex justify-between items-center py-3 px-4 rounded-lg bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-400/30 hover:from-orange-500/30 hover:to-red-500/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="bg-orange-400 text-black px-2 py-1 rounded-full text-xs font-bold">
                          PROMO
                        </span>
                        <span className="text-white text-xl font-medium">
                          {promo.nombre}
                        </span>
                      </div>
                      <span className="text-orange-400 text-2xl font-bold">
                        ${promo.valor}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {currentSection === 'promos' && promos.length === 0 && (
              <div className="text-center animate-fadeIn">
                <div className="text-6xl mb-6 animate-float">🎁</div>
                <h2 className="text-3xl font-bold text-orange-300 mb-4">Promociones</h2>
                <p className="text-xl text-gray-300">Próximamente nuevas ofertas especiales</p>
              </div>
            )}

            {currentSection === 'menu' && productosDisponibles.length === 0 && (
              <div className="text-center animate-fadeIn">
                <div className="text-6xl mb-6 animate-float">🍽️</div>
                <h2 className="text-3xl font-bold text-green-300 mb-4">Menú</h2>
                <p className="text-xl text-gray-300">Actualizando nuestras opciones</p>
              </div>
            )}
          </div>

          {/* QR Code Call to Action - Centrado en la parte inferior */}
          {qrCodeUrl && (
            <div className="absolute bottom-4 left-0 transform -translate-x-1/2 z-20">
              <div className="bg-black/80 backdrop-blur-sm rounded-xl p-3 text-center border border-yellow-400/30 shadow-2xl max-w-[200px]">
                <div className="mb-2 text-yellow-300 text-sm">
                  <div className="font-semibold">Agenda eventos y mira el menú completo</div>
                </div>
                <div className="bg-white p-2 rounded-lg inline-block shadow-xl">
                  <Image
                    src={qrCodeUrl}
                    alt="QR Code para acceder al menú desde móvil"
                    width={120}
                    height={120}
                    className="rounded"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}