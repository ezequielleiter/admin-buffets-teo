'use client';

import { ReactNode, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function DashboardLayout({ children, title = "Dashboard" }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      logout();
    }
  };
  return (
    <div className="flex h-screen overflow-hidden bg-surface-light text-text-primary">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-surface-dark text-surface-light flex flex-col shrink-0 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 flex flex-col h-full">
          {/* Brand / Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-primary p-2 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white">restaurant</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold leading-tight">Buffests</h1>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 space-y-2">
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-white font-medium" href="/dashboard">
              <span className="material-symbols-outlined">dashboard</span>
              <span>Dashboard</span>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-colors" href="/dashboard/eventos">
              <span className="material-symbols-outlined">calendar_today</span>
              <span>Eventos</span>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-colors" href="/dashboard/productos">
              <span className="material-symbols-outlined">inventory_2</span>
              <span>Productos</span>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-colors" href="/dashboard/promos">
              <span className="material-symbols-outlined">sell</span>
              <span>Promos</span>
            </a>
          </nav>

          {/* Footer Sidebar */}
          <div className="pt-6 border-t border-white/10">
            {/* User Info & Logout */}
            <div className="mt-auto pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-sm">person</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user?.name || 'Usuario'}</p>
                  <p className="text-xs text-gray-300 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-accent-orange/20 text-accent-orange hover:text-accent-orange-intense transition-colors"
              >
                <span className="material-symbols-outlined">logout</span>
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Navigation Bar */}
        <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="material-symbols-outlined text-text-secondary">
                {sidebarOpen ? 'close' : 'menu'}
              </span>
            </button>
            <h2 className="text-lg font-bold text-text-primary">{title}</h2>
            <div className="hidden md:flex items-center bg-gray-100 px-3 py-1.5 rounded-lg border border-transparent focus-within:border-primary">
              <span className="material-symbols-outlined text-text-secondary text-xl">search</span>
              <input 
                className="bg-transparent border-none focus:ring-0 text-sm w-64 placeholder:text-text-secondary focus:outline-none" 
                placeholder="Buscar..." 
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-text-primary">Admin Buffests</p>
                <p className="text-xs text-text-secondary">{user?.role === 'superadmin' ? 'Super Administrador' : 'Administrador'}</p>
              </div>
              <div 
                className="size-10 rounded-full bg-gray-200 bg-cover bg-center ring-2 ring-white" 
                style={{
                  backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCJpLaMyvzn1JdIbXs_63OJWLI3KePwMIiWYlxTesDz9HYAdp_9zzceFMSwISmT56JPI8WEf-jU8j47-mgxY5B8j6FWTAFjLuqboRwipK83kikhltwy_NON-VAKTyQ0MrgQuubollGAD7vir2osoH2m22ydsKz-LJgRRxNQ6ZGSMcpWmShY_hakMwmBwWWnx4hmqEsiKPJBgSCQnfmWHo1Zo5MVATjYlM7i-BWRDb5ZR7KGE5hmxvVuv4T8kMXWdwDQed3qkDViSo6D')"
                }}
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}