'use client';

import ProtectedRoute from '../components/ProtectedRoute';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../hooks/useAuth';
import { useBuffets } from '../hooks/useBuffets';
import { useEventos } from '../hooks/useEventos';
import { useProductos } from '../hooks/useProductos';
import { usePromos } from '../hooks/usePromos';

function DashboardContent() {
  const { user } = useAuth();
  
  // Obtener estadísticas básicas
  const { buffets, total: totalBuffets } = useBuffets();
  const { eventos, total: totalEventos } = useEventos();
  const { productos, total: totalProductos } = useProductos();
  const { promos, total: totalPromos } = usePromos();

  // Obtener eventos de hoy
  const today = new Date().toISOString().split('T')[0];
  const { total: eventosHoy } = useEventos({
    fecha_desde: `${today}T00:00:00.000Z`,
    fecha_hasta: `${today}T23:59:59.999Z`
  });

  return (
    <DashboardLayout title="Dashboard">
      <div className="p-4 lg:p-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Bienvenido de nuevo, {buffets.length > 0 ? buffets[0].nombre : (user?.name || 'Administrador')}
          </h1>
          <p className="text-text-secondary">
            {buffets.length > 0 
              ? `Gestiona tu buffet ${buffets[0].nombre} ubicado en ${buffets[0].lugar}` 
              : 'Aquí tienes el resumen de lo que está pasando hoy con tus buffets.'
            }
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Total Buffets */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 h-full w-1 bg-primary"></div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-text-secondary text-sm font-medium mb-1 uppercase tracking-wider">
                    Total Buffets
                  </p>
                  <h3 className="text-3xl font-bold text-text-primary">{totalBuffets}</h3>
                </div>
                <div className="bg-primary/10 p-2 rounded-lg text-primary">
                  <span className="material-symbols-outlined">restaurant</span>
                </div>
              </div>
            </div>

            {/* Total Eventos Hoy */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 h-full w-1 bg-accent-blue"></div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-text-secondary text-sm font-medium mb-1 uppercase tracking-wider">
                    Eventos Hoy
                  </p>
                  <h3 className="text-3xl font-bold text-text-primary">{eventosHoy}</h3>
                </div>
                <div className="bg-accent-blue/10 p-2 rounded-lg text-accent-blue">
                  <span className="material-symbols-outlined">event_available</span>
                </div>
              </div>
            </div>

            {/* Total Productos */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 h-full w-1 bg-secondary"></div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-text-secondary text-sm font-medium mb-1 uppercase tracking-wider">
                    Total Productos
                  </p>
                  <h3 className="text-3xl font-bold text-text-primary">{totalProductos}</h3>
                </div>
                <div className="bg-secondary/10 p-2 rounded-lg text-secondary">
                  <span className="material-symbols-outlined">inventory_2</span>
                </div>
              </div>
            </div>

            {/* Promociones Activas */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 h-full w-1 bg-accent-orange"></div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-text-secondary text-sm font-medium mb-1 uppercase tracking-wider">
                    Promos Activas
                  </p>
                  <h3 className="text-3xl font-bold text-text-primary">{totalPromos}</h3>
                </div>
                <div className="bg-accent-orange/10 p-2 rounded-lg text-accent-orange">
                  <span className="material-symbols-outlined">local_offer</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <a 
              href="/dashboard/eventos"
              className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined">add_circle</span>
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">Nuevo Evento</h3>
                  <p className="text-text-secondary text-sm">Crear evento para un buffet</p>
                </div>
              </div>
            </a>

            <a 
              href="/dashboard/productos"
              className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center gap-4">
                <div className="bg-secondary/10 p-3 rounded-lg text-secondary group-hover:bg-secondary group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined">add_circle</span>
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">Nuevo Producto</h3>
                  <p className="text-text-secondary text-sm">Agregar producto al menú</p>
                </div>
              </div>
            </a>

            <a 
              href="/dashboard/promos"
              className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center gap-4">
                <div className="bg-accent-orange/10 p-3 rounded-lg text-accent-orange group-hover:bg-accent-orange group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined">add_circle</span>
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">Nueva Promoción</h3>
                  <p className="text-text-secondary text-sm">Crear combo de productos</p>
                </div>
              </div>
            </a>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Próximos Eventos */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined">upcoming</span>
                  Próximos Eventos
                </h3>
              </div>
              <div className="p-6">
                {eventos.slice(0, 5).length === 0 ? (
                  <p className="text-text-secondary text-center py-8">
                    No hay eventos próximos
                  </p>
                ) : (
                  <div className="space-y-4">
                    {eventos.slice(0, 5).map((evento) => (
                      <div key={evento._id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="bg-primary/10 p-2 rounded text-primary">
                          <span className="material-symbols-outlined text-sm">event</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-text-primary text-sm">
                            {evento.nombre}
                          </p>
                          <p className="text-text-secondary text-xs">
                            {evento.buffet?.nombre} • {new Date(evento.fecha).toLocaleDateString('es-AR', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Productos Recientes */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined">restaurant_menu</span>
                  Productos Recientes
                </h3>
              </div>
              <div className="p-6">
                {productos.slice(0, 5).length === 0 ? (
                  <p className="text-text-secondary text-center py-8">
                    No hay productos creados
                  </p>
                ) : (
                  <div className="space-y-4">
                    {productos.slice(0, 5).map((producto) => (
                      <div key={producto._id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="bg-secondary/10 p-2 rounded text-secondary">
                          <span className="material-symbols-outlined text-sm">restaurant_menu</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-text-primary text-sm">
                            {producto.nombre}
                          </p>
                          <p className="text-text-secondary text-xs">
                            ${producto.valor.toFixed(2)} • {producto.buffet?.nombre}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
    </DashboardLayout>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}