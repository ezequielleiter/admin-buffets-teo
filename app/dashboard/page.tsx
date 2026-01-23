'use client';

export default function DashboardPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-buffest-dark text-white flex flex-col shrink-0">
        <div className="p-6 flex flex-col h-full">
          {/* Brand / Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-primary p-2 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white">restaurant</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold leading-tight">Buffests</h1>
              <p className="text-xs text-slate-400">Management System</p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 space-y-2">
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-white font-medium" href="#">
              <span className="material-symbols-outlined">dashboard</span>
              <span>Dashboard</span>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 text-slate-300 transition-colors" href="#">
              <span className="material-symbols-outlined">calendar_today</span>
              <span>Eventos</span>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 text-slate-300 transition-colors" href="#">
              <span className="material-symbols-outlined">inventory_2</span>
              <span>Productos</span>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 text-slate-300 transition-colors" href="#">
              <span className="material-symbols-outlined">sell</span>
              <span>Promos</span>
            </a>
          </nav>

          {/* Footer Sidebar */}
          <div className="pt-6 border-t border-white/10">
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 text-slate-300 transition-colors" href="#">
              <span className="material-symbols-outlined">settings</span>
              <span>Configuración</span>
            </a>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Navigation Bar */}
        <header className="h-20 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-8 py-4 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Dashboard</h2>
            <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-transparent focus-within:border-[#0d6dfd]">
              <span className="material-symbols-outlined text-slate-400 text-xl">search</span>
              <input 
                className="bg-transparent border-none outline-none text-sm w-64 placeholder:text-slate-500" 
                placeholder="Buscar..." 
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button className="relative text-slate-500 hover:text-[#0d6dfd] transition-colors">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#fc8d32] rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-slate-200 dark:border-slate-700">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800 dark:text-white">Admin Buffests</p>
                <p className="text-xs text-slate-500">Super Administrador</p>
              </div>
              <div 
                className="size-10 rounded-full bg-slate-200 dark:bg-slate-700 bg-cover bg-center ring-2 ring-white dark:ring-slate-800" 
                style={{
                  backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCJpLaMyvzn1JdIbXs_63OJWLI3KePwMIiWYlxTesDz9HYAdp_9zzceFMSwISmT56JPI8WEf-jU8j47-mgxY5B8j6FWTAFjLuqboRwipK83kikhltwy_NON-VAKTyQ0MrgQuubollGAD7vir2osoH2m22ydsKz-LJgRRxNQ6ZGSMcpWmShY_hakMwmBwWWnx4hmqEsiKPJBgSCQnfmWHo1Zo5MVATjYlM7i-BWRDb5ZR7KGE5hmxvVuv4T8kMXWdwDQed3qkDViSo6D')"
                }}
              />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Bienvenido de nuevo, Administrador
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Aquí tienes el resumen de lo que está pasando hoy con tus buffets.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Eventos */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 h-full w-1 bg-primary"></div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1 uppercase tracking-wider">
                    Total Eventos Hoy
                  </p>
                  <h3 className="text-3xl font-bold text-slate-900 dark:text-white">12</h3>
                </div>
                <div className="bg-primary/10 p-2 rounded-lg text-primary">
                  <span className="material-symbols-outlined">event_available</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-emerald-600 font-medium text-sm">
                <span className="material-symbols-outlined text-base">trending_up</span>
                <span>+20% vs ayer</span>
              </div>
            </div>

            {/* Promociones Activas */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 h-full w-1 bg-buffest-orange"></div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1 uppercase tracking-wider">
                    Promos Activas
                  </p>
                  <h3 className="text-3xl font-bold text-slate-900 dark:text-white">5</h3>
                </div>
                <div className="bg-buffest-orange/10 p-2 rounded-lg text-buffest-orange">
                  <span className="material-symbols-outlined">campaign</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-buffest-orange font-medium text-sm">
                <span className="material-symbols-outlined text-base">info</span>
                <span>Terminan pronto: 2</span>
              </div>
            </div>

            {/* Inventario */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 h-full w-1 bg-primary"></div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1 uppercase tracking-wider">
                    Stock Productos
                  </p>
                  <h3 className="text-3xl font-bold text-slate-900 dark:text-white">142</h3>
                </div>
                <div className="bg-primary/10 p-2 rounded-lg text-primary">
                  <span className="material-symbols-outlined">inventory</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-emerald-600 font-medium text-sm">
                <span className="material-symbols-outlined text-base">trending_up</span>
                <span>+2% vs semana anterior</span>
              </div>
            </div>
          </div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Upcoming Events Table */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h4 className="text-lg font-bold text-slate-800 dark:text-white">Próximos Eventos</h4>
                <button className="text-primary hover:text-primary/80 font-medium text-sm transition-colors">
                  Ver todos
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                      <th className="px-6 py-4 font-medium">Nombre del Evento</th>
                      <th className="px-6 py-4 font-medium">Hora</th>
                      <th className="px-6 py-4 font-medium text-center">Invitados</th>
                      <th className="px-6 py-4 font-medium">Estado</th>
                      <th className="px-6 py-4 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900 dark:text-white">Boda Familia García</div>
                        <div className="text-xs text-slate-500">Salón Imperial</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm">14:00 PM</td>
                      <td className="px-6 py-4 text-center text-slate-600 dark:text-slate-400 font-medium">120</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          Confirmado
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-slate-400 hover:text-primary">
                          <span className="material-symbols-outlined">more_vert</span>
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900 dark:text-white">Catering Corporativo Tech</div>
                        <div className="text-xs text-slate-500">Oficinas Centrales</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm">12:30 PM</td>
                      <td className="px-6 py-4 text-center text-slate-600 dark:text-slate-400 font-medium">45</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-primary/10 text-primary dark:bg-primary/30 dark:text-primary-400">
                          En Preparación
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-slate-400 hover:text-primary">
                          <span className="material-symbols-outlined">more_vert</span>
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900 dark:text-white">Cumpleaños Sofía</div>
                        <div className="text-xs text-slate-500">Terraza Lounge</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm">19:00 PM</td>
                      <td className="px-6 py-4 text-center text-slate-600 dark:text-slate-400 font-medium">30</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-buffest-orange/10 text-buffest-orange dark:bg-buffest-orange/30 dark:text-buffest-orange-400">
                          Pendiente Pago
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-slate-400 hover:text-primary">
                          <span className="material-symbols-outlined">more_vert</span>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right: Quick Actions / Activity */}
            <div className="flex flex-col gap-6">
              {/* Quick Actions */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Acciones Rápidas</h4>
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-primary/5 hover:bg-primary/10 text-primary transition-colors border border-primary/20">
                    <span className="material-symbols-outlined text-2xl">add_circle</span>
                    <span className="text-xs font-bold uppercase">Nuevo Evento</span>
                  </button>
                  <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-buffest-orange/5 hover:bg-buffest-orange/10 text-buffest-orange transition-colors border border-buffest-orange/20">
                    <span className="material-symbols-outlined text-2xl">star</span>
                    <span className="text-xs font-bold uppercase">Nueva Promo</span>
                  </button>
                  <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-700">
                    <span className="material-symbols-outlined text-2xl">download</span>
                    <span className="text-xs font-bold uppercase">Reporte</span>
                  </button>
                  <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-700">
                    <span className="material-symbols-outlined text-2xl">group</span>
                    <span className="text-xs font-bold uppercase">Personal</span>
                  </button>
                </div>
              </div>

              {/* Mini Map / Location Tracking */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-3">Sedes Activas</h4>
                <div className="aspect-video bg-slate-200 dark:bg-slate-800 rounded-lg relative overflow-hidden">
                  <div 
                    className="absolute inset-0 bg-cover bg-center opacity-70"
                    style={{
                      backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCmL1pBxUmGmhO7wk9TntC7PFmjGQMsIOOk64MM680pKUUmk773id97P-u9h_OXqihNB5fLvzfgiF-d6Y29FNY61GQejeaPOays95yInnnusHueYljBgNwh915uqkN3NJbUMd3JLQ2iICYgfNrH8oQLe8zrStQ2DXCglPQTULPDzonmOgZxs1NdM9d-WCSoRJnukPK0m7NBcdXz5jxfEJ3sffLxvyStAx5skasjNpOw-Q2QEt7oCnIeeZt9yVx5QOUVHoAv5_m1oFNG')"
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-3 left-3 flex items-center gap-2 text-white">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    <span className="text-xs font-medium">3 Sedes en operación hoy</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}